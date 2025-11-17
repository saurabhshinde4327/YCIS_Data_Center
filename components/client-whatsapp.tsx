"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, CheckCircle } from "lucide-react"

interface ChatMessage {
  id: string
  message: string
  sender: 'client' | 'admin'
  senderName?: string
  createdAt: string
}

export function ClientWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [clientInfo, setClientInfo] = useState<{ name: string; email: string; id: string } | null>(null)

  useEffect(() => {
    // Get client info from session storage
    const clientData = sessionStorage.getItem("client")
    if (clientData) {
      try {
        const parsed = JSON.parse(clientData)
        setClientInfo({
          name: parsed.name || "Guest",
          email: parsed.email || "",
          id: parsed.id || parsed.email || "guest"
        })
      } catch (e) {
        console.error('Error parsing client data:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen && clientInfo) {
      fetchMessages()
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, clientInfo])

  const fetchMessages = async () => {
    if (!clientInfo?.email) return
    
    try {
      const response = await fetch(`/api/chat?clientEmail=${encodeURIComponent(clientInfo.email)}`)
      if (response.ok) {
        const messages = await response.json()
        setChatMessages(messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const quickMessages = [
    "Hello, I need support with my service.",
    "I would like to inquire about upgrading my package.",
    "I have a question about my invoice."
  ]

  const handleQuickMessage = async (text: string) => {
    await sendMessageToSupport(text)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    await sendMessageToSupport(message)
  }

  const sendMessageToSupport = async (text: string) => {
    if (!clientInfo) {
      alert('Please sign in to send messages')
      return
    }

    setSending(true)

    try {
      // Send message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientInfo.id,
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          message: text,
          sender: 'client'
        })
      })

      if (response.ok) {
        setMessage("")
        // Fetch updated messages
        await fetchMessages()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !sending) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="Chat with us on WhatsApp"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Card className="w-80 sm:w-96 shadow-2xl border-2 border-green-500 animate-fadeIn">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Chat
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-gray-100">
              {/* Chat Messages Area */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 shadow ${
                          msg.sender === 'client'
                            ? 'bg-[#dcf8c6] text-gray-900'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {msg.sender === 'admin' && msg.senderName && (
                          <p className="text-[10px] text-gray-600 font-semibold mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg px-3 py-2 shadow">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        <p className="text-xs text-gray-500">Sending...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Messages */}
              <div className="bg-white border-t border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick Messages:</p>
                <div className="space-y-2">
                  {quickMessages.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickMessage(msg)}
                      className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors border border-gray-300"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Area */}
              <div className="bg-white p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className="bg-green-500 hover:bg-green-600 text-white px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
