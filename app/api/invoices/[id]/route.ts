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

// GET invoice by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDB()
    const invoice = await invoiceOperations.getInvoice(params.id)
    
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}

// PUT update invoice
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDB()
    const body = await request.json()
    
    // Calculate totals if items are provided
    if (body.items && body.items.length > 0) {
      const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      const taxAmount = subtotal * (body.taxRate || 0) / 100
      const totalAmount = subtotal + taxAmount
      
      body.subtotal = subtotal
      body.taxAmount = taxAmount
      body.totalAmount = totalAmount
    }
    
    const invoice = await invoiceOperations.updateInvoice(params.id, body)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    )
  }
}

// DELETE invoice
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDB()
    const success = await invoiceOperations.deleteInvoice(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    )
  }
}

