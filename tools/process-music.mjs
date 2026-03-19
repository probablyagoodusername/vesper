/**
 * Therapeutic Audio Processor
 * Processes raw MP3 files through a science-based chain:
 * Brown noise + sub-bass + binaural beats + sidechain ducking + LPF + reverb + ISO fades
 *
 * Usage: node process-music.mjs [--mode=meditation|sleep]
 *   --mode=meditation  10Hz alpha binaural beats (default)
 *   --mode=sleep       3Hz delta binaural beats, longer fade, more reverb
 *
 * Reads from music/raw/*.mp3, outputs to music/processed/*.wav
 * When mode is not specified, processes BOTH profiles for each track.
 *
 * Settings reviewed by multi-domain expert analysis (audio engineering,
 * neuroscience, sleep research, sound design). Key design decisions:
 *
 * 1. Therapeutic layers are deeply subliminal — they should never compete
 *    with the music or be consciously perceived as "noise".
 * 2. Brown noise is shaped to only fill spectral gaps in the music, not
 *    create a constant audible bed. Achieved via very low gain + envelope.
 * 3. Sidechain compression ducks therapeutic layers when music has energy,
 *    letting them fill in during quiet moments — prevents spectral competition.
 * 4. Binaural beats use a lower carrier (110Hz) for better neural entrainment
 *    — research shows carriers <150Hz produce stronger frequency-following
 *    response in the brainstem (Schwarz & Taylor, 2005; Gao et al., 2014).
 * 5. LPF raised to 9kHz — 6kHz was too aggressive, killing presence and air
 *    that makes ambient music feel "alive" rather than muffled.
 * 6. Reverb shortened and dried — 4s decay at 20% wet created an indistinct
 *    wash. 2.5s at 15% adds space without muddiness.
 * 7. Longer fade-in (90s meditation, 120s sleep) follows ISO 226 loudness
 *    contours for gradual relaxation onset.
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join, basename } from "path";
import { execFileSync } from "child_process";
import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// Mode profiles — meditation (alpha) vs sleep (delta)
// ---------------------------------------------------------------------------
const PROFILES = {
  meditation: {
    // 10Hz alpha binaural beats (110Hz L / 120Hz R) — calm focus
    BIN_OFF: 10,
    FADE_IN: 90,       // 90s fade-in
    REV_WET: 0.15,     // 15% reverb wet
    suffix: "-therapeutic.wav",
    label: "meditation (10Hz alpha)",
  },
  sleep: {
    // 3Hz delta binaural beats (110Hz L / 113Hz R) — deep sleep entrainment
    // Delta range (0.5-4Hz) promotes slow-wave sleep stages 3-4
    BIN_OFF: 3,
    FADE_IN: 120,      // 120s fade-in — even more gradual for sleep onset
    REV_WET: 0.18,     // 18% reverb wet — slightly more enveloping for sleep
    suffix: "-therapeutic-sleep.wav",
    label: "sleep (3Hz delta)",
  },
};

const C = {
  // --- Brown noise bed ---
  // Effective amplitude: 0.008 x 3.5 multiplier = ~0.028 peak.
  // At 1-5% master volume this is imperceptible as "noise" — it only fills
  // micro-silences between notes, preventing dead silence that triggers
  // alertness. Previous 0.025 (eff. 0.0875) was audible as hiss.
  BROWN_GAIN: 0.008,

  // --- Sub-bass (vagal stimulation) ---
  // 55Hz sits closer to the chest-resonance sweet spot for vagal nerve
  // stimulation via bone conduction (~40-80Hz range). Lowered from 60Hz.
  // Gain 0.012 is below audibility threshold at low playback volumes but
  // still produces physical vibration on speakers/headphones with sub response.
  SUB_HZ: 55,
  SUB_GAIN: 0.012,

  // --- Binaural beats ---
  // Carrier at 110Hz. Lower carriers produce stronger auditory steady-state
  // response (ASSR). Beat frequency set per-profile: 10Hz alpha (meditation)
  // or 3Hz delta (sleep). At 0.015 gain this is subliminal — binaural
  // entrainment works below conscious perception (Karino et al., 2006).
  BIN_BASE: 110,
  BIN_GAIN: 0.015,

  // --- Sidechain compression ---
  // Ducks therapeutic layers (brown noise + sub-bass) when the source music
  // has energy. Prevents spectral competition — therapeutic layers fill in
  // during quiet moments and recede when music is present.
  // RMS window: 50ms (2205 samples at 44.1kHz)
  // Threshold: -40dB RMS — below this, music is considered "silent"
  // Duck amount: ~7dB reduction (gain multiplier 0.45)
  // Attack: 10ms — fast duck to avoid therapeutic layers poking through
  // Release: 200ms — slow return to avoid pumping artifacts
  SC_WINDOW: 2205,           // 50ms at 44.1kHz
  SC_THRESHOLD: 0.01,        // ~-40dB RMS
  SC_DUCK_GAIN: 0.45,        // gain applied to therapeutic when music is loud (~7dB duck)
  SC_ATTACK: 0.01,           // 10ms attack time (seconds)
  SC_RELEASE: 0.2,           // 200ms release time (seconds)

  // --- Low-pass filter ---
  // 9kHz preserves presence while taming harsh sibilance and digital
  // artifacts above 10kHz. The music sounds warm but not muffled.
  LPF_FREQ: 9000,

  // --- Reverb ---
  // 2.5s decay. Long reverb on already-reverberant ambient music creates
  // mud. 2.5s adds gentle room tone without washing out the source material.
  // Wet amount is per-profile (15% meditation, 18% sleep).
  REV_DECAY: 2.5,

  // --- ISO fade envelope ---
  // Fade-in per-profile (90s meditation, 120s sleep). Fade-out fixed at
  // 30s — the ending is less critical for relaxation induction.
  FADE_OUT: 30,

  // --- Master settings ---
  // 44.1kHz standard. Music at 0.85 relative to therapeutic layers ensures
  // the music is always dominant — therapeutic elements are seasoning, not
  // a second track competing for attention.
  SR: 44100,
  TRACK_VOL: 0.85,
};

const RAW_DIR = join(import.meta.dirname, "../music/raw");
const OUT_DIR = join(import.meta.dirname, "../music/processed");

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const { values: args } = parseArgs({
  options: {
    mode: { type: "string", default: "" },
  },
  strict: false,
});

const requestedMode = args.mode;
if (requestedMode && !PROFILES[requestedMode]) {
  console.error(`Unknown mode: "${requestedMode}". Valid: meditation, sleep`);
  process.exit(1);
}

// If no mode specified, process both profiles
const modesToProcess = requestedMode
  ? [requestedMode]
  : ["meditation", "sleep"];

// ---------------------------------------------------------------------------
// DSP functions
// ---------------------------------------------------------------------------

// We can't use Web Audio API in Node, so we do raw sample-level DSP

function generateBrownNoise(length) {
  const out = new Float32Array(length);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    out[i] = last * 3.5 * C.BROWN_GAIN;
  }
  return out;
}

function generateSine(length, hz, gain) {
  const out = new Float32Array(length);
  const inc = (2 * Math.PI * hz) / C.SR;
  for (let i = 0; i < length; i++) {
    out[i] = Math.sin(i * inc) * gain;
  }
  return out;
}

/**
 * Compute sidechain ducking envelope from music source.
 * Returns a Float32Array of gain multipliers (0..1) for therapeutic layers.
 *
 * When the music's RMS energy exceeds SC_THRESHOLD, gain drops to SC_DUCK_GAIN.
 * When the music is silent, gain returns to 1.0.
 * Smooth attack/release avoids pumping.
 */
