import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface InvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  status: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  notes?: string
}

export const generateInvoicePDF = (invoice: InvoiceData) => {
  try {
    const doc = new jsPDF()
    
    // Colors
    const primaryBlue: [number, number, number] = [37, 99, 235]
    
    // ==================== PAGE 1: INVOICE ====================
    
    // Add company logo
    try {
      // Use the datacenter.png logo - it will be loaded from public folder
      const img = new Image()
      img.src = '/datacenter.png'
      doc.addImage(img, 'PNG', 20, 15, 30, 30)
    } catch (e) {
      // If logo fails to load, show a placeholder circle
      doc.setFillColor(37, 99, 235)
      doc.circle(35, 30, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('YCIS', 35, 32, { align: 'center' })
    }
    
    // Company information
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('YCIS DATA & TECHNOLOGY CENTER', 55, 22)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Yashavantrao Chavan Institute of Science', 55, 29)
    doc.text('Satara, Maharashtra - 415001', 55, 34)
    doc.text('Phone: +91 8668428513', 55, 39)
    doc.text('Email: support@ycisdatacenter.com', 55, 44)
    
    // INVOICE title
    let y = 58
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 105, y, { align: 'center' })
    
    y += 10
    
    // Invoice info and status
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice #: ' + invoice.invoiceNumber, 20, y)
    doc.text('Status: ' + invoice.status.toUpperCase(), 150, y)
    
    y += 7
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Issue Date: ' + new Date(invoice.issueDate).toLocaleDateString('en-IN'), 20, y)
    doc.text('Due Date: ' + new Date(invoice.dueDate).toLocaleDateString('en-IN'), 150, y)
    
    y += 12
    
    // Bill To
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.text('BILL TO:', 20, y)
    
    y += 6
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(invoice.clientName, 20, y)
    
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (invoice.clientAddress) {
      const addressLines = doc.splitTextToSize(invoice.clientAddress, 170)
      doc.text(addressLines, 20, y)
      y += (addressLines.length * 4)
    }
    
    // Items table using autoTable
    y += 12
    
    const tableData = invoice.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      item.unitPrice.toLocaleString('en-IN'),
      item.totalPrice.toLocaleString('en-IN')
    ])
    
    autoTable(doc, {
      startY: y,
      head: [['#', 'Description', 'Qty', 'Rate (Rs)', 'Amount (Rs)']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryBlue,
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 }
    })
    
    // Get final Y position after table
    y = (doc as any).lastAutoTable.finalY + 8
    
    // Totals (simple layout on right side)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text('Subtotal:', 130, y)
    doc.text('Rs ' + invoice.subtotal.toLocaleString('en-IN'), 187, y, { align: 'right' })
    
    y += 6
    doc.text('Tax (' + invoice.taxRate + '%):', 130, y)
    doc.text('Rs ' + invoice.taxAmount.toLocaleString('en-IN'), 187, y, { align: 'right' })
    
    y += 2
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.line(130, y, 190, y)
    
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.text('TOTAL:', 130, y)
    doc.text('Rs ' + invoice.totalAmount.toLocaleString('en-IN'), 187, y, { align: 'right' })
    
    y += 12
    
    // Notes section (if exists and space available)
    if (invoice.notes && y < 230) {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Notes:', 20, y)
      
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const noteLines = doc.splitTextToSize(invoice.notes, 170)
      doc.text(noteLines.slice(0, 3), 20, y) // Max 3 lines
      
      y += 15
    }
    
    // Signature lines (bottom of page 1)
    y = 250
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.3)
    doc.line(20, y, 70, y)
    doc.line(140, y, 190, y)
    
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('Operational Manager Data Center', 20, y + 5)
    doc.text('Co-ordinator Data Center', 140, y + 5)
    
    // ==================== PAGE 2: TERMS & CONDITIONS ====================
    doc.addPage()
    
    // Blue header bar
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.rect(0, 0, 210, 45, 'F')
    
    // Add logo on page 2
    try {
      const img = new Image()
      img.src = '/datacenter.png'
      doc.addImage(img, 'PNG', 20, 12, 22, 22)
    } catch (e) {
      doc.setFillColor(255, 255, 255)
      doc.circle(31, 23, 8, 'F')
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('YCIS', 31, 25, { align: 'center' })
    }
    
    // Company name in header
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('YCIS DATA & TECHNOLOGY CENTER', 48, 20)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Yashavantrao Chavan Institute of Science, Satara', 48, 27)
    
    // Title in header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS & CONDITIONS', 105, 38, { align: 'center' })
    
    y = 60
    
    // Terms in two columns for better space usage
    const leftX = 20
    const rightX = 110
    const colWidth = 85
    
    // LEFT COLUMN
    // Term 1
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('1. PAYMENT TERMS', leftX, y)
    
    y += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term1 = doc.splitTextToSize('Payment is due within 30 days from the invoice date. Late payments may incur additional charges of 1.5% per month on the outstanding balance.', colWidth)
    doc.text(term1, leftX, y)
    
    // Term 2
    let y2 = y + (term1.length * 4) + 8
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('2. PAYMENT METHODS', leftX, y2)
    
    y2 += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term2 = doc.splitTextToSize('We accept payment via Bank Transfer, UPI, NEFT, RTGS, and Cheque. Please include the invoice number as payment reference.', colWidth)
    doc.text(term2, leftX, y2)
    
    // Term 3
    y2 = y2 + (term2.length * 4) + 8
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('3. SERVICES', leftX, y2)
    
    y2 += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term3 = doc.splitTextToSize('Services will be provided as per the agreed specifications. Any changes or modifications may result in additional charges.', colWidth)
    doc.text(term3, leftX, y2)
    
    // RIGHT COLUMN
    // Term 4
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('4. REFUND POLICY', rightX, y)
    
    y += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term4 = doc.splitTextToSize('Refunds are subject to our refund policy. Please contact our support team for refund requests within 7 days of service delivery.', colWidth)
    doc.text(term4, rightX, y)
    
    // Term 5
    let y3 = y + (term4.length * 4) + 8
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('5. SUPPORT', rightX, y3)
    
    y3 += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term5 = doc.splitTextToSize('Technical support is available 24/7 via email and phone. Response time may vary based on the service package.', colWidth)
    doc.text(term5, rightX, y3)
    
    // Term 6
    y3 = y3 + (term5.length * 4) + 8
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('6. GOVERNING LAW', rightX, y3)
    
    y3 += 5
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const term6 = doc.splitTextToSize('This invoice and all services are governed by the laws of India. Jurisdiction: Satara, Maharashtra.', colWidth)
    doc.text(term6, rightX, y3)
    
    // Contact section (compact)
    y = 170
    doc.setFillColor(245, 245, 245)
    doc.rect(20, y, 170, 18, 'F')
    
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('FOR ANY QUERIES, CONTACT US', 105, y + 7, { align: 'center' })
    
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Email: datacenter@ycis.ac.in | Phone: +91 8668428513', 105, y + 13, { align: 'center' })
    
    // Footer on both pages
    doc.setPage(1)
    addFooter(doc, 1, 2)
    
    doc.setPage(2)
    addFooter(doc, 2, 2)
    
    // Save
    doc.save(invoice.invoiceNumber + '.pdf')
    console.log('PDF downloaded successfully!')
    
  } catch (error) {
    console.error('PDF Generation Error:', error)
    throw error
  }
}

