import { NextRequest, NextResponse } from "next/server"
import { invoiceOperations, initializeDatabase } from "@/lib/database"

// Initialize database on first request
let dbInitialized = false
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

// GET all invoices
export async function GET() {
  try {
    await initDB()
    const invoices = await invoiceOperations.getInvoices()
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code || 'UNKNOWN'
    return NextResponse.json(
      { error: `Failed to fetch invoices: ${message} (Code: ${code})` },
      { status: 500 }
    )
  }
}

// POST create new invoice
export async function POST(request: NextRequest) {
  try {
    console.log('=== Invoice Creation Started ===')
    await initDB()
    
    const body = await request.json()
    console.log('Received invoice data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.invoiceNumber || !body.clientName || !body.issueDate || !body.dueDate) {
      const missingFields = []
      if (!body.invoiceNumber) missingFields.push('invoiceNumber')
      if (!body.clientName) missingFields.push('clientName')
      if (!body.issueDate) missingFields.push('issueDate')
      if (!body.dueDate) missingFields.push('dueDate')
      
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: `Missing: ${missingFields.join(', ')}`,
          missingFields: missingFields
        },
        { status: 400 }
      )
    }
    
    // Ensure status is lowercase to match ENUM
    if (body.status) {
      body.status = body.status.toLowerCase()
    }
    
    // Calculate totals if items are provided
    if (body.items && body.items.length > 0) {
      const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      const taxAmount = subtotal * (body.taxRate || 0) / 100
      const totalAmount = subtotal + taxAmount
      
      body.subtotal = subtotal
      body.taxAmount = taxAmount
      body.totalAmount = totalAmount
      
      console.log('Calculated totals:', { subtotal, taxAmount, totalAmount })
    } else {
      // Ensure we have default values
      body.subtotal = body.subtotal || 0
      body.taxAmount = body.taxAmount || 0
      body.totalAmount = body.totalAmount || 0
    }
    
    console.log('Creating invoice in database...')
    const invoice = await invoiceOperations.createInvoice(body)
    console.log('Invoice created successfully:', invoice.id)
    
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("!!! Error creating invoice !!!")
    console.error("Error type:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack')
    console.error("Full error object:", error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code || 'UNKNOWN'
    const errno = (error as any)?.errno || 'N/A'
    const sqlState = (error as any)?.sqlState || 'N/A'
    const sqlMessage = (error as any)?.sqlMessage || ''
    
    return NextResponse.json(
      { 
        error: "Failed to create invoice",
        details: message,
        code: code,
        errno: errno,
        sqlState: sqlState,
        sqlMessage: sqlMessage,
        hint: errno === 1062 ? "Duplicate invoice number - this invoice number already exists" : ""
      },
      { status: 500 }
    )
  }
}