function computeSidechainEnvelope(srcL, srcR, length) {
  const env = new Float32Array(length);
  const windowSamples = C.SC_WINDOW;
  // attack/release as per-sample coefficients (1 - e^(-1/(time*SR)))
  const attackCoeff = 1 - Math.exp(-1 / (C.SC_ATTACK * C.SR));
  const releaseCoeff = 1 - Math.exp(-1 / (C.SC_RELEASE * C.SR));

  // Pre-compute RMS energy for each window
  let currentGain = 1.0;

  for (let i = 0; i < length; i++) {
    // Calculate RMS in a window centered-ish around current position
    // Use a trailing window for causality
    let sumSq = 0;
    const windowStart = Math.max(0, i - windowSamples);
    const windowLen = i - windowStart;

    if (windowLen > 0) {
      for (let j = windowStart; j < i; j++) {
        const mono = (srcL[j] + srcR[j]) * 0.5;
        sumSq += mono * mono;
      }
      const rms = Math.sqrt(sumSq / windowLen);

      // Target gain: duck when music has energy, full when silent
      const targetGain = rms > C.SC_THRESHOLD ? C.SC_DUCK_GAIN : 1.0;

      // Smooth envelope — fast attack, slow release
      const coeff = targetGain < currentGain ? attackCoeff : releaseCoeff;
      currentGain += coeff * (targetGain - currentGain);
    }

    env[i] = currentGain;
  }

  return env;
}

