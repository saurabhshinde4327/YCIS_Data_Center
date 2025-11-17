import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, subject, message } = body || {}

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || 'datacenter@ycis.ac.in'
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'no-reply@ycis.ac.in'
    const resendKey = process.env.RESEND_API_KEY

    if (!resendKey) {
      // Fallback: pretend success in dev without sending
      console.warn('RESEND_API_KEY not set. Skipping real email send.')
      return NextResponse.json({ success: true, skipped: true })
    }

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `[Contact] ${subject}`,
        reply_to: email,
        html
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Resend error:', text)
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}


