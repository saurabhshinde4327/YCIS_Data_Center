import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, subject, message } = body || {}

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Save to database
    try {
      await db.saveContactSubmission({
        firstName,
        lastName,
        email,
        subject,
        message
      })
    } catch (dbError) {
      console.error('Error saving contact to database:', dbError)
      // Continue even if database save fails
    }

    // Send email notification (optional)
    const toEmail = process.env.CONTACT_TO_EMAIL || 'datacenter@ycis.ac.in'
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'no-reply@ycis.ac.in'
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      try {
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
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Continue even if email fails - data is saved in database
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const submissions = await db.getContactSubmissions()
    return NextResponse.json(submissions)
  } catch (err) {
    console.error('Error fetching contact submissions:', err)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
