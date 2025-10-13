// Device authentication and management
export class DeviceAuth {
  constructor() {
    this.storageKey = "healthlab_device"
  }

  // Generate unique device ID
  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get or create device info
  getDeviceInfo() {
    if (typeof window === "undefined") return null

    const deviceInfo = localStorage.getItem(this.storageKey)
    if (deviceInfo) {
      return JSON.parse(deviceInfo)
    }

    // Create new device info
    const newDevice = {
      deviceId: this.generateDeviceId(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    }

    localStorage.setItem(this.storageKey, JSON.stringify(newDevice))
    return newDevice
  }

  // Register device with mobile number
  registerDevice(mobileNumber, role = "user") {
    const deviceInfo = this.getDeviceInfo()
    const updatedInfo = {
      ...deviceInfo,
      mobileNumber,
      role,
      registeredAt: Date.now(),
    }

    localStorage.setItem(this.storageKey, JSON.stringify(updatedInfo))
    return updatedInfo
  }

  // Update last active timestamp
  updateLastActive() {
    const deviceInfo = this.getDeviceInfo()
    if (deviceInfo) {
      deviceInfo.lastActive = Date.now()
      localStorage.setItem(this.storageKey, JSON.stringify(deviceInfo))
    }
  }

  // Check if device is registered
  isRegistered() {
    const deviceInfo = this.getDeviceInfo()
    return deviceInfo && deviceInfo.mobileNumber
  }

  // Get device role
  getRole() {
    const deviceInfo = this.getDeviceInfo()
    return deviceInfo?.role || "user"
  }

  // Logout
  logout() {
    localStorage.removeItem(this.storageKey)
  }
}
