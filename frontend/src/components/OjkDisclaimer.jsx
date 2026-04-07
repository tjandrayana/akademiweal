/**
 * Standardised OJK / simulation disclaimer.
 * compact=false (default) — full banner with icon, used in page body.
 * compact=true            — inline one-liner, used inside forms.
 */
export function OjkDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <p style={{ fontSize: 10, color: '#B0A898', textAlign: 'center', lineHeight: 1.5 }}>
        Simulasi edukasi · Uang virtual · Bukan rekomendasi investasi
      </p>
    )
  }

  return (
    <div style={{
      background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
      padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 12, flexShrink: 0 }}>⚠️</span>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', lineHeight: 1.5, margin: 0 }}>
        <strong>SIMULASI EDUKASI</strong> — Data historis · Uang virtual · Bukan rekomendasi
        investasi · AkademiWeal tidak berlisensi WPPE.
      </p>
    </div>
  )
}
