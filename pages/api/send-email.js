export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ref, prenom, nom, adresse_email } = req.body

  if (!adresse_email) return res.status(400).json({ error: 'Email manquant' })

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'JCI 2026 <noreply@resend.dev>',
      to: adresse_email,
      subject: `Confirmation d'inscription JCI 2026 — ${ref}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,sans-serif;background:#F7F5F0;padding:24px;color:#1A202C">
          <div style="max-width:500px;margin:0 auto">
            <div style="background:#1B4332;border-radius:12px 12px 0 0;padding:20px;text-align:center;border-bottom:3px solid #B7791F">
              <div style="font-size:11px;color:#F6E05E;font-weight:600;letter-spacing:.5px;margin-bottom:6px">AEEMCI · Sous-comité de Bingerville · 50e anniversaire</div>
              <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px">Journée Culturelle Islamique 2026</div>
              <div style="font-size:12px;color:#A7C4B5;font-style:italic">« Entre coutumes et croyance, retrouver la pureté du Tawhid »</div>
            </div>

            <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;border:1px solid #E2E8F0;border-top:none">
              <div style="font-size:15px;font-weight:600;color:#1B4332;margin-bottom:12px">
                Bienvenue, ${prenom} ${nom.toUpperCase()} !
              </div>
              <p style="font-size:13px;color:#4A5568;line-height:1.6;margin-bottom:16px">
                Votre inscription à la <strong>Journée Culturelle Islamique 2026</strong> a bien été enregistrée. Nous sommes ravis de vous compter parmi nous pour cet événement béni.
              </p>

              <div style="background:#FFFBEB;border:2px dashed #B7791F;border-radius:10px;padding:16px;text-align:center;margin-bottom:16px">
                <div style="font-size:11px;color:#744210;font-weight:600;margin-bottom:8px">VOTRE CODE D'ENTRÉE</div>
                <div style="font-size:28px;font-weight:700;color:#1B4332;letter-spacing:3px">${ref}</div>
                <div style="font-size:11px;color:#718096;margin-top:6px">Présentez ce code à l'entrée le 27 juin 2026</div>
              </div>

              <div style="background:#F7FAFC;border-radius:8px;padding:12px;margin-bottom:16px">
                <div style="font-size:12px;font-weight:600;color:#1B4332;margin-bottom:8px">📅 Informations pratiques</div>
                <div style="font-size:12px;color:#4A5568;line-height:2">
                  <div>📆 <strong>Date :</strong> Samedi 27 juin 2026</div>
                  <div>⏰ <strong>Horaire :</strong> 08h00 – 16h30</div>
                  <div>📍 <strong>Lieu :</strong> Bingerville</div>
                  <div>🎟️ <strong>Entrée :</strong> Libre sur inscription</div>
                </div>
              </div>

              <p style="font-size:12px;color:#718096;line-height:1.6;margin-bottom:16px">
                Au programme : conférences, panel de discussion, Concours Al-Ilm, slam, psalmodie, remise de diplômes et récompenses des lauréats.
              </p>

              <div style="border-top:1px solid #EDF2F7;padding-top:14px;text-align:center">
                <div style="font-size:11px;color:#718096">Pour toute question, contactez-nous</div>
                <div style="font-size:12px;color:#1B4332;font-weight:500;margin-top:4px">aeemcibingerville@gmail.com</div>
                <div style="font-size:11px;color:#718096;margin-top:2px">07 11 66 15 47 / 05 66 92 68 35 / 05 66 00 47 02</div>
                <div style="margin-top:12px;font-size:11px;color:#B7791F;font-weight:600">#JCI2026 #AEEMCIBingerville</div>
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
