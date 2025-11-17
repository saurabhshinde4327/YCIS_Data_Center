"use client"

import React from "react"
import Image from "next/image"
import { DataCenterPDFLayout } from "./datacenter-layout"

interface PDFTemplateProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showWatermark?: boolean
  className?: string
}

export function PDFTemplate({
  title,
  subtitle,
  children,
  showWatermark = true,
  className = ""
}: PDFTemplateProps) {
  return (
    <div className={`min-h-screen bg-white relative ${className}`}>
      {/* Watermark */}
      {showWatermark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="relative">
              <div className="h-32 w-32 relative">
                <Image
                  src="/datacenter.png"
                  alt="YCIS Data Center Logo"
                  fill
                  className="object-contain logo-color"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-blue-900 whitespace-nowrap">
                  YCIS DATA CENTER
                </p>
                <p className="text-lg text-gray-600 font-medium">
                  Satara
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <DataCenterPDFLayout />

      {/* Document Content */}
      <div className="relative z-10 px-8 py-6">
        {/* Document Title */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-blue-900 uppercase tracking-wide mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-700 font-semibold">
              {subtitle}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>Generated on: {new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <p className="font-semibold">YCIS Data Center</p>
              <p>Satara, Maharashtra, India</p>
            </div>
            <div className="text-right">
              <p>Page 1 of 1</p>
              <p>© {new Date().getFullYear()} YCIS Data Center</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Invoice/Report specific template
export function InvoiceTemplate({
  invoiceNumber,
  date,
  clientName,
  clientAddress,
  items,
  total,
  className = ""
}: {
  invoiceNumber: string
  date: string
  clientName: string
  clientAddress: string
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  total: number
  className?: string
}) {
  return (
    <PDFTemplate 
      title="Invoice" 
      subtitle={`Invoice #${invoiceNumber}`}
      className={className}
    >
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bill To */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Bill To:</h3>
          <p className="font-semibold">{clientName}</p>
          <p className="text-gray-600">{clientAddress}</p>
        </div>

        {/* Invoice Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Invoice Details:</h3>
          <p><span className="font-semibold">Invoice Number:</span> {invoiceNumber}</p>
          <p><span className="font-semibold">Date:</span> {date}</p>
          <p><span className="font-semibold">Due Date:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-center font-semibold">Quantity</th>
              <th className="px-4 py-3 text-right font-semibold">Rate</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">₹{item.rate.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">₹{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-bold text-lg">
                Total:
              </td>
              <td className="px-4 py-3 text-right font-bold text-lg text-blue-900">
                ₹{total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Terms */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-bold text-yellow-800 mb-2">Payment Terms:</h4>
        <p className="text-yellow-700">Payment is due within 30 days of invoice date. Late payments may incur additional charges.</p>
      </div>
    </PDFTemplate>
  )
}

// Report template for system reports
export function ReportTemplate({
  reportTitle,
  reportType,
  dateRange,
  data,
  className = ""
}: {
  reportTitle: string
  reportType: string
  dateRange: string
  data: any
  className?: string
}) {
  return (
    <PDFTemplate 
      title={reportTitle}
      subtitle={`${reportType} Report`}
      className={className}
    >
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Report Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Report Information:</h3>
          <p><span className="font-semibold">Report Type:</span> {reportType}</p>
          <p><span className="font-semibold">Date Range:</span> {dateRange}</p>
          <p><span className="font-semibold">Generated:</span> {new Date().toLocaleString()}</p>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Summary:</h3>
          <p><span className="font-semibold">Total Records:</span> {data?.length || 0}</p>
          <p><span className="font-semibold">Status:</span> Active</p>
        </div>
      </div>

      {/* Data Table */}
      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                {Object.keys(data[0]).map((key, index) => (
                  <th key={index} className="px-4 py-3 text-left font-semibold">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((row: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  {Object.values(row).map((value: any, cellIndex: number) => (
                    <td key={cellIndex} className="px-4 py-3">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2">Notes:</h4>
        <p className="text-blue-700">This report was generated automatically by the YCIS Data Center Management System.</p>
      </div>
    </PDFTemplate>
  )
}
