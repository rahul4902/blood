// app/api/slots/route.js
import { NextResponse } from 'next/server'

/**
 * GET /api/slots?year=2025&month=10
 * Fetch availability slots for a specific month
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const year = parseInt(searchParams.get('year'))
        const month = parseInt(searchParams.get('month'))

        if (!year || !month || month < 1 || month > 12) {
            return NextResponse.json(
                { error: 'Invalid year or month parameter' },
                { status: 400 }
            )
        }

        // Generate mock data (replace with actual MongoDB query)
        const monthData = generateMonthSlotData(year, month)

        return NextResponse.json({
            success: true,
            data: monthData
        })
    } catch (error) {
        console.error('Error fetching slots:', error)
        return NextResponse.json(
            { error: 'Failed to fetch slots' },
            { status: 500 }
        )
    }
}

/**
 * Generate mock slot data for a month
 * In production, replace this with MongoDB query
 */
function generateMonthSlotData(year, month) {
    const monthData = {
        _id: `${year}-${String(month).padStart(2, '0')}`,
        year: year,
        month: month,
        dates: []
    }

    const daysInMonth = new Date(year, month, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day)
        const dayOfWeek = date.getDay()

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

function generateDaySlots(year, month, day, dayOfWeek) {
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
