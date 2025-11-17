"use client"

import { Invoice } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateInvoicePDF } from '@/lib/pdfGenerator'

interface InvoicePDFProps {
  invoice: Invoice
  onClose?: () => void
}

export default function InvoicePDF({ invoice, onClose }: InvoicePDFProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  // Print function removed as per requirement

  // Handle download as PDF using simplified generator
  const handleDownload = () => {
    try {
      console.log('Downloading invoice:', invoice.invoiceNumber)
      
      generateInvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        items: invoice.items || [],
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        notes: invoice.notes
      })
      
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  // OLD complex version kept as backup
  const handleDownloadOLD = () => {
    try {
      console.log('Starting PDF generation for invoice (OLD):', invoice)
      
      if (!invoice || !invoice.invoiceNumber) {
        alert('Invoice data is missing. Please try again.')
        return
      }
      
      const doc = new jsPDF()
      
      // Helper function to center text
      const centerText = (text: string, y: number) => {
        const textWidth = doc.getTextWidth(text)
        const x = (210 - textWidth) / 2
        doc.text(text, x, y)
      }
      
      // Helper function for right-aligned text
      const rightText = (text: string, x: number, y: number) => {
        const textWidth = doc.getTextWidth(text)
        doc.text(text, x - textWidth, y)
      }
      
      // Set colors
      const primaryColor = [37, 99, 235] // Blue-600
      const accentColor = [59, 130, 246] // Blue-500
      const darkColor = [15, 23, 42] // Gray-900
      const lightGray = [243, 244, 246] // Gray-100

      // Add border
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(1)
      doc.rect(10, 10, 190, 277)

      // Company Logo/Header Section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(10, 10, 190, 35, 'F')
      
      // Company name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      centerText('YCIS DATA & TECHNOLOGY CENTER', 22)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      centerText('Yashavantrao Chavan Institute of Science', 30)
      centerText('Satara, Maharashtra, India', 36)

      // INVOICE Title
      let yPos = 55
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      centerText('INVOICE', yPos)
      
      yPos += 15

      // Invoice Info Box
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(20, yPos, 85, 25)
      doc.rect(105, yPos, 85, 25)
      
      // Left box - Invoice details
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Invoice Number:', 23, yPos + 7)
      doc.setFont('helvetica', 'normal')
      doc.text(invoice.invoiceNumber, 23, yPos + 13)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Issue Date:', 23, yPos + 19)
      doc.setFont('helvetica', 'normal')
      doc.text(new Date(invoice.issueDate).toLocaleDateString('en-IN'), 23, yPos + 25)

      // Right box - Status and Due Date
      doc.setFont('helvetica', 'bold')
      doc.text('Status:', 108, yPos + 7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(
        invoice.status === 'paid' ? [34, 197, 94] : 
        invoice.status === 'overdue' ? [239, 68, 68] : 
        [234, 179, 8]
      )
      doc.text(invoice.status.toUpperCase(), 108, yPos + 13)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFont('helvetica', 'bold')
      doc.text('Due Date:', 108, yPos + 19)
      doc.setFont('helvetica', 'normal')
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), 108, yPos + 25)
      
      // Renewal Date (if available)
      if (invoice.renewalDate) {
        doc.setFont('helvetica', 'bold')
        doc.text('Renewal Date:', 108, yPos + 31)
        doc.setFont('helvetica', 'normal')
        doc.text(new Date(invoice.renewalDate).toLocaleDateString('en-IN'), 108, yPos + 37)
      }
      
      yPos += 35

      // Bill To Section with box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.rect(20, yPos, 170, 25, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(20, yPos, 170, 25)
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('BILL TO:', 23, yPos + 7)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(invoice.clientName, 23, yPos + 14)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Email: ${invoice.clientEmail || 'N/A'}`, 23, yPos + 20)
      
      yPos += 35
      
      // Items table section title
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text('INVOICE ITEMS', 20, yPos)
      
      yPos += 8
      
      // Items table header with blue background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(20, yPos - 6, 170, 10, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('S.No', 25, yPos)
      doc.text('Description', 40, yPos)
      doc.text('Qty', 125, yPos, { align: 'center' })
      doc.text('Rate (₹)', 150, yPos, { align: 'right' })
      doc.text('Amount (₹)', 183, yPos, { align: 'right' })
      
      yPos += 8
      
      // Items
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item: any, index: number) => {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage()
            yPos = 20
          }
          
          // Alternate row background
          if (index % 2 === 0) {
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
            doc.rect(20, yPos - 4, 170, 10, 'F')
          }
          
          // Serial number
          doc.text((index + 1).toString(), 25, yPos)
          
          // Item description (wrap if too long)
          const descLines = doc.splitTextToSize(item.description, 75)
          doc.text(descLines, 40, yPos)
          
          // Quantity, price, total
          const qtyStr = item.quantity.toString()
          const qtyWidth = doc.getTextWidth(qtyStr)
          doc.text(qtyStr, 125 - qtyWidth / 2, yPos)
          
          rightText(item.unitPrice.toLocaleString('en-IN'), 165, yPos)
          
          doc.setFont('helvetica', 'bold')
          rightText(item.totalPrice.toLocaleString('en-IN'), 188, yPos)
          doc.setFont('helvetica', 'normal')
          
          yPos += Math.max(8, 5 * descLines.length)
        })
      }
      
      // Bottom border for table
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(20, yPos, 190, yPos)
      
      yPos += 10
      
      // Totals section in a box
      const totalsBoxY = yPos
      doc.setDrawColor(200, 200, 200)
      doc.rect(120, totalsBoxY, 70, 30)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Subtotal
      yPos = totalsBoxY + 7
      doc.text('Subtotal:', 123, yPos)
      const subtotalStr = `₹ ${(invoice.subtotal || 0).toLocaleString('en-IN')}`
      rightText(subtotalStr, 188, yPos)
      
      // Tax
      yPos += 6
      doc.text(`Tax (${invoice.taxRate || 0}%):`, 123, yPos)
      const taxStr = `₹ ${(invoice.taxAmount || 0).toLocaleString('en-IN')}`
      rightText(taxStr, 188, yPos)
      
      // Divider line
      yPos += 4
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(123, yPos, 187, yPos)
      
      // Total (highlighted with blue background)
      yPos += 6
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(120, yPos - 4, 70, 10, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL AMOUNT:', 123, yPos)
      const totalStr = `₹ ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`
      rightText(totalStr, 188, yPos)
      
      yPos = totalsBoxY + 40
      
      // Notes section with box
      if (invoice.notes) {
        yPos += 10
        
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('NOTES:', 20, yPos)
        
        yPos += 5
        
        doc.setFillColor(255, 251, 235) // Yellow tint
        doc.rect(20, yPos, 170, 20, 'F')
        doc.setDrawColor(234, 179, 8)
        doc.rect(20, yPos, 170, 20)
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        
        const notesLines = doc.splitTextToSize(invoice.notes, 165)
        doc.text(notesLines, 23, yPos + 6)
        
        yPos += 25
      }
      
      // Terms & Conditions box
      yPos += 10
      if (yPos > 245) {
        doc.addPage()
        yPos = 30
      }
      
      doc.setFillColor(240, 249, 255) // Light blue
      doc.rect(20, yPos, 170, 15, 'F')
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.rect(20, yPos, 170, 15)
      
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('PAYMENT TERMS:', 23, yPos + 5)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(8)
      doc.text('Payment is due within 30 days. Late payments may incur additional charges.', 23, yPos + 10)
      
      // Footer section
      const pageHeight = doc.internal.pageSize.height
      
      // Signature section
      yPos = pageHeight - 50
      doc.setDrawColor(150, 150, 150)
      doc.line(20, yPos, 70, yPos)
      doc.line(140, yPos, 190, yPos)
      
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.text('Authorized Signature', 20, yPos + 5)
      doc.text('Client Signature', 140, yPos + 5)
      
      // Footer with blue background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(10, pageHeight - 30, 190, 20, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      centerText('YCIS Data & Technology Center', pageHeight - 22)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      centerText('Yashavantrao Chavan Institute of Science, Satara, Maharashtra', pageHeight - 17)
      centerText('Email: support@ycisdatacenter.com | Phone: +91 8668428513', pageHeight - 13)
      
      // Generated date (outside footer box)
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(7)
      centerText(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageHeight - 5)
      
      // Save PDF
      console.log('PDF generated successfully, downloading...')
      doc.save(`${invoice.invoiceNumber}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      console.error('Error details:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`)
    }
  }

  // Old print method kept for compatibility
  const handleDownloadOld = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 8px; 
                font-size: 12px;
                line-height: 1.2;
              }
              .header { display: flex; justify-content: space-between; margin-bottom: 12px; }
              .company-info h1 { color: #2563eb; margin: 0; font-size: 18px; }
              .invoice-info { text-align: right; }
              .client-info { margin-bottom: 12px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
              .items-table th { background-color: #f5f5f5; }
              .totals { text-align: right; margin-top: 12px; }
              .total-row { font-weight: bold; font-size: 11px; }
              .notes { margin-top: 12px; }
              @media print { 
                body { margin: 0; padding: 6px; }
                @page { margin: 0.4in; size: letter; }
              }
              * { 
                page-break-inside: avoid;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${generateInvoiceHTML()}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Generate HTML content for the invoice (optimized for single page)
  const generateInvoiceHTML = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 8px; font-size: 12px; line-height: 1.2;">
        <!-- Header - Balanced Compact -->
        <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <div style="width: 40px; height: 40px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px; border: 1px solid #2563eb;">
                  <img src="/datacenter.png" alt="YCIS Data Center Logo" style="width: 32px; height: 32px; object-fit: contain;" />
                </div>
                <div>
                  <h1 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0;">YCIS Data Center</h1>
                  <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">Satara, Maharashtra, India</p>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 10px;">
                <div>
                  <p style="color: #6b7280; margin: 1px 0;">Phone: +91-8668428513</p>
                  <p style="color: #6b7280; margin: 1px 0;">Email: datacenter@ycis.ac.in</p>
                </div>
                <div>
                  <p style="color: #6b7280; margin: 1px 0;">GSTIN No: 27AAATT1566E1ZJ</p>
                </div>
              </div>
            </div>
            <div style="text-align: right; margin-left: 15px;">
              <div style="background: #f9fafb; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 6px 0;">INVOICE</h2>
                <div style="font-size: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="font-weight: 600;">#:</span>
                    <span>${invoice.invoiceNumber}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="font-weight: 600;">Date:</span>
                    <span>${formatDate(invoice.issueDate)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">Due:</span>
                    <span>${formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Client Information - Balanced Compact -->
        <div style="margin-bottom: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <h3 style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">Bill To:</h3>
              <div style="background: #f9fafb; padding: 6px; border-radius: 4px;">
                <p style="font-weight: 600; font-size: 11px; color: #1f2937; margin: 0 0 2px 0;">${invoice.clientName}</p>
                ${invoice.clientEmail ? `<p style="color: #6b7280; margin: 1px 0; font-size: 10px;">${invoice.clientEmail}</p>` : ''}
                ${invoice.clientPhone ? `<p style="color: #6b7280; margin: 1px 0; font-size: 10px;">${invoice.clientPhone}</p>` : ''}
                ${invoice.clientAddress ? `<div style="margin-top: 3px;"><p style="color: #6b7280; white-space: pre-line; margin: 0; font-size: 10px;">${invoice.clientAddress}</p></div>` : ''}
              </div>
            </div>
            <div>
              <h3 style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">Payment:</h3>
              <div style="background: #f9fafb; padding: 6px; border-radius: 4px;">
                <p style="color: #6b7280; margin: 1px 0; font-size: 10px;">Due: ${formatDate(invoice.dueDate)}</p>
                <p style="color: #6b7280; margin: 1px 0; font-size: 10px;">Method: Bank Transfer</p>
                <p style="color: #6b7280; margin: 1px 0; font-size: 10px;">Late Fee: 1.5%/month</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Items - Balanced Compact -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 6px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">Invoice Details</h3>
          <div style="border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="border-bottom: 1px solid #d1d5db; padding: 6px; text-align: left; font-weight: 600; color: #374151; font-size: 10px;">Description</th>
                  <th style="border-bottom: 1px solid #d1d5db; padding: 6px; text-align: center; font-weight: 600; color: #374151; font-size: 10px;">Qty</th>
                  <th style="border-bottom: 1px solid #d1d5db; padding: 6px; text-align: right; font-weight: 600; color: #374151; font-size: 10px;">Rate</th>
                  <th style="border-bottom: 1px solid #d1d5db; padding: 6px; text-align: right; font-weight: 600; color: #374151; font-size: 10px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items?.map((item, index) => `
                  <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                    <td style="border-bottom: 1px solid #e5e7eb; padding: 6px; color: #374151; font-size: 10px;">${item.description}</td>
                    <td style="border-bottom: 1px solid #e5e7eb; padding: 6px; text-align: center; color: #374151; font-size: 10px;">${item.quantity}</td>
                    <td style="border-bottom: 1px solid #e5e7eb; padding: 6px; text-align: right; color: #374151; font-size: 10px;">${formatCurrency(item.unitPrice)}</td>
                    <td style="border-bottom: 1px solid #e5e7eb; padding: 6px; text-align: right; font-weight: 600; color: #1f2937; font-size: 10px;">${formatCurrency(item.totalPrice)}</td>
                  </tr>
                `).join('') || `
                  <tr>
                    <td colspan="4" style="border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #9ca3af; font-size: 10px;">No items found</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals - Balanced Compact -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <div style="width: 250px;">
            <div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #374151; font-weight: 500; font-size: 10px;">Subtotal:</span>
                <span style="color: #1f2937; font-weight: 600; font-size: 10px;">${formatCurrency(invoice.subtotal)}</span>
              </div>
              ${invoice.taxRate > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #374151; font-weight: 500; font-size: 10px;">Tax (${invoice.taxRate}%):</span>
                  <span style="color: #1f2937; font-weight: 600; font-size: 10px;">${formatCurrency(invoice.taxAmount)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 6px; background: #dbeafe; border: 1px solid #93c5fd; border-radius: 4px; margin-top: 4px;">
                <span style="font-size: 11px; font-weight: bold; color: #1e40af;">Total Amount:</span>
                <span style="font-size: 12px; font-weight: bold; color: #1e40af;">${formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes and Terms - Balanced Compact -->
        <div style="margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${invoice.notes ? `
              <div>
                <h3 style="font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">Notes:</h3>
                <div style="background: #f9fafb; padding: 6px; border-radius: 4px;">
                  <p style="color: #374151; white-space: pre-line; margin: 0; font-size: 9px;">${invoice.notes}</p>
                </div>
              </div>
            ` : ''}
            <div>
              <h3 style="font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">Terms:</h3>
              <div style="background: #f9fafb; padding: 6px; border-radius: 4px; font-size: 9px; color: #374151;">
                <p style="margin: 0 0 2px 0;">• Payment due within 30 days</p>
                <p style="margin: 0 0 2px 0;">• Late fee: 1.5% per month</p>
                <p style="margin: 0;">• Contact: datacenter@ycis.ac.in</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer - Balanced Compact -->
        <div style="border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center; margin-bottom: 6px;">
            <div>
              <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 10px;">Contact</h4>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">+91 8668428513</p>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">datacenter@ycis.ac.in</p>
            </div>
            <div>
              <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 10px;">Payment</h4>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">Bank Transfer</p>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">Check</p>
            </div>
            <div>
              <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 10px;">Thank You</h4>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">We appreciate your business!</p>
              <p style="font-size: 9px; color: #6b7280; margin: 1px 0;">https://datacenter.ycislocker.space</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 6px; padding-top: 4px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 8px; color: #9ca3af; margin: 0;">
              This invoice was generated electronically and is valid without signature.
            </p>
          </div>
        </div>
      </div>
    `
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header with Company Logo and Info */}
      <div className="border-b-2 border-gray-300 pb-4 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
          <div className="flex-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <img 
                  src="/datacenter.png" 
                  alt="YCIS Data Center Logo" 
                  className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">YCIS Data Center</h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">Satara, Maharashtra, India</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-sm">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Company Information:</h3>
                <p className="text-gray-600 text-xs sm:text-sm">YCIS Data Center</p>
                <p className="text-gray-600 text-xs sm:text-sm">Satara, Maharashtra</p>
                <p className="text-gray-600 text-xs sm:text-sm">India</p>
                <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">Phone: +91-8668428513</p>
                <p className="text-gray-600 text-xs sm:text-sm">Email: datacenter@ycis.ac.in</p>
                <p className="text-gray-600 text-xs sm:text-sm break-all">Website: https://datacenter.ycislocker.space</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Tax Information:</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Tax ID: 12-3456789</p>
                <p className="text-gray-600 text-xs sm:text-sm">GST Number: GST123456789</p>
                <p className="text-gray-600 text-xs sm:text-sm">PAN: ABCDE1234F</p>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right sm:ml-8">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">INVOICE</h2>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Invoice #:</span>
                  <span className="text-gray-700">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Issue Date:</span>
                  <span className="text-gray-700">{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Due Date:</span>
                  <span className="text-gray-700">{formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.renewalDate && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Renewal Date:</span>
                    <span className="text-gray-700">{formatDate(invoice.renewalDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 border-b border-gray-300 pb-2">Bill To:</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="font-semibold text-base sm:text-lg text-gray-800">{invoice.clientName}</p>
              {invoice.clientEmail && <p className="text-gray-600 mt-1 text-sm sm:text-base break-all">{invoice.clientEmail}</p>}
              {invoice.clientPhone && <p className="text-gray-600 mt-1 text-sm sm:text-base">{invoice.clientPhone}</p>}
              {invoice.clientAddress && (
                <div className="mt-2">
                  <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">{invoice.clientAddress}</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 border-b border-gray-300 pb-2">Payment Terms:</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="text-gray-600 text-sm sm:text-base">Payment Due: {formatDate(invoice.dueDate)}</p>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Payment Method: Bank Transfer / Check</p>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Late Fee: 1.5% per month</p>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Currency: USD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 border-b border-gray-300 pb-2">Invoice Details</h3>
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 px-3 sm:px-6 py-2 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Description</th>
                <th className="border-b border-gray-300 px-2 sm:px-4 py-2 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm">Qty</th>
                <th className="border-b border-gray-300 px-2 sm:px-4 py-2 sm:py-4 text-right font-semibold text-gray-700 text-xs sm:text-sm">Rate</th>
                <th className="border-b border-gray-300 px-3 sm:px-6 py-2 sm:py-4 text-right font-semibold text-gray-700 text-xs sm:text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-4 text-gray-700 text-xs sm:text-sm">{item.description}</td>
                  <td className="border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-4 text-center text-gray-700 text-xs sm:text-sm">{item.quantity}</td>
                  <td className="border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-4 text-right text-gray-700 text-xs sm:text-sm">{formatCurrency(item.unitPrice)}</td>
                  <td className="border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-4 text-right font-semibold text-gray-800 text-xs sm:text-sm">{formatCurrency(item.totalPrice)}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="border-b border-gray-200 px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6 sm:mb-8">
        <div className="w-full sm:w-96">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm sm:text-base">
                <span className="text-gray-700 font-medium">Subtotal:</span>
                <span className="text-gray-800 font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200 text-sm sm:text-base">
                  <span className="text-gray-700 font-medium">Tax ({invoice.taxRate}%):</span>
                  <span className="text-gray-800 font-semibold">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 sm:py-4 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 sm:px-4">
                <span className="text-base sm:text-lg font-bold text-blue-800">Total Amount:</span>
                <span className="text-lg sm:text-xl font-bold text-blue-800">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {invoice.notes && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 border-b border-gray-300 pb-2">Notes:</h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="whitespace-pre-line text-gray-700 text-sm sm:text-base">{invoice.notes}</p>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 border-b border-gray-300 pb-2">Terms & Conditions:</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-gray-700">
              <p className="mb-2">• Payment is due within 30 days of invoice date</p>
              <p className="mb-2">• Late payments may incur a 1.5% monthly service charge</p>
              <p className="mb-2">• All services are subject to our standard terms and conditions</p>
              <p className="mb-2">• For questions about this invoice, contact us at info@ycisdatacenter.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 sm:pt-6 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Contact Information</h4>
            <p className="text-xs sm:text-sm text-gray-600">Phone: +91 8668428513</p>
            <p className="text-xs sm:text-sm text-gray-600">Email: datacenter@ycis.ac.in</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Payment Methods</h4>
            <p className="text-xs sm:text-sm text-gray-600">Bank Transfer</p>
            <p className="text-xs sm:text-sm text-gray-600">Check</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Thank You</h4>
            <p className="text-xs sm:text-sm text-gray-600">We appreciate your business!</p>
            <p className="text-xs sm:text-sm text-gray-600 break-all">Visit us at https://datacenter.ycislocker.space</p>
          </div>
        </div>
        <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This invoice was generated electronically and is valid without signature.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8 pt-6 border-t">
        <Button onClick={handleDownload} className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
        )}
      </div>
    </div>
  )
}
