/**
 * Ripple circles that emit from a central point (the play button).
 * Pauses when not playing.
 */
export function RelaxAnimation({ playing }: { playing: boolean }) {
  return (
    <>
      <div
        className="vesper-circle vesper-circle-1"
        style={{ animationPlayState: playing ? 'running' : 'paused' }}
      />
      <div
        className="vesper-circle vesper-circle-2"
        style={{ animationPlayState: playing ? 'running' : 'paused' }}
      />
      <div
        className="vesper-circle vesper-circle-3"
        style={{ animationPlayState: playing ? 'running' : 'paused' }}
      />
    </>
  )
}
