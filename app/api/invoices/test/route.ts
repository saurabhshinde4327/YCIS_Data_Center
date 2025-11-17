import { NextResponse } from "next/server"
import { invoiceOperations, initializeDatabase } from "@/lib/database"

// Test endpoint to diagnose invoice creation issues
export async function GET() {
  try {
    // Test 1: Database connection
    await initializeDatabase()
    
    // Test 2: Generate invoice number
    const invoiceNumber = await invoiceOperations.generateInvoiceNumber()
    
    // Test 3: Try to create a test invoice
    const testInvoice = {
      invoiceNumber: invoiceNumber,
      clientName: "Test Client",
      clientEmail: "test@example.com",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      items: [
        {
          description: "Test Item",
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100
        }
      ],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 100,
      status: 'draft' as const
    }
    
    const invoice = await invoiceOperations.createInvoice(testInvoice)
    
    return NextResponse.json({
      success: true,
      message: "Invoice system working correctly!",
      testInvoiceId: invoice.id,
      generatedNumber: invoiceNumber
    })
    
  } catch (error) {
    console.error("Invoice test error:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code || 'UNKNOWN'
    const errno = (error as any)?.errno || 'N/A'
    const sqlState = (error as any)?.sqlState || 'N/A'
    const stack = error instanceof Error ? error.stack : 'No stack trace'
    
    return NextResponse.json({
      success: false,
      error: message,
      code: code,
      errno: errno,
      sqlState: sqlState,
      stack: stack,
      databaseConfig: {
        host: process.env.DB_HOST || '91.108.105.168',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'ycis_datacenter'
      }
    }, { status: 500 })
  }
}

