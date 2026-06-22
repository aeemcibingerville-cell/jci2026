export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ref, prenom, nom, adresse_email } = req.body

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'JCI 2026 <onboarding@resend.dev>',
      to: 'aeemcibingerville@gmail.com',
      subject: `[JCI 2026] Nouvelle inscription : ${prenom} ${nom} — ${ref}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,sans-serif;background:#F7F5F0;padding:24px;color:#1A202C">
          <div style="max-width:500px;margin:0 auto">
            <div style="background:#1B4332;border-radius:12px 12px 0 0;padding:20px;text-align:center;border-bottom:3px solid #B7791F">
              <div style="font-size:11px;color:#F6E05E;font-weight:600;letter-spacing:.5px;margin-bottom:6px">AEEMCI · Sous-comité de Bingerville · 50e anniversaire</div>
              <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px">Nouvelle inscription JCI 2026</div>
              <div style="font-size:12px;color:#A7C4B5;font-style:italic">« Entre coutumes et croyance, retrouver la pureté du Tawhid »</div>
            </div>

            <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;border:1px solid #E2E8F0;border-top:none">
              <div style="font-size:15px;font-weight:600;color:#1B4332;margin-bottom:16px">
                ✅ Un nouveau participant s'est inscrit !
              </div>

              <div style="background:#F7FAFC;border-radius:8px;padding:14px;margin-bottom:16px">
                <div style="font-size:12px;font-weight:600;color:#1B4332;margin-bottom:10px">📋 Informations du participant</div>
                <div style="font-size:13px;color:#4A5568;line-height:2.2">
                  <div>👤 <strong>Nom :</strong> ${prenom} ${nom.toUpperCase()}</div>
                  <div>🎫 <strong>Référence :</strong> <span style="font-family:monospace;font-weight:700;color:#1B4332;font-size:15px">${ref}</span></div>
                  ${adresse_email ? `<div>📧 <strong>Email :</strong> ${adresse_email}</div>` : ''}
                </div>
              </div>

              <div style="background:#FFFBEB;border:2px dashed #B7791F;border-radius:10px;padding:14px;text-align:center;margin-bottom:16px">
                <div style="font-size:11px;color:#744210;font-weight:600;margin-bottom:6px">CODE D'ENTRÉE DU PARTICIPANT</div>
                <div style="font-size:28px;font-weight:700;color:#1B4332;letter-spacing:3px">${ref}</div>
              </div>

              <div style="border-top:1px solid #EDF2F7;padding-top:14px;text-align:center">
                <div style="font-size:11px;color:#B7791F;font-weight:600">#JCI2026 #AEEMCIBingerville</div>
                <div style="font-size:11px;color:#718096;margin-top:4px">AEEMCI, pour une identité islamique !</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({ error: 'Erreur envoi email' })
  }
}
