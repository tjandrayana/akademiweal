/** Floating stars & coins behind mascot — from design assets reference */
export function ProfileMascotDecor() {
  return (
    <svg className="profile-iq-decor" viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="40" cy="40" r="1.5" fill="#F5C518" opacity="0.45" />
      <circle cx="100" cy="100" r="1" fill="#F5C518" opacity="0.35" />
      <circle cx="360" cy="50" r="2" fill="#00C896" opacity="0.45" />
      <circle cx="330" cy="180" r="1.5" fill="#F5C518" opacity="0.35" />
      <circle cx="350" cy="320" r="1" fill="#6BB4FF" opacity="0.4" />
      <circle cx="30" cy="360" r="1.5" fill="#00C896" opacity="0.35" />
      <circle cx="80" cy="400" r="1" fill="#F5C518" opacity="0.28" />
      <circle cx="200" cy="210" r="200" fill="none" stroke="rgba(245,197,24,0.05)" strokeWidth="1" />
      <circle cx="200" cy="210" r="140" fill="none" stroke="rgba(245,197,24,0.04)" strokeWidth="1" />
      <g>
        <circle cx="60" cy="70" r="12" fill="rgba(245,197,24,0.1)" stroke="rgba(245,197,24,0.22)" strokeWidth="1" />
        <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#F5C518" opacity="0.45" fontWeight="900">
          $
        </text>
      </g>
      <g>
        <circle cx="340" cy="280" r="14" fill="rgba(245,197,24,0.08)" stroke="rgba(245,197,24,0.18)" strokeWidth="1" />
        <text x="340" y="286" textAnchor="middle" fontSize="11" fill="#F5C518" opacity="0.4" fontWeight="900">
          $
        </text>
      </g>
      <polyline
        points="24,380 54,360 84,370 124,340"
        fill="none"
        stroke="rgba(0,200,150,0.18)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
