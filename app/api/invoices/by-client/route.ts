import { NextRequest, NextResponse } from 'next/server'
import { invoiceOperations, initializeDatabase } from '@/lib/database'

// Initialize database
initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientEmail = searchParams.get('email')

    console.log('Fetching invoices for client email:', clientEmail)

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400 }
      )
    }

    // Get all invoices
    const allInvoices = await invoiceOperations.getInvoices()
    console.log('Total invoices in database:', allInvoices.length)
    console.log('All invoice emails:', allInvoices.map(inv => inv.clientEmail))
    
    // Filter invoices by client email (case-insensitive)
    const clientInvoices = allInvoices.filter(
      invoice => {
        const match = invoice.clientEmail?.toLowerCase() === clientEmail.toLowerCase()
        console.log(`Comparing "${invoice.clientEmail}" with "${clientEmail}": ${match}`)
        return match
      }
    )

    console.log('Filtered invoices for client:', clientInvoices.length)

    return NextResponse.json(clientInvoices)
  } catch (error) {
    console.error('Error fetching client invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

