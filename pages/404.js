import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page introuvable — JCI 2026</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F7F5F0', textAlign: 'center' }}>
        <div style={{ fontSize: 48, color: '#CBD5E0', marginBottom: 12 }}>
          <i className="ti ti-map-off" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1B4332', marginBottom: 8 }}>Page introuvable</div>
        <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Cette page n&apos;existe pas.</div>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1B4332', color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          <i className="ti ti-home" /> Retour à l&apos;accueil
        </Link>
      </div>
    </>
  )
}
