import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import { PageTransition, FadeIn, StaggerList, StaggerItem } from '@/components/Motion'
import musicTracks from '@/content/music.json'
import { BASE } from '@/lib/constants'

function getStoredTrackId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('vesper-music-track')
}

export function MusicBrowser() {
  const { locale } = useLocale()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(getStoredTrackId)

  const handlePlay = useCallback((trackId: string, file: string) => {
    const audio = audioRef.current
    if (!audio) return

    if (playingId === trackId) {
      audio.pause()
      setPlayingId(null)
      return
    }

    audio.src = `${BASE}${file}`
    audio.volume = 0.3
    audio.play().catch(() => {})
    setPlayingId(trackId)
  }, [playingId])

  const handleSelect = useCallback((trackId: string | null) => {
    if (trackId === null || selectedId === trackId) {
      // Revert to random
      setSelectedId(null)
      localStorage.removeItem('vesper-music-track')
    } else {
      setSelectedId(trackId)
      localStorage.setItem('vesper-music-track', trackId)
    }
  }, [selectedId])

  const handleEnded = useCallback(() => {
    setPlayingId(null)
  }, [])

  return (
    <PageTransition>
      <main className="px-6 pt-12 pb-8">
        <audio ref={audioRef} onEnded={handleEnded} />

        <header className="mb-2">
          <a
            href={`${BASE}/settings`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {locale === 'fr' ? 'Retour' : 'Back'}
          </a>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]">
            {locale === 'fr' ? 'Musique ambiante' : 'Ambient Music'}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {locale === 'fr'
              ? 'Choisissez la musique de fond pour vos sessions'
              : 'Choose the background music for your sessions'}
          </p>
        </header>

        <FadeIn delay={0.05}>
          <StaggerList className="mt-6 space-y-2" role="list">
            {/* Random option */}
            <StaggerItem role="listitem">
              <button
                onClick={() => handleSelect(null)}
                className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors"
                style={{
                  borderColor: selectedId === null ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: selectedId === null
                    ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))'
                    : 'var(--surface)',
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: selectedId === null
                      ? 'var(--accent)'
                      : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={selectedId === null ? 'var(--bg)' : 'var(--accent)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 3h5v5" />
                    <path d="M4 20 21 3" />
                    <path d="M21 16v5h-5" />
                    <path d="M15 15l6 6" />
                    <path d="M4 4l5 5" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--primary)]">
                    {locale === 'fr' ? 'Aléatoire' : 'Random'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    {locale === 'fr'
                      ? 'Une piste différente à chaque session'
                      : 'A different track each session'}
                  </p>
                </div>
                {selectedId === null && (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            </StaggerItem>

            {musicTracks.map((track) => {
              const isPlaying = playingId === track.id
              const isSelected = selectedId === track.id
              const name = locale === 'fr' ? track.nameFr : track.name

              return (
                <StaggerItem key={track.id} role="listitem">
                  <div
                    className="flex items-center gap-3 rounded-xl border p-4 transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: isSelected ? 'color-mix(in srgb, var(--accent) 6%, var(--surface))' : 'var(--surface)',
                    }}
                  >
                    {/* Play/pause preview */}
                    <motion.button
                      onClick={() => handlePlay(track.id, track.file)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: isPlaying
                          ? 'var(--accent)'
                          : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                      }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={isPlaying ? `Pause ${name}` : `Play ${name}`}
                    >
                      {isPlaying ? (
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill={isPlaying ? 'var(--bg)' : 'var(--accent)'} stroke="none">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </motion.button>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--primary)]">{name}</p>
                      {isSelected && (
                        <p className="mt-0.5 text-[11px] text-[var(--accent)]">
                          {locale === 'fr' ? 'Piste active' : 'Active track'}
                        </p>
                      )}
                    </div>

                    {/* Select / deselect button */}
                    {isSelected ? (
                      <button
                        onClick={() => handleSelect(track.id)}
                        className="shrink-0 p-1 transition-opacity hover:opacity-70"
                        aria-label={locale === 'fr' ? 'Désélectionner' : 'Deselect'}
                      >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelect(track.id)}
                        className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {locale === 'fr' ? 'Utiliser' : 'Use'}
                      </button>
                    )}
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
            {locale === 'fr'
              ? 'La piste choisie sera jouée en boucle pendant vos sessions de méditation et de sommeil.'
              : 'The selected track will loop in the background during your meditation and sleep sessions.'}
          </p>
        </FadeIn>
      </main>
    </PageTransition>
  )
}
