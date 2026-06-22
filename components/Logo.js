export default function Logo({ size = 40 }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" fill="#1B4332" stroke="#B7791F" strokeWidth="1.5"/>
      <text x="20" y="16" textAnchor="middle" fill="#F6E05E" fontSize="6" fontWeight="700" fontFamily="sans-serif">AEEMCI</text>
      <line x1="10" y1="19" x2="30" y2="19" stroke="#B7791F" strokeWidth="0.8"/>
      <text x="20" y="25" textAnchor="middle" fill="#A7C4B5" fontSize="4.5" fontFamily="sans-serif">Bingerville</text>
      <path d="M17 28 L20 33 L23 28" fill="#F6E05E"/>
    </svg>
  )
}
