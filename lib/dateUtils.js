// lib/dateUtils.js

/**
 * Convert MongoDB ISODate to 12-hour format display
 * @param {string} isoString - MongoDB ISODate string
 * @returns {string} Formatted time like "09:00 AM"
 */
export const formatTo12Hour = (isoString) => {
    const date = new Date(isoString)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12 || 12
    const minutesStr = minutes.toString().padStart(2, '0')
    
    return `${hours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`
  }
  
  /**
   * Format time range from start and end ISO dates
   * @param {string} startISO - Start time ISO string
   * @param {string} endISO - End time ISO string
   * @returns {string} Formatted range like "09:00 AM - 10:00 AM"
   */
  export const formatTimeRange = (startISO, endISO) => {
    return `${formatTo12Hour(startISO)} - ${formatTo12Hour(endISO)}`
  }
  
  /**
   * Format date for display
   * @param {string} isoString - ISO date string
   * @returns {string} Formatted date like "Monday, 15 October 2025"
   */
  export const formatDateDisplay = (isoString) => {
    const date = new Date(isoString)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"]
    
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  /**
   * Get short day name
   * @param {string} isoString - ISO date string
   * @returns {string} Short day like "Mon"
   */
  export const getShortDay = (isoString) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return dayNames[new Date(isoString).getDay()]
  }
  
  /**
   * Get day number
   * @param {string} isoString - ISO date string
   * @returns {number} Day number
   */
  export const getDayNumber = (isoString) => {
    return new Date(isoString).getDate()
  }
  
  /**
   * Get month and year display
   * @param {string} isoString - ISO date string
   * @returns {string} Formatted month year like "October 2025"
   */
  export const getMonthYear = (isoString) => {
    const date = new Date(isoString)
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"]
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  /**
   * Get month and year values
   * @param {string} isoString - ISO date string
   * @returns {Object} Object with year and month
   */
  export const getYearMonth = (isoString) => {
    const date = new Date(isoString)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1 // MongoDB uses 1-12
    }
  }
  
  /**
   * Check if two dates are in the same month
   * @param {string} date1ISO - First date ISO string
   * @param {string} date2ISO - Second date ISO string
   * @returns {boolean}
   */
  export const isSameMonth = (date1ISO, date2ISO) => {
    const d1 = new Date(date1ISO)
    const d2 = new Date(date2ISO)
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  }
  