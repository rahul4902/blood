export const transformTestData = (apiData, type = 'test') => {
  if (!apiData) return null

  return {
    ...apiData,
    type: type,

    // Transform price fields - use offer_price as primary display price
    price: apiData.offer_price || apiData.package_price || apiData.mrp,
    mrp: apiData.mrp,
    discount: apiData.discount || 0,

    // Transform also_known_as from comma-separated string to array
    alsoKnownAs: apiData.also_known_as
      ? apiData.also_known_as.split(',').map(name => name.trim()).filter(Boolean)
      : [],

    // Transform text_criteria to testCriteria with proper structure
    testCriteria: apiData.text_criteria?.map(item => ({
      question: item.question,
      answer: Array.isArray(item.answer?.list)
        ? item.answer.list
        : (item.answer?.faq ? [item.answer.faq] : [])
    })) || [],

    // Transform parameters array to detailed parameterDetails structure
    parameterDetails: Array.isArray(apiData.parameters)
      ? apiData.parameters.map(param => ({
        name: param.name,
        description: param.description || '',
        normalRange: param.normalRange || '',
        unit: param.unit || ''
      }))
      : [],

    // Get total parameter count
    parameters: apiData.parameters?.length || 0,

    // Transform qna to faqs format
    faqs: apiData.qna?.map(item => ({
      question: item.question,
      answer: item.answer
    })) || [],

    // Transform specimen_instructions string to instructions array
    instructions: apiData.specimen_instructions
      ? [apiData.specimen_instructions]
      : [],

    // Extract first sample type from sampleTypes array
    sampleType: apiData.sampleTypes?.[0]?.name || 'Blood',

    // Map fasting_time to fasting
    fasting: apiData.fasting_time || 'Not Required',

    // Map tat_time (turn around time)
    tat_time: apiData.tat_time || '24 hrs',

    // NEW: Map recommended_gender to gender field
    gender: apiData.recommended_gender || apiData.gender || 'Both',

    // NEW: Map recommended_age to ageGroup field
    ageGroup: apiData.recommended_age || apiData.ageGroup || apiData.age_group || 'All Ages',

    // Calculate recent bookings from various booking count fields
    recentBookings: apiData.one_mth_bkg_cnt || apiData.booking_count || 0,

    // Determine if test/package is top selling based on flags
    topSelling: apiData.isPopular || apiData.isFeatured || apiData.top_packages || false,

    // Map testsCount for packages
    testsCount: apiData.tests?.length || 0,

    // Keep included tests array for packages
    includedTests: apiData.tests || []
  }
}