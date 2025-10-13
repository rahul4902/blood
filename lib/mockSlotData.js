// lib/mockSlotData.js - Updated with multiple months support

/**
 * Generate mock data for a specific month
 */
export const generateMonthSlotData = (year, month) => {
    const monthData = {
      _id: `${year}-${String(month).padStart(2, '0')}`,
      year: year,
      month: month,
      dates: []
    }
  
    const daysInMonth = new Date(year, month, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dateISOString = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      // Determine if date is available
      const isEvery5th = day % 5 === 0
      const isRandomSunday = dayOfWeek === 0 && Math.random() > 0.5
      const isAvailable = !isEvery5th && !isRandomSunday
      
      const dateSlots = {
        date: new Date(year, month - 1, day, 0, 0, 0, 0).toISOString(),
        dayOfWeek: dayOfWeek,
        isAvailable: isAvailable,
        slots: isAvailable ? generateDaySlots(year, month - 1, day, dayOfWeek) : []
      }
      
      monthData.dates.push(dateSlots)
    }
    
    return monthData
  }
  
  /**
   * Generate time slots for a specific day
   */
  const generateDaySlots = (year, month, day, dayOfWeek) => {
    const slots = []
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    const slotConfig = isWeekend ? {
      Morning: [8, 9, 10, 11],
      Afternoon: [12, 13, 14],
      Evening: [16, 17, 18]
    } : {
      Morning: [6, 7, 8, 9, 10, 11],
      Afternoon: [12, 13, 14, 15],
      Evening: [16, 17, 18, 19],
      Night: [20, 21, 22]
    }
    
    Object.entries(slotConfig).forEach(([period, hours]) => {
      hours.forEach(hour => {
        const startTime = new Date(year, month, day, hour, 0, 0, 0)
        const endTime = new Date(year, month, day, hour + 1, 0, 0, 0)
        
        const shouldDisableSome = day % 3 === 0 && [6, 9, 14, 20].includes(hour)
        const shouldDisableOther = day % 7 === 0 && [11, 13, 17].includes(hour)
        
        slots.push({
          slotId: `${startTime.toISOString().split('.')[0]}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isBooked: false,
          isDisabled: shouldDisableSome || shouldDisableOther,
          period: period
        })
      })
    })
    
    return slots
  }
  
  /**
   * Simulates API call to fetch month data
   */
  export const fetchMonthAvailability = async (year, month) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMonthSlotData(year, month)
  }
  