// Helper function to add footer to pages
const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height
  
  // Blue footer bar
  doc.setFillColor(37, 99, 235)
  doc.rect(0, pageHeight - 15, 210, 15, 'F')
  
  // Footer text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('YCIS Data & Technology Center | Satara, Maharashtra', 10, pageHeight - 8)
  
  // Page number
  doc.text('Page ' + pageNum + ' of ' + totalPages, 200, pageHeight - 8, { align: 'right' })
  
  // Generated date
  doc.setFontSize(7)
  doc.setTextColor(200, 200, 200)
  doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), 105, pageHeight - 4, { align: 'center' })
}

// Intern Student Letter PDF Generator
export interface InternStudentData {
  id: string
  name: string
  email: string
  branch: string
  passoutYear: number
  performance?: 'excellent' | 'good' | 'average' | 'bad'
}

export const generateInternLetterPDF = async (
  student: InternStudentData,
  letterType: 'offer' | 'completion' | 'experience',
  logoBase64?: string,
  experienceYears?: number
): Promise<Buffer> => {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    const primaryBlue: [number, number, number] = [37, 99, 235]
    const gray: [number, number, number] = [90, 90, 90]
    const gold: [number, number, number] = [255, 193, 7]

    // Simple header similar to invoice
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 0, pageWidth, 60, 'F')

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, 15, 30, 30)
      } catch {
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
        doc.circle(margin + 15, 30, 12, 'F')
      }
    } else {
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.circle(margin + 15, 30, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('YCIS', margin + 15, 33, { align: 'center' })
    }

    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('YCIS DATA & TECHNOLOGY CENTER', pageWidth / 2 + 10, 22, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text('Yashavantrao Chavan Institute of Science, Satara - 415001', pageWidth / 2 + 10, 30, { align: 'center' })
    doc.text('Phone: +91 8668428513 | Email: datacenter@ycis.ac.in', pageWidth / 2 + 10, 37, { align: 'center' })

    doc.setDrawColor(230, 230, 230)
    doc.line(margin, 70, pageWidth - margin, 70)

    // Title
    let y = 85
    const titles = {
      offer: 'Internship Offer Letter',
      completion: 'Internship Completion Certificate',
      experience: 'Experience Certificate'
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.text(titles[letterType], pageWidth / 2, y, { align: 'center' })

    y += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(gray[0], gray[1], gray[2])
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - margin, y, { align: 'right' })

    y += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Dear ${student.name},`, margin, y)

    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(40, 40, 40)
    
    let content = ''
    
    if (letterType === 'offer') {
      content = `We are pleased to offer you an internship at YCIS Data & Technology Center in the ${student.branch} department. The program will expose you to live projects, cloud platforms, and core data-center practices, helping you apply classroom learning to real infrastructure challenges.

We look forward to welcoming you to the team and supporting your professional growth throughout this internship.`
    } else if (letterType === 'completion') {
      content = `This is to certify that ${student.name} (${student.email}) has successfully completed the internship program at YCIS Data & Technology Center in the ${student.branch} department.

During the internship period, the student contributed to assigned projects, participated in reviews, and adhered to our quality and documentation standards. The exposure to production systems and guided mentoring has equipped the student with practical knowledge of IT operations.

We appreciate the dedication shown during the program and wish ${student.name} the very best for future academic and professional endeavours.`
    } else {
      const yearsText = experienceYears 
        ? experienceYears === 1 
          ? '1 year' 
          : `${experienceYears} years`
        : 'the internship period'
      
      content = `${student.name} (${student.email}) completed an internship with YCIS Data & Technology Center in the ${student.branch} department.

The internship involved daily interaction with our engineering team, working on live data-center tasks, and learning standard operating procedures for monitoring, troubleshooting, and deployment.

This letter certifies that ${student.name} has ${yearsText} of hands-on experience at YCIS Data & Technology Center. We trust that the skills acquired will support ${student.name}'s transition into industry roles.`
    }
    
    // Content with compact spacing
    const contentLines = doc.splitTextToSize(content, contentWidth - 6)
    let lineHeight = 5
    let currentY = y
    
    for (let i = 0; i < contentLines.length; i++) {
      // Check if we need a new page
      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = margin + 10
      }
      doc.text(contentLines[i], margin + 5, currentY)
      currentY += lineHeight
    }
    
    y = currentY + 15
    
    // Ensure we have enough space for signatures
    if (y > pageHeight - 50) {
      doc.addPage()
      y = margin + 10
    }
    
    // ==================== SIGNATURE SECTION ====================
    y += 10
    
    // Signature boxes with premium styling
    const sigLineWidth = 75
    const sigLineHeight = 12
    const leftX = margin
    const rightX = pageWidth - margin - sigLineWidth
    
    // Left signature line (Operational Manager)
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.5)
    doc.line(leftX, y + sigLineHeight, leftX + sigLineWidth, y + sigLineHeight)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.text('Operational Manager', leftX + sigLineWidth / 2, y + sigLineHeight + 6, { align: 'center' })
    
    // Right signature line (Data Center Coordinator)
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.5)
    doc.line(rightX, y + sigLineHeight, rightX + sigLineWidth, y + sigLineHeight)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.text('Data Center Coordinator', rightX + sigLineWidth / 2, y + sigLineHeight + 6, { align: 'center' })
    
    // ==================== PREMIUM FOOTER ====================
    // Footer background
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.rect(0, pageHeight - 22, pageWidth, 22, 'F')
    
    // Gold accent line
    doc.setFillColor(gold[0], gold[1], gold[2])
    doc.rect(0, pageHeight - 22, pageWidth, 2, 'F')
    
    // Footer content
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('YCIS Data & Technology Center', pageWidth / 2, pageHeight - 14, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Satara, Maharashtra - 415001 | Phone: +91 8668428513 | Email: datacenter@ycis.ac.in', pageWidth / 2, pageHeight - 8, { align: 'center' })
    
    doc.setFontSize(7)
    doc.setTextColor(220, 220, 220)
    const generatedText = `Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    doc.text(generatedText, pageWidth / 2, pageHeight - 3, { align: 'center' })
    
    // ==================== DECORATIVE BORDERS ====================
    // Outer decorative border
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setLineWidth(2.5)
    doc.rect(4, 4, pageWidth - 8, pageHeight - 8, 'D')
    
    // Inner decorative border (gold/yellow)
    doc.setDrawColor(gold[0], gold[1], gold[2])
    doc.setLineWidth(0.8)
    doc.rect(6.5, 6.5, pageWidth - 13, pageHeight - 13, 'D')
    
    // Convert to buffer
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error('Error generating intern letter PDF:', error)
    throw error
  }
}