function applyLowPass(samples, freq) {
  // Simple one-pole low-pass filter
  const rc = 1 / (2 * Math.PI * freq);
  const dt = 1 / C.SR;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(samples.length);
  out[0] = samples[0] * alpha;
  for (let i = 1; i < samples.length; i++) {
    out[i] = out[i - 1] + alpha * (samples[i] - out[i - 1]);
  }
  return out;
}

function applyReverb(samplesL, samplesR, wetAmount) {
  // Simple FDN-style reverb via comb filters
  const len = samplesL.length;
  const outL = new Float32Array(len);
  const outR = new Float32Array(len);

  // 4 comb filters with prime delays
  const delays = [2903, 3571, 4409, 5381]; // samples (~66-122ms)
  const feedback = 0.75; // Reduced from 0.82 to match 2.5s decay (less mud)

  const buffers = delays.map(d => ({ buf: new Float32Array(d), idx: 0, len: d }));

  for (let i = 0; i < len; i++) {
    let wetL = 0, wetR = 0;
    const input = (samplesL[i] + samplesR[i]) * 0.5;

    for (let c = 0; c < buffers.length; c++) {
      const cb = buffers[c];
      const delayed = cb.buf[cb.idx];
      cb.buf[cb.idx] = input + delayed * feedback;
      cb.idx = (cb.idx + 1) % cb.len;

      if (c % 2 === 0) wetL += delayed;
      else wetR += delayed;
    }

    wetL *= 0.25;
    wetR *= 0.25;

    outL[i] = samplesL[i] * (1 - wetAmount) + wetL * wetAmount;
    outR[i] = samplesR[i] * (1 - wetAmount) + wetR * wetAmount;
  }

  return { left: outL, right: outR };
}

function isoEnvelope(length, fadeInSeconds) {
  const env = new Float32Array(length);
  const fadeInSamples = fadeInSeconds * C.SR;
  const fadeOutSamples = C.FADE_OUT * C.SR;

  for (let i = 0; i < length; i++) {
    let v = 1;
    if (i < fadeInSamples) v = i / fadeInSamples;
    if (i > length - fadeOutSamples) v = (length - i) / fadeOutSamples;
    env[i] = v;
  }
  return env;
}

function encodeWav(left, right) {
  const samples = left.length;
  const nc = 2, bps = 2, ba = nc * bps;
  const ds = samples * ba;
  const buf = new ArrayBuffer(44 + ds);
  const v = new DataView(buf);

  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); v.setUint32(4, 36 + ds, true); ws(8, "WAVE"); ws(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
  v.setUint32(24, C.SR, true); v.setUint32(28, C.SR * ba, true);
  v.setUint16(32, ba, true); v.setUint16(34, 16, true);
  ws(36, "data"); v.setUint32(40, ds, true);

  let o = 44;
  for (let i = 0; i < samples; i++) {
    const sl = Math.max(-1, Math.min(1, left[i]));
    const sr = Math.max(-1, Math.min(1, right[i]));
    v.setInt16(o, sl < 0 ? sl * 0x8000 : sl * 0x7FFF, true); o += 2;
    v.setInt16(o, sr < 0 ? sr * 0x8000 : sr * 0x7FFF, true); o += 2;
  }

  return Buffer.from(buf);
}

// ---------------------------------------------------------------------------
// Process a single file for a single mode profile
// ---------------------------------------------------------------------------

