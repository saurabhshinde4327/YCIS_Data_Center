"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, ArrowLeft, User, Send } from "lucide-react"

interface ChatMessage {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  message: string
  sender: 'client' | 'admin'
  senderName?: string
  isRead: boolean
  createdAt: string
}

interface ClientChat {
  clientName: string
  clientEmail: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export function AdminWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [clientChats, setClientChats] = useState<ClientChat[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedClientInfo, setSelectedClientInfo] = useState<{ name: string; email: string } | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchChatClients()
      if (selectedClient) {
        fetchMessages()
        // Poll for new messages every 2 seconds
        const interval = setInterval(fetchMessages, 2000)
        return () => clearInterval(interval)
      }
    }
  }, [isOpen, selectedClient])

  const fetchChatClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chat/clients')
      if (response.ok) {
        const clients = await response.json()
        setClientChats(clients)
      }
    } catch (error) {
      console.error('Error fetching chat clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedClient) return
    
    try {
      const response = await fetch(`/api/chat?clientEmail=${encodeURIComponent(selectedClient)}`)
      if (response.ok) {
        const messages = await response.json()
        setChatMessages(messages)
        
        // Mark messages as read
        if (messages.some((m: ChatMessage) => m.sender === 'client' && !m.isRead)) {
          await fetch('/api/chat/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientEmail: selectedClient })
          })
          fetchChatClients() // Refresh client list to update unread count
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleClientClick = (clientEmail: string, clientName: string) => {
    setSelectedClient(clientEmail)
    setSelectedClientInfo({ name: clientName, email: clientEmail })
    setReplyMessage("")
  }

  const handleBack = () => {
    setSelectedClient(null)
    setSelectedClientInfo(null)
    setChatMessages([])
    setReplyMessage("")
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedClient || !selectedClientInfo) return

    setSending(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          clientName: selectedClientInfo.name,
          clientEmail: selectedClient,
          message: replyMessage,
          sender: 'admin',
          senderName: 'Admin'
        })
      })

      if (response.ok) {
        setReplyMessage("")
        await fetchMessages()
        await fetchChatClients()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const totalUnread = clientChats.reduce((sum, chat) => sum + chat.unreadCount, 0)

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-24 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 relative"
            title="Client Chat"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalUnread}
              </span>
            )}
          </Button>
        ) : (
          <Card className="w-80 sm:w-96 shadow-2xl border-2 border-green-500 animate-fadeIn">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {selectedClient && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <MessageCircle className="h-5 w-5" />
                  {selectedClient ? 'Chat' : 'Client Chat'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    setSelectedClient(null)
                    setSelectedClientInfo(null)
                  }}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-gray-100">
              {!selectedClient ? (
                // Client List View
                <div className="h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : clientChats.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 text-sm">No messages yet</p>
                      <p className="text-gray-500 text-xs mt-1">Client messages will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {clientChats.map((chat) => (
                        <div
                          key={chat.clientEmail}
                          onClick={() => handleClientClick(chat.clientEmail, chat.clientName)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">
                                  {chat.clientName}
                                </h4>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {getTimeAgo(chat.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">
                                {chat.clientEmail}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {chat.lastMessage}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge className="bg-green-500 text-white text-xs mt-2">
                                  {chat.unreadCount} new
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Chat Messages View
                <div className="flex flex-col h-[500px]">
                  {/* Client Info Header */}
                  <div className="bg-white border-b border-gray-200 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {selectedClientInfo?.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {selectedClient}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600">No messages yet</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 shadow ${
                              msg.sender === 'admin'
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
                  </div>

                  {/* Reply Input */}
                  <div className="bg-white border-t border-gray-200 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !sending) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                        placeholder="Type a reply..."
                        className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sending}
                        className="bg-green-500 hover:bg-green-600 text-white px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
