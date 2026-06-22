import { useState, useEffect } from 'react'
import Head from 'next/head'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'

export default function Espace() {
  const [role, setRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [login, setLogin] = useState('')
  const [pass, setPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [userName, setUserName] = useState('')
  const [page, setPage] = useState('jday')

  // J-Day state
  const [stats, setStats] = useState({ total: 0, presents: 0, absents: 0 })
  const [scanQ, setScanQ] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [jdayAlert, setJdayAlert] = useState(null)
  const [spForm, setSpForm] = useState({ prenom: '', nom: '', genre: '', tel: '', adresse_email: '', profil: '', niveau: '', etablissement: '' })
  const [spLoading, setSpLoading] = useState(false)

  // Liste state
  const [participants, setParticipants] = useState([])
  const [listeQ, setListeQ] = useState('')
  const [listeLoading, setListeLoading] = useState(false)

  // Comptes state
  const [comptes, setComptes] = useState([])
  const [ncForm, setNcForm] = useState({ nom: '', login: '', mot_de_passe: '', role: '' })
  const [comptesAlert, setComptesAlert] = useState(null)

  useEffect(() => {
    if (page === 'jday') loadStats()
    if (page === 'liste') loadParticipants()
    if (page === 'comptes') loadComptes()
  }, [page])

  async function doLogin() {
    setLoginError('')
    if (!selectedRole) { setLoginError('Choisissez un rôle.'); return }
    const { data, error } = await supabase.from('comptes')
      .select('*').eq('login', login).eq('mot_de_passe', pass).eq('role', selectedRole).single()
    if (error || !data) { setLoginError('Identifiant ou mot de passe incorrect.'); return }
    setRole(data.role)
    setUserName(data.nom)
    setPage(data.role === 'comite' ? 'jday' : 'jday')
  }

  function logout() { setRole(null); setLogin(''); setPass(''); setSelectedRole('') }

  // Stats
  async function loadStats() {
    const { count: total } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    const { count: presents } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('statut', 'présent')
    setStats({ total: total || 0, presents: presents || 0, absents: (total || 0) - (presents || 0) })
  }

  // Scanner
  async function scanner() {
    if (!scanQ.trim()) return
    const q = scanQ.trim().toLowerCase()
    setScanQ('')

    const { data } = await supabase.from('participants').select('*')
    if (!data) return
    const p = data.find(x =>
      x.ref.toLowerCase() === q ||
      (x.prenom + ' ' + x.nom).toLowerCase().includes(q) ||
      x.nom.toLowerCase().includes(q)
    )
    if (!p) { setScanResult({ type: 'err', title: 'Participant introuvable', body: `Aucun inscrit ne correspond à "${scanQ || q}".\nVérifiez le code ou inscrivez-le sur place.` }); return }
    if (p.statut === 'présent') { setScanResult({ type: 'warn', title: 'Déjà enregistré', body: `${p.prenom} ${p.nom.toUpperCase()} (${p.ref})\nest déjà marqué(e) présent(e).` }); return }
    await supabase.from('participants').update({ statut: 'présent' }).eq('id', p.id)
    setScanResult({ type: 'ok', title: 'Accès autorisé ✅', body: `Bienvenue, ${p.prenom} ${p.nom.toUpperCase()} !\nProfil : ${p.profil}${p.niveau ? ' · ' + p.niveau : ''}\nRéf. : ${p.ref}` })
    loadStats()
  }

  // Inscription sur place
  async function inscSurPlace() {
    setJdayAlert(null)
    if (!spForm.prenom || !spForm.nom || !spForm.genre || !spForm.tel) {
      setJdayAlert({ type: 'err', msg: 'Prénom, Nom, Genre et Téléphone sont requis.' }); return
    }
    setSpLoading(true)
    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    const ref = 'JCI-2026-' + String((count || 0) + 1).padStart(4, '0')
    const { error } = await supabase.from('participants').insert([{ ref, ...spForm, statut: 'présent', source: 'sur place' }])
    if (error) { setJdayAlert({ type: 'err', msg: 'Erreur lors de l\'inscription.' }); setSpLoading(false); return }
    setJdayAlert({ type: 'ok', msg: `${spForm.prenom} ${spForm.nom.toUpperCase()} inscrit(e) et marqué(e) présent(e) — ${ref}` })
    setSpForm({ prenom: '', nom: '', genre: '', tel: '', adresse_email: '', profil: '', niveau: '', etablissement: '' })
    loadStats()
    setSpLoading(false)
  }

  // Liste
  async function loadParticipants() {
    setListeLoading(true)
    const { data } = await supabase.from('participants').select('*').order('created_at', { ascending: false })
    setParticipants(data || [])
    setListeLoading(false)
  }

  async function marquerPresent(id) {
    await supabase.from('participants').update({ statut: 'présent' }).eq('id', id)
    loadParticipants(); loadStats()
  }

  async function supprimerParticipant(id) {
    if (!confirm('Supprimer ce participant ?')) return
    await supabase.from('participants').delete().eq('id', id)
    loadParticipants(); loadStats()
  }

  function exportCSV() {
    const h = ['Référence', 'Prénom', 'Nom', 'Genre', 'Profil', 'Niveau', 'Téléphone', 'Email', 'Établissement', 'Statut', 'Source']
    const rows = participants.map(p => [p.ref, p.prenom, p.nom, p.genre, p.profil, p.niveau, p.tel, p.adresse_email, p.etablissement, p.statut, p.source])
    const csv = [h, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.download = 'inscrits_JCI2026.csv'
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
    a.click()
  }

  const filtered = participants.filter(p => {
    if (!listeQ) return true
    const q = listeQ.toLowerCase()
    return p.nom?.toLowerCase().includes(q) || p.prenom?.toLowerCase().includes(q) || p.tel?.includes(q) || p.ref?.toLowerCase().includes(q)
  })

  // Comptes
  async function loadComptes() {
    const { data } = await supabase.from('comptes').select('id, nom, login, role').order('created_at')
    setComptes(data || [])
  }

  async function addCompte() {
    setComptesAlert(null)
    if (!ncForm.nom || !ncForm.role || !ncForm.login || !ncForm.mot_de_passe) {
      setComptesAlert({ type: 'err', msg: 'Tous les champs sont requis.' }); return
    }
    const { error } = await supabase.from('comptes').insert([ncForm])
    if (error) { setComptesAlert({ type: 'err', msg: 'Cet identifiant existe déjà.' }); return }
    setNcForm({ nom: '', login: '', mot_de_passe: '', role: '' })
    setComptesAlert({ type: 'ok', msg: `Compte "@${ncForm.login}" créé avec succès.` })
    loadComptes()
  }

  async function supprimerCompte(id, login) {
    if (login === 'admin') return
    if (!confirm('Supprimer ce compte ?')) return
    await supabase.from('comptes').delete().eq('id', id)
    loadComptes()
  }

  const showNiveauSP = spForm.profil === 'Élève' || spForm.profil === 'Étudiant(e)'

  // ── LOGIN ──
  if (!role) return (
    <>
      <Head>
        <title>Espace équipe — JCI 2026</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </Head>
      <div className="login-page">
        <div className="hdr-logo" style={{ width: 60, height: 60, borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Logo size={50} />
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#1B4332', textAlign: 'center', marginBottom: 4 }}>Espace sécurisé JCI 2026</div>
        <div style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 16 }}>Réservé aux membres du comité et à l&apos;administrateur</div>
        <div style={{ fontSize: 11, color: '#744210', fontStyle: 'italic', textAlign: 'center', background: '#FFFBEB', border: '1px solid #F6E05E', borderRadius: 8, padding: '8px 14px', marginBottom: 20, maxWidth: 360 }}>
          « Entre coutumes et croyance, retrouver la pureté du Tawhid »
        </div>
        <div className="login-box">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1B4332', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="ti ti-lock" /> Choisissez votre rôle
          </div>
          <div className="role-select">
            <div className={`role-btn${selectedRole === 'comite' ? ' sel' : ''}`} onClick={() => setSelectedRole('comite')}>
              <div style={{ fontSize: 20, color: '#B7791F', marginBottom: 4 }}><i className="ti ti-qrcode" /></div>
              <div className="rn">Comité</div>
              <div className="rd">Accueil J-Day</div>
            </div>
            <div className={`role-btn${selectedRole === 'admin' ? ' sel' : ''}`} onClick={() => setSelectedRole('admin')}>
              <div style={{ fontSize: 20, color: '#2C5282', marginBottom: 4 }}><i className="ti ti-shield-check" /></div>
              <div className="rn">Administrateur</div>
              <div className="rd">Accès complet</div>
            </div>
          </div>
          <div className="fg"><label>Identifiant</label><input value={login} onChange={e => setLogin(e.target.value)} placeholder="Votre identifiant" /></div>
          <div className="fg"><label>Mot de passe</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} /></div>
          {loginError && <div className="alert al-err"><i className="ti ti-alert-circle" />{loginError}</div>}
          <button className="btn btn-green btn-full" onClick={doLogin}><i className="ti ti-arrow-right" /> Se connecter</button>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <a href="/" style={{ fontSize: 12, color: '#1B4332', textDecoration: 'none' }}>
              <i className="ti ti-user-plus" /> Accéder à l&apos;inscription participant
            </a>
          </div>
        </div>
      </div>
    </>
  )

  // ── APP ──
  const pages = role === 'comite'
    ? [{ id: 'jday', icon: 'ti-qrcode', label: 'Accueil J-Day' }]
    : [{ id: 'jday', icon: 'ti-qrcode', label: 'Accueil J-Day' }, { id: 'liste', icon: 'ti-layout-list', label: 'Liste' }, { id: 'comptes', icon: 'ti-users-group', label: 'Comptes' }]

  return (
    <>
      <Head>
        <title>Espace équipe JCI 2026</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </Head>

      <div className="hdr">
        <div className="hdr-top">
          <div className="hdr-brand">
            <div className="hdr-logo"><Logo size={32} /></div>
            <div><div className="brand-name">JCI 2026</div><div className="brand-sub">AEEMCI · Sous-comité de Bingerville</div></div>
          </div>
          <div className="hdr-right">
            <div className="user-chip"><i className="ti ti-user-circle" /><span>{userName} · {role === 'admin' ? 'Administrateur' : 'Comité'}</span></div>
            <button className="btn-logout" onClick={logout}><i className="ti ti-logout" /> Déconnexion</button>
          </div>
        </div>
        <div className="hdr-nav">
          {pages.map(p => (
            <button key={p.id} className={`ntab${page === p.id ? ' on' : ''}`} onClick={() => setPage(p.id)}>
              <i className={`ti ${p.icon}`} />{p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="main">

        {/* ── J-DAY ── */}
        {page === 'jday' && (
          <>
            <div className="stats">
              <div className="stat"><div className="stat-n" style={{ color: '#1B4332' }}>{stats.total}</div><div className="stat-l">Inscrits</div></div>
              <div className="stat"><div className="stat-n" style={{ color: '#B7791F' }}>{stats.presents}</div><div className="stat-l">Présents</div></div>
              <div className="stat"><div className="stat-n" style={{ color: '#718096' }}>{stats.absents}</div><div className="stat-l">Absents</div></div>
            </div>

            <div className="card">
              <div className="card-hd"><i className="ti ti-qrcode" />Scanner un participant</div>
              <div className="scan-zone">
                <i className="ti ti-scan" style={{ fontSize: 36, color: '#B7791F', display: 'block', marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: '#718096' }}>Scannez le QR Code ou saisissez le code / nom</div>
              </div>
              <div className="sbar">
                <input value={scanQ} onChange={e => setScanQ(e.target.value)} placeholder="Code JCI-2026-XXXX ou nom…" onKeyDown={e => e.key === 'Enter' && scanner()} />
                <button className="btn btn-green" onClick={scanner}><i className="ti ti-check" /> Valider</button>
              </div>
              {scanResult && (
                <div className={`modal-box show`} style={{ borderColor: scanResult.type === 'ok' ? '#9AE6B4' : scanResult.type === 'warn' ? '#F6E05E' : '#FC8181', borderWidth: 1, borderStyle: 'solid' }}>
                  <div style={{ fontSize: 38, marginBottom: 6 }}>{scanResult.type === 'ok' ? '✅' : scanResult.type === 'warn' ? '⚠️' : '❌'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{scanResult.title}</div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 14, whiteSpace: 'pre-line' }}>{scanResult.body}</div>
                  <button className="btn btn-green btn-full" onClick={() => setScanResult(null)}>Fermer</button>
                </div>
              )}
            </div>

            {jdayAlert && (
              <div className={`alert ${jdayAlert.type === 'ok' ? 'al-ok' : 'al-err'}`}>
                <i className={`ti ${jdayAlert.type === 'ok' ? 'ti-check' : 'ti-alert-circle'}`} />{jdayAlert.msg}
              </div>
            )}

            <div className="card">
              <div className="card-hd"><i className="ti ti-plus-circle" />Inscription sur place</div>
              <div className="grid2">
                <div className="fg"><label>Prénom *</label><input value={spForm.prenom} onChange={e => setSpForm({ ...spForm, prenom: e.target.value })} placeholder="ex. Ibrahim" /></div>
                <div className="fg"><label>Nom *</label><input value={spForm.nom} onChange={e => setSpForm({ ...spForm, nom: e.target.value })} placeholder="ex. TRAORÉ" /></div>
                <div className="fg"><label>Genre *</label>
                  <select value={spForm.genre} onChange={e => setSpForm({ ...spForm, genre: e.target.value })}>
                    <option value="">— Choisir —</option><option>Masculin</option><option>Féminin</option>
                  </select>
                </div>
                <div className="fg"><label>Téléphone *</label><input value={spForm.tel} onChange={e => setSpForm({ ...spForm, tel: e.target.value })} placeholder="07 XX XX XX XX" /></div>
                <div className="fg span2"><label>Email</label><input type="email" value={spForm.adresse_email} onChange={e => setSpForm({ ...spForm, adresse_email: e.target.value })} placeholder="votre@email.com" /></div>
              </div>
              <hr className="dv" />
              <div className="grid2">
                <div className="fg"><label>Profil *</label>
                  <select value={spForm.profil} onChange={e => setSpForm({ ...spForm, profil: e.target.value })}>
                    <option value="">— Choisir —</option>
                    <option>Élève</option><option>Étudiant(e)</option><option>Enseignant(e)</option>
                    <option>Membre de la communauté</option><option>Autre</option>
                  </select>
                </div>
                {showNiveauSP && (
                  <div className="fg"><label>Classe / Niveau</label>
                    <select value={spForm.niveau} onChange={e => setSpForm({ ...spForm, niveau: e.target.value })}>
                      <option value="">— Choisir —</option>
                      <optgroup label="Secondaire"><option>6e</option><option>5e</option><option>4e</option><option>3e</option><option>2nde</option><option>1ère</option><option>Terminale</option></optgroup>
                      <optgroup label="Supérieur"><option>Licence 1</option><option>Licence 2</option><option>Licence 3</option><option>Master 1</option><option>Master 2</option><option>Doctorat</option><option>BTS / DUT</option></optgroup>
                      <optgroup label="Autre"><option>Non applicable</option></optgroup>
                    </select>
                  </div>
                )}
                <div className="fg span2"><label>Établissement</label><input value={spForm.etablissement} onChange={e => setSpForm({ ...spForm, etablissement: e.target.value })} placeholder="ex. Lycée de Bingerville…" /></div>
              </div>
              <hr className="dv" />
              <button className="btn btn-gold btn-full" onClick={inscSurPlace} disabled={spLoading}>
                {spLoading ? <><i className="ti ti-loader" /> Enregistrement…</> : <><i className="ti ti-user-check" /> Inscrire et marquer présent</>}
              </button>
            </div>
          </>
        )}

        {/* ── LISTE ── */}
        {page === 'liste' && (
          <>
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div className="card-hd" style={{ margin: 0, padding: 0, border: 'none' }}><i className="ti ti-layout-list" />Participants inscrits</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-out btn-sm" onClick={exportCSV}><i className="ti ti-file-export" /> CSV</button>
                  <button className="btn btn-green btn-sm" onClick={loadParticipants}><i className="ti ti-refresh" /> Actualiser</button>
                </div>
              </div>
            </div>
            <div className="sbar"><input value={listeQ} onChange={e => setListeQ(e.target.value)} placeholder="Rechercher par nom, code, téléphone…" /></div>
            {listeLoading ? <div className="loading"><i className="ti ti-loader" /> Chargement…</div> : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr><th>Référence</th><th>Nom complet</th><th>Profil</th><th>Niveau</th><th>Téléphone</th><th>Source</th><th>Statut</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>Aucun résultat</td></tr>
                    ) : filtered.map(p => (
                      <tr key={p.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 10, background: '#F7FAFC', padding: '2px 5px', borderRadius: 4, border: '1px solid #E2E8F0' }}>{p.ref}</span></td>
                        <td style={{ fontWeight: 500 }}>{p.prenom} {p.nom?.toUpperCase()}</td>
                        <td><span className="badge b-blue">{p.profil}</span></td>
                        <td style={{ color: '#718096' }}>{p.niveau || '—'}</td>
                        <td>{p.tel}</td>
                        <td><span className={`badge ${p.source === 'en ligne' ? 'b-blue' : 'b-gold'}`}>{p.source}</span></td>
                        <td><span className={`badge ${p.statut === 'présent' ? 'b-green' : 'b-gold'}`}>{p.statut === 'présent' ? '✓ Présent' : 'Inscrit'}</span></td>
                        <td style={{ display: 'flex', gap: 4 }}>
                          {p.statut !== 'présent' && <button className="btn btn-green btn-sm" onClick={() => marquerPresent(p.id)}><i className="ti ti-check" /></button>}
                          <button className="btn btn-red btn-sm" onClick={() => supprimerParticipant(p.id)}><i className="ti ti-trash" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── COMPTES ── */}
        {page === 'comptes' && (
          <div className="card">
            <div className="card-hd"><i className="ti ti-users-group" />Comptes d&apos;accès</div>
            <div style={{ marginBottom: 14 }}>
              {comptes.map(c => (
                <div className="compte-row" key={c.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="compte-avatar">{c.nom.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nom}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>@{c.login}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${c.role === 'admin' ? 'b-blue' : 'b-gold'}`}>{c.role === 'admin' ? 'Administrateur' : 'Comité'}</span>
                    {c.login !== 'admin'
                      ? <button className="btn btn-red btn-sm" onClick={() => supprimerCompte(c.id, c.login)}><i className="ti ti-trash" /></button>
                      : <span style={{ fontSize: 10, color: '#CBD5E0' }}>protégé</span>}
                  </div>
                </div>
              ))}
            </div>
            <hr className="dv" />
            <div className="card-hd"><i className="ti ti-plus" />Nouveau compte</div>
            <div className="grid2">
              <div className="fg"><label>Nom complet *</label><input value={ncForm.nom} onChange={e => setNcForm({ ...ncForm, nom: e.target.value })} placeholder="ex. DIALLO Moussa" /></div>
              <div className="fg"><label>Rôle *</label>
                <select value={ncForm.role} onChange={e => setNcForm({ ...ncForm, role: e.target.value })}>
                  <option value="">— Choisir —</option><option value="comite">Membre du comité</option><option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="fg"><label>Identifiant *</label><input value={ncForm.login} onChange={e => setNcForm({ ...ncForm, login: e.target.value })} placeholder="ex. moussa.diallo" /></div>
              <div className="fg"><label>Mot de passe *</label><input type="password" value={ncForm.mot_de_passe} onChange={e => setNcForm({ ...ncForm, mot_de_passe: e.target.value })} placeholder="••••••••" /></div>
            </div>
            {comptesAlert && <div className={`alert ${comptesAlert.type === 'ok' ? 'al-ok' : 'al-err'}`}><i className="ti ti-info-circle" />{comptesAlert.msg}</div>}
            <button className="btn btn-green" onClick={addCompte}><i className="ti ti-plus" /> Créer le compte</button>
          </div>
        )}

      </div>
    </>
  )
}
