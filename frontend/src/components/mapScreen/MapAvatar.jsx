import MascotEvolution from '../MascotEvolution'

/**
 * Avatar sits only on the current node — centered above the node center
 * with a subtle idle bounce (see MapScreen.css).
 */
export function MapAvatar({ mascotEvolutionLevel = 1 }) {
  return (
    <div className="map-avatar" aria-hidden="true">
      <div className="map-avatar-mascot">
        <MascotEvolution level={mascotEvolutionLevel} size={52} />
      </div>
      <div className="map-avatar-pin" />
    </div>
  )
}
