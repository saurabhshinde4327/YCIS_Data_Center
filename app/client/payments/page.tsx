"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  CreditCard,
  Construction,
  Clock
} from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Online Payment"
            subtitle="Make secure payments for your services"
          />
        </div>

        {/* Under Construction Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <Construction className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-bounce">
                  <Clock className="h-5 w-5 text-yellow-900" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Under Construction
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              We're working hard to bring you a seamless online payment experience!
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-3">Coming Soon</h3>
              <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Multiple payment methods (UPI, Cards, Net Banking)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Secure payment gateway integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Instant payment confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Transaction history and receipts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Automated invoice generation
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">In the meantime:</h4>
              <p className="text-sm text-gray-700 mb-2">
                For payment inquiries, please contact our support team
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="font-medium">+91 8668428513</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span className="font-medium">datacenter@ycis.ac.in</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Expected launch: Coming Soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
