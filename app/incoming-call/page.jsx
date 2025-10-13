"use client"
import { Phone, PhoneOff } from "lucide-react"
import { useState, useEffect } from "react"
import { SignalingService } from "@/lib/signaling"
import { useRouter } from "next/navigation"

export default function IncomingCallPage() {
  const [incomingCall, setIncomingCall] = useState(null)
  const [isRinging, setIsRinging] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const signaling = new SignalingService()

    // Listen for incoming calls
    const unsubscribe = signaling.onSignal((signal) => {
      console.log("[v0] Support received signal:", signal)

      if (signal.type === "call-request" && signal.to === "support") {
        setIncomingCall(signal)
        setIsRinging(true)

        // Play ringtone (you can add actual audio)
        console.log("[v0] Incoming call from user")
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAcceptCall = () => {
    setIsRinging(false)
    // Navigate to chat with call modal open
    router.push("/chat?acceptCall=true&callType=" + incomingCall.callType)
  }

  const handleRejectCall = () => {
    setIsRinging(false)
    setIncomingCall(null)

    const signaling = new SignalingService()
    signaling.sendSignal({
      type: "call-rejected",
      from: "support",
      to: "user",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {isRinging && incomingCall ? (
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            {/* Caller Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6 text-6xl animate-pulse">
              👤
            </div>

            {/* Caller Info */}
            <h2 className="text-2xl font-bold text-foreground mb-2">User Calling...</h2>
            <p className="text-muted-foreground mb-2">
              {incomingCall.callType === "video" ? "Video Call" : "Audio Call"}
            </p>
            <p className="text-sm text-muted-foreground mb-8">Incoming call from chat support</p>

            {/* Ringing Animation */}
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>

            {/* Call Actions */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={handleRejectCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-all hover:scale-110 animate-pulse"
              >
                <Phone className="w-10 h-10 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-5xl">
              📞
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Waiting for Calls</h2>
            <p className="text-muted-foreground">You will be notified when a user calls</p>
          </div>
        )}
      </div>
    </div>
  )
}
