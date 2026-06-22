import { useState } from 'react'
import Head from 'next/head'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'

let counter = 0
function genRef() {
  counter++
  return 'JCI-2026-' + String(counter).padStart(4, '0')
}

export default function Inscription() {
  const [form, setForm] = useState({
    prenom: '', nom: '', genre: '', tel: '', adresse_email: '',
    profil: '', niveau: '', etablissement: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)

  const showNiveau = form.profil === 'Élève' || form.profil === 'Étudiant(e)'

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function inscrire() {
    setError('')
    if (!form.prenom || !form.nom || !form.genre || !form.tel || !form.profil) {
      setError('Veuillez remplir tous les champs obligatoires (*).'); return
    }
    setLoading(true)
    const ref = genRef()
    const data = { ref, ...form, statut: 'inscrit', source: 'en ligne' }

    const { error: err } = await supabase.from('participants').insert([data])
    if (err) { setError('Erreur lors de l\'inscription. Veuillez réessayer.'); setLoading(false); return }

    // Envoi email si adresse fournie
    if (form.adresse_email) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, prenom: form.prenom, nom: form.nom, adresse_email: form.adresse_email })
      })
    }

    setConfirmed({ ...data })
    setLoading(false)
  }

  function reset() {
    setForm({ prenom: '', nom: '', genre: '', tel: '', adresse_email: '', profil: '', niveau: '', etablissement: '' })
    setConfirmed(null)
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
              {confirmed.adresse_email && confirmed.adresse_email !== '' && (
                <div className="alert al-info" style={{ textAlign: 'left' }}>
                  <i className="ti ti-mail" />
                  <span>Un e-mail de confirmation a été envoyé à <strong>{confirmed.adresse_email}</strong></span>
                </div>
              )}
              <div className="qr-box">
                <div style={{ fontSize: 11, color: '#744210', fontWeight: 600, marginBottom: 8 }}>Votre code de référence</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', letterSpacing: 2 }}>{confirmed.ref}</div>
                <div style={{ fontSize: 10, color: '#718096', marginTop: 6 }}>Présentez ce code à l&apos;entrée le 27 juin 2026</div>
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 14 }}>
                Journée Culturelle Islamique · <strong>Bingerville · 08h00</strong>
              </div>
              <button className="btn btn-green btn-sm" onClick={reset}>
                <i className="ti ti-user-plus" /> Nouvelle inscription
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
