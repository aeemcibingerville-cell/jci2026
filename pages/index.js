import { useState, useEffect } from 'react'
import Head from 'next/head'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'

export default function Inscription() {
  const [form, setForm] = useState({
    prenom: '', nom: '', genre: '', tel: '', adresse_email: '',
    profil: '', niveau: '', etablissement: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [qrGenerated, setQrGenerated] = useState(false)

  const showNiveau = form.profil === 'Élève' || form.profil === 'Étudiant(e)'

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    if (confirmed && !qrGenerated) {
      generateQR(confirmed.ref, confirmed.prenom, confirmed.nom, confirmed.tel)
    }
  }, [confirmed])

  async function generateQR(ref, prenom, nom, tel) {
    if (typeof window === 'undefined') return
    try {
      const QRCode = (await import('qrcode')).default
      const qrCanvas = document.getElementById('qr-canvas')
      if (!qrCanvas) return
      // Générer le QR code sur un canvas temporaire
      const tempCanvas = document.createElement('canvas')
      await QRCode.toCanvas(tempCanvas, `${ref}|${prenom} ${nom}|${tel}`, {
        width: 180,
        margin: 1,
        color: { dark: '#1B4332', light: '#FFFFFF' }
      })
      // Dessiner le QR code sur le canvas affiché (taille réduite pour l'affichage)
      qrCanvas.width = 180
      qrCanvas.height = 180
      const ctx = qrCanvas.getContext('2d')
      ctx.drawImage(tempCanvas, 0, 0)
      setQrGenerated(true)
    } catch(e) { console.error('QR error:', e) }
  }

  async function downloadQR() {
    if (typeof window === 'undefined') return
    try {
      const QRCode = (await import('qrcode')).default
      // Canvas final 600x820 avec design AEEMCI
      const card = document.createElement('canvas')
      card.width = 600
      card.height = 820
      const ctx = card.getContext('2d')

      // Fond blanc
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 600, 820)

      // Header vert
      ctx.fillStyle = '#1B4332'
      ctx.fillRect(0, 0, 600, 180)

      // Bordure or en bas du header
      ctx.fillStyle = '#B7791F'
      ctx.fillRect(0, 176, 600, 4)

      // Cercle logo AEEMCI
      ctx.save()
      ctx.beginPath()
      ctx.arc(300, 70, 42, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.restore()

      // Texte AEEMCI dans le cercle
      ctx.fillStyle = '#1B4332'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('AEEMCI', 300, 65)
      ctx.fillStyle = '#B7791F'
      ctx.fillRect(268, 70, 64, 1.5)
      ctx.fillStyle = '#A7C4B5'
      ctx.font = '9px sans-serif'
      ctx.fillText('Bingerville', 300, 82)

      // Triangle
      ctx.beginPath()
      ctx.moveTo(293, 88)
      ctx.lineTo(300, 96)
      ctx.lineTo(307, 88)
      ctx.fillStyle = '#F6E05E'
      ctx.fill()

      // Titre événement
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 15px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Journée Culturelle Islamique 2026', 300, 132)

      // 50e anniversaire
      ctx.fillStyle = '#F6E05E'
      ctx.font = '11px sans-serif'
      ctx.fillText('50e anniversaire · AEEMCI · Sous-comité de Bingerville', 300, 155)

      // Thème
      ctx.fillStyle = '#A7C4B5'
      ctx.font = 'italic 10px sans-serif'
      ctx.fillText('« Entre coutumes et croyance, retrouver la pureté du Tawhid »', 300, 172)

      // Nom du participant
      ctx.fillStyle = '#1B4332'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText(`${confirmed.prenom} ${confirmed.nom.toUpperCase()}`, 300, 230)

      // Ligne décorative
      ctx.fillStyle = '#B7791F'
      ctx.fillRect(200, 242, 200, 2)

      // Label QR
      ctx.fillStyle = '#744210'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText('BILLET D'ENTRÉE', 300, 272)

      // Cadre QR code
      const qrSize = 240
      const qrX = (600 - qrSize) / 2
      const qrY = 290

      // Fond du QR avec coins arrondis
      ctx.fillStyle = '#FFFBEB'
      ctx.strokeStyle = '#B7791F'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 12)
      ctx.fill()
      ctx.stroke()

      // QR code
      const qrTemp = document.createElement('canvas')
      await QRCode.toCanvas(qrTemp, `${confirmed.ref}|${confirmed.prenom} ${confirmed.nom}|${confirmed.tel}`, {
        width: qrSize,
        margin: 1,
        color: { dark: '#1B4332', light: '#FFFFFF' }
      })
      ctx.drawImage(qrTemp, qrX, qrY)

      // Référence
      ctx.fillStyle = '#1B4332'
      ctx.font = 'bold 20px monospace'
      ctx.fillText(confirmed.ref, 300, qrY + qrSize + 55)

      // Infos événement
      ctx.fillStyle = '#4A5568'
      ctx.font = '13px sans-serif'
      ctx.fillText('📅 Samedi 27 juin 2026  ·  ⏰ 08h00 – 16h30  ·  📍 Bingerville', 300, qrY + qrSize + 82)

      // Ligne décorative bas
      ctx.fillStyle = '#E2E8F0'
      ctx.fillRect(40, qrY + qrSize + 100, 520, 1)

      // Footer
      ctx.fillStyle = '#1B4332'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('#JCI2026  ·  #AEEMCIBingerville', 300, qrY + qrSize + 126)
      ctx.fillStyle = '#718096'
      ctx.font = '10px sans-serif'
      ctx.fillText('AEEMCI, pour une identité islamique !', 300, qrY + qrSize + 146)

      // Bande colorée en bas
      ctx.fillStyle = '#1B4332'
      ctx.fillRect(0, 790, 600, 30)
      ctx.fillStyle = '#B7791F'
      ctx.fillRect(0, 786, 600, 4)

      const link = document.createElement('a')
      link.download = `Billet-JCI2026-${confirmed.ref}.png`
      link.href = card.toDataURL('image/png')
      link.click()
    } catch(e) { console.error('Download error:', e) }
  }

  async function inscrire() {
    setError('')
    if (!form.prenom || !form.nom || !form.genre || !form.tel || !form.profil) {
      setError('Veuillez remplir tous les champs obligatoires (*).'); return
    }
    setLoading(true)
    // Compter les participants existants pour générer la référence séquentielle
    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    const num = ((count || 0) + 1).toString().padStart(4, '0')
    const ref = 'JCI-2026-' + num
    const data = { ref, ...form, statut: 'inscrit', source: 'en ligne' }

    const { error: err } = await supabase.from('participants').insert([data])
    if (err) { setError('Erreur : ' + (err.message || err.details || JSON.stringify(err))); setLoading(false); return }


    setConfirmed({ ...data })
    setLoading(false)
  }

  function reset() {
    setForm({ prenom: '', nom: '', genre: '', tel: '', adresse_email: '', profil: '', niveau: '', etablissement: '' })
    setConfirmed(null)
    setQrGenerated(false)
  }

  return (
    <>
      <Head>
        <title>Inscription JCI 2026 — AEEMCI Bingerville</title>
        <meta name="description" content="Inscrivez-vous à la Journée Culturelle Islamique 2026" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </Head>

      <div className="pub-hdr">
        <div className="pub-hdr-inner">
          <div className="hdr-logo"><Logo size={34} /></div>
          <div>
            <div className="brand-name">Inscription JCI 2026</div>
            <div className="brand-sub">AEEMCI · Sous-comité de Bingerville · 50e anniversaire</div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="banner">
          <div className="banner-eye">AEEMCI · Journée Culturelle Islamique · 50e anniversaire</div>
          <div className="banner-title">Journée Culturelle Islamique 2026</div>
          <div className="banner-theme">« Entre coutumes et croyance, retrouver la pureté du Tawhid »</div>
          <div className="banner-pills">
            <span className="pill"><i className="ti ti-calendar" /> Samedi 27 juin 2026</span>
            <span className="pill"><i className="ti ti-clock" /> 08h00 – 16h30</span>
            <span className="pill"><i className="ti ti-map-pin" /> Bingerville</span>
            <span className="pill"><i className="ti ti-ticket" /> Entrée libre sur inscription</span>
          </div>
        </div>

        {error && <div className="alert al-err"><i className="ti ti-alert-circle" />{error}</div>}

        {!confirmed ? (
          <div className="card">
            <div className="card-hd"><i className="ti ti-user-circle" />Informations personnelles</div>
            <div className="grid2">
              <div className="fg"><label>Prénom *</label><input name="prenom" value={form.prenom} onChange={handleChange} placeholder="ex. Fatima" /></div>
              <div className="fg"><label>Nom *</label><input name="nom" value={form.nom} onChange={handleChange} placeholder="ex. KONÉ" /></div>
              <div className="fg"><label>Genre *</label>
                <select name="genre" value={form.genre} onChange={handleChange}>
                  <option value="">— Choisir —</option>
                  <option>Masculin</option><option>Féminin</option>
                </select>
              </div>
              <div className="fg"><label>Téléphone *</label><input name="tel" value={form.tel} onChange={handleChange} placeholder="07 XX XX XX XX" /></div>
              <div className="fg span2"><label>Email</label><input name="adresse_email" type="email" value={form.adresse_email} onChange={handleChange} placeholder="votre@email.com" /></div>
            </div>
            <hr className="dv" />
            <div className="card-hd"><i className="ti ti-school" />Profil scolaire / académique</div>
            <div className="grid2">
              <div className="fg"><label>Profil *</label>
                <select name="profil" value={form.profil} onChange={handleChange}>
                  <option value="">— Choisir —</option>
                  <option>Élève</option><option>Étudiant(e)</option>
                  <option>Enseignant(e)</option><option>Membre de la communauté</option><option>Autre</option>
                </select>
              </div>
              {showNiveau && (
                <div className="fg"><label>Classe / Niveau *</label>
                  <select name="niveau" value={form.niveau} onChange={handleChange}>
                    <option value="">— Choisir —</option>
                    <optgroup label="Secondaire">
                      <option>6e</option><option>5e</option><option>4e</option><option>3e</option>
                      <option>2nde</option><option>1ère</option><option>Terminale</option>
                    </optgroup>
                    <optgroup label="Supérieur">
                      <option>Licence 1</option><option>Licence 2</option><option>Licence 3</option>
                      <option>Master 1</option><option>Master 2</option><option>Doctorat</option><option>BTS / DUT</option>
                    </optgroup>
                    <optgroup label="Autre"><option>Non applicable</option></optgroup>
                  </select>
                </div>
              )}
              <div className="fg span2"><label>Établissement / Institution</label>
                <input name="etablissement" value={form.etablissement} onChange={handleChange} placeholder="ex. Lycée de Bingerville, Université FHB…" />
              </div>
            </div>
            <hr className="dv" />
            <button className="btn btn-green btn-full" onClick={inscrire} disabled={loading}>
              {loading ? <><i className="ti ti-loader" /> Inscription en cours…</> : <><i className="ti ti-send" /> S&apos;inscrire à la JCI 2026</>}
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="conf">
              <div className="chk"><i className="ti ti-check" /></div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1B4332', marginBottom: 4 }}>
                Bienvenue, {confirmed.prenom} {confirmed.nom.toUpperCase()} !
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>
                Votre inscription à la JCI 2026 est confirmée.
              </div>

              <div className="qr-box" style={{ padding: '20px 20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#744210', fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>VOTRE QR CODE D&apos;ENTRÉE</div>
                <div style={{ background: '#fff', borderRadius: 10, padding: 12, display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                  <canvas id="qr-canvas" style={{ display: 'block' }}></canvas>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1B4332', marginTop: 12, letterSpacing: 2, fontFamily: 'monospace' }}>{confirmed.ref}</div>
                <div style={{ fontSize: 10, color: '#718096', marginTop: 4 }}>Présentez ce QR Code à l&apos;entrée le 27 juin 2026</div>
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 14 }}>
                Journée Culturelle Islamique · <strong>Bingerville · 08h00</strong>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-gold btn-sm" onClick={downloadQR}>
                  <i className="ti ti-download" /> Télécharger le QR Code
                </button>
                <button className="btn btn-green btn-sm" onClick={reset}>
                  <i className="ti ti-user-plus" /> Nouvelle inscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
