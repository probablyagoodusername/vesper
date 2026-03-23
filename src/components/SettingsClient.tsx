import { useState, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { useTheme } from '@/hooks/useTheme'
import { BASE, VOICES } from '@/lib/constants'

type VoiceOption = 'default' | 'alt'

export function SettingsClient() {
  const { locale, setLocale, t } = useLocale()
  const { setting, setSetting } = useTheme()
  const [voice, setVoice] = useState<VoiceOption>('default')
  const [musicOn, setMusicOn] = useState(true)

  useEffect(function syncFromStorage() {
    const storedVoice = localStorage.getItem('vesper-voice')
    if (storedVoice) setVoice(storedVoice as VoiceOption)
    const storedMusic = localStorage.getItem('vesper-music')
    if (storedMusic) setMusicOn(storedMusic !== 'off')
  }, [])

  const s = t.settings

  const handleVoiceChange = (v: VoiceOption) => {
    setVoice(v)
    localStorage.setItem('vesper-voice', v)
  }

  const handleMusicToggle = () => {
    const next = !musicOn
    setMusicOn(next)
    localStorage.setItem('vesper-music', next ? 'on' : 'off')
  }

  const themeLabels = {
    light: s.light,
    dark: s.dark,
    auto: s.auto,
  } as const

  return (
    <main className="px-6 pb-8" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]">
        {s.title}
      </h1>

      {/* Appearance */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {s.appearance}
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]" role="radiogroup" aria-label={s.appearance}>
          {(['light', 'dark', 'auto'] as const).map((opt, i) => (
            <div key={opt}>
              {i > 0 && <div className="border-t border-[var(--border)]" />}
              <button
                onClick={() => setSetting(opt)}
                role="radio"
                aria-checked={setting === opt}
                className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
                  setting === opt ? 'bg-[var(--surface)]' : ''
                }`}
              >
                <span className="text-sm text-[var(--primary)]">
                  {themeLabels[opt]}
                  {opt === 'auto' && (
                    <span className="ml-2 text-xs text-[var(--muted)]">{s.autoDesc}</span>
                  )}
                </span>
                {setting === opt && <CheckIcon />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Narrator Voice */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {s.narratorVoice}
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]" role="radiogroup" aria-label={s.narratorVoice}>
          <button
            onClick={() => handleVoiceChange('default')}
            role="radio"
            aria-checked={voice === 'default'}
            className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
              voice === 'default' ? 'bg-[var(--surface)]' : ''
            }`}
          >
            <span className="text-sm text-[var(--primary)]">{locale === 'fr' ? VOICES.v1.nameFr : VOICES.v1.nameEn}</span>
            {voice === 'default' && <CheckIcon />}
          </button>
          <div className="border-t border-[var(--border)]" />
          <button
            onClick={() => handleVoiceChange('alt')}
            role="radio"
            aria-checked={voice === 'alt'}
            className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
              voice === 'alt' ? 'bg-[var(--surface)]' : ''
            }`}
          >
            <span className="text-sm text-[var(--primary)]">{locale === 'fr' ? VOICES.v2.nameFr : VOICES.v2.nameEn}</span>
            {voice === 'alt' && <CheckIcon />}
          </button>
        </div>
      </section>

      {/* Background Music */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {s.backgroundMusic}
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <button
            onClick={handleMusicToggle}
            aria-pressed={musicOn}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)]"
          >
            <span className="text-sm text-[var(--primary)]">
              {musicOn ? s.on : s.off}
            </span>
            <div
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ backgroundColor: musicOn ? 'var(--accent)' : 'var(--border)' }}
            >
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-[var(--bg)] transition-transform"
                style={{ transform: musicOn ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </div>
          </button>
          <div className="border-t border-[var(--border)]" />
          <a
            href={`${BASE}/music`}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)]"
          >
            <div>
              <span className="text-sm text-[var(--primary)]">
                {locale === 'fr' ? 'Choisir la piste' : 'Choose Track'}
              </span>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {locale === 'fr' ? 'Parcourir les 5 pistes ambiantes' : 'Browse all 5 ambient tracks'}
              </p>
            </div>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="var(--muted)">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Language */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {s.language}
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]" role="radiogroup" aria-label={s.language}>
          <button
            onClick={() => setLocale('en')}
            role="radio"
            aria-checked={locale === 'en'}
            className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
              locale === 'en' ? 'bg-[var(--surface)]' : ''
            }`}
          >
            <span className="text-sm text-[var(--primary)]">English</span>
            {locale === 'en' && <CheckIcon />}
          </button>
          <div className="border-t border-[var(--border)]" />
          <button
            onClick={() => setLocale('fr')}
            role="radio"
            aria-checked={locale === 'fr'}
            className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)] ${
              locale === 'fr' ? 'bg-[var(--surface)]' : ''
            }`}
          >
            <span className="text-sm text-[var(--primary)]">Fran&ccedil;ais</span>
            {locale === 'fr' && <CheckIcon />}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {s.audioNote}
        </p>
      </section>

      {/* About */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {s.about}
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <a
            href={`${BASE}/about`}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)]"
          >
            <div>
              <span className="text-sm text-[var(--primary)]">{s.ourApproach}</span>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{s.ourApproachDesc}</p>
            </div>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="var(--muted)">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </a>
          <div className="border-t border-[var(--border)]" />
          <a
            href="https://github.com/jmdlab/vesper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface)]"
          >
            <div>
              <span className="text-sm text-[var(--primary)]">{s.openSource}</span>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{s.openSourceDesc}</p>
            </div>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="var(--muted)">
              <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
              <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="var(--accent)">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
    </svg>
  )
}
