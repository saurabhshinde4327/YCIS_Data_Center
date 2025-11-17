import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { generateInternLetterPDF } from '@/lib/pdfGenerator'
import fs from 'fs'
import path from 'path'

// POST /api/intern-students/[id]/letters - Generate and download letter
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const body = await request.json()
    const { letterType, experienceYears } = body // 'offer', 'completion', 'experience'
    
    if (!letterType || !['offer', 'completion', 'experience'].includes(letterType)) {
      return NextResponse.json(
        { error: 'Invalid letter type. Must be: offer, completion, or experience' },
        { status: 400 }
      )
    }

    // Validate experienceYears for experience letter
    if (letterType === 'experience' && (!experienceYears || isNaN(parseFloat(experienceYears)) || parseFloat(experienceYears) <= 0)) {
      return NextResponse.json(
        { error: 'Experience years is required and must be a positive number for experience letters' },
        { status: 400 }
      )
    }
    
    const student = await db.getInternStudent(params.id)
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    // Try to load logo from public folder
    let logoBase64: string | undefined
    try {
      const logoPath = path.join(process.cwd(), 'public', 'datacenter.png')
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath)
        logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`
      }
    } catch (e) {
      console.log('Logo not found, using placeholder')
    }
    
    // Generate PDF with logo if available
    const pdfBuffer = await generateInternLetterPDF(
      student, 
      letterType, 
      logoBase64,
      letterType === 'experience' ? parseFloat(experienceYears) : undefined
    )
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${letterType}-letter-${student.name.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate letter' },
      { status: 500 }
    )
  }
}

