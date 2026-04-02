'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildProgramWeekOptions,
  defaultAdminConfig,
  formatWeekLabel,
  getSelectedWeeks,
  resolveBootcampTuition,
} from '../../lib/campAdmin'
import { buildRegistrationSummaryDocument } from '../../lib/registrationSummaryDocument'
import { buildRosterSummaryPdfBase64 } from '../../lib/rosterSummaryPdf'
import {
  fetchAdminConfigFromSupabase,
  filterSelectedWeeksByDateWindow,
  saveAdminConfigToSupabase,
} from '../../lib/campAdminApi'
import {
  buildLeadJourneyMessage,
  buildPaidEnrollmentJourneyMessage,
  PAYMENT_METHODS_TEXT,
  buildReservationJourneyMessage,
} from '../../lib/emailJourneyRenderer'
import { getWeekTierPromoDisplayLines, getWeekTierPromoForStudent } from '../../lib/campPricing'
import {
  getMediaBucketName,
  listMediaLibrary,
  uploadFilesToMediaBucket,
} from '../../lib/mediaLibraryApi'
import { supabase, supabaseEnabled } from '../../lib/supabase'

const programMeta = {
  general: {
    title: 'General Camp',
    rhythm: 'Auto-generated Monday to Friday weeks',
  },
  bootcamp: {
    title: 'Competition Team Boot Camp',
    rhythm: 'Auto-generated Monday to Friday weeks',
  },
  overnight: {
    title: 'Overnight Camp',
    rhythm: 'Auto-generated Sunday to Saturday 7-day weeks',
  },
}

const rosterProgramMeta = {
  general: {
    title: 'General Camp',
    exportTitle: 'General Camp Weekly Roster',
    emptyText: 'No general camp campers registered for this week yet.',
    accentColor: [0.902, 0.933, 0.976],
  },
  bootcamp: {
    title: 'Competition Team Boot Camp',
    exportTitle: 'Competition Team Boot Camp Weekly Roster',
    emptyText: 'No boot camp campers registered for this week yet.',
    accentColor: [0.992, 0.941, 0.882],
  },
  overnight: {
    title: 'Overnight Camp',
    exportTitle: 'Overnight Camp Weekly Roster',
    emptyText: 'No overnight campers registered for this week yet.',
    accentColor: [0.878, 0.969, 0.949],
  },
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function roundUpToFive(value) {
  const next = Math.round(Number(value || 0) / 5) * 5
  return Number.isFinite(next) ? Math.max(0, next) : 0
}

function discountAmount(regular, discountedPrice) {
  return Math.max(0, Number(regular || 0) - Number(discountedPrice || 0))
}

function buildBootcampChecks(tuition) {
  const general = tuition?.regular || {}
  const generalDiscount = tuition?.discount || {}
  const bootcamp = resolveBootcampTuition(tuition)

  const buildLine = (generalValue, bootcampValue, label) => {
    const generalPrice = Number(generalValue || 0)
    const bootcampPrice = Number(bootcampValue || 0)
    const pass = generalPrice <= 0 || bootcampPrice > generalPrice
    return {
      pass,
      line: `${label}: ${money(bootcampPrice)} vs General ${money(generalPrice)}`,
      fixText: pass ? '' : `Set Boot Camp above General for ${label.toLowerCase()}.`,
    }
  }

  return {
    fullWeek: [
      buildLine(general.fullWeek, bootcamp.regular.fullWeek, 'Regular Full Week'),
      buildLine(generalDiscount.fullWeek, bootcamp.discount.fullWeek, 'Discounted Full Week'),
    ],
    fullDay: [
      buildLine(general.fullDay, bootcamp.regular.fullDay, 'Regular Full Day'),
      buildLine(generalDiscount.fullDay, bootcamp.discount.fullDay, 'Discounted Full Day'),
    ],
    amHalf: [
      buildLine(general.amHalf, bootcamp.regular.amHalf, 'Regular AM Half Day'),
      buildLine(generalDiscount.amHalf, bootcamp.discount.amHalf, 'Discounted AM Half Day'),
    ],
    pmHalf: [
      buildLine(general.pmHalf, bootcamp.regular.pmHalf, 'Regular PM Half Day'),
      buildLine(generalDiscount.pmHalf, bootcamp.discount.pmHalf, 'Discounted PM Half Day'),
    ],
  }
}

function buildTuitionChecks(tuition) {
  const regular = tuition.regular
  const discounted = tuition.discount

  function evaluateRule(label, baselineValue, unitPrice, unitCount, multiplier) {
    const baseline = Number(baselineValue || 0)
    const actualTotal = Number(unitPrice || 0) * unitCount
    const targetTotal = baseline > 0 ? roundUpToFive(baseline * multiplier) : 0
    const targetUnit = baseline > 0 ? roundUpToFive(targetTotal / unitCount) : 0
    const deficitTotal = Math.max(0, targetTotal - actualTotal)
    const deficitUnit = deficitTotal > 0 ? roundUpToFive(deficitTotal / unitCount) : 0
    const pass = baseline > 0 ? actualTotal >= targetTotal : true

    return {
      pass,
      line: `${label}: ${money(actualTotal)} vs target ${money(targetTotal)} (${money(targetUnit)} per day)`,
      raiseText: pass ? '' : `Raise by ${money(deficitTotal)} total (about +${money(deficitUnit)}/day)`,
    }
  }

  const regularFullDay = evaluateRule('Regular Full Day x5', regular.fullWeek, regular.fullDay, 5, 1.15)
  const discountFullDay = evaluateRule('Discounted Full Day x5', discounted.fullWeek, discounted.fullDay, 5, 1.15)
  const regularAM = evaluateRule('Regular AM x5', regular.fullWeek, regular.amHalf, 5, 0.65)
  const discountAM = evaluateRule('Discounted AM x5', discounted.fullWeek, discounted.amHalf, 5, 0.65)
  const regularPM = evaluateRule('Regular PM x5', regular.fullWeek, regular.pmHalf, 5, 0.75)
  const discountPM = evaluateRule('Discounted PM x5', discounted.fullWeek, discounted.pmHalf, 5, 0.75)
  const regularOvernight = evaluateRule(
    'Regular Overnight Day x7',
    regular.overnightWeek,
    regular.overnightDay,
    7,
    1.35
  )
  const discountOvernight = evaluateRule(
    'Discounted Overnight Day x7',
    discounted.overnightWeek,
    discounted.overnightDay,
    7,
    1.35
  )

  return {
    fullWeek: {
      pass: true,
      lines: ['Baseline row. Set Full Week first, then optimize all other rows against it.'],
      raises: [],
    },
    fullDay: {
      pass: regularFullDay.pass && discountFullDay.pass,
      lines: [regularFullDay.line, discountFullDay.line],
      raises: [regularFullDay.raiseText, discountFullDay.raiseText].filter(Boolean),
    },
    amHalf: {
      pass: regularAM.pass && discountAM.pass,
      lines: [regularAM.line, discountAM.line],
      raises: [regularAM.raiseText, discountAM.raiseText].filter(Boolean),
    },
    pmHalf: {
      pass: regularPM.pass && discountPM.pass,
      lines: [regularPM.line, discountPM.line],
      raises: [regularPM.raiseText, discountPM.raiseText].filter(Boolean),
    },
    overnightDay: {
      pass: regularOvernight.pass && discountOvernight.pass,
      lines: [regularOvernight.line, discountOvernight.line],
      raises: [regularOvernight.raiseText, discountOvernight.raiseText].filter(Boolean),
    },
    overnightWeek: {
      pass: true,
      lines: ['Baseline row. Overnight Full Week drives Overnight Day x7 target.'],
      raises: [],
    },
  }
}

function getInitialState() {
  return {
    media: {
      heroImageUrl: defaultAdminConfig.media.heroImageUrl,
      welcomeLogoUrl: defaultAdminConfig.media.welcomeLogoUrl,
      surveyVideoUrl: defaultAdminConfig.media.surveyVideoUrl,
      surveyStep1FlyerUrl: defaultAdminConfig.media.surveyStep1FlyerUrl,
      surveyMobileBgUrl: defaultAdminConfig.media.surveyMobileBgUrl,
      surveyStepImageUrls: [...defaultAdminConfig.media.surveyStepImageUrls],
      surveyStepImagePositions: defaultAdminConfig.media.surveyStepImagePositions.map((item) => ({ ...item })),
      landingCarouselImagePositions: defaultAdminConfig.media.landingCarouselImagePositions.map((item) => ({ ...item })),
      registrationStepImageUrls: [...defaultAdminConfig.media.registrationStepImageUrls],
      burlingtonFacilityImageUrls: [...defaultAdminConfig.media.burlingtonFacilityImageUrls],
      actonFacilityImageUrls: [...defaultAdminConfig.media.actonFacilityImageUrls],
      overnightLandingImageUrls: [...defaultAdminConfig.media.overnightLandingImageUrls],
      overnightGalleryImageUrls: [...defaultAdminConfig.media.overnightGalleryImageUrls],
      overnightRegistrationImageUrls: [...defaultAdminConfig.media.overnightRegistrationImageUrls],
      levelUpImageUrl: defaultAdminConfig.media.levelUpImageUrl,
      levelUpScreenshotUrls: [...defaultAdminConfig.media.levelUpScreenshotUrls],
      levelUpScreenshotPositions: defaultAdminConfig.media.levelUpScreenshotPositions.map((item) => ({ ...item })),
      levelUpScreenshotSize: defaultAdminConfig.media.levelUpScreenshotSize,
      wechatQrUrl: defaultAdminConfig.media.wechatQrUrl,
    },
    emailJourney: defaultAdminConfig.emailJourney.map((item) => ({ ...item })),
    testimonials: defaultAdminConfig.testimonials.map((item) => ({ ...item })),
    campTypeShowcase: JSON.parse(JSON.stringify(defaultAdminConfig.campTypeShowcase)),
    tuition: {
      regular: { ...defaultAdminConfig.tuition.regular },
      discount: { ...defaultAdminConfig.tuition.discount },
      bootcamp: {
        regular: { ...defaultAdminConfig.tuition.bootcamp.regular },
        discount: { ...defaultAdminConfig.tuition.bootcamp.discount },
      },
      discountEndDate: defaultAdminConfig.tuition.discountEndDate,
      discountDisplayValue: defaultAdminConfig.tuition.discountDisplayValue,
      discountCode: defaultAdminConfig.tuition.discountCode,
      lunchPrice: defaultAdminConfig.tuition.lunchPrice,
      bootcampPremiumPct: defaultAdminConfig.tuition.bootcampPremiumPct,
      siblingDiscountPct: defaultAdminConfig.tuition.siblingDiscountPct,
      businessName: defaultAdminConfig.tuition.businessName,
      businessAddress: defaultAdminConfig.tuition.businessAddress,
    },
    programs: {
      general: { ...defaultAdminConfig.programs.general },
      bootcamp: { ...defaultAdminConfig.programs.bootcamp },
      overnight: { ...defaultAdminConfig.programs.overnight },
    },
  }
}

function getResizedPreviewUrl(url, width, height, quality = 70) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('width', String(width))
    parsed.searchParams.set('height', String(height))
    parsed.searchParams.set('resize', 'cover')
    parsed.searchParams.set('quality', String(quality))
    return parsed.toString()
  } catch {
    return url
  }
}

function isVideoUrl(url) {
  if (!url) {
    return false
  }

  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    return /\.(mp4|mov|webm|m4v|ogg)$/i.test(pathname)
  } catch {
    return /\.(mp4|mov|webm|m4v|ogg)$/i.test(String(url).toLowerCase())
  }
}

function getYouTubeVideoId(url) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

    if (host === 'youtu.be') {
      return parsed.pathname.replace('/', '').trim()
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v') || ''
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || ''
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || ''
      }
    }
  } catch {
    return ''
  }

  return ''
}

function getYouTubeEmbedUrl(url) {
  const id = getYouTubeVideoId(url)
  if (!id) {
    return ''
  }

  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&controls=1&rel=0`
}

const surveyStepQuestions = [
  'Step 1: Email + camper ages',
  'Step 2A: Sports participation and experience',
  'Step 2B: Build-first support visuals',
  'Step 3: Martial arts experience',
  'Step 4: Lunch convenience + family goals',
  'Step 5: Recommendation and register prompt',
]

const registrationStepQuestions = [
  'Registration Step 1: Family & campers',
  'Registration Step 2: Camp weeks & times',
  'Registration Step 3: Lunch days',
  'Registration Step 4: Review & submit',
]

const overnightLandingSlots = [
  {
    key: 'lodging-space',
    label: 'Top Carousel Slot 1: Lodging Space',
    caption: 'Spacious lodging setup with comfort, organization, and supervised routines.',
  },
  {
    key: 'fun-activities',
    label: 'Top Carousel Slot 2: Fun Activities',
    caption: 'Fun activities, team games, and social challenges that keep campers engaged.',
  },
  {
    key: 'training-growth',
    label: 'Top Carousel Slot 3: Outings & Outdoor Activities',
    caption: 'Fun outings and outdoor activities that keep campers active, adventurous, and engaged.',
  },
  {
    key: 'sleeping-setup',
    label: 'Top Carousel Slot 4: Sleeping Setup',
    caption: 'Comfortable overnight setup that supports rest, routine, and independence.',
  },
  {
    key: 'academy-training',
    label: 'Top Carousel Slot 5: Academy Training',
    caption: 'Focused academy training moments that show progress, technique, and coaching attention.',
  },
  {
    key: 'team-life',
    label: 'Top Carousel Slot 6: Team Life',
    caption: 'Camp community moments that highlight friendship, bonding, and independence.',
  },
]
const campTypeShowcaseAdminCards = [
  { key: 'general', label: 'General Camp' },
  { key: 'bootcamp', label: 'Competition Team Boot Camp' },
  { key: 'overnight', label: 'Overnight Camp' },
]

const levelUpScreenshotCaptions = [
  'Live training moment: coach guiding movement or form corrections.',
  'Parent updates view: daily photos/videos progress feed.',
  'Lunch booking view: simple day-by-day lunch selection.',
  'Schedule/attendance view: clear weekly structure and check-ins.',
  'Progress notes view: instructor comments and improvement milestones.',
]

const landingCarouselSlotGuide = [
  {
    slot: 1,
    sourceLabel: 'Hero image URL',
    binding: 'Hero Camp Moment',
    caption:
      'Every week blends high-energy training, confidence-building, and summer fun.',
  },
  {
    slot: 2,
    sourceLabel: surveyStepQuestions[0],
    binding: 'Training Highlights',
    caption:
      'Campers build real skills while making friends through team challenges.',
  },
  {
    slot: 3,
    sourceLabel: surveyStepQuestions[1],
    binding: 'Teamwork & Friends',
    caption:
      'Daily movement, structure, and coaching help kids grow fast and stay motivated.',
  },
  {
    slot: 4,
    sourceLabel: surveyStepQuestions[2],
    binding: 'Weekly Showcase',
    caption:
      'From first-timers to advanced students, every camper trains at the right level.',
  },
]

const emailJourneyBlueprint = [
  {
    step: 'Step 1',
    objective: 'Re-engage visitors who started exploring camp but did not finish.',
    cta: 'Show highlights + return to registration',
  },
  {
    step: 'Step 2',
    objective: 'Explain why the recommendation fits the camper profile.',
    cta: 'Review fit breakdown + reserve weeks',
  },
  {
    step: 'Step 3',
    objective: 'Highlight social/team value and sibling-discount appeal.',
    cta: 'See community benefits + register now',
  },
  {
    step: 'Step 4',
    objective: 'Reduce friction with logistics, lunch, and onboarding clarity.',
    cta: 'Review logistics + secure schedule',
  },
  {
    step: 'Step 5',
    objective: 'Create urgency and close with a clear final invitation.',
    cta: 'Final call to reserve preferred weeks',
  },
]

const reservationJourneyBlueprint = [
  {
    step: 'Step 1',
    objective: 'Sent immediately after submitted registration. Starts 72-hour hold.',
    cta: 'Complete payment and confirm reservation',
  },
  {
    step: 'Step 2',
    objective: 'Friendly evening reminder while hold is still active.',
    cta: 'Pay now to keep selected weeks',
  },
  {
    step: 'Step 3',
    objective: 'Priority reminder before final-day deadline.',
    cta: 'Keep reservation active',
  },
  {
    step: 'Step 4',
    objective: 'Final day warning before auto-cancel.',
    cta: 'Payment required today',
  },
  {
    step: 'Step 5',
    objective: 'Auto-cancel notice after unpaid 72-hour window.',
    cta: 'Reply to reopen if spots remain',
  },
  {
    step: 'P1',
    objective: '7 days before camp: early prep, logistics, and extra-week invitation.',
    cta: 'Prep family + encourage added weeks',
  },
  {
    step: 'P2',
    objective: '5 days before camp: logistics reminder and extra-week offer.',
    cta: 'Keep schedule easy and upsell added weeks',
  },
  {
    step: 'P3',
    objective: '3 days before camp: final checklist and reminders.',
    cta: 'Reduce friction before arrival',
  },
  {
    step: 'P4',
    objective: '1 day before camp: tomorrow reminder and arrival prep.',
    cta: 'Confirm readiness for day 1',
  },
  {
    step: 'A0',
    objective: 'Immediate paid confirmation once tuition reaches 95%+: confirm registration and invite added weeks.',
    cta: 'Confirm registration and encourage more weeks',
  },
  {
    step: 'A2',
    objective: 'First paid-family follow-up after payment: encouraging thank-you and added-week nudge.',
    cta: 'Push more weeks with Train More, Save More',
  },
  {
    step: 'A4',
    objective: 'Second paid-family follow-up after payment: reinforce value and encourage adding weeks.',
    cta: 'Show how more weeks create stronger results',
  },
  {
    step: 'A8',
    objective: 'Later paid-family follow-up after payment: one more positive nudge before more weeks fill.',
    cta: 'Invite schedule expansion while inventory remains',
  },
]

const reservationJourneyTemplates = [
  {
    dayLabel: 'Immediately',
    title: 'Step 1 - Reservation Received',
    subject: '[Action Needed] 72-Hour Camp Spot Hold - Complete Payment to Confirm',
    body:
      'Hi {parent_name},\n\nThank you for submitting your camp registration. Your selected weeks are now reserved for 72 hours.\n\nPlease complete payment to keep your spot.\n\nAmount due: {amount_due}\n\nPayment options:\n{payment_methods}\n\nFamily rewards: each camper receives 2,500 points for prizes and family discounts.\n\nReservation summary:\n{registration_summary}',
  },
  {
    dayLabel: '12 Hours',
    title: 'Step 2 - Evening Reminder',
    subject: 'Evening Reminder: Complete Payment to Keep Your Camp Reservation',
    body:
      'Hi {parent_name},\n\nQuick reminder: your reservation is still active.\n\nPlease complete payment to keep your selected weeks.\n\nAmount due: {amount_due}\n\nPayment options:\n{payment_methods}\n\nFamily rewards: each camper receives 2,500 points for prizes and family discounts.\n\nReservation summary:\n{registration_summary}',
  },
  {
    dayLabel: '36 Hours',
    title: 'Step 3 - Priority Reminder',
    subject: 'Important Reminder: Keep Your Summer Camp Weeks Locked In',
    body:
      'Hi {parent_name},\n\nYour reservation hold is still active. Please complete payment before the hold expires.\n\nAmount due: {amount_due}\n\nPayment options:\n{payment_methods}\n\nFamily rewards: each camper receives 2,500 points for prizes and family discounts.\n\nReservation summary:\n{registration_summary}',
  },
  {
    dayLabel: '66 Hours',
    title: 'Step 4 - Final Day Reminder',
    subject: 'Final Notice Today: Reservation Auto-Cancels Without Payment',
    body:
      'Hi {parent_name},\n\nFinal reminder: your reservation auto-cancels if payment is not received before {reservation_deadline}.\n\nAmount due: {amount_due}\n\nPayment options:\n{payment_methods}\n\nFamily rewards: each camper receives 2,500 points for prizes and family discounts.\n\nReservation summary:\n{registration_summary}',
  },
  {
    dayLabel: '72 Hours',
    title: 'Step 5 - Reservation Canceled',
    subject: 'Reservation Canceled (Unpaid) - Reply to Reopen Quickly',
    body:
      'Hi {parent_name},\n\nYour reservation was automatically canceled because payment was not received within 72 hours.\n\nReply to this email if you want us to help reopen your registration (subject to availability).\n\nPrevious summary:\n{registration_summary}',
  },
  {
    dayLabel: '7 Days Before Camp',
    title: 'P1 - 7-Day Prep Reminder',
    subject: '7 Days Before Camp: Preparation Checklist + Bonus Week Offers',
    body:
      'Hi {parent_name},\n\nGreat news. Your family is officially registered, and camp starts next week.\n\nThis is your early prep reminder with logistics, schedule planning, and optional added-week support.\n\nIf your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.\n\nReply if you want help adding weeks or adjusting the plan.',
  },
  {
    dayLabel: '5 Days Before Camp',
    title: 'P2 - 5-Day Prep Reminder',
    subject: '5 Days Before Camp: Final Logistics + Extra Week Invitation',
    body:
      'Hi {parent_name},\n\nYour camp week is coming up fast. Camp runs 8:30 AM-4:00 PM, with pickup from 4:00-4:30 PM. Please review clothing, lunch, Water Wednesday, and Friday showcase timing during pickup.\n\nIf your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.\n\nReply if you want help adding more weeks.',
  },
  {
    dayLabel: '3 Days Before Camp',
    title: 'P3 - 3-Day Prep Reminder',
    subject: '3 Days Before Camp: Final Packing + Arrival Checklist',
    body:
      'Hi {parent_name},\n\nThree-day reminder before camp begins: camp runs 8:30 AM-4:00 PM, with pickup from 4:00-4:30 PM. Pack training clothing and review the weekly schedule.\n\nIf your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.\n\nReply if you want to adjust weeks before camp starts.',
  },
  {
    dayLabel: '1 Day Before Camp',
    title: 'P4 - Tomorrow Reminder',
    subject: 'Camp Starts Tomorrow: Arrival Reminder + Final Checklist',
    body:
      'Hi {parent_name},\n\nCamp starts tomorrow. Final reminder to pack training clothes, water bottle, and anything else your camper needs.\n\nIf your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.\n\nReply if you need any last-minute help.',
  },
  {
    dayLabel: 'Immediately After Payment',
    title: 'A0 - Paid Registration Confirmed',
    subject: 'Your Summer Camp Registration Is Confirmed',
    body:
      'Hi {parent_name},\n\nWonderful news. Your registration is confirmed and we are excited to welcome your family this summer.\n\nWhat helps campers grow the most over the summer? More consistency, more coaching, and more time in the right environment. That is why many families add more weeks once their first weeks are confirmed.\n\nTrain More, Save More and 2,500 points per full week both apply.\n\nReply if you want help adding more weeks.',
  },
  {
    dayLabel: 'Paid Follow-Up',
    title: 'A2 - Paid Family Follow-Up',
    subject: 'You’re Signed Up. Want Even More Growth This Summer?',
    body:
      'Hi {parent_name},\n\nThank you again for signing up. We are excited to welcome your family this summer.\n\nWhat creates the best summer results? More consistency, more coaching, and more time in the right environment. That is why we encourage families to add weeks early while more choices are open.\n\nTrain More, Save More and 2,500 points per full week both apply.\n\nReply if you want help adding more weeks.',
  },
  {
    dayLabel: 'Paid Follow-Up',
    title: 'A4 - Paid Family Momentum Check-In',
    subject: 'Would More Camp Weeks Help Your Camper Grow Even More This Summer?',
    body:
      'Hi {parent_name},\n\nWe are excited for your family to join us this summer.\n\nHow do campers build stronger results? More repetition, more coaching, and more consistency. That is why many families add more weeks after they lock in the first part of their plan.\n\nTrain More, Save More and 2,500 points per full week both apply.\n\nReply if you want help reviewing the best next weeks.',
  },
  {
    dayLabel: 'Paid Follow-Up',
    title: 'A8 - Paid Family Final Nudge',
    subject: 'One More Summer Camp Planning Check-In Before More Weeks Fill',
    body:
      'Hi {parent_name},\n\nThank you again for enrolling. We cannot wait to see your family this summer.\n\nWhat helps a camper leave summer stronger: one good week, or a longer stretch of structure and progress? We believe more consistent training time makes the difference.\n\nTrain More, Save More and 2,500 points per full week both apply.\n\nReply if you want help extending your schedule.',
  },
]

const paidEnrollmentJourneyTemplates = reservationJourneyTemplates.slice(-4)
const reservationReminderJourneyTemplates = reservationJourneyTemplates.slice(0, 9)
const paidEnrollmentJourneyBlueprint = reservationJourneyBlueprint.slice(-4)
const reservationReminderJourneyBlueprint = reservationJourneyBlueprint.slice(0, 9)

const premiumJourneyTemplates = [
  {
    dayLabel: 'Immediately',
    title: 'Step 1 - Summer Camp Follow-Up',
    subject: 'Still Thinking About Summer Camp? Here Are the Highlights',
    videoUrl: '',
    body:
      'Hi {parent_name},\n\nWe noticed you checked out New England Wushu Summer Camp and wanted to send a quick follow-up in case you did not get to finish.\n\nFamilies usually choose us for four big reasons: strong coaching, fun team energy, lunch convenience, and daily photo/video updates through the Level Up app.\n\nA strong fit based on what we saw so far:\n{recommended_plan}\n\nYou can pick back up here anytime:\n{registration_link}\n\nIf you want help choosing the best weeks, just reply and we will guide you.',
  },
  {
    dayLabel: 'Day 1',
    title: 'Step 2 - Best-Fit Plan Reminder',
    subject: 'Your Recommended Camp Plan + Next Steps',
    videoUrl: '',
    body:
      'Hi {parent_name},\n\nQuick follow-up from our team. We can help you lock in the schedule that best matches your goals.\n\nRecommended fit:\n{recommended_plan}\n\nRegistration takes only a few minutes:\n{registration_link}\n\nIf you want help picking weeks, just reply and we will guide you.',
  },
  {
    dayLabel: 'Day 3',
    title: 'Step 3 - Social Proof + Confidence',
    subject: 'Why Families Choose New England Wushu Summer Camp',
    videoUrl: '',
    body:
      'Hi {parent_name},\n\nFamilies tell us they value three things most: coaching quality, visible progress, and a positive team environment.\n\nYour camper can start with a plan matched to age and experience:\n{recommended_plan}\n\nStart registration when ready:\n{registration_link}\n\nWe are happy to answer any questions before you submit.',
  },
  {
    dayLabel: 'Day 5',
    title: 'Step 4 - Logistics + Readiness',
    subject: 'Camp Logistics Made Easy: Schedule, Lunch, and Daily Updates',
    videoUrl: '',
    body:
      'Hi {parent_name},\n\nTo make camp easier for families, we provide clear weekly scheduling, lunch options, and ongoing updates.\n\nYou can complete registration here:\n{registration_link}\n\nRecommended fit from your survey:\n{recommended_plan}\n\nIf you prefer, reply and we can help you choose the best starting weeks.',
  },
  {
    dayLabel: 'Day 7',
    title: 'Step 5 - Final Invitation',
    subject: 'Final Invitation: Reserve Your Preferred Summer Camp Weeks',
    videoUrl: '',
    body:
      'Hi {parent_name},\n\nFinal check-in from us. If you still want a summer camp plan tailored to your goals, we would love to welcome your family.\n\nRecommended plan:\n{recommended_plan}\n\nComplete registration:\n{registration_link}\n\nIf now is not the right time, no problem. You can always return when ready.',
  },
]

const leadTrackerColumns = premiumJourneyTemplates.map((item, index) => ({
  key: `step_${index + 1}`,
  stepNumber: index + 1,
  label: `L${index + 1}`,
  timingLabel: item.dayLabel,
  description: item.dayLabel === 'Immediately' ? `Lead ${index + 1}: sends immediately` : `Lead ${index + 1}: ${item.dayLabel}`,
}))

const reservationTrackerColumns = reservationJourneyBlueprint.map((item, index) => ({
  key:
    index < 5
      ? `step_${index + 1}`
      : index === 5
        ? 'paid_7d'
        : index === 6
          ? 'paid_5d'
          : index === 7
            ? 'paid_3d'
      : index === 8
        ? 'paid_1d'
        : index === 9
          ? 'paid_0w'
        : index === 10
          ? 'paid_2w'
          : index === 11
            ? 'paid_4w'
            : 'paid_8w',
  stepNumber: index < 5 ? index + 1 : null,
  label:
    index < 5
      ? `R${index + 1}`
      : index === 5
        ? 'P1'
        : index === 6
          ? 'P2'
        : index === 7
            ? 'P3'
      : index === 8
        ? 'P4'
      : index === 9
          ? 'A0'
        : index === 10
          ? 'A2'
        : index === 11
          ? 'A4'
          : 'A8',
  timingLabel:
    index === 0
      ? '0h'
      : index === 1
        ? '12h'
        : index === 2
          ? '36h'
          : index === 3
            ? '66h'
            : index === 4
              ? '72h'
              : index === 5
                ? '-7d'
                : index === 6
                  ? '-5d'
                  : index === 7
                    ? '-3d'
                    : index === 8
                      ? '-1d'
                      : index === 9
                        ? 'paid'
                        : index === 10
                        ? '+2w'
                        : index === 11
                          ? '+4w'
                          : '+8w',
  description: item.objective,
}))

function normalizeAdminEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidAdminEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function buildTrackerCell(status = 'pending', at = '', note = '') {
  return { status, at, note }
}

function isArchivedRegistrationRecord(record) {
  const entries = Array.isArray(record?.accounting_entries) ? record.accounting_entries : []
  if (entries.length === 0) {
    return false
  }
  return entries.every((entry) => Boolean(entry?.archived))
}

function isTestJourneyStatus(status = '') {
  return String(status || '').startsWith('test_')
}

function formatTrackerDateTime(value) {
  const parsed = new Date(value || '')
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString()
}

function formatElapsedSince(value) {
  const parsed = new Date(value || '')
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  const diffMs = Math.max(0, Date.now() - parsed.getTime())
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  if (days > 0) {
    return `${days}d ${hours}h ago`
  }
  if (totalHours > 0) {
    return `${totalHours}h ago`
  }
  const minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))
  return `${minutes}m ago`
}

function getEmailEventFlowFilter(event = {}) {
  const eventType = String(event?.event_type || '').toLowerCase()
  const payload =
    typeof event?.event_payload === 'object' && event?.event_payload
      ? event.event_payload
      : parseMaybeJson(event?.event_payload, {}) || {}
  const registrationType = String(payload?.registrationType || '').trim().toLowerCase()
  const subject = String(event?.subject || '').toLowerCase()

  if (eventType.startsWith('lead_') || eventType.includes('_lead')) {
    return 'lead'
  }
  if (registrationType === 'overnight-only' || subject.includes('overnight')) {
    return 'overnight'
  }
  return 'registration'
}

function getEmailEventJourneyFilter(event = {}) {
  const eventType = String(event?.event_type || '').toLowerCase()
  const payload =
    typeof event?.event_payload === 'object' && event?.event_payload
      ? event.event_payload
      : parseMaybeJson(event?.event_payload, {}) || {}
  const stageId = String(payload?.stageId || '').toLowerCase()

  if (eventType.includes('paid_prep') || ['sevenday', 'fiveday', 'threeday', 'oneday'].includes(stageId)) {
    return 'p'
  }
  if (eventType.includes('paid_followup') || ['twoweek', 'fourweek', 'eightweek'].includes(stageId)) {
    return 'a'
  }
  return 'other'
}

function getEmailEventDeliveryFilter(event = {}) {
  const eventType = String(event?.event_type || '').toLowerCase()
  if (eventType.endsWith('_sent')) {
    return 'sent'
  }
  if (eventType.endsWith('_opened')) {
    return 'opened'
  }
  return 'all'
}

function getEmailEventDisplayLabel(event = {}) {
  const eventType = String(event?.event_type || '').trim().toLowerCase()
  const stepNumber = Number(event?.step_number || 0)
  const payload =
    typeof event?.event_payload === 'object' && event?.event_payload
      ? event.event_payload
      : parseMaybeJson(event?.event_payload, {}) || {}
  const stepKey = String(payload?.stepKey || '').trim().toLowerCase()

  if (eventType === 'lead_journey_opened' && stepNumber > 0) {
    return `Open receipt (L${stepNumber})`
  }
  if (eventType === 'reservation_email_opened' && stepNumber > 0) {
    return `Open receipt (R${stepNumber})`
  }
  if (eventType === 'paid_prep_opened') {
    const label =
      stepKey === 'paid_7d' ? 'P1' :
      stepKey === 'paid_5d' ? 'P2' :
      stepKey === 'paid_3d' ? 'P3' :
      stepKey === 'paid_1d' ? 'P4' : 'P'
    return `Open receipt (${label})`
  }
  if (eventType === 'paid_followup_opened') {
    const label =
      stepKey === 'paid_0w' ? 'A0' :
      stepKey === 'paid_2w' ? 'A2' :
      stepKey === 'paid_4w' ? 'A4' :
      stepKey === 'paid_8w' ? 'A8' : 'A'
    return `Open receipt (${label})`
  }
  if (eventType === 'lead_journey_sent' && stepNumber > 0) {
    return `Sent (L${stepNumber})`
  }
  if (eventType === 'reservation_email_sent' && stepNumber > 0) {
    return `Sent (R${stepNumber})`
  }
  return event?.event_type || '-'
}

function getLatestOpenedTrackerStep(row, flow = 'reservation') {
  const cells = Object.entries(row?.steps || {})
    .map(([key, cell]) => ({ key, cell }))
    .filter(({ cell }) => String(cell?.status || '').trim().toLowerCase() === 'opened' && cell?.at)
    .sort((a, b) => new Date(b.cell?.at || 0).getTime() - new Date(a.cell?.at || 0).getTime())
  const latest = cells[0]
  if (!latest) {
    return null
  }
  if (flow === 'lead') {
    const stepNumber = Number(String(latest.key || '').replace('step_', '') || 0)
    return {
      label: stepNumber > 0 ? `L${stepNumber}` : 'Lead',
      at: latest.cell.at,
    }
  }
  const map = {
    step_1: 'R1',
    step_2: 'R2',
    step_3: 'R3',
    step_4: 'R4',
    step_5: 'R5',
    paid_7d: 'P1',
    paid_5d: 'P2',
    paid_3d: 'P3',
    paid_1d: 'P4',
    paid_0w: 'A0',
    paid_2w: 'A2',
    paid_4w: 'A4',
    paid_8w: 'A8',
  }
  return {
    label: map[latest.key] || latest.key,
    at: latest.cell.at,
  }
}

function formatTrackerCellTimestamp(value) {
  if (!value) {
    return ''
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getLeadRunDisplayLabel(row) {
  const status = String(row?.status || '').trim().toLowerCase()
  const stepStatuses = Object.values(row?.steps || {}).map((cell) => String(cell?.status || '').trim().toLowerCase())
  const hasRealStepActivity = stepStatuses.some((value) => ['sent', 'preview', 'scheduled', 'skipped', 'closed'].includes(value))

  if (status === 'queued' && !hasRealStepActivity) {
    return 'Enqueued'
  }
  if ((status === 'queued' || status === 'lead_active') && hasRealStepActivity) {
    return 'Active'
  }
  if (status === 'lead_closed' && hasRealStepActivity) {
    return 'Completed'
  }
  if (!status) {
    return '-'
  }
  return status.replaceAll('_', ' ')
}

function addHoursToIso(value, hours) {
  const parsed = new Date(value || '')
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return new Date(parsed.getTime() + hours * 60 * 60 * 1000).toISOString()
}

function addDaysToIso(value, days) {
  const parsed = new Date(value || '')
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return new Date(parsed.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

const paidJourneyStageDefs = [
  { key: 'paid_0w', daysAfterPayment: 0 },
  { key: 'paid_2w', daysAfterPayment: 14 },
  { key: 'paid_4w', daysAfterPayment: 28 },
  { key: 'paid_8w', daysAfterPayment: 56 },
  { key: 'paid_7d', daysBefore: 7 },
  { key: 'paid_5d', daysBefore: 5 },
  { key: 'paid_3d', daysBefore: 3 },
  { key: 'paid_1d', daysBefore: 1 },
]

function getPaidJourneyStageScheduleAt(row, stage, firstWeekStart = '') {
  if (stage?.daysAfterPayment != null) {
    const anchorAt = String(row?.paidActivatedAt || '').trim()
    const scheduledAt = addDaysToIso(anchorAt, stage.daysAfterPayment)
    return scheduledAt ? new Date(scheduledAt) : null
  }
  if (!firstWeekStart || stage?.daysBefore == null) {
    return null
  }
  const firstWeekStartDate = new Date(`${firstWeekStart}T12:00:00`)
  if (Number.isNaN(firstWeekStartDate.getTime())) {
    return null
  }
  return addDays(firstWeekStartDate, -stage.daysBefore)
}

function parseLeadJourneyDayOffset(dayLabel, fallbackDays) {
  const label = String(dayLabel || '').toLowerCase().trim()
  if (!label || label.includes('immediate')) {
    return 0
  }
  const dayMatch = label.match(/(\d+)/)
  if (dayMatch) {
    return Math.max(0, Number(dayMatch[1] || fallbackDays))
  }
  if (label.includes('evening') || label.includes('today')) {
    return 0
  }
  return fallbackDays
}

function getPaidJourneyEntries(row, weekStarts = []) {
  if (!row?.createdAt || row?.registrationType === 'overnight-only') {
    return []
  }

  const entries = []
  const normalizedWeekStarts = Array.isArray(weekStarts) ? weekStarts.filter(Boolean).sort((a, b) => a.localeCompare(b)) : []

  for (const stage of paidJourneyStageDefs) {
    if (stage.daysAfterPayment != null) {
      const scheduledAt = addDaysToIso(String(row?.paidActivatedAt || '').trim(), stage.daysAfterPayment)
      if (scheduledAt) {
        entries.push({
          key: stage.key,
          label:
            stage.key === 'paid_0w' ? 'A0' :
            stage.key === 'paid_2w' ? 'A2' :
            stage.key === 'paid_4w' ? 'A4' :
            stage.key === 'paid_8w' ? 'A8' : stage.key,
          scheduledAt,
          instanceKey: `${stage.key}:global`,
        })
      }
      continue
    }

    for (const weekStart of normalizedWeekStarts) {
      const scheduledAtDate = getPaidJourneyStageScheduleAt(row, stage, weekStart)
      if (!scheduledAtDate) {
        continue
      }
      entries.push({
        key: stage.key,
        label:
          stage.key === 'paid_7d' ? 'P1' :
          stage.key === 'paid_5d' ? 'P2' :
          stage.key === 'paid_3d' ? 'P3' : 'P4',
        scheduledAt: scheduledAtDate.toISOString(),
        instanceKey: `${stage.key}:${weekStart}`,
        weekStart,
      })
    }
  }

  return entries.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
}

function getPendingPaidJourneyEntries(row, weekStarts = []) {
  const sentKeys = row?.paidSentInstanceKeys instanceof Set ? row.paidSentInstanceKeys : new Set()
  return getPaidJourneyEntries(row, weekStarts).filter((entry) => !sentKeys.has(entry.instanceKey))
}

function getPaidEventInstanceKey(eventType = '', eventPayload = {}, row = null) {
  const weekStart = String(eventPayload?.weekStart || '').trim() || row?.selectedWeekStarts?.[0] || ''
  const eventTypeValue = String(eventType || '')
  if (eventTypeValue === 'paid_prep_opened') {
    switch (String(eventPayload?.stepKey || '').trim()) {
      case 'paid_7d':
        return { key: 'paid_7d', instanceKey: `paid_7d:${weekStart}` }
      case 'paid_5d':
        return { key: 'paid_5d', instanceKey: `paid_5d:${weekStart}` }
      case 'paid_3d':
        return { key: 'paid_3d', instanceKey: `paid_3d:${weekStart}` }
      case 'paid_1d':
        return { key: 'paid_1d', instanceKey: `paid_1d:${weekStart}` }
      default:
        return null
    }
  }
  if (eventTypeValue === 'paid_followup_opened') {
    switch (String(eventPayload?.stepKey || '').trim()) {
      case 'paid_0w':
        return { key: 'paid_0w', instanceKey: 'paid_0w:global' }
      case 'paid_2w':
        return { key: 'paid_2w', instanceKey: 'paid_2w:global' }
      case 'paid_4w':
        return { key: 'paid_4w', instanceKey: 'paid_4w:global' }
      case 'paid_8w':
        return { key: 'paid_8w', instanceKey: 'paid_8w:global' }
      default:
        return null
    }
  }
  switch (eventTypeValue) {
    case 'paid_prep_7d_sent':
    case 'paid_prep_7d_sent_preview':
      return { key: 'paid_7d', instanceKey: `paid_7d:${weekStart}` }
    case 'paid_prep_5d_sent':
    case 'paid_prep_5d_sent_preview':
      return { key: 'paid_5d', instanceKey: `paid_5d:${weekStart}` }
    case 'paid_prep_3d_sent':
    case 'paid_prep_3d_sent_preview':
      return { key: 'paid_3d', instanceKey: `paid_3d:${weekStart}` }
    case 'paid_prep_1d_sent':
    case 'paid_prep_1d_sent_preview':
      return { key: 'paid_1d', instanceKey: `paid_1d:${weekStart}` }
    case 'paid_followup_2w_sent':
    case 'paid_followup_2w_sent_preview':
      return { key: 'paid_2w', instanceKey: 'paid_2w:global' }
    case 'paid_followup_0w_sent':
    case 'paid_followup_0w_sent_preview':
      return { key: 'paid_0w', instanceKey: 'paid_0w:global' }
    case 'paid_followup_4w_sent':
    case 'paid_followup_4w_sent_preview':
      return { key: 'paid_4w', instanceKey: 'paid_4w:global' }
    case 'paid_followup_8w_sent':
    case 'paid_followup_8w_sent_preview':
      return { key: 'paid_8w', instanceKey: 'paid_8w:global' }
    default:
      return null
  }
}

function upgradeTrackerCellToOpened(cell, at = '') {
  const status = String(cell?.status || '').trim().toLowerCase()
  if (['sent', 'preview', 'opened', 'partial'].includes(status)) {
    return buildTrackerCell('opened', at || cell?.at || '', cell?.note || '')
  }
  return cell
}

function getWeekStartFromSelectionKey(selectionKey, weekById = {}) {
  const directMatch = weekById?.[selectionKey]?.start || ''
  if (directMatch) {
    return directMatch
  }
  const raw = String(selectionKey || '').trim()
  const dateMatch = raw.match(/(\d{4}-\d{2}-\d{2})$/)
  return dateMatch ? dateMatch[1] : ''
}

function getSelectedWeekStartsFromRegistration(sourceRegistration = {}, weekById = {}) {
  return Array.from(
    new Set(
      (Array.isArray(sourceRegistration?.students) ? sourceRegistration.students : [])
        .flatMap((student) => Object.keys(student?.schedule || {}).filter(Boolean))
        .map((weekKey) => getWeekStartFromSelectionKey(weekKey, weekById))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
}

function formatCalendarMonthTitle(value) {
  return value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatJourneyCalendarEntryDate(value) {
  const parsed = new Date(value || '')
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatJourneyCalendarWeekNote(weekStart) {
  const parsed = new Date(`${String(weekStart || '').trim()}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return `Week of ${parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function buildPaidJourneyEntryNote(entry) {
  if (!entry) {
    return ''
  }
  const parts = []
  if (entry.weekStart) {
    parts.push(formatJourneyCalendarWeekNote(entry.weekStart))
  }
  const when = formatJourneyCalendarEntryDate(entry.scheduledAt)
  if (when) {
    parts.push(when)
  }
  return parts.join(' · ')
}

function buildJourneyCalendarMonths(entries = []) {
  const normalizedEntries = (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const date = new Date(entry?.scheduledAt || '')
      if (Number.isNaN(date.getTime())) {
        return null
      }
      const dateKey = date.toISOString().slice(0, 10)
      return { ...entry, date, dateKey }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (normalizedEntries.length === 0) {
    return []
  }

  const startMonth = new Date(normalizedEntries[0].date.getFullYear(), normalizedEntries[0].date.getMonth(), 1)
  const endMonth = new Date(normalizedEntries[normalizedEntries.length - 1].date.getFullYear(), normalizedEntries[normalizedEntries.length - 1].date.getMonth(), 1)
  const months = []

  for (let cursor = new Date(startMonth); cursor.getTime() <= endMonth.getTime(); cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const leadingBlanks = (firstDay.getDay() + 6) % 7
    const entriesByDate = normalizedEntries.reduce((acc, entry) => {
      if (entry.date.getFullYear() !== year || entry.date.getMonth() !== month) {
        return acc
      }
      if (!acc[entry.dateKey]) {
        acc[entry.dateKey] = []
      }
      acc[entry.dateKey].push(entry)
      return acc
    }, {})

    const cells = []
    for (let index = 0; index < leadingBlanks; index += 1) {
      cells.push({ empty: true, key: `blank-${year}-${month}-${index}` })
    }
    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(year, month, day)
      const dateKey = date.toISOString().slice(0, 10)
      cells.push({
        empty: false,
        key: dateKey,
        day,
        dateKey,
        entries: entriesByDate[dateKey] || [],
      })
    }

    months.push({
      key: `${year}-${month + 1}`,
      title: formatCalendarMonthTitle(firstDay),
      cells,
    })
  }

  return months
}

function buildLeadCriteria(row, isRegistered) {
  const statusValue = String(row?.status || '')
  const isTestRow = statusValue.startsWith('test_')
  if (!row?.createdAt) {
    return [
      ...(isTestRow ? ['Admin test send: this is not a live lead automation'] : []),
      isRegistered ? 'Blocked: this email already exists in registrations' : 'Submission time unavailable',
    ]
  }
  const dueOffsets = [0, 1, 3, 5, 7]
  const nextColumn = leadTrackerColumns.find((column) => {
    const status = row.steps[column.key]?.status || 'pending'
    return !isTrackerStepHandled(status)
  })
  const lines = [
    ...(isTestRow ? ['Admin test send: this is not a live lead automation'] : []),
    `Submitted ${formatTrackerDateTime(row.createdAt)}`,
    `Elapsed: ${formatElapsedSince(row.createdAt)}`,
  ]
  if (isTestRow) {
    if (isRegistered) {
      lines.push('Blocked: this email already exists in registrations')
    } else {
      lines.push('Test rows do not autosend in the due-email processor')
    }
    return lines
  }
  if (isRegistered) {
    lines.push('Blocked: this email already exists in registrations')
    return lines
  }
  const latestOpened = getLatestOpenedTrackerStep(row, 'lead')
  if (latestOpened) {
    lines.push(`Open receipt: ${latestOpened.label} at ${formatTrackerDateTime(latestOpened.at)}`)
  }
  if (!nextColumn) {
    lines.push('All lead steps already handled')
    return lines
  }
  const dueAt = String(row?.nextSendAt || '').trim() || addDaysToIso(row.createdAt, dueOffsets[Math.max(0, nextColumn.stepNumber - 1)] || 0)
  if (!dueAt) {
    lines.push(`Next step: ${nextColumn.label}`)
    return lines
  }
  const dueDate = new Date(dueAt)
  const dueNow = dueDate.getTime() <= Date.now()
  lines.push(`${dueNow ? 'Due now' : 'Next due'}: ${nextColumn.label} ${dueNow ? 'since' : 'at'} ${formatTrackerDateTime(dueAt)}`)
  return lines
}

function buildReservationCriteria(row) {
  const statusValue = String(row?.status || '')
  const isTestRow = statusValue.startsWith('test_')
  if (!row?.createdAt) {
    return [
      ...(isTestRow ? ['Admin test send: this is not a live reservation automation'] : []),
      'Registration time unavailable',
    ]
  }
  const lines = [
    ...(isTestRow ? ['Admin test send: this is not a live reservation automation'] : []),
    `Submitted ${formatTrackerDateTime(row.createdAt)}`,
    `Elapsed: ${formatElapsedSince(row.createdAt)}`,
  ]
  if (isTestRow) {
    lines.push('Test rows do not autosend in the due-email processor')
    return lines
  }
  if (statusValue === 'paid') {
    const nextEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0]
    const latestOpened = getLatestOpenedTrackerStep(row, 'reservation')
    if (latestOpened) {
      lines.push(`Open receipt: ${latestOpened.label} at ${formatTrackerDateTime(latestOpened.at)}`)
    }
    if (!nextEntry) {
      lines.push('Paid: all scheduled paid follow-ups and pre-camp prep emails are handled')
      return lines
    }
    const scheduledAt = new Date(nextEntry.scheduledAt)
    const dueNow = !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() <= Date.now()
    const note = buildPaidJourneyEntryNote(nextEntry)
    lines.push(
      `${dueNow ? 'Next due' : 'Next paid step'}: ${nextEntry.label}${note ? ` at ${note}` : ''}`
    )
    return lines
  }
  if (!row?.runId) {
    if (!isValidAdminEmail(row?.email)) {
      lines.push('Registration saved with an invalid email format, so no reservation journey run was created')
    } else {
      lines.push('Registration saved, but no active journey run was attached, so this row will not autosend from the tracker')
    }
    return lines
  }
  const latestOpened = getLatestOpenedTrackerStep(row, 'reservation')
  if (latestOpened) {
    lines.push(`Open receipt: ${latestOpened.label} at ${formatTrackerDateTime(latestOpened.at)}`)
  }
  const dueOffsetsHours = [0, 12, 36, 66, 72]
  const nextColumn = reservationTrackerColumns
    .filter((column) => String(column.key || '').startsWith('step_'))
    .find((column) => {
      const status = row.steps[column.key]?.status || 'pending'
      return !isTrackerStepHandled(status)
    })
  if (!nextColumn) {
    lines.push('All unpaid reminder steps already handled')
    return lines
  }
  const dueAt = addHoursToIso(row.createdAt, dueOffsetsHours[Math.max(0, nextColumn.stepNumber - 1)] || 0)
  if (!dueAt) {
    lines.push(`Next step: ${nextColumn.label}`)
    return lines
  }
  const dueDate = new Date(dueAt)
  const dueNow = dueDate.getTime() <= Date.now()
  lines.push(`${dueNow ? 'Due now' : 'Next due'}: ${nextColumn.label} ${dueNow ? 'since' : 'at'} ${formatTrackerDateTime(dueAt)}`)
  return lines
}

function getReservationCriteriaState(row) {
  if (!row?.createdAt || String(row?.status || '').startsWith('test_')) {
    return ''
  }
  if (!row?.runId && String(row?.status || '') !== 'paid') {
    return ''
  }

  const now = Date.now()
  const upcomingBoundary = now + 24 * 60 * 60 * 1000

  if (String(row?.status || '') === 'paid') {
    const registrationId = Number(row?.registrationId || 0)
    if (registrationId <= 0 || row?.registrationType === 'overnight-only') {
      return ''
    }
    const nextEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0]
    if (!nextEntry) {
      return ''
    }
    const scheduledAt = new Date(nextEntry.scheduledAt).getTime()
    if (scheduledAt <= now) {
      return 'due'
    }
    if (scheduledAt <= upcomingBoundary) {
      return 'upcoming'
    }
    return ''
  }

  const unpaidHourOffsets = [0, 12, 36, 66, 72]
  const nextColumn = reservationTrackerColumns
    .filter((column) => String(column.key || '').startsWith('step_'))
    .find((column) => !isTrackerStepHandled(row?.steps?.[column.key]?.status))
  if (!nextColumn) {
    return ''
  }
  const dueAt = addHoursToIso(row.createdAt, unpaidHourOffsets[Math.max(0, (nextColumn.stepNumber || 1) - 1)] || 0)
  const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
  if (Number.isNaN(dueTime)) {
    return ''
  }
  if (dueTime <= now) {
    return 'due'
  }
  if (dueTime <= upcomingBoundary) {
    return 'upcoming'
  }
  return ''
}

function getTrackerCellLabel(cell) {
  switch (cell?.status) {
    case 'sent':
      return 'Sent'
    case 'opened':
      return 'Opened'
    case 'preview':
      return 'Preview'
    case 'queued':
      return 'Queued'
    case 'scheduled':
      return 'Scheduled'
    case 'error':
      return 'Error'
    case 'closed':
      return 'Closed'
    case 'paid':
      return 'Paid'
    case 'skipped':
      return 'Auto-skipped'
    case 'partial':
      return 'Partial'
    default:
      return '-'
  }
}

function isTrackerStepHandled(status = '') {
  return ['sent', 'opened', 'preview', 'closed', 'skipped'].includes(String(status || ''))
}

function buildJourneyProcessStepChips(stepCounts = {}, flow = 'reservation') {
  const normalized = typeof stepCounts === 'object' && stepCounts ? stepCounts : {}
  const order =
    flow === 'lead'
      ? [
          ['step_1', 'L1'],
          ['step_2', 'L2'],
          ['step_3', 'L3'],
          ['step_4', 'L4'],
          ['step_5', 'L5'],
        ]
      : [
          ['r1', 'R1'],
          ['r2', 'R2'],
          ['r3', 'R3'],
          ['r4', 'R4'],
          ['r5', 'R5'],
          ['a0', 'A0'],
          ['a2', 'A2'],
          ['a4', 'A4'],
          ['a8', 'A8'],
          ['p1', 'P1'],
          ['p2', 'P2'],
          ['p3', 'P3'],
          ['p4', 'P4'],
        ]

  return order
    .map(([key, label]) => ({
      key,
      label,
      count: Number(normalized[key] || 0),
    }))
    .filter((item) => item.count > 0)
}

const adminTabBlueprint = [
  { id: 'media', label: 'Media' },
  { id: 'tuition', label: 'Tuition' },
  { id: 'programs', label: 'Programs' },
  { id: 'journey', label: 'Email Journey' },
  { id: 'accounting', label: 'Registration Accounting' },
  { id: 'overnight-accounting', label: 'Overnight Accounting' },
  { id: 'leads', label: 'Leads' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'account', label: 'Save & Account' },
]

const mediaSubtabBlueprint = [
  { id: 'overview', label: 'Overview' },
  { id: 'carousel', label: 'Landing Carousel' },
  { id: 'levelup', label: 'Level Up Viewport' },
  { id: 'steps', label: 'Survey/Reg/Overnight' },
  { id: 'library', label: 'Media Library' },
]

const accountingPaymentMethods = ['venmo', 'zelle', 'paypal', 'cash', 'check']
const ACCOUNTING_ADMIN_COPY_EMAIL = 'calvin@newushu.com'
const accountingEditorDayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const accountingEditorNextMode = {
  NONE: 'FULL',
  FULL: 'AM',
  AM: 'PM',
  PM: 'NONE',
}

function parseMaybeJson(value, fallback = null) {
  try {
    return JSON.parse(String(value || ''))
  } catch {
    return fallback
  }
}

function parseDiscountDate(value) {
  if (!value) {
    return null
  }
  const parsed = new Date(`${value}T23:59:59`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getGeneralProgramForLocation(programConfig, locationValue) {
  const loc = String(locationValue || '').trim()
  if (loc === 'acton') {
    return {
      ...programConfig,
      selectedWeeks: Array.isArray(programConfig?.actonSelectedWeeks) ? programConfig.actonSelectedWeeks : [],
    }
  }
  if (loc === 'wellesley') {
    return {
      ...programConfig,
      selectedWeeks: Array.isArray(programConfig?.wellesleySelectedWeeks) ? programConfig.wellesleySelectedWeeks : [],
    }
  }
  return programConfig
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function isLimitedDiscountActiveForDate(discountEndDate, createdAtIso) {
  const endDate = parseDiscountDate(discountEndDate)
  const created = new Date(createdAtIso || Date.now())
  if (!endDate || Number.isNaN(created.getTime())) {
    return false
  }
  return created.getTime() <= endDate.getTime()
}

function getWeekDayKeysForProgram(programKey) {
  if (programKey === 'overnight') {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
}

function normalizeDayKey(dayKey) {
  const value = String(dayKey || '').trim().toLowerCase()
  if (value.startsWith('mon')) return 'mon'
  if (value.startsWith('tue')) return 'tue'
  if (value.startsWith('wed')) return 'wed'
  if (value.startsWith('thu')) return 'thu'
  if (value.startsWith('fri')) return 'fri'
  if (value.startsWith('sat')) return 'sat'
  if (value.startsWith('sun')) return 'sun'
  return value
}

function toWeekLabel(weekId, weekById) {
  const week = weekById[weekId]
  if (week) {
    return formatWeekLabel(week)
  }
  const [, startDate = ''] = String(weekId || '').split(':')
  return startDate || weekId
}

function getCanonicalWeekId(programKey, weekId) {
  const rawWeekId = String(weekId || '').trim()
  if (!rawWeekId) {
    return ''
  }
  if (rawWeekId.startsWith('daycamp:')) {
    const [, startDate = ''] = rawWeekId.split(':')
    return `${programKey}:${startDate}`
  }
  return rawWeekId
}

function formatCalendarDate(value) {
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value || ''
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function isIncludedLunchDay(dayKey) {
  return String(dayKey || '') === 'Thu'
}

function normalizeAccountingEditorDayKey(dayKey) {
  const raw = String(dayKey || '').trim().toLowerCase()
  if (raw.startsWith('mon')) return 'Mon'
  if (raw.startsWith('tue')) return 'Tue'
  if (raw.startsWith('wed')) return 'Wed'
  if (raw.startsWith('thu')) return 'Thu'
  if (raw.startsWith('fri')) return 'Fri'
  return String(dayKey || '').trim()
}

function getLunchWeeksForStudent(student, weeksById) {
  const rows = []
  for (const [weekId, entry] of Object.entries(student?.schedule || {})) {
    const week = weeksById?.[weekId]
    const programKey = week?.programKey || entry?.programKey
    if (programKey === 'overnight') {
      continue
    }

    const sourceDays =
      Array.isArray(week?.days) && week.days.length > 0
        ? week.days
        : accountingEditorDayKeys.map((dayKey) => ({
            key: dayKey,
            date: '',
          }))
    const dayMetaByKey = sourceDays.reduce((acc, day) => {
      acc[normalizeAccountingEditorDayKey(day?.key)] = {
        ...day,
        key: normalizeAccountingEditorDayKey(day?.key),
      }
      return acc
    }, {})

    const selectedDays = Object.entries(entry?.days || {})
      .filter(([, mode]) => mode && mode !== 'NONE')
      .map(([dayKey, mode]) => {
        const normalizedDayKey = normalizeAccountingEditorDayKey(dayKey)
        const dayMeta = dayMetaByKey[normalizedDayKey] || {}
        return {
          dayKey: normalizedDayKey,
          date: dayMeta.date || '',
          mode,
          key: `${weekId}:${normalizedDayKey}`,
        }
      })
      .sort((a, b) => accountingEditorDayKeys.indexOf(a.dayKey) - accountingEditorDayKeys.indexOf(b.dayKey))

    if (selectedDays.length > 0) {
      rows.push({
        weekId,
        week:
          week || {
            id: weekId,
            start: '',
            end: '',
            programLabel: 'Camp Week',
            days: sourceDays,
          },
        selectedDays,
      })
    }
  }
  return rows.sort((a, b) => (a.week.start || a.weekId).localeCompare(b.week.start || b.weekId))
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

function pluralize(label, count) {
  return `${count} ${label}${count === 1 ? '' : 's'}`
}

function getWeekSelectionSummary(entry, week) {
  if (!entry || !week) {
    return ''
  }

  const weekDayKeysRaw = Array.isArray(week.days) ? week.days.map((day) => day.key).filter(Boolean) : []
  const weekDayKeys = weekDayKeysRaw.length > 0 ? weekDayKeysRaw : accountingEditorDayKeys
  const fullWeekSelected = weekDayKeys.every((day) => (entry.days?.[day] || 'NONE') === 'FULL')
  if (fullWeekSelected) {
    return 'Registered: Full Week'
  }

  const counts = { FULL: 0, AM: 0, PM: 0 }
  for (const day of weekDayKeys) {
    const mode = entry.days?.[day] || 'NONE'
    if (mode !== 'NONE') {
      counts[mode] += 1
    }
  }

  const selectedDayTotal = counts.FULL + counts.AM + counts.PM
  if (selectedDayTotal === 0) {
    return ''
  }

  const parts = []
  if (counts.FULL > 0) {
    parts.push(pluralize('Full Day', counts.FULL))
  }
  if (counts.AM > 0) {
    parts.push(pluralize('AM Day', counts.AM))
  }
  if (counts.PM > 0) {
    parts.push(pluralize('PM Day', counts.PM))
  }

  return `Registered: ${pluralize('Day', selectedDayTotal)}${parts.length ? ` (${parts.join(', ')})` : ''}`
}

function buildOvernightAccountingInvoice(weeksSelected, regularWeekPrice, discountedWeekPrice, discountActive) {
  const normalizedWeeks = Math.max(0, Number(weeksSelected || 0))
  const regularRate = Number(regularWeekPrice || 0)
  const activeDiscountedRate = discountActive
    ? Math.min(regularRate || discountedWeekPrice, Number(discountedWeekPrice || 0))
    : regularRate
  const secondWeekDiscount = discountActive && normalizedWeeks >= 2 ? 100 : 0
  const regularSubtotal = normalizedWeeks * regularRate
  const discountedSubtotal = normalizedWeeks * activeDiscountedRate
  const total = Math.max(0, discountedSubtotal - secondWeekDiscount)

  return {
    regularRate,
    discountedRate: activeDiscountedRate,
    secondWeekDiscount,
    secondWeekRate: Math.max(0, activeDiscountedRate - 100),
    regularSubtotal,
    total,
  }
}

function deriveAccountingPaymentState({ entry = {}, tuitionTotal = 0, lunchTotal = 0, manualDiscount = 0 }) {
  const normalizedLunchTotal = roundMoney(Math.max(0, Number(lunchTotal || 0)))
  const tuitionBase = Math.max(0, Number(tuitionTotal || 0) - normalizedLunchTotal)
  const tuitionAfterManualDiscount = roundMoney(Math.max(0, tuitionBase - Math.max(0, Number(manualDiscount || 0))))
  const hasSplitValues = entry?.tuition_paid_amount != null || entry?.lunch_paid_amount != null
  const legacyPaidAmount = Math.max(0, Number(entry?.paid_amount || 0))

  let tuitionPaidAmount = hasSplitValues
    ? Math.max(0, Number(entry?.tuition_paid_amount || 0))
    : Math.min(legacyPaidAmount, tuitionAfterManualDiscount)
  tuitionPaidAmount = roundMoney(Math.min(tuitionAfterManualDiscount, tuitionPaidAmount))

  let lunchPaidAmount = hasSplitValues
    ? Math.max(0, Number(entry?.lunch_paid_amount || 0))
    : Math.max(0, legacyPaidAmount - tuitionPaidAmount)
  lunchPaidAmount = roundMoney(Math.min(normalizedLunchTotal, lunchPaidAmount))

  const totalPaidAmount = roundMoney(tuitionPaidAmount + lunchPaidAmount)
  const tuitionOwedAmount = roundMoney(Math.max(0, tuitionAfterManualDiscount - tuitionPaidAmount))
  const lunchOwedAmount = roundMoney(Math.max(0, normalizedLunchTotal - lunchPaidAmount))
  const totalAfterManualDiscount = roundMoney(tuitionAfterManualDiscount + normalizedLunchTotal)
  const totalOwedAmount = roundMoney(tuitionOwedAmount + lunchOwedAmount)
  const tuitionPaidPct = tuitionAfterManualDiscount > 0 ? tuitionPaidAmount / tuitionAfterManualDiscount : 0

  return {
    tuitionBase: roundMoney(tuitionBase),
    tuitionAfterManualDiscount,
    lunchTotal: normalizedLunchTotal,
    totalAfterManualDiscount,
    tuitionPaidAmount,
    lunchPaidAmount,
    totalPaidAmount,
    tuitionOwedAmount,
    lunchOwedAmount,
    totalOwedAmount,
    tuitionPaidPct,
    shouldStopRegistrationEmails:
      (tuitionAfterManualDiscount > 0 && tuitionPaidPct >= 0.95) ||
      (totalAfterManualDiscount > 0 && totalOwedAmount <= 0),
  }
}

function formatWeekCountSummary(counts = {}, programKey = 'general') {
  const parts = []
  if (Number(counts.fullWeek || 0) > 0) {
    parts.push(`${counts.fullWeek} full week${counts.fullWeek === 1 ? '' : 's'}`)
  }
  if (Number(counts.fullDay || 0) > 0) {
    parts.push(
      `${counts.fullDay} ${programKey === 'overnight' ? 'camp day' : 'full day'}${counts.fullDay === 1 ? '' : 's'}`
    )
  }
  if (Number(counts.amHalf || 0) > 0) {
    parts.push(`${counts.amHalf} AM day${counts.amHalf === 1 ? '' : 's'}`)
  }
  if (Number(counts.pmHalf || 0) > 0) {
    parts.push(`${counts.pmHalf} PM day${counts.pmHalf === 1 ? '' : 's'}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'No selected days'
}

function buildAccountingCalendarLines({ camperName, student, weekById, weekNumberById }) {
  const schedule = getStudentScheduleForAccounting(student)
  const lunch = typeof student?.lunch === 'object' && student?.lunch ? student.lunch : {}
  const rows = [`Calendar for ${camperName}`]

  const sortedWeeks = Object.entries(schedule).sort((a, b) => {
    const weekA = weekById[a[0]]
    const weekB = weekById[b[0]]
    return String(weekA?.start || a[0]).localeCompare(String(weekB?.start || b[0]))
  })

  for (const [weekId, entry] of sortedWeeks) {
    const week = weekById[weekId]
    const programKey =
      entry?.programKey === 'daycamp'
        ? entry?.campType || 'general'
        : entry?.programKey || entry?.campType || (String(weekId).startsWith('overnight:') ? 'overnight' : 'general')
    const weekLabel = weekNumberById[weekId]?.label || toWeekLabel(weekId, weekById)
    rows.push(`${weekLabel} (${toWeekLabel(weekId, weekById)})`)

    const dayDefs =
      Array.isArray(week?.days) && week.days.length > 0
        ? week.days
        : getWeekDayKeysForProgram(programKey).map((dayKey) => ({ key: dayKey, label: dayKey, date: '' }))

    for (const day of dayDefs) {
      const mode = entry?.days?.[day.key] || 'NONE'
      if (mode === 'NONE') {
        continue
      }
      if (programKey === 'overnight') {
        rows.push(`- ${day.label || day.key}: ${formatCalendarDate(day.date)} · Overnight camp day`)
        continue
      }
      const lunchKey = `${weekId}:${day.key}`
      const lunchLabel =
        day.key === 'thursday' || day.key === 'Thu'
          ? 'BBQ lunch included'
          : lunch[lunchKey]
            ? 'Lunch selected'
            : 'Pack lunch needed'
      rows.push(
        `- ${day.label || day.key}: ${formatCalendarDate(day.date)} · ${mode} · ${lunchLabel}`
      )
    }
  }

  if (rows.length === 1) {
    rows.push('No calendar selections saved.')
  }

  return rows
}

function resolveRosterProgramKey(scheduleItem) {
  if (scheduleItem?.programKey === 'daycamp') {
    return scheduleItem?.entry?.campType || 'general'
  }
  return scheduleItem?.programKey || scheduleItem?.entry?.campType || 'general'
}

function shouldShowInRoster(row) {
  return !row?.archived && Array.isArray(row?.scheduleByWeek) && row.scheduleByWeek.length > 0
}

function formatRosterValue(value, emptyLabel = 'None reported') {
  const normalized = String(value || '').trim()
  return normalized || emptyLabel
}

function normalizeRosterFilenamePart(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function downloadPdfBase64(filename, pdfBase64) {
  const normalized = String(pdfBase64 || '').replace(/\s+/g, '')
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getStudentScheduleForAccounting(student) {
  const directSchedule = typeof student?.schedule === 'object' && student?.schedule ? student.schedule : {}
  if (Object.keys(directSchedule).length > 0) {
    return directSchedule
  }

  const overnightWeekIds = Array.isArray(student?.overnightWeekIds) ? student.overnightWeekIds : []
  if (overnightWeekIds.length === 0) {
    return {}
  }

  return Object.fromEntries(
    overnightWeekIds.map((weekId) => [
      weekId,
      {
        programKey: 'overnight',
        campType: 'overnight',
        days: {
          sunday: 'FULL',
          monday: 'FULL',
          tuesday: 'FULL',
          wednesday: 'FULL',
          thursday: 'FULL',
          friday: 'FULL',
          saturday: 'FULL',
        },
      },
    ])
  )
}

function formatAdminDateTime(value) {
  if (!value) {
    return '-'
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString()
}

function buildCamperPricing({
  student,
  siblingDiscountEligible,
  tuition,
  discountActive,
  lunchPrice,
  weekById,
}) {
  const regular = tuition.regular || {}
  const discount = tuition.discount || {}
  const bootcampTuition = resolveBootcampTuition(tuition)
  const schedule = getStudentScheduleForAccounting(student)
  const lunch = typeof student?.lunch === 'object' && student?.lunch ? student.lunch : {}

  const totals = {
    general: 0,
    bootcamp: 0,
    overnight: 0,
    regularGeneral: 0,
    regularBootcamp: 0,
    regularOvernight: 0,
    lunchCost: 0,
    lunchDays: [],
    paidLunchCount: 0,
    weekIds: [],
    scheduleByWeek: [],
    weekDetails: [],
    countsByProgram: {
      general: { fullWeek: 0, fullDay: 0, amHalf: 0, pmHalf: 0 },
      bootcamp: { fullWeek: 0, fullDay: 0, amHalf: 0, pmHalf: 0 },
      overnight: { fullWeek: 0, fullDay: 0, amHalf: 0, pmHalf: 0 },
    },
  }

  for (const [weekId, entry] of Object.entries(schedule)) {
    const programKey =
      entry?.programKey === 'daycamp'
        ? entry?.campType || 'general'
        : entry?.programKey || entry?.campType || (String(weekId).startsWith('overnight:') ? 'overnight' : 'general')
    const canonicalWeekId = getCanonicalWeekId(programKey, weekId)
    const resolvedWeek = weekById[canonicalWeekId] || weekById[weekId] || null
    const dayKeys = Object.keys(entry?.days || {})
    const resolvedDayKeys = dayKeys.length > 0 ? dayKeys : getWeekDayKeysForProgram(programKey)
    const modes = resolvedDayKeys.map((dayKey) => entry?.days?.[dayKey] || 'NONE')
    const fullWeekSelected = modes.every((mode) => mode === 'FULL')
    const counts = { fullWeek: 0, fullDay: 0, amHalf: 0, pmHalf: 0 }

    if (programKey === 'overnight') {
      if (fullWeekSelected) {
        counts.fullWeek = 1
      } else {
        counts.fullDay = modes.filter((mode) => mode !== 'NONE').length
      }
    } else if (fullWeekSelected) {
      counts.fullWeek = 1
    } else {
      for (const mode of modes) {
        if (mode === 'FULL') counts.fullDay += 1
        if (mode === 'AM') counts.amHalf += 1
        if (mode === 'PM') counts.pmHalf += 1
      }
    }

    const programRegularRates =
      programKey === 'bootcamp'
        ? bootcampTuition.regular
        : programKey === 'overnight'
          ? { fullWeek: Number(regular.overnightWeek || 0), fullDay: Number(regular.overnightDay || 0), amHalf: 0, pmHalf: 0 }
          : {
              fullWeek: Number(regular.fullWeek || 0),
              fullDay: Number(regular.fullDay || 0),
              amHalf: Number(regular.amHalf || 0),
              pmHalf: Number(regular.pmHalf || 0),
            }
    const programDiscountRates =
      programKey === 'bootcamp'
        ? bootcampTuition.discount
        : programKey === 'overnight'
          ? { fullWeek: Number(discount.overnightWeek || 0), fullDay: Number(discount.overnightDay || 0), amHalf: 0, pmHalf: 0 }
          : {
              fullWeek: Number(discount.fullWeek || 0),
              fullDay: Number(discount.fullDay || 0),
              amHalf: Number(discount.amHalf || 0),
              pmHalf: Number(discount.pmHalf || 0),
            }

    const regularTotal =
      counts.fullWeek * programRegularRates.fullWeek +
      counts.fullDay * programRegularRates.fullDay +
      counts.amHalf * programRegularRates.amHalf +
      counts.pmHalf * programRegularRates.pmHalf
    const discountedTotal =
      counts.fullWeek * programDiscountRates.fullWeek +
      counts.fullDay * programDiscountRates.fullDay +
      counts.amHalf * programDiscountRates.amHalf +
      counts.pmHalf * programDiscountRates.pmHalf
    const effectiveTotal =
      programKey === 'overnight'
        ? buildOvernightAccountingInvoice(
            counts.fullWeek,
            programRegularRates.fullWeek,
            programDiscountRates.fullWeek || programRegularRates.fullWeek,
            discountActive
          ).total
        : discountActive
          ? Math.max(0, Math.min(regularTotal, discountedTotal || regularTotal))
          : regularTotal

    if (programKey === 'bootcamp') {
      totals.bootcamp += effectiveTotal
      totals.regularBootcamp += regularTotal
    } else if (programKey === 'overnight') {
      totals.overnight += effectiveTotal
      totals.regularOvernight += regularTotal
    } else {
      totals.general += effectiveTotal
      totals.regularGeneral += regularTotal
    }
    totals.countsByProgram[programKey].fullWeek += counts.fullWeek
    totals.countsByProgram[programKey].fullDay += counts.fullDay
    totals.countsByProgram[programKey].amHalf += counts.amHalf
    totals.countsByProgram[programKey].pmHalf += counts.pmHalf

    totals.weekIds.push(canonicalWeekId || weekId)
    totals.scheduleByWeek.push({ weekId: canonicalWeekId || weekId, sourceWeekId: weekId, programKey, entry })
    totals.weekDetails.push({
      weekId: canonicalWeekId || weekId,
      programKey,
      label: resolvedWeek ? formatWeekLabel(resolvedWeek) : toWeekLabel(canonicalWeekId || weekId, weekById),
      counts,
      isFullWeek: counts.fullWeek > 0,
      detailLines: [
        `${(programKey === 'bootcamp'
          ? 'Boot Camp'
          : programKey === 'overnight'
            ? 'Overnight Camp'
            : 'General Camp')} · ${formatWeekCountSummary(counts, programKey)}`,
      ],
    })

    if (programKey === 'overnight' && counts.fullWeek > 0) {
      const overnightInvoice = buildOvernightAccountingInvoice(
        counts.fullWeek,
        programRegularRates.fullWeek,
        programDiscountRates.fullWeek || programRegularRates.fullWeek,
        discountActive
      )
      const overnightLines = [
        `Regular: ${money(overnightInvoice.regularRate)}/week`,
      ]
      if (discountActive) {
        overnightLines.push(`Discounted: ${money(overnightInvoice.discountedRate)}/week`)
        if (overnightInvoice.secondWeekDiscount > 0) {
          overnightLines.push(
            `Week 2 extra discount: -${money(overnightInvoice.secondWeekDiscount)} (week 2 = ${money(overnightInvoice.secondWeekRate)})`
          )
        }
      }
      overnightLines.push(`Overnight subtotal: ${money(overnightInvoice.total)}`)
      totals.weekDetails[totals.weekDetails.length - 1].detailLines.push(...overnightLines)
    }

    if (programKey !== 'overnight') {
      for (const dayKey of resolvedDayKeys) {
        const mode = entry?.days?.[dayKey] || 'NONE'
        if (mode === 'NONE') {
          continue
        }
        const lunchKey = `${weekId}:${dayKey}`
        if (normalizeDayKey(dayKey) === 'thu') {
          totals.lunchDays.push(`${toWeekLabel(canonicalWeekId || weekId, weekById)} · Thu BBQ included`)
          continue
        }
        if (lunch[lunchKey]) {
          totals.paidLunchCount += 1
          totals.lunchDays.push(`${toWeekLabel(canonicalWeekId || weekId, weekById)} · ${dayKey.slice(0, 3).toUpperCase()} lunch`)
        }
      }
    }
  }

  totals.lunchCost = totals.paidLunchCount * Number(lunchPrice || 0)
  const regularTuitionSubtotal = totals.regularGeneral + totals.regularBootcamp + totals.regularOvernight
  const tuitionSubtotal = totals.general + totals.bootcamp + totals.overnight
  const weekTierPromo = student
    ? getWeekTierPromoForStudent(student, weekById, tuition, {
        applyLimitedDiscount: discountActive,
      })
    : { eligible: false, amount: 0, breakdown: [] }
  const weekTierPromoAmount = roundMoney(Math.max(0, Number(weekTierPromo.amount || 0)))
  const weekTierPromoLines = getWeekTierPromoDisplayLines(weekTierPromo)
  const tuitionSubtotalAfterPromo = Math.max(0, tuitionSubtotal - weekTierPromoAmount)
  const hasNonOvernightTuition = Number(totals.general || 0) > 0 || Number(totals.bootcamp || 0) > 0
  const siblingDiscountPct =
    siblingDiscountEligible && hasNonOvernightTuition ? Number(tuition.siblingDiscountPct || 0) : 0
  const siblingAfterLimitedDiscount =
    siblingDiscountPct > 0
      ? Math.max(0, Number(tuitionSubtotalAfterPromo || 0) - Number(totals.overnight || 0)) * (siblingDiscountPct / 100)
      : 0
  const tuitionAfterSibling = Math.max(0, tuitionSubtotalAfterPromo - siblingAfterLimitedDiscount)
  const totalWithSibling = tuitionAfterSibling + totals.lunchCost

  totals.regularTotal = roundMoney(regularTuitionSubtotal + totals.lunchCost)
  totals.tuitionSubtotal = roundMoney(tuitionSubtotal)
  totals.weekTierPromoAmount = weekTierPromoAmount
  totals.weekTierPromoLines = weekTierPromoLines
  totals.subtotal = roundMoney(tuitionSubtotalAfterPromo + totals.lunchCost)
  totals.siblingDiscount = roundMoney(siblingAfterLimitedDiscount)
  totals.total = roundMoney(totalWithSibling)
  totals.siblingDiscountPct = siblingDiscountPct
  totals.general = roundMoney(totals.general)
  totals.bootcamp = roundMoney(totals.bootcamp)
  totals.overnight = roundMoney(totals.overnight)
  totals.regularGeneral = roundMoney(totals.regularGeneral)
  totals.regularBootcamp = roundMoney(totals.regularBootcamp)
  totals.regularOvernight = roundMoney(totals.regularOvernight)
  totals.lunchCost = roundMoney(totals.lunchCost)
  return totals
}

export default function AdminPage() {
  const router = useRouter()
  const [config, setConfig] = useState(getInitialState)
  const [activeAdminTab, setActiveAdminTab] = useState('media')
  const [activeMediaSubtab, setActiveMediaSubtab] = useState('overview')
  const [activeJourneyTab, setActiveJourneyTab] = useState(0)
  const [activeJourneyFlow, setActiveJourneyFlow] = useState('lead')
  const [activeReservationJourneyTab, setActiveReservationJourneyTab] = useState(0)
  const [activePaidEnrollmentJourneyTab, setActivePaidEnrollmentJourneyTab] = useState(0)
  const [paidEnrollmentPreviewTrack, setPaidEnrollmentPreviewTrack] = useState('general')
  const [activeReservationTrackerView, setActiveReservationTrackerView] = useState('standard')
  const [activeTrackingSubtab, setActiveTrackingSubtab] = useState('lead')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [journeyProcessSummary, setJourneyProcessSummary] = useState(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [activeLibraryPreviewIndex, setActiveLibraryPreviewIndex] = useState(0)
  const [openLevelUpScreenshotLibraryPicker, setOpenLevelUpScreenshotLibraryPicker] = useState(null)
  const [openStepLibraryPicker, setOpenStepLibraryPicker] = useState(null)
  const [openLandingCarouselLibraryPicker, setOpenLandingCarouselLibraryPicker] = useState(null)
  const [openRegistrationStepLibraryPicker, setOpenRegistrationStepLibraryPicker] = useState(null)
  const [openFacilityLibraryPicker, setOpenFacilityLibraryPicker] = useState(null)
  const [openOvernightLandingLibraryPicker, setOpenOvernightLandingLibraryPicker] = useState(null)
  const [openOvernightRegistrationLibraryPicker, setOpenOvernightRegistrationLibraryPicker] = useState(null)
  const [openCampTypeShowcaseLibraryPicker, setOpenCampTypeShowcaseLibraryPicker] = useState(null)
  const [selectedOvernightGalleryLibraryUrls, setSelectedOvernightGalleryLibraryUrls] = useState([])
  const [loadingEmailTracking, setLoadingEmailTracking] = useState(false)
  const [emailJourneyRuns, setEmailJourneyRuns] = useState([])
  const [emailReplies, setEmailReplies] = useState([])
  const [emailEvents, setEmailEvents] = useState([])
  const [registrationRecords, setRegistrationRecords] = useState([])
  const [accountingDrafts, setAccountingDrafts] = useState({})
  const [leadProfiles, setLeadProfiles] = useState([])
  const [loadingAccounting, setLoadingAccounting] = useState(false)
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [updatingAccountingKey, setUpdatingAccountingKey] = useState('')
  const [sendingInvoiceKey, setSendingInvoiceKey] = useState('')
  const [exportingRosterKey, setExportingRosterKey] = useState('')
  const [selectedRosterWeekKeys, setSelectedRosterWeekKeys] = useState([])
  const [expandedRosterWeekKeys, setExpandedRosterWeekKeys] = useState([])
  const [rosterSearchTerm, setRosterSearchTerm] = useState('')
  const [invoicePreviewState, setInvoicePreviewState] = useState({
    open: false,
    title: '',
    html: '',
  })
  const [journeyCellPreviewState, setJourneyCellPreviewState] = useState({
    open: false,
    title: '',
    subject: '',
    html: '',
  })
  const [journeyCalendarState, setJourneyCalendarState] = useState({
    open: false,
    title: '',
    entries: [],
  })
  const [invoiceSendDialog, setInvoiceSendDialog] = useState({
    open: false,
    row: null,
    sendAdminCopy: true,
  })
  const [accountingEditState, setAccountingEditState] = useState({
    open: false,
    row: null,
    sourceRecordId: 0,
    registration: null,
    expandedWeekKey: '',
    expandedLunchWeekKey: '',
  })
  const [testEmail, setTestEmail] = useState('')
  const [sendingTestStep, setSendingTestStep] = useState(0)
  const [aiReplyInput, setAiReplyInput] = useState({
    customerName: '',
    subject: '',
    message: '',
    tone: 'professional',
  })
  const [aiReplyDraft, setAiReplyDraft] = useState('')
  const [aiReplyLoading, setAiReplyLoading] = useState(false)
  const [selectedReplyId, setSelectedReplyId] = useState(0)
  const [replyFilterEmail, setReplyFilterEmail] = useState('')
  const [eventFlowFilter, setEventFlowFilter] = useState('all')
  const [eventJourneyFilter, setEventJourneyFilter] = useState('all')
  const [eventDeliveryFilter, setEventDeliveryFilter] = useState('all')
  const [previewingEventRowKey, setPreviewingEventRowKey] = useState('')
  const [updatingRunId, setUpdatingRunId] = useState(0)
  const [processingJourneyEmails, setProcessingJourneyEmails] = useState(false)
  const [repairingReservationRuns, setRepairingReservationRuns] = useState(false)
  const [assigningRunEmail, setAssigningRunEmail] = useState('')
  const [assigningRunKey, setAssigningRunKey] = useState('')
  const [settingTrackerVisibilityKey, setSettingTrackerVisibilityKey] = useState('')
  const [selectedRunAssignmentByRow, setSelectedRunAssignmentByRow] = useState({})
  const [sendingJourneyCellKey, setSendingJourneyCellKey] = useState('')
  const [previewingJourneyCellKey, setPreviewingJourneyCellKey] = useState('')
  const [expandedReservationDebugKey, setExpandedReservationDebugKey] = useState('')
  const [accountingOverlay, setAccountingOverlay] = useState({
    key: '',
    label: '',
    items: [],
    top: 0,
    left: 0,
    pointerLeft: 24,
  })

  const refreshMediaLibrary = useCallback(async () => {
    setLoadingLibrary(true)
    const { items, error } = await listMediaLibrary()
    if (error) {
      setErrorMessage(`Media library failed: ${error.message}`)
      setLoadingLibrary(false)
      return
    }

    setMediaLibrary(items)
    setLoadingLibrary(false)
  }, [])

  const refreshEmailTracking = useCallback(async () => {
    if (!supabaseEnabled || !supabase) {
      return
    }

    setLoadingEmailTracking(true)
    const [runsResponse, repliesResponse, eventsResponse] = await Promise.all([
      supabase
        .from('email_journey_runs')
        .select('id, email, status, current_step, last_sent_at, next_send_at, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('email_replies')
        .select('id, email, from_email, subject, body_text, is_unread, received_at, ai_status, ai_error, ai_draft')
        .order('received_at', { ascending: false })
        .limit(30),
      supabase
        .from('email_journey_events')
        .select('id, run_id, email, step_number, event_type, event_at, subject, event_payload')
        .order('event_at', { ascending: false })
        .limit(400),
    ])

    const firstError = runsResponse.error || repliesResponse.error || eventsResponse.error
    if (firstError) {
      setErrorMessage(`Email tracking load failed: ${firstError.message}`)
      setLoadingEmailTracking(false)
      return
    }

    setEmailJourneyRuns(runsResponse.data || [])
    setEmailReplies(repliesResponse.data || [])
    setEmailEvents(eventsResponse.data || [])
    setLoadingEmailTracking(false)
  }, [])

  const refreshRegistrationAccounting = useCallback(async () => {
    if (!supabaseEnabled || !supabase) {
      return
    }
    setLoadingAccounting(true)
    let response = await supabase
      .from('registrations')
      .select('id, guardian_name, guardian_email, created_at, medical_notes, accounting_entries')
      .order('created_at', { ascending: false })
      .limit(500)

    if (response.error && String(response.error.message || '').toLowerCase().includes('accounting_entries')) {
      response = await supabase
        .from('registrations')
        .select('id, guardian_name, guardian_email, created_at, medical_notes')
        .order('created_at', { ascending: false })
        .limit(500)
    }

    if (response.error) {
      const rawMessage = String(response.error.message || '')
      const tableMissing = rawMessage.includes("Could not find the table 'public.registrations'")
      setErrorMessage(
        tableMissing
          ? 'Registration accounting load failed: the Supabase table public.registrations does not exist in this project yet. Run the SQL setup for registrations first.'
          : `Registration accounting load failed: ${response.error.message}`
      )
      setLoadingAccounting(false)
      return
    }

    setRegistrationRecords(
      (response.data || []).map((item) => ({
        ...item,
        accounting_entries: Array.isArray(item.accounting_entries) ? item.accounting_entries : [],
      }))
    )
    setLoadingAccounting(false)
  }, [])

  const refreshLeadProfiles = useCallback(async () => {
    if (!supabaseEnabled || !supabase) {
      return
    }
    setLoadingLeads(true)
    const [leadResponse, registrationResponse] = await Promise.all([
      supabase
        .from('program_interest_profiles')
        .select('id, email, camper_count, camper_ages, source, created_at, last_completed_step')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('registrations').select('guardian_email'),
    ])

    if (leadResponse.error) {
      setErrorMessage(`Lead load failed: ${leadResponse.error.message}`)
      setLoadingLeads(false)
      return
    }

    if (registrationResponse.error) {
      setErrorMessage(`Lead load failed: ${registrationResponse.error.message}`)
      setLoadingLeads(false)
      return
    }

    const registeredEmails = new Set(
      (registrationResponse.data || [])
        .map((row) => String(row?.guardian_email || '').trim().toLowerCase())
        .filter(Boolean)
    )

    setLeadProfiles(
      (leadResponse.data || []).filter((lead) => !registeredEmails.has(String(lead?.email || '').trim().toLowerCase()))
    )
    setLoadingLeads(false)
  }, [])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!supabaseEnabled || !supabase) {
        if (active) {
          setErrorMessage('Supabase env vars are missing.')
          setLoading(false)
        }
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      if (active) {
        setAdminEmail(session.user.email || '')
      }

      const { data, error } = await fetchAdminConfigFromSupabase()
      if (!active) {
        return
      }

      if (error) {
        setErrorMessage(`Load failed: ${error.message}`)
      } else {
        setErrorMessage('')
      }

      setConfig(data)
      setLoading(false)
      refreshMediaLibrary()
      refreshEmailTracking()
      refreshRegistrationAccounting()
      refreshLeadProfiles()
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [refreshEmailTracking, refreshLeadProfiles, refreshMediaLibrary, refreshRegistrationAccounting, router])

  const weekOptions = useMemo(
    () => ({
      general: buildProgramWeekOptions(
        'general',
        config.programs.general.startDate,
        config.programs.general.endDate
      ),
      bootcamp: buildProgramWeekOptions(
        'bootcamp',
        config.programs.bootcamp.startDate,
        config.programs.bootcamp.endDate
      ),
      overnight: buildProgramWeekOptions(
        'overnight',
        config.programs.overnight.startDate,
        config.programs.overnight.endDate
      ),
    }),
    [config.programs]
  )
  const tuitionChecks = useMemo(() => buildTuitionChecks(config.tuition), [config.tuition])
  const bootcampTuition = useMemo(() => resolveBootcampTuition(config.tuition), [config.tuition])
  const bootcampChecks = useMemo(() => buildBootcampChecks(config.tuition), [config.tuition])
  const activePreviewUrl =
    config.media.levelUpScreenshotUrls[activePreviewIndex] || config.media.levelUpScreenshotUrls[0] || ''
  const activeLibraryPreviewUrl =
    mediaLibrary[activeLibraryPreviewIndex]?.publicUrl || mediaLibrary[0]?.publicUrl || ''
  const accountingDiscountActive = useMemo(
    () => isLimitedDiscountActiveForDate(config.tuition.discountEndDate, new Date().toISOString()),
    [config.tuition.discountEndDate]
  )
  const accountingPricingReference = useMemo(() => {
    const regular = config.tuition.regular || {}
    const discount = config.tuition.discount || {}
    const activeLabel = accountingDiscountActive ? 'Current full-week price' : 'Regular full-week price'
    const discountDate = parseDiscountDate(config.tuition.discountEndDate)
    const discountDateLabel = discountDate ? discountDate.toLocaleDateString() : ''

    return [
      {
        key: 'general',
        title: 'General Camp',
        activeLabel,
        activeFullWeek: accountingDiscountActive ? Number(discount.fullWeek || 0) : Number(regular.fullWeek || 0),
        regularFullWeek: Number(regular.fullWeek || 0),
        showRegularNote:
          accountingDiscountActive && Number(discount.fullWeek || 0) > 0 && Number(discount.fullWeek || 0) !== Number(regular.fullWeek || 0),
        note:
          accountingDiscountActive && discountDateLabel
            ? `Discount active through ${discountDateLabel}`
            : 'Standard pricing reference',
        rows: [
          { label: 'Full Day', value: Number(regular.fullDay || 0), discountedValue: Number(discount.fullDay || 0) },
          { label: 'AM Half Day', value: Number(regular.amHalf || 0), discountedValue: Number(discount.amHalf || 0) },
          { label: 'PM Half Day', value: Number(regular.pmHalf || 0), discountedValue: Number(discount.pmHalf || 0) },
        ],
      },
      {
        key: 'bootcamp',
        title: 'Boot Camp',
        activeLabel,
        activeFullWeek: accountingDiscountActive
          ? Number(bootcampTuition.discount.fullWeek || 0)
          : Number(bootcampTuition.regular.fullWeek || 0),
        regularFullWeek: Number(bootcampTuition.regular.fullWeek || 0),
        showRegularNote:
          accountingDiscountActive &&
          Number(bootcampTuition.discount.fullWeek || 0) > 0 &&
          Number(bootcampTuition.discount.fullWeek || 0) !== Number(bootcampTuition.regular.fullWeek || 0),
        note: 'Uses the saved Boot Camp tuition fields.',
        rows: [
          {
            label: 'Full Day',
            value: Number(bootcampTuition.regular.fullDay || 0),
            discountedValue: Number(bootcampTuition.discount.fullDay || 0),
          },
          {
            label: 'AM Half Day',
            value: Number(bootcampTuition.regular.amHalf || 0),
            discountedValue: Number(bootcampTuition.discount.amHalf || 0),
          },
          {
            label: 'PM Half Day',
            value: Number(bootcampTuition.regular.pmHalf || 0),
            discountedValue: Number(bootcampTuition.discount.pmHalf || 0),
          },
        ],
      },
      {
        key: 'overnight',
        title: 'Overnight Camp',
        activeLabel,
        activeFullWeek: accountingDiscountActive ? Number(discount.overnightWeek || 0) : Number(regular.overnightWeek || 0),
        regularFullWeek: Number(regular.overnightWeek || 0),
        showRegularNote:
          accountingDiscountActive &&
          Number(discount.overnightWeek || 0) > 0 &&
          Number(discount.overnightWeek || 0) !== Number(regular.overnightWeek || 0),
        note: accountingDiscountActive
          ? 'Week 1 uses the discounted overnight full-week price. Week 2 gets an extra $100 off.'
          : 'Accounting uses overnight full-week pricing only.',
        rows: accountingDiscountActive
          ? [
              {
                label: 'Second Week Special',
                value: Number(discount.overnightWeek || 0),
                discountedValue: Math.max(0, Number(discount.overnightWeek || 0) - 100),
              },
            ]
          : [],
      },
    ]
  }, [accountingDiscountActive, bootcampTuition.discount.amHalf, bootcampTuition.discount.fullDay, bootcampTuition.discount.fullWeek, bootcampTuition.discount.pmHalf, bootcampTuition.regular.amHalf, bootcampTuition.regular.fullDay, bootcampTuition.regular.fullWeek, bootcampTuition.regular.pmHalf, config.tuition.discount, config.tuition.discountEndDate, config.tuition.regular])
  const imageLibrary = useMemo(
    () => mediaLibrary.filter((item) => !isVideoUrl(item.publicUrl)),
    [mediaLibrary]
  )
  const filteredEmailReplies = useMemo(
    () =>
      replyFilterEmail
        ? emailReplies.filter((item) => (item.email || item.from_email || '') === replyFilterEmail)
        : emailReplies,
    [emailReplies, replyFilterEmail]
  )
  const filteredEmailEvents = useMemo(
    () =>
      emailEvents.filter((event) => {
        if (eventDeliveryFilter !== 'all' && getEmailEventDeliveryFilter(event) !== eventDeliveryFilter) {
          return false
        }
        if (eventFlowFilter !== 'all' && getEmailEventFlowFilter(event) !== eventFlowFilter) {
          return false
        }
        if (eventJourneyFilter !== 'all' && getEmailEventJourneyFilter(event) !== eventJourneyFilter) {
          return false
        }
        return true
      }),
    [emailEvents, eventDeliveryFilter, eventFlowFilter, eventJourneyFilter]
  )
  const chronologicalEmailEvents = useMemo(
    () =>
      [...emailEvents].sort((a, b) => {
        const timeDiff = new Date(a?.event_at || 0).getTime() - new Date(b?.event_at || 0).getTime()
        if (timeDiff !== 0) {
          return timeDiff
        }
        return Number(a?.id || 0) - Number(b?.id || 0)
      }),
    [emailEvents]
  )
  const leadJourneyTrackerRows = useMemo(() => {
    const registeredEmails = new Set(
      registrationRecords
        .filter((item) => !isArchivedRegistrationRecord(item))
        .map((item) => normalizeAdminEmail(item?.guardian_email))
        .filter(Boolean)
    )
    const trackerMap = new Map()
    const leadRunMap = new Map()
    const leadRunIds = new Set(
      chronologicalEmailEvents
        .filter((event) => {
          const eventType = String(event?.event_type || '')
          return (
            eventType.startsWith('lead_journey_') ||
            eventType === 'test_sent_lead' ||
            eventType === 'test_preview_only_lead'
          )
        })
        .map((event) => Number(event?.run_id || 0))
        .filter((runId) => runId > 0)
    )

    for (const run of emailJourneyRuns) {
      const email = normalizeAdminEmail(run?.email)
      if (!email) continue
      const runId = Number(run?.id || 0)
      const statusValue = String(run?.status || '')
      const isLeadRun = statusValue.startsWith('lead_') || leadRunIds.has(runId)
      if (!isLeadRun) {
        continue
      }
      const current = leadRunMap.get(email)
      if (!current || new Date(run.created_at || 0).getTime() > new Date(current.created_at || 0).getTime()) {
        leadRunMap.set(email, run)
      }
    }

    const ensureRow = (email) => {
      const normalized = normalizeAdminEmail(email)
      if (!normalized) return null
      if (!trackerMap.has(normalized)) {
        trackerMap.set(normalized, {
          email: normalized,
          runId: null,
          source: '',
          createdAt: '',
          nextSendAt: '',
          status: '',
          isRegistered: registeredEmails.has(normalized),
          criteria: [],
          steps: Object.fromEntries(leadTrackerColumns.map((column) => [column.key, buildTrackerCell()])),
        })
      }
      return trackerMap.get(normalized)
    }

    for (const lead of leadProfiles) {
      const row = ensureRow(lead?.email)
      if (!row) continue
      row.source = lead?.source || row.source
      row.createdAt = lead?.created_at || row.createdAt
    }

    for (const event of chronologicalEmailEvents) {
      const email = normalizeAdminEmail(event?.email)
      const row = ensureRow(email)
      if (!row) continue
      const eventType = String(event?.event_type || '')
      const stepNumber = Number(event?.step_number || 0)
      if (
        !eventType.startsWith('lead_journey_') &&
        eventType !== 'lead_step_auto_skipped' &&
        eventType !== 'test_sent_lead' &&
        eventType !== 'test_preview_only_lead'
      ) {
        continue
      }
      if (stepNumber < 1 || stepNumber > 5) {
        continue
      }
      const key = `step_${stepNumber}`
      if (eventType === 'lead_journey_sent' || eventType === 'test_sent_lead') {
        row.steps[key] = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'lead_journey_opened') {
        row.steps[key] = upgradeTrackerCellToOpened(row.steps[key], event?.event_at)
      } else if ((eventType === 'lead_journey_preview' || eventType === 'test_preview_only_lead') && row.steps[key].status !== 'sent') {
        row.steps[key] = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'lead_step_auto_skipped' && row.steps[key].status === 'pending') {
        row.steps[key] = buildTrackerCell('skipped', event?.event_at)
      } else if (eventType === 'lead_journey_error' && row.steps[key].status === 'pending') {
        row.steps[key] = buildTrackerCell('error', event?.event_at)
      }
    }

    for (const [email, run] of leadRunMap.entries()) {
      const row = ensureRow(email)
      if (!row) continue
      row.runId = Number(run?.id || 0) || row.runId
      row.status = run?.status || row.status
      row.nextSendAt = String(run?.next_send_at || '').trim() || row.nextSendAt
      const currentStep = Number(run?.current_step || 0)
      if (currentStep === 0 && row.steps.step_1.status === 'pending') {
        row.steps.step_1 = buildTrackerCell(run?.status === 'error' ? 'error' : 'queued', run?.next_send_at || '')
      } else if (currentStep > 0 && currentStep <= 5 && row.steps[`step_${currentStep}`].status === 'pending') {
        row.steps[`step_${currentStep}`] = buildTrackerCell('scheduled', run?.next_send_at || run?.last_sent_at || '')
      }
    }

    return Array.from(trackerMap.values())
      .map((row) => ({ ...row, criteria: buildLeadCriteria(row, row.isRegistered) }))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [chronologicalEmailEvents, emailJourneyRuns, leadProfiles, registrationRecords])
  const weekById = useMemo(() => {
    const map = {}
    for (const week of [...weekOptions.general, ...weekOptions.bootcamp, ...weekOptions.overnight]) {
      map[week.id] = week
    }
    return map
  }, [weekOptions.bootcamp, weekOptions.general, weekOptions.overnight])
  const reservationJourneyTrackerRows = useMemo(() => {
    const rows = []
    const rowByKey = new Map()
    const rowByRunId = new Map()
    const unmatchedRunsByEmail = new Map()
    const archivedRegistrationIds = new Set()
    const archivedRegistrationEmails = new Set()
    const hiddenStateByRegistrationId = {}
    const hiddenStateByRunId = {}
    const nonLeadRuns = emailJourneyRuns
      .filter((run) => !String(run?.status || '').startsWith('lead_'))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    const liveNonLeadRuns = nonLeadRuns.filter((run) => !isTestJourneyStatus(run?.status))
    const testNonLeadRuns = nonLeadRuns.filter((run) => isTestJourneyStatus(run?.status))
    const manualRunIdByRegistrationId = {}

    const getDistance = (left, right) => Math.abs(new Date(left || 0).getTime() - new Date(right || 0).getTime())

    for (const event of chronologicalEmailEvents) {
      const eventType = String(event?.event_type || '')
      if (eventType !== 'reservation_run_attached') {
        const isVisibilityEvent =
          eventType === 'reservation_tracker_hidden' || eventType === 'reservation_tracker_unhidden'
        if (!isVisibilityEvent) {
          continue
        }
        const payload =
          typeof event?.event_payload === 'object' && event?.event_payload
            ? event.event_payload
            : parseMaybeJson(event?.event_payload, {}) || {}
        const registrationId = Number(payload?.registrationId || 0)
        const runId = Number(payload?.runId || event?.run_id || 0)
        const hidden = eventType === 'reservation_tracker_hidden'
        const snapshot = {
          hidden,
          at: event?.event_at || '',
        }
        if (registrationId > 0) {
          const current = hiddenStateByRegistrationId[registrationId]
          if (!current || new Date(snapshot.at || 0).getTime() >= new Date(current.at || 0).getTime()) {
            hiddenStateByRegistrationId[registrationId] = snapshot
          }
        }
        if (runId > 0) {
          const current = hiddenStateByRunId[runId]
          if (!current || new Date(snapshot.at || 0).getTime() >= new Date(current.at || 0).getTime()) {
            hiddenStateByRunId[runId] = snapshot
          }
        }
        continue
      }
      const payload =
        typeof event?.event_payload === 'object' && event?.event_payload
          ? event.event_payload
          : parseMaybeJson(event?.event_payload, {}) || {}
      const registrationId = Number(payload?.registrationId || 0)
      const runId = Number(payload?.runId || event?.run_id || 0)
      if (registrationId > 0 && runId > 0) {
        manualRunIdByRegistrationId[registrationId] = runId
      }
    }

    for (const run of liveNonLeadRuns) {
      const email = normalizeAdminEmail(run?.email)
      if (!email) continue
      if (!unmatchedRunsByEmail.has(email)) {
        unmatchedRunsByEmail.set(email, [])
      }
      unmatchedRunsByEmail.get(email).push(run)
    }

    for (const registration of registrationRecords) {
      const email = normalizeAdminEmail(registration?.guardian_email)
      if (!email) continue
      const registrationArchived = isArchivedRegistrationRecord(registration)
      if (registrationArchived) {
        archivedRegistrationIds.add(Number(registration.id))
        archivedRegistrationEmails.add(email)
      }
      const key = `registration-${registration.id}`
      const row = {
        key,
        registrationId: Number(registration.id),
        runId: null,
        email,
        guardianName: registration?.guardian_name || '',
        createdAt: registration?.created_at || '',
        paidActivatedAt: '',
        status: '',
        registrationType: String(
          (parseMaybeJson(registration?.medical_notes, {}) || {})?.registrationType || ''
        ).trim(),
        hidden: Boolean(hiddenStateByRegistrationId[Number(registration.id)]?.hidden),
        attachmentEventAt: '',
        attachmentReason: '',
        selectedWeekStarts: [],
        paidSentInstanceKeys: new Set(),
        paidPreviewInstanceKeys: new Set(),
        paidOpenedInstanceKeys: new Set(),
        criteria: [],
        steps: Object.fromEntries(reservationTrackerColumns.map((column) => [column.key, buildTrackerCell()])),
      }
      const rawMeta = parseMaybeJson(registration?.medical_notes, {}) || {}
      const sourceRegistration = rawMeta?.registration || {}
      row.selectedWeekStarts = getSelectedWeekStartsFromRegistration(sourceRegistration, weekById)
      const manuallyAssignedRunId = manualRunIdByRegistrationId[row.registrationId]
      if (manuallyAssignedRunId > 0) {
        const matchedRun = liveNonLeadRuns.find((item) => Number(item?.id || 0) === manuallyAssignedRunId)
        if (matchedRun) {
          row.runId = Number(matchedRun.id)
          row.status = matchedRun?.status || ''
          const assignedEmail = normalizeAdminEmail(matchedRun?.email)
          const candidates = unmatchedRunsByEmail.get(assignedEmail) || []
          const removeIndex = candidates.findIndex((item) => Number(item?.id || 0) === row.runId)
          if (removeIndex >= 0) {
            candidates.splice(removeIndex, 1)
          }
        }
      }
      if (!row.runId) {
        const candidates = unmatchedRunsByEmail.get(email) || []
        if (candidates.length > 0) {
          let bestIndex = 0
          let bestDistance = getDistance(candidates[0]?.created_at, registration?.created_at)
          for (let index = 1; index < candidates.length; index += 1) {
            const distance = getDistance(candidates[index]?.created_at, registration?.created_at)
            if (distance < bestDistance) {
              bestDistance = distance
              bestIndex = index
            }
          }
          const [matchedRun] = candidates.splice(bestIndex, 1)
          if (matchedRun) {
            row.runId = Number(matchedRun.id)
            row.status = matchedRun?.status || ''
          }
        }
      }
      if (registrationArchived) {
        continue
      }
      rows.push(row)
      rowByKey.set(key, row)
      if (row.runId) {
        rowByRunId.set(row.runId, row)
      }
    }

    for (const run of liveNonLeadRuns) {
      const runId = Number(run?.id || 0)
      if (!runId || rowByRunId.has(runId)) continue
      const email = normalizeAdminEmail(run?.email)
      if (archivedRegistrationEmails.has(email)) continue
      const key = `run-${runId}`
      const row = {
        key,
        registrationId: null,
        runId,
        email,
        guardianName: '',
        createdAt: run?.created_at || '',
        paidActivatedAt: '',
        status: run?.status || '',
        registrationType: '',
        hidden: Boolean(hiddenStateByRunId[runId]?.hidden),
        attachmentEventAt: '',
        attachmentReason: '',
        selectedWeekStarts: [],
        paidSentInstanceKeys: new Set(),
        paidPreviewInstanceKeys: new Set(),
        paidOpenedInstanceKeys: new Set(),
        criteria: [],
        steps: Object.fromEntries(reservationTrackerColumns.map((column) => [column.key, buildTrackerCell()])),
      }
      const matchingRegistration = registrationRecords
        .filter((item) => normalizeAdminEmail(item?.guardian_email) === email)
        .sort((a, b) => getDistance(run?.created_at, a?.created_at) - getDistance(run?.created_at, b?.created_at))[0]
      if (matchingRegistration) {
        if (archivedRegistrationIds.has(Number(matchingRegistration.id))) {
          continue
        }
        const matchingMeta = parseMaybeJson(matchingRegistration?.medical_notes, {}) || {}
        const matchingSourceRegistration = matchingMeta?.registration || {}
        row.guardianName = matchingRegistration?.guardian_name || ''
        row.registrationId = Number(matchingRegistration.id)
        row.registrationType = String(
          matchingMeta?.registrationType || ''
        ).trim()
        row.selectedWeekStarts = getSelectedWeekStartsFromRegistration(matchingSourceRegistration, weekById)
      }
      rows.push(row)
      rowByKey.set(key, row)
      rowByRunId.set(runId, row)
    }

    for (const run of testNonLeadRuns) {
      const runId = Number(run?.id || 0)
      if (!runId || rowByRunId.has(runId)) continue
      const email = normalizeAdminEmail(run?.email)
      const key = `test-run-${runId}`
      const row = {
        key,
        registrationId: null,
        runId,
        email,
        guardianName: '',
        createdAt: run?.created_at || '',
        paidActivatedAt: '',
        status: run?.status || '',
        registrationType: '',
        hidden: Boolean(hiddenStateByRunId[runId]?.hidden),
        attachmentEventAt: '',
        attachmentReason: '',
        selectedWeekStarts: [],
        paidSentInstanceKeys: new Set(),
        paidPreviewInstanceKeys: new Set(),
        paidOpenedInstanceKeys: new Set(),
        criteria: [],
        steps: Object.fromEntries(reservationTrackerColumns.map((column) => [column.key, buildTrackerCell()])),
      }
      rows.push(row)
      rowByKey.set(key, row)
      rowByRunId.set(runId, row)
    }

    const resolveRowForEvent = (event) => {
      const runId = Number(event?.run_id || 0)
      if (runId && rowByRunId.has(runId)) {
        return rowByRunId.get(runId)
      }
      const normalizedEmail = normalizeAdminEmail(event?.email)
      const candidates = rows.filter((row) => row.email === normalizedEmail)
      if (candidates.length === 1) {
        return candidates[0]
      }
      return candidates.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0] || null
    }

    for (const event of chronologicalEmailEvents) {
      const row = resolveRowForEvent(event)
      if (!row) continue
      const eventType = String(event?.event_type || '')
      const stepNumber = Number(event?.step_number || 0)
      const eventPayload =
        typeof event?.event_payload === 'object' && event?.event_payload ? event.event_payload : parseMaybeJson(event?.event_payload, {}) || {}
      const summaryLines = Array.isArray(eventPayload?.summaryLines) ? eventPayload.summaryLines : []
      if ((!Array.isArray(row.selectedWeekStarts) || row.selectedWeekStarts.length === 0) && Array.isArray(eventPayload?.campWeeks)) {
        row.selectedWeekStarts = Array.from(
          new Set(
            eventPayload.campWeeks
              .map((week) => String(week?.start || '').trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b))
      }
      if (!row.registrationType) {
        if (String(eventPayload?.registrationType || '').trim()) {
          row.registrationType = String(eventPayload.registrationType).trim()
        } else if (summaryLines.some((line) => String(line || '').toLowerCase().includes('overnight camp registration'))) {
          row.registrationType = 'overnight-only'
        } else if (String(event?.subject || '').toLowerCase().includes('overnight')) {
          row.registrationType = 'overnight-only'
        }
      }
      if (eventType === 'reservation_run_attached') {
        row.attachmentEventAt = event?.event_at || row.attachmentEventAt
        row.attachmentReason = String(eventPayload?.reason || '').trim() || row.attachmentReason
      }
      if (
        eventType === 'payment_marked_paid' ||
        (eventType === 'reservation_step_auto_skipped' && String(eventPayload?.reason || '') === 'tuition_95_percent_paid')
      ) {
        const candidatePaidAt = String(event?.event_at || '').trim()
        if (candidatePaidAt) {
          if (!row.paidActivatedAt || new Date(candidatePaidAt).getTime() < new Date(row.paidActivatedAt).getTime()) {
            row.paidActivatedAt = candidatePaidAt
          }
        }
      }
      const paidInstance = getPaidEventInstanceKey(eventType, eventPayload, row)
      if (paidInstance?.instanceKey) {
        if (eventType.endsWith('_sent')) {
          row.paidSentInstanceKeys.add(paidInstance.instanceKey)
        } else if (eventType.endsWith('_opened')) {
          row.paidOpenedInstanceKeys.add(paidInstance.instanceKey)
        } else if (eventType.endsWith('_preview')) {
          row.paidPreviewInstanceKeys.add(paidInstance.instanceKey)
        }
      }
      if ((eventType === 'reservation_email_sent' || eventType === 'test_sent_reservation') && stepNumber >= 1 && stepNumber <= 5) {
        row.steps[`step_${stepNumber}`] = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'reservation_email_opened' && stepNumber >= 1 && stepNumber <= 5) {
        row.steps[`step_${stepNumber}`] = upgradeTrackerCellToOpened(row.steps[`step_${stepNumber}`], event?.event_at)
      } else if ((eventType === 'reservation_email_preview' || eventType === 'test_preview_only_reservation') && stepNumber >= 1 && stepNumber <= 5) {
        if (row.steps[`step_${stepNumber}`].status !== 'sent') {
          row.steps[`step_${stepNumber}`] = buildTrackerCell('preview', event?.event_at)
        }
      } else if (eventType === 'reservation_step_auto_skipped' && stepNumber >= 1 && stepNumber <= 5) {
        if (row.steps[`step_${stepNumber}`].status === 'pending') {
          row.steps[`step_${stepNumber}`] = buildTrackerCell('skipped', event?.event_at)
        }
      } else if (eventType === 'paid_prep_7d_sent') {
        row.steps.paid_7d = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_prep_opened' && paidInstance?.key === 'paid_7d') {
        row.steps.paid_7d = upgradeTrackerCellToOpened(row.steps.paid_7d, event?.event_at)
      } else if (eventType === 'paid_prep_7d_sent_preview' && row.steps.paid_7d.status !== 'sent') {
        row.steps.paid_7d = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_prep_5d_sent') {
        row.steps.paid_5d = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_prep_opened' && paidInstance?.key === 'paid_5d') {
        row.steps.paid_5d = upgradeTrackerCellToOpened(row.steps.paid_5d, event?.event_at)
      } else if (eventType === 'paid_prep_5d_sent_preview' && row.steps.paid_5d.status !== 'sent') {
        row.steps.paid_5d = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_prep_3d_sent') {
        row.steps.paid_3d = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_prep_opened' && paidInstance?.key === 'paid_3d') {
        row.steps.paid_3d = upgradeTrackerCellToOpened(row.steps.paid_3d, event?.event_at)
      } else if (eventType === 'paid_prep_3d_sent_preview' && row.steps.paid_3d.status !== 'sent') {
        row.steps.paid_3d = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_prep_1d_sent') {
        row.steps.paid_1d = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_prep_opened' && paidInstance?.key === 'paid_1d') {
        row.steps.paid_1d = upgradeTrackerCellToOpened(row.steps.paid_1d, event?.event_at)
      } else if (eventType === 'paid_prep_1d_sent_preview' && row.steps.paid_1d.status !== 'sent') {
        row.steps.paid_1d = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_followup_0w_sent') {
        row.steps.paid_0w = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_followup_opened' && paidInstance?.key === 'paid_0w') {
        row.steps.paid_0w = upgradeTrackerCellToOpened(row.steps.paid_0w, event?.event_at)
      } else if (eventType === 'paid_followup_0w_sent_preview' && row.steps.paid_0w.status !== 'sent') {
        row.steps.paid_0w = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_followup_2w_sent') {
        row.steps.paid_2w = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_followup_opened' && paidInstance?.key === 'paid_2w') {
        row.steps.paid_2w = upgradeTrackerCellToOpened(row.steps.paid_2w, event?.event_at)
      } else if (eventType === 'paid_followup_2w_sent_preview' && row.steps.paid_2w.status !== 'sent') {
        row.steps.paid_2w = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_followup_4w_sent') {
        row.steps.paid_4w = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_followup_opened' && paidInstance?.key === 'paid_4w') {
        row.steps.paid_4w = upgradeTrackerCellToOpened(row.steps.paid_4w, event?.event_at)
      } else if (eventType === 'paid_followup_4w_sent_preview' && row.steps.paid_4w.status !== 'sent') {
        row.steps.paid_4w = buildTrackerCell('preview', event?.event_at)
      } else if (eventType === 'paid_followup_8w_sent') {
        row.steps.paid_8w = buildTrackerCell('sent', event?.event_at)
      } else if (eventType === 'paid_followup_opened' && paidInstance?.key === 'paid_8w') {
        row.steps.paid_8w = upgradeTrackerCellToOpened(row.steps.paid_8w, event?.event_at)
      } else if (eventType === 'paid_followup_8w_sent_preview' && row.steps.paid_8w.status !== 'sent') {
        row.steps.paid_8w = buildTrackerCell('preview', event?.event_at)
      }
    }

    for (const run of nonLeadRuns) {
      const row = rowByRunId.get(Number(run?.id || 0))
      if (!row) continue
      row.status = run?.status || row.status
      const currentStep = Number(run?.current_step || 0)
      const statusValue = String(run?.status || '')
      if (statusValue === 'paid' && !String(row.paidActivatedAt || '').trim()) {
        row.paidActivatedAt = String(run?.updated_at || run?.last_sent_at || '').trim()
      }
      if (statusValue === 'paid') {
        const paidEntries = getPaidJourneyEntries(row, row.selectedWeekStarts)
        const nextPendingEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0] || null
        const openedKeys = row?.paidOpenedInstanceKeys instanceof Set ? row.paidOpenedInstanceKeys : new Set()
        for (const stage of paidJourneyStageDefs) {
          const stageEntries = paidEntries.filter((entry) => entry.key === stage.key)
          const sentCount = stageEntries.filter((entry) => row.paidSentInstanceKeys.has(entry.instanceKey)).length
          const previewCount = stageEntries.filter((entry) => row.paidPreviewInstanceKeys.has(entry.instanceKey)).length
          const openedCount = stageEntries.filter((entry) => openedKeys.has(entry.instanceKey)).length
          if (stageEntries.length === 0) {
            continue
          }
          if (openedCount > 0) {
            row.steps[stage.key] = buildTrackerCell('opened', run?.updated_at || run?.last_sent_at || '')
          } else if (sentCount >= stageEntries.length) {
            row.steps[stage.key] = buildTrackerCell('sent', run?.updated_at || run?.last_sent_at || '')
          } else if (sentCount > 0 || previewCount > 0) {
            row.steps[stage.key] = buildTrackerCell('partial', run?.updated_at || run?.last_sent_at || '')
          } else {
            row.steps[stage.key] = buildTrackerCell('pending', '')
          }
        }
        const nextPaidStage = nextPendingEntry ? paidJourneyStageDefs.find((stage) => stage.key === nextPendingEntry.key) : null
        if (nextPaidStage) {
          row.steps[nextPaidStage.key] = buildTrackerCell(
            'paid',
            run?.updated_at || run?.last_sent_at || '',
            buildPaidJourneyEntryNote(nextPendingEntry)
          )
        }
      } else if (statusValue === 'test_sent_reservation' && currentStep >= 1 && currentStep <= 5 && row.steps[`step_${currentStep}`].status === 'pending') {
        row.steps[`step_${currentStep}`] = buildTrackerCell('sent', run?.last_sent_at || run?.updated_at || run?.created_at || '')
      } else if (statusValue === 'test_preview_only_reservation' && currentStep >= 1 && currentStep <= 5 && row.steps[`step_${currentStep}`].status === 'pending') {
        row.steps[`step_${currentStep}`] = buildTrackerCell('preview', run?.last_sent_at || run?.updated_at || run?.created_at || '')
      } else if (currentStep >= 1 && currentStep <= 5 && row.steps[`step_${currentStep}`].status === 'pending') {
        row.steps[`step_${currentStep}`] = buildTrackerCell(
          ['active', 'queued'].includes(statusValue) ? 'scheduled' : statusValue === 'error' ? 'error' : 'closed',
          run?.next_send_at || run?.last_sent_at || ''
        )
      }
    }

    return rows
      .map((row) => ({ ...row, criteria: buildReservationCriteria(row) }))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [chronologicalEmailEvents, emailJourneyRuns, registrationRecords, weekById])
  const availableReservationRunsByRowKey = useMemo(() => {
    const attachedRunIds = new Set(
      reservationJourneyTrackerRows
        .map((row) => Number(row?.runId || 0))
        .filter((runId) => runId > 0)
    )
    const liveReservationRuns = emailJourneyRuns
      .filter((run) => !String(run?.status || '').startsWith('lead_') && !isTestJourneyStatus(run?.status))
      .sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())

    return reservationJourneyTrackerRows.reduce((acc, row) => {
      if (row.runId || !row.registrationId || !isValidAdminEmail(row.email)) {
        acc[row.key] = []
        return acc
      }
      const matchingEmailRuns = liveReservationRuns.filter(
        (run) => normalizeAdminEmail(run?.email) === row.email && !attachedRunIds.has(Number(run?.id || 0))
      )
      const fallbackRuns = liveReservationRuns.filter((run) => !attachedRunIds.has(Number(run?.id || 0)))
      acc[row.key] = matchingEmailRuns.length > 0 ? matchingEmailRuns : fallbackRuns
      return acc
    }, {})
  }, [emailJourneyRuns, reservationJourneyTrackerRows])
  const standardReservationJourneyTrackerRows = useMemo(
    () =>
      reservationJourneyTrackerRows.filter(
        (row) => row.registrationType !== 'overnight-only' && !isTestJourneyStatus(row.status) && !row.hidden
      ),
    [reservationJourneyTrackerRows]
  )
  const overnightReservationJourneyTrackerRows = useMemo(
    () =>
      reservationJourneyTrackerRows.filter(
        (row) => row.registrationType === 'overnight-only' && !isTestJourneyStatus(row.status) && !row.hidden
      ),
    [reservationJourneyTrackerRows]
  )
  const testReservationJourneyTrackerRows = useMemo(
    () => reservationJourneyTrackerRows.filter((row) => isTestJourneyStatus(row.status) && !row.hidden),
    [reservationJourneyTrackerRows]
  )
  const hiddenReservationJourneyTrackerRows = useMemo(
    () => reservationJourneyTrackerRows.filter((row) => row.hidden),
    [reservationJourneyTrackerRows]
  )
  const activeReservationJourneyTrackerRows = useMemo(
    () =>
      activeReservationTrackerView === 'overnight'
        ? overnightReservationJourneyTrackerRows
        : activeReservationTrackerView === 'tests'
          ? testReservationJourneyTrackerRows
          : activeReservationTrackerView === 'hidden'
            ? hiddenReservationJourneyTrackerRows
          : standardReservationJourneyTrackerRows,
    [
      activeReservationTrackerView,
      hiddenReservationJourneyTrackerRows,
      overnightReservationJourneyTrackerRows,
      standardReservationJourneyTrackerRows,
      testReservationJourneyTrackerRows,
    ]
  )
  const reservationRunIdByRegistrationId = useMemo(() => {
    const map = {}
    for (const row of reservationJourneyTrackerRows) {
      const registrationId = Number(row?.registrationId || 0)
      const runId = Number(row?.runId || 0)
      if (registrationId > 0 && runId > 0 && !map[registrationId]) {
        map[registrationId] = runId
      }
    }
    return map
  }, [reservationJourneyTrackerRows])
  const reservationJourneyStatusByRegistrationId = useMemo(() => {
    const runById = new Map(
      (Array.isArray(emailJourneyRuns) ? emailJourneyRuns : [])
        .filter((run) => Number(run?.id || 0) > 0)
        .map((run) => [Number(run.id), run])
    )
    const map = {}
    for (const row of reservationJourneyTrackerRows) {
      const registrationId = Number(row?.registrationId || 0)
      if (registrationId <= 0) {
        continue
      }
      const run = runById.get(Number(row?.runId || 0)) || null
      const currentStep = Number(run?.current_step || 0)
      const status = String(row?.status || run?.status || '').trim()
      map[registrationId] = {
        status,
        currentStep,
        r5SentUnpaid:
          status === 'canceled_unpaid' ||
          (currentStep >= 5 && status !== 'paid'),
      }
    }
    return map
  }, [emailJourneyRuns, reservationJourneyTrackerRows])
  const weekNumberById = useMemo(() => {
    const map = {}
    weekOptions.general.forEach((week, index) => {
      map[week.id] = { number: index + 1, label: `General Camp Week ${index + 1}` }
    })
    weekOptions.bootcamp.forEach((week, index) => {
      map[week.id] = { number: index + 1, label: `Boot Camp Week ${index + 1}` }
    })
    weekOptions.overnight.forEach((week, index) => {
      map[week.id] = { number: index + 1, label: `Overnight Week ${index + 1}` }
    })
    return map
  }, [weekOptions.bootcamp, weekOptions.general, weekOptions.overnight])
  const accountingEditRegistrationWeeks = useMemo(() => {
    const location = String(accountingEditState.registration?.location || '').trim()
    const generalProgram = getGeneralProgramForLocation(config.programs.general, location)
    const generalWeeks = getSelectedWeeks('general', generalProgram)
    const bootcampWeeks = getSelectedWeeks('bootcamp', config.programs.bootcamp)
    const dayCampMap = new Map()

    for (const week of generalWeeks) {
      const id = `daycamp:${week.start}`
      dayCampMap.set(id, {
        id,
        start: week.start,
        end: week.end,
        programKey: 'daycamp',
        programLabel: 'Camp Week',
        days: Array.isArray(week.days)
          ? week.days.map((day) => ({
              ...day,
              key: normalizeAccountingEditorDayKey(day?.key),
            }))
          : [],
        availableCampTypes: ['general'],
      })
    }

    for (const week of bootcampWeeks) {
      const id = `daycamp:${week.start}`
      const existing = dayCampMap.get(id)
      if (existing) {
        existing.availableCampTypes = existing.availableCampTypes.includes('bootcamp')
          ? existing.availableCampTypes
          : [...existing.availableCampTypes, 'bootcamp']
      }
    }

    return Array.from(dayCampMap.values()).sort((a, b) => String(a.start || '').localeCompare(String(b.start || '')))
  }, [accountingEditState.registration?.location, config.programs.bootcamp, config.programs.general])
  const accountingEditWeeksById = useMemo(
    () =>
      accountingEditRegistrationWeeks.reduce((acc, week) => {
        acc[week.id] = week
        return acc
      }, {}),
    [accountingEditRegistrationWeeks]
  )
  const accountingEditStudent = useMemo(() => {
    if (!accountingEditState.registration || !accountingEditState.row) {
      return null
    }
    return accountingEditState.registration.students?.[accountingEditState.row.camperIndex] || null
  }, [accountingEditState.registration, accountingEditState.row])
  const accountingEditLunchWeeks = useMemo(
    () => (accountingEditStudent ? getLunchWeeksForStudent(accountingEditStudent, accountingEditWeeksById) : []),
    [accountingEditStudent, accountingEditWeeksById]
  )
  const accountingRows = useMemo(() => {
    const rows = []
    for (const record of registrationRecords) {
      const rawMeta = parseMaybeJson(record.medical_notes, {}) || {}
      const registrationType = String(rawMeta?.registrationType || '').trim()
      const payload = rawMeta?.registration || {}
      const students = Array.isArray(payload.students) && payload.students.length > 0 ? payload.students : []
      const parentName = (payload.parentName || record.guardian_name || '').trim() || 'Parent/Guardian'
      const parentEmail = (payload.contactEmail || record.guardian_email || '').trim()
      const discountActive = isLimitedDiscountActiveForDate(config.tuition.discountEndDate, record.created_at)
      const accountingEntries = Array.isArray(record.accounting_entries) ? record.accounting_entries : []
      const normalizedStudents = students.length > 0 ? students : [{ fullName: record.guardian_name || 'Camper', schedule: {}, lunch: {} }]
      const siblingEligibleIds = new Set(
        normalizedStudents
          .map((student, index) => ({
            studentId: String(student?.id || `fallback-${index}`),
            studentIndex: index,
            tuitionSubtotal: buildCamperPricing({
              student,
              studentIndex: index,
              siblingDiscountEligible: false,
              tuition: config.tuition,
              discountActive,
              lunchPrice: config.tuition.lunchPrice,
              weekById,
            }).tuitionSubtotal,
          }))
          .sort((a, b) => {
            if (a.tuitionSubtotal !== b.tuitionSubtotal) {
              return a.tuitionSubtotal - b.tuitionSubtotal
            }
            return a.studentIndex - b.studentIndex
          })
          .slice(0, Math.max(0, normalizedStudents.length - 1))
          .map((item) => item.studentId)
      )

      normalizedStudents.forEach((student, index) => {
        const camperName = String(student?.fullName || '').trim() || `Camper ${index + 1}`
        const pricing = buildCamperPricing({
          student,
          studentIndex: index,
          siblingDiscountEligible: siblingEligibleIds.has(String(student?.id || `fallback-${index}`)),
          tuition: config.tuition,
          discountActive,
          lunchPrice: config.tuition.lunchPrice,
          weekById,
        })
        const entry =
          accountingEntries.find((item) => Number(item?.camper_index) === index) ||
          accountingEntries.find((item) => String(item?.camper_name || '').trim() === camperName) ||
          {}
        const manualDiscount = Math.max(0, Number(entry.manual_discount || 0))
        const paymentState = deriveAccountingPaymentState({
          entry,
          tuitionTotal: pricing.total,
          lunchTotal: pricing.lunchCost,
          manualDiscount,
        })
        const selectedWeekIds = Array.from(new Set(pricing.weekIds))
        const weekChipDetails = pricing.weekDetails.map((item) => ({
          chipLabel: `${weekNumberById[item.weekId]?.label || item.label} · ${item.isFullWeek ? 'Full Week' : 'Partial'}`,
          detailLines: item.detailLines,
        }))
        const weekOverlayLines = weekChipDetails.flatMap((item) => [item.chipLabel, ...item.detailLines])
        const paymentMethod = String(entry.payment_method || '').trim().toLowerCase()
        const invoiceCalendarLines = buildAccountingCalendarLines({
          camperName,
          student,
          weekById,
          weekNumberById,
        })
        const totalBreakdownLines = [
          `General Camp: ${money(pricing.general)}`,
          `General counts: ${formatWeekCountSummary(pricing.countsByProgram.general, 'general')}`,
          `Boot Camp: ${money(pricing.bootcamp)}`,
          `Boot Camp counts: ${formatWeekCountSummary(pricing.countsByProgram.bootcamp, 'bootcamp')}`,
          `Overnight Camp: ${money(pricing.overnight)}`,
          `Overnight counts: ${formatWeekCountSummary(pricing.countsByProgram.overnight, 'overnight')}`,
          `Tuition subtotal before sibling discount: ${money(
            Number(pricing.general || 0) + Number(pricing.bootcamp || 0) + Number(pricing.overnight || 0)
          )}`,
        ]
        if (Number(pricing.countsByProgram.overnight.fullWeek || 0) > 0) {
          const overnightInvoice = buildOvernightAccountingInvoice(
            pricing.countsByProgram.overnight.fullWeek,
            Number(config.tuition.regular.overnightWeek || 0),
            Number(config.tuition.discount.overnightWeek || 0) || Number(config.tuition.regular.overnightWeek || 0),
            discountActive
          )
          totalBreakdownLines.push(`Overnight regular subtotal: ${money(overnightInvoice.regularSubtotal)}`)
          if (discountActive) {
            totalBreakdownLines.push(`Overnight discounted week rate: ${money(overnightInvoice.discountedRate)}`)
            if (overnightInvoice.secondWeekDiscount > 0) {
              totalBreakdownLines.push(`Overnight week 2 extra discount: -${money(overnightInvoice.secondWeekDiscount)}`)
            }
          }
        }
        if (Number(pricing.weekTierPromoAmount || 0) > 0) {
          for (const promoLine of pricing.weekTierPromoLines || []) {
            totalBreakdownLines.push(`${promoLine.label}: -${money(promoLine.amount)}`)
          }
        }
        if (Number(pricing.siblingDiscount || 0) > 0) {
          totalBreakdownLines.push(
            `Sibling discount (${pricing.siblingDiscountPct}%): -${money(pricing.siblingDiscount)}`
          )
        }
        totalBreakdownLines.push(`Lunch added after sibling discount: ${money(pricing.lunchCost)}`)
        totalBreakdownLines.push(`Calculated tuition before manual discount: ${money(paymentState.tuitionBase)}`)
        totalBreakdownLines.push(`Calculated total: ${money(pricing.total)}`)
        if (manualDiscount > 0) {
          totalBreakdownLines.push(`Manual discount: -${money(manualDiscount)}`)
        }
        totalBreakdownLines.push(`Tuition after manual discount: ${money(paymentState.tuitionAfterManualDiscount)}`)
        totalBreakdownLines.push(`Lunch total: ${money(paymentState.lunchTotal)}`)
        totalBreakdownLines.push(`Displayed total: ${money(paymentState.totalAfterManualDiscount)}`)
        rows.push({
          key: `${record.id}-${index}`,
          registrationId: record.id,
          camperIndex: index,
          registrationType,
          createdAt: record.created_at,
          location: String(payload.location || '').trim(),
          parentName,
          parentEmail,
          parentPhone: String(payload.contactPhone || record.guardian_phone || '').trim(),
          camperName,
          camperDob: String(student?.dob || '').trim(),
          camperAllergies: String(student?.allergies || '').trim(),
          camperMedication: String(student?.medication || '').trim(),
          camperPreviousInjury: String(student?.previousInjury || '').trim(),
          camperHealthNotes: String(student?.healthNotes || '').trim(),
          camperActivitySelections: Array.isArray(student?.activitySelections) ? student.activitySelections : [],
          selectedWeekIds,
          scheduleByWeek: pricing.scheduleByWeek,
          weekProgramDetails: pricing.weekDetails,
          weeksCount: selectedWeekIds.length,
          weekLabels: selectedWeekIds.map((weekId) => toWeekLabel(weekId, weekById)),
          weekChipDetails,
          weekOverlayLines,
          lunchDays: pricing.lunchDays,
          lunchDaysCount: pricing.paidLunchCount,
          lunchCost: pricing.lunchCost,
          regularPriceTotal: pricing.regularTotal,
          tuitionBeforeManualDiscount: paymentState.tuitionBase,
          tuitionAfterManualDiscount: paymentState.tuitionAfterManualDiscount,
          weekTierPromoAmount: pricing.weekTierPromoAmount,
          weekTierPromoLines: pricing.weekTierPromoLines,
          generalCost: pricing.general,
          bootcampCost: pricing.bootcamp,
          overnightCost: pricing.overnight,
          tuitionTotal: pricing.total,
          siblingDiscountPct: pricing.siblingDiscountPct,
          siblingDiscountAmount: pricing.siblingDiscount,
          totalBreakdownLines,
          invoiceCalendarLines,
          manualDiscount,
          totalAfterManualDiscount: paymentState.totalAfterManualDiscount,
          paidAmount: paymentState.totalPaidAmount,
          owedAmount: paymentState.totalOwedAmount,
          tuitionPaidAmount: paymentState.tuitionPaidAmount,
          lunchPaidAmount: paymentState.lunchPaidAmount,
          tuitionOwedAmount: paymentState.tuitionOwedAmount,
          lunchOwedAmount: paymentState.lunchOwedAmount,
          tuitionPaidPct: paymentState.tuitionPaidPct,
          shouldStopRegistrationEmails: paymentState.shouldStopRegistrationEmails,
          paymentMethod: accountingPaymentMethods.includes(paymentMethod) ? paymentMethod : '',
          archived: Boolean(entry.archived),
          r5SentUnpaid: Boolean(reservationJourneyStatusByRegistrationId[record.id]?.r5SentUnpaid) && !paymentState.shouldStopRegistrationEmails,
        })
      })
    }
    return rows
  }, [config.tuition, registrationRecords, reservationJourneyStatusByRegistrationId, weekById, weekNumberById])
  const activeAccountingRows = useMemo(
    () => accountingRows.filter((row) => !row.archived && row.registrationType !== 'overnight-only'),
    [accountingRows]
  )
  const archivedAccountingRows = useMemo(
    () => accountingRows.filter((row) => row.archived && row.registrationType !== 'overnight-only'),
    [accountingRows]
  )
  const overnightAccountingRows = useMemo(
    () => accountingRows.filter((row) => row.registrationType === 'overnight-only'),
    [accountingRows]
  )
  const activeOvernightAccountingRows = useMemo(
    () => overnightAccountingRows.filter((row) => !row.archived),
    [overnightAccountingRows]
  )
  const archivedOvernightAccountingRows = useMemo(
    () => overnightAccountingRows.filter((row) => row.archived),
    [overnightAccountingRows]
  )
  const rosterEntries = useMemo(() => {
    const entries = []
    for (const row of [...activeAccountingRows, ...activeOvernightAccountingRows]) {
      if (!shouldShowInRoster(row)) {
        continue
      }

      const detailByWeekId = new Map(
        (Array.isArray(row.weekProgramDetails) ? row.weekProgramDetails : []).map((detail) => [detail.weekId, detail])
      )
      const seenAssignments = new Set()

      for (const item of Array.isArray(row.scheduleByWeek) ? row.scheduleByWeek : []) {
        const weekId = String(item?.weekId || '').trim()
        const programKey = resolveRosterProgramKey(item)
        if (!weekId || !rosterProgramMeta[programKey]) {
          continue
        }

        const assignmentKey = `${row.key}:${programKey}:${weekId}`
        if (seenAssignments.has(assignmentKey)) {
          continue
        }
        seenAssignments.add(assignmentKey)

        const detail = detailByWeekId.get(weekId)
        const week = weekById[weekId] || { id: weekId, start: '', end: '' }
        entries.push({
          key: assignmentKey,
          rowKey: row.key,
          programKey,
          weekId,
          week,
          camperName: row.camperName || 'Camper',
          camperDob: formatRosterValue(row.camperDob, 'DOB not provided'),
          parentName: row.parentName || 'Parent/Guardian',
          email: row.parentEmail || '-',
          phone: formatRosterValue(row.parentPhone, 'Phone not provided'),
          location: row.location || (programKey === 'overnight' ? 'Camp House' : '-'),
          selectionSummary: detail ? formatWeekCountSummary(detail.counts, programKey) : 'Registered',
          paymentMethod: row.paymentMethod ? String(row.paymentMethod).toUpperCase() : 'TBD',
          balanceSummary:
            Number(row.owedAmount || 0) > 0
              ? `Balance due ${money(row.owedAmount)}`
              : 'Paid in full',
          accountingSummary: [
            `Tuition ${money(row.tuitionAfterManualDiscount)}`,
            `Lunch ${money(row.lunchCost)}`,
            `Paid ${money(row.paidAmount)}`,
            `Owed ${money(row.owedAmount)}`,
          ].join(' · '),
          healthSummary: [
            `Allergies: ${formatRosterValue(row.camperAllergies)}`,
            `Medication: ${formatRosterValue(row.camperMedication)}`,
            `Injuries: ${formatRosterValue(row.camperPreviousInjury)}`,
            `Health notes: ${formatRosterValue(row.camperHealthNotes)}`,
          ].join(' | '),
          activitySummary:
            Array.isArray(row.camperActivitySelections) && row.camperActivitySelections.length > 0
              ? `Activities: ${row.camperActivitySelections.join(', ')}`
              : 'Activities: None selected',
        })
      }
    }

    return entries.sort((a, b) => {
      const startCompare = String(a.week?.start || '').localeCompare(String(b.week?.start || ''))
      if (startCompare !== 0) return startCompare
      const programCompare = String(a.programKey || '').localeCompare(String(b.programKey || ''))
      if (programCompare !== 0) return programCompare
      return String(a.camperName || '').localeCompare(String(b.camperName || ''))
    })
  }, [activeAccountingRows, activeOvernightAccountingRows, weekById])
  const rosterSummary = useMemo(() => {
    const byProgram = {}
    for (const programKey of Object.keys(rosterProgramMeta)) {
      const groupsByWeekId = {}
      for (const week of weekOptions[programKey] || []) {
        groupsByWeekId[week.id] = {
          week,
          rows: [],
        }
      }

      for (const entry of rosterEntries) {
        if (entry.programKey !== programKey) {
          continue
        }
        if (!groupsByWeekId[entry.weekId]) {
          groupsByWeekId[entry.weekId] = {
            week: weekById[entry.weekId] || entry.week || null,
            rows: [],
          }
        }
        groupsByWeekId[entry.weekId].rows.push(entry)
      }

      const groups = Object.values(groupsByWeekId)
        .sort((a, b) => String(a.week?.start || '').localeCompare(String(b.week?.start || '')))
        .map((group) => ({
          week: group.week,
          rows: [...group.rows].sort((a, b) => String(a.camperName || '').localeCompare(String(b.camperName || ''))),
        }))

      const totalCampers = groups.reduce((sum, group) => sum + group.rows.length, 0)
      const activeWeeks = groups.filter((group) => group.rows.length > 0).length
      byProgram[programKey] = {
        key: programKey,
        title: rosterProgramMeta[programKey].title,
        exportTitle: rosterProgramMeta[programKey].exportTitle,
        emptyText: rosterProgramMeta[programKey].emptyText,
        accentColor: rosterProgramMeta[programKey].accentColor,
        groups,
        totalCampers,
        activeWeeks,
      }
    }

    const mergedCampers = Object.values(byProgram).reduce((sum, section) => sum + section.totalCampers, 0)
    const mergedActiveWeeks = Object.values(byProgram).reduce((sum, section) => sum + section.activeWeeks, 0)

    return {
      byProgram,
      merged: {
        totalCampers: mergedCampers,
        activeWeeks: mergedActiveWeeks,
      },
    }
  }, [rosterEntries, weekById, weekOptions])
  const leadDueCounts = useMemo(() => {
    const counts = Object.fromEntries(leadTrackerColumns.map((column) => [column.key, 0]))
    const now = Date.now()
    for (const row of leadJourneyTrackerRows) {
      if (row.isRegistered || !row.createdAt || String(row.status || '').startsWith('test_')) continue
      const nextColumn = leadTrackerColumns.find((column) => !isTrackerStepHandled(row.steps[column.key]?.status))
      if (!nextColumn) continue
      const dueAt = String(row?.nextSendAt || '').trim()
      const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
      if (!Number.isNaN(dueTime) && dueTime <= now) {
        counts[nextColumn.key] += 1
      }
    }
    return counts
  }, [leadJourneyTrackerRows])
  const leadUpcomingCounts = useMemo(() => {
    const counts = Object.fromEntries(leadTrackerColumns.map((column) => [column.key, 0]))
    const now = Date.now()
    const upcomingBoundary = now + 24 * 60 * 60 * 1000
    for (const row of leadJourneyTrackerRows) {
      if (row.isRegistered || !row.createdAt || String(row.status || '').startsWith('test_')) continue
      const nextColumn = leadTrackerColumns.find((column) => !isTrackerStepHandled(row.steps[column.key]?.status))
      if (!nextColumn) continue
      const dueAt = String(row?.nextSendAt || '').trim()
      const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
      if (!Number.isNaN(dueTime) && dueTime > now && dueTime <= upcomingBoundary) {
        counts[nextColumn.key] += 1
      }
    }
    return counts
  }, [leadJourneyTrackerRows])
  const reservationDueKeyByRegistrationId = useMemo(() => {
    const map = {}
    const unpaidHourOffsets = [0, 12, 36, 66, 72]
    const now = Date.now()
    for (const row of reservationJourneyTrackerRows) {
      const registrationId = Number(row.registrationId || 0)
      if (row.hidden || registrationId <= 0 || !row.createdAt || String(row.status || '').startsWith('test_')) continue

      if (String(row.status || '') === 'paid') {
        if (row.registrationType === 'overnight-only') continue
        const nextEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0]
        if (nextEntry && now >= new Date(nextEntry.scheduledAt).getTime()) {
          map[registrationId] = nextEntry.key
        }
        continue
      }

      if (!row.runId) {
        continue
      }

      const nextColumn = reservationTrackerColumns
        .filter((column) => String(column.key || '').startsWith('step_'))
        .find((column) => !isTrackerStepHandled(row.steps[column.key]?.status))
      if (!nextColumn) continue
      const dueAt = addHoursToIso(row.createdAt, unpaidHourOffsets[Math.max(0, (nextColumn.stepNumber || 1) - 1)] || 0)
      if (dueAt && new Date(dueAt).getTime() <= now) {
        map[registrationId] = nextColumn.key
      }
    }
    return map
  }, [reservationJourneyTrackerRows])
  const reservationUpcomingKeyByRegistrationId = useMemo(() => {
    const map = {}
    const unpaidHourOffsets = [0, 12, 36, 66, 72]
    const now = Date.now()
    const upcomingBoundary = now + 24 * 60 * 60 * 1000
    for (const row of reservationJourneyTrackerRows) {
      const registrationId = Number(row.registrationId || 0)
      if (row.hidden || registrationId <= 0 || !row.createdAt || String(row.status || '').startsWith('test_')) continue

      if (String(row.status || '') === 'paid') {
        if (row.registrationType === 'overnight-only') continue
        const nextEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0]
        const scheduledAt = nextEntry ? new Date(nextEntry.scheduledAt).getTime() : NaN
        if (!Number.isNaN(scheduledAt) && scheduledAt > now && scheduledAt <= upcomingBoundary) {
          map[registrationId] = nextEntry.key
        }
        continue
      }

      if (!row.runId) {
        continue
      }

      const nextColumn = reservationTrackerColumns
        .filter((column) => String(column.key || '').startsWith('step_'))
        .find((column) => !isTrackerStepHandled(row.steps[column.key]?.status))
      if (!nextColumn) continue
      const dueAt = addHoursToIso(row.createdAt, unpaidHourOffsets[Math.max(0, (nextColumn.stepNumber || 1) - 1)] || 0)
      const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
      if (!Number.isNaN(dueTime) && dueTime > now && dueTime <= upcomingBoundary) {
        map[registrationId] = nextColumn.key
      }
    }
    return map
  }, [reservationJourneyTrackerRows])
  const reservationDueCounts = useMemo(() => {
    const counts = Object.fromEntries(reservationTrackerColumns.map((column) => [column.key, 0]))
    for (const dueKey of Object.values(reservationDueKeyByRegistrationId)) {
      if (counts[dueKey] !== undefined) {
        counts[dueKey] += 1
      }
    }
    return counts
  }, [reservationDueKeyByRegistrationId])
  const reservationUpcomingCounts = useMemo(() => {
    const counts = Object.fromEntries(reservationTrackerColumns.map((column) => [column.key, 0]))
    for (const dueKey of Object.values(reservationUpcomingKeyByRegistrationId)) {
      if (counts[dueKey] !== undefined) {
        counts[dueKey] += 1
      }
    }
    return counts
  }, [reservationUpcomingKeyByRegistrationId])
  const trackingDueSummary = useMemo(() => {
    const lead = Object.values(leadDueCounts).reduce((sum, value) => sum + Number(value || 0), 0)
    const reservation = Object.values(reservationDueCounts).reduce((sum, value) => sum + Number(value || 0), 0)
    const leadUpcoming = Object.values(leadUpcomingCounts).reduce((sum, value) => sum + Number(value || 0), 0)
    const reservationUpcoming = Object.values(reservationUpcomingCounts).reduce((sum, value) => sum + Number(value || 0), 0)
    return {
      lead,
      reservation,
      upcoming: leadUpcoming + reservationUpcoming,
      total: lead + reservation,
    }
  }, [leadDueCounts, leadUpcomingCounts, reservationDueCounts, reservationUpcomingCounts])
  const standardReservationDueCount = useMemo(
    () =>
      standardReservationJourneyTrackerRows.reduce(
        (sum, row) => sum + (row?.registrationId && reservationDueKeyByRegistrationId[Number(row.registrationId)] ? 1 : 0),
        0
      ),
    [reservationDueKeyByRegistrationId, standardReservationJourneyTrackerRows]
  )
  const overnightReservationDueCount = useMemo(
    () =>
      overnightReservationJourneyTrackerRows.reduce(
        (sum, row) => sum + (row?.registrationId && reservationDueKeyByRegistrationId[Number(row.registrationId)] ? 1 : 0),
        0
      ),
    [overnightReservationJourneyTrackerRows, reservationDueKeyByRegistrationId]
  )
  const accountingDueEmailCount = useMemo(() => {
    const activeRegistrationIds = new Set(
      activeAccountingRows.map((row) => Number(row.registrationId || 0)).filter((value) => value > 0)
    )
    let total = 0
    for (const registrationId of activeRegistrationIds) {
      if (reservationDueKeyByRegistrationId[registrationId]) {
        total += 1
      }
    }
    return total
  }, [activeAccountingRows, reservationDueKeyByRegistrationId])
  const accountingUpcomingEmailCount = useMemo(() => {
    const activeRegistrationIds = new Set(
      activeAccountingRows.map((row) => Number(row.registrationId || 0)).filter((value) => value > 0)
    )
    let total = 0
    for (const registrationId of activeRegistrationIds) {
      if (reservationUpcomingKeyByRegistrationId[registrationId]) {
        total += 1
      }
    }
    return total
  }, [activeAccountingRows, reservationUpcomingKeyByRegistrationId])
  const getLeadTrackerTimingState = (row, column) => {
    if (row?.isRegistered || !row?.createdAt || !column?.key) {
      return ''
    }
    if (String(row?.status || '').startsWith('test_')) {
      return ''
    }
    const nextColumn = leadTrackerColumns.find((item) => !isTrackerStepHandled(row.steps[item.key]?.status))
    if (!nextColumn || nextColumn.key !== column.key) {
      return ''
    }
    const dueAt = String(row?.nextSendAt || '').trim()
    const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
    if (Number.isNaN(dueTime)) {
      return ''
    }
    const now = Date.now()
    if (dueTime <= now) {
      return 'due'
    }
    if (dueTime <= now + 24 * 60 * 60 * 1000) {
      return 'upcoming'
    }
    return ''
  }
  const getReservationTrackerTimingState = (row, column) => {
    if (!row?.createdAt || !column?.key) {
      return ''
    }
    if (String(row?.status || '').startsWith('test_')) {
      return ''
    }
    if (!row?.runId && String(row?.status || '') !== 'paid') {
      return ''
    }
    const now = Date.now()
    const upcomingBoundary = now + 24 * 60 * 60 * 1000

    if (String(row.status || '') === 'paid') {
      const registrationId = Number(row.registrationId || 0)
      if (registrationId <= 0 || row.registrationType === 'overnight-only') {
        return ''
      }
      const nextEntry = getPendingPaidJourneyEntries(row, row.selectedWeekStarts)[0]
      if (!nextEntry || nextEntry.key !== column.key) {
        return ''
      }
      const scheduledAt = new Date(nextEntry.scheduledAt).getTime()
      if (!scheduledAt) {
        return ''
      }
      if (scheduledAt <= now) {
        return 'due'
      }
      if (scheduledAt <= upcomingBoundary) {
        return 'upcoming'
      }
      return ''
    }

    const unpaidHourOffsets = [0, 12, 36, 66, 72]
    const nextColumn = reservationTrackerColumns
      .filter((item) => String(item.key || '').startsWith('step_'))
      .find((item) => !isTrackerStepHandled(row.steps[item.key]?.status))
    if (!nextColumn || nextColumn.key !== column.key) {
      return ''
    }
    const dueAt = addHoursToIso(row.createdAt, unpaidHourOffsets[Math.max(0, (nextColumn.stepNumber || 1) - 1)] || 0)
    const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
    if (Number.isNaN(dueTime)) {
      return ''
    }
    if (dueTime <= now) {
      return 'due'
    }
    if (dueTime <= upcomingBoundary) {
      return 'upcoming'
    }
    return ''
  }
  const accountingTotals = useMemo(() => {
    const source = activeAccountingRows
    const methodTotals = Object.fromEntries(accountingPaymentMethods.map((method) => [method, 0]))
    for (const row of source) {
      if (row.paymentMethod && methodTotals[row.paymentMethod] !== undefined) {
        methodTotals[row.paymentMethod] += Number(row.paidAmount || 0)
      }
    }
    return {
      totalTuition: source.reduce((sum, row) => sum + Number(row.totalAfterManualDiscount || 0), 0),
      totalPaid: source.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0),
      totalOwed: source.reduce((sum, row) => sum + Number(row.owedAmount || 0), 0),
      methodTotals,
      activeRows: source.length,
      archivedRows: archivedAccountingRows.length,
    }
  }, [activeAccountingRows, archivedAccountingRows.length])
  const tabEmptyCounts = useMemo(() => {
    const countMissingString = (value) => (String(value || '').trim() ? 0 : 1)
    const countMissingPositive = (value) => (Number(value || 0) > 0 ? 0 : 1)
    const mediaCount =
      countMissingString(config.media.welcomeLogoUrl) +
      countMissingString(config.media.heroImageUrl) +
      countMissingString(config.media.surveyVideoUrl) +
      countMissingString(config.media.surveyStep1FlyerUrl) +
      countMissingString(config.media.surveyMobileBgUrl) +
      countMissingString(config.media.wechatQrUrl) +
      (Array.isArray(config.media.surveyStepImageUrls)
        ? config.media.surveyStepImageUrls.reduce((sum, url) => sum + countMissingString(url), 0)
        : 6) +
      (Array.isArray(config.media.registrationStepImageUrls)
        ? config.media.registrationStepImageUrls.reduce((sum, url) => sum + countMissingString(url), 0)
        : 4) +
      (Array.isArray(config.media.overnightLandingImageUrls)
        ? config.media.overnightLandingImageUrls.reduce((sum, url) => sum + countMissingString(url), 0)
        : 6) +
      (Array.isArray(config.media.levelUpScreenshotUrls) && config.media.levelUpScreenshotUrls.length > 0 ? 0 : 1)

    const tuitionCount = [
      config.tuition.regular.fullWeek,
      config.tuition.regular.fullDay,
      config.tuition.regular.amHalf,
      config.tuition.regular.pmHalf,
      config.tuition.regular.overnightWeek,
      config.tuition.regular.overnightDay,
      config.tuition.discount.fullWeek,
      config.tuition.discount.fullDay,
      config.tuition.discount.amHalf,
      config.tuition.discount.pmHalf,
      config.tuition.bootcamp.regular.fullWeek,
      config.tuition.bootcamp.regular.fullDay,
      config.tuition.bootcamp.regular.amHalf,
      config.tuition.bootcamp.regular.pmHalf,
      config.tuition.bootcamp.discount.fullWeek,
      config.tuition.bootcamp.discount.fullDay,
      config.tuition.bootcamp.discount.amHalf,
      config.tuition.bootcamp.discount.pmHalf,
      config.tuition.discount.overnightWeek,
      config.tuition.discount.overnightDay,
      config.tuition.lunchPrice,
      config.tuition.siblingDiscountPct,
    ].reduce((sum, value) => sum + countMissingPositive(value), 0) + countMissingString(config.tuition.discountEndDate)

    const programsCount = ['general', 'bootcamp', 'overnight'].reduce((sum, key) => {
      const program = config.programs[key]
      return (
        sum +
        countMissingString(program.startDate) +
        countMissingString(program.endDate) +
        (Array.isArray(program.selectedWeeks) && program.selectedWeeks.length > 0 ? 0 : 1)
      )
    }, 0)

    const journeyCount = (Array.isArray(config.emailJourney) ? config.emailJourney : []).reduce(
      (sum, step) =>
        sum +
        countMissingString(step.dayLabel) +
        countMissingString(step.title) +
        countMissingString(step.subject) +
        countMissingString(step.body),
      0
    )

    const testimonialsCount = (Array.isArray(config.testimonials) ? config.testimonials : []).reduce(
      (sum, item) =>
        sum +
        countMissingString(item.studentName) +
        countMissingString(item.headline) +
        countMissingString(item.story) +
        countMissingString(item.outcome),
      0
    )

    return {
      media: mediaCount,
      tuition: tuitionCount,
      programs: programsCount,
      journey: journeyCount,
      accounting: 0,
      leads: 0,
      testimonials: testimonialsCount,
      tracking: 0,
      account: 0,
    }
  }, [config])
  const activeLeadJourneyTemplate = config.emailJourney[activeJourneyTab] || config.emailJourney[0]
  const activeReservationTemplate =
    reservationReminderJourneyTemplates[activeReservationJourneyTab] || reservationReminderJourneyTemplates[0]
  const activePaidEnrollmentTemplate =
    paidEnrollmentJourneyTemplates[activePaidEnrollmentJourneyTab] || paidEnrollmentJourneyTemplates[0]
  const isLeadJourneyFlow = activeJourneyFlow === 'lead'
  const isOvernightJourneyFlow = activeJourneyFlow === 'overnight'
  const isPaidFollowupJourneyFlow = activeJourneyFlow === 'paid-followup'
  const activeJourneyPreviewTemplates = isLeadJourneyFlow
    ? config.emailJourney
    : isPaidFollowupJourneyFlow
      ? paidEnrollmentJourneyTemplates
      : reservationReminderJourneyTemplates
  const activeJourneyPreviewIndex = isLeadJourneyFlow
    ? activeJourneyTab
    : isPaidFollowupJourneyFlow
      ? activePaidEnrollmentJourneyTab
      : activeReservationJourneyTab
  const activeJourneyTemplate = isLeadJourneyFlow
    ? activeLeadJourneyTemplate
    : isPaidFollowupJourneyFlow
      ? activePaidEnrollmentTemplate
      : activeReservationTemplate
  const activeJourneyBlueprintItems = isLeadJourneyFlow
    ? emailJourneyBlueprint
    : isPaidFollowupJourneyFlow
      ? paidEnrollmentJourneyBlueprint
      : reservationReminderJourneyBlueprint
  const activeJourneyStepLabel = activeJourneyBlueprintItems[activeJourneyPreviewIndex]?.step || `Step ${activeJourneyPreviewIndex + 1}`
  const activeJourneyDisplayTitle = activeJourneyTemplate?.title || activeJourneyStepLabel

  function getLevelUpScreenshotCaption(index) {
    return (
      levelUpScreenshotCaptions[index] ||
      'Additional app screen: progress, safety, scheduling, or family convenience.'
    )
  }

  function updateMedia(field, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        [field]: value,
      },
    }))
  }

  function updateLocationAddress(locationKey, field, value) {
    setConfig((current) => ({
      ...current,
      locations: {
        ...current.locations,
        [locationKey]: {
          ...current.locations?.[locationKey],
          [field]: value,
        },
      },
    }))
  }

  function updateTestimonial(index, field, value) {
    setConfig((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }))
  }

  function addTestimonial() {
    setConfig((current) => ({
      ...current,
      testimonials: [
        ...current.testimonials,
        {
          studentName: '',
          headline: '',
          story: '',
          outcome: '',
        },
      ],
    }))
  }

  function removeTestimonial(index) {
    setConfig((current) => ({
      ...current,
      testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function applyPremiumJourneyTemplates() {
    setConfig((current) => ({
      ...current,
      emailJourney: premiumJourneyTemplates.map((item) => ({ ...item })),
    }))
    setSavedMessage('Premium survey lead nurture templates loaded. Click Save Changes to publish.')
    setErrorMessage('')
  }

  function updateLeadJourneyTemplateField(index, field, value) {
    setConfig((current) => ({
      ...current,
      emailJourney: current.emailJourney.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }))
  }

  function renderJourneyTemplate(text) {
    const registrationLink = 'https://summer.newushu.com/register'
    return String(text || '')
      .replaceAll('{first_name}', 'Calvin')
      .replaceAll('{parent_name}', 'Calvin')
      .replaceAll('{guardian_name}', 'Calvin Chen')
      .replaceAll(
        '{recommended_plan}',
        'General Camp with progression options. If your camper wishes to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.'
      )
      .replaceAll('{registration_link}', registrationLink)
      .replaceAll(
        '{payment_methods}',
        PAYMENT_METHODS_TEXT
      )
      .replaceAll('{reservation_deadline}', 'May 20, 5:00 PM')
      .replaceAll(
        '{registration_summary}',
        '- Camper: Ethan (age 9)\n- Program: General Camp\n- Weeks: Jul 7-11, Jul 14-18\n- Lunch: Mon/Wed/Fri'
      )
      .replaceAll('{left_off_summary}', 'Location: Burlington\nParent/Guardian: Calvin Chen\nPayment method: Zelle')
      .replaceAll('{selected_weeks}', 'Jul 7-11\nJul 14-18')
      .replaceAll('{amount_due}', '$1,680.00')
      .replaceAll('{app_launch_date}', 'June 20')
  }

  function buildLeadPreviewTokens() {
    return {
      first_name: 'Calvin',
      parent_name: 'Calvin',
      guardian_name: 'Calvin Chen',
      recommended_plan:
        'General Camp with progression options. If your camper wishes to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.',
      registration_link: 'https://summer.newushu.com/register',
      payment_methods: PAYMENT_METHODS_TEXT,
      reservation_deadline: 'May 20, 5:00 PM EDT',
      registration_summary:
        'Location: Burlington\nParent/Guardian: Calvin Chen\nContact: calvin@example.com\nPayment method: Zelle\nEthan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri\nGrand total: $1,680.00',
      left_off_summary: 'Location: Burlington\nParent/Guardian: Calvin Chen\nPayment method: Zelle',
      selected_weeks: 'Jul 7-11\nJul 14-18',
      amount_due: '$1,680.00',
      app_launch_date: 'June 20',
    }
  }

  function buildReservationPreviewPayload(previewType = 'standard') {
    if (previewType === 'overnight') {
      return {
        registrationType: 'overnight-only',
        guardianName: 'Calvin Chen',
        camperNames: ['Ethan Chen'],
        location: 'Camp House (Address TBA)',
        paymentMethod: 'Zelle',
        amountDue: 1860,
        campWeeks: [
          { start: '2026-07-12', end: '2026-07-18' },
          { start: '2026-07-19', end: '2026-07-25' },
        ],
        summaryLines: [
          'Overnight Camp registration',
          'Parent/Guardian: Calvin Chen',
          'Contact: calvin@example.com',
          'Payment method: Zelle',
          'Overnight student 1: Jul 12 - Jul 18, Jul 19 - Jul 25 | Activities: Sanda fundamentals, Flexibility training, Video review',
          'Drop-off: Sunday 1:00 PM',
          'Pickup: Saturday 4:00 PM',
          'Location: Camp House (Address TBA)',
          'Week 1: $980.00. Week 2 gets an extra $100.00 off for $880.00.',
          'Tuition covers lodging and food only. Outing costs are billed separately.',
          'Grand total: $1,860.00',
        ],
      }
    }

    return {
      registrationType: '',
      guardianName: 'Calvin Chen',
      camperNames: ['Ethan Chen'],
      location: 'Burlington',
      paymentMethod: 'Zelle',
      amountDue: 1680,
      campWeeks: [
        { start: '2026-07-07', end: '2026-07-11' },
        { start: '2026-07-14', end: '2026-07-18' },
      ],
      summaryLines: [
        'Location: Burlington',
        'Parent/Guardian: Calvin Chen',
        'Contact: calvin@example.com',
        'Payment method: Zelle',
        'Ethan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri',
        'Grand total: $1,680.00',
        'Weekly reminders: Water Wednesday, BBQ Thursday, Friday showcase 4:00 PM',
      ],
    }
  }

  function buildJourneyPreviewHtmlFromTemplate(stepIndex, template, flowKey = 'lead') {
    if (flowKey === 'paid-followup') {
      return buildPaidEnrollmentJourneyMessage({
        stepNumber: stepIndex + 1,
        logoUrl: config.media?.welcomeLogoUrl || '',
        landingCarouselImageUrls: config.media?.landingCarouselImageUrls || [],
        payload:
          paidEnrollmentPreviewTrack === 'bootcamp'
            ? {
                registrationType: '',
                guardianName: 'Calvin Chen',
                camperNames: ['Ethan Chen'],
                location: 'Burlington',
                paymentMethod: 'Zelle',
                amountDue: 0,
                campWeeks: [
                  { start: '2026-07-07', end: '2026-07-11' },
                  { start: '2026-07-14', end: '2026-07-18' },
                  { start: '2026-07-21', end: '2026-07-25' },
                ],
                summaryLines: [
                  'Location: Burlington',
                  'Parent/Guardian: Calvin Chen',
                  'Contact: calvin@example.com',
                  'Payment method: Zelle',
                  'Ethan Chen: Competition Boot Camp, Jul 7-11, Jul 14-18, Jul 21-25',
                  'Grand total: $2,340.00',
                  'Camp hours: 8:30 AM-4:00 PM (pickup 4:00-4:30 PM)',
                  'Weekly reminders: Water Wednesday, BBQ Thursday, Friday showcase during pickup',
                ],
              }
            : buildReservationPreviewPayload('standard'),
      }).html
    }

    if (flowKey === 'reservation' || flowKey === 'overnight') {
      return buildReservationJourneyMessage({
        stepNumber: stepIndex + 1,
        logoUrl: config.media?.welcomeLogoUrl || '',
        landingCarouselImageUrls: config.media?.landingCarouselImageUrls || [],
        payload: buildReservationPreviewPayload(flowKey === 'overnight' ? 'overnight' : 'standard'),
      }).html
    }

    return buildLeadJourneyMessage({
      template,
      tokens: buildLeadPreviewTokens(),
      logoUrl: config.media?.welcomeLogoUrl || '',
      landingCarouselImageUrls: config.media?.landingCarouselImageUrls || [],
      stepNumber: stepIndex + 1,
    }).html
  }

  async function sendTestEmailForStep(stepIndex, template, flowKey = 'lead') {
    const recipient = testEmail.trim()
    if (!/\S+@\S+\.\S+/.test(recipient)) {
      setErrorMessage('Enter a valid test email first.')
      return
    }

    if (!template?.subject || !template?.body) {
      setErrorMessage(`Step ${stepIndex + 1} is missing subject or body.`)
      return
    }

    setSendingTestStep(stepIndex + 1)
    setErrorMessage('')
    setSavedMessage('')

    const response = await fetch('/api/email/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: recipient,
          stepNumber: stepIndex + 1,
          flowKey,
          previewRegistrationType:
            flowKey === 'overnight'
              ? 'overnight-only'
              : flowKey === 'paid-followup'
                ? paidEnrollmentPreviewTrack
                : 'standard',
          template: {
            subject: renderJourneyTemplate(template.subject),
            body: renderJourneyTemplate(template.body),
            videoUrl: template?.videoUrl || '',
          },
        }),
      })

    const result = await response.json()
    if (!response.ok) {
      setErrorMessage(result?.error || 'Test email failed.')
      setSendingTestStep(0)
      return
    }

    if (supabaseEnabled && supabase) {
      const { data: runRows } = await supabase
        .from('email_journey_runs')
        .insert({
          email: recipient,
          status: result?.previewOnly ? `test_preview_only_${flowKey}` : `test_sent_${flowKey}`,
          current_step: stepIndex + 1,
          last_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .limit(1)

      const runId = runRows?.[0]?.id || null
      await supabase.from('email_journey_events').insert({
        run_id: runId,
        email: recipient,
        step_number: stepIndex + 1,
        event_type: result?.previewOnly ? `test_preview_only_${flowKey}` : `test_sent_${flowKey}`,
        subject: renderJourneyTemplate(template.subject),
        body_preview: renderJourneyTemplate(template.body).slice(0, 400),
        event_payload: {
          ...result,
          flowKey,
        },
      })
    }

      setSavedMessage(
        result?.previewOnly
        ? 'Template preview succeeded. Configure SES to send real test emails.'
        : `Step ${stepIndex + 1} test email sent to ${recipient}.`
    )
    setSendingTestStep(0)
    refreshEmailTracking()
  }

  async function updateReservationRunPaymentStatus(run, markPaid) {
    if (!supabaseEnabled || !supabase || !run?.id) {
      setErrorMessage('Supabase is not configured for payment status updates.')
      return
    }

    setUpdatingRunId(run.id)
    setErrorMessage('')
    setSavedMessage('')

    const nextStatus = markPaid ? 'paid' : 'active'
    const nextSendAt = markPaid ? new Date().toISOString() : new Date().toISOString()
    const nowIso = new Date().toISOString()

    const updateResponse = await supabase
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        next_send_at: nextSendAt,
        updated_at: nowIso,
      })
      .eq('id', run.id)

    if (updateResponse.error) {
      setErrorMessage(`Unable to update run status: ${updateResponse.error.message}`)
      setUpdatingRunId(0)
      return
    }

    const eventType = markPaid ? 'payment_marked_paid' : 'payment_marked_unpaid'
    await supabase.from('email_journey_events').insert({
      run_id: run.id,
      email: run.email,
      step_number: null,
      event_type: eventType,
      subject: markPaid ? 'Payment marked received' : 'Payment status returned to unpaid follow-up',
      body_preview: markPaid
        ? 'Marked paid in admin. Unpaid reminders stopped. Paid prep journey enabled.'
        : 'Marked unpaid in admin. 72-hour reminder flow resumed.',
      event_payload: {
        markedAt: nowIso,
      },
    })

    setSavedMessage(
      markPaid
        ? `Marked ${run.email} as paid. Unpaid reminders are stopped and prep journey scheduling is active.`
        : `Marked ${run.email} as unpaid. Submitted-registration reminder flow is active again.`
    )
    setUpdatingRunId(0)
    refreshEmailTracking()
  }

  async function processDueJourneyEmails() {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for journey processing.')
      return
    }

    setProcessingJourneyEmails(true)
    setSavedMessage('')
    setErrorMessage('')
    setJourneyProcessSummary(null)

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      setProcessingJourneyEmails(false)
      return
    }

    try {
      const [leadResponse, reservationResponse] = await Promise.all([
        fetch('/api/email/lead-journey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: 'process' }),
        }),
        fetch('/api/email/reservation-journey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: 'process' }),
        }),
      ])

      const leadResult = await leadResponse.json().catch(() => ({}))
      const reservationResult = await reservationResponse.json().catch(() => ({}))

      if (!leadResponse.ok || !reservationResponse.ok) {
        setErrorMessage(
          leadResult?.error ||
            reservationResult?.error ||
            'Manual journey processing failed.'
        )
        setProcessingJourneyEmails(false)
        return
      }

      setJourneyProcessSummary({
        lead: {
          sent: leadResult?.emailed || 0,
          queued: leadResult?.queued || 0,
          checked: leadResult?.processed || 0,
          stepCounts: leadResult?.stepCounts || {},
          candidates: leadResult?.debug?.queue?.candidates || 0,
          skippedRegistered: leadResult?.debug?.queue?.skippedRegistered || 0,
          skippedActive: leadResult?.debug?.queue?.skippedActive || 0,
          skippedExistingStepOne: leadResult?.debug?.queue?.skippedExistingStepOne || 0,
          revived: leadResult?.debug?.queue?.revived || 0,
          newRuns: leadResult?.debug?.queue?.enqueuedNew || 0,
          bootstrapped: leadResult?.debug?.stepOne?.bootstrapped || 0,
          stepOneSent: leadResult?.debug?.stepOne?.emailed || 0,
        },
        reservation: {
          sent: reservationResult?.emailed || 0,
          checked: reservationResult?.processed || 0,
          stepCounts: reservationResult?.stepCounts || {},
        },
      })
      setSavedMessage('Processed due emails.')
      refreshEmailTracking()
    } catch (error) {
      setErrorMessage(error?.message || 'Manual journey processing failed.')
    }

    setProcessingJourneyEmails(false)
  }

  async function repairMissingReservationRunsFromAdmin() {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for reservation run repair.')
      return
    }

    setRepairingReservationRuns(true)
    setSavedMessage('')
    setErrorMessage('')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      setRepairingReservationRuns(false)
      return
    }

    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: 'repair_missing_runs' }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Reservation run repair failed.')
      }
      setSavedMessage(
        result?.repaired > 0
          ? `Repaired ${result.repaired} missing registration run${result.repaired === 1 ? '' : 's'}.`
          : 'No missing registration runs needed repair.'
      )
      refreshEmailTracking()
    } catch (error) {
      setErrorMessage(error?.message || 'Reservation run repair failed.')
    }

    setRepairingReservationRuns(false)
  }

  async function assignRunForEmail(email) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured.')
      return
    }

    setAssigningRunEmail(email)
    setSavedMessage('')
    setErrorMessage('')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      setAssigningRunEmail('')
      return
    }

    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: 'create_run_for_email', email }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Run assignment failed.')
      }
      if (result?.warning) {
        setSavedMessage(result.warning)
      } else {
        setSavedMessage(`Run assigned for ${email} (run id: ${result?.runId}).`)
        refreshEmailTracking()
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Run assignment failed.')
    }

    setAssigningRunEmail('')
  }

  async function attachExistingRunToRegistration(row) {
    const selectedRunId = Number(selectedRunAssignmentByRow[row.key] || 0)
    if (!selectedRunId) {
      setErrorMessage('Choose a run first.')
      return
    }
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured.')
      return
    }

    setAssigningRunKey(row.key)
    setSavedMessage('')
    setErrorMessage('')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      setAssigningRunKey('')
      return
    }

    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'attach_run_to_registration',
          registrationId: row.registrationId,
          runId: selectedRunId,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Run attachment failed.')
      }
      if (result?.warning) {
        setSavedMessage(result.warning)
      } else {
        setSavedMessage(`Attached run ${selectedRunId} to ${row.email}.`)
        setSelectedRunAssignmentByRow((current) => {
          if (!current[row.key]) {
            return current
          }
          const next = { ...current }
          delete next[row.key]
          return next
        })
        refreshEmailTracking()
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Run attachment failed.')
    }

    setAssigningRunKey('')
  }

  async function setTrackerRowVisibility(row, hidden) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured.')
      return
    }

    setSettingTrackerVisibilityKey(row.key)
    setSavedMessage('')
    setErrorMessage('')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      setSettingTrackerVisibilityKey('')
      return
    }

    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'set_tracker_visibility',
          registrationId: row.registrationId,
          runId: row.runId,
          email: row.email,
          hidden,
          reason: hidden ? 'admin_hide_row' : 'admin_unhide_row',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Tracker row update failed.')
      }
      setSavedMessage(hidden ? `Hid ${row.email} from the active tracker.` : `Restored ${row.email} to the active tracker.`)
      refreshEmailTracking()
    } catch (error) {
      setErrorMessage(error?.message || 'Tracker row update failed.')
    }

    setSettingTrackerVisibilityKey('')
  }

  function renderAccountingDetailChip(detailKey, label, items = [], displayCount = null) {
    if (!Array.isArray(items) || items.length === 0) {
      return null
    }
    const expanded = accountingOverlay.key === detailKey
    return (
      <div key={detailKey} className="accountingDetailGroup">
        <button
          type="button"
          className={`accountingDetailChip ${expanded ? 'active' : ''}`}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const overlayWidth = Math.min(360, window.innerWidth - 24)
            const left = Math.max(12, Math.min(rect.left, window.innerWidth - overlayWidth - 12))
            const top = Math.min(rect.bottom + 10, window.innerHeight - 24)
            const pointerLeft = Math.max(18, Math.min(rect.left + rect.width / 2 - left, overlayWidth - 18))

            setAccountingOverlay((current) =>
              current.key === detailKey
                ? { key: '', label: '', items: [], top: 0, left: 0, pointerLeft: 24 }
                : { key: detailKey, label, items, top, left, pointerLeft }
            )
          }}
        >
          {label}: {displayCount ?? items.length}
        </button>
      </div>
    )
  }

  async function manuallySendJourneyCell({ flow, row, column }) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for manual journey sends.')
      return
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      return
    }

    const rowKey = row?.runId || row?.registrationId || row?.email || 'unknown'
    const sendingKey = `${flow}-${rowKey}-${column.key}`
    setSendingJourneyCellKey(sendingKey)
    setSavedMessage('')
    setErrorMessage('')

    try {
      const url = flow === 'lead' ? '/api/email/lead-journey' : '/api/email/reservation-journey'
      const body =
        flow === 'lead'
          ? {
              action: 'manual_send',
              email: row?.email,
              runId: row?.runId || null,
              stepNumber: column?.stepNumber,
            }
          : {
              action: 'manual_send',
              runId: row?.runId,
              stepKey: column?.key,
              stepNumber: column?.stepNumber,
            }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Manual send failed.')
      }
      setSavedMessage(
        result?.previewOnly
          ? `Manual send created a preview for ${row?.email || 'this row'} ${column?.label || ''}. SES live sending is not active for that message.`
          : `Manual send completed for ${row?.email || 'this row'} ${column?.label || ''}.`
      )
      refreshEmailTracking()
    } catch (error) {
      setErrorMessage(error?.message || 'Manual send failed.')
    }

    setSendingJourneyCellKey('')
  }

  async function previewJourneyCell({ flow, row, column }) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for journey previews.')
      return
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      return
    }

    const rowKey = row?.runId || row?.registrationId || row?.email || 'unknown'
    const previewKey = `${flow}-${rowKey}-${column.key}`
    setPreviewingJourneyCellKey(previewKey)
    setSavedMessage('')
    setErrorMessage('')

    try {
      const url = flow === 'lead' ? '/api/email/lead-journey' : '/api/email/reservation-journey'
      const body =
        flow === 'lead'
          ? {
              action: 'preview_step',
              email: row?.email,
              runId: row?.runId || null,
              stepNumber: column?.stepNumber,
            }
          : {
              action: 'preview_step',
              runId: row?.runId,
              stepKey: column?.key,
              stepNumber: column?.stepNumber,
            }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Preview failed.')
      }

      setJourneyCellPreviewState({
        open: true,
        title: `${row?.email || 'Email'} • ${column?.label || 'Step'}`,
        subject: String(result?.subject || ''),
        html: String(result?.html || ''),
      })
    } catch (error) {
      setErrorMessage(error?.message || 'Preview failed.')
    }

    setPreviewingJourneyCellKey('')
  }

  async function previewEmailEventRow(eventRow) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for journey previews.')
      return
    }

    const eventType = String(eventRow?.event_type || '').trim()
    const stepNumber = Number(eventRow?.step_number || 0)
    const runId = Number(eventRow?.run_id || 0)
    const eventKey = `event-${eventRow?.id || `${runId}-${eventType}-${stepNumber}`}`
    const eventPayload =
      typeof eventRow?.event_payload === 'object' && eventRow?.event_payload
        ? eventRow.event_payload
        : parseMaybeJson(eventRow?.event_payload, {}) || {}

    const buildReservationStepKey = () => {
      switch (eventType) {
        case 'paid_prep_7d_sent':
        case 'paid_prep_7d_sent_preview':
        case 'paid_prep_opened':
          return 'paid_7d'
        case 'paid_prep_5d_sent':
        case 'paid_prep_5d_sent_preview':
          return 'paid_5d'
        case 'paid_prep_3d_sent':
        case 'paid_prep_3d_sent_preview':
          return 'paid_3d'
        case 'paid_prep_1d_sent':
        case 'paid_prep_1d_sent_preview':
          return 'paid_1d'
        case 'paid_followup_opened':
          return String(eventPayload?.stepKey || '').trim()
        case 'paid_followup_0w_sent':
        case 'paid_followup_0w_sent_preview':
          return 'paid_0w'
        case 'paid_followup_2w_sent':
        case 'paid_followup_2w_sent_preview':
          return 'paid_2w'
        case 'paid_followup_4w_sent':
        case 'paid_followup_4w_sent_preview':
          return 'paid_4w'
        case 'paid_followup_8w_sent':
        case 'paid_followup_8w_sent_preview':
          return 'paid_8w'
        default:
          return ''
      }
    }

    const isLeadEvent =
      eventType.startsWith('lead_journey_') ||
      eventType === 'test_sent_lead' ||
      eventType === 'test_preview_only_lead'
    const isReservationEvent =
      eventType === 'reservation_email_sent' ||
      eventType === 'reservation_email_preview' ||
      eventType === 'test_sent_reservation' ||
      eventType === 'test_preview_only_reservation' ||
      eventType.startsWith('paid_prep_') ||
      eventType.startsWith('paid_followup_')

    if (!isLeadEvent && !isReservationEvent) {
      setErrorMessage('This event row does not have a viewable email preview.')
      return
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token || ''
    if (sessionError || !accessToken) {
      setErrorMessage('Admin session not found. Log in again and retry.')
      return
    }

    setPreviewingEventRowKey(eventKey)
    setSavedMessage('')
    setErrorMessage('')

    try {
      const flow = isLeadEvent ? 'lead' : 'reservation'
      const url = flow === 'lead' ? '/api/email/lead-journey' : '/api/email/reservation-journey'
      const reservationStepKey = buildReservationStepKey()
      const body =
        flow === 'lead'
          ? {
              action: 'preview_step',
              email: eventRow?.email,
              runId: runId || null,
              stepNumber: Math.max(1, stepNumber || 1),
            }
          : {
              action: 'preview_step',
              runId,
              stepKey: reservationStepKey || undefined,
              stepNumber: reservationStepKey ? undefined : Math.max(1, stepNumber || 1),
            }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Preview failed.')
      }

      setJourneyCellPreviewState({
        open: true,
        title: `${eventRow?.email || 'Email'} • ${eventType}`,
        subject: String(result?.subject || ''),
        html: String(result?.html || ''),
      })
    } catch (error) {
      setErrorMessage(error?.message || 'Preview failed.')
    }

    setPreviewingEventRowKey('')
  }

  function buildLeadCalendarEntries(row) {
    const fallbackDays = [0, 2, 4, 6, 8]
    return leadTrackerColumns
      .map((column, index) => {
        const dayLabel = config.emailJourney[index]?.dayLabel || ''
        const scheduledAt = addDaysToIso(row?.createdAt, parseLeadJourneyDayOffset(dayLabel, fallbackDays[index] || index * 2))
        if (!scheduledAt) {
          return null
        }
        return {
          label: column.label,
          scheduledAt,
          status: row?.steps?.[column.key]?.status || 'pending',
        }
      })
      .filter(Boolean)
  }

  function buildReservationCalendarEntries(row) {
    if (String(row?.status || '') === 'paid') {
      const sentKeys = row?.paidSentInstanceKeys instanceof Set ? row.paidSentInstanceKeys : new Set()
      const previewKeys = row?.paidPreviewInstanceKeys instanceof Set ? row.paidPreviewInstanceKeys : new Set()
      const openedKeys = row?.paidOpenedInstanceKeys instanceof Set ? row.paidOpenedInstanceKeys : new Set()
      return getPaidJourneyEntries(row, row.selectedWeekStarts).map((entry) => ({
        label: entry.label,
        scheduledAt: entry.scheduledAt,
        status: openedKeys.has(entry.instanceKey) ? 'opened' : sentKeys.has(entry.instanceKey) ? 'sent' : previewKeys.has(entry.instanceKey) ? 'preview' : 'pending',
        note: entry.weekStart ? formatJourneyCalendarWeekNote(entry.weekStart) : 'After signup follow-up',
      }))
    }

    const unpaidHourOffsets = [0, 12, 36, 66, 72]
    return reservationTrackerColumns
      .filter((column) => String(column.key || '').startsWith('step_'))
      .map((column) => {
        const scheduledAt = addHoursToIso(row?.createdAt, unpaidHourOffsets[Math.max(0, (column.stepNumber || 1) - 1)] || 0)
        if (!scheduledAt) {
          return null
        }
        return {
          label: column.label,
          scheduledAt,
          status: row?.steps?.[column.key]?.status || 'pending',
        }
      })
      .filter(Boolean)
  }

  function openJourneyCalendar({ flow, row }) {
    const entries = flow === 'lead' ? buildLeadCalendarEntries(row) : buildReservationCalendarEntries(row)
    setJourneyCalendarState({
      open: true,
      title: `${row?.email || 'Journey'} Calendar`,
      entries,
    })
  }

  async function syncReservationPaymentForRun(runId, markPaid) {
    const normalizedRunId = Number(runId || 0)
    if (normalizedRunId <= 0 || !supabaseEnabled || !supabase) {
      return
    }
    const nowIso = new Date().toISOString()
    const { data: run, error: runError } = await supabase
      .from('email_journey_runs')
      .select('id, email, status')
      .eq('id', normalizedRunId)
      .maybeSingle()
    if (runError || !run?.id) {
      return
    }

    const nextStatus = markPaid ? 'paid' : 'active'
    const currentStatus = String(run?.status || '').trim().toLowerCase()
    if (currentStatus === nextStatus) {
      return
    }

    await supabase
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        next_send_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', normalizedRunId)
      .in('status', ['active', 'queued', 'paid', 'canceled_unpaid'])

    await supabase.from('email_journey_events').insert({
      run_id: normalizedRunId,
      email: run.email,
      step_number: null,
      event_type: markPaid ? 'payment_marked_paid' : 'payment_marked_unpaid',
      subject: markPaid ? 'Payment marked received' : 'Payment status returned to unpaid follow-up',
      body_preview: markPaid
        ? 'Accounting save reached 95%+ tuition paid. Unpaid reminders stopped and paid follow-up scheduling started.'
        : 'Accounting save dropped below the paid threshold. Registration reminder flow resumed.',
      event_payload: {
        markedAt: nowIso,
        source: 'accounting_save',
      },
    })
  }

  async function updateAccountingEntryField(row, updates = {}) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for accounting updates.')
      return false
    }
    const key = `${row.registrationId}-${row.camperIndex}`
    setUpdatingAccountingKey(key)
    setSavedMessage('')
    setErrorMessage('')

    const sourceRecord = registrationRecords.find((item) => Number(item.id) === Number(row.registrationId))
    if (!sourceRecord) {
      setErrorMessage('Registration row not found.')
      setUpdatingAccountingKey('')
      return false
    }

    const currentEntries = Array.isArray(sourceRecord.accounting_entries) ? sourceRecord.accounting_entries : []
    const existingIndex = currentEntries.findIndex((item) => Number(item?.camper_index) === Number(row.camperIndex))
    const base =
      existingIndex >= 0
        ? currentEntries[existingIndex]
        : {
            camper_index: row.camperIndex,
            camper_name: row.camperName,
            archived: false,
            paid_amount: 0,
            tuition_paid_amount: 0,
            lunch_paid_amount: 0,
            manual_discount: 0,
            payment_method: '',
          }
    const next = {
      ...base,
      ...updates,
      camper_index: row.camperIndex,
      camper_name: row.camperName,
      paid_amount: Math.max(0, Number(updates.paid_amount ?? base.paid_amount ?? 0)),
      tuition_paid_amount: Math.max(0, Number(updates.tuition_paid_amount ?? base.tuition_paid_amount ?? 0)),
      lunch_paid_amount: Math.max(0, Number(updates.lunch_paid_amount ?? base.lunch_paid_amount ?? 0)),
      manual_discount: Math.max(0, Number(updates.manual_discount ?? base.manual_discount ?? 0)),
      payment_method: String(updates.payment_method ?? base.payment_method ?? '').trim().toLowerCase(),
      archived: Boolean(updates.archived ?? base.archived ?? false),
    }
    if (updates.tuition_paid_amount != null || updates.lunch_paid_amount != null) {
      next.paid_amount = roundMoney(Number(next.tuition_paid_amount || 0) + Number(next.lunch_paid_amount || 0))
    }
    if (!accountingPaymentMethods.includes(next.payment_method)) {
      next.payment_method = ''
    }

    const merged = [...currentEntries]
    if (existingIndex >= 0) {
      merged[existingIndex] = next
    } else {
      merged.push(next)
    }

    const response = await supabase
      .from('registrations')
      .update({ accounting_entries: merged })
      .eq('id', sourceRecord.id)

    if (response.error) {
      setErrorMessage(
        `Accounting update failed: ${response.error.message}. Run the new SQL migration to add accounting fields if needed.`
      )
      setUpdatingAccountingKey('')
      return false
    }

    const normalizedPaymentState = deriveAccountingPaymentState({
      entry: next,
      tuitionTotal: Number(row.tuitionBeforeManualDiscount || 0) + Number(row.lunchCost || 0),
      lunchTotal: Number(row.lunchCost || 0),
      manualDiscount: Number(next.manual_discount || 0),
    })
    const shouldMarkPaid = normalizedPaymentState.shouldStopRegistrationEmails && next.archived === false
    await syncReservationPaymentForRun(reservationRunIdByRegistrationId[row.registrationId], shouldMarkPaid)
    setRegistrationRecords((current) =>
      current.map((item) =>
        Number(item.id) === Number(sourceRecord.id) ? { ...item, accounting_entries: merged } : item
      )
    )
    setSavedMessage('Accounting row updated.')
    setUpdatingAccountingKey('')
    refreshEmailTracking()
    return true
  }

  function updateAccountingDraft(row, updates = {}) {
    setAccountingDrafts((current) => ({
      ...current,
      [row.key]: {
        manualDiscount:
          updates.manualDiscount ?? current[row.key]?.manualDiscount ?? Number(row.manualDiscount || 0),
        tuitionPaidAmount:
          updates.tuitionPaidAmount ?? current[row.key]?.tuitionPaidAmount ?? String(row.tuitionPaidAmount ?? 0),
        lunchPaidAmount:
          updates.lunchPaidAmount ?? current[row.key]?.lunchPaidAmount ?? String(row.lunchPaidAmount ?? 0),
        paymentMethod:
          updates.paymentMethod ?? current[row.key]?.paymentMethod ?? String(row.paymentMethod || ''),
        archived: updates.archived ?? current[row.key]?.archived ?? Boolean(row.archived),
      },
    }))
  }

  async function saveAccountingDraft(row) {
    const draft = accountingDrafts[row.key]
    if (!draft) {
      return
    }
    const hasChanges =
      Number(draft.manualDiscount || 0) !== Number(row.manualDiscount || 0) ||
      Number(draft.tuitionPaidAmount || 0) !== Number(row.tuitionPaidAmount || 0) ||
      Number(draft.lunchPaidAmount || 0) !== Number(row.lunchPaidAmount || 0) ||
      String(draft.paymentMethod || '') !== String(row.paymentMethod || '') ||
      Boolean(draft.archived) !== Boolean(row.archived)
    if (!hasChanges) {
      setAccountingDrafts((current) => {
        const next = { ...current }
        delete next[row.key]
        return next
      })
      return
    }
    const ok = await updateAccountingEntryField(row, {
      manual_discount: Number(draft.manualDiscount || 0),
      tuition_paid_amount: Number(draft.tuitionPaidAmount || 0),
      lunch_paid_amount: Number(draft.lunchPaidAmount || 0),
      payment_method: String(draft.paymentMethod || ''),
      archived: Boolean(draft.archived),
    })
    if (ok) {
      setAccountingDrafts((current) => {
        const next = { ...current }
        delete next[row.key]
        return next
      })
    }
  }

  async function updateOvernightWeeks(row, nextWeekIds = []) {
    if (!supabaseEnabled || !supabase) {
      setErrorMessage('Supabase is not configured for overnight week updates.')
      return false
    }
    const key = `${row.registrationId}-${row.camperIndex}`
    setUpdatingAccountingKey(key)
    setSavedMessage('')
    setErrorMessage('')

    const sourceRecord = registrationRecords.find((item) => Number(item.id) === Number(row.registrationId))
    if (!sourceRecord) {
      setErrorMessage('Registration row not found.')
      setUpdatingAccountingKey('')
      return false
    }

    const rawMeta = parseMaybeJson(sourceRecord.medical_notes, {}) || {}
    const registration = rawMeta?.registration || {}
    const students = Array.isArray(registration.students) ? registration.students : []
    if (!students[row.camperIndex]) {
      setErrorMessage('Overnight camper row not found.')
      setUpdatingAccountingKey('')
      return false
    }

    const normalizedWeekIds = Array.from(new Set(nextWeekIds.filter(Boolean)))
    const nextStudents = students.map((student, index) =>
      index === Number(row.camperIndex)
        ? {
            ...student,
            overnightWeekIds: normalizedWeekIds,
          }
        : student
    )

    const response = await supabase
      .from('registrations')
      .update({
        medical_notes: JSON.stringify({
          ...rawMeta,
          registration: {
            ...registration,
            students: nextStudents,
          },
        }),
      })
      .eq('id', sourceRecord.id)

    if (response.error) {
      setErrorMessage(`Overnight week update failed: ${response.error.message}`)
      setUpdatingAccountingKey('')
      return false
    }

    setRegistrationRecords((current) =>
      current.map((item) =>
        Number(item.id) === Number(sourceRecord.id)
          ? {
              ...item,
              medical_notes: JSON.stringify({
                ...rawMeta,
                registration: {
                  ...registration,
                  students: nextStudents,
                },
              }),
            }
          : item
      )
    )
    setSavedMessage('Overnight weeks updated.')
    setUpdatingAccountingKey('')
    return true
  }

  function buildAccountingSummaryDocumentForRow(row) {
    const sourceRecord = registrationRecords.find((item) => Number(item.id) === Number(row.registrationId))
    const rawMeta = sourceRecord ? parseMaybeJson(sourceRecord.medical_notes, {}) || {} : {}
    const payload = rawMeta?.registration || {}
    if (!payload || !Array.isArray(payload.students) || payload.students.length === 0) {
      throw new Error('Registration summary payload not found for this row.')
    }

    const summaryRegistration = {
      ...payload,
      parentName: payload.parentName || row.parentName,
      contactEmail: payload.contactEmail || row.parentEmail,
      paymentMethod: row.paymentMethod || payload.paymentMethod || '',
    }
    const accountingSummary = {
      title: `Current Accounting Snapshot for ${row.camperName || 'Camper'}`,
      rows: [
        { label: 'Tuition after discounts', value: money(row.tuitionAfterManualDiscount) },
        { label: 'Lunch total', value: money(row.lunchCost) },
        { label: 'Registration total', value: money(row.totalAfterManualDiscount) },
        { label: 'Paid tuition', value: money(row.tuitionPaidAmount) },
        { label: 'Paid lunch', value: money(row.lunchPaidAmount) },
        { label: 'Total paid', value: money(row.paidAmount) },
        { label: 'Current balance due', value: money(row.owedAmount) },
        { label: 'Preferred payment method', value: String(row.paymentMethod || payload.paymentMethod || '').toUpperCase() || 'Select in portal' },
      ],
    }

    return buildRegistrationSummaryDocument({
      registration: summaryRegistration,
      tuition: config.tuition,
      weeksById: weekById,
      generatedAtLabel: new Date(sourceRecord?.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      applyLimitedDiscount: isLimitedDiscountActiveForDate(
        config.tuition.discountEndDate,
        sourceRecord?.created_at
      ),
      businessName: config.tuition.businessName || 'New England Wushu',
      businessAddress: config.tuition.businessAddress || '',
      accountingSummary,
    })
  }

  function openAccountingInvoicePreview(row) {
    try {
      const summaryDocument = buildAccountingSummaryDocumentForRow(row)
      setInvoicePreviewState({
        open: true,
        title: `${row.camperName} Invoice Preview`,
        html: summaryDocument.html,
      })
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error?.message || 'Invoice preview failed.')
    }
  }

  function openAccountingInvoiceSendDialog(row) {
    const toEmail = String(row.parentEmail || '').trim()
    if (!/\S+@\S+\.\S+/.test(toEmail)) {
      setErrorMessage('Parent email is required to send invoice.')
      return
    }
    setInvoiceSendDialog({
      open: true,
      row,
      sendAdminCopy: true,
    })
    setErrorMessage('')
  }

  function openAccountingEditor(row) {
    const sourceRecord = registrationRecords.find((item) => Number(item.id) === Number(row.registrationId))
    const rawMeta = sourceRecord ? parseMaybeJson(sourceRecord.medical_notes, {}) || {} : {}
    const payload = rawMeta?.registration || {}
    const students = Array.isArray(payload.students) ? payload.students : []
    if (!sourceRecord || students.length === 0 || !students[row.camperIndex]) {
      setErrorMessage('Saved registration data was not found for this camper.')
      return
    }

    setAccountingEditState({
      open: true,
      row,
      sourceRecordId: Number(sourceRecord.id),
      registration: {
        ...payload,
        students: students.map((student) => ({
          ...student,
          schedule: typeof student?.schedule === 'object' && student.schedule ? student.schedule : {},
          lunch: typeof student?.lunch === 'object' && student.lunch ? student.lunch : {},
        })),
      },
      expandedWeekKey: '',
      expandedLunchWeekKey: '',
    })
    setErrorMessage('')
  }

  function setAccountingEditorStudentWeek(week, updater) {
    setAccountingEditState((current) => {
      if (!current.registration || !current.row) {
        return current
      }
      const studentIndex = Number(current.row.camperIndex || 0)
      const students = Array.isArray(current.registration.students) ? current.registration.students : []
      const student = students[studentIndex]
      if (!student) {
        return current
      }
      const weekDayKeys = Array.isArray(week.days) ? week.days.map((item) => item.key) : accountingEditorDayKeys
      const currentEntry = student.schedule?.[week.id] || {
        weekId: week.id,
        programKey: week.programKey,
        campType: week.programKey === 'daycamp' ? '' : week.programKey,
        days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
      }
      const updatedEntry = updater(currentEntry)
      const dayModes = weekDayKeys.map((day) => updatedEntry.days?.[day] || 'NONE')
      const hasAnyDay = dayModes.some((mode) => mode !== 'NONE')
      const nextSchedule = { ...(student.schedule || {}) }
      const nextLunch = { ...(student.lunch || {}) }

      if (hasAnyDay) {
        nextSchedule[week.id] = updatedEntry
      } else {
        delete nextSchedule[week.id]
        for (const day of weekDayKeys) {
          delete nextLunch[`${week.id}:${day}`]
        }
      }

      for (const day of weekDayKeys) {
        if ((updatedEntry.days?.[day] || 'NONE') === 'NONE') {
          delete nextLunch[`${week.id}:${day}`]
        }
      }

      const nextStudents = students.map((item, index) =>
        index === studentIndex
          ? {
              ...item,
              schedule: nextSchedule,
              lunch: nextLunch,
            }
          : item
      )

      return {
        ...current,
        registration: {
          ...current.registration,
          students: nextStudents,
        },
      }
    })
  }

  function setAccountingEditorCampType(week, campType) {
    setAccountingEditState((current) => {
      if (!current.registration || !current.row) {
        return current
      }
      const studentIndex = Number(current.row.camperIndex || 0)
      const students = Array.isArray(current.registration.students) ? current.registration.students : []
      const student = students[studentIndex]
      if (!student) {
        return current
      }
      const existing = student.schedule?.[week.id] || {
        weekId: week.id,
        programKey: week.programKey,
        campType: '',
        days: accountingEditorDayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
      }
      const nextStudents = students.map((item, index) =>
        index === studentIndex
          ? {
              ...item,
              schedule: {
                ...(item.schedule || {}),
                [week.id]: {
                  ...existing,
                  campType,
                },
              },
            }
          : item
      )
      return {
        ...current,
        registration: {
          ...current.registration,
          students: nextStudents,
        },
      }
    })
  }

  function toggleAccountingEditorFullWeek(week) {
    if (!accountingEditStudent) {
      return
    }
    const selectedCampType = accountingEditStudent.schedule?.[week.id]?.campType || ''
    if (!selectedCampType) {
      setErrorMessage('Select General or Boot Camp for this week first.')
      return
    }
    const weekDayKeys = Array.isArray(week.days) ? week.days.map((item) => item.key) : accountingEditorDayKeys
    setAccountingEditorStudentWeek(week, (entry) => {
      const alreadyFull = weekDayKeys.every((day) => (entry.days?.[day] || 'NONE') === 'FULL')
      return {
        ...entry,
        days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: alreadyFull ? 'NONE' : 'FULL' }), {}),
      }
    })
  }

  function cycleAccountingEditorDay(week, day) {
    if (!accountingEditStudent) {
      return
    }
    const selectedCampType = accountingEditStudent.schedule?.[week.id]?.campType || ''
    if (!selectedCampType) {
      setErrorMessage('Select General or Boot Camp for this week first.')
      return
    }
    setAccountingEditorStudentWeek(week, (entry) => {
      const currentMode = entry.days?.[day] || 'NONE'
      return {
        ...entry,
        days: {
          ...entry.days,
          [day]: accountingEditorNextMode[currentMode],
        },
      }
    })
  }

  function toggleAccountingEditorLunch(weekId, dayKey) {
    if (!accountingEditStudent || isIncludedLunchDay(dayKey)) {
      return
    }
    const lunchKey = `${weekId}:${dayKey}`
    setAccountingEditState((current) => {
      if (!current.registration || !current.row) {
        return current
      }
      const studentIndex = Number(current.row.camperIndex || 0)
      const students = Array.isArray(current.registration.students) ? current.registration.students : []
      const student = students[studentIndex]
      if (!student) {
        return current
      }
      const nextStudents = students.map((item, index) =>
        index === studentIndex
          ? {
              ...item,
              lunch: {
                ...(item.lunch || {}),
                [lunchKey]: !item.lunch?.[lunchKey],
              },
            }
          : item
      )
      return {
        ...current,
        registration: {
          ...current.registration,
          students: nextStudents,
        },
      }
    })
  }

  async function saveAccountingEditor() {
    if (!accountingEditState.open || !accountingEditState.registration || !accountingEditState.row) {
      return
    }
    const key = `${accountingEditState.row.registrationId}-${accountingEditState.row.camperIndex}`
    setUpdatingAccountingKey(key)
    setSavedMessage('')
    setErrorMessage('')

    const sourceRecord = registrationRecords.find((item) => Number(item.id) === Number(accountingEditState.sourceRecordId))
    if (!sourceRecord) {
      setErrorMessage('Registration row not found.')
      setUpdatingAccountingKey('')
      return
    }

    const rawMeta = parseMaybeJson(sourceRecord.medical_notes, {}) || {}
    const response = await supabase
      .from('registrations')
      .update({
        medical_notes: JSON.stringify({
          ...rawMeta,
          registration: accountingEditState.registration,
        }),
      })
      .eq('id', sourceRecord.id)

    if (response.error) {
      setErrorMessage(`Registration edit failed: ${response.error.message}`)
      setUpdatingAccountingKey('')
      return
    }

    setRegistrationRecords((current) =>
      current.map((item) =>
        Number(item.id) === Number(sourceRecord.id)
          ? {
              ...item,
              medical_notes: JSON.stringify({
                ...rawMeta,
                registration: accountingEditState.registration,
              }),
            }
          : item
      )
    )
    setAccountingEditState({
      open: false,
      row: null,
      sourceRecordId: 0,
      registration: null,
      expandedWeekKey: '',
      expandedLunchWeekKey: '',
    })
    setSavedMessage('Registration selections updated.')
    setUpdatingAccountingKey('')
  }

  async function sendAccountingInvoice(row, options = {}) {
    const toEmail = String(row.parentEmail || '').trim()
    if (!/\S+@\S+\.\S+/.test(toEmail)) {
      setErrorMessage('Parent email is required to send invoice.')
      return
    }
    const key = `${row.registrationId}-${row.camperIndex}`
    setSendingInvoiceKey(key)
    setSavedMessage('')
    setErrorMessage('')

    let summaryDocument = null
    try {
      summaryDocument = options.summaryDocument || buildAccountingSummaryDocumentForRow(row)
    } catch (error) {
      setErrorMessage(error?.message || 'Registration summary payload not found for this row.')
      setSendingInvoiceKey('')
      return
    }
    const ccEmails = options.sendAdminCopy ? [ACCOUNTING_ADMIN_COPY_EMAIL] : []

    const response = await fetch('/api/email/accounting-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail,
        ccEmails,
        parentName: row.parentName,
        camperName: row.camperName,
        paymentMethod: row.paymentMethod,
        summaryHtml: summaryDocument.html,
        summaryText: summaryDocument.plainText,
        pdfBase64: summaryDocument.pdfBase64,
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setErrorMessage(result?.error || 'Invoice send failed.')
      setSendingInvoiceKey('')
      return
    }
    setSavedMessage(
      result?.previewOnly
        ? 'Invoice preview generated. Configure SES to send live.'
        : `Invoice sent to ${toEmail}${ccEmails.length > 0 ? ` with a copy to ${ccEmails.join(', ')}` : ''}.`
    )
    setSendingInvoiceKey('')
    setInvoiceSendDialog({ open: false, row: null, sendAdminCopy: true })
  }

  function buildRosterExportSections(programKeys = [], selectedWeekKeySet = null) {
    return programKeys
      .map((programKey) => rosterSummary.byProgram[programKey])
      .filter(Boolean)
      .map((section) => ({
        title: section.exportTitle,
        summary: `${section.totalCampers} registered camper${section.totalCampers === 1 ? '' : 's'} across ${section.activeWeeks} active week${section.activeWeeks === 1 ? '' : 's'}`,
        accentColor: section.accentColor,
        groups: section.groups
          .filter((group) => {
            if (group.rows.length === 0) return false
            if (!selectedWeekKeySet || selectedWeekKeySet.size === 0) return true
            return selectedWeekKeySet.has(`${section.key}:${group.week?.id || ''}`)
          })
          .map((group) => ({
            title: group.week ? formatWeekLabel(group.week) : 'Unmapped week',
            subtitle: `${group.rows.length} registered camper${group.rows.length === 1 ? '' : 's'}`,
            rows: group.rows.map((row) => ({
              camperName: `${row.camperName} | ${row.camperDob}`,
              parentName: `${row.parentName} | ${row.email} | ${row.phone}`,
              location: `${row.location} | ${row.activitySummary}`,
              selectionSummary: `${row.selectionSummary} | ${row.balanceSummary} | ${row.accountingSummary}`,
              paymentMethod: `${row.paymentMethod} | ${row.balanceSummary}`,
              email: row.healthSummary,
            })),
          })),
      }))
      .filter((section) => section.groups.length > 0)
  }

  function exportRosterPdf(scope = {}) {
    const mode = scope.mode || 'program'
    const scopeKey = scope.scopeKey || ''
    const programKey = scope.programKey || ''
    const weekId = scope.weekId || ''
    const selectedWeekKeySet =
      mode === 'selected' ? new Set(selectedRosterWeekKeys) : mode === 'week' && programKey && weekId ? new Set([`${programKey}:${weekId}`]) : null
    const programKeys =
      mode === 'merged' || mode === 'selected'
        ? Object.keys(rosterProgramMeta)
        : [programKey || scopeKey].filter(Boolean)
    const sections = buildRosterExportSections(programKeys, selectedWeekKeySet)
    if (sections.length === 0) {
      setErrorMessage('No roster sections are available to export yet.')
      return
    }

    const exportKey =
      mode === 'week'
        ? `week:${programKey}:${weekId}`
        : mode === 'selected'
          ? 'selected'
          : mode === 'merged'
            ? 'merged'
            : programKey || scopeKey
    setExportingRosterKey(exportKey)
    setSavedMessage('')
    setErrorMessage('')

    try {
      const title = mode === 'merged'
        ? 'Merged Camp Roster'
        : mode === 'selected'
          ? 'Selected Camp Roster'
          : mode === 'week'
            ? `${rosterSummary.byProgram[programKey]?.title || 'Camp'} ${formatWeekLabel(weekById[weekId] || { start: '', end: '' })} Roster`
            : rosterSummary.byProgram[programKey || scopeKey]?.exportTitle || 'Camp Roster'
      const pdfBase64 = buildRosterSummaryPdfBase64({
        title,
        subtitle: 'All registered campers with balances',
        generatedAtLabel: new Date().toLocaleString(),
        sections,
      })
      const dateLabel = new Date().toISOString().slice(0, 10)
      downloadPdfBase64(
        `${normalizeRosterFilenamePart(title)}-${dateLabel}.pdf`,
        pdfBase64
      )
      setSavedMessage(`${title} PDF exported.`)
    } catch (error) {
      setErrorMessage(error?.message || 'Roster PDF export failed.')
    }

    setExportingRosterKey('')
  }

  function toggleRosterWeekSelection(programKey, weekId) {
    const key = `${programKey}:${weekId}`
    setSelectedRosterWeekKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    )
  }

  function toggleRosterWeekExpanded(programKey, weekId) {
    const key = `${programKey}:${weekId}`
    setExpandedRosterWeekKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    )
  }

  function collapseAllRosterWeeks() {
    setExpandedRosterWeekKeys([])
  }

  function renderRosterProgramCard(programKey) {
    const section = rosterSummary.byProgram[programKey]
    if (!section) {
      return null
    }
    const normalizedSearch = rosterSearchTerm.trim().toLowerCase()
    const visibleGroups = section.groups
      .map((group) => ({
        ...group,
        rows:
          normalizedSearch.length === 0
            ? group.rows
            : group.rows.filter((row) => {
                const haystack = [
                  row.camperName,
                  row.parentName,
                  row.email,
                  row.phone,
                ]
                  .join(' ')
                  .toLowerCase()
                return haystack.includes(normalizedSearch)
              }),
      }))
      .filter((group) => group.rows.length > 0)

    return (
      <article key={`roster-program-${programKey}`} className={`rosterProgramCard ${programKey}`}>
        <div className="rosterProgramCardHeader">
          <div>
            <h3>{section.title}</h3>
            <p className="subhead">
              {section.totalCampers} registered camper{section.totalCampers === 1 ? '' : 's'} across {section.activeWeeks} active week{section.activeWeeks === 1 ? '' : 's'}.
            </p>
          </div>
          <button
            type="button"
            className="button secondary"
            onClick={() => exportRosterPdf({ mode: 'program', programKey })}
            disabled={exportingRosterKey === programKey}
          >
            {exportingRosterKey === programKey ? 'Exporting...' : `Export ${section.title}`}
          </button>
        </div>
        {visibleGroups.length === 0 ? (
          <div className="rosterProgramEmpty">
            <p className="subhead">{section.emptyText}</p>
          </div>
        ) : (
        <div className="rosterWeekGrid">
          {visibleGroups.map((group) => (
            <article key={`roster-week-${programKey}-${group.week?.id || 'unknown'}`} className="rosterWeekCard">
              <div className="rosterWeekCardHeader">
                <button
                  type="button"
                  className={`rosterWeekToggle ${expandedRosterWeekKeys.includes(`${programKey}:${group.week?.id || ''}`) || normalizedSearch ? 'expanded' : ''}`}
                  onClick={() => toggleRosterWeekExpanded(programKey, group.week?.id || '')}
                >
                  <strong>{group.week ? formatWeekLabel(group.week) : 'Unmapped week'}</strong>
                  <span>
                    {group.rows.length} camper{group.rows.length === 1 ? '' : 's'}
                  </span>
                </button>
                <div className="rosterWeekActions">
                  <label className="rosterSelectToggle">
                    <input
                      type="checkbox"
                      checked={selectedRosterWeekKeys.includes(`${programKey}:${group.week?.id || ''}`)}
                      onChange={() => toggleRosterWeekSelection(programKey, group.week?.id || '')}
                    />
                    <span>Select</span>
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => exportRosterPdf({ mode: 'week', programKey, weekId: group.week?.id || '' })}
                    disabled={exportingRosterKey === `week:${programKey}:${group.week?.id || ''}`}
                  >
                    {exportingRosterKey === `week:${programKey}:${group.week?.id || ''}` ? 'Exporting...' : `Export ${section.title}`}
                  </button>
                </div>
              </div>
              {expandedRosterWeekKeys.includes(`${programKey}:${group.week?.id || ''}`) || normalizedSearch ? (
                <div className="rosterTable">
                  <div className="rosterTableHead">
                    <span>Camper</span>
                    <span>Parent</span>
                    <span>Selection</span>
                    <span>Accounting / Health</span>
                  </div>
                  <div className="rosterTableBody">
                    {group.rows.map((row) => (
                      <div key={row.key} className="rosterTableRow">
                        <span>
                          <strong>{row.camperName}</strong>
                          <small>{row.camperDob}</small>
                        </span>
                        <span>
                          {row.parentName}
                          <small>{row.email}</small>
                          <small>{row.phone}</small>
                        </span>
                        <span>
                          {row.selectionSummary}
                          <small>{row.location}</small>
                          <small>{row.activitySummary}</small>
                        </span>
                        <span>
                          {row.accountingSummary}
                          <small>{row.balanceSummary}</small>
                          <small>{row.paymentMethod}</small>
                          <small>{row.healthSummary}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        )}
      </article>
    )
  }

  async function generateAiReplyDraft() {
    if (!aiReplyInput.message.trim()) {
      setErrorMessage('Paste an inbound email message first.')
      return
    }
    setAiReplyLoading(true)
    setErrorMessage('')

    const response = await fetch('/api/email/draft-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiReplyInput),
    })
    const result = await response.json()
    if (!response.ok) {
      setErrorMessage(result?.error || 'Failed to generate AI reply.')
      setAiReplyLoading(false)
      return
    }

    setAiReplyDraft(result?.draft || '')

    if (selectedReplyId && supabaseEnabled && supabase) {
      await supabase
        .from('email_replies')
        .update({
          ai_status: 'drafted',
          ai_draft: result?.draft || '',
          ai_generated_at: new Date().toISOString(),
          ai_error: null,
        })
        .eq('id', selectedReplyId)
      refreshEmailTracking()
    }
    setAiReplyLoading(false)
  }

  function selectReplyForAssistant(reply) {
    setSelectedReplyId(reply.id)
    setAiReplyInput((current) => ({
      ...current,
      customerName: '',
      subject: reply.subject || '',
      message: reply.body_text || '',
    }))
    setAiReplyDraft(reply.ai_draft || '')
  }

  async function markReplyHandled() {
    if (!selectedReplyId || !supabaseEnabled || !supabase) {
      return
    }
    await supabase
      .from('email_replies')
      .update({
        is_unread: false,
        ai_status: 'closed',
      })
      .eq('id', selectedReplyId)
    setSavedMessage('Reply marked as handled.')
    refreshEmailTracking()
  }

  function updateSurveyStepImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        surveyStepImageUrls: Array.from({ length: 6 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.surveyStepImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateRegistrationStepImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        registrationStepImageUrls: Array.from({ length: 4 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.registrationStepImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateFacilityImage(locationKey, index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        [locationKey]: Array.from({ length: 6 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media?.[locationKey]?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateOvernightLandingImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        overnightLandingImageUrls: Array.from({
          length: Math.max(
            overnightLandingSlots.length,
            Array.isArray(current.media.overnightLandingImageUrls)
              ? current.media.overnightLandingImageUrls.length
              : 0,
            index + 1
          ),
        }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.overnightLandingImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateOvernightRegistrationImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        overnightRegistrationImageUrls: Array.from({ length: 3 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.overnightRegistrationImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function appendOvernightLandingImages(urls = []) {
    const normalizedUrls = urls.map((item) => String(item || '').trim()).filter(Boolean)
    if (normalizedUrls.length === 0) {
      return
    }
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        overnightGalleryImageUrls: [
          ...(Array.isArray(current.media.overnightGalleryImageUrls)
            ? current.media.overnightGalleryImageUrls.filter(Boolean)
            : []),
          ...normalizedUrls,
        ],
      },
    }))
  }

  function toggleOvernightGalleryLibrarySelection(url) {
    const normalizedUrl = String(url || '').trim()
    if (!normalizedUrl) {
      return
    }
    setSelectedOvernightGalleryLibraryUrls((current) =>
      current.includes(normalizedUrl)
        ? current.filter((item) => item !== normalizedUrl)
        : [...current, normalizedUrl]
    )
  }

  function closeOvernightGalleryLibraryPicker() {
    setOpenOvernightLandingLibraryPicker(null)
    setSelectedOvernightGalleryLibraryUrls([])
  }

  function addSelectedOvernightGalleryLibraryImages() {
    if (selectedOvernightGalleryLibraryUrls.length === 0) {
      return
    }
    appendOvernightLandingImages(selectedOvernightGalleryLibraryUrls)
    setSelectedOvernightGalleryLibraryUrls([])
    setOpenOvernightLandingLibraryPicker(null)
  }

  function updateOvernightGalleryImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        overnightGalleryImageUrls: Array.from({
          length: Math.max(
            Array.isArray(current.media.overnightGalleryImageUrls)
              ? current.media.overnightGalleryImageUrls.length
              : 0,
            index + 1
          ),
        }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.overnightGalleryImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function removeOvernightGalleryImage(index) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        overnightGalleryImageUrls: (Array.isArray(current.media.overnightGalleryImageUrls)
          ? current.media.overnightGalleryImageUrls
          : []
        ).filter((_, imageIndex) => imageIndex !== index),
      },
    }))
    setOpenOvernightLandingLibraryPicker((current) => (current === index ? null : current))
  }

  function updateLevelUpScreenshotSlot(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        levelUpScreenshotUrls: Array.from({ length: levelUpScreenshotCaptions.length }).map(
          (_, imageIndex) =>
            imageIndex === index ? value : current.media.levelUpScreenshotUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateLevelUpScreenshotPosition(index, axis, value) {
    const numeric = Number(value)
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        levelUpScreenshotPositions: Array.from({ length: levelUpScreenshotCaptions.length }).map(
          (_, itemIndex) => {
            const existing = current.media.levelUpScreenshotPositions?.[itemIndex] || {
              x: 0,
              y: 0,
              zoom: 100,
            }
            if (itemIndex !== index) {
              return existing
            }
            if (axis === 'zoom') {
              return {
                ...existing,
                zoom: Number.isFinite(numeric) ? Math.max(80, Math.min(140, numeric)) : 100,
              }
            }
            return {
              ...existing,
              [axis]: Number.isFinite(numeric) ? Math.max(-50, Math.min(50, numeric)) : 0,
            }
          }
        ),
      },
    }))
  }

  function getLevelUpScreenshotStyle(index) {
    const pos = config.media.levelUpScreenshotPositions?.[index] || { x: 0, y: 0, zoom: 100 }
    return {
      objectPosition: `${50 + Number(pos.x || 0)}% ${50 + Number(pos.y || 0)}%`,
      transform: `scale(${Number(pos.zoom || 100) / 100})`,
      transformOrigin: 'center center',
    }
  }

  function assignLevelUpScreenshotFromLibrary(index, url) {
    updateLevelUpScreenshotSlot(index, url)
    setOpenLevelUpScreenshotLibraryPicker(null)
  }

  function assignSurveyStepImageFromLibrary(index, url) {
    updateSurveyStepImage(index, url)
    setOpenStepLibraryPicker(null)
  }

  function assignRegistrationStepImageFromLibrary(index, url) {
    updateRegistrationStepImage(index, url)
    setOpenRegistrationStepLibraryPicker(null)
  }

  function assignFacilityImageFromLibrary(locationKey, index, url) {
    updateFacilityImage(locationKey, index, url)
    setOpenFacilityLibraryPicker(null)
  }

  function assignOvernightLandingImageFromLibrary(index, url) {
    updateOvernightLandingImage(index, url)
    closeOvernightGalleryLibraryPicker()
  }

  function assignCampTypeShowcaseImageFromLibrary(campKey, index, url) {
    updateCampTypeMedia(campKey, index, 'url', url)
    setOpenCampTypeShowcaseLibraryPicker(null)
  }

  function assignOvernightRegistrationImageFromGallery(index, url) {
    updateOvernightRegistrationImage(index, url)
    setOpenOvernightRegistrationLibraryPicker(null)
  }

  async function uploadRegistrationStepImage(index, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateRegistrationStepImage(index, first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadOvernightLandingImage(index, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateOvernightLandingImage(index, first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadOvernightGalleryImages(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    appendOvernightLandingImages(uploaded.map((item) => item.publicUrl))
    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadFacilityImage(locationKey, index, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateFacilityImage(locationKey, index, first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  function updateSurveyStepImagePosition(index, axis, value) {
    const numeric = Number(value)
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        surveyStepImagePositions: current.media.surveyStepImagePositions.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [axis]: Number.isFinite(numeric) ? Math.max(-50, Math.min(50, numeric)) : 0,
              }
            : item
        ),
      },
    }))
  }

  function getSurveyImageStyle(index) {
    const pos = config.media.surveyStepImagePositions[index] || { x: 0, y: 0 }
    return {
      objectPosition: `${50 + Number(pos.x || 0)}% ${50 + Number(pos.y || 0)}%`,
    }
  }

  function getLandingCarouselSlotUrl(slot) {
    if (slot === 1) {
      return (config.media.heroImageUrl || '').trim()
    }
    if (slot === 2) {
      return (config.media.surveyStepImageUrls?.[0] || '').trim()
    }
    if (slot === 3) {
      return (config.media.surveyStepImageUrls?.[1] || '').trim()
    }
    if (slot === 4) {
      return (config.media.surveyStepImageUrls?.[2] || '').trim()
    }
    return ''
  }

  function updateLandingCarouselSlotUrl(slot, value) {
    const safeValue = String(value || '')
    if (slot === 1) {
      updateMedia('heroImageUrl', safeValue)
      return
    }
    if (slot >= 2 && slot <= 4) {
      updateSurveyStepImage(slot - 2, safeValue)
    }
  }

  function updateCampTypeShowcaseField(campKey, field, value) {
    setConfig((current) => ({
      ...current,
      campTypeShowcase: {
        ...current.campTypeShowcase,
        [campKey]: {
          ...current.campTypeShowcase[campKey],
          [field]: value,
        },
      },
    }))
  }

  function updateCampTypeHighlights(campKey, value) {
    const nextHighlights = String(value || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)
    updateCampTypeShowcaseField(campKey, 'highlights', nextHighlights)
  }

  function updateCampTypeMedia(campKey, index, field, value) {
    setConfig((current) => ({
      ...current,
      campTypeShowcase: {
        ...current.campTypeShowcase,
        [campKey]: {
          ...current.campTypeShowcase[campKey],
          media: Array.from({ length: 3 }).map((_, itemIndex) => {
            const existing = current.campTypeShowcase?.[campKey]?.media?.[itemIndex] || { url: '', caption: '', tone: 'general' }
            return itemIndex === index ? { ...existing, [field]: value } : existing
          }),
        },
      },
    }))
  }

  async function uploadCampTypeShowcaseImage(campKey, index, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateCampTypeMedia(campKey, index, 'url', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadLandingCarouselSlotImage(slot, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')
    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      event.target.value = ''
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateLandingCarouselSlotUrl(slot, first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  function assignLandingCarouselSlotImageFromLibrary(slot, url) {
    updateLandingCarouselSlotUrl(slot, url)
    setOpenLandingCarouselLibraryPicker(null)
  }

  function updateLandingCarouselImagePosition(index, axis, value) {
    const numeric = Number(value)
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        landingCarouselImagePositions: Array.from({ length: 4 }).map((_, itemIndex) => {
          const existing = current.media.landingCarouselImagePositions?.[itemIndex] || {
            x: 0,
            y: 0,
            zoom: 100,
          }
          if (itemIndex !== index) {
            return existing
          }

          if (axis === 'zoom') {
            return {
              ...existing,
              zoom: Number.isFinite(numeric) ? Math.max(80, Math.min(140, numeric)) : 100,
            }
          }

          return {
            ...existing,
            [axis]: Number.isFinite(numeric) ? Math.max(-50, Math.min(50, numeric)) : 0,
          }
        }),
      },
    }))
  }

  function getLandingCarouselImageStyle(index) {
    const pos = config.media.landingCarouselImagePositions?.[index] || { x: 0, y: 0, zoom: 100 }
    return {
      objectPosition: `${50 + Number(pos.x || 0)}% ${50 + Number(pos.y || 0)}%`,
      transform: `scale(${Number(pos.zoom || 100) / 100})`,
      transformOrigin: 'center center',
    }
  }

  function updateTuition(group, field, value) {
    setConfig((current) => ({
      ...current,
      tuition: {
        ...current.tuition,
        [group]: {
          ...current.tuition[group],
          [field]: value === '' ? '' : Number(value),
        },
      },
    }))
  }

  function updateBootcampTuition(group, field, value) {
    setConfig((current) => ({
      ...current,
      tuition: {
        ...current.tuition,
        bootcamp: {
          ...current.tuition.bootcamp,
          [group]: {
            ...current.tuition.bootcamp[group],
            [field]: value === '' ? '' : Number(value),
          },
        },
      },
    }))
  }

  function updateTuitionField(field, value) {
    setConfig((current) => ({
      ...current,
      tuition: {
        ...current.tuition,
        [field]:
          field === 'lunchPrice' || field === 'siblingDiscountPct'
            ? value === ''
              ? ''
              : Math.max(0, Number(value) || 0)
            : value,
      },
    }))
  }

  function addScreenshotUrl(url) {
    if (!url) {
      return
    }

    setConfig((current) => {
      const next = current.media.levelUpScreenshotUrls.includes(url)
        ? current.media.levelUpScreenshotUrls
        : [...current.media.levelUpScreenshotUrls, url]

      return {
        ...current,
        media: {
          ...current.media,
          levelUpScreenshotUrls: next,
          levelUpImageUrl: next[0] || '',
        },
      }
    })
  }

  function removeScreenshotUrl(url) {
    setConfig((current) => {
      const next = current.media.levelUpScreenshotUrls.filter((item) => item !== url)
      return {
        ...current,
        media: {
          ...current.media,
          levelUpScreenshotUrls: next,
          levelUpImageUrl: next[0] || '',
        },
      }
    })
  }

  async function uploadScreenshots(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    for (const item of uploaded) {
      addScreenshotUrl(item.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadWeChatQr(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('wechatQrUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadWelcomeLogo(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('welcomeLogoUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadSurveyFlyer(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('surveyStep1FlyerUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadSurveyMobileBg(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('surveyMobileBgUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadToLibrary(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  function updateProgramDate(programKey, field, value) {
    setConfig((current) => {
      const next = {
        ...current,
        programs: {
          ...current.programs,
          [programKey]: {
            ...current.programs[programKey],
            [field]: value,
          },
        },
      }

      return {
        ...next,
        programs: {
          ...next.programs,
          [programKey]: filterSelectedWeeksByDateWindow(next, programKey),
        },
      }
    })
  }

  function toggleWeek(programKey, weekId, field = 'selectedWeeks') {
    setConfig((current) => {
      const existing = new Set(current.programs[programKey][field] || [])
      if (existing.has(weekId)) {
        existing.delete(weekId)
      } else {
        existing.add(weekId)
      }

      return {
        ...current,
        programs: {
          ...current.programs,
          [programKey]: {
            ...current.programs[programKey],
            [field]: Array.from(existing),
          },
        },
      }
    })
  }

  function selectAllWeeks(programKey, field = 'selectedWeeks') {
    setConfig((current) => ({
      ...current,
      programs: {
        ...current.programs,
        [programKey]: {
          ...current.programs[programKey],
          [field]: weekOptions[programKey].map((option) => option.id),
        },
      },
    }))
  }

  function clearWeeks(programKey, field = 'selectedWeeks') {
    setConfig((current) => ({
      ...current,
      programs: {
        ...current.programs,
        [programKey]: {
          ...current.programs[programKey],
          [field]: [],
        },
      },
    }))
  }

  function renderBucketImagePicker(fieldLabel, selectedUrl, onPick) {
    if (imageLibrary.length === 0) {
      return <p className="subhead">No bucket images yet.</p>
    }

    return (
      <div className="inlineMediaPicker">
        <p className="subhead">{fieldLabel}: choose from bucket previews</p>
        <div className="inlineMediaPickerGrid">
          {imageLibrary.map((item) => (
            <button
              key={`inline-${fieldLabel}-${item.path}`}
              type="button"
              className={`inlineMediaPickerItem ${selectedUrl === item.publicUrl ? 'selected' : ''}`}
              onClick={() => onPick(item.publicUrl)}
            >
              <img
                src={getResizedPreviewUrl(item.publicUrl, 240, 140)}
                alt={item.name}
                loading="lazy"
                decoding="async"
              />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  async function saveChanges() {
    if (saving) {
      return
    }
    setSaving(true)
    setSavedMessage('')
    setErrorMessage('')

    const error = await saveAdminConfigToSupabase(config)
    if (error) {
      setErrorMessage(`Save failed: ${error.message}`)
      setSaving(false)
      return
    }

    setSavedMessage(`Saved ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`)
    setSaving(false)
  }

  async function signOut() {
    if (!supabaseEnabled || !supabase) {
      return
    }

    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <main className="page adminPage">
        <section className="card section">
          <p className="subhead">Loading admin settings...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="page adminPage">
      <section className="card section">
        <p className="eyebrow">Admin Console</p>
        <h1>Camp settings manager</h1>
        <p className="subhead">
          Control media and camp date schedules. Weeks are generated automatically from each date range.
        </p>
        {adminEmail ? <p className="subhead">Signed in as {adminEmail}</p> : null}
        {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
      </section>

      <section className="card section">
        <div className="adminTopTabs" role="tablist" aria-label="Admin sections">
          {adminTabBlueprint.map((tab) => {
            const count = tabEmptyCounts[tab.id] || 0
            const active = activeAdminTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`adminTopTabBtn ${active ? 'active' : ''}`}
                onClick={() => setActiveAdminTab(tab.id)}
              >
                <span>{tab.label}</span>
                {count > 0 ? (
                  <span className="adminTabIssueWrap">
                    <span className="adminTabIssueDot" aria-hidden="true" />
                    <span className="adminTabIssueBadge">{count}</span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>

      {activeAdminTab === 'media' ? (
      <section className="card section">
        <h2>Media</h2>
        <p className="subhead">Bucket: <code>{getMediaBucketName()}</code></p>
        <div className="adminSubTabs" role="tablist" aria-label="Media sections">
          {mediaSubtabBlueprint.map((tab) => {
            const active = activeMediaSubtab === tab.id
            return (
              <button
                key={`media-subtab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                className={`adminSubTabBtn ${active ? 'active' : ''}`}
                onClick={() => setActiveMediaSubtab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeMediaSubtab === 'overview' ? (
        <div className="adminGrid">
          <label>
            Welcome logo URL
            <input
              type="url"
              value={config.media.welcomeLogoUrl}
              onChange={(event) => updateMedia('welcomeLogoUrl', event.target.value)}
              placeholder="https://..."
            />
            {renderBucketImagePicker('Welcome logo', config.media.welcomeLogoUrl, (value) =>
              updateMedia('welcomeLogoUrl', value)
            )}
          </label>

          <label>
            Upload welcome logo
            <input type="file" accept="image/*" onChange={uploadWelcomeLogo} />
          </label>

          <label>
            Hero image URL
            <input
              type="url"
              value={config.media.heroImageUrl}
              onChange={(event) => updateMedia('heroImageUrl', event.target.value)}
              placeholder="https://..."
            />
            {renderBucketImagePicker('Hero image', config.media.heroImageUrl, (value) =>
              updateMedia('heroImageUrl', value)
            )}
          </label>

          <label>
            Survey video URL
            <input
              type="url"
              value={config.media.surveyVideoUrl}
              onChange={(event) => updateMedia('surveyVideoUrl', event.target.value)}
              placeholder="https://..."
            />
            <small>Video is URL-only (YouTube or direct video link).</small>
          </label>

          <label>
            Survey Step 1 flyer URL
            <input
              type="url"
              value={config.media.surveyStep1FlyerUrl}
              onChange={(event) => updateMedia('surveyStep1FlyerUrl', event.target.value)}
              placeholder="https://..."
            />
            {renderBucketImagePicker('Step 1 flyer', config.media.surveyStep1FlyerUrl, (value) =>
              updateMedia('surveyStep1FlyerUrl', value)
            )}
          </label>

          <label>
            Upload Step 1 flyer
            <input type="file" accept="image/*" onChange={uploadSurveyFlyer} />
          </label>

          <label>
            Survey mobile background URL
            <input
              type="url"
              value={config.media.surveyMobileBgUrl}
              onChange={(event) => updateMedia('surveyMobileBgUrl', event.target.value)}
              placeholder="https://..."
            />
            {renderBucketImagePicker('Mobile background', config.media.surveyMobileBgUrl, (value) =>
              updateMedia('surveyMobileBgUrl', value)
            )}
          </label>

          <label>
            Upload mobile survey background
            <input type="file" accept="image/*" onChange={uploadSurveyMobileBg} />
          </label>

          <label>
            Add phone screenshots (multiple)
            <input type="file" accept="image/*" multiple onChange={uploadScreenshots} />
          </label>

          <label>
            Upload WeChat QR
            <input type="file" accept="image/*" onChange={uploadWeChatQr} />
          </label>
        </div>
        ) : null}
        {activeMediaSubtab === 'overview' || activeMediaSubtab === 'carousel' ? (
        <>
        {config.media.welcomeLogoUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Current welcome logo preview</p>
            <img
              src={getResizedPreviewUrl(config.media.welcomeLogoUrl, 200, 200)}
              alt="Welcome logo preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {config.media.heroImageUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Desktop hero preview (shown above the two start choices)</p>
            <img
              src={getResizedPreviewUrl(config.media.heroImageUrl, 1280, 640)}
              alt="Desktop hero preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <section className="subCard">
          <h3>Landing page media map (what to edit)</h3>
          <p className="subhead">
            Each item below maps directly to a visible section on the main landing page.
          </p>
          <div className="journeyGrid">
            <article className="journeyCard">
              <p className="journeyDay">Welcome Header</p>
              <h4>Welcome logo</h4>
              <p>
                <strong>Field:</strong> Welcome logo URL
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {config.media.welcomeLogoUrl ? 'Assigned' : 'Missing'}
              </p>
            </article>
            <article className="journeyCard">
              <p className="journeyDay">Desktop Landing Top</p>
              <h4>Hero image above start choices</h4>
              <p>
                <strong>Field:</strong> Hero image URL
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {config.media.heroImageUrl ? 'Assigned' : 'Missing'}
              </p>
            </article>
            <article className="journeyCard">
              <p className="journeyDay">Landing Phone Carousel</p>
              <h4>Level Up screenshots</h4>
              <p>
                <strong>Slots:</strong>{' '}
                {
                  config.media.levelUpScreenshotUrls.filter((url) => url && url.trim().length > 0).length
                }{' '}
                / {levelUpScreenshotCaptions.length} assigned
              </p>
              <p>
                <strong>Edit area:</strong> Level Up screenshot slots
              </p>
            </article>
            <article className="journeyCard">
              <p className="journeyDay">Program Finder (Survey)</p>
              <h4>Survey step images</h4>
              <p>
                <strong>Slots:</strong>{' '}
                {
                  config.media.surveyStepImageUrls.filter((url) => url && url.trim().length > 0).length
                }{' '}
                / {surveyStepQuestions.length} assigned
              </p>
              <p>
                <strong>Edit area:</strong> Program Finder step images
              </p>
            </article>
            <article className="journeyCard">
              <p className="journeyDay">Registration Flow</p>
              <h4>Registration step visuals</h4>
              <p>
                <strong>Slots:</strong>{' '}
                {
                  (config.media.registrationStepImageUrls || []).filter(
                    (url) => url && url.trim().length > 0
                  ).length
                }{' '}
                / {registrationStepQuestions.length} assigned
              </p>
              <p>
                <strong>Edit area:</strong> Registration step images
              </p>
            </article>
            <article className="journeyCard">
              <p className="journeyDay">Overnight Landing</p>
              <h4>Overnight page visuals</h4>
              <p>
                <strong>Slots:</strong>{' '}
                {
                  (config.media.overnightLandingImageUrls || []).filter(
                    (url) => url && url.trim().length > 0
                  ).length
                }{' '}
                / {overnightLandingSlots.length} assigned
              </p>
              <p>
                <strong>Gallery:</strong> {(config.media.overnightGalleryImageUrls || []).filter((url) => url && url.trim().length > 0).length} images
              </p>
              <p>
                <strong>Edit area:</strong> Overnight landing page images
              </p>
            </article>
          </div>
        </section>
        <section className="subCard">
          <h3>Landing hero carousel slot guide</h3>
          <p className="subhead">
            Use this when selecting images so each carousel position matches the correct caption.
          </p>
          <div className="journeyGrid">
            {landingCarouselSlotGuide.map((item) => (
              <article key={`carousel-guide-${item.slot}`} className="journeyCard">
                <p className="journeyDay">Slot {item.slot}</p>
                <h4>{item.binding}</h4>
                <p>
                  <strong>Source:</strong> {item.sourceLabel}
                </p>
                <p>
                  <strong>Caption:</strong> {item.caption}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="subCard">
          <h3>Selected landing carousel photos</h3>
          <p className="subhead">
            This shows exactly what is currently used in the landing carousel on the main page. Use X/Y/Zoom to match the live viewport.
          </p>
          <div className="surveyStepAssetGrid">
            {landingCarouselSlotGuide.map((item) => {
              const slotUrl = getLandingCarouselSlotUrl(item.slot)
              const slotIndex = item.slot - 1
              const slotPos = config.media.landingCarouselImagePositions?.[slotIndex] || {
                x: 0,
                y: 0,
                zoom: 100,
              }
              return (
                <article key={`carousel-selected-${item.slot}`} className="surveyStepAssetCard">
                  <h4>Slot {item.slot}: {item.binding}</h4>
                  <div className="surveyContextFrame">
                    {slotUrl ? (
                      <img
                        src={getResizedPreviewUrl(slotUrl, 640, 360)}
                        alt={`Landing carousel slot ${item.slot}`}
                        style={getLandingCarouselImageStyle(slotIndex)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="surveyVisualPlaceholder">No image assigned</div>
                    )}
                  </div>
                  <p className="subhead">
                    <strong>Source:</strong> {item.sourceLabel}
                  </p>
                  <p className="subhead">
                    <strong>Caption:</strong> {item.caption}
                  </p>
                  <p className="subhead">
                    <strong>Current URL:</strong> {slotUrl || 'None'}
                  </p>
                  <label>
                    Image URL
                    <input
                      type="url"
                      value={slotUrl}
                      onChange={(event) => updateLandingCarouselSlotUrl(item.slot, event.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                  <div className="adminActions">
                    <label className="button secondary">
                      Upload from computer
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => uploadLandingCarouselSlotImage(item.slot, event)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() =>
                        setOpenLandingCarouselLibraryPicker((current) =>
                          current === item.slot ? null : item.slot
                        )
                      }
                    >
                      {openLandingCarouselLibraryPicker === item.slot
                        ? 'Close media library'
                        : 'Choose from media library'}
                    </button>
                  </div>
                  {openLandingCarouselLibraryPicker === item.slot ? (
                    <div className="surveyLibraryPickerGrid">
                      {imageLibrary.length === 0 ? (
                        <p className="subhead">No image files found in media library.</p>
                      ) : (
                        imageLibrary.map((libraryItem) => (
                          <button
                            key={`landing-carousel-${item.slot}-${libraryItem.path}`}
                            type="button"
                            className="surveyLibraryPickerItem"
                            onClick={() => assignLandingCarouselSlotImageFromLibrary(item.slot, libraryItem.publicUrl)}
                          >
                            <img
                              src={getResizedPreviewUrl(libraryItem.publicUrl, 260, 146)}
                              alt={libraryItem.name}
                              loading="lazy"
                              decoding="async"
                            />
                            <span>{libraryItem.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                  <div className="sliderRow">
                    <label>
                      X ({Math.round(slotPos.x || 0)})
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={slotPos.x || 0}
                        onChange={(event) =>
                          updateLandingCarouselImagePosition(slotIndex, 'x', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Y ({Math.round(slotPos.y || 0)})
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={slotPos.y || 0}
                        onChange={(event) =>
                          updateLandingCarouselImagePosition(slotIndex, 'y', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Zoom ({Math.round(slotPos.zoom || 100)}%)
                      <input
                        type="range"
                        min="80"
                        max="140"
                        value={slotPos.zoom || 100}
                        onChange={(event) =>
                          updateLandingCarouselImagePosition(slotIndex, 'zoom', event.target.value)
                        }
                      />
                    </label>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
        <section className="subCard">
          <h3>Camp type showcase editor</h3>
          <p className="subhead">
            Edit the copy and photo slots used in the "Choose Your Camp Type" section on the landing page.
          </p>
          <div className="surveyStepAssetGrid">
            {campTypeShowcaseAdminCards.map((camp) => {
              const entry = config.campTypeShowcase?.[camp.key] || defaultAdminConfig.campTypeShowcase[camp.key]
              return (
                <article key={`camp-type-showcase-admin-${camp.key}`} className="surveyStepAssetCard">
                  <h4>{camp.label}</h4>
                  <label>
                    Title
                    <input
                      type="text"
                      value={entry.title || ''}
                      onChange={(event) => updateCampTypeShowcaseField(camp.key, 'title', event.target.value)}
                    />
                  </label>
                  <label>
                    Summary
                    <textarea
                      rows={3}
                      value={entry.summary || ''}
                      onChange={(event) => updateCampTypeShowcaseField(camp.key, 'summary', event.target.value)}
                    />
                  </label>
                  <label>
                    Best fit text
                    <textarea
                      rows={3}
                      value={entry.suitedFor || ''}
                      onChange={(event) => updateCampTypeShowcaseField(camp.key, 'suitedFor', event.target.value)}
                    />
                  </label>
                  <label>
                    Highlights
                    <textarea
                      rows={5}
                      value={(entry.highlights || []).join('\n')}
                      onChange={(event) => updateCampTypeHighlights(camp.key, event.target.value)}
                      placeholder="One highlight per line"
                    />
                  </label>
                  <div className="surveyStepAssetGrid">
                    {(entry.media || []).map((item, index) => (
                      <article key={`camp-type-showcase-media-${camp.key}-${index}`} className="surveyStepAssetCard">
                        <h4>Photo Slot {index + 1}</h4>
                        <div className="surveyContextFrame">
                          {item.url ? (
                            <img
                              src={getResizedPreviewUrl(item.url, 640, 360)}
                              alt={`${camp.label} slot ${index + 1}`}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="surveyVisualPlaceholder">No photo assigned</div>
                          )}
                        </div>
                        <label>
                          Photo URL
                          <input
                            type="url"
                            value={item.url || ''}
                            onChange={(event) => updateCampTypeMedia(camp.key, index, 'url', event.target.value)}
                            placeholder="https://..."
                          />
                        </label>
                        <div className="adminActions">
                          <label className="button secondary">
                            Upload from computer
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => uploadCampTypeShowcaseImage(camp.key, index, event)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() =>
                              setOpenCampTypeShowcaseLibraryPicker((current) =>
                                current?.campKey === camp.key && current?.index === index ? null : { campKey: camp.key, index }
                              )
                            }
                          >
                            {openCampTypeShowcaseLibraryPicker?.campKey === camp.key && openCampTypeShowcaseLibraryPicker?.index === index
                              ? 'Close media library'
                              : 'Choose from media library'}
                          </button>
                        </div>
                        {openCampTypeShowcaseLibraryPicker?.campKey === camp.key && openCampTypeShowcaseLibraryPicker?.index === index ? (
                          <div className="surveyLibraryPickerGrid">
                            {imageLibrary.length === 0 ? (
                              <p className="subhead">No image files found in media library.</p>
                            ) : (
                              imageLibrary.map((libraryItem) => (
                                <button
                                  key={`camp-type-library-${camp.key}-${index}-${libraryItem.path}`}
                                  type="button"
                                  className="surveyLibraryPickerItem"
                                  onClick={() => assignCampTypeShowcaseImageFromLibrary(camp.key, index, libraryItem.publicUrl)}
                                >
                                  <img
                                    src={getResizedPreviewUrl(libraryItem.publicUrl, 260, 146)}
                                    alt={libraryItem.name}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  <span>{libraryItem.name}</span>
                                </button>
                              ))
                            )}
                          </div>
                        ) : null}
                        <label>
                          Caption
                          <textarea
                            rows={3}
                            value={item.caption || ''}
                            onChange={(event) => updateCampTypeMedia(camp.key, index, 'caption', event.target.value)}
                          />
                        </label>
                        <label>
                          Banner tone
                          <select
                            value={item.tone || 'general'}
                            onChange={(event) => updateCampTypeMedia(camp.key, index, 'tone', event.target.value)}
                          >
                            <option value="general">General</option>
                            <option value="bootcamp">Boot Camp</option>
                            <option value="overnight">Overnight</option>
                            <option value="lunch">Lunch</option>
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
        {config.media.surveyVideoUrl ? (
          <div className="adminSurveyVideoPreview">
            <p className="subhead">Current survey video preview</p>
            {getYouTubeEmbedUrl(config.media.surveyVideoUrl) ? (
              <iframe
                src={getYouTubeEmbedUrl(config.media.surveyVideoUrl)}
                title="Survey video preview"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video controls playsInline preload="metadata" src={config.media.surveyVideoUrl} />
            )}
          </div>
        ) : null}
        {config.media.surveyStep1FlyerUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Step 1 flyer preview</p>
            <img
              src={getResizedPreviewUrl(config.media.surveyStep1FlyerUrl, 640, 360)}
              alt="Survey Step 1 flyer preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {config.media.surveyMobileBgUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Survey mobile background preview</p>
            <img
              src={getResizedPreviewUrl(config.media.surveyMobileBgUrl, 640, 960)}
              alt="Survey mobile background preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        </>
        ) : null}

        {activeMediaSubtab === 'levelup' ? (
        <div className="adminGrid mediaControls">
          <label>
            Manual screenshot URL
            <input
              type="url"
              value={config.media.levelUpImageUrl}
              onChange={(event) => updateMedia('levelUpImageUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Screenshot size ({Math.round(config.media.levelUpScreenshotSize)}%)
            <input
              type="range"
              min="40"
              max="140"
              value={config.media.levelUpScreenshotSize}
              onChange={(event) =>
                updateMedia('levelUpScreenshotSize', Number(event.target.value))
              }
            />
          </label>

          <label>
            WeChat QR URL
            <input
              type="url"
              value={config.media.wechatQrUrl}
              onChange={(event) => updateMedia('wechatQrUrl', event.target.value)}
              placeholder="https://..."
            />
            {renderBucketImagePicker('WeChat QR', config.media.wechatQrUrl, (value) =>
              updateMedia('wechatQrUrl', value)
            )}
          </label>
        </div>
        ) : null}

        {activeMediaSubtab === 'levelup' ? (
        <div className="adminActions">
          <button
            type="button"
            className="button secondary"
            onClick={() => addScreenshotUrl(config.media.levelUpImageUrl)}
          >
            Add manual URL to phone list
          </button>
        </div>
        ) : null}
        {activeMediaSubtab === 'levelup' ? (
        <section className="subCard">
          <h3>Level Up live viewport</h3>
          <p className="subhead">Use this exact phone viewport while editing screenshot size, X, Y, and zoom.</p>
          {config.media.levelUpScreenshotUrls.length === 0 ? (
            <p className="subhead">No screenshots selected yet.</p>
          ) : (
            <>
              <div className="adminPhoneStage">
                <div className="phoneFrame adminPhoneFrame">
                  <div className="phoneNotch" />
                  <div className="phoneScreen">
                    <img
                      className="phoneImage"
                      src={getResizedPreviewUrl(activePreviewUrl, 520, 920)}
                      alt="Phone render preview"
                      style={{
                        width: `${config.media.levelUpScreenshotSize}%`,
                        ...getLevelUpScreenshotStyle(activePreviewIndex),
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
              <p className="subhead">Tap a screenshot to preview and adjust in this same viewport.</p>
              <div className="thumbGrid">
                {config.media.levelUpScreenshotUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}-live`}
                    className={`thumbItem ${activePreviewIndex === index ? 'selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="thumbPreviewBtn"
                      onClick={() => setActivePreviewIndex(index)}
                    >
                      <img
                        src={getResizedPreviewUrl(url, 280, 380)}
                        alt="Selected screenshot preview"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                    <p className="subhead">
                      <strong>Slot {index + 1}:</strong> {getLevelUpScreenshotCaption(index)}
                    </p>
                    <div className="thumbActions">
                      <button type="button" className="button secondary" onClick={() => removeScreenshotUrl(url)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        ) : null}

        {activeMediaSubtab === 'levelup' ? (
        <section className="subCard">
          <h3>Level Up screenshot slots (main landing page)</h3>
          <p className="subhead">
            Assign each slot by caption so the phone carousel shows the right screenshot with the
            right message.
          </p>
          <div className="surveyStepAssetGrid">
            {levelUpScreenshotCaptions.map((caption, index) => (
              <article key={`level-up-slot-${index}`} className="surveyStepAssetCard">
                <h4>Slot {index + 1}</h4>
                <p className="subhead">
                  <strong>Caption:</strong> {caption}
                </p>
                <div className="surveyContextFrame">
                  {config.media.levelUpScreenshotUrls?.[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.levelUpScreenshotUrls[index], 640, 360)}
                      alt={`Level Up screenshot slot ${index + 1}`}
                      style={getLevelUpScreenshotStyle(index)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No screenshot assigned</div>
                  )}
                </div>
                <label>
                  Screenshot URL
                  <input
                    type="url"
                    value={config.media.levelUpScreenshotUrls?.[index] || ''}
                    onChange={(event) => updateLevelUpScreenshotSlot(index, event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <div className="sliderRow">
                  <label>
                    X ({Math.round(config.media.levelUpScreenshotPositions?.[index]?.x || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.levelUpScreenshotPositions?.[index]?.x || 0}
                      onChange={(event) => updateLevelUpScreenshotPosition(index, 'x', event.target.value)}
                    />
                  </label>
                  <label>
                    Y ({Math.round(config.media.levelUpScreenshotPositions?.[index]?.y || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.levelUpScreenshotPositions?.[index]?.y || 0}
                      onChange={(event) => updateLevelUpScreenshotPosition(index, 'y', event.target.value)}
                    />
                  </label>
                  <label>
                    Zoom ({Math.round(config.media.levelUpScreenshotPositions?.[index]?.zoom || 100)}%)
                    <input
                      type="range"
                      min="80"
                      max="140"
                      value={config.media.levelUpScreenshotPositions?.[index]?.zoom || 100}
                      onChange={(event) => updateLevelUpScreenshotPosition(index, 'zoom', event.target.value)}
                    />
                  </label>
                </div>
                <div className="adminActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenLevelUpScreenshotLibraryPicker((current) =>
                        current === index ? null : index
                      )
                    }
                  >
                    {openLevelUpScreenshotLibraryPicker === index
                      ? 'Close media library'
                      : 'Choose from media library'}
                  </button>
                </div>
                {openLevelUpScreenshotLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {imageLibrary.length === 0 ? (
                      <p className="subhead">No image files found in media library.</p>
                    ) : (
                      imageLibrary.map((item) => (
                        <button
                          key={`level-up-slot-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignLevelUpScreenshotFromLibrary(index, item.publicUrl)}
                        >
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
        ) : null}

        {activeMediaSubtab === 'steps' ? (
        <>
        <section className="subCard">
          <h3>Program Finder step images</h3>
          <p className="subhead">Assign one image per survey step/question.</p>
          <div className="surveyStepAssetGrid">
            {surveyStepQuestions.map((questionLabel, index) => (
              <article key={questionLabel} className="surveyStepAssetCard">
                <h4>{questionLabel}</h4>
                <div className="surveyContextFrame">
                  {config.media.surveyStepImageUrls[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.surveyStepImageUrls[index], 640, 360)}
                      alt={`${questionLabel} preview`}
                      style={getSurveyImageStyle(index)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No image assigned</div>
                  )}
                </div>
                <label>
                  Image URL
                <input
                  type="url"
                  value={config.media.surveyStepImageUrls[index] || ''}
                  onChange={(event) => updateSurveyStepImage(index, event.target.value)}
                  placeholder="https://..."
                />
                </label>
                <div className="sliderRow">
                  <label>
                    X ({Math.round(config.media.surveyStepImagePositions[index]?.x || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.surveyStepImagePositions[index]?.x || 0}
                      onChange={(event) => updateSurveyStepImagePosition(index, 'x', event.target.value)}
                    />
                  </label>
                  <label>
                    Y ({Math.round(config.media.surveyStepImagePositions[index]?.y || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.surveyStepImagePositions[index]?.y || 0}
                      onChange={(event) => updateSurveyStepImagePosition(index, 'y', event.target.value)}
                    />
                  </label>
                </div>
                <div className="adminActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenStepLibraryPicker((current) => (current === index ? null : index))
                    }
                    disabled={imageLibrary.length === 0}
                  >
                    {openStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'}
                  </button>
                </div>
                {openStepLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {imageLibrary.length === 0 ? (
                      <p className="subhead">No image files found in media library.</p>
                    ) : (
                      imageLibrary.map((item) => (
                        <button
                          key={`step-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignSurveyStepImageFromLibrary(index, item.publicUrl)}
                        >
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="subCard">
          <h3>Registration step images</h3>
          <p className="subhead">Assign one visual per registration step card. You can upload from your computer or choose from bucket media.</p>
          <div className="surveyStepAssetGrid">
            {registrationStepQuestions.map((questionLabel, index) => (
              <article key={questionLabel} className="surveyStepAssetCard">
                <h4>{questionLabel}</h4>
                <div className="surveyContextFrame">
                  {config.media.registrationStepImageUrls?.[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.registrationStepImageUrls[index], 640, 360)}
                      alt={`${questionLabel} preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No image assigned</div>
                  )}
                </div>
                <label>
                  Image URL
                  <input
                    type="url"
                    value={config.media.registrationStepImageUrls?.[index] || ''}
                    onChange={(event) => updateRegistrationStepImage(index, event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <div className="adminActions">
                  <label className="button secondary">
                    Upload from computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadRegistrationStepImage(index, event)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenRegistrationStepLibraryPicker((current) => (current === index ? null : index))
                    }
                  >
                    {openRegistrationStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'}
                  </button>
                </div>
                {openRegistrationStepLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {imageLibrary.length === 0 ? (
                      <p className="subhead">No image files found in media library.</p>
                    ) : (
                      imageLibrary.map((item) => (
                        <button
                          key={`registration-step-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignRegistrationStepImageFromLibrary(index, item.publicUrl)}
                        >
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="subCard">
          <h3>Location facility photos</h3>
          <p className="subhead">
            These photo sets appear in registration step 1 based on the family&apos;s selected location. Families can open a small album to preview the facility before continuing.
          </p>
          {[
            {
              key: 'burlingtonFacilityImageUrls',
              label: 'Burlington facility photos',
              locationCode: 'burlington',
            },
            {
              key: 'actonFacilityImageUrls',
              label: 'Acton facility photos',
              locationCode: 'acton',
            },
            {
              key: 'wellesleyFacilityImageUrls',
              label: 'Wellesley facility photos',
              locationCode: 'wellesley',
            },
          ].map((group) => (
            <div key={group.key} className="subCard" style={{ marginTop: '1rem' }}>
              <h4>{group.label}</h4>
              <div className="surveyStepAssetGrid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article key={`${group.key}-${index}`} className="surveyStepAssetCard">
                    <h4>Photo {index + 1}</h4>
                    <div className="surveyContextFrame">
                      {config.media?.[group.key]?.[index] ? (
                        <img
                          src={getResizedPreviewUrl(config.media[group.key][index], 640, 360)}
                          alt={`${group.label} photo ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="surveyVisualPlaceholder">No image assigned</div>
                      )}
                    </div>
                    <label>
                      Image URL
                      <input
                        type="url"
                        value={config.media?.[group.key]?.[index] || ''}
                        onChange={(event) => updateFacilityImage(group.key, index, event.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                    <div className="adminActions">
                      <label className="button secondary">
                        Upload from computer
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => uploadFacilityImage(group.key, index, event)}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() =>
                          setOpenFacilityLibraryPicker((current) =>
                            current?.locationCode === group.locationCode && current?.index === index
                              ? null
                              : { locationCode: group.locationCode, index }
                          )
                        }
                      >
                        {openFacilityLibraryPicker?.locationCode === group.locationCode &&
                        openFacilityLibraryPicker?.index === index
                          ? 'Close media library'
                          : 'Choose from media library'}
                      </button>
                    </div>
                    {openFacilityLibraryPicker?.locationCode === group.locationCode &&
                    openFacilityLibraryPicker?.index === index ? (
                      <div className="surveyLibraryPickerGrid">
                        {imageLibrary.length === 0 ? (
                          <p className="subhead">No image files found in media library.</p>
                        ) : (
                          imageLibrary.map((item) => (
                            <button
                              key={`${group.key}-${index}-${item.path}`}
                              type="button"
                              className="surveyLibraryPickerItem"
                              onClick={() => assignFacilityImageFromLibrary(group.key, index, item.publicUrl)}
                            >
                              <img
                                src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                                alt={item.name}
                                loading="lazy"
                                decoding="async"
                              />
                              <span>{item.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="subCard">
          <h3>Location addresses</h3>
          <p className="subhead">
            Physical addresses for each camp location. Shown to families in the registration form, on the landing page, and in confirmation emails. Formatted for future Google Maps / geolocation use.
          </p>
          <div className="locationAddressGrid">
            {[
              { key: 'burlington', label: 'Burlington' },
              { key: 'acton', label: 'Acton' },
              { key: 'wellesley', label: 'Wellesley' },
            ].map((loc) => {
              const addr = config.locations?.[loc.key] || {}
              return (
                <div key={loc.key} className="locationAddressCard">
                  <p className="locationAddressCardLabel">{loc.label}</p>
                  <label className="locationAddressToggle">
                    <input
                      type="checkbox"
                      checked={addr.enabled !== false}
                      onChange={(e) => updateLocationAddress(loc.key, 'enabled', e.target.checked)}
                    />
                    <span>{addr.enabled !== false ? 'Show on public site' : 'Hidden from public site'}</span>
                  </label>
                  <label>
                    Street address
                    <input
                      type="text"
                      value={addr.street || ''}
                      onChange={(e) => updateLocationAddress(loc.key, 'street', e.target.value)}
                      placeholder="123 Main St"
                    />
                  </label>
                  <div className="locationAddressRow">
                    <label>
                      City
                      <input
                        type="text"
                        value={addr.city || ''}
                        onChange={(e) => updateLocationAddress(loc.key, 'city', e.target.value)}
                        placeholder="Burlington"
                      />
                    </label>
                    <label className="locationAddressStateField">
                      State
                      <input
                        type="text"
                        value={addr.state || 'MA'}
                        onChange={(e) => updateLocationAddress(loc.key, 'state', e.target.value)}
                        placeholder="MA"
                        maxLength={2}
                      />
                    </label>
                    <label>
                      ZIP
                      <input
                        type="text"
                        value={addr.zip || ''}
                        onChange={(e) => updateLocationAddress(loc.key, 'zip', e.target.value)}
                        placeholder="01803"
                        maxLength={10}
                      />
                    </label>
                  </div>
                  {addr.street && addr.city ? (
                    <p className="locationAddressPreview">
                      📍 {addr.street}, {addr.city}, {addr.state || 'MA'} {addr.zip}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="subCard">
          <h3>Overnight Top Carousel Slot Guide</h3>
          <p className="subhead">
            These 6 images control the overnight hero carousel and highlighted landing visuals on <code>/overnight</code>.
          </p>
          <div className="journeyGrid">
            {overnightLandingSlots.map((slot, index) => (
              <article key={`overnight-slot-guide-${slot.key}`} className="journeyCard">
                <p className="journeyDay">Slot {index + 1}</p>
                <h4>{slot.label}</h4>
                <p>
                  <strong>Caption:</strong> {slot.caption}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="subCard">
          <h3>Overnight landing page images</h3>
          <p className="subhead">Assign the 6 fixed visuals used in the overnight top carousel and section highlights. The gallery below is unlimited and managed separately.</p>
          <div className="adminActions" style={{ marginBottom: '1rem' }}>
            <label className="button secondary">
              Mass Upload Overnight Gallery Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={uploadOvernightGalleryImages}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h4>Overnight gallery manager</h4>
            <p className="subhead">This is the unlimited overnight gallery. Images here come from the mass upload button or can be selected from your uploaded media.</p>
            <div className="adminActions" style={{ marginBottom: '0.85rem' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setOpenOvernightLandingLibraryPicker((current) => {
                    const next = current === 'gallery' ? null : 'gallery'
                    if (next !== 'gallery') {
                      setSelectedOvernightGalleryLibraryUrls([])
                    }
                    return next
                  })
                }}
              >
                {openOvernightLandingLibraryPicker === 'gallery' ? 'Close media library' : 'Add from media library'}
              </button>
              {openOvernightLandingLibraryPicker === 'gallery' ? (
                <>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setSelectedOvernightGalleryLibraryUrls([])}
                    disabled={selectedOvernightGalleryLibraryUrls.length === 0}
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={addSelectedOvernightGalleryLibraryImages}
                    disabled={selectedOvernightGalleryLibraryUrls.length === 0}
                  >
                    Add selected ({selectedOvernightGalleryLibraryUrls.length})
                  </button>
                </>
              ) : null}
            </div>
            {openOvernightLandingLibraryPicker === 'gallery' ? (
              <div className="surveyLibraryPickerGrid" style={{ marginBottom: '0.85rem' }}>
                {imageLibrary.length === 0 ? (
                  <p className="subhead">No image files found in media library.</p>
                ) : (
                  imageLibrary.map((item) => (
                    <button
                      key={`overnight-gallery-library-${item.path}`}
                      type="button"
                      className={`surveyLibraryPickerItem ${
                        selectedOvernightGalleryLibraryUrls.includes(item.publicUrl) ? 'selected' : ''
                      }`}
                      onClick={() => toggleOvernightGalleryLibrarySelection(item.publicUrl)}
                    >
                      <img
                        src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>{item.name}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
            {(config.media.overnightGalleryImageUrls || []).filter(Boolean).length === 0 ? (
              <p className="subhead">No overnight gallery images selected yet.</p>
            ) : (
              <div className="surveyStepAssetGrid">
                {config.media.overnightGalleryImageUrls
                  .map((url, index) => ({ url: String(url || '').trim(), index }))
                  .filter((item) => item.url)
                  .map((item) => (
                    <article key={`overnight-gallery-manager-${item.index}`} className="surveyStepAssetCard">
                      <div className="surveyContextFrame">
                        <img
                          src={getResizedPreviewUrl(item.url, 640, 360)}
                          alt={`Overnight gallery ${item.index + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <p className="subhead">
                        <strong>Gallery image {item.index + 1}</strong>
                      </p>
                      <label>
                        Image URL
                        <input
                          type="url"
                          value={item.url}
                          onChange={(event) => updateOvernightGalleryImage(item.index, event.target.value)}
                          placeholder="https://..."
                        />
                      </label>
                      <div className="adminActions">
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => removeOvernightGalleryImage(item.index)}
                        >
                          Remove from gallery
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h4>Overnight registration flow images</h4>
            <p className="subhead">Choose up to 3 centered images from the overnight gallery to display above the overnight registration form.</p>
            <div className="surveyStepAssetGrid">
              {Array.from({ length: 3 }).map((_, index) => (
                <article key={`overnight-registration-image-${index}`} className="surveyStepAssetCard">
                  <h4>Registration image {index + 1}</h4>
                  <div className="surveyContextFrame">
                    {config.media.overnightRegistrationImageUrls?.[index] ? (
                      <img
                        src={getResizedPreviewUrl(config.media.overnightRegistrationImageUrls[index], 640, 360)}
                        alt={`Overnight registration image ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="surveyVisualPlaceholder">No image assigned</div>
                    )}
                  </div>
                  <label>
                    Image URL
                    <input
                      type="url"
                      value={config.media.overnightRegistrationImageUrls?.[index] || ''}
                      onChange={(event) => updateOvernightRegistrationImage(index, event.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                  <div className="adminActions">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() =>
                        setOpenOvernightRegistrationLibraryPicker((current) => (current === index ? null : index))
                      }
                      disabled={(config.media.overnightGalleryImageUrls || []).filter(Boolean).length === 0}
                    >
                      {openOvernightRegistrationLibraryPicker === index ? 'Close overnight gallery' : 'Choose from overnight gallery'}
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => updateOvernightRegistrationImage(index, '')}
                    >
                      Clear image
                    </button>
                  </div>
                  {openOvernightRegistrationLibraryPicker === index ? (
                    <div className="surveyLibraryPickerGrid">
                      {(config.media.overnightGalleryImageUrls || []).filter(Boolean).length === 0 ? (
                        <p className="subhead">Add images to the overnight gallery first.</p>
                      ) : (
                        config.media.overnightGalleryImageUrls
                          .map((url, galleryIndex) => ({ url: String(url || '').trim(), galleryIndex }))
                          .filter((item) => item.url)
                          .map((item) => (
                            <button
                              key={`overnight-registration-gallery-${index}-${item.galleryIndex}`}
                              type="button"
                              className="surveyLibraryPickerItem"
                              onClick={() => assignOvernightRegistrationImageFromGallery(index, item.url)}
                            >
                              <img
                                src={getResizedPreviewUrl(item.url, 260, 146)}
                                alt={`Overnight gallery option ${item.galleryIndex + 1}`}
                                loading="lazy"
                                decoding="async"
                              />
                              <span>Gallery image {item.galleryIndex + 1}</span>
                            </button>
                          ))
                      )}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
          <div className="surveyStepAssetGrid">
            {overnightLandingSlots.map((slot, index) => (
              <article key={slot.key} className="surveyStepAssetCard">
                <h4>{slot.label}</h4>
                <div className="surveyContextFrame">
                  {config.media.overnightLandingImageUrls?.[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.overnightLandingImageUrls[index], 640, 360)}
                      alt={`${slot.label} preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No image assigned</div>
                  )}
                </div>
                <p className="subhead">
                  <strong>Carousel caption:</strong> {slot.caption}
                </p>
                <label>
                  Image URL
                  <input
                    type="url"
                    value={config.media.overnightLandingImageUrls?.[index] || ''}
                    onChange={(event) => updateOvernightLandingImage(index, event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <div className="adminActions">
                  <label className="button secondary">
                    Upload from computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadOvernightLandingImage(index, event)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenOvernightLandingLibraryPicker((current) => {
                        setSelectedOvernightGalleryLibraryUrls([])
                        return current === index ? null : index
                      })
                    }
                  >
                    {openOvernightLandingLibraryPicker === index ? 'Close media library' : 'Choose from media library'}
                  </button>
                </div>
                {openOvernightLandingLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {imageLibrary.length === 0 ? (
                      <p className="subhead">No image files found in media library.</p>
                    ) : (
                      imageLibrary.map((item) => (
                        <button
                          key={`overnight-landing-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignOvernightLandingImageFromLibrary(index, item.publicUrl)}
                        >
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
        </>
        ) : null}

        {activeMediaSubtab === 'library' ? (
        <section className="subCard">
          <h3>Upload to bucket for later use</h3>
          <p className="subhead">Upload files now, then assign them to sections from Media Library.</p>
          <input type="file" accept="image/*,video/*" multiple onChange={uploadToLibrary} />
        </section>
        ) : null}

        {activeMediaSubtab === 'library' ? (
        <div className="adminPreviewGrid">
          <article className="previewCard">
            <h3>Media library</h3>
            <div className="adminActions">
              <button type="button" className="button secondary" onClick={refreshMediaLibrary} disabled={loadingLibrary}>
                {loadingLibrary ? 'Refreshing...' : 'Refresh library'}
              </button>
              {uploading ? <span>Uploading...</span> : null}
            </div>

            {mediaLibrary.length === 0 ? (
              <p className="subhead">No media files found in bucket.</p>
            ) : (
              <>
                <div className="adminPhoneStage">
                  <div className="phoneFrame adminPhoneFrame">
                    <div className="phoneNotch" />
                    <div className="phoneScreen">
                      {isVideoUrl(activeLibraryPreviewUrl) ? (
                        <video
                          className="phoneImage"
                          src={activeLibraryPreviewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: `${config.media.levelUpScreenshotSize}%` }}
                        />
                      ) : (
                        <img
                          className="phoneImage"
                          src={getResizedPreviewUrl(activeLibraryPreviewUrl, 520, 920)}
                          alt="Media library phone preview"
                          style={{
                            width: `${config.media.levelUpScreenshotSize}%`,
                            ...getLevelUpScreenshotStyle(activePreviewIndex),
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <p className="subhead">All uploaded media can be previewed in the phone viewport.</p>
                <div className="thumbGrid">
                  {mediaLibrary.map((item, index) => (
                    <div
                      key={item.path}
                      className={`thumbItem ${activeLibraryPreviewIndex === index ? 'selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="thumbPreviewBtn"
                        onClick={() => setActiveLibraryPreviewIndex(index)}
                      >
                        {isVideoUrl(item.publicUrl) ? (
                          <video src={item.publicUrl} muted playsInline preload="metadata" />
                        ) : (
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 280, 380)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </button>
                    <div className="thumbActions">
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('welcomeLogoUrl', item.publicUrl)}
	                      >
	                        Use as welcome logo
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('heroImageUrl', item.publicUrl)}
	                      >
	                        Use as hero
                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('surveyStep1FlyerUrl', item.publicUrl)}
	                      >
	                        Use as Step 1 flyer
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('surveyMobileBgUrl', item.publicUrl)}
	                      >
	                        Use as survey mobile bg
	                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => addScreenshotUrl(item.publicUrl)}
                      >
                        Add to phone
                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('wechatQrUrl', item.publicUrl)}
	                      >
	                        Use as WeChat QR
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(0, item.publicUrl)}
	                      >
	                        Use as Step 1 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(1, item.publicUrl)}
	                      >
	                        Use as Step 2A image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(2, item.publicUrl)}
	                      >
	                        Use as Step 2B image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(3, item.publicUrl)}
	                      >
	                        Use as Step 3 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(4, item.publicUrl)}
	                      >
	                        Use as Step 4 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(5, item.publicUrl)}
	                      >
	                        Use as Step 5 image
	                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(0, item.publicUrl)}
                      >
                        Use as Reg Step 1 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(1, item.publicUrl)}
                      >
                        Use as Reg Step 2 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(2, item.publicUrl)}
                      >
                        Use as Reg Step 3 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(3, item.publicUrl)}
                      >
                        Use as Reg Step 4 image
                      </button>
	                    </div>
	                  </div>
	                  ))}
                </div>
              </>
            )}
          </article>
        </div>
        ) : null}
      </section>
      ) : null}

      {activeAdminTab === 'tuition' ? (
      <section className="card section">
        <h2>Tuition table</h2>
        <div className="adminGrid">
          <label>
            Discount end date
            <input
              type="date"
              value={config.tuition.discountEndDate}
              onChange={(event) => updateTuitionField('discountEndDate', event.target.value)}
            />
          </label>
          <label>
            Boot Camp pricing
            <small>Boot Camp now has its own editable saved fields below.</small>
          </label>
          <label>
            Sibling discount (% from 2nd camper)
            <input
              type="number"
              min="0"
              step="1"
              value={config.tuition.siblingDiscountPct}
              onChange={(event) => updateTuitionField('siblingDiscountPct', event.target.value)}
            />
          </label>
          <label>
            Discount value label
            <input
              value={config.tuition.discountDisplayValue}
              onChange={(event) => updateTuitionField('discountDisplayValue', event.target.value)}
              placeholder="Example: Save up to $350"
            />
          </label>
          <label>
            Discount code
            <input
              value={config.tuition.discountCode}
              onChange={(event) => updateTuitionField('discountCode', event.target.value)}
              placeholder="Example: SUMMER350"
            />
          </label>
          <label>
            Invoice business name
            <input
              value={config.tuition.businessName}
              onChange={(event) => updateTuitionField('businessName', event.target.value)}
              placeholder="Example: New England Wushu"
            />
          </label>
          <label>
            Invoice business address
            <textarea
              rows="3"
              value={config.tuition.businessAddress}
              onChange={(event) => updateTuitionField('businessAddress', event.target.value)}
              placeholder="Street address, city, state, zip"
            />
          </label>
        </div>
        <div className="tuitionTableWrap">
          <table className="tuitionTable">
            <thead>
              <tr>
                <th>Method</th>
                <th>Regular</th>
                <th>Discounted Price</th>
                <th>Discount Amount</th>
                <th>Checks</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['fullWeek', 'Full Week'],
                ['fullDay', 'Full Day'],
                ['amHalf', 'AM Half Day'],
                ['pmHalf', 'PM Half Day'],
                ['overnightWeek', 'Overnight Full Week'],
                ['overnightDay', 'Overnight Camp Day'],
              ].map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={config.tuition.regular[key]}
                      onChange={(event) => updateTuition('regular', key, event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={config.tuition.discount[key]}
                      onChange={(event) => updateTuition('discount', key, event.target.value)}
                    />
                  </td>
                  <td>{money(discountAmount(config.tuition.regular[key], config.tuition.discount[key]))}</td>
                  <td className={`checkCell ${tuitionChecks[key]?.pass ? 'pass' : 'warn'}`}>
                    {tuitionChecks[key] ? (
                      <>
                        <div className={`checkBadge ${tuitionChecks[key].pass ? 'pass' : 'warn'}`}>
                          {tuitionChecks[key].pass ? 'GREEN LIGHT' : 'Needs update'}
                        </div>
                        {tuitionChecks[key].lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        {(tuitionChecks[key].raises || []).map((item) => (
                          <p key={item} className="raiseBox">
                            {item}
                          </p>
                        ))}
                      </>
                    ) : (
                      <span>No rule for this row.</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Lunch (per day)</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.tuition.lunchPrice}
                    onChange={(event) => updateTuitionField('lunchPrice', event.target.value)}
                  />
                </td>
                <td>-</td>
                <td>-</td>
                <td className="checkCell">
                  <span>Used in registration step 3 totals.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tuitionTableWrap">
          <h3>Competition Team Boot Camp</h3>
          <p className="subhead">
            Edit Boot Camp prices directly. Checks below warn if a Boot Camp price is not above the matching General Camp price.
          </p>
          <table className="tuitionTable">
            <thead>
              <tr>
                <th>Method</th>
                <th>Regular</th>
                <th>Discounted Price</th>
                <th>Discount Amount</th>
                <th>Checks</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['fullWeek', 'Full Week'],
                ['fullDay', 'Full Day'],
                ['amHalf', 'AM Half Day'],
                ['pmHalf', 'PM Half Day'],
              ].map(([key, label]) => {
                const regularValue = bootcampTuition.regular[key]
                const discountValue = bootcampTuition.discount[key]
                const checks = bootcampChecks[key] || []
                const pass = checks.every((item) => item.pass)
                return (
                  <tr key={`boot-${key}`}>
                    <td>{label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.tuition.bootcamp.regular[key]}
                        onChange={(event) => updateBootcampTuition('regular', key, event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.tuition.bootcamp.discount[key]}
                        onChange={(event) => updateBootcampTuition('discount', key, event.target.value)}
                      />
                    </td>
                    <td>{money(discountAmount(regularValue, discountValue))}</td>
                    <td className={`checkCell ${pass ? 'pass' : 'warn'}`}>
                      <div className={`checkBadge ${pass ? 'pass' : 'warn'}`}>
                        {pass ? 'GREEN LIGHT' : 'Needs update'}
                      </div>
                      {checks.map((item) => (
                        <p key={item.line}>{item.line}</p>
                      ))}
                      {checks.filter((item) => item.fixText).map((item) => (
                        <p key={item.fixText} className="raiseBox">
                          {item.fixText}
                        </p>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeAdminTab === 'programs'
        ? Object.entries(programMeta).map(([programKey, meta]) => {
        const program = config.programs[programKey]
        const options = weekOptions[programKey]
        const selectedCount = program.selectedWeeks.length
        const actonSelectedCount = Array.isArray(program.actonSelectedWeeks) ? program.actonSelectedWeeks.length : 0
        const wellesleySelectedCount = Array.isArray(program.wellesleySelectedWeeks) ? program.wellesleySelectedWeeks.length : 0

        return (
          <section key={programKey} className="card section">
            <h2>{meta.title}</h2>
            <p className="subhead">{meta.rhythm}</p>

            <div className="adminGrid">
              <label>
                Start date
                <input
                  type="date"
                  value={program.startDate}
                  onChange={(event) => updateProgramDate(programKey, 'startDate', event.target.value)}
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={program.endDate}
                  onChange={(event) => updateProgramDate(programKey, 'endDate', event.target.value)}
                />
              </label>
            </div>

            <div className="adminActions">
              <button type="button" className="button secondary" onClick={() => selectAllWeeks(programKey)}>
                Select all
              </button>
              <button type="button" className="button secondary" onClick={() => clearWeeks(programKey)}>
                Clear
              </button>
              <span>{selectedCount} selected</span>
            </div>

            {options.length === 0 ? (
              <p className="subhead">Set a valid start and end date to generate options.</p>
            ) : (
              <>
                <p className="adminWeekListLabel">All locations — {selectedCount} of {options.length} selected</p>
                <div className="adminWeekList">
                  {options.map((week) => (
                    <label key={week.id} className="weekRow">
                      <input
                        type="checkbox"
                        checked={program.selectedWeeks.includes(week.id)}
                        onChange={() => toggleWeek(programKey, week.id)}
                      />
                      <span>{formatWeekLabel(week)}</span>
                    </label>
                  ))}
                </div>
                {programKey === 'general' ? (
                  <>
                    <div className="subCard">
                      <h3>Acton General Camp Weeks</h3>
                      <p className="subhead">
                        Acton can have a different General Camp schedule. Families selecting Acton only see weeks checked here.
                      </p>
                      <div className="adminActions">
                        <button type="button" className="button secondary" onClick={() => selectAllWeeks('general', 'actonSelectedWeeks')}>
                          Select all Acton weeks
                        </button>
                        <button type="button" className="button secondary" onClick={() => clearWeeks('general', 'actonSelectedWeeks')}>
                          Clear Acton weeks
                        </button>
                        <span>{actonSelectedCount} selected for Acton</span>
                      </div>
                      <div className="adminWeekList">
                        {options.map((week) => (
                          <label key={`acton-${week.id}`} className="weekRow">
                            <input
                              type="checkbox"
                              checked={program.actonSelectedWeeks.includes(week.id)}
                              onChange={() => toggleWeek('general', week.id, 'actonSelectedWeeks')}
                            />
                            <span>{formatWeekLabel(week)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="subCard">
                      <h3>Wellesley General Camp Weeks</h3>
                      <p className="subhead">
                        Wellesley can have a different General Camp schedule. Families selecting Wellesley only see weeks checked here.
                      </p>
                      <div className="adminActions">
                        <button type="button" className="button secondary" onClick={() => selectAllWeeks('general', 'wellesleySelectedWeeks')}>
                          Select all Wellesley weeks
                        </button>
                        <button type="button" className="button secondary" onClick={() => clearWeeks('general', 'wellesleySelectedWeeks')}>
                          Clear Wellesley weeks
                        </button>
                        <span>{wellesleySelectedCount} selected for Wellesley</span>
                      </div>
                      <div className="adminWeekList">
                        {options.map((week) => (
                          <label key={`wellesley-${week.id}`} className="weekRow">
                            <input
                              type="checkbox"
                              checked={Array.isArray(program.wellesleySelectedWeeks) && program.wellesleySelectedWeeks.includes(week.id)}
                              onChange={() => toggleWeek('general', week.id, 'wellesleySelectedWeeks')}
                            />
                            <span>{formatWeekLabel(week)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </section>
        )
      })
        : null}

      {activeAdminTab === 'journey' ? (
      <section className="card section">
        <h2>Email Journey Builder</h2>
        <p className="subhead">
          Four automation views: survey leads, standard submitted-registration reminders, paid-family follow-ups, and overnight submitted-registration reminders.
        </p>
        <div className="journeyFlowTabs" role="tablist" aria-label="Journey flow type">
          <button
            type="button"
            role="tab"
            aria-selected={activeJourneyFlow === 'lead'}
            className={`journeyFlowTabBtn ${activeJourneyFlow === 'lead' ? 'active' : ''}`}
            onClick={() => setActiveJourneyFlow('lead')}
          >
            Survey Lead Nurture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeJourneyFlow === 'reservation'}
            className={`journeyFlowTabBtn ${activeJourneyFlow === 'reservation' ? 'active' : ''}`}
            onClick={() => setActiveJourneyFlow('reservation')}
          >
            Submitted Registration 72h
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeJourneyFlow === 'paid-followup'}
            className={`journeyFlowTabBtn ${activeJourneyFlow === 'paid-followup' ? 'active' : ''}`}
            onClick={() => setActiveJourneyFlow('paid-followup')}
          >
            Paid Follow-Up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeJourneyFlow === 'overnight'}
            className={`journeyFlowTabBtn ${activeJourneyFlow === 'overnight' ? 'active' : ''}`}
            onClick={() => setActiveJourneyFlow('overnight')}
          >
            Overnight Registration 72h
          </button>
        </div>
        <div className="adminGrid journeyBuilderGrid">
          <label>
            Test recipient email
            <input
              type="email"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <div className="adminActions">
            {isLeadJourneyFlow ? (
              <button type="button" className="button secondary" onClick={applyPremiumJourneyTemplates}>
                Load Premium Templates
              </button>
            ) : null}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                sendTestEmailForStep(
                  activeJourneyPreviewIndex,
                  activeJourneyTemplate,
                  activeJourneyFlow
                )
              }
              disabled={sendingTestStep > 0}
            >
              {sendingTestStep === activeJourneyPreviewIndex + 1
                ? 'Sending test...'
                : `Send Test for ${activeJourneyStepLabel}`}
            </button>
          </div>
        </div>
        <div className="journeyGrid">
          {activeJourneyBlueprintItems.map((item) => (
            <article key={item.step} className="journeyCard">
              <p className="journeyDay">{item.step}</p>
              <h4>{item.objective}</h4>
              <p><strong>CTA:</strong> {item.cta}</p>
            </article>
          ))}
        </div>
        <div className="surveySubTabs">
          {activeJourneyPreviewTemplates.map((item, index) => (
            <button
              key={`${item.dayLabel}-${index}`}
              type="button"
              className={`subTabBtn ${activeJourneyPreviewIndex === index ? 'active' : ''}`}
              onClick={() =>
                isLeadJourneyFlow
                  ? setActiveJourneyTab(index)
                  : isPaidFollowupJourneyFlow
                    ? setActivePaidEnrollmentJourneyTab(index)
                  : setActiveReservationJourneyTab(index)
              }
            >
              {activeJourneyBlueprintItems[index]?.step || `Step ${index + 1}`}
            </button>
          ))}
        </div>
        <article className="journeyCard adminJourneyCard">
          <p className="journeyDay">Selected Step</p>
          <h4>
            {activeJourneyDisplayTitle}
          </h4>
          <p className="subhead">
            Manual send checks all due journey thresholds and logs each email as it goes. If a step is overdue, it sends immediately on this run.
          </p>
          {isLeadJourneyFlow ? (
            <div className="adminGrid">
              <label>
                Day label
                <input
                  value={activeLeadJourneyTemplate?.dayLabel || ''}
                  onChange={(event) => updateLeadJourneyTemplateField(activeJourneyTab, 'dayLabel', event.target.value)}
                  placeholder="Example: Day 3"
                />
              </label>
              <label>
                Title
                <input
                  value={activeLeadJourneyTemplate?.title || ''}
                  onChange={(event) => updateLeadJourneyTemplateField(activeJourneyTab, 'title', event.target.value)}
                  placeholder="Step title"
                />
              </label>
              <label className="full">
                Subject
                <input
                  value={activeLeadJourneyTemplate?.subject || ''}
                  onChange={(event) => updateLeadJourneyTemplateField(activeJourneyTab, 'subject', event.target.value)}
                  placeholder="Email subject"
                />
              </label>
              <label className="full">
                YouTube URL (optional)
                <input
                  value={activeLeadJourneyTemplate?.videoUrl || ''}
                  onChange={(event) => updateLeadJourneyTemplateField(activeJourneyTab, 'videoUrl', event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              <label className="full">
                Body
                <textarea
                  rows="10"
                  value={activeLeadJourneyTemplate?.body || ''}
                  onChange={(event) => updateLeadJourneyTemplateField(activeJourneyTab, 'body', event.target.value)}
                  placeholder="Email body"
                />
              </label>
            </div>
          ) : null}
          {isPaidFollowupJourneyFlow ? (
            <div className="adminGrid">
              <label>
                Preview camp type
                <select value={paidEnrollmentPreviewTrack} onChange={(event) => setPaidEnrollmentPreviewTrack(event.target.value)}>
                  <option value="general">General Camp</option>
                  <option value="bootcamp">Competition Boot Camp</option>
                </select>
              </label>
            </div>
          ) : null}
          <div className="adminActions">
            <button
              type="button"
              className="button"
              onClick={processDueJourneyEmails}
              disabled={processingJourneyEmails}
            >
              {processingJourneyEmails ? 'Processing all due emails...' : 'Send All Due Journey Emails Now'}
            </button>
            <span>{activeJourneyTemplate?.dayLabel || ''}</span>
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                sendTestEmailForStep(
                  activeJourneyPreviewIndex,
                  activeJourneyTemplate,
                  activeJourneyFlow
                )
              }
              disabled={sendingTestStep > 0}
            >
              {sendingTestStep === activeJourneyPreviewIndex + 1
                ? 'Sending test...'
                : `Send Test for ${activeJourneyStepLabel}`}
            </button>
          </div>
          <p className="subhead">
            {isLeadJourneyFlow
              ? 'Click step tabs to review premium survey-lead emails in live preview.'
              : isPaidFollowupJourneyFlow
                ? 'Click step tabs to preview the live paid-family journey for A0, A2, A4, and A8. Switch between General Camp and Competition Boot Camp above.'
              : isOvernightJourneyFlow
                ? 'Click step tabs to review the overnight registration reminder version in live preview.'
                : 'Click step tabs to review premium submitted-registration reminder emails in live preview.'}
          </p>
        </article>
        <article className="journeyCard adminJourneyCard">
          <p className="journeyDay">Live Preview ({activeJourneyStepLabel})</p>
          <iframe
            title={`Journey email preview ${activeJourneyStepLabel}`}
            className="adminEmailPreviewFrame"
            srcDoc={buildJourneyPreviewHtmlFromTemplate(
              activeJourneyPreviewIndex,
              activeJourneyTemplate,
              activeJourneyFlow
            )}
          />
        </article>

        <article className="journeyCard adminJourneyCard">
          <h3>AI Reply Assistant</h3>
          <p className="subhead">Paste an inbound email and generate a draft reply you can edit before sending.</p>
          <div className="adminGrid">
            <label>
              Selected reply
              <input
                value={selectedReplyId ? `Reply #${selectedReplyId}` : 'None selected'}
                disabled
              />
            </label>
            <div className="adminActions">
              <button type="button" className="button secondary" onClick={markReplyHandled} disabled={!selectedReplyId}>
                Mark selected reply handled
              </button>
            </div>
          </div>
          <div className="adminGrid">
            <label>
              Parent name (optional)
              <input
                value={aiReplyInput.customerName}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, customerName: event.target.value }))
                }
                placeholder="Parent name"
              />
            </label>
            <label>
              Tone
              <select
                value={aiReplyInput.tone}
                onChange={(event) => setAiReplyInput((current) => ({ ...current, tone: event.target.value }))}
              >
                <option value="professional">Professional</option>
                <option value="warm">Warm</option>
                <option value="direct">Direct</option>
              </select>
            </label>
            <label className="full">
              Subject (optional)
              <input
                value={aiReplyInput.subject}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Reply subject"
              />
            </label>
            <label className="full">
              Inbound email text
              <textarea
                rows="5"
                value={aiReplyInput.message}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="Paste parent email here..."
              />
            </label>
          </div>
          <div className="adminActions">
            <button
              type="button"
              className="button secondary"
              onClick={generateAiReplyDraft}
              disabled={aiReplyLoading}
            >
              {aiReplyLoading ? 'Generating...' : selectedReplyId ? 'Generate draft for selected reply' : 'Generate AI reply draft'}
            </button>
          </div>
          {aiReplyDraft ? (
            <label className="full">
              Draft reply
              <textarea rows="7" value={aiReplyDraft} onChange={(event) => setAiReplyDraft(event.target.value)} />
            </label>
          ) : null}
        </article>
      </section>
      ) : null}

      {activeAdminTab === 'accounting' ? (
      <section className="card section">
        <h2>Registration Accounting</h2>
        <p className="subhead">
          Camper-level accounting from submitted registrations. Archive rows when complete, and restore anytime.
        </p>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Weekly Roster Summary</h3>
            <p className="subhead">
              Shows all registered campers with saved week selections, whether paid or unpaid. Export one polished PDF per program or a merged all-camp roster packet.
            </p>
          </div>
          <div className="rosterSummaryHero">
            <div>
              <strong>Merged Camp Roster</strong>
              <p className="subhead">
                {rosterSummary.merged.totalCampers} registered camper{rosterSummary.merged.totalCampers === 1 ? '' : 's'} across{' '}
                {rosterSummary.merged.activeWeeks} active program-weeks.
              </p>
            </div>
            <div className="adminActions">
              <label className="rosterSearchField">
                <span>Search name</span>
                <input
                  type="search"
                  value={rosterSearchTerm}
                  onChange={(event) => setRosterSearchTerm(event.target.value)}
                  placeholder="Search camper or parent"
                />
              </label>
              <button
                type="button"
                className="button secondary"
                onClick={collapseAllRosterWeeks}
              >
                Collapse All
              </button>
              <button
                type="button"
                className="button"
                onClick={() => exportRosterPdf({ mode: 'merged' })}
                disabled={exportingRosterKey === 'merged'}
              >
                {exportingRosterKey === 'merged' ? 'Exporting...' : 'Export Merged PDF'}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => exportRosterPdf({ mode: 'selected' })}
                disabled={exportingRosterKey === 'selected' || selectedRosterWeekKeys.length === 0}
              >
                {exportingRosterKey === 'selected' ? 'Exporting...' : `Export Selected (${selectedRosterWeekKeys.length})`}
              </button>
            </div>
          </div>
          <div className="rosterProgramStack">
            {Object.keys(rosterProgramMeta).map((programKey) => renderRosterProgramCard(programKey))}
          </div>
        </div>
        <div className="adminActions">
          <button
            type="button"
            className="button"
            onClick={processDueJourneyEmails}
            disabled={processingJourneyEmails}
          >
            {processingJourneyEmails ? 'Processing all due emails...' : 'Send All Due Journey Emails Now'}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={refreshRegistrationAccounting}
            disabled={loadingAccounting}
          >
            {loadingAccounting ? 'Refreshing...' : 'Refresh registrations'}
          </button>
          <span>
            Due journey emails: <strong className="trackerDueCountBadge">{accountingDueEmailCount}</strong>
          </span>
          <span>
            Upcoming 24h: <strong className="trackerUpcomingCountBadge">{accountingUpcomingEmailCount}</strong>
          </span>
        </div>
        <div className="accountingDashboardGrid">
          <article className="accountingStatCard">
            <span>Total Tuition</span>
            <strong>{money(accountingTotals.totalTuition)}</strong>
          </article>
          <article className="accountingStatCard">
            <span>Total Paid</span>
            <strong>{money(accountingTotals.totalPaid)}</strong>
          </article>
          <article className="accountingStatCard">
            <span>Total Owed</span>
            <strong>{money(accountingTotals.totalOwed)}</strong>
          </article>
          <article className="accountingStatCard">
            <span>Active Rows</span>
            <strong>{accountingTotals.activeRows}</strong>
          </article>
          <article className="accountingStatCard">
            <span>Archived Rows</span>
            <strong>{accountingTotals.archivedRows}</strong>
          </article>
        </div>
        <div className="accountingDashboardGrid accountingMethodGrid">
          {accountingPaymentMethods.map((method) => (
            <article key={`method-total-${method}`} className="accountingStatCard accountingMethodCard">
              <span>{method.toUpperCase()}</span>
              <strong>{money(accountingTotals.methodTotals[method])}</strong>
            </article>
          ))}
        </div>
        <div className="accountingPricingGrid">
          {accountingPricingReference.map((card) => (
            <article key={card.key} className="accountingPricingCard">
              <div className="accountingPricingHead">
                <p>{card.title}</p>
                <strong>{money(card.activeFullWeek)}</strong>
              </div>
              <div className="accountingPricingSubhead">
                <span>{card.activeLabel}</span>
                {card.showRegularNote ? <small>Regular: {money(card.regularFullWeek)}</small> : null}
              </div>
              <p className="accountingPricingNote">{card.note}</p>
              {card.rows.length > 0 ? (
                <div className="accountingPricingRows">
                  {card.rows.map((row) => {
                    const activeValue = accountingDiscountActive ? row.discountedValue : row.value
                    return (
                      <div key={`${card.key}-${row.label}`} className="accountingPricingRow">
                        <span>{row.label}</span>
                        <div>
                          <strong>{money(activeValue)}</strong>
                          {accountingDiscountActive && row.discountedValue !== row.value ? (
                            <small>Regular: {money(row.value)}</small>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="accountingPricingRows">
                  <div className="accountingPricingRow accountingPricingRowMuted">
                    <span>No AM / PM / full-day pricing shown</span>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Active Registration Rows</h3>
            <p className="subhead">Current camper balances and payment tracking.</p>
          </div>
          <div className="tuitionTableWrap">
            <table className="tuitionTable">
              <thead>
                <tr>
                  <th>Family / Submission</th>
                  <th>Camper</th>
                  <th>Weeks</th>
                  <th>Lunch Days</th>
                  <th>Tuition</th>
                  <th>Lunch</th>
                  <th>Manual Discount</th>
                  <th>Paid Tuition</th>
                  <th>Paid Lunch</th>
                  <th>Total Owed</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAccountingRows.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="accountingEmptyCell">
                      No submitted camper rows yet.
                    </td>
                  </tr>
                ) : (
                  activeAccountingRows.map((row) => {
                    const key = `${row.registrationId}-${row.camperIndex}`
                    const draft = accountingDrafts[row.key]
                    const manualDiscountValue = draft?.manualDiscount ?? row.manualDiscount
                    const tuitionPaidValue = draft?.tuitionPaidAmount ?? String(row.tuitionPaidAmount ?? 0)
                    const lunchPaidValue = draft?.lunchPaidAmount ?? String(row.lunchPaidAmount ?? 0)
                    const paymentMethodValue = draft?.paymentMethod ?? row.paymentMethod
                    const archivedValue = draft?.archived ?? row.archived
                    const hasPendingAccountingChanges =
                      Number(manualDiscountValue || 0) !== Number(row.manualDiscount || 0) ||
                      Number(tuitionPaidValue || 0) !== Number(row.tuitionPaidAmount || 0) ||
                      Number(lunchPaidValue || 0) !== Number(row.lunchPaidAmount || 0) ||
                      String(paymentMethodValue || '') !== String(row.paymentMethod || '') ||
                      Boolean(archivedValue) !== Boolean(row.archived)
                    return (
                      <tr key={`accounting-row-${key}`}>
                        <td>
                          <strong>{row.parentName}</strong>
                          {row.r5SentUnpaid ? <div className="accountingAlertText">R5 sent, not paid</div> : null}
                          <div>{row.parentEmail || '-'}</div>
                          <div>{formatAdminDateTime(row.createdAt)}</div>
                        </td>
                        <td>
                          <strong>{row.camperName}</strong>
                          <div>Sibling discount: {row.siblingDiscountPct}%</div>
                        </td>
                        <td>
                          <div className="accountingDetailStack">
                            {row.weeksCount > 0
                              ? renderAccountingDetailChip(
                                  `${key}-weeks`,
                                  'Weeks',
                                  row.weekOverlayLines,
                                  row.weeksCount
                                )
                              : null}
                            {row.weeksCount === 0 ? <span>-</span> : null}
                          </div>
                        </td>
                        <td>
                          {row.lunchDaysCount > 0
                            ? renderAccountingDetailChip(`${key}-lunch`, 'Lunch Days', row.lunchDays, row.lunchDaysCount)
                            : '-'}
                        </td>
                        <td>
                          {renderAccountingDetailChip(
                            `${key}-tuition-breakdown`,
                            money(row.tuitionAfterManualDiscount),
                            [
                              `Tuition before manual discount: ${money(row.tuitionBeforeManualDiscount)}`,
                              ...(row.weekTierPromoLines || []).map((item) => `${item.label}: -${money(item.amount)}`),
                              row.siblingDiscountAmount > 0
                                ? `Sibling discount (${row.siblingDiscountPct}%): -${money(row.siblingDiscountAmount)}`
                                : 'Sibling discount: -$0.00',
                              row.manualDiscount > 0
                                ? `Manual discount on tuition: -${money(row.manualDiscount)}`
                                : 'Manual discount on tuition: -$0.00',
                              `Tuition due after discounts: ${money(row.tuitionAfterManualDiscount)}`,
                            ]
                          )}
                        </td>
                        <td>{money(row.lunchCost)}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={manualDiscountValue}
                            onChange={(event) =>
                              updateAccountingDraft(row, { manualDiscount: Number(event.target.value || 0) })
                            }
                            disabled={updatingAccountingKey === key}
                          />
                        </td>
                        <td>
                          <div className="accountingPaidCell">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tuitionPaidValue}
                              onChange={(event) => updateAccountingDraft(row, { tuitionPaidAmount: event.target.value })}
                              onBlur={() =>
                                updateAccountingEntryField(row, {
                                  tuition_paid_amount: Number(tuitionPaidValue || 0),
                                })
                              }
                              disabled={updatingAccountingKey === key}
                            />
                            <button
                              type="button"
                              className="accountingQuickFillBtn"
                              onClick={() =>
                                updateAccountingEntryField(row, {
                                  tuition_paid_amount: Number(row.tuitionAfterManualDiscount || 0),
                                })
                              }
                              disabled={updatingAccountingKey === key || Number(row.tuitionOwedAmount || 0) <= 0}
                            >
                              Use Tuition Due
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="accountingPaidCell">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={lunchPaidValue}
                              onChange={(event) => updateAccountingDraft(row, { lunchPaidAmount: event.target.value })}
                              onBlur={() =>
                                updateAccountingEntryField(row, {
                                  lunch_paid_amount: Number(lunchPaidValue || 0),
                                })
                              }
                              disabled={updatingAccountingKey === key}
                            />
                            <button
                              type="button"
                              className="accountingQuickFillBtn"
                              onClick={() =>
                                updateAccountingEntryField(row, {
                                  lunch_paid_amount: Number(row.lunchCost || 0),
                                })
                              }
                              disabled={updatingAccountingKey === key || Number(row.lunchOwedAmount || 0) <= 0}
                            >
                              Use Lunch Due
                            </button>
                          </div>
                        </td>
                        <td>
                          {renderAccountingDetailChip(
                            `${key}-total-breakdown`,
                            money(row.owedAmount),
                            [
                              ...row.totalBreakdownLines,
                              `Paid tuition: ${money(row.tuitionPaidAmount)}`,
                              `Paid lunch: ${money(row.lunchPaidAmount)}`,
                              `Total paid: ${money(row.paidAmount)}`,
                              `Tuition owed: ${money(row.tuitionOwedAmount)}`,
                              `Lunch owed: ${money(row.lunchOwedAmount)}`,
                              `Total owed: ${money(row.owedAmount)}`,
                              row.shouldStopRegistrationEmails
                                ? 'Registration reminder emails paused: tuition is at least 95% paid.'
                                : 'Registration reminder emails remain active until tuition reaches 95% paid.',
                            ]
                          )}
                        </td>
                        <td>
                          <select
                            value={paymentMethodValue}
                            onChange={(event) => updateAccountingDraft(row, { paymentMethod: event.target.value })}
                            disabled={updatingAccountingKey === key}
                          >
                            <option value="">Select</option>
                            {accountingPaymentMethods.map((method) => (
                              <option key={`method-${method}`} value={method}>
                                {method.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="adminActions">
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => updateAccountingDraft(row, { archived: !archivedValue })}
                              disabled={updatingAccountingKey === key}
                            >
                              {archivedValue ? 'Keep Active' : 'Archive'}
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => saveAccountingDraft(row)}
                              disabled={updatingAccountingKey === key || !hasPendingAccountingChanges}
                            >
                              Save Row
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingEditor(row)}
                              disabled={updatingAccountingKey === key}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingInvoicePreview(row)}
                              disabled={sendingInvoiceKey === key}
                            >
                              View Invoice
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingInvoiceSendDialog(row)}
                              disabled={sendingInvoiceKey === key}
                            >
                              {sendingInvoiceKey === key ? 'Sending...' : 'Send Invoice'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Archived Rows</h3>
            <p className="subhead">Completed or filed camper rows kept separate from the active table.</p>
          </div>
          <div className="tuitionTableWrap">
            <table className="tuitionTable">
              <thead>
                <tr>
                  <th>Family / Submission</th>
                  <th>Camper</th>
                  <th>Weeks</th>
                  <th>Lunch Days</th>
                  <th>Tuition</th>
                  <th>Lunch</th>
                  <th>Manual Discount</th>
                  <th>Paid Tuition</th>
                  <th>Paid Lunch</th>
                  <th>Total Owed</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedAccountingRows.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="accountingEmptyCell">
                      No archived camper rows yet.
                    </td>
                  </tr>
                ) : (
                  archivedAccountingRows.map((row) => {
                    const key = `${row.registrationId}-${row.camperIndex}`
                    return (
                      <tr key={`archived-accounting-row-${key}`}>
                        <td>
                          <strong>{row.parentName}</strong>
                          {row.r5SentUnpaid ? <div className="accountingAlertText">R5 sent, not paid</div> : null}
                          <div>{row.parentEmail || '-'}</div>
                          <div>{formatAdminDateTime(row.createdAt)}</div>
                        </td>
                        <td>
                          <strong>{row.camperName}</strong>
                          <div>Sibling discount: {row.siblingDiscountPct}%</div>
                        </td>
                        <td>
                          <div className="accountingDetailStack">
                            {row.weeksCount > 0
                              ? renderAccountingDetailChip(
                                  `${key}-archived-weeks`,
                                  'Weeks',
                                  row.weekOverlayLines,
                                  row.weeksCount
                                )
                              : null}
                            {row.weeksCount === 0 ? <span>-</span> : null}
                          </div>
                        </td>
                        <td>
                          {row.lunchDaysCount > 0
                            ? renderAccountingDetailChip(
                                `${key}-archived-lunch`,
                                'Lunch Days',
                                row.lunchDays,
                                row.lunchDaysCount
                              )
                            : '-'}
                        </td>
                        <td>
                          {renderAccountingDetailChip(
                            `${key}-archived-tuition-breakdown`,
                            money(row.tuitionAfterManualDiscount),
                            [
                              `Tuition before manual discount: ${money(row.tuitionBeforeManualDiscount)}`,
                              ...(row.weekTierPromoLines || []).map((item) => `${item.label}: -${money(item.amount)}`),
                              row.siblingDiscountAmount > 0
                                ? `Sibling discount (${row.siblingDiscountPct}%): -${money(row.siblingDiscountAmount)}`
                                : 'Sibling discount: -$0.00',
                              row.manualDiscount > 0
                                ? `Manual discount on tuition: -${money(row.manualDiscount)}`
                                : 'Manual discount on tuition: -$0.00',
                              `Tuition due after discounts: ${money(row.tuitionAfterManualDiscount)}`,
                            ]
                          )}
                        </td>
                        <td>{money(row.lunchCost)}</td>
                        <td>
                          {money(row.manualDiscount)}
                        </td>
                        <td>{money(row.tuitionPaidAmount)}</td>
                        <td>{money(row.lunchPaidAmount)}</td>
                        <td>
                          {renderAccountingDetailChip(
                            `${key}-archived-total-breakdown`,
                            money(row.owedAmount),
                            [
                              ...row.totalBreakdownLines,
                              `Paid tuition: ${money(row.tuitionPaidAmount)}`,
                              `Paid lunch: ${money(row.lunchPaidAmount)}`,
                              `Total paid: ${money(row.paidAmount)}`,
                              `Tuition owed: ${money(row.tuitionOwedAmount)}`,
                              `Lunch owed: ${money(row.lunchOwedAmount)}`,
                              `Total owed: ${money(row.owedAmount)}`,
                            ]
                          )}
                        </td>
                        <td>{row.paymentMethod ? row.paymentMethod.toUpperCase() : '-'}</td>
                        <td>
                          <div className="adminActions">
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => updateAccountingEntryField(row, { archived: false })}
                              disabled={updatingAccountingKey === key}
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingEditor(row)}
                              disabled={updatingAccountingKey === key}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingInvoicePreview(row)}
                              disabled={sendingInvoiceKey === key}
                            >
                              View Invoice
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => openAccountingInvoiceSendDialog(row)}
                              disabled={sendingInvoiceKey === key}
                            >
                              {sendingInvoiceKey === key ? 'Sending...' : 'Send Invoice'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {accountingOverlay.key ? (
          <div
            className="accountingOverlayWrap"
            onClick={() => setAccountingOverlay({ key: '', label: '', items: [], top: 0, left: 0, pointerLeft: 24 })}
          >
            <div
              className="accountingOverlayBox"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="false"
              aria-label={accountingOverlay.label || 'Accounting details'}
              style={{
                top: `${accountingOverlay.top}px`,
                left: `${accountingOverlay.left}px`,
              }}
            >
              <span
                className="accountingOverlayPointer"
                style={{ left: `${accountingOverlay.pointerLeft}px` }}
                aria-hidden="true"
              />
              <div className="accountingOverlayHeader">
                <strong>{accountingOverlay.label}</strong>
                <button
                  type="button"
                  className="accountingOverlayClose"
                  onClick={() => setAccountingOverlay({ key: '', label: '', items: [], top: 0, left: 0, pointerLeft: 24 })}
                  aria-label="Close accounting details"
                >
                  Close
                </button>
              </div>
              <div className="accountingOverlayList">
                {accountingOverlay.items.map((item, index) => (
                  <span key={`${accountingOverlay.key}-${index}`} className="accountingOverlayItem">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {invoicePreviewState.open ? (
          <div
            className="summaryOverlayBackdrop"
            onClick={() => setInvoicePreviewState({ open: false, title: '', html: '' })}
          >
            <div
              className="summaryOverlayPanel"
              role="dialog"
              aria-modal="true"
              aria-label={invoicePreviewState.title || 'Invoice preview'}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="summaryOverlayBar">
                <strong>{invoicePreviewState.title || 'Invoice Preview'}</strong>
                <div className="summaryOverlayActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setInvoicePreviewState({ open: false, title: '', html: '' })}
                  >
                    Close
                  </button>
                </div>
              </div>
              <iframe title={invoicePreviewState.title || 'Invoice preview'} srcDoc={invoicePreviewState.html} />
            </div>
          </div>
        ) : null}
        {invoiceSendDialog.open && invoiceSendDialog.row ? (
          <div
            className="summaryOverlayBackdrop"
            onClick={() => setInvoiceSendDialog({ open: false, row: null, sendAdminCopy: true })}
          >
            <div
              className="paymentOptionsOverlayPanel"
              role="dialog"
              aria-modal="true"
              aria-label="Send invoice confirmation"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="paymentOptionsOverlayHeader">
                <strong>Send Invoice</strong>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setInvoiceSendDialog({ open: false, row: null, sendAdminCopy: true })}
                >
                  Close
                </button>
              </div>
              <div className="paymentOptionCard">
                <strong>
                  Send this invoice to <span>{invoiceSendDialog.row.parentEmail}</span>?
                </strong>
                <p className="subhead">
                  Camper: <strong>{invoiceSendDialog.row.camperName}</strong>
                </p>
                <label className="lunchConfirmNoneRow">
                  <input
                    type="checkbox"
                    checked={invoiceSendDialog.sendAdminCopy}
                    onChange={(event) =>
                      setInvoiceSendDialog((current) => ({ ...current, sendAdminCopy: event.target.checked }))
                    }
                  />
                  <span>Send copy to admin ({ACCOUNTING_ADMIN_COPY_EMAIL})</span>
                </label>
                <div className="adminActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setInvoiceSendDialog({ open: false, row: null, sendAdminCopy: true })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      sendAccountingInvoice(invoiceSendDialog.row, {
                        sendAdminCopy: invoiceSendDialog.sendAdminCopy,
                      })
                    }
                    disabled={sendingInvoiceKey === `${invoiceSendDialog.row.registrationId}-${invoiceSendDialog.row.camperIndex}`}
                  >
                    {sendingInvoiceKey === `${invoiceSendDialog.row.registrationId}-${invoiceSendDialog.row.camperIndex}`
                      ? 'Sending...'
                      : 'Yes, Send Invoice'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {accountingEditState.open && accountingEditState.row && accountingEditStudent ? (
          <div
            className="summaryOverlayBackdrop"
            onClick={() =>
              setAccountingEditState({
                open: false,
                row: null,
                sourceRecordId: 0,
                registration: null,
                expandedWeekKey: '',
                expandedLunchWeekKey: '',
              })
            }
          >
            <div
              className="summaryOverlayPanel"
              role="dialog"
              aria-modal="true"
              aria-label="Edit registration selections"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="summaryOverlayBar">
                <strong>Edit Registration: {accountingEditState.row.camperName}</strong>
                <div className="summaryOverlayActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setAccountingEditState({
                        open: false,
                        row: null,
                        sourceRecordId: 0,
                        registration: null,
                        expandedWeekKey: '',
                        expandedLunchWeekKey: '',
                      })
                    }
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={saveAccountingEditor}
                    disabled={updatingAccountingKey === `${accountingEditState.row.registrationId}-${accountingEditState.row.camperIndex}`}
                  >
                    {updatingAccountingKey === `${accountingEditState.row.registrationId}-${accountingEditState.row.camperIndex}`
                      ? 'Saving...'
                      : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div style={{ overflow: 'auto', padding: '1rem' }}>
                <p className="subhead">
                  Editing saved registration selections for <strong>{accountingEditStudent.fullName || accountingEditState.row.camperName}</strong>.
                  Current choices are preloaded, and you can add or remove weeks and lunch days before saving.
                </p>
                <div className="weekCardList">
                  {accountingEditRegistrationWeeks.map((week, weekIndex) => {
                    const entry = accountingEditStudent.schedule?.[week.id]
                    const weekSelectionSummary = getWeekSelectionSummary(entry, week)
                    const weekDayKeys = Array.isArray(week.days) ? week.days.map((item) => item.key) : accountingEditorDayKeys
                    const weekIsFull = weekDayKeys.every((day) => (entry?.days?.[day] || 'NONE') === 'FULL')
                    const selectedCampType = entry?.campType || ''
                    const panelKey = `${accountingEditState.row.key}:${week.id}`
                    const expanded = accountingEditState.expandedWeekKey === panelKey
                    const hasSelection = Object.values(entry?.days || {}).some((mode) => mode && mode !== 'NONE')

                    return (
                      <article key={`accounting-edit-week-${week.id}`} className="weekCard">
                        <button
                          type="button"
                          className={`weekHead ${expanded ? 'selected' : ''} ${hasSelection ? 'hasSelection' : 'empty'}`}
                          onClick={() =>
                            setAccountingEditState((current) => ({
                              ...current,
                              expandedWeekKey: current.expandedWeekKey === panelKey ? '' : panelKey,
                            }))
                          }
                        >
                          <span className="weekHeadText">
                            <strong>
                              Week {weekIndex + 1}: {week.programLabel}
                            </strong>
                            <span>{formatWeekLabel(week)}</span>
                            {weekSelectionSummary ? <span className="weekStatusChip">{weekSelectionSummary}</span> : null}
                            <span className={`weekSelectionStateChip ${hasSelection ? 'selected' : 'empty'}`}>
                              {hasSelection ? 'Registered' : 'Not selected yet'}
                            </span>
                          </span>
                        </button>
                        {expanded ? (
                          <div className="weekBody">
                            <div className="campTypeRow">
                              {week.availableCampTypes?.includes('general') ? (
                                <button
                                  type="button"
                                  className={`campTypeChip general ${selectedCampType === 'general' ? 'selected' : ''}`}
                                  onClick={() => setAccountingEditorCampType(week, 'general')}
                                >
                                  General Camp
                                </button>
                              ) : null}
                              {week.availableCampTypes?.includes('bootcamp') ? (
                                <button
                                  type="button"
                                  className={`campTypeChip bootcamp ${selectedCampType === 'bootcamp' ? 'selected' : ''}`}
                                  onClick={() => setAccountingEditorCampType(week, 'bootcamp')}
                                >
                                  Competition Boot Camp
                                </button>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className={`modeChip ${weekIsFull ? 'active full' : ''}`}
                              onClick={() => toggleAccountingEditorFullWeek(week)}
                            >
                              Choose Full Week
                            </button>
                            <div className="chipRow">
                              {accountingEditorDayKeys.map((day) => {
                                const mode = entry?.days?.[day] || 'NONE'
                                return (
                                  <button
                                    key={`accounting-edit-day-${week.id}-${day}`}
                                    type="button"
                                    className={`modeChip ${mode !== 'NONE' ? `active ${mode.toLowerCase()}` : ''}`}
                                    onClick={() => cycleAccountingEditorDay(week, day)}
                                    disabled={!selectedCampType}
                                  >
                                    {mode === 'NONE' ? day : `${day} ${mode === 'FULL' ? 'FULL DAY' : mode}`}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
                <h3>Lunch Days</h3>
                <div className="weekCardList">
                  {accountingEditLunchWeeks.length === 0 ? (
                    <p className="subhead">No registered camp days yet for this camper.</p>
                  ) : (
                    accountingEditLunchWeeks.map((row, weekIndex) => {
                      const panelKey = `${accountingEditState.row.key}:lunch:${row.weekId}`
                      const expanded = accountingEditState.expandedLunchWeekKey === panelKey
                      const weekIncludedLunchDays = row.selectedDays.filter((day) => isIncludedLunchDay(day.dayKey)).length
                      const weekPaidLunchDays = row.selectedDays.filter(
                        (day) => !isIncludedLunchDay(day.dayKey) && Boolean(accountingEditStudent.lunch?.[day.key])
                      ).length
                      const weekRegisteredDays = row.selectedDays.length
                      const weekProvidedLunchDays = weekIncludedLunchDays + weekPaidLunchDays
                      const weekPackDays = Math.max(0, weekRegisteredDays - weekProvidedLunchDays)
                      return (
                        <article key={`accounting-edit-lunch-${row.weekId}`} className="weekCard">
                          <button
                            type="button"
                            className={`weekHead ${expanded ? 'selected' : ''} ${weekPaidLunchDays > 0 ? 'lunchSelected' : 'needsAttention'}`}
                            onClick={() =>
                              setAccountingEditState((current) => ({
                                ...current,
                                expandedLunchWeekKey: current.expandedLunchWeekKey === panelKey ? '' : panelKey,
                              }))
                            }
                          >
                            <span className="weekHeadText">
                              <strong>
                                Week {weekIndex + 1}: {row.week.programLabel}
                              </strong>
                              <span>{formatWeekLabel(row.week)}</span>
                              <span className="weekLunchSummaryLine">
                                {`Lunch provided ${weekProvidedLunchDays}/${weekRegisteredDays} days (paid ${weekPaidLunchDays}, Thu included ${weekIncludedLunchDays}) · Pack lunch needed ${weekPackDays} days`}
                              </span>
                            </span>
                          </button>
                          {expanded ? (
                            <div className="weekBody">
                              <div className="chipRow">
                                {row.selectedDays.map((day) => {
                                  const isIncluded = isIncludedLunchDay(day.dayKey)
                                  const hasLunch = Boolean(accountingEditStudent.lunch?.[day.key])
                                  return (
                                    <button
                                      key={`accounting-edit-lunch-chip-${day.key}`}
                                      type="button"
                                      className={`modeChip lunchChip ${isIncluded ? 'full' : hasLunch ? 'yes' : 'no'}`}
                                      onClick={() => toggleAccountingEditorLunch(row.weekId, day.dayKey)}
                                    >
                                      {isIncluded ? `${day.dayKey} BBQ INCLUDED` : `${day.dayKey} Lunch ${hasLunch ? 'YES' : 'NO'}`}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
      ) : null}

      {activeAdminTab === 'overnight-accounting' ? (
      <section className="card section">
        <h2>Overnight Accounting</h2>
        <p className="subhead">
          Overnight camp uses its own registration/payment workflow. Tuition covers lodging and food only; outings are billed separately.
        </p>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Active Overnight Rows</h3>
            <p className="subhead">Track payment status and adjust registered weeks for overnight campers.</p>
          </div>
          <div className="tuitionTableWrap">
            <table className="tuitionTable">
              <thead>
                <tr>
                  <th>Family / Submission</th>
                  <th>Camper</th>
                  <th>Weeks</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Owed</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeOvernightAccountingRows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="accountingEmptyCell">
                      No overnight registrations yet.
                    </td>
                  </tr>
                ) : (
                  activeOvernightAccountingRows.map((row) => {
                    const key = `${row.registrationId}-${row.camperIndex}`
                    return (
                      <tr key={`overnight-accounting-row-${key}`}>
                        <td>
                          <strong>{row.parentName}</strong>
                          <div>{row.parentEmail || '-'}</div>
                          <div>{formatAdminDateTime(row.createdAt)}</div>
                        </td>
                        <td>
                          <strong>{row.camperName}</strong>
                          <div>No sibling discount</div>
                        </td>
                        <td>
                          <div className="overnightWeekCheckboxes">
                            {weekOptions.overnight.map((week) => {
                              const checked = row.selectedWeekIds.includes(week.id)
                              return (
                                <label key={`overnight-accounting-week-${key}-${week.id}`} className="overnightWeekCheckbox">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const nextWeekIds = event.target.checked
                                        ? [...row.selectedWeekIds, week.id]
                                        : row.selectedWeekIds.filter((item) => item !== week.id)
                                      updateOvernightWeeks(row, nextWeekIds)
                                    }}
                                    disabled={updatingAccountingKey === key}
                                  />
                                  <span>{formatWeekLabel(week)}</span>
                                </label>
                              )
                            })}
                          </div>
                        </td>
                        <td>{renderAccountingDetailChip(`${key}-overnight-total-breakdown`, money(row.totalAfterManualDiscount), row.totalBreakdownLines)}</td>
                        <td>
                          <div className="accountingPaidCell">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={String(row.paidAmount ?? '')}
                              onChange={(event) => {
                                const sanitized = String(event.target.value || '').replace(/[^\d.]/g, '')
                                updateAccountingEntryField(row, {
                                  paid_amount: Number(sanitized || 0),
                                })
                              }}
                              disabled={updatingAccountingKey === key}
                            />
                            <button
                              type="button"
                              className="accountingQuickFillBtn"
                              onClick={() =>
                                updateAccountingEntryField(row, {
                                  paid_amount: Number(row.totalAfterManualDiscount || 0),
                                })
                              }
                              disabled={updatingAccountingKey === key || Number(row.owedAmount || 0) <= 0}
                            >
                              Use Owed
                            </button>
                          </div>
                        </td>
                        <td>{money(row.owedAmount)}</td>
                        <td>
                          <select
                            value={row.paymentMethod}
                            onChange={(event) =>
                              updateAccountingEntryField(row, { payment_method: event.target.value })
                            }
                            disabled={updatingAccountingKey === key}
                          >
                            <option value="">Select</option>
                            {accountingPaymentMethods.map((method) => (
                              <option key={`overnight-method-${method}`} value={method}>
                                {method.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="adminActions">
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => updateAccountingEntryField(row, { archived: true })}
                              disabled={updatingAccountingKey === key}
                            >
                              Archive
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => sendAccountingInvoice(row)}
                              disabled={sendingInvoiceKey === key}
                            >
                              {sendingInvoiceKey === key ? 'Sending...' : 'Send Invoice'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Weekly Rosters</h3>
            <p className="subhead">Shows all overnight campers with registered weeks, with balance due visible on each row.</p>
          </div>
          <div className="rosterEmbeddedCardWrap">
            {renderRosterProgramCard('overnight')}
          </div>
        </div>
        <div className="accountingTableSection">
          <div className="accountingSectionHeader">
            <h3>Archived Overnight Rows</h3>
            <p className="subhead">Completed or filed overnight rows.</p>
          </div>
          <div className="tuitionTableWrap">
            <table className="tuitionTable">
              <thead>
                <tr>
                  <th>Family / Submission</th>
                  <th>Camper</th>
                  <th>Weeks</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Owed</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedOvernightAccountingRows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="accountingEmptyCell">No archived overnight rows yet.</td>
                  </tr>
                ) : (
                  archivedOvernightAccountingRows.map((row) => (
                    <tr key={`overnight-archived-row-${row.key}`}>
                      <td><strong>{row.parentName}</strong><div>{row.parentEmail || '-'}</div><div>{formatAdminDateTime(row.createdAt)}</div></td>
                      <td><strong>{row.camperName}</strong></td>
                      <td>{row.weeksCount > 0 ? renderAccountingDetailChip(`${row.key}-overnight-archived-weeks`, 'Weeks', row.weekOverlayLines, row.weeksCount) : '-'}</td>
                      <td>{money(row.totalAfterManualDiscount)}</td>
                      <td>{money(row.paidAmount)}</td>
                      <td>{money(row.owedAmount)}</td>
                      <td>{row.paymentMethod ? row.paymentMethod.toUpperCase() : '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => updateAccountingEntryField(row, { archived: false })}
                          disabled={updatingAccountingKey === `${row.registrationId}-${row.camperIndex}`}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      ) : null}

      {activeAdminTab === 'leads' ? (
      <section className="card section">
        <h2>Survey Leads</h2>
        <p className="subhead">Families who submitted email in the survey flow, including partial completions.</p>
        <div className="adminActions">
          <button type="button" className="button secondary" onClick={refreshLeadProfiles} disabled={loadingLeads}>
            {loadingLeads ? 'Refreshing...' : 'Refresh leads'}
          </button>
          <span>Total leads: {leadProfiles.length}</span>
        </div>
        {leadProfiles.length === 0 ? (
          <p className="subhead">No leads yet.</p>
        ) : (
          <div className="tuitionTableWrap">
            <table className="tuitionTable">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Campers</th>
                  <th>Ages</th>
                  <th>Source</th>
                  <th>Last Step</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leadProfiles.map((lead) => (
                  <tr key={`lead-${lead.id}`}>
                    <td>{lead.email}</td>
                    <td>{lead.camper_count || '-'}</td>
                    <td>{Array.isArray(lead.camper_ages) && lead.camper_ages.length > 0 ? lead.camper_ages.join(', ') : '-'}</td>
                    <td>{lead.source || '-'}</td>
                    <td>{lead.last_completed_step || '-'}</td>
                    <td>{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      ) : null}

      {activeAdminTab === 'testimonials' ? (
      <section className="card section">
        <h2>Testimonials</h2>
        <p className="subhead">Manage student stories shown on the testimonials page.</p>
        <div className="adminActions">
          <button type="button" className="button secondary" onClick={addTestimonial}>
            Add testimonial
          </button>
          <a className="ghostBtn" href="/testimonials" target="_blank" rel="noreferrer">
            Preview testimonials page
          </a>
        </div>
        <div className="journeyGrid">
          {config.testimonials.length === 0 ? (
            <p className="subhead">No testimonials yet.</p>
          ) : (
            config.testimonials.map((item, index) => (
              <article key={`testimonial-${index}`} className="journeyCard">
                <div className="adminActions">
                  <p className="journeyDay">Story {index + 1}</p>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => removeTestimonial(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="adminGrid">
                  <label>
                    Student name
                    <input
                      value={item.studentName || ''}
                      onChange={(event) => updateTestimonial(index, 'studentName', event.target.value)}
                      placeholder="Ethan, age 9"
                    />
                  </label>
                  <label>
                    Headline
                    <input
                      value={item.headline || ''}
                      onChange={(event) => updateTestimonial(index, 'headline', event.target.value)}
                      placeholder="From shy beginner to confident performer"
                    />
                  </label>
                  <label className="full">
                    Story
                    <textarea
                      rows="4"
                      value={item.story || ''}
                      onChange={(event) => updateTestimonial(index, 'story', event.target.value)}
                    />
                  </label>
                  <label className="full">
                    Outcome
                    <textarea
                      rows="2"
                      value={item.outcome || ''}
                      onChange={(event) => updateTestimonial(index, 'outcome', event.target.value)}
                    />
                  </label>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      ) : null}

      {activeAdminTab === 'tracking' ? (
      <section className="card section">
        <h2>Email Tracking</h2>
        <p className="subhead">
          Track who has been sent emails, delivery activity, and incoming replies.
        </p>
        <p className="subhead">
          Use <strong>Mark Paid</strong> to stop 72-hour unpaid reminders and activate paid-family follow-up emails after payment, plus pre-camp emails at 7 days, 5 days, 3 days, and 1 day before camp.
        </p>
        <p className="subhead">
          Paid-family follow-up emails now anchor from the paid date, while pre-camp emails still anchor from each enrolled camp week.
        </p>
        <p className="subhead">
          Use <strong>Send Due Journey Emails Now</strong> to manually send any due lead-nurture or reservation emails. The processor checks threshold timing and only sends steps that are due and not already sent.
        </p>
        <div className="adminActions">
          <button
            type="button"
            className="button"
            onClick={processDueJourneyEmails}
            disabled={processingJourneyEmails}
          >
            {processingJourneyEmails ? 'Processing all due emails...' : 'Send All Due Journey Emails Now'}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={repairMissingReservationRunsFromAdmin}
            disabled={repairingReservationRuns}
          >
            {repairingReservationRuns ? 'Repairing missing runs...' : 'Repair Missing Registration Runs'}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={refreshEmailTracking}
            disabled={loadingEmailTracking}
          >
            {loadingEmailTracking ? 'Refreshing...' : 'Refresh tracking'}
          </button>
          <span>
            Due emails: <strong className="trackerDueCountBadge">{trackingDueSummary.total}</strong>
          </span>
          <span>
            Leads: <strong className="trackerDueCountBadge">{trackingDueSummary.lead}</strong>
          </span>
          <span>
            Registered: <strong className="trackerDueCountBadge">{trackingDueSummary.reservation}</strong>
          </span>
          <span>
            Upcoming 24h: <strong className="trackerUpcomingCountBadge">{trackingDueSummary.upcoming}</strong>
          </span>
          <label>
            Filter replies by email
            <select value={replyFilterEmail} onChange={(event) => setReplyFilterEmail(event.target.value)}>
              <option value="">All emails</option>
              {Array.from(new Set(emailReplies.map((item) => item.email || item.from_email).filter(Boolean))).map(
                (email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                )
              )}
            </select>
          </label>
          <span>Unread replies: {emailReplies.filter((item) => item.is_unread).length}</span>
        </div>
        <div className="adminSubTabs trackingSubTabs" role="tablist" aria-label="Tracking sections">
          <button
            type="button"
            className={`adminSubTabBtn ${activeTrackingSubtab === 'lead' ? 'active' : ''}`}
            onClick={() => setActiveTrackingSubtab('lead')}
          >
            Lead ({trackingDueSummary.lead} due)
          </button>
          <button
            type="button"
            className={`adminSubTabBtn ${activeTrackingSubtab === 'registration' ? 'active' : ''}`}
            onClick={() => {
              setActiveTrackingSubtab('registration')
              setActiveReservationTrackerView((current) => (current === 'overnight' ? 'standard' : current))
            }}
          >
            Registration ({standardReservationDueCount} due)
          </button>
          <button
            type="button"
            className={`adminSubTabBtn ${activeTrackingSubtab === 'overnight' ? 'active' : ''}`}
            onClick={() => {
              setActiveTrackingSubtab('overnight')
              setActiveReservationTrackerView('overnight')
            }}
          >
            Overnight ({overnightReservationDueCount} due)
          </button>
          <button
            type="button"
            className={`adminSubTabBtn ${activeTrackingSubtab === 'replies' ? 'active' : ''}`}
            onClick={() => setActiveTrackingSubtab('replies')}
          >
            Replies ({filteredEmailReplies.length})
          </button>
          <button
            type="button"
            className={`adminSubTabBtn ${activeTrackingSubtab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTrackingSubtab('events')}
          >
            Events ({filteredEmailEvents.length})
          </button>
        </div>

        <div className="trackingStack">
          {activeTrackingSubtab === 'lead' ? (
          <article className="previewCard trackerCard">
            <h3>Lead Journey Tracker</h3>
            <p className="subhead">Top table: survey and partial-registration leads who should receive the nurture sequence.</p>
            {leadJourneyTrackerRows.length === 0 ? (
              <p className="subhead">No lead journeys yet.</p>
            ) : (
              <div className="tuitionTableWrap trackerTableWrap">
                <table className="tuitionTable trackerTable trackerTableCompact">
                  <thead>
                    <tr>
                      <th className="trackerMetaCol trackerActionCol">Action</th>
                      <th className="trackerMetaCol trackerEmailCol">Email</th>
                      <th className="trackerMetaCol">Source</th>
                      <th className="trackerMetaCol trackerRunCol">Run</th>
                      <th className="trackerMetaCol trackerCriteriaColHeader">Criteria</th>
                      {leadTrackerColumns.map((column) => (
                        <th key={column.key} title={column.description} className="trackerStepHeader">
                          <span>
                            {column.label}
                            {leadDueCounts[column.key] > 0 ? (
                              <em className="trackerDueCountBadge">{leadDueCounts[column.key]}</em>
                            ) : null}
                            {leadUpcomingCounts[column.key] > 0 ? (
                              <em className="trackerUpcomingCountBadge">{leadUpcomingCounts[column.key]}</em>
                            ) : null}
                          </span>
                          <small>{column.timingLabel}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leadJourneyTrackerRows.map((row) => (
                      <tr key={`lead-track-${row.email}`}>
                        <td className="trackerActionCol">
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => openJourneyCalendar({ flow: 'lead', row })}
                          >
                            View Calendar
                          </button>
                        </td>
                        <td className="trackerEmailCol">{row.email}</td>
                        <td>{row.source || '-'}</td>
                        <td className="trackerRunCol">{getLeadRunDisplayLabel(row)}</td>
                        <td className="trackerCriteriaCell">
                          {row.criteria?.map((line) => (
                            <div key={`${row.email}-${line}`}>{line}</div>
                          ))}
                        </td>
                        {leadTrackerColumns.map((column) => {
                          const timingState = getLeadTrackerTimingState(row, column)
                          return (
                            <td key={`${row.email}-${column.key}`} className="trackerStepCell">
                              <div className="trackerCellActions">
                                {timingState ? (
                                  <span
                                    className={`trackerCellDot trackerCellDot-${timingState}`}
                                    title={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                    aria-label={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                  />
                                ) : null}
                                <span
                                  className={`trackerBadge ${row.steps[column.key]?.status || 'pending'}`}
                                  title={row.steps[column.key]?.at ? new Date(row.steps[column.key].at).toLocaleString() : ''}
                                >
                                  {getTrackerCellLabel(row.steps[column.key])}
                                </span>
                                {row.steps[column.key]?.at ? (
                                  <small className="trackerCellTimestamp">{formatTrackerCellTimestamp(row.steps[column.key].at)}</small>
                                ) : null}
                                {row.steps[column.key]?.note ? (
                                  <small className="trackerCellNote">{row.steps[column.key].note}</small>
                                ) : null}
                                <button
                                  type="button"
                                  className="trackerCellSendBtn"
                                  onClick={() => previewJourneyCell({ flow: 'lead', row, column })}
                                  disabled={previewingJourneyCellKey === `lead-${row.runId || row.email}-${column.key}`}
                                >
                                  {previewingJourneyCellKey === `lead-${row.runId || row.email}-${column.key}` ? 'Loading...' : 'View Email'}
                                </button>
                                <button
                                  type="button"
                                  className="trackerCellSendBtn"
                                  onClick={() => manuallySendJourneyCell({ flow: 'lead', row, column })}
                                  disabled={row.isRegistered || sendingJourneyCellKey === `lead-${row.runId || row.email}-${column.key}`}
                                >
                                  {row.isRegistered
                                    ? 'Blocked'
                                    : sendingJourneyCellKey === `lead-${row.runId || row.email}-${column.key}`
                                      ? 'Sending...'
                                      : 'Send'}
                                </button>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
          ) : null}

          {activeTrackingSubtab === 'registration' ? (
          <article className="previewCard trackerCard">
            <h3>Registered Journey Tracker</h3>
            <p className="subhead">
              Families who submitted registration and their reminder or paid-prep sequence.
            </p>
            <div className="adminSubTabs">
              <button
                type="button"
                className={`adminSubTabBtn ${activeReservationTrackerView === 'standard' ? 'active' : ''}`}
                onClick={() => setActiveReservationTrackerView('standard')}
              >
                Submitted Registration 72h ({standardReservationJourneyTrackerRows.length})
              </button>
              <button
                type="button"
                className={`adminSubTabBtn ${activeReservationTrackerView === 'tests' ? 'active' : ''}`}
                onClick={() => setActiveReservationTrackerView('tests')}
              >
                Test Runs ({testReservationJourneyTrackerRows.length})
              </button>
              <button
                type="button"
                className={`adminSubTabBtn ${activeReservationTrackerView === 'hidden' ? 'active' : ''}`}
                onClick={() => setActiveReservationTrackerView('hidden')}
              >
                Hidden ({hiddenReservationJourneyTrackerRows.length})
              </button>
            </div>
            {activeReservationJourneyTrackerRows.length === 0 ? (
              <p className="subhead">
                {activeReservationTrackerView === 'tests'
                    ? 'No test reservation runs yet.'
                    : activeReservationTrackerView === 'hidden'
                      ? 'No hidden reservation rows.'
                    : 'No registered-family journeys yet.'}
              </p>
            ) : (
              <div className="tuitionTableWrap trackerTableWrap">
                <table className="tuitionTable trackerTable trackerTableCompact">
                  <thead>
                    <tr>
                      <th className="trackerMetaCol trackerActionCol">Action</th>
                      <th className="trackerMetaCol trackerEmailCol">Email</th>
                      <th className="trackerMetaCol trackerRunCol">Run</th>
                      <th className="trackerMetaCol trackerCriteriaColHeader">Criteria</th>
                      {reservationTrackerColumns.map((column) => (
                        <th key={column.key} title={column.description} className="trackerStepHeader">
                          <span>
                            {column.label}
                            {reservationDueCounts[column.key] > 0 ? (
                              <em className="trackerDueCountBadge">{reservationDueCounts[column.key]}</em>
                            ) : null}
                            {reservationUpcomingCounts[column.key] > 0 ? (
                              <em className="trackerUpcomingCountBadge">{reservationUpcomingCounts[column.key]}</em>
                            ) : null}
                          </span>
                          <small>{column.timingLabel}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeReservationJourneyTrackerRows.map((row) => {
                      const run = emailJourneyRuns.find((item) => Number(item?.id) === Number(row.runId))
                      const availableRuns = availableReservationRunsByRowKey[row.key] || []
                      const selectedRunId = selectedRunAssignmentByRow[row.key] || ''
                      const isAssigningThisRow = assigningRunKey === row.key
                      const criteriaState = getReservationCriteriaState(row)
                      const isUpdatingVisibility = settingTrackerVisibilityKey === row.key
                      const isDebugOpen = expandedReservationDebugKey === row.key
                      return [
                        <tr key={`reservation-track-${row.key}`}>
                          <td className="trackerActionCol">
                            <div className="trackerActionStack">
                              {row.runId && run ? (
                                run.status === 'paid' ? (
                                  <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => updateReservationRunPaymentStatus(run, false)}
                                    disabled={updatingRunId === run.id}
                                  >
                                    {updatingRunId === run.id ? 'Updating...' : 'Mark Unpaid'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => updateReservationRunPaymentStatus(run, true)}
                                    disabled={updatingRunId === run.id}
                                  >
                                    {updatingRunId === run.id ? 'Updating...' : 'Mark Paid'}
                                  </button>
                                )
                              ) : availableRuns.length > 0 ? (
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => attachExistingRunToRegistration(row)}
                                  disabled={isAssigningThisRow || !selectedRunId}
                                >
                                  {isAssigningThisRow ? 'Attaching...' : 'Attach Run'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => assignRunForEmail(row.email)}
                                  disabled={assigningRunEmail === row.email}
                                >
                                  {assigningRunEmail === row.email ? 'Assigning...' : 'Create Run'}
                                </button>
                              )}
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => setTrackerRowVisibility(row, !row.hidden)}
                                disabled={isUpdatingVisibility}
                              >
                                {isUpdatingVisibility ? 'Updating...' : row.hidden ? 'Unhide' : 'Hide'}
                              </button>
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => setExpandedReservationDebugKey((current) => (current === row.key ? '' : row.key))}
                              >
                                {isDebugOpen ? 'Hide Debug' : 'Debug'}
                              </button>
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => openJourneyCalendar({ flow: 'reservation', row })}
                              >
                                View Calendar
                              </button>
                            </div>
                          </td>
                          <td className="trackerEmailCol">{row.email}</td>
                          <td className="trackerRunCol">
                            {row.runId ? (
                              row.status || '-'
                            ) : availableRuns.length > 0 ? (
                              <select
                                value={selectedRunId}
                                onChange={(event) =>
                                  setSelectedRunAssignmentByRow((current) => ({
                                    ...current,
                                    [row.key]: event.target.value,
                                  }))
                                }
                              >
                                <option value="">Select run</option>
                                {availableRuns.map((option) => (
                                  <option key={`assign-run-${row.key}-${option.id}`} value={option.id}>
                                    #{option.id} · {normalizeAdminEmail(option.email) || 'no email'} · {option.status || 'active'} ·{' '}
                                    {formatTrackerDateTime(option.created_at) || option.created_at || 'unknown time'}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className={`trackerCriteriaCell ${criteriaState ? `trackerCriteriaCell-${criteriaState}` : ''}`}>
                            {row.criteria?.map((line) => (
                              <div key={`${row.key}-${line}`}>{line}</div>
                            ))}
                          </td>
                          {reservationTrackerColumns.map((column) => {
                            const timingState = getReservationTrackerTimingState(row, column)
                            return (
                              <td key={`${row.key}-${column.key}`} className="trackerStepCell">
                                <div className="trackerCellActions">
                                  {timingState ? (
                                    <span
                                      className={`trackerCellDot trackerCellDot-${timingState}`}
                                      title={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                      aria-label={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                    />
                                  ) : null}
                                  <span
                                    className={`trackerBadge ${row.steps[column.key]?.status || 'pending'}`}
                                    title={row.steps[column.key]?.at ? new Date(row.steps[column.key].at).toLocaleString() : ''}
                                  >
                                    {getTrackerCellLabel(row.steps[column.key])}
                                  </span>
                                  {row.steps[column.key]?.at ? (
                                    <small className="trackerCellTimestamp">{formatTrackerCellTimestamp(row.steps[column.key].at)}</small>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="trackerCellSendBtn"
                                    onClick={() => previewJourneyCell({ flow: 'reservation', row, column })}
                                    disabled={!row.runId || previewingJourneyCellKey === `reservation-${row.runId}-${column.key}`}
                                  >
                                    {!row.runId ? 'No run' : previewingJourneyCellKey === `reservation-${row.runId}-${column.key}` ? 'Loading...' : 'View Email'}
                                  </button>
                                  <button
                                    type="button"
                                    className="trackerCellSendBtn"
                                    onClick={() => manuallySendJourneyCell({ flow: 'reservation', row, column })}
                                    disabled={!row.runId || sendingJourneyCellKey === `reservation-${row.runId}-${column.key}`}
                                  >
                                    {!row.runId ? 'No run' : sendingJourneyCellKey === `reservation-${row.runId}-${column.key}` ? 'Sending...' : 'Send'}
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr>,
                        isDebugOpen ? (
                          <tr key={`reservation-track-debug-${row.key}`} className="trackerDebugRow">
                            <td colSpan={4 + reservationTrackerColumns.length}>
                              <div className="trackerDebugPanel">
                                <div><strong>Row key:</strong> {row.key}</div>
                                <div><strong>Registration ID:</strong> {row.registrationId || '-'}</div>
                                <div><strong>Run ID:</strong> {row.runId || '-'}</div>
                                <div><strong>Email:</strong> {row.email || '-'}</div>
                                <div><strong>Status:</strong> {row.status || '-'}</div>
                                <div><strong>Registration type:</strong> {row.registrationType || 'standard'}</div>
                                <div><strong>Submitted:</strong> {formatTrackerDateTime(row.createdAt) || row.createdAt || '-'}</div>
                                <div><strong>Attachment event:</strong> {formatTrackerDateTime(row.attachmentEventAt) || row.attachmentEventAt || '-'}</div>
                                <div><strong>Attachment reason:</strong> {row.attachmentReason || '-'}</div>
                                <div><strong>Hidden in tracker:</strong> {row.hidden ? 'yes' : 'no'}</div>
                              </div>
                            </td>
                          </tr>
                        ) : null,
                      ]
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
          ) : null}

          {activeTrackingSubtab === 'overnight' ? (
          <article className="previewCard trackerCard">
            <h3>Overnight Journey Tracker</h3>
            <p className="subhead">Overnight registration runs and their 72-hour journey status.</p>
            {overnightReservationJourneyTrackerRows.length === 0 ? (
              <p className="subhead">No overnight registration journeys yet.</p>
            ) : (
              <div className="tuitionTableWrap trackerTableWrap">
                <table className="tuitionTable trackerTable trackerTableCompact">
                  <thead>
                    <tr>
                      <th className="trackerMetaCol trackerActionCol">Action</th>
                      <th className="trackerMetaCol trackerEmailCol">Email</th>
                      <th className="trackerMetaCol trackerRunCol">Run</th>
                      <th className="trackerMetaCol trackerCriteriaColHeader">Criteria</th>
                      {reservationTrackerColumns.map((column) => (
                        <th key={column.key} title={column.description} className="trackerStepHeader">
                          <span>
                            {column.label}
                            {reservationDueCounts[column.key] > 0 ? (
                              <em className="trackerDueCountBadge">{reservationDueCounts[column.key]}</em>
                            ) : null}
                            {reservationUpcomingCounts[column.key] > 0 ? (
                              <em className="trackerUpcomingCountBadge">{reservationUpcomingCounts[column.key]}</em>
                            ) : null}
                          </span>
                          <small>{column.timingLabel}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overnightReservationJourneyTrackerRows.map((row) => {
                      const run = emailJourneyRuns.find((item) => Number(item?.id) === Number(row.runId))
                      const availableRuns = availableReservationRunsByRowKey[row.key] || []
                      const selectedRunId = selectedRunAssignmentByRow[row.key] || ''
                      const isAssigningThisRow = assigningRunKey === row.key
                      const criteriaState = getReservationCriteriaState(row)
                      const isUpdatingVisibility = settingTrackerVisibilityKey === row.key
                      const isDebugOpen = expandedReservationDebugKey === row.key
                      return [
                        <tr key={`overnight-track-${row.key}`}>
                          <td className="trackerActionCol">
                            <div className="trackerActionStack">
                              {row.runId && run ? (
                                run.status === 'paid' ? (
                                  <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => updateReservationRunPaymentStatus(run, false)}
                                    disabled={updatingRunId === run.id}
                                  >
                                    {updatingRunId === run.id ? 'Updating...' : 'Mark Unpaid'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => updateReservationRunPaymentStatus(run, true)}
                                    disabled={updatingRunId === run.id}
                                  >
                                    {updatingRunId === run.id ? 'Updating...' : 'Mark Paid'}
                                  </button>
                                )
                              ) : availableRuns.length > 0 ? (
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => attachExistingRunToRegistration(row)}
                                  disabled={isAssigningThisRow || !selectedRunId}
                                >
                                  {isAssigningThisRow ? 'Attaching...' : 'Attach Run'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => assignRunForEmail(row.email)}
                                  disabled={assigningRunEmail === row.email}
                                >
                                  {assigningRunEmail === row.email ? 'Assigning...' : 'Create Run'}
                                </button>
                              )}
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => setTrackerRowVisibility(row, !row.hidden)}
                                disabled={isUpdatingVisibility}
                              >
                                {isUpdatingVisibility ? 'Updating...' : row.hidden ? 'Unhide' : 'Hide'}
                              </button>
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => setExpandedReservationDebugKey((current) => (current === row.key ? '' : row.key))}
                              >
                                {isDebugOpen ? 'Hide Debug' : 'Debug'}
                              </button>
                              <button
                                type="button"
                                className="button secondary"
                                onClick={() => openJourneyCalendar({ flow: 'reservation', row })}
                              >
                                View Calendar
                              </button>
                            </div>
                          </td>
                          <td className="trackerEmailCol">{row.email}</td>
                          <td className="trackerRunCol">
                            {row.runId ? (
                              row.status || '-'
                            ) : availableRuns.length > 0 ? (
                              <select
                                value={selectedRunId}
                                onChange={(event) =>
                                  setSelectedRunAssignmentByRow((current) => ({
                                    ...current,
                                    [row.key]: event.target.value,
                                  }))
                                }
                              >
                                <option value="">Select run</option>
                                {availableRuns.map((option) => (
                                  <option key={`assign-run-${row.key}-${option.id}`} value={option.id}>
                                    #{option.id} · {normalizeAdminEmail(option.email) || 'no email'} · {option.status || 'active'} ·{' '}
                                    {formatTrackerDateTime(option.created_at) || option.created_at || 'unknown time'}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className={`trackerCriteriaCell ${criteriaState ? `trackerCriteriaCell-${criteriaState}` : ''}`}>
                            {row.criteria?.map((line) => (
                              <div key={`${row.key}-${line}`}>{line}</div>
                            ))}
                          </td>
                          {reservationTrackerColumns.map((column) => {
                            const timingState = getReservationTrackerTimingState(row, column)
                            return (
                              <td key={`${row.key}-${column.key}`} className="trackerStepCell">
                                <div className="trackerCellActions">
                                  {timingState ? (
                                    <span
                                      className={`trackerCellDot trackerCellDot-${timingState}`}
                                      title={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                      aria-label={timingState === 'due' ? 'Due now' : 'Upcoming in next 24 hours'}
                                    />
                                  ) : null}
                                  <span
                                    className={`trackerBadge ${row.steps[column.key]?.status || 'pending'}`}
                                    title={row.steps[column.key]?.at ? new Date(row.steps[column.key].at).toLocaleString() : ''}
                                  >
                                    {getTrackerCellLabel(row.steps[column.key])}
                                  </span>
                                  {row.steps[column.key]?.at ? (
                                    <small className="trackerCellTimestamp">{formatTrackerCellTimestamp(row.steps[column.key].at)}</small>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="trackerCellSendBtn"
                                    onClick={() => previewJourneyCell({ flow: 'reservation', row, column })}
                                    disabled={!row.runId || previewingJourneyCellKey === `reservation-${row.runId}-${column.key}`}
                                  >
                                    {!row.runId ? 'No run' : previewingJourneyCellKey === `reservation-${row.runId}-${column.key}` ? 'Loading...' : 'View Email'}
                                  </button>
                                  <button
                                    type="button"
                                    className="trackerCellSendBtn"
                                    onClick={() => manuallySendJourneyCell({ flow: 'reservation', row, column })}
                                    disabled={!row.runId || sendingJourneyCellKey === `reservation-${row.runId}-${column.key}`}
                                  >
                                    {!row.runId ? 'No run' : sendingJourneyCellKey === `reservation-${row.runId}-${column.key}` ? 'Sending...' : 'Send'}
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr>,
                        isDebugOpen ? (
                          <tr key={`overnight-track-debug-${row.key}`} className="trackerDebugRow">
                            <td colSpan={4 + reservationTrackerColumns.length}>
                              <div className="trackerDebugPanel">
                                <div><strong>Row key:</strong> {row.key}</div>
                                <div><strong>Registration ID:</strong> {row.registrationId || '-'}</div>
                                <div><strong>Run ID:</strong> {row.runId || '-'}</div>
                                <div><strong>Email:</strong> {row.email || '-'}</div>
                                <div><strong>Status:</strong> {row.status || '-'}</div>
                                <div><strong>Registration type:</strong> {row.registrationType || 'overnight-only'}</div>
                                <div><strong>Submitted:</strong> {formatTrackerDateTime(row.createdAt) || row.createdAt || '-'}</div>
                                <div><strong>Attachment event:</strong> {formatTrackerDateTime(row.attachmentEventAt) || row.attachmentEventAt || '-'}</div>
                                <div><strong>Attachment reason:</strong> {row.attachmentReason || '-'}</div>
                                <div><strong>Hidden in tracker:</strong> {row.hidden ? 'yes' : 'no'}</div>
                              </div>
                            </td>
                          </tr>
                        ) : null,
                      ]
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
          ) : null}

          {activeTrackingSubtab === 'replies' ? (
          <article className="previewCard">
            <h3>Replies</h3>
            {filteredEmailReplies.length === 0 ? (
              <p className="subhead">No replies yet.</p>
            ) : (
              <div className="tuitionTableWrap trackerTableWrap">
                <table className="tuitionTable trackerTable trackerTableCompact trackerTableLite">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>From</th>
                      <th>Subject</th>
                      <th>AI Status</th>
                      <th>Received</th>
                      <th>Unread</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmailReplies.map((row) => (
                      <tr key={`reply-${row.id}`} className={selectedReplyId === row.id ? 'selectedReplyRow' : ''}>
                        <td>
                          <button type="button" className="button secondary" onClick={() => selectReplyForAssistant(row)}>
                            Select
                          </button>
                        </td>
                        <td>{row.from_email || row.email}</td>
                        <td>{row.subject || '(No subject)'}</td>
                        <td>{row.ai_status || 'pending'}</td>
                        <td>{row.received_at ? new Date(row.received_at).toLocaleString() : '-'}</td>
                        <td>{row.is_unread ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
          ) : null}
        </div>

        {activeTrackingSubtab === 'events' ? (
        <article className="previewCard">
          <h3>Recent send/delivery events</h3>
          <div className="adminActions">
            <label>
              Delivery
              <select value={eventDeliveryFilter} onChange={(event) => setEventDeliveryFilter(event.target.value)}>
                <option value="all">All events</option>
                <option value="sent">Sent only</option>
                <option value="opened">Opened only</option>
              </select>
            </label>
            <label>
              Flow
              <select value={eventFlowFilter} onChange={(event) => setEventFlowFilter(event.target.value)}>
                <option value="all">All flows</option>
                <option value="lead">Lead</option>
                <option value="registration">Registration</option>
                <option value="overnight">Overnight</option>
              </select>
            </label>
            <label>
              Journey
              <select value={eventJourneyFilter} onChange={(event) => setEventJourneyFilter(event.target.value)}>
                <option value="all">All journeys</option>
                <option value="p">P journey</option>
                <option value="a">A journey</option>
                <option value="other">Other</option>
              </select>
            </label>
            <span>
              Showing: <strong className="trackerDueCountBadge">{filteredEmailEvents.length}</strong>
            </span>
          </div>
          {filteredEmailEvents.length === 0 ? (
            <p className="subhead">No events yet.</p>
          ) : (
            <div className="tuitionTableWrap trackerTableWrap">
              <table className="tuitionTable trackerTable trackerTableCompact trackerTableLite">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Email</th>
                    <th>Step</th>
                    <th>Event</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmailEvents.map((row) => (
                    <tr key={`event-${row.id}`}>
                      <td>
                        {(
                          String(row?.event_type || '').startsWith('lead_journey_') ||
                          String(row?.event_type || '') === 'test_sent_lead' ||
                          String(row?.event_type || '') === 'test_preview_only_lead' ||
                          String(row?.event_type || '') === 'reservation_email_sent' ||
                          String(row?.event_type || '') === 'reservation_email_preview' ||
                          String(row?.event_type || '') === 'test_sent_reservation' ||
                          String(row?.event_type || '') === 'test_preview_only_reservation' ||
                          String(row?.event_type || '').startsWith('paid_prep_') ||
                          String(row?.event_type || '').startsWith('paid_followup_')
                        ) ? (
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => previewEmailEventRow(row)}
                            disabled={previewingEventRowKey === `event-${row.id}`}
                          >
                            {previewingEventRowKey === `event-${row.id}` ? 'Loading...' : 'View'}
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{row.email}</td>
                      <td>{row.step_number || '-'}</td>
                      <td>{getEmailEventDisplayLabel(row)}</td>
                      <td>{row.event_at ? new Date(row.event_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
        ) : null}
      </section>
      ) : null}

      {activeAdminTab === 'account' ? (
      <section className="card section">
        <div className="adminFooter">
          <button type="button" className="button" onClick={saveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          <button type="button" className="button secondary" onClick={signOut}>
            Sign out
          </button>
          <a className="ghostBtn" href="/">
            Back to site
          </a>
        </div>
        {savedMessage ? <p className="message">{savedMessage}</p> : null}
      </section>
      ) : null}

      {journeyCellPreviewState.open ? (
        <div
          className="summaryOverlayBackdrop"
          onClick={() => setJourneyCellPreviewState({ open: false, title: '', subject: '', html: '' })}
        >
          <div
            className="summaryOverlayPanel"
            role="dialog"
            aria-modal="true"
            aria-label={journeyCellPreviewState.title || 'Journey email preview'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="summaryOverlayBar">
              <div>
                <strong>{journeyCellPreviewState.title || 'Journey Email Preview'}</strong>
                {journeyCellPreviewState.subject ? <p className="subhead">Subject: {journeyCellPreviewState.subject}</p> : null}
              </div>
              <div className="summaryOverlayActions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setJourneyCellPreviewState({ open: false, title: '', subject: '', html: '' })}
                >
                  Close
                </button>
              </div>
            </div>
            <iframe title={journeyCellPreviewState.title || 'Journey email preview'} srcDoc={journeyCellPreviewState.html} />
          </div>
        </div>
      ) : null}

      {journeyCalendarState.open ? (
        <div
          className="summaryOverlayBackdrop"
          onClick={() => setJourneyCalendarState({ open: false, title: '', entries: [] })}
        >
          <div
            className="summaryOverlayPanel journeyCalendarOverlay"
            role="dialog"
            aria-modal="true"
            aria-label={journeyCalendarState.title || 'Journey calendar'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="summaryOverlayBar">
              <div>
                <strong>{journeyCalendarState.title || 'Journey Calendar'}</strong>
                <p className="subhead">Each chip shows when that journey step is due to send.</p>
              </div>
              <div className="summaryOverlayActions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setJourneyCalendarState({ open: false, title: '', entries: [] })}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="journeyCalendarOverlayBody">
              {buildJourneyCalendarMonths(journeyCalendarState.entries).length === 0 ? (
                <p className="subhead">No scheduled journey dates available for this row yet.</p>
              ) : (
                <div className="journeyCalendarMonthGrid">
                  {buildJourneyCalendarMonths(journeyCalendarState.entries).map((month) => (
                    <section key={month.key} className="journeyCalendarMonthCard">
                      <div className="journeyCalendarMonthHeader">
                        <strong>{month.title}</strong>
                      </div>
                      <div className="journeyCalendarWeekdayRow">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                          <span key={`${month.key}-${label}`}>{label}</span>
                        ))}
                      </div>
                      <div className="journeyCalendarDayGrid">
                        {month.cells.map((cell) => (
                          <div
                            key={cell.key}
                            className={`journeyCalendarDayCell ${cell.empty ? 'empty' : ''} ${cell.entries?.length ? 'hasEntries' : ''}`}
                          >
                            {!cell.empty ? (
                              <>
                                <div className="journeyCalendarDayNumber">{cell.day}</div>
                                <div className="journeyCalendarEntryStack">
                                  {(cell.entries || []).map((entry, index) => (
                                    <div
                                      key={`${cell.key}-${entry.label}-${index}`}
                                      className={`journeyCalendarEntryChip ${entry.status || 'pending'}`}
                                      title={formatJourneyCalendarEntryDate(entry.scheduledAt)}
                                    >
                                      <strong>{entry.label}</strong>
                                      {entry.note ? <span>{entry.note}</span> : null}
                                      <small>{formatJourneyCalendarEntryDate(entry.scheduledAt)}</small>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="adminFloatingSaveBar" role="region" aria-label="Save admin settings">
        <div className="adminFloatingSaveMeta">
          <strong>Save all settings</strong>
          <span>{savedMessage || (saving ? 'Saving changes...' : 'Unsaved edits on this page')}</span>
          {journeyProcessSummary ? (
            <div className="adminProcessSummary">
              <div className="adminProcessGroup">
                <span className="adminProcessLabel">Lead</span>
                {buildJourneyProcessStepChips(journeyProcessSummary.lead.stepCounts, 'lead').map((chip) => (
                  <span key={`lead-${chip.key}`} className="adminProcessChip success">{chip.label} {chip.count}</span>
                ))}
                <span className="adminProcessChip">Q {journeyProcessSummary.lead.queued}</span>
                <span className="adminProcessChip">CHK {journeyProcessSummary.lead.checked}</span>
                <span className="adminProcessChip">CAND {journeyProcessSummary.lead.candidates}</span>
                <span className="adminProcessChip muted">REG {journeyProcessSummary.lead.skippedRegistered}</span>
                <span className="adminProcessChip muted">ACT {journeyProcessSummary.lead.skippedActive}</span>
                <span className="adminProcessChip muted">HAS L1 {journeyProcessSummary.lead.skippedExistingStepOne}</span>
                <span className="adminProcessChip accent">REV {journeyProcessSummary.lead.revived}</span>
                <span className="adminProcessChip accent">NEW {journeyProcessSummary.lead.newRuns}</span>
                <span className="adminProcessChip accent">BOOT {journeyProcessSummary.lead.bootstrapped}</span>
              </div>
              <div className="adminProcessGroup">
                <span className="adminProcessLabel">Reservation</span>
                {buildJourneyProcessStepChips(journeyProcessSummary.reservation.stepCounts, 'reservation').map((chip) => (
                  <span key={`reservation-${chip.key}`} className="adminProcessChip success">{chip.label} {chip.count}</span>
                ))}
                <span className="adminProcessChip">CHK {journeyProcessSummary.reservation.checked}</span>
              </div>
            </div>
          ) : null}
        </div>
        <button type="button" className="button" onClick={saveChanges} disabled={saving}>
          {saving ? 'Saving...' : 'Save all'}
        </button>
      </div>
    </main>
  )
}
