// Generate 1000+ mock chat messages with different dates and times
export function generateMockMessages() {
  const messages = []
  const now = new Date()

  const userMessages = [
    "Hi, I need help with booking a test",
    "What are your timings?",
    "Can you help me with home collection?",
    "I want to book a Complete Health Checkup",
    "What tests do you recommend for diabetes?",
    "How much does the Thyroid test cost?",
    "Can I get reports online?",
    "Is fasting required for liver function test?",
    "Do you provide home visit service?",
    "What is the discount on packages?",
    "I need to reschedule my appointment",
    "How accurate are your test results?",
    "Can I book for my family members?",
    "What payment methods do you accept?",
    "How long does sample collection take?",
    "Are your labs certified?",
    "I have a question about my report",
    "Can I download my previous reports?",
    "What is included in the Full Body Checkup?",
    "Do you have any offers running?",
  ]

  const supportMessages = [
    "Hello! How can I assist you today?",
    "Sure, I'd be happy to help you with that.",
    "Our home collection service is completely free for orders above ₹999.",
    "Yes, we provide certified lab reports within 24-48 hours.",
    "You can book tests for your entire family from our app.",
    "We accept all major payment methods including UPI, cards, and wallets.",
    "Our phlebotomists are trained professionals and follow all safety protocols.",
    "You can download all your reports from the Reports section in the app.",
    "We currently have 40% off on all health packages.",
    "Fasting is required for certain tests. I can check that for you.",
    "Our labs are NABL certified and we ensure 100% accuracy.",
    "Sample collection usually takes 5-10 minutes.",
    "Yes, you can reschedule your appointment up to 2 hours before the scheduled time.",
    "All reports are available in the app and can be shared with your doctor.",
    "We operate from 6 AM to 8 PM every day.",
    "The Complete Health Checkup includes 65+ parameters covering all major organs.",
    "For diabetes, I recommend our Diabetes Care Package which includes HbA1c, FBS, and more.",
    "You can track your order status in real-time from the Orders section.",
    "We also offer video consultation with doctors if needed.",
    "Is there anything else I can help you with?",
  ]

  let messageId = 1

  // Generate messages for the last 90 days
  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const messagesPerDay = Math.floor(Math.random() * 15) + 5 // 5-20 messages per day

    for (let i = 0; i < messagesPerDay; i++) {
      const messageDate = new Date(now)
      messageDate.setDate(messageDate.getDate() - daysAgo)
      messageDate.setHours(Math.floor(Math.random() * 14) + 6) // 6 AM to 8 PM
      messageDate.setMinutes(Math.floor(Math.random() * 60))

      // User message
      messages.push({
        id: messageId++,
        text: userMessages[Math.floor(Math.random() * userMessages.length)],
        sender: "user",
        timestamp: messageDate.getTime(),
        time: messageDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        date: messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      })

      // Support response (80% chance)
      if (Math.random() > 0.2) {
        const responseDate = new Date(messageDate.getTime() + Math.random() * 300000) // 0-5 min delay
        messages.push({
          id: messageId++,
          text: supportMessages[Math.floor(Math.random() * supportMessages.length)],
          sender: "support",
          timestamp: responseDate.getTime(),
          time: responseDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: responseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          avatar: "👨‍⚕️",
        })
      }
    }
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp)
}

export const allMessages = generateMockMessages()
