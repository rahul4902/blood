// Simple WebRTC signaling using localStorage for demo
// In production, use WebSocket server or Firebase

export class SignalingService {
  constructor(deviceId) {
    this.deviceId = deviceId
    this.listeners = new Map()
    this.lastCheck = 0
  }

  // Send signal to specific device
  sendSignal(signal) {
    const signals = JSON.parse(localStorage.getItem("webrtc_signals") || "[]")
    signals.push({
      ...signal,
      timestamp: Date.now(),
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })

    // Keep only last 50 signals to prevent memory issues
    const recentSignals = signals.slice(-50)
    localStorage.setItem("webrtc_signals", JSON.stringify(recentSignals))

    // Trigger storage event for other tabs
    window.dispatchEvent(new Event("storage"))
  }

  // Listen for signals directed to this device
  onSignal(callback) {
    const handleStorage = () => {
      const signals = JSON.parse(localStorage.getItem("webrtc_signals") || "[]")
      const newSignals = signals.filter((s) => s.timestamp > this.lastCheck)

      if (newSignals.length > 0) {
        this.lastCheck = Date.now()
        newSignals.forEach(callback)
      }
    }

    window.addEventListener("storage", handleStorage)

    // Check immediately
    handleStorage()

    // Poll every 500ms for better responsiveness
    const interval = setInterval(handleStorage, 500)

    return () => {
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }

  // Clear old signals
  clearSignals() {
    localStorage.removeItem("webrtc_signals")
  }
}
