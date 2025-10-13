"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function VideoCallModal({ isOpen, onClose, isAudioOnly = false }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(isAudioOnly)
  const [callDuration, setCallDuration] = useState(0)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    let interval
    if (isOpen) {
      // Start call timer
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      // Request camera/microphone access
      if (!isAudioOnly) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            streamRef.current = stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream
            }
          })
          .catch((err) => {
            console.error("Error accessing media devices:", err)
          })
      }
    }

    return () => {
      if (interval) clearInterval(interval)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen, isAudioOnly])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    setCallDuration(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleEndCall}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary to-secondary h-[500px] flex flex-col">
          {/* Video/Audio Display */}
          <div className="flex-1 flex items-center justify-center relative">
            {!isAudioOnly && !isVideoOff ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl">
                  👨‍⚕️
                </div>
                <div className="text-center text-white">
                  <h3 className="text-xl font-semibold">Support Team</h3>
                  <p className="text-sm text-white/80 mt-1">{formatDuration(callDuration)}</p>
                </div>
              </div>
            )}

            {/* Call Duration Overlay */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-white text-sm font-medium">{formatDuration(callDuration)}</p>
            </div>

            {/* Connection Status */}
            <div className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full">
              <p className="text-white text-xs font-medium">Connected</p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="p-6 bg-black/30 backdrop-blur-md">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="secondary"
                className="w-14 h-14 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              {!isAudioOnly && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>
              )}

              <Button size="icon" variant="destructive" className="w-16 h-16 rounded-full" onClick={handleEndCall}>
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
