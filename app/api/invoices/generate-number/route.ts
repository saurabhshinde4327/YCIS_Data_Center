import { NextResponse } from "next/server"
import { invoiceOperations, initializeDatabase } from "@/lib/database"

// Initialize database on first request
let dbInitialized = false
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

// GET generate invoice number
export async function GET() {
  try {
    await initDB()
    const invoiceNumber = await invoiceOperations.generateInvoiceNumber()
    return NextResponse.json({ invoiceNumber })
  } catch (error) {
    console.error("Error generating invoice number:", error)
    return NextResponse.json(
      { error: "Failed to generate invoice number" },
      { status: 500 }
    )
  }
}

