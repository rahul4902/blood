"use client"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Loader2,
  X,
  FileText,
  Mic,
  MicOff,
  VideoOffIcon,
  PhoneOff,
} from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { allMessages } from "@/lib/chat-data"
import { SignalingService } from "@/lib/signaling"
import { DeviceAuth } from "@/lib/device-auth"
import { useSearchParams } from "next/navigation"

export default function ChatPage() {
  const MESSAGES_PER_PAGE = 10
  const [displayedMessages, setDisplayedMessages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasReceivedFirstReply, setHasReceivedFirstReply] = useState(true)
  const [attachedFile, setAttachedFile] = useState(null)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [callType, setCallType] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const [userIsScrolling, setUserIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef(null)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const auth = new DeviceAuth()
    const info = auth.getDeviceInfo()
    setDeviceInfo(info)

    // Check if accepting call from incoming call page
    const acceptCall = searchParams.get("acceptCall")
    const callTypeParam = searchParams.get("callType")
    if (acceptCall === "true" && callTypeParam) {
      setCallType(callTypeParam)
      setIsCallModalOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    loadInitialMessages()
  }, [])

  const loadInitialMessages = () => {
    const startIndex = Math.max(0, allMessages.length - MESSAGES_PER_PAGE)
    const initialMessages = allMessages.slice(startIndex)
    setDisplayedMessages(initialMessages)
    setCurrentPage(1)
    setHasMore(startIndex > 0)

    // Scroll to bottom after messages load
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
  }

  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const container = messagesContainerRef.current
    const previousScrollHeight = container?.scrollHeight || 0
    const previousScrollTop = container?.scrollTop || 0

    setTimeout(() => {
      const totalLoaded = currentPage * MESSAGES_PER_PAGE
      const startIndex = Math.max(0, allMessages.length - totalLoaded - MESSAGES_PER_PAGE)
      const endIndex = allMessages.length - totalLoaded
      const olderMessages = allMessages.slice(startIndex, endIndex)

      setDisplayedMessages((prev) => [...olderMessages, ...prev])
      setCurrentPage((prev) => prev + 1)
      setHasMore(startIndex > 0)
      setIsLoadingMore(false)

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight)
        }
      }, 0)
    }, 500)
  }, [currentPage, hasMore, isLoadingMore])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      setUserIsScrolling(!isNearBottom)

      // Load more when scrolling near top
      if (scrollTop < 200 && hasMore && !isLoadingMore) {
        loadMoreMessages()
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollHeight - scrollTop - clientHeight < 100) {
          setUserIsScrolling(false)
        }
      }, 1000)
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [hasMore, isLoadingMore, loadMoreMessages])

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (!userIsScrolling) {
      scrollToBottom()
    }
  }, [displayedMessages.length, userIsScrolling])

  const quickReplies = ["Book a test", "View packages", "Track order", "Home visit"]

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
    }
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() || attachedFile) {
      const newMessage = {
        id: Date.now(),
        text: inputMessage || "",
        sender: "user",
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        file: attachedFile
          ? {
              name: attachedFile.name,
              size: attachedFile.size,
              type: attachedFile.type,
            }
          : null,
      }
      setDisplayedMessages((prev) => [...prev, newMessage])
      setInputMessage("")
      setAttachedFile(null)
      setUserIsScrolling(false)

      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const replyText = !hasReceivedFirstReply
          ? "Thank you for your message. Our team will assist you shortly."
          : "I'm here to help! Let me check that for you."

        const supportMessage = {
          id: Date.now() + 1,
          text: replyText,
          sender: "support",
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          avatar: "👨‍⚕️",
        }
        setDisplayedMessages((prev) => [...prev, supportMessage])
        setHasReceivedFirstReply(true)
      }, 2000)
    }
  }

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
  }

  const handleStartCall = (type) => {
    setCallType(type)
    setIsCallModalOpen(true)

    const signaling = new SignalingService(deviceInfo?.deviceId)
    signaling.sendSignal({
      type: "call-request",
      callType: type,
      from: deviceInfo?.deviceId || "user",
      to: "support",
      fromRole: "user",
    })
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach((msg) => {
      const date = msg.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(msg)
    })
    return groups
  }

  const messageGroups = groupMessagesByDate(displayedMessages)

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name
    const ext = name.split(".").pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."))
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4)
    return `${truncated}...${ext}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Custom Chat Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-secondary text-white shadow-md">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                👨‍⚕️
              </div>
              <div>
                <h2 className="font-semibold">Support Team</h2>
                <p className="text-xs text-white/80">Online • Typically replies instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleStartCall("audio")}
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleStartCall("video")}
              >
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto max-w-md mx-auto w-full scrollbar-hide md:scrollbar-default"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="p-4 space-y-4">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center my-4">
                <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">{date}</span>
              </div>

              {/* Messages for this date */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {message.sender === "support" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                        {message.avatar}
                      </div>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.sender === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-card border border-border rounded-bl-sm"
                        }`}
                      >
                        {message.file && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{truncateFileName(message.file.name)}</p>
                              <p className="text-xs opacity-70">{formatFileSize(message.file.size)}</p>
                            </div>
                          </div>
                        )}
                        {message.text && <p className="text-sm">{message.text}</p>}
                      </div>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${message.sender === "user" ? "text-right" : ""}`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                  👨‍⚕️
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="rounded-full text-xs bg-transparent"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      </main>

      {attachedFile && (
        <div className="sticky bottom-16 bg-muted border-t border-border">
          <div className="max-w-md mx-auto p-2">
            <div className="flex items-center gap-2 bg-background rounded-lg p-2">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachedFile.size)}</p>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setAttachedFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-16 bg-background border-t border-border">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!inputMessage.trim() && !attachedFile}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {isCallModalOpen && (
        <CallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          callType={callType}
          role="user"
          deviceId={deviceInfo?.deviceId}
        />
      )}

      <MobileNav />
    </div>
  )
}

function CallModal({ isOpen, onClose, callType, role, deviceId }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio")
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState("connecting")
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const signalingRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    initializeCall()

    return () => {
      clearInterval(interval)
      cleanup()
    }
  }, [isOpen])

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      })

      localStreamRef.current = stream
      if (localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = stream
      }

      signalingRef.current = new SignalingService(deviceId)
      setupPeerConnection(stream)
      signalingRef.current.onSignal(handleSignal)

      setTimeout(() => {
        setCallStatus("connected")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error initializing call:", err)
      alert("Could not access camera/microphone")
      onClose()
    }
  }

  const setupPeerConnection = (stream) => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }

    peerConnectionRef.current = new RTCPeerConnection(configuration)

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream)
    })

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && signalingRef.current) {
        signalingRef.current.sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
          from: role,
          fromDevice: deviceId,
        })
      }
    }
  }

  const handleSignal = async (signal) => {
    if (signal.type === "offer" && role === "support") {
      await peerConnectionRef.current.setRemoteDescription(signal.offer)
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)

      signalingRef.current.sendSignal({
        type: "answer",
        answer: answer,
        from: role,
        fromDevice: deviceId,
      })
    } else if (signal.type === "answer" && role === "user") {
      await peerConnectionRef.current.setRemoteDescription(signal.answer)
    } else if (signal.type === "ice-candidate") {
      await peerConnectionRef.current.addIceCandidate(signal.candidate)
    } else if (signal.type === "call-end") {
      handleEndCall()
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const handleEndCall = () => {
    if (signalingRef.current) {
      signalingRef.current.sendSignal({
        type: "call-end",
        from: role,
        fromDevice: deviceId,
      })
    }
    cleanup()
    setCallDuration(0)
    setCallStatus("ended")
    onClose()
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[600px] bg-gradient-to-br from-primary to-secondary rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          {callType === "video" && !isVideoOff ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 w-24 h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl mb-4">
                👨‍⚕️
              </div>
              <h3 className="text-xl font-semibold text-white">Support Team</h3>
              <p className="text-sm text-white/80 mt-2">{formatDuration(callDuration)}</p>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white text-sm font-medium">
              {callStatus === "connecting" ? "Connecting..." : formatDuration(callDuration)}
            </p>
          </div>

          {callStatus === "connected" && (
            <div className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full">
              <p className="text-white text-xs font-medium">Connected</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/30 backdrop-blur-md">
          <div className="flex items-center justify-center gap-4">
            <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full" onClick={toggleMute}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {callType === "video" && (
              <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full" onClick={toggleVideo}>
                {isVideoOff ? <VideoOffIcon className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>
            )}

            <Button size="icon" variant="destructive" className="w-16 h-16 rounded-full" onClick={handleEndCall}>
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
