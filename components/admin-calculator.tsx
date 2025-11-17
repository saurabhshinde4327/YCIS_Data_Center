"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, X, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminCalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(display)
    } else if (operation) {
      const currentValue = previousValue || "0"
      const newValue = performCalculation(parseFloat(currentValue), inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperator)
  }

  const performCalculation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case "+":
        return prev + current
      case "-":
        return prev - current
      case "×":
        return prev * current
      case "÷":
        return current !== 0 ? prev / current : 0
      case "%":
        return prev % current
      default:
        return current
    }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = performCalculation(parseFloat(previousValue), inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }

  return (
    <>
      {/* Floating Calculator Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Calculator className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Card className="w-80 shadow-2xl border-2 border-blue-600 animate-fadeIn">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculator
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-gray-50">
              {/* Display */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4 shadow-inner">
                <div className="text-right">
                  <div className="text-xs text-gray-500 h-4">
                    {previousValue && operation && `${previousValue} ${operation}`}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 truncate">
                    {display}
                  </div>
                </div>
              </div>

              {/* Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="h-14 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  C
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackspace}
                  className="h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOperator("%")}
                  className="h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  %
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOperator("÷")}
                  className="h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  ÷
                </Button>

                {/* Row 2 */}
                <Button
                  variant="outline"
                  onClick={() => handleNumber("7")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  7
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("8")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  8
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("9")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  9
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOperator("×")}
                  className="h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  ×
                </Button>

                {/* Row 3 */}
                <Button
                  variant="outline"
                  onClick={() => handleNumber("4")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  4
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("5")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  5
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("6")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  6
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOperator("-")}
                  className="h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  -
                </Button>

                {/* Row 4 */}
                <Button
                  variant="outline"
                  onClick={() => handleNumber("1")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("2")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumber("3")}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOperator("+")}
                  className="h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  +
                </Button>

                {/* Row 5 */}
                <Button
                  variant="outline"
                  onClick={() => handleNumber("0")}
                  className="h-14 text-lg font-semibold col-span-2 hover:bg-gray-100"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecimal}
                  className="h-14 text-lg font-semibold hover:bg-gray-100"
                >
                  .
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEquals}
                  className="h-14 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white border-0"
                >
                  =
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