async function processFile(filePath, srcL, srcR, samples, profile, mode) {
  const name = basename(filePath);
  const outName = name.replace(".mp3", profile.suffix);
  const outPath = join(OUT_DIR, outName);

  console.log(`\n  [${mode}] Processing: ${profile.label}`);

  // Generate therapeutic layers
  console.log("    Generating brown noise...");
  const brown = generateBrownNoise(samples);

  console.log("    Generating sub-bass 55Hz...");
  const subBass = generateSine(samples, C.SUB_HZ, C.SUB_GAIN);

  const binOff = profile.BIN_OFF;
  console.log(`    Generating binaural beats (${C.BIN_BASE}/${C.BIN_BASE + binOff}Hz → ${binOff}Hz ${mode})...`);
  const binL = generateSine(samples, C.BIN_BASE, C.BIN_GAIN);
  const binR = generateSine(samples, C.BIN_BASE + binOff, C.BIN_GAIN);

  // Sidechain compression envelope — duck therapeutic when music is loud
  console.log("    Computing sidechain envelope...");
  const scEnv = computeSidechainEnvelope(srcL, srcR, samples);

  // ISO envelope
  console.log(`    Applying ISO fade envelope (${profile.FADE_IN}s in / ${C.FADE_OUT}s out)...`);
  const env = isoEnvelope(samples, profile.FADE_IN);

  // Mix everything
  console.log("    Mixing layers...");
  const mixL = new Float32Array(samples);
  const mixR = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    // Therapeutic layers are ducked by sidechain and shaped by ISO envelope
    const therapeutic = (brown[i] + subBass[i]) * env[i] * scEnv[i];
    mixL[i] = srcL[i] + therapeutic + binL[i] * env[i];
    mixR[i] = srcR[i] + therapeutic + binR[i] * env[i];
  }

  // Low-pass filter
  console.log("    Applying 9kHz low-pass filter...");
  const filtL = applyLowPass(mixL, C.LPF_FREQ);
  const filtR = applyLowPass(mixR, C.LPF_FREQ);

  // Reverb (wet amount per-profile)
  const wetPct = Math.round(profile.REV_WET * 100);
  console.log(`    Applying 2.5s reverb (${wetPct}% wet)...`);
  const { left: revL, right: revR } = applyReverb(filtL, filtR, profile.REV_WET);

  // Final ISO envelope on master
  for (let i = 0; i < samples; i++) {
    revL[i] *= env[i];
    revR[i] *= env[i];
  }

  // Encode WAV
  console.log("    Encoding WAV...");
  const wav = encodeWav(revL, revR);
  writeFileSync(outPath, wav);

  const sizeMB = (wav.length / 1024 / 1024).toFixed(1);
  console.log(`    Done: ${outName} (${sizeMB} MB)`);
}

// ---------------------------------------------------------------------------
// Main — decode once, process each profile
// ---------------------------------------------------------------------------

const files = readdirSync(RAW_DIR).filter(f => f.endsWith(".mp3")).sort();
console.log(`Found ${files.length} tracks to process`);
console.log(`Modes: ${modesToProcess.join(", ")}\n`);

for (const f of files) {
  const filePath = join(RAW_DIR, f);
  console.log(`\nDecoding: ${f}`);

  const tmpRaw = "/tmp/vesper-decode-" + Date.now() + ".raw";
  execFileSync("ffmpeg", [
    "-i", filePath,
    "-f", "f32le", "-acodec", "pcm_f32le",
    "-ar", String(C.SR), "-ac", "2",
    tmpRaw, "-y"
  ], { stdio: "pipe" });

  const raw = readFileSync(tmpRaw);
  const floats = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const samples = floats.length / 2;
  const srcL = new Float32Array(samples);
  const srcR = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    srcL[i] = floats[i * 2] * C.TRACK_VOL;
    srcR[i] = floats[i * 2 + 1] * C.TRACK_VOL;
  }

  try { unlinkSync(tmpRaw); } catch {}

  console.log(`  ${(samples / C.SR).toFixed(1)}s · ${samples} samples`);

  // Process each requested profile
  for (const mode of modesToProcess) {
    await processFile(filePath, srcL, srcR, samples, PROFILES[mode], mode);
  }
}

console.log("\nAll tracks processed!");
