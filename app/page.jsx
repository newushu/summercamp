'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  defaultAdminConfig,
  formatDateLabel,
  formatWeekLabel,
  getSelectedWeeks,
} from '../lib/campAdmin'
import { fetchAdminConfigFromSupabase } from '../lib/campAdminApi'
import { buildPaymentPageHref } from '../lib/paymentPageLink'
import { buildRegistrationSummaryDocument } from '../lib/registrationSummaryDocument'
import { supabase, supabaseEnabled } from '../lib/supabase'

const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const nextMode = {
  NONE: 'FULL',
  FULL: 'AM',
  AM: 'PM',
  PM: 'NONE',
}

const registrationSteps = [
  { id: 1, title: 'Family & campers' },
  { id: 2, title: 'Camp weeks & times' },
  { id: 3, title: 'Lunch days' },
  { id: 4, title: 'Review & submit' },
]
const desktopCampNavItems = [
  { href: '#camp-info', label: 'Top' },
  { href: '#why-camp', label: 'Highlights' },
  { href: '#student-stories', label: 'Stories' },
  { href: '#weekly-structure', label: 'Sample Week' },
]
const MAX_CAMPERS = 6
const REGISTRATION_DRAFT_KEY = 'new-england-wushu-registration-draft-v1'
const SURVEY_DRAFT_KEY = 'new-england-wushu-survey-draft-v1'
const SURVEY_STEP_DRAFT_KEY = 'new-england-wushu-survey-step-draft-v1'
const ASSISTANT_COLLAPSED_KEY = 'new-england-wushu-assistant-collapsed-v1'
const SUPPORT_EMAIL = 'info@newushu.com'
const PAYMENT_METHOD_OPTIONS = [
  { value: 'zelle', label: 'Zelle (wushu688@gmail.com, Xiaoyi Chen)' },
  { value: 'venmo', label: 'Venmo (@newushu, Friends & Family preferred)' },
  { value: 'cash', label: 'Cash (exact change to Calvin or Xiaoyi)' },
  { value: 'check', label: 'Check (mail to 123 Muller Rd, payable to Newushu)' },
  { value: 'other', label: 'Other / will confirm by reply' },
]
const INCLUDED_LUNCH_DAY_KEY = 'Thu'
const LOCATION_OPTIONS = [
  {
    value: 'burlington',
    label: 'Burlington',
    towns: ['Lexington', 'Woburn', 'Bedford', 'Wilmington', 'Billerica', 'Winchester', 'Arlington', 'Belmont'],
  },
  {
    value: 'acton',
    label: 'Acton',
    towns: ['Concord', 'Boxborough', 'Littleton', 'Westford', 'Maynard', 'Stow', 'Sudbury', 'Carlisle'],
  },
]
const DAY_CAMP_WEEKLY_POINTS = 2500
const DAY_CAMP_FULL_DAY_POINTS = 500
const DAY_CAMP_HALF_DAY_POINTS = 100
const OVERNIGHT_WEEKLY_POINTS = 5000
const DOB_YEAR_OPTIONS = Array.from({ length: 26 }, (_, index) => String(new Date().getFullYear() - 2 - index))

function getLocationLabel(value) {
  const option = LOCATION_OPTIONS.find((item) => item.value === String(value || '').trim())
  return option?.label || 'No location selected'
}

function getGeneralProgramForLocation(programConfig, locationValue) {
  if (String(locationValue || '').trim() === 'acton') {
    return {
      ...programConfig,
      selectedWeeks: Array.isArray(programConfig?.actonSelectedWeeks) ? programConfig.actonSelectedWeeks : [],
    }
  }
  return programConfig
}

function getDobYear(dob) {
  const match = String(dob || '').trim().match(/^(\d{4})-\d{2}-\d{2}$/)
  return match ? match[1] : ''
}

function setDobYear(dob, yearValue) {
  const year = String(yearValue || '').trim()
  if (!/^\d{4}$/.test(year)) {
    return ''
  }
  const raw = String(dob || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${year}${raw.slice(4)}`
  }
  return `${year}-01-01`
}

function getFacilityImageUrls(media, locationValue) {
  if (String(locationValue || '').trim() === 'acton') {
    return Array.isArray(media?.actonFacilityImageUrls) ? media.actonFacilityImageUrls.filter(Boolean) : []
  }
  if (String(locationValue || '').trim() === 'burlington') {
    return Array.isArray(media?.burlingtonFacilityImageUrls)
      ? media.burlingtonFacilityImageUrls.filter(Boolean)
      : []
  }
  return []
}

function getSiteBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://summer.newushu.com'
}

function isIncludedLunchDay(dayKey) {
  return String(dayKey || '') === INCLUDED_LUNCH_DAY_KEY
}

function getDayNotableText(dayKey) {
  if (dayKey === 'Wed') {
    return 'Water balloons day: bring a change of clothes.'
  }
  if (dayKey === 'Thu') {
    return 'BBQ lunch included in tuition (packing lunch is optional).'
  }
  if (dayKey === 'Fri') {
    return 'Family performance showcase day.'
  }
  return ''
}

function isPaidLunchSelectionKey(key) {
  return !String(key || '').endsWith(`:${INCLUDED_LUNCH_DAY_KEY}`)
}

function getPaymentMethodLabel(value) {
  const normalized = String(value || '').trim()
  const option = PAYMENT_METHOD_OPTIONS.find((item) => item.value === normalized)
  return option?.label || normalized || 'not selected'
}
const surveyGoals = [
  { value: 'fun', label: 'Fun', zhLabel: '趣味' },
  { value: 'exercise', label: 'Exercise', zhLabel: '锻炼' },
  { value: 'competition', label: 'Competition', zhLabel: '竞赛' },
  { value: 'social/teamwork/friends', label: 'Social / Teamwork / Friends', zhLabel: '社交 / 团队 / 友谊' },
]
const surveyActivities = [
  { value: 'team-games', label: 'Team games', zhLabel: '团队游戏' },
  { value: 'movement-drills', label: 'Movement drills', zhLabel: '动作训练' },
  { value: 'flexibility', label: 'Flexibility training', zhLabel: '柔韧训练' },
  { value: 'performance', label: 'Performance / showcase', zhLabel: '表演 / 展示' },
  { value: 'conditioning', label: 'Fitness conditioning', zhLabel: '体能强化' },
  { value: 'partner-work', label: 'Partner work', zhLabel: '搭档协作' },
]
const overnightActivityOptions = [
  'Taolu forms training',
  'Weapons basics',
  'Advanced weapons practice',
  'Sanda fundamentals',
  'Self-defense drills',
  'Tumbling basics',
  'Acrobatics progression',
  'Flexibility training',
  'Mobility and recovery',
  'Strength and conditioning',
  'Speed and agility drills',
  'Balance and coordination games',
  'Partner drills',
  'Small-group team challenges',
  'Leadership activities',
  'Confidence-building drills',
  'Performance practice',
  'Showcase preparation',
  'Mindfulness and focus practice',
  'Character-building sessions',
  'Sportsmanship and discipline lessons',
  'Goal-setting workshops',
  'Video review and technique feedback',
  'Nature walks/outdoor exploration',
  'City or park outings',
  'Cultural activities',
  'Board/card game social time',
  'Creative team projects',
  'Campfire-style reflection time',
  'Free play and social bonding',
]
const SURVEY_TOTAL_STEPS = 7

const perks = [
  {
    title: 'Fun, Challenging, Game-Based Training',
    zhTitle: '有趣且有挑战的游戏化训练',
    text: 'Keep your child active, engaged, and excited with high-energy games, team challenges, and skill-building every day.',
    zhText: '通过高能游戏、团队挑战与每日技能训练，让孩子持续活跃、投入并保持兴奋。',
  },
  {
    title: 'Internationally Certified Coaches',
    zhTitle: '国际认证教练团队',
    text: 'Train with national and international-level coaches who are excellent with kids and follow clear safety standards.',
    zhText: '由国家级与国际级背景教练带领，教练擅长青少年教学并严格执行清晰安全标准。',
  },
  {
    title: 'See Daily Progress Updates',
    zhTitle: '每天可见成长更新',
    text: 'Follow daily logs, photos, and videos so you can clearly see your camper learning and improving week by week.',
    zhText: '通过每日日志、照片和视频，清晰看到孩子每周的学习与进步。',
  },
  {
    title: 'Lunch Convenience, No Packing Needed',
    zhTitle: '午餐省心，不用每天备餐',
    text: "Choose lunch by day so you don't need to pack lunch every camp day.",
    zhText: '按天选择午餐，无需每天为营地准备便当。',
  },
  {
    title: 'Small Groups, More Coach Attention',
    zhTitle: '小班分组，更多教练关注',
    text: 'Your child trains in small level-based groups so coaches can give clearer corrections and support.',
    zhText: '孩子在按水平分组的小班中训练，教练能提供更清晰的动作纠正与成长支持。',
  },
  {
    title: 'Weekly Showcase, Real Confidence',
    zhTitle: '每周展示，建立真实自信',
    text: 'Finish each week with a family showcase so campers practice performing, speaking up, and feeling proud.',
    zhText: '每周通过家庭展示收尾，帮助孩子练习表达、展示与建立成就感。',
  },
]

const dayAtCampTimeline = [
  {
    time: '9:00 AM',
    title: 'Warm-up + team games',
    zhTitle: '热身 + 团队游戏',
    note: 'Arrival, movement prep, and social energy.',
    zhNote: '到营、热身准备与团队互动。',
  },
  {
    time: '10:00 AM',
    title: 'Wushu training',
    zhTitle: '武术训练',
    note: 'Technique, balance, focus, and level-based coaching.',
    zhNote: '技术、平衡、专注与分层教学。',
  },
  {
    time: '11:30 AM',
    title: 'Snack break',
    zhTitle: '加餐休息',
    note: 'Reset, hydrate, and recharge.',
    zhNote: '补充水分，短暂调整。',
  },
  {
    time: '12:00 PM',
    title: 'Lunch',
    zhTitle: '午餐',
    note: 'Packed lunch or add-on camp lunch.',
    zhNote: '可自带午餐，也可选择营地午餐。',
  },
  {
    time: '1:00 PM',
    title: 'Tumbling + skill work',
    zhTitle: '翻腾 + 技能训练',
    note: 'Coordination, body control, and athletic development.',
    zhNote: '协调性、身体控制与运动能力发展。',
  },
  {
    time: '2:00 PM',
    title: 'Creative activities',
    zhTitle: '创意活动',
    note: 'Arts, team-building, and recovery from hard training.',
    zhNote: '手工、协作活动与训练后的节奏调整。',
  },
  {
    time: '3:00 PM',
    title: 'Team games',
    zhTitle: '团队游戏',
    note: 'Confidence, friendships, and high-energy fun.',
    zhNote: '建立自信、友谊与高能量乐趣。',
  },
  {
    time: '4:00 PM',
    title: 'Pickup',
    zhTitle: '接送',
    note: 'Families head home with a full, structured day completed.',
    zhNote: '一天完整而有结构的营地安排结束。',
  },
]

const overnightSchedule = [
  {
    day: 'Sunday',
    amTheme: 'Arrival + orientation',
    pmTheme: 'Outing',
    note: 'Drop-off at 1:00 PM, settle in, then first supervised outing and team bonding.',
  },
  {
    day: 'Monday',
    amTheme: 'Academy training + day camp integration',
    pmTheme: 'Outing',
    note: 'Skill-focused academy training with day-camp rhythm, then evening outing.',
  },
  {
    day: 'Tuesday',
    amTheme: 'Academy training + day camp integration',
    pmTheme: 'Academy training + recovery',
    note: 'Full training day at the academy with structured development and recovery routine.',
  },
  {
    day: 'Wednesday',
    amTheme: 'Academy training + day camp integration',
    pmTheme: 'Academy training + social session',
    note: 'Technique progression, partner work, and evening community-building activities on campus.',
  },
  {
    day: 'Thursday',
    amTheme: 'Academy training + day camp integration',
    pmTheme: 'Outing',
    note: 'Training at the academy during the day, then supervised group outing.',
  },
  {
    day: 'Friday',
    amTheme: 'Outing',
    pmTheme: 'Academy training + showcase prep',
    note: 'Morning outing, then return to academy for focused training and showcase preparation.',
  },
  {
    day: 'Saturday',
    amTheme: 'Academy training recap',
    pmTheme: 'Outing + pickup',
    note: 'Final training recap, last outing, and pickup at 4:00 PM at the camp house.',
  },
]

const levelUpFeatures = [
  'Camp leaders and coaches track each camper directly in the Level Up app.',
  'Daily logs with photos and videos keep parents in the loop.',
  'Parents can conveniently order lunch in the app.',
  'A weekly camp schedule is shown in-app so families know exactly what is happening.',
  'Parents can see day-to-day activity and clear progress over time.',
]

const campGalleryCaptions = [
  {
    en: 'Every week blends high-energy training, confidence-building, and summer fun.',
    zh: '每周都结合高能训练、自信培养与夏日乐趣。',
  },
  {
    en: 'Campers build real skills while making friends through team challenges.',
    zh: '营员在团队挑战中提升真实技能，也结交新朋友。',
  },
  {
    en: 'Daily movement, structure, and coaching help kids grow fast and stay motivated.',
    zh: '每日训练节奏与教练指导，帮助孩子快速成长并持续保持动力。',
  },
  {
    en: 'From first-timers to advanced students, every camper trains at the right level.',
    zh: '从零基础到进阶学员，每位营员都在适合自己的层级训练。',
  },
  {
    en: 'Weekly showcase moments turn progress into proud memories for families.',
    zh: '每周展示把成长转化为家庭共同见证的高光时刻。',
  },
  {
    en: 'A summer they enjoy now, with confidence and discipline that lasts beyond camp.',
    zh: '一个当下快乐、长期受益的夏天，自信与自律延续到营地之外。',
  },
]

const testimonialTranslationMap = {
  'Ethan, age 9': 'Ethan，9岁',
  'From shy beginner to confident performer': '从害羞新手到自信展示者',
  Confidence: '自信',
  Flexibility: '柔韧性',
  Showcase: '展示',
  'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.':
    'Ethan在没有武术基础的情况下参加了普通营。经过两周系统训练，他的柔韧性、专注力和自信明显提升，并在周五家庭展示中自信完成表演。',
  'Parent shared the coaches were excellent with kids, communication was clear, and Ethan left each day confident and excited.':
    '家长表示教练非常擅长带孩子、沟通清晰，Ethan每天都带着自信和兴奋回家。',
  'Ava, age 8': 'Ava，8岁',
  'Lunch was easy, and every day felt meaningful': '午餐安排省心，每一天都很有收获',
  'Daily Routine': '每日节奏',
  'Skill Growth': '技能成长',
  'Coach Support': '教练支持',
  'Ava attended General Camp for three weeks. Her family appreciated the flexible lunch planning and clear weekly structure, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.':
    'Ava参加了三周普通营。家长很认可灵活的午餐安排和清晰的每周结构；Ava每天回家都会分享团队游戏、新学技能，以及和教练在一起有多开心。',
  'Ava attended General Camp for three weeks. Her family loved using the app to handle lunch ahead of time, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.':
    'Ava参加了三周普通营。家长很喜欢提前安排午餐的便利性；Ava每天回家都会分享团队游戏、新学技能，以及和教练在一起有多开心。',
  'Ava attended General Camp for three weeks. Her family loved the lunch convenience ahead of time, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.':
    'Ava参加了三周普通营。家长很喜欢提前安排午餐的便利性；Ava每天回家都会分享团队游戏、新学技能，以及和教练在一起有多开心。',
  'Parent said lunch convenience was so nice, the coaches were amazing with kids, and Ava asked to come back next summer.':
    '家长表示午餐安排非常省心，教练特别会带孩子，而且Ava已经主动要求明年夏天继续参加。',
  'Noah, age 10': 'Noah，10岁',
  'Coaches who care and a reward system kids love': '用心教练团队，加上孩子超喜欢的奖励体系',
  Motivation: '积极性',
  Discipline: '纪律',
  Teamwork: '团队协作',
  'Noah joined General Camp to stay active and build confidence. He quickly connected with a really good group of kids, and the coaches were encouraging, patient, and excellent with children.':
    'Noah参加普通营是为了增强体能和自信。他很快就融入了一群很棒的孩子，教练也非常耐心、鼓励到位，并且特别擅长带孩子。',
  'Parent reported stronger confidence, great coach support, and felt very good seeing Noah in such a positive camp community.':
    '家长反馈：孩子自信提升明显，教练支持很强，也很放心看到Noah在这样积极的营地氛围里成长。',
  'Mia, age 7': 'Mia，7岁',
  'From first-week nerves to independent confidence': '从第一周紧张到独立自信',
  'First-Time Camper': '首次参营',
  Independence: '独立性',
  'Mia started camp feeling shy about joining group activities. By the second week, she had bonded with really kind kids, joined partner drills, and proudly showed new techniques during Friday showcase.':
    'Mia刚开始参加营地时，对团队活动有些害羞。到第二周，她已经和一群很友善的孩子建立了连接，主动参与搭档训练，并在周五展示中自豪地展示新动作。',
  'Parent shared that the coaches were very good with kids, Mia felt included, and confidence at home improved quickly.':
    '家长表示教练非常会带孩子，Mia在营里很有归属感，回家后的自信也很快提升。',
  'Lucas, age 11': 'Lucas，11岁',
  'Athletic focus and visible weekly progress': '运动能力聚焦与每周可见进步',
  'Athletic Development': '运动能力提升',
  Focus: '专注力',
  Consistency: '持续性',
  'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.':
    'Lucas参加营地是为了提升多项运动所需的协调性和体能。结构化训练帮助他提升平衡、速度和控制力，并通过清晰的每周目标持续投入。',
  'Parent said coaches pushed progress in the right way, were very good with kids, and made the family feel confident about camp each week.':
    '家长表示教练的进阶节奏把握得很好、非常会带孩子，也让家长每周都对营地安排很放心。',
  'Sophie, age 8': 'Sophie，8岁',
  'Strong routines and happy social growth': '训练有节奏，社交成长也很明显',
  Routine: '规律性',
  'Social Growth': '社交成长',
  'Coach Quality': '教练质量',
  'Sophie joined camp to stay active and improve focus. She quickly made friends with great kids, and her family loved how structured each day felt.':
    'Sophie参加营地是为了保持活力并提升专注力。她很快和一群很棒的孩子成为朋友，家长也很喜欢每天清晰有序的训练安排。',
  'Parent said the coaches were excellent with kids, communication was clear, and Sophie came home proud and energized.':
    '家长表示教练非常会带孩子、沟通清晰，Sophie每天回家都很自豪也充满活力。',
  'Li Wei (李薇), age 9': 'Li Wei（李薇），9岁',
  'Disciplined training with caring support': '有纪律的训练与有温度的支持',
  Care: '关怀支持',
  'Li Wei started with beginner-level technique goals and grew quickly through daily drills, partner work, and positive team culture.':
    'Li Wei以基础技术目标起步，通过每日训练、搭档配合和积极团队氛围快速成长。',
  'Parent shared the coaches were very good with kids, gave thoughtful feedback, and made the family feel confident week after week.':
    '家长表示教练非常会带孩子、反馈细致，也让家长每周都更放心。',
}

function pluralize(label, count) {
  return `${count} ${label}${count === 1 ? '' : 's'}`
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`
}

function createStudent(fixedId) {
  return {
    id: fixedId || makeId(),
    fullName: '',
    dob: '',
    allergies: '',
    medication: '',
    previousInjury: '',
    healthNotes: '',
    schedule: {},
    lunch: {},
    lunchConfirmedNone: false,
  }
}

function isStudentComplete(student) {
  return Boolean(
    student.fullName.trim() &&
      parseDateLocal(student.dob) &&
      student.allergies.trim() &&
      student.medication.trim() &&
      student.previousInjury.trim() &&
      student.healthNotes.trim()
  )
}

function readRegistrationDraft() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(REGISTRATION_DRAFT_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeStudentDraft(student) {
  return {
    id: typeof student?.id === 'string' ? student.id : makeId(),
    fullName: typeof student?.fullName === 'string' ? student.fullName : '',
    dob: typeof student?.dob === 'string' ? student.dob : '',
    allergies: typeof student?.allergies === 'string' ? student.allergies : '',
    medication: typeof student?.medication === 'string' ? student.medication : '',
    previousInjury: typeof student?.previousInjury === 'string' ? student.previousInjury : '',
    healthNotes: typeof student?.healthNotes === 'string' ? student.healthNotes : '',
    schedule: typeof student?.schedule === 'object' && student.schedule ? student.schedule : {},
    lunch: typeof student?.lunch === 'object' && student.lunch ? student.lunch : {},
    lunchConfirmedNone: Boolean(student?.lunchConfirmedNone),
  }
}

function parseDateLocal(input) {
  if (!input) {
    return null
  }
  const raw = String(input).trim()
  if (!raw) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const cleaned = raw
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const hasYear = /\b\d{4}\b/.test(cleaned)
  const withYear = hasYear ? cleaned : `${cleaned} ${new Date().getFullYear()}`
  const parsed = new Date(withYear)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function getCountdownParts(targetDate, nowDate) {
  const diffMs = Math.max(0, targetDate.getTime() - nowDate.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function calcAge(dob) {
  const birth = parseDateLocal(dob)
  if (!birth) {
    return 0
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return Math.max(age, 0)
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: 'Camper', lastName: 'Unknown' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Student' }
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function getWeekDays(weekStartIso, labels = dayKeys) {
  const start = parseDateLocal(weekStartIso)
  if (!start) {
    return []
  }

  return labels.map((key, index) => ({ key, date: isoDate(addDays(start, index)) }))
}

function getStudentSummary(student) {
  const general = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }
  const bootcamp = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }
  for (const entry of Object.values(student.schedule || {})) {
    const keys = dayKeys
    const modes = keys.map((day) => entry.days?.[day] || 'NONE')
    const fullWeek = modes.every((mode) => mode === 'FULL')

    const bucket = entry.campType === 'bootcamp' ? bootcamp : general

    if (fullWeek && entry.programKey !== 'overnight') {
      bucket.fullWeeks += 1
      continue
    }

    for (const mode of modes) {
      if (mode === 'FULL') {
        bucket.fullDays += 1
      } else if (mode === 'AM') {
        bucket.amDays += 1
      } else if (mode === 'PM') {
        bucket.pmDays += 1
      }
    }
  }

  const lunchCount = Object.entries(student.lunch || {}).filter(
    ([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)
  ).length

  return { general, bootcamp, lunchCount }
}

function getLunchWeeksForStudent(student, weeksById) {
  const rows = []
  for (const [weekId, entry] of Object.entries(student.schedule || {})) {
    const week = weeksById[weekId]
    if (!week || week.programKey === 'overnight') {
      continue
    }

    const selectedDays = []
    for (const day of week.days) {
      const mode = entry.days?.[day.key] || 'NONE'
      if (mode === 'NONE') {
        continue
      }
      selectedDays.push({ dayKey: day.key, date: day.date, mode, key: `${weekId}:${day.key}` })
    }

    if (selectedDays.length > 0) {
      rows.push({ weekId, week, selectedDays })
    }
  }
  return rows.sort((a, b) => a.week.start.localeCompare(b.week.start))
}

function getLunchDecisionStats(student, weeksById) {
  const lunchWeeks = getLunchWeeksForStudent(student, weeksById)
  const registeredDays = lunchWeeks.reduce((sum, row) => sum + row.selectedDays.length, 0)
  const includedLunchDays = lunchWeeks.reduce(
    (sum, row) => sum + row.selectedDays.filter((day) => isIncludedLunchDay(day.dayKey)).length,
    0
  )
  const paidLunchDays = lunchWeeks.reduce(
    (sum, row) =>
      sum +
      row.selectedDays.filter(
        (day) => !isIncludedLunchDay(day.dayKey) && Boolean(student?.lunch?.[day.key])
      ).length,
    0
  )
  const lunchProvidedDays = includedLunchDays + paidLunchDays
  const packLunchNeededDays = Math.max(0, registeredDays - lunchProvidedDays)
  return {
    lunchWeeks,
    registeredDays,
    includedLunchDays,
    paidLunchDays,
    lunchProvidedDays,
    packLunchNeededDays,
  }
}

function getDayCampPointsFromSummary(summary) {
  const general = summary?.general || {}
  const bootcamp = summary?.bootcamp || {}
  const totalFullWeeks = Number(general.fullWeeks || 0) + Number(bootcamp.fullWeeks || 0)
  const totalFullDays = Number(general.fullDays || 0) + Number(bootcamp.fullDays || 0)
  const totalHalfDays =
    Number(general.amDays || 0) +
    Number(general.pmDays || 0) +
    Number(bootcamp.amDays || 0) +
    Number(bootcamp.pmDays || 0)

  return (
    totalFullWeeks * DAY_CAMP_WEEKLY_POINTS +
    totalFullDays * DAY_CAMP_FULL_DAY_POINTS +
    totalHalfDays * DAY_CAMP_HALF_DAY_POINTS
  )
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getTestimonialHighlights(item) {
  if (!item) {
    return []
  }
  const explicit = Array.isArray(item.highlights)
    ? item.highlights.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean)
    : []
  if (explicit.length > 0) {
    return explicit.slice(0, 4)
  }
  if (typeof item.headline === 'string' && item.headline.trim()) {
    return [item.headline.trim()]
  }
  return []
}

function startOfWeekSunday(date) {
  const next = new Date(date)
  next.setDate(next.getDate() - next.getDay())
  return next
}

function endOfWeekSaturday(date) {
  const next = new Date(date)
  next.setDate(next.getDate() + (6 - next.getDay()))
  return next
}

function getWeekSelectionSummary(entry, week) {
  if (!entry || !week) {
    return ''
  }

  const weekDayKeys = week.days.map((day) => day.key)
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

function currency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`
}

function roundUpToFive(value) {
  const next = Math.round(Number(value || 0) / 5) * 5
  return Number.isFinite(next) ? Math.max(0, next) : 0
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

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
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
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    loop: '1',
    playlist: id,
    controls: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    enablejsapi: '1',
    cc_load_policy: '0',
    fs: '1',
  })
  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin)
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

function getDefaultSurveyData() {
  return {
    contactEmail: '',
    camperCount: '1',
    camperAges: [''],
    hasSports: '',
    sportsList: '',
    noSportsPriority: [],
    hasMartial: '',
    martialYears: '',
    martialMonths: '',
    goals: [],
    activityInterests: [],
    lunchInterest: '',
    registrationIntent: '',
  }
}

function readSurveyDraft() {
  if (typeof window === 'undefined') {
    return getDefaultSurveyData()
  }

  try {
    const nav = window.performance?.getEntriesByType?.('navigation')?.[0]
    if (nav && nav.type === 'reload') {
      window.localStorage.removeItem(SURVEY_DRAFT_KEY)
      return getDefaultSurveyData()
    }

    const raw = window.localStorage.getItem(SURVEY_DRAFT_KEY)
    if (!raw) {
      return getDefaultSurveyData()
    }
    const parsed = JSON.parse(raw)
    return {
      ...getDefaultSurveyData(),
      ...parsed,
      noSportsPriority: Array.isArray(parsed?.noSportsPriority) ? parsed.noSportsPriority.slice(0, 3) : [],
      camperAges: Array.isArray(parsed?.camperAges) ? parsed.camperAges : [''],
      goals: Array.isArray(parsed?.goals) ? parsed.goals : [],
      activityInterests: Array.isArray(parsed?.activityInterests) ? parsed.activityInterests : [],
    }
  } catch {
    return getDefaultSurveyData()
  }
}

function readSurveyStepDraft() {
  if (typeof window === 'undefined') {
    return 1
  }
  try {
    const raw = window.localStorage.getItem(SURVEY_STEP_DRAFT_KEY)
    const step = Number(raw || 1)
    if (!Number.isFinite(step)) {
      return 1
    }
    return Math.max(1, Math.min(SURVEY_TOTAL_STEPS, step))
  } catch {
    return 1
  }
}

function readAssistantCollapsedDraft() {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    return window.localStorage.getItem(ASSISTANT_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const isRegistrationRoute = pathname === '/register'
  const [language, setLanguage] = useState('en')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [stepDirection, setStepDirection] = useState('next')
  const [countdownNow, setCountdownNow] = useState(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [assistantCollapsed, setAssistantCollapsed] = useState(() => readAssistantCollapsedDraft())
  const [isDiscountCollapsed, setIsDiscountCollapsed] = useState(false)
  const [overnightRequestOption, setOvernightRequestOption] = useState('fullWeek')
  const [overnightEnrollmentStep, setOvernightEnrollmentStep] = useState(1)
  const [overnightSelectedWeekIds, setOvernightSelectedWeekIds] = useState([])
  const [overnightActivitySelections, setOvernightActivitySelections] = useState([])
  const [overnightActivityCustom, setOvernightActivityCustom] = useState('')
  const [overnightParentName, setOvernightParentName] = useState('')
  const [overnightContactEmail, setOvernightContactEmail] = useState('')
  const [overnightContactPhone, setOvernightContactPhone] = useState('')
  const [overnightPaymentMethod, setOvernightPaymentMethod] = useState('')
  const [overnightSubmitting, setOvernightSubmitting] = useState(false)
  const [overnightMessage, setOvernightMessage] = useState('')
  const [activeStudentId, setActiveStudentId] = useState('')
  const [expandedStudentId, setExpandedStudentId] = useState('')
  const [expandedWeekKey, setExpandedWeekKey] = useState('')
  const [expandedLunchWeekKey, setExpandedLunchWeekKey] = useState('')
  const [scheduleCopySourceId, setScheduleCopySourceId] = useState('')
  const [lunchCopySourceId, setLunchCopySourceId] = useState('')
  const [levelUpSlideIndex, setLevelUpSlideIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')
  const [entryMode, setEntryMode] = useState(() => {
    if (isRegistrationRoute) {
      return 'register'
    }
    return 'register'
  })
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [campGalleryIndex, setCampGalleryIndex] = useState(0)
  const [campGalleryDirection, setCampGalleryDirection] = useState('next')
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [summaryOverlayOpen, setSummaryOverlayOpen] = useState(false)
  const [summaryOverlayHtml, setSummaryOverlayHtml] = useState('')
  const [locationAlbumOpen, setLocationAlbumOpen] = useState(false)
  const [locationAlbumIndex, setLocationAlbumIndex] = useState(0)
  const [submittedRegistrationSnapshot, setSubmittedRegistrationSnapshot] = useState(null)
  const [registrationEmailResult, setRegistrationEmailResult] = useState(null)
  const [summaryEmailSending, setSummaryEmailSending] = useState(false)
  const [summaryEmailLocked, setSummaryEmailLocked] = useState(false)
  const [registrationDiscountClaimed, setRegistrationDiscountClaimed] = useState(false)
  const [surveyStep, setSurveyStep] = useState(() => readSurveyStepDraft())
  const [surveyDirection, setSurveyDirection] = useState('next')
  const [surveyMessage, setSurveyMessage] = useState('')
  const [surveyAwaitingAdvanceStep, setSurveyAwaitingAdvanceStep] = useState(null)
  const [surveyStepFeedback, setSurveyStepFeedback] = useState('')
  const [savingSurveyProfile, setSavingSurveyProfile] = useState(false)
  const [surveyData, setSurveyData] = useState({
    ...readSurveyDraft(),
  })
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactMessage, setContactMessage] = useState('')
  const [adminConfig, setAdminConfig] = useState(defaultAdminConfig)
  const [draftReady, setDraftReady] = useState(false)
  const [registration, setRegistration] = useState({
    location: '',
    parentName: '',
    contactEmail: '',
    contactPhone: '',
    paymentMethod: '',
    students: [createStudent('student-1')],
  })
  const registrationRef = useRef(null)
  const surveyRef = useRef(null)
  const summaryIframeRef = useRef(null)
  const slideTouchStartRef = useRef(0)
  const campGalleryTouchStartRef = useRef(0)
  const surveyLeadAutosaveTimerRef = useRef(null)
  const registrationLeadAutosaveTimerRef = useRef(null)

  const missingConfig = useMemo(() => !supabaseEnabled, [])
  const generalWeeks = useMemo(
    () => getSelectedWeeks('general', getGeneralProgramForLocation(adminConfig.programs.general, registration.location)),
    [adminConfig.programs.general, registration.location]
  )
  const locationFacilityPhotos = useMemo(
    () => getFacilityImageUrls(adminConfig.media, registration.location),
    [adminConfig.media, registration.location]
  )

  useEffect(() => {
    setLocationAlbumIndex(0)
    if (locationFacilityPhotos.length === 0) {
      setLocationAlbumOpen(false)
    }
  }, [locationFacilityPhotos])
  const bootcampWeeks = useMemo(
    () => getSelectedWeeks('bootcamp', adminConfig.programs.bootcamp),
    [adminConfig.programs.bootcamp]
  )
  const overnightWeeks = useMemo(() => getSelectedWeeks('overnight', adminConfig.programs.overnight), [
    adminConfig.programs.overnight,
  ])
  const overnightWindowLabel = useMemo(() => {
    const start = adminConfig.programs.overnight.startDate
    const end = adminConfig.programs.overnight.endDate
    if (!start || !end) {
      return ''
    }
    return `${formatDateLabel(start)} - ${formatDateLabel(end)}`
  }, [adminConfig.programs.overnight.endDate, adminConfig.programs.overnight.startDate])
  const featuredTestimonials = useMemo(() => {
    const incoming = Array.isArray(adminConfig.testimonials) ? adminConfig.testimonials : []
    const merged = [...incoming]
    for (const fallback of defaultAdminConfig.testimonials) {
      const duplicate = merged.some(
        (item) => item?.studentName === fallback.studentName && item?.headline === fallback.headline
      )
      if (!duplicate) {
        merged.push(fallback)
      }
    }
    return merged.slice(0, 5)
  }, [adminConfig.testimonials])
  const testimonialCount = featuredTestimonials.length
  const normalizedTestimonialIndex = testimonialCount > 0
    ? ((testimonialIndex % testimonialCount) + testimonialCount) % testimonialCount
    : 0
  const activeTestimonial = useMemo(() => {
    if (testimonialCount === 0) {
      return null
    }
    return featuredTestimonials[normalizedTestimonialIndex]
  }, [featuredTestimonials, normalizedTestimonialIndex, testimonialCount])
  const activeTestimonialHighlights = useMemo(
    () => getTestimonialHighlights(activeTestimonial),
    [activeTestimonial]
  )

  const registrationWeeks = useMemo(() => {
    const dayCampMap = new Map()

    for (const week of generalWeeks) {
      const id = `daycamp:${week.start}`
      dayCampMap.set(id, {
        id,
        start: week.start,
        end: week.end,
        programKey: 'daycamp',
        programLabel: 'Camp Week',
        days: getWeekDays(week.start),
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
      } else {
        dayCampMap.set(id, {
          id,
          start: week.start,
          end: week.end,
          programKey: 'daycamp',
          programLabel: 'Camp Week',
          days: getWeekDays(week.start),
          availableCampTypes: ['bootcamp'],
        })
      }
    }

    const mappedDayCamp = Array.from(dayCampMap.values()).sort((a, b) => a.start.localeCompare(b.start))

    return mappedDayCamp
  }, [bootcampWeeks, generalWeeks])

  const weeksById = useMemo(() => {
    const byId = {}
    for (const week of registrationWeeks) {
      byId[week.id] = week
    }
    return byId
  }, [registrationWeeks])

  const phoneScreenshots = useMemo(() => {
    const screenshotUrls = Array.isArray(adminConfig.media.levelUpScreenshotUrls)
      ? adminConfig.media.levelUpScreenshotUrls
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .filter(Boolean)
      : []
    if (screenshotUrls.length > 0) {
      return screenshotUrls
    }

    if (adminConfig.media.levelUpImageUrl && adminConfig.media.levelUpImageUrl.trim()) {
      return [adminConfig.media.levelUpImageUrl.trim()]
    }

    return []
  }, [adminConfig.media.levelUpImageUrl, adminConfig.media.levelUpScreenshotUrls])
  const isZh = language === 'zh'
  const text = (en, zh) => (isZh ? zh : en)
  const dayCampPointsBreakdown = text(
    '2,500 New England Wushu Level Up points for each full week enrollment, 500 for each full day, and 100 for each half day enrollment.',
    '每个整周报名可获 2,500 新英格兰武术 Level Up 积分，每个整日报名可获 500 积分，每个半日报名可获 100 积分。'
  )
  const dayCampPointsUseCopy = text(
    'Points can be saved for prizes, equipment, and future discounts during fall or spring season.',
    '积分可用于兑换奖品、装备，以及秋季或春季课程的后续优惠。'
  )
  const campGalleryItems = useMemo(() => {
    const surveyImages = Array.isArray(adminConfig.media.surveyStepImageUrls)
      ? adminConfig.media.surveyStepImageUrls
      : []
    return [
      { src: (adminConfig.media.heroImageUrl || '').trim(), slot: isZh ? '营地主视觉' : 'Hero Camp Moment', positionIndex: 0 },
      { src: (surveyImages[0] || '').trim(), slot: isZh ? '训练亮点' : 'Training Highlights', positionIndex: 1 },
      { src: (surveyImages[1] || '').trim(), slot: isZh ? '团队与友谊' : 'Teamwork & Friends', positionIndex: 2 },
      { src: (surveyImages[2] || '').trim(), slot: isZh ? '每周展示' : 'Weekly Showcase', positionIndex: 3 },
    ]
  }, [adminConfig.media.heroImageUrl, adminConfig.media.surveyStepImageUrls, isZh])
  function getLandingCarouselImageStyle(positionIndex) {
    const item = adminConfig.media.landingCarouselImagePositions?.[positionIndex] || {
      x: 0,
      y: 0,
      zoom: 100,
    }
    return {
      objectPosition: `${50 + Number(item.x || 0)}% ${50 + Number(item.y || 0)}%`,
      transform: `scale(${Number(item.zoom || 100) / 100})`,
      transformOrigin: 'center center',
    }
  }
  const campGalleryCount = campGalleryItems.length
  const normalizedCampGalleryIndex = campGalleryCount > 0
    ? ((campGalleryIndex % campGalleryCount) + campGalleryCount) % campGalleryCount
    : 0
  const activeCampGalleryItem = campGalleryCount > 0 ? campGalleryItems[normalizedCampGalleryIndex] : null
  const previousCampGalleryItem = campGalleryCount > 1
    ? campGalleryItems[(normalizedCampGalleryIndex - 1 + campGalleryCount) % campGalleryCount]
    : activeCampGalleryItem
  const nextCampGalleryItem = campGalleryCount > 1
    ? campGalleryItems[(normalizedCampGalleryIndex + 1) % campGalleryCount]
    : activeCampGalleryItem
  const activeCampGalleryCaption = campGalleryCaptions[normalizedCampGalleryIndex % campGalleryCaptions.length]
  const levelUpSlideCount = Math.max(phoneScreenshots.length, levelUpFeatures.length, 1)
  const activeLevelUpFeature = levelUpFeatures[levelUpSlideIndex % levelUpFeatures.length]
  const activeLevelUpScreenshotIndex =
    phoneScreenshots.length > 0 ? levelUpSlideIndex % phoneScreenshots.length : 0
  const activeLevelUpScreenshot =
    phoneScreenshots.length > 0 ? phoneScreenshots[activeLevelUpScreenshotIndex] : ''
  const levelUpRenderScale = Math.max(108, Number(adminConfig.media.levelUpScreenshotSize || 100))
  function getLevelUpScreenshotStyle(index) {
    const item = adminConfig.media.levelUpScreenshotPositions?.[index] || {
      x: 0,
      y: 0,
      zoom: 100,
    }
    return {
      objectPosition: `${50 + Number(item.x || 0)}% ${50 + Number(item.y || 0)}%`,
      transform: `scale(${Number(item.zoom || 100) / 100})`,
      transformOrigin: 'center center',
    }
  }

  const summaries = useMemo(
    () => registration.students.map((student) => ({ student, summary: getStudentSummary(student) })),
    [registration.students]
  )
  const summaryDigest = useMemo(() => {
    const totalCampDays = summaries.reduce((acc, item) => {
      const summary = item.summary
      return acc
        + summary.general.fullWeeks * 5
        + summary.general.fullDays
        + summary.general.amDays
        + summary.general.pmDays
        + summary.bootcamp.fullWeeks * 5
        + summary.bootcamp.fullDays
        + summary.bootcamp.amDays
        + summary.bootcamp.pmDays
    }, 0)
    const totalPaidLunchDays = summaries.reduce((acc, item) => acc + item.summary.lunchCount, 0)
    const totalIncludedLunchDays = summaries.reduce(
      (acc, item) => acc + getLunchDecisionStats(item.student, weeksById).includedLunchDays,
      0
    )
    return { totalCampDays, totalPaidLunchDays, totalIncludedLunchDays }
  }, [summaries, weeksById])

  const discountActive = useMemo(() => {
    if (!countdownNow) {
      return false
    }
    const end = parseDateLocal(adminConfig.tuition.discountEndDate)
    if (!end) {
      return false
    }
    const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
    return countdownNow.getTime() <= endDateTime.getTime()
  }, [adminConfig.tuition.discountEndDate, countdownNow])
  const discountCountdown = useMemo(() => {
    if (!countdownNow) {
      return null
    }
    const end = parseDateLocal(adminConfig.tuition.discountEndDate)
    if (!end) {
      return null
    }
    const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
    if (countdownNow.getTime() > endDateTime.getTime()) {
      return null
    }
    const parts = getCountdownParts(endDateTime, countdownNow)
    return {
      ...parts,
      endLabel: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  }, [adminConfig.tuition.discountEndDate, countdownNow])
  const overnightPricingRows = useMemo(() => {
    const regular = adminConfig.tuition.regular
    const discounted = adminConfig.tuition.discount
    const rows = [
      { key: 'fullWeek', label: 'Overnight Full Week', regular: Number(regular.overnightWeek || 1180), discounted: Number(discounted.overnightWeek || 980) },
      { key: 'fullDay', label: 'Overnight Full Day', regular: Number(regular.overnightDay || 0), discounted: Number(discounted.overnightDay || 0) },
    ]

    return rows.map((row) => {
      const normalizedDiscounted = row.discounted > 0 ? row.discounted : row.regular
      const effective = discountActive ? Math.min(row.regular, normalizedDiscounted) : row.regular
      const discountAmount = Math.max(0, row.regular - effective)
      return {
        ...row,
        effective,
        discountAmount,
      }
    })
  }, [adminConfig.tuition, discountActive])
  const dayCampSeasonLabel = useMemo(() => {
    const allWeeks = [...generalWeeks, ...bootcampWeeks].sort((a, b) => a.start.localeCompare(b.start))
    if (allWeeks.length === 0) {
      return 'June - August'
    }
    return `${formatDateLabel(allWeeks[0].start)} - ${formatDateLabel(allWeeks[allWeeks.length - 1].end)}`
  }, [bootcampWeeks, generalWeeks])
  const dayCampPricing = useMemo(() => {
    const regular = adminConfig.tuition.regular || {}
    const discount = adminConfig.tuition.discount || {}
    const effective = (regularValue, discountValue) => {
      const regularNumber = Number(regularValue || 0)
      const discountedNumber = Number(discountValue || 0)
      if (!discountActive) {
        return regularNumber
      }
      if (discountedNumber > 0) {
        return Math.min(regularNumber || discountedNumber, discountedNumber)
      }
      return regularNumber
    }
    const fullWeek = effective(regular.fullWeek, discount.fullWeek)
    const fullDay = effective(regular.fullDay, discount.fullDay)
    const amHalf = effective(regular.amHalf, discount.amHalf)
    const pmHalf = effective(regular.pmHalf, discount.pmHalf)
    const halfDayLow = [amHalf, pmHalf].filter((value) => value > 0).sort((a, b) => a - b)[0] || 0
    const halfDayHigh = [amHalf, pmHalf].filter((value) => value > 0).sort((a, b) => b - a)[0] || 0
    return {
      fullWeek,
      fullDay,
      amHalf,
      pmHalf,
      halfDayLow,
      halfDayHigh,
    }
  }, [adminConfig.tuition.discount, adminConfig.tuition.regular, discountActive])
  const halfDayPriceLabel = useMemo(() => {
    if (dayCampPricing.halfDayLow <= 0) {
      return ''
    }
    if (dayCampPricing.halfDayLow === dayCampPricing.halfDayHigh) {
      return `${currency(dayCampPricing.halfDayLow)}`
    }
    return `${currency(dayCampPricing.halfDayLow)} - ${currency(dayCampPricing.halfDayHigh)}`
  }, [dayCampPricing.halfDayHigh, dayCampPricing.halfDayLow])
  useEffect(() => {
    let active = true

    async function syncConfig() {
      const { data } = await fetchAdminConfigFromSupabase()
      if (active) {
        setAdminConfig(data)
      }
    }

    syncConfig()
    window.addEventListener('camp-admin-updated', syncConfig)

    return () => {
      active = false
      window.removeEventListener('camp-admin-updated', syncConfig)
    }
  }, [])

  function goToLevelUpSlide(nextIndex, direction = 'next') {
    if (levelUpSlideCount <= 0) {
      return
    }
    setSlideDirection(direction)
    setLevelUpSlideIndex(((nextIndex % levelUpSlideCount) + levelUpSlideCount) % levelUpSlideCount)
  }

  function nextLevelUpSlide() {
    goToLevelUpSlide(levelUpSlideIndex + 1, 'next')
  }

  function previousLevelUpSlide() {
    goToLevelUpSlide(levelUpSlideIndex - 1, 'prev')
  }

  function onLevelUpTouchStart(event) {
    slideTouchStartRef.current = event.changedTouches[0]?.clientX || 0
  }

  function onLevelUpTouchEnd(event) {
    const endX = event.changedTouches[0]?.clientX || 0
    const delta = endX - slideTouchStartRef.current
    if (Math.abs(delta) < 40) {
      return
    }
    if (delta < 0) {
      nextLevelUpSlide()
    } else {
      previousLevelUpSlide()
    }
  }

  function goToCampGallerySlide(nextIndex, direction = 'next') {
    if (campGalleryCount <= 0) {
      return
    }
    setCampGalleryDirection(direction)
    setCampGalleryIndex(((nextIndex % campGalleryCount) + campGalleryCount) % campGalleryCount)
  }

  function nextCampGallerySlide() {
    goToCampGallerySlide(campGalleryIndex + 1, 'next')
  }

  function previousCampGallerySlide() {
    goToCampGallerySlide(campGalleryIndex - 1, 'prev')
  }

  function onCampGalleryTouchStart(event) {
    campGalleryTouchStartRef.current = event.changedTouches?.[0]?.clientX || 0
  }

  function onCampGalleryTouchEnd(event) {
    const endX = event.changedTouches?.[0]?.clientX || 0
    const delta = endX - campGalleryTouchStartRef.current
    if (Math.abs(delta) < 24) {
      return
    }
    if (delta < 0) {
      nextCampGallerySlide()
    } else {
      previousCampGallerySlide()
    }
  }

  useEffect(() => {
    if (levelUpSlideCount <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSlideDirection('next')
      setLevelUpSlideIndex((current) => (current + 1) % levelUpSlideCount)
    }, 2500)

    return () => window.clearInterval(timer)
  }, [levelUpSlideCount])

  useEffect(() => {
    if (typeof window === 'undefined' || isRegistrationRoute) {
      return
    }
    if (window.location.hash === '#camp-info') {
      setEntryMode('register')
    }
  }, [isRegistrationRoute])

  useEffect(() => {
    setCountdownNow(new Date())
    const timer = window.setInterval(() => {
      setCountdownNow(new Date())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(surveyData))
  }, [surveyData])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SURVEY_STEP_DRAFT_KEY, String(surveyStep))
  }, [surveyStep])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(ASSISTANT_COLLAPSED_KEY, assistantCollapsed ? '1' : '0')
    } catch {
      return undefined
    }
  }, [assistantCollapsed])

  useEffect(() => {
    function syncViewport() {
      const mobile = window.matchMedia('(max-width: 700px)').matches
      setIsMobileViewport(mobile)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    const draft = readRegistrationDraft()
    if (draft?.registration) {
      setRegistration({
        location:
          typeof draft.registration.location === 'string' ? draft.registration.location : '',
        parentName:
          typeof draft.registration.parentName === 'string' ? draft.registration.parentName : '',
        contactEmail:
          typeof draft.registration.contactEmail === 'string' ? draft.registration.contactEmail : '',
        contactPhone:
          typeof draft.registration.contactPhone === 'string' ? draft.registration.contactPhone : '',
        paymentMethod:
          typeof draft.registration.paymentMethod === 'string' ? draft.registration.paymentMethod : '',
        students:
          Array.isArray(draft.registration.students) && draft.registration.students.length
            ? draft.registration.students.map(normalizeStudentDraft)
            : [createStudent('student-1')],
      })

      const draftStep = Number(draft.step)
      if (Number.isFinite(draftStep)) {
        setStep(Math.max(1, Math.min(registrationSteps.length, draftStep)))
      }
      if (typeof draft.activeStudentId === 'string') {
        setActiveStudentId(draft.activeStudentId)
      }
      if (typeof draft.expandedStudentId === 'string') {
        setExpandedStudentId(draft.expandedStudentId)
      }
    }

    setDraftReady(true)
  }, [])

  useEffect(() => {
    if (!draftReady || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      REGISTRATION_DRAFT_KEY,
      JSON.stringify({
        step,
        activeStudentId,
        expandedStudentId,
        registration,
      })
    )
  }, [activeStudentId, draftReady, expandedStudentId, registration, step])

  useEffect(() => {
    if (expandedStudentId || activeStudentId) {
      return
    }
    const firstStudentId = registration.students[0]?.id || ''
    if (firstStudentId) {
      setExpandedStudentId(firstStudentId)
      setActiveStudentId(firstStudentId)
    }
  }, [activeStudentId, expandedStudentId, registration.students])

  function jumpToRegistration() {
    if (!isRegistrationRoute) {
      router.push('/register')
      return
    }
    setEntryMode('register')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    }
  }

  function jumpToCampTop() {
    if (isRegistrationRoute) {
      router.push('/#camp-info')
      return
    }
    setEntryMode('register')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        document.getElementById('camp-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    }
  }

  function jumpToSurvey() {
    surveyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function updateSurveyField(field, value) {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyData((current) => ({ ...current, [field]: value }))
  }

  function toggleSurveyActivity(activity) {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyData((current) => ({
      ...current,
      activityInterests: current.activityInterests.includes(activity)
        ? current.activityInterests.filter((item) => item !== activity)
        : [...current.activityInterests, activity],
    }))
  }

  function setSurveySportsParticipation(value) {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyData((current) => ({
      ...current,
      hasSports: value,
      sportsList: value === 'yes' ? current.sportsList : '',
      noSportsPriority: value === 'no' ? current.noSportsPriority : [],
    }))
  }

  function toggleNoSportsPriority(priority) {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyData((current) => {
      const selected = Array.isArray(current.noSportsPriority) ? current.noSportsPriority : []
      if (selected.includes(priority)) {
        return {
          ...current,
          noSportsPriority: selected.filter((item) => item !== priority),
        }
      }
      if (selected.length >= 3) {
        return current
      }
      return {
        ...current,
        noSportsPriority: [...selected, priority],
      }
    })
  }

  async function saveSurveyProfileLead(lastCompletedStep, sourceData = surveyData) {
    const normalizedEmail = String(sourceData.contactEmail || '').trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return null
    }

    const camperAges = sourceData.camperAges
      .map((age) => Number(age || 0))
      .filter((age) => Number.isFinite(age) && age > 0)
    const surveyContext = {
      camperCount: Math.max(1, Number(sourceData.camperCount || 1)),
      camperAges,
      hasSports: sourceData.hasSports || null,
      sportsList: sourceData.sportsList?.trim() || '',
      noSportsPriority:
        Array.isArray(sourceData.noSportsPriority) && sourceData.noSportsPriority.length > 0
          ? sourceData.noSportsPriority
          : null,
      hasMartial: sourceData.hasMartial || null,
      martialYears: Number(sourceData.martialYears || 0),
      martialMonths: Number(sourceData.martialMonths || 0),
      goals: sourceData.goals,
      activityInterests: sourceData.activityInterests,
      lunchInterest: sourceData.lunchInterest || null,
      registrationIntent: sourceData.registrationIntent || null,
    }
    const payload = {
      email: normalizedEmail,
      camper_count: Math.max(1, Number(sourceData.camperCount || 1)),
      camper_ages: camperAges,
      profile_context: surveyContext,
      last_completed_step: Number(lastCompletedStep) || 1,
    }

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: 'summer-camp-program-finder',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        return new Error(result?.error || 'Lead capture failed.')
      }
      return null
    } catch (error) {
      return error instanceof Error ? error : new Error('Lead capture failed.')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    if (surveyLeadAutosaveTimerRef.current) {
      window.clearTimeout(surveyLeadAutosaveTimerRef.current)
    }

    const normalizedEmail = String(surveyData.contactEmail || '').trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return undefined
    }

    surveyLeadAutosaveTimerRef.current = window.setTimeout(async () => {
      await saveSurveyProfileLead(surveyStep, {
        ...surveyData,
        contactEmail: normalizedEmail,
      })
    }, 450)

    return () => {
      if (surveyLeadAutosaveTimerRef.current) {
        window.clearTimeout(surveyLeadAutosaveTimerRef.current)
      }
    }
  }, [saveSurveyProfileLead, surveyData, surveyStep])

  async function saveRegistrationLead(sourceRegistration = registration) {
    const normalizedEmail = String(sourceRegistration.contactEmail || '').trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return null
    }

    const camperAges = (Array.isArray(sourceRegistration.students) ? sourceRegistration.students : [])
      .map((student) => calcAge(student?.dob))
      .filter((age) => Number.isFinite(age) && age > 0)

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          camper_count: Math.max(1, Number(sourceRegistration.students?.length || 1)),
          camper_ages: camperAges,
          last_completed_step: Math.max(1, Number(step || 1)),
          source: 'summer-camp-registration',
          profile_context: {
            flow: 'registration',
            registrationStep: Math.max(1, Number(step || 1)),
            parentName: String(sourceRegistration.parentName || '').trim(),
            contactPhone: String(sourceRegistration.contactPhone || '').trim(),
            location: String(sourceRegistration.location || '').trim(),
            paymentMethod: String(sourceRegistration.paymentMethod || '').trim(),
            camperNames: (Array.isArray(sourceRegistration.students) ? sourceRegistration.students : [])
              .map((student, index) => String(student?.fullName || '').trim() || `Camper ${index + 1}`)
              .filter(Boolean),
          },
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        return new Error(result?.error || 'Registration lead capture failed.')
      }
      return null
    } catch (error) {
      return error instanceof Error ? error : new Error('Registration lead capture failed.')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    if (registrationLeadAutosaveTimerRef.current) {
      window.clearTimeout(registrationLeadAutosaveTimerRef.current)
    }

    const normalizedEmail = String(registration.contactEmail || '').trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return undefined
    }

    registrationLeadAutosaveTimerRef.current = window.setTimeout(() => {
      saveRegistrationLead({
        ...registration,
        contactEmail: normalizedEmail,
      })
    }, 500)

    return () => {
      if (registrationLeadAutosaveTimerRef.current) {
        window.clearTimeout(registrationLeadAutosaveTimerRef.current)
      }
    }
  }, [registration, step])

  function setSurveyCamperCount(value) {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) {
      setSurveyData((current) => ({ ...current, camperCount: '', camperAges: [] }))
      return
    }
    const count = Math.max(1, Math.min(6, Number(cleaned)))
    setSurveyData((current) => {
      const nextAges = Array.from({ length: count }).map((_, index) => current.camperAges[index] || '')
      return {
        ...current,
        camperCount: String(count),
        camperAges: nextAges,
      }
    })
  }

  function setSurveyCamperAge(index, value) {
    const cleaned = value.replace(/\D/g, '')
    setSurveyData((current) => ({
      ...current,
      camperAges: current.camperAges.map((age, ageIndex) => (ageIndex === index ? cleaned : age)),
    }))
  }

  function toggleSurveyGoal(goal) {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyData((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }))
  }

  function getSurveyFeedback(step) {
    const camperCount = Math.max(1, Number(surveyData.camperCount || 1))
    const ages = surveyData.camperAges.map((age) => Number(age || 0)).filter((age) => age > 0)
    const allUnder6 = ages.length > 0 && ages.every((age) => age < 6)
    const hasYoungCamper = ages.some((age) => age <= 6)
    const hasFiveToNine = ages.some((age) => age >= 5 && age <= 9)
    const minAge = ages.length > 0 ? Math.min(...ages) : 0
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0
    const hasWideSiblingRange = camperCount > 1 && ages.length > 1 && maxAge - minAge >= 3
    const familyLine =
      camperCount > 1
        ? text(
            'Good news: sibling discount is available, and camp is a great way for family and friends to spend summer time together through team-building activities.',
            '好消息：兄弟姐妹可享优惠，营地也通过团队活动帮助家人和朋友共度高质量暑期时光。'
          )
        : text(
            'Camp is also a great place to make new friends, with many team-building activities built into each week.',
            '营地也是结识新朋友的好地方，每周都有丰富的团队协作活动。'
          )

    if (step === 1) {
      const stepOneLines = []
      if (allUnder6) {
        stepOneLines.push(
          text(
            'Great fit: for campers under 6, General Camp is usually the best starting point.',
            '非常适合：6岁以下营员通常最适合从普通营开始。'
          )
        )
      } else {
        stepOneLines.push(text('Thanks for sharing your camper ages.', '感谢您提供营员年龄信息。'))
      }
      if (hasYoungCamper) {
        stepOneLines.push(text('We have dedicated programs for young campers ages 6 and under.', '我们为6岁及以下小营员设置了专属课程。'))
      }
      if (hasFiveToNine) {
        stepOneLines.push(text('Ages 5-9 are a great age to start Wushu.', '5-9岁是开始武术训练的黄金年龄。'))
      }
      if (hasWideSiblingRange) {
        stepOneLines.push(text('We accept and coach a wide range of sibling age groups in the same season.', '我们可在同一季为不同年龄段兄弟姐妹提供分层训练。'))
      }
      stepOneLines.push(familyLine)
      return stepOneLines.join(' ')
    }
    if (step === 2) {
      if (surveyData.hasSports === 'yes') {
        return text(
          'Excellent. Next we will capture current sports so our coaches can tailor a high-impact skill transfer plan for your camper.',
          '非常好。下一步我们会了解当前运动背景，便于教练制定更高效的能力迁移训练方案。'
        )
      }
      return text(
        'Great starting point. Next we will identify your top priorities so we can build a personalized and confidence-focused starter path.',
        '这是很好的起点。下一步我们会确认优先提升目标，制定更个性化且注重自信建立的起步路径。'
      )
    }
    if (step === 3) {
      const hasOlderCamper = ages.some((age) => age > 9)
      const olderCamperLine = hasOlderCamper
        ? 'For older kids, Wushu is especially effective for building discipline, athletic performance, confidence, and leadership.'
        : ''
      if (surveyData.hasSports === 'yes' && surveyData.sportsList.trim()) {
        return `Great - ${surveyData.sportsList} is an excellent base. Wushu will sharpen coordination, flexibility, balance, speed, and body control to elevate overall athletic performance.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
      }
      if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length > 0) {
        return `Great focus. We will help build ${surveyData.noSportsPriority.join(', ')} with clear coaching progress from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
      }
      return `Many of our students start with no sports experience. Our progression system builds coordination, strength, flexibility, confidence, and focus from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
    }
    if (step === 4) {
      return surveyData.hasMartial === 'yes'
        ? text(
            'Outstanding. Prior martial arts experience gives your camper a strong advantage. Next we will capture years/months to place them in the right level and accelerate progress from day one.',
            '非常棒。已有武术经历会为营员带来明显优势。下一步我们将记录训练年限，以便精准分层并从第一天就高效进步。'
          )
        : text(
            'Perfectly fine. Many of our strongest campers start with no martial arts background. Next we will align goals and schedule preferences for the best fit.',
            '完全没问题。我们很多表现优秀的营员都从零基础开始。下一步我们会匹配目标与日程偏好，给出最合适方案。'
          )
    }
    if (step === 5) {
      if (surveyData.hasMartial === 'yes') {
        const years = Number(surveyData.martialYears || 0)
        const months = Number(surveyData.martialMonths || 0)
        const totalYears = years + months / 12
        if (totalYears >= 3) {
          return text(
            'Excellent foundation. Your martial arts experience aligns well with advanced training pathways and leadership-focused coaching.',
            '基础非常优秀。您的武术经历很适合进阶训练路径与领导力导向培养。'
          )
        }
        return text(
          'Strong foundation. We can build quickly from your current level with clear weekly progression targets.',
          '基础很好。我们可在现有水平上快速进阶，并设定清晰的每周成长目标。'
        )
      }
      return text(
        'Great choice. New students do very well in our structured progression model with close coach guidance.',
        '非常好的选择。新学员在我们结构化进阶体系和教练细致指导下通常提升很快。'
      )
    }
    if (step === 6) {
      const selectedActivities = surveyData.activityInterests
        .map((value) => surveyActivities.find((item) => item.value === value)?.label)
        .filter(Boolean)
      const activityLine =
        selectedActivities.length > 0
          ? `Great picks: ${selectedActivities.join(', ')}. We include similar training blocks every week to keep campers engaged and progressing.`
          : 'Great direction. We balance skill work, movement, and fun engagement every week.'
      const campWindow = registrationWeeks.length
        ? `Camp runs ${formatWeekLabel({
            start: registrationWeeks[0].start,
            end: registrationWeeks[registrationWeeks.length - 1].end,
          })}.`
        : 'Camp start/end dates are posted in the dates section.'
      const scheduleLine =
        'Typical week: Mon footwork/team games, Tue technique stations, Wed agility/partner drills, Thu mini challenges, Fri showcase prep.'
      if (surveyData.goals.includes('competition')) {
        return `${activityLine} ${scheduleLine} ${campWindow} Awesome goal. Competition Team Boot Camp will likely be a strong match.`
      }
      if (surveyData.lunchInterest === 'yes') {
        return `${activityLine} ${scheduleLine} ${campWindow} Lunch can be added by day in registration, making full camp weeks easier for busy family schedules.`
      }
      if (surveyData.goals.includes('social/teamwork/friends')) {
        return `${activityLine} ${scheduleLine} ${campWindow} Camp is designed to build teamwork, friendships, and social confidence through daily group activities.`
      }
      return `${activityLine} ${scheduleLine} ${campWindow} We will match your family with a balanced and fun progression path.`
    }
    return ''
  }

  function getSurveyDidYouKnowFact() {
    const hasFiveToNine = surveyData.camperAges
      .map((age) => Number(age || 0))
      .some((age) => age >= 5 && age <= 9)

    if (surveyStep === 1) {
      return hasFiveToNine
        ? text(
            'Most of our top athletes started training between ages 5 and 9.',
            '我们很多顶尖学员都是在5到9岁开始训练的。'
          )
        : text(
            'We coach multiple age groups every week with level-based training tracks.',
            '我们每周提供分龄分级训练，覆盖多个年龄层。'
          )
    }

    if (surveyStep === 2) {
      return text(
        'Wushu helps athletes improve balance, mobility, coordination, speed, and focus across many sports.',
        '武术能显著提升平衡、协调、灵活性、速度和专注力。'
      )
    }

    if (surveyStep === 3) {
      return text(
        'We map your current sports background to Wushu training plans for faster progress transfer.',
        '我们会把现有运动背景映射到武术训练中，帮助更快迁移与进步。'
      )
    }

    if (surveyStep === 4) {
      return text(
        'Our academy has earned 500+ competition medals, and experienced coaches support both beginner and advanced pathways.',
        '学院已获得500+奖牌，经验教练可同时支持零基础与进阶路径。'
      )
    }

    if (surveyStep === 5) {
      return text(
        'Martial arts experience is optional. Many strong students start with no prior experience.',
        '无需武术基础，很多优秀学员都是从零开始。'
      )
    }

    if (surveyStep === 6) {
      return text(
        'Families can choose lunch by day during registration, making weekly planning easier.',
        '报名时可按天选择午餐，周计划更轻松。'
      )
    }

    if (surveyStep === 7) {
      return text(
        'You can mix General Camp and Competition Team Boot Camp by week based on your goals.',
        '可根据目标按周组合普通营与竞赛集训营。'
      )
    }

    return ''
  }

  function getGoalsEncouragement() {
    if (surveyData.goals.length === 0) {
      return ''
    }

    if (surveyData.goals.includes('competition')) {
      return 'Excellent goal. We will map a progression path that builds skills for confident competition performance.'
    }
    if (surveyData.goals.includes('social/teamwork/friends')) {
      return 'Great goal. Camp includes partner drills and team activities that build friendships and social confidence.'
    }
    if (surveyData.goals.includes('exercise')) {
      return 'Great choice. Training builds athleticism, flexibility, and strong movement habits.'
    }

    return 'Love it. We keep training fun while building real skill and confidence each week.'
  }

  function buildSurveyRecommendation() {
    const camperCount = Math.max(1, Number(surveyData.camperCount || 1))
    const ages = surveyData.camperAges.map((age) => Number(age || 0)).filter((age) => age > 0)
    const allUnder6 = ages.length > 0 && ages.every((age) => age < 6)
    const hasCompetitionGoal = surveyData.goals.includes('competition')
    const martialYears = Number(surveyData.martialYears || 0) + Number(surveyData.martialMonths || 0) / 12
    const recommendCompetition = !allUnder6 && (hasCompetitionGoal || martialYears >= 3)

    const lines = []
    if (registrationWeeks.length) {
      lines.push(
        `${text('Camp season', '营期时间')}: ${formatWeekLabel({
          start: registrationWeeks[0].start,
          end: registrationWeeks[registrationWeeks.length - 1].end,
        })}.`
      )
    }
    if (allUnder6) {
      lines.push(text('Best fit: General Camp (100% recommendation for under-6 campers).', '最佳匹配：普通营（6岁以下建议优先100%匹配）。'))
    } else if (recommendCompetition) {
      lines.push(text('Best fit: Competition Team Boot Camp.', '最佳匹配：竞赛队集训营。'))
      lines.push(text('Suggested start: minimum 2 weeks of Competition Team Boot Camp for best skill learning.', '建议起步：至少2周竞赛队集训营，以获得更好的技能提升效果。'))
    } else {
      lines.push(text('Best fit: General Camp with progression options as skills improve.', '最佳匹配：普通营，并可随能力提升逐步进阶。'))
      lines.push(text('Suggested start: minimum 2 weeks for stronger skill retention and confidence gains.', '建议起步：至少2周，更有助于技能巩固与自信提升。'))
    }
    if (camperCount > 1) {
      lines.push(text('Sibling discount is available for your family.', '您的家庭可享兄弟姐妹优惠。'))
      lines.push(
        text(
          'Camp includes lots of team-building activities, making it a great way for family and friends to spend time together in the summer.',
          '营地有丰富团队活动，非常适合家人和朋友在夏天共同成长与互动。'
        )
      )
    } else {
      lines.push(text('Camp is a great place to make new friends through many team-building activities each week.', '营地是结交新朋友的好地方，每周都有丰富团队协作活动。'))
    }
    if (surveyData.goals.includes('social/teamwork/friends')) {
      lines.push(text('You selected social/teamwork goals: we include guided partner drills and group challenges every week.', '您选择了社交/团队目标：我们每周都有搭档训练与团队挑战。'))
    }
    if (surveyData.lunchInterest === 'yes') {
      lines.push(text('You marked lunch convenience as important: lunch can be selected by day during registration.', '您重视午餐便利：报名时可按天选择午餐。'))
    }
    lines.push(text('You can still mix General Camp and Competition Team Boot Camp by week.', '您也可以按周组合普通营与竞赛队集训营。'))
    lines.push(
      text(
        'New England Wushu is awarded Best in Burlington and recognized as a top academy in the area, led by certified top coaches.',
        '新英格兰武术学院获评伯灵顿最佳之一，由认证顶级教练团队带领。'
      )
    )
    return lines
  }

  function validateSurveyStep(step) {
    if (step === 1) {
      const email = surveyData.contactEmail.trim()
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return text('Please enter a valid email address.', '请输入有效邮箱地址。')
      }
      const count = Number(surveyData.camperCount || 0)
      if (!count || count < 1) {
        return text('Enter number of campers.', '请输入营员人数。')
      }
      const missingAges = surveyData.camperAges.some((age) => !age)
      if (missingAges) {
        return text('Enter age for each camper.', '请填写每位营员年龄。')
      }
    }

    if (step === 2) {
      if (!surveyData.hasSports) {
        return text('Select whether your child has sports participation.', '请选择孩子是否有运动参与经历。')
      }
    }

    if (step === 3) {
      if (surveyData.hasSports === 'yes' && !surveyData.sportsList.trim()) {
        return text('Enter the sports your child participates in.', '请填写孩子参与过的运动项目。')
      }
      if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length === 0) {
        return text('Select what you want your child to build first.', '请选择希望孩子优先提升的方向。')
      }
    }

    if (step === 4) {
      if (!surveyData.hasMartial) {
        return text('Select whether your child has martial arts experience.', '请选择孩子是否有武术经历。')
      }
    }

    if (step === 6) {
      if (!surveyData.lunchInterest) {
        return text('Select whether lunch convenience would help your family schedule.', '请选择午餐服务是否有助于家庭安排。')
      }
      if (surveyData.activityInterests.length === 0) {
        return text('Select at least one preferred activity so we can tailor the fit.', '请至少选择一项活动偏好，便于我们匹配方案。')
      }
      if (surveyData.goals.length === 0) {
        return text('Select at least one goal so we can personalize recommendations.', '请至少选择一个目标，便于个性化推荐。')
      }
    }

    return ''
  }

  async function nextSurveyStep() {
    const error = validateSurveyStep(surveyStep)
    if (error) {
      setSurveyMessage(error)
      return
    }
    if (surveyAwaitingAdvanceStep !== surveyStep) {
      setSurveyStepFeedback(getSurveyFeedback(surveyStep))
      setSurveyAwaitingAdvanceStep(surveyStep)
      setSurveyMessage(text('Tap Continue.', '点击继续。'))
      return
    }
    if (surveyStep === 1) {
      setSavingSurveyProfile(true)
      const saveError = await saveSurveyProfileLead(1)
      setSavingSurveyProfile(false)
      if (saveError) {
        setSurveyMessage(`Could not save email profile: ${saveError.message}`)
        return
      }
      try {
        await fetch('/api/email/lead-journey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'enqueue',
            payload: {
              contactEmail: surveyData.contactEmail.trim(),
              guardianName: surveyData.contactEmail.trim(),
              submittedAt: new Date().toISOString(),
              recommendation: '',
              summaryLines: [
                `Camper count: ${Math.max(1, Number(surveyData.camperCount || 1))}`,
                `Camper ages: ${(surveyData.camperAges || []).filter(Boolean).join(', ') || 'n/a'}`,
                'Lead source: Survey Step 1 submission',
              ],
              registrationLink:
                'https://summer.newushu.com/register',
            },
          }),
        })
      } catch {
        // Non-blocking: survey should continue even if lead enqueue is temporarily unavailable.
      }
    } else {
      const saveError = await saveSurveyProfileLead(surveyStep)
      if (saveError) {
        setSurveyMessage(`Could not save survey context: ${saveError.message}`)
        return
      }
    }
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyMessage('')
    setSurveyDirection('next')
    setSurveyStep((current) => {
      const next = Math.min(current + 1, SURVEY_TOTAL_STEPS)
      return next
    })
  }

  function previousSurveyStep() {
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyMessage('')
    setSurveyDirection('prev')
    setSurveyStep((current) => Math.max(current - 1, 1))
  }

  function chooseLearnPath() {
    setAssistantCollapsed(false)
    setEntryMode('learn')
    setSurveyStep(1)
    setSurveyAwaitingAdvanceStep(null)
    setSurveyStepFeedback('')
    setSurveyMessage('')
    setSurveyDirection('next')
    if (!isMobileViewport) {
      jumpToSurvey()
    }
  }

  async function handleThinkAboutIt() {
    setSurveyData((current) => ({ ...current, registrationIntent: 'think' }))
    const saveError = await saveSurveyProfileLead(SURVEY_TOTAL_STEPS)
    if (saveError) {
      setSurveyMessage(`Could not save follow-up intent: ${saveError.message}`)
      return
    }
    try {
      const recommendationLines = buildSurveyRecommendation()
      const summaryLines = [
        `Camper count: ${Math.max(1, Number(surveyData.camperCount || 1))}`,
        `Camper ages: ${(surveyData.camperAges || []).filter(Boolean).join(', ') || 'n/a'}`,
        `Sports participation: ${surveyData.hasSports || 'n/a'}`,
        `Martial arts experience: ${surveyData.hasMartial || 'n/a'}`,
        `Goals: ${(surveyData.goals || []).join(', ') || 'n/a'}`,
        `Lunch convenience: ${surveyData.lunchInterest || 'n/a'}`,
      ]
      await fetch('/api/email/lead-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue',
          payload: {
            contactEmail: surveyData.contactEmail.trim(),
            guardianName: surveyData.contactEmail.trim(),
            submittedAt: new Date().toISOString(),
            recommendation: recommendationLines.join(' '),
            summaryLines,
            registrationLink:
              'https://summer.newushu.com/register',
          },
        }),
      })
    } catch {
      // Non-blocking: survey completion should still succeed even if journey enqueue is temporarily unavailable.
    }
    setSurveyMessage('Great. We will follow up with useful info while you think it over.')
  }

  async function handleReadyToRegister() {
    setSurveyData((current) => ({ ...current, registrationIntent: 'ready' }))
    await saveSurveyProfileLead(SURVEY_TOTAL_STEPS)
    jumpToRegistration()
  }

  function updateContactForm(field, value) {
    setContactForm((current) => ({ ...current, [field]: value }))
  }

  function submitContact(event) {
    event.preventDefault()
    const subject = encodeURIComponent(`Summer Camp Question from ${contactForm.name || 'Family'}`)
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    )
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    }
    setContactMessage('Opening your email app. If it does not open, email us directly.')
  }

  function localizeTestimonialValue(value, fallbackValue) {
    if (language !== 'zh') {
      return value || fallbackValue
    }
    if (!value) {
      return fallbackValue
    }
    return testimonialTranslationMap[value] || value
  }

  function previousTestimonial() {
    if (featuredTestimonials.length <= 1) {
      return
    }
    setTestimonialIndex((current) => (current - 1 + featuredTestimonials.length) % featuredTestimonials.length)
  }

  function nextTestimonial() {
    if (featuredTestimonials.length <= 1) {
      return
    }
    setTestimonialIndex((current) => (current + 1) % featuredTestimonials.length)
  }

  function markRegistrationPending() {
    if (submittedRegistrationSnapshot) {
      setSubmittedRegistrationSnapshot(null)
    }
    if (registrationEmailResult) {
      setRegistrationEmailResult(null)
    }
  }

  function updateContact(field, value) {
    markRegistrationPending()
    setRegistration((current) => {
      if (field !== 'location') {
        return { ...current, [field]: value }
      }

      const allowedGeneralWeekIds = new Set(
        getSelectedWeeks('general', getGeneralProgramForLocation(adminConfig.programs.general, value)).map(
          (week) => `daycamp:${week.start}`
        )
      )

      return {
        ...current,
        [field]: value,
        students: current.students.map((student) => {
          const nextSchedule = { ...student.schedule }
          const nextLunch = { ...student.lunch }

          for (const [weekId, entry] of Object.entries(student.schedule || {})) {
            if (entry?.campType !== 'general') {
              continue
            }
            if (allowedGeneralWeekIds.has(weekId)) {
              continue
            }
            delete nextSchedule[weekId]
            for (const dayKey of Object.keys(entry?.days || {})) {
              delete nextLunch[`${weekId}:${dayKey}`]
            }
          }

          return {
            ...student,
            schedule: nextSchedule,
            lunch: nextLunch,
          }
        }),
      }
    })
  }

  function updateStudentField(studentId, field, value) {
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [field]: value,
            }
          : student
      ),
    }))
  }

  function addStudent() {
    if (registration.students.length >= MAX_CAMPERS) {
      setMessage(`You can add up to ${MAX_CAMPERS} campers.`)
      return
    }

    markRegistrationPending()
    const next = createStudent()
    setRegistration((current) => ({
      ...current,
      students: [...current.students, next],
    }))
    setActiveStudentId(next.id)
    setExpandedStudentId(next.id)
  }

  function removeStudent(studentId) {
    markRegistrationPending()
    setRegistration((current) => {
      const remaining = current.students.filter((student) => student.id !== studentId)
      return {
        ...current,
        students: remaining.length ? remaining : [createStudent()],
      }
    })

    if (activeStudentId === studentId) {
      setActiveStudentId('')
    }
    if (expandedStudentId === studentId) {
      setExpandedStudentId('')
    }
  }

  function confirmAndRemoveStudent(studentId) {
    if (registration.students.length <= 1) {
      return
    }
    const studentIndex = registration.students.findIndex((student) => student.id === studentId)
    const student = registration.students[studentIndex]
    if (!student) {
      return
    }
    const label = student.fullName.trim() || `Camper ${studentIndex + 1}`
    const confirmed =
      typeof window === 'undefined'
        ? true
        : window.confirm(
            text(
              `This will remove camper ${label} from registration.`,
              `这将把营员 ${label} 从报名中移除。`
            )
          )
    if (!confirmed) {
      return
    }
    removeStudent(studentId)
  }

  function clearRegistrationForm() {
    markRegistrationPending()
    setRegistration({
      location: '',
      parentName: '',
      contactEmail: '',
      contactPhone: '',
      paymentMethod: '',
      students: [createStudent('student-1')],
    })
    setActiveStudentId('')
    setExpandedStudentId('')
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setStep(1)
    setRegistrationDiscountClaimed(false)
    setRegistrationEmailResult(null)
    setSummaryEmailSending(false)
    setSummaryEmailLocked(false)
    setMessage('Form cleared.')
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REGISTRATION_DRAFT_KEY)
    }
  }

  function activateCamper(studentId) {
    setActiveStudentId(studentId)
    setExpandedStudentId(studentId)

    if (step === 1 && typeof document !== 'undefined') {
      window.setTimeout(() => {
        const target = document.querySelector(`#reg-student-fullname-${studentId}`)
        scrollElementIntoFocusZone(target)
      }, 140)
    }
  }

  function setStudentWeek(studentId, week, updater) {
    markRegistrationPending()
    const weekDayKeys = week.days.map((item) => item.key)
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const currentEntry = student.schedule[week.id] || {
          weekId: week.id,
          programKey: week.programKey,
          campType: week.programKey === 'daycamp' ? '' : week.programKey,
          days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
        }

        const updatedEntry = updater(currentEntry)
        const dayModes = weekDayKeys.map((day) => updatedEntry.days?.[day] || 'NONE')
        const hasAnyDay = dayModes.some((mode) => mode !== 'NONE')

        const nextSchedule = { ...student.schedule }
        const nextLunch = { ...student.lunch }

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

        return {
          ...student,
          schedule: nextSchedule,
          lunch: nextLunch,
        }
      }),
    }))
  }

  function setDayCampType(studentId, week, campType) {
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const existing = student.schedule[week.id] || {
          weekId: week.id,
          programKey: week.programKey,
          campType: '',
          days: dayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
        }

        return {
          ...student,
          schedule: {
            ...student.schedule,
            [week.id]: {
              ...existing,
              campType,
            },
          },
        }
      }),
    }))
  }

  function toggleFullWeek(studentId, week) {
    if (week.programKey === 'daycamp') {
      const student = registration.students.find((item) => item.id === studentId)
      const campType = student?.schedule?.[week.id]?.campType || ''
      if (!campType) {
        setMessage('Select General or Boot Camp for this week first.')
        return
      }
    }

    const weekDayKeys = week.days.map((item) => item.key)
    setStudentWeek(studentId, week, (entry) => {
      const alreadyFull = weekDayKeys.every((day) => (entry.days?.[day] || 'NONE') === 'FULL')
      return {
        ...entry,
        days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: alreadyFull ? 'NONE' : 'FULL' }), {}),
      }
    })
  }

  function cycleDay(studentId, week, day) {
    if (week.programKey === 'daycamp') {
      const student = registration.students.find((item) => item.id === studentId)
      const campType = student?.schedule?.[week.id]?.campType || ''
      if (!campType) {
        setMessage('Select General or Boot Camp for this week first.')
        return
      }
    }

    setStudentWeek(studentId, week, (entry) => {
      const currentMode = entry.days?.[day] || 'NONE'
      return {
        ...entry,
        days: {
          ...entry.days,
          [day]: nextMode[currentMode],
        },
      }
    })
  }

  function toggleLunch(studentId, weekId, day) {
    if (isIncludedLunchDay(day)) {
      setMessage('Thursday BBQ lunch is already included. You can still pack lunch if preferred.')
      return
    }
    const key = `${weekId}:${day}`
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const nextLunch = {
          ...student.lunch,
          [key]: !student.lunch[key],
        }
        const hasAnyLunch = Object.values(nextLunch).some(Boolean)

        return {
          ...student,
          lunch: nextLunch,
          lunchConfirmedNone: hasAnyLunch ? false : student.lunchConfirmedNone,
        }
      }),
    }))
  }

  function setLunchConfirmedNone(studentId, confirmed) {
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              lunchConfirmedNone: Boolean(confirmed),
            }
          : student
      ),
    }))
  }

  function getSelectableLunchDayKeysForStudent(student) {
    const keys = new Set()
    for (const [weekId, entry] of Object.entries(student.schedule || {})) {
      for (const [dayKey, mode] of Object.entries(entry.days || {})) {
        if (mode && mode !== 'NONE' && !isIncludedLunchDay(dayKey)) {
          keys.add(`${weekId}:${dayKey}`)
        }
      }
    }
    return keys
  }

  function clearActiveStudentSchedule() {
    if (!activeStudent) {
      return
    }
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              schedule: {},
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setMessage('Cleared all selected weeks/times for active camper.')
  }

  function copyScheduleFromCamper(sourceId) {
    if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
      return
    }
    const sourceStudent = registration.students.find((student) => student.id === sourceId)
    if (!sourceStudent) {
      return
    }

    const copiedSchedule = Object.fromEntries(
      Object.entries(sourceStudent.schedule || {}).map(([weekId, entry]) => [
        weekId,
        {
          ...entry,
          days: { ...(entry.days || {}) },
        },
      ])
    )

    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              schedule: copiedSchedule,
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setMessage('Copied weeks/times from selected camper.')
  }

  function clearActiveStudentLunch() {
    if (!activeStudent) {
      return
    }
    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedLunchWeekKey('')
    setMessage('Cleared all lunch selections for active camper.')
  }

  function copyLunchFromCamper(sourceId) {
    if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
      return
    }
    const sourceStudent = registration.students.find((student) => student.id === sourceId)
    if (!sourceStudent) {
      return
    }

    const allowedKeys = getSelectableLunchDayKeysForStudent(activeStudent)
    const copiedLunch = Object.fromEntries(
      Object.entries(sourceStudent.lunch || {}).filter(
        ([key, value]) => value && allowedKeys.has(key) && isPaidLunchSelectionKey(key)
      )
    )
    const hasAnyCopiedLunch = Object.values(copiedLunch).some(Boolean)

    markRegistrationPending()
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              lunch: copiedLunch,
              lunchConfirmedNone: hasAnyCopiedLunch ? false : Boolean(sourceStudent.lunchConfirmedNone),
            }
          : student
      ),
    }))
    setExpandedLunchWeekKey('')
    setMessage('Copied lunch selections from selected camper.')
  }

  function hasAnySelectedCampDay(student) {
    return Object.values(student.schedule || {}).some((entry) =>
      Object.values(entry.days || {}).some((mode) => mode !== 'NONE')
    )
  }

  function isStepOneComplete() {
    const locationValid = registration.location.trim().length > 0
    const parentNameValid = registration.parentName.trim().length > 1
    const emailValid = /\S+@\S+\.\S+/.test(registration.contactEmail)
    const phoneValid = registration.contactPhone.trim().length >= 7
    const paymentMethodValid = registration.paymentMethod.trim().length > 0
    const studentsValid = registration.students.every((student) => isStudentComplete(student))
    return locationValid && parentNameValid && emailValid && phoneValid && paymentMethodValid && studentsValid
  }

  function isStepTwoComplete() {
    return registration.students.every((student) => hasAnySelectedCampDay(student))
  }

  function hasValidLunchDecision(student) {
    const hasAnyLunch = Object.entries(student.lunch || {}).some(
      ([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)
    )
    const hasAnySelectableLunchDay = getSelectableLunchDayKeysForStudent(student).size > 0
    if (!hasAnySelectableLunchDay) {
      return true
    }
    return hasAnyLunch || Boolean(student.lunchConfirmedNone)
  }

  function isStepThreeComplete() {
    return registration.students.every((student) => hasValidLunchDecision(student))
  }

  function isStepFourComplete() {
    return isStepOneComplete() && isStepTwoComplete() && isStepThreeComplete()
  }

  function isRegistrationStepComplete(stepId) {
    if (stepId === 1) {
      return isStepOneComplete()
    }
    if (stepId === 2) {
      return isStepTwoComplete()
    }
    if (stepId === 3) {
      return isStepThreeComplete()
    }
    return isStepFourComplete()
  }

  function isCamperMissingAnyStep(student) {
    const stepOneMissing = !isStudentComplete(student)
    const stepTwoMissing = !hasAnySelectedCampDay(student)
    const stepThreeMissing = !hasValidLunchDecision(student)
    return stepOneMissing || stepTwoMissing || stepThreeMissing
  }

  function validateStep(currentStep) {
    if (currentStep === 1) {
      return {
        ok: isStepOneComplete(),
        message: 'Please complete required fields for this step.',
      }
    }

    if (currentStep === 2) {
      const studentsMissingDays = registration.students.filter((student) => {
        return !hasAnySelectedCampDay(student)
      })

      if (studentsMissingDays.length > 0) {
        const names = studentsMissingDays
          .map((student) => {
            const studentNumber = registration.students.findIndex((item) => item.id === student.id) + 1
            return student.fullName.trim() || `Camper ${studentNumber}`
          })
          .join(', ')
        return {
          ok: false,
          message: `Add at least one selected camp day for: ${names}.`,
        }
      }
    }

    if (currentStep === 3) {
      const studentsMissingLunchDecision = registration.students.filter((student) => {
        const hasAnyLunch = Object.entries(student.lunch || {}).some(
          ([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)
        )
        const hasAnySelectableLunchDay = getSelectableLunchDayKeysForStudent(student).size > 0
        if (!hasAnySelectableLunchDay) {
          return false
        }
        return !hasAnyLunch && !student.lunchConfirmedNone
      })

      if (studentsMissingLunchDecision.length > 0) {
        const names = studentsMissingLunchDecision
          .map((student) => {
            const studentNumber = registration.students.findIndex((item) => item.id === student.id) + 1
            return student.fullName.trim() || `Camper ${studentNumber}`
          })
          .join(', ')
        return {
          ok: false,
          message: `Choose paid lunch days or confirm no paid lunch for: ${names}.`,
        }
      }
    }

    return { ok: true, message: '' }
  }

  function scrollElementIntoFocusZone(element) {
    if (typeof window === 'undefined' || !element) {
      return
    }
    const rect = element.getBoundingClientRect()
    const absoluteTop = window.scrollY + rect.top
    const targetTop = Math.max(0, absoluteTop - window.innerHeight * 0.6)
    window.scrollTo({ top: targetTop, behavior: 'smooth' })
    window.setTimeout(() => {
      element.focus?.({ preventScroll: true })
    }, 120)
  }

  function jumpToStepMissingField(currentStep) {
    if (typeof document === 'undefined') {
      return
    }

    if (currentStep === 1) {
      if (!registration.parentName.trim() || registration.parentName.trim().length < 2) {
        const parentNameInput = document.querySelector('#reg-parent-name')
        scrollElementIntoFocusZone(parentNameInput)
        return
      }
      if (!/\S+@\S+\.\S+/.test(registration.contactEmail || '')) {
        const emailInput = document.querySelector('#reg-contact-email')
        scrollElementIntoFocusZone(emailInput)
        return
      }
      if (registration.contactPhone.trim().length < 7) {
        const phoneInput = document.querySelector('#reg-contact-phone')
        scrollElementIntoFocusZone(phoneInput)
        return
      }
      if (!registration.paymentMethod.trim()) {
        const paymentMethodInput = document.querySelector('#reg-payment-method')
        scrollElementIntoFocusZone(paymentMethodInput)
        return
      }

      const firstMissingStudent = registration.students.find((student) => !isStudentComplete(student))
      if (!firstMissingStudent) {
        return
      }

      setActiveStudentId(firstMissingStudent.id)
      setExpandedStudentId(firstMissingStudent.id)
      const focusTargets = [
        !firstMissingStudent.fullName.trim() ? `#reg-student-fullname-${firstMissingStudent.id}` : '',
        !parseDateLocal(firstMissingStudent.dob) ? `#reg-student-dob-${firstMissingStudent.id}` : '',
        !firstMissingStudent.allergies.trim() ? `#reg-student-allergies-${firstMissingStudent.id}` : '',
        !firstMissingStudent.medication.trim() ? `#reg-student-medication-${firstMissingStudent.id}` : '',
        !firstMissingStudent.previousInjury.trim() ? `#reg-student-injuries-${firstMissingStudent.id}` : '',
        !firstMissingStudent.healthNotes.trim() ? `#reg-student-health-${firstMissingStudent.id}` : '',
      ].filter(Boolean)
      const selector = focusTargets[0]
      if (selector) {
        window.setTimeout(() => {
          const target = document.querySelector(selector)
          scrollElementIntoFocusZone(target)
        }, 140)
      }
      return
    }

    if (currentStep === 2) {
      const firstMissingStudent = registration.students.find((student) => !hasAnySelectedCampDay(student))
      if (!firstMissingStudent) {
        return
      }
      setActiveStudentId(firstMissingStudent.id)
      const firstWeek = registrationWeeks[0]
      if (firstWeek) {
        const panelKey = `${firstMissingStudent.id}:${firstWeek.id}`
        setExpandedWeekKey(panelKey)
        window.setTimeout(() => {
          const target = document.querySelector(`[data-week-head="${panelKey}"]`)
          scrollElementIntoFocusZone(target)
        }, 140)
      }
      return
    }

    if (currentStep === 3) {
      const firstMissingStudent = registration.students.find((student) => !hasValidLunchDecision(student))
      if (!firstMissingStudent) {
        return
      }
      setActiveStudentId(firstMissingStudent.id)
      window.setTimeout(() => {
        const target = document.querySelector(`[data-lunch-decision="${firstMissingStudent.id}"] input[type="checkbox"]`)
        scrollElementIntoFocusZone(target)
      }, 140)
    }
  }

  function nextStep() {
    const validation = validateStep(step)
    if (!validation.ok) {
      setMessage(validation.message)
      jumpToStepMissingField(step)
      return
    }

    setMessage('')
    setStepDirection('next')
    setStep((current) => Math.min(current + 1, registrationSteps.length))
  }

  function previousStep() {
    setMessage('')
    setStepDirection('prev')
    setStep((current) => Math.max(current - 1, 1))
  }

  const scrollRegistrationStepToTop = useCallback(() => {
    if (typeof window === 'undefined' || !isMobileViewport) {
      return
    }
    const stepCard = document.querySelector('.registrationStepCard')
    if (!stepCard) {
      return
    }
    const targetTop = Math.max(0, window.scrollY + stepCard.getBoundingClientRect().top - 10)
    window.scrollTo({ top: targetTop, behavior: 'smooth' })
  }, [isMobileViewport])

  function buildStudentPriceRows(summary, studentIndex, options = {}) {
    const applyLimitedDiscount = Boolean(options.applyLimitedDiscount)
    const regular = adminConfig.tuition.regular
    const discount = adminConfig.tuition.discount
    const premiumFactor = 1 + Number(adminConfig.tuition.bootcampPremiumPct || 0) / 100
    const siblingDiscountPct = studentIndex >= 1 ? Number(adminConfig.tuition.siblingDiscountPct || 0) : 0

    const bootcampRegular = {
      fullWeek: roundUpToFive(regular.fullWeek * premiumFactor),
      fullDay: roundUpToFive(regular.fullDay * premiumFactor),
      amHalf: roundUpToFive(regular.amHalf * premiumFactor),
      pmHalf: roundUpToFive(regular.pmHalf * premiumFactor),
    }
    const bootcampDiscounted = {
      fullWeek: roundUpToFive(discount.fullWeek * premiumFactor),
      fullDay: roundUpToFive(discount.fullDay * premiumFactor),
      amHalf: roundUpToFive(discount.amHalf * premiumFactor),
      pmHalf: roundUpToFive(discount.pmHalf * premiumFactor),
    }

    const rows = [
      {
        id: 'general-fullWeek',
        key: 'fullWeek',
        label: 'General Camp Full Week',
        qty: summary.general.fullWeeks,
        rateType: 'general',
      },
      {
        id: 'general-fullDay',
        key: 'fullDay',
        label: 'General Camp Full Day',
        qty: summary.general.fullDays,
        rateType: 'general',
      },
      {
        id: 'general-amHalf',
        key: 'amHalf',
        label: 'General Camp AM Half Day',
        qty: summary.general.amDays,
        rateType: 'general',
      },
      {
        id: 'general-pmHalf',
        key: 'pmHalf',
        label: 'General Camp PM Half Day',
        qty: summary.general.pmDays,
        rateType: 'general',
      },
      {
        id: 'bootcamp-fullWeek',
        key: 'fullWeek',
        label: 'Competition Team Full Week',
        qty: summary.bootcamp.fullWeeks,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-fullDay',
        key: 'fullDay',
        label: 'Competition Team Full Day',
        qty: summary.bootcamp.fullDays,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-amHalf',
        key: 'amHalf',
        label: 'Competition Team AM Half Day',
        qty: summary.bootcamp.amDays,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-pmHalf',
        key: 'pmHalf',
        label: 'Competition Team PM Half Day',
        qty: summary.bootcamp.pmDays,
        rateType: 'bootcamp',
      },
    ].map((item) => {
      const regularPrice =
        item.rateType === 'bootcamp' ? bootcampRegular[item.key] || 0 : regular[item.key] || 0
      const configuredDiscountedPrice =
        item.rateType === 'bootcamp' ? bootcampDiscounted[item.key] || 0 : discount[item.key] || 0
      const normalizedDiscountedPrice =
        Number(configuredDiscountedPrice) > 0 ? Number(configuredDiscountedPrice) : regularPrice
      const effectivePrice = applyLimitedDiscount
        ? Math.max(0, Math.min(regularPrice, normalizedDiscountedPrice))
        : regularPrice
      const discountAmount = applyLimitedDiscount ? Math.max(0, regularPrice - effectivePrice) : 0
      return {
        ...item,
        regularPrice,
        discountAmount,
        effectivePrice,
        regularLineTotal: regularPrice * item.qty,
        discountLineTotal: discountAmount * item.qty,
        lineTotal: effectivePrice * item.qty,
      }
    }).filter((item) => item.qty > 0)

    const lunchPrice = adminConfig.tuition.lunchPrice || 14
    rows.push({
      key: 'lunch',
      id: 'lunch',
      label: 'Lunch',
      qty: summary.lunchCount,
      regularPrice: lunchPrice,
      discountAmount: 0,
      effectivePrice: lunchPrice,
      regularLineTotal: lunchPrice * summary.lunchCount,
      discountLineTotal: 0,
      lineTotal: lunchPrice * summary.lunchCount,
    })

    const tuitionRows = rows.filter((row) => row.id !== 'lunch')
    const lunchRow = rows.find((row) => row.id === 'lunch')
    const lunchTotal = Number(lunchRow?.lineTotal || 0)
    const lunchRegularTotal = Number(lunchRow?.regularLineTotal || 0)

    const subtotalRegular = tuitionRows.reduce((acc, row) => acc + row.regularLineTotal, 0)
    const limitedDiscountAmount = tuitionRows.reduce((acc, row) => acc + row.discountLineTotal, 0)
    const subtotalAfterLimitedDiscount = tuitionRows.reduce((acc, row) => acc + row.lineTotal, 0)

    const siblingAfterLimitedDiscount =
      siblingDiscountPct > 0 ? subtotalAfterLimitedDiscount * (siblingDiscountPct / 100) : 0
    const totalWithSiblingAfterLimited = Math.max(0, subtotalAfterLimitedDiscount - siblingAfterLimitedDiscount) + lunchTotal

    const siblingBeforeLimitedDiscount =
      siblingDiscountPct > 0 ? subtotalRegular * (siblingDiscountPct / 100) : 0
    const baseAfterSiblingBeforeLimited = Math.max(0, subtotalRegular - siblingBeforeLimitedDiscount)
    const totalWithSiblingBeforeLimited = Math.max(0, baseAfterSiblingBeforeLimited - limitedDiscountAmount) + lunchTotal

    const useSiblingBeforeLimited = totalWithSiblingBeforeLimited > totalWithSiblingAfterLimited
    const siblingDiscountAmount = useSiblingBeforeLimited
      ? siblingBeforeLimitedDiscount
      : siblingAfterLimitedDiscount
    const subtotal = subtotalAfterLimitedDiscount + lunchTotal
    const total = useSiblingBeforeLimited ? totalWithSiblingBeforeLimited : totalWithSiblingAfterLimited

    return {
      rows,
      subtotalRegular: subtotalRegular + lunchRegularTotal,
      tuitionSubtotalRegular: subtotalRegular,
      limitedDiscountAmount,
      tuitionSubtotal: subtotalAfterLimitedDiscount,
      lunchTotal,
      subtotal,
      siblingDiscountPct,
      siblingDiscountAmount,
      siblingAppliedBeforeLimitedDiscount: useSiblingBeforeLimited,
      total,
    }
  }

  function getClaimableDiscountTotal() {
    return summaries.reduce((sum, item) => {
      const studentIndex = registration.students.findIndex((student) => student.id === item.student.id)
      return sum + buildStudentPriceRows(item.summary, studentIndex, { applyLimitedDiscount: true }).limitedDiscountAmount
    }, 0)
  }

  function _buildRegistrationSummaryHtml(targetRegistration) {
    if (!targetRegistration || !Array.isArray(targetRegistration.students)) {
      return ''
    }

    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const allCampEntries = []

    const studentSections = targetRegistration.students
      .map((student, index) => {
        const camperName = student.fullName.trim() || `Camper ${index + 1}`
        const summary = getStudentSummary(student)
        const invoice = buildStudentPriceRows(summary, index, { applyLimitedDiscount: discountActive })
        const {
          lunchWeeks,
          registeredDays,
          includedLunchDays,
          paidLunchDays,
          lunchProvidedDays,
          packLunchNeededDays,
        } = getLunchDecisionStats(student, weeksById)

        const rowsHtml = invoice.rows
          .map(
            (row) => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${row.qty}</td>
              <td>${currency(row.effectivePrice)}</td>
              <td>${row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
              <td>${currency(row.lineTotal)}</td>
            </tr>
          `
          )
          .join('')

        const lunchCalendarHtml = lunchWeeks
          .map((row, weekIndex) => {
            const dayLines = row.selectedDays
              .map((day) => {
                const hasLunch = Boolean(student.lunch[day.key])
                const isIncludedLunch = isIncludedLunchDay(day.dayKey)
                const notableText = getDayNotableText(day.dayKey)
                allCampEntries.push({
                  date: day.date,
                  camperName,
                  hasLunch: isIncludedLunch ? true : hasLunch,
                  includedLunch: isIncludedLunch,
                  notableText,
                  mode: day.mode,
                })
                return `
                <tr>
                  <td>${escapeHtml(day.dayKey)}</td>
                  <td>${escapeHtml(day.date)}</td>
                  <td>${escapeHtml(day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`)}</td>
                  <td>${isIncludedLunch ? 'BBQ lunch included (pack optional)' : hasLunch ? 'Lunch selected (no packing needed)' : 'Pack lunch needed'}</td>
                  <td>${escapeHtml(notableText || '-')}</td>
                </tr>
              `
              })
              .join('')

            return `
            <section class="weekBlock">
              <h4>Week ${weekIndex + 1}: ${escapeHtml(formatWeekLabel(row.week))}</h4>
              <table>
                <thead><tr><th>Day</th><th>Date</th><th>Camp Schedule</th><th>Lunch Plan</th><th>Notable</th></tr></thead>
                <tbody>${dayLines}</tbody>
              </table>
            </section>
          `
          })
          .join('')

        return `
          <section class="studentSection">
            <h2>${escapeHtml(camperName)}</h2>
            <p>
              <span class="pill">Lunch provided: ${lunchProvidedDays}/${registeredDays} days</span>
              <span class="pill">Paid lunch selected: ${paidLunchDays} days</span>
              <span class="pill">Thu included lunch: ${includedLunchDays} day(s)</span>
              <span class="pill">Pack lunch needed: ${packLunchNeededDays} days</span>
            </p>
            <p class="note">On paid-lunch days, our team will contact you closer to each camp week to confirm menu options. Thursday BBQ lunch is included in tuition (packing your own lunch is optional).</p>

            <h3>Tuition Table</h3>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <p><strong>Subtotal:</strong> ${currency(invoice.subtotalRegular)}</p>
            <p><strong>Total discount:</strong> -${currency(invoice.limitedDiscountAmount)}</p>
            <p><strong>${escapeHtml(camperName)} total:</strong> ${currency(invoice.total)}</p>

            <h3>Lunch Calendar</h3>
            ${lunchCalendarHtml || '<p>No camp days selected yet.</p>'}
          </section>
        `
      })
      .join('')

    let familyCalendarHtml = '<p>No camp days selected yet.</p>'
    if (allCampEntries.length > 0) {
      const byDate = new Map()
      for (const entry of allCampEntries) {
        const list = byDate.get(entry.date) || []
        list.push(entry)
        byDate.set(entry.date, list)
      }

      const dateKeys = Array.from(byDate.keys()).sort((a, b) => a.localeCompare(b))
      const firstDate = parseDateLocal(dateKeys[0])
      const lastDate = parseDateLocal(dateKeys[dateKeys.length - 1])
      if (firstDate && lastDate) {
        const start = startOfWeekSunday(firstDate)
        const end = endOfWeekSaturday(lastDate)
        const weekRows = []
        let cursor = new Date(start)
        while (cursor <= end) {
          const weekCells = []
          for (let i = 0; i < 7; i += 1) {
            const key = isoDate(cursor)
            const cellEntries = byDate.get(key) || []
            const itemsHtml = cellEntries
              .map((item) => {
                const modeLabel = item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`
                const lunchPlanLabel = item.includedLunch
                  ? 'BBQ lunch included (pack optional)'
                  : item.hasLunch
                    ? 'Lunch purchase'
                    : 'Pack lunch needed'
                const notableSuffix = item.notableText ? ` · ${item.notableText}` : ''
                return `<li><strong>${escapeHtml(item.camperName)}</strong>: ${lunchPlanLabel} (${escapeHtml(modeLabel)})${escapeHtml(notableSuffix)}</li>`
              })
              .join('')
            const inRange = key >= dateKeys[0] && key <= dateKeys[dateKeys.length - 1]
            weekCells.push(`
              <div class="calendarCell ${inRange ? '' : 'muted'}">
                <div class="calendarDate">${escapeHtml(key)}</div>
                ${itemsHtml ? `<ul>${itemsHtml}</ul>` : '<p class="emptyCell">No camp</p>'}
              </div>
            `)
            cursor = addDays(cursor, 1)
          }
          weekRows.push(`<div class="calendarWeek">${weekCells.join('')}</div>`)
        }

        familyCalendarHtml = `
          <div class="calendarHeaderRow">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="calendarGrid">${weekRows.join('')}</div>
        `
      }
    }

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Summer Camp Registration Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 18px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            h2 { margin: 18px 0 8px; }
            h3 { margin: 14px 0 8px; }
            .meta, .note { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-size: 12px; }
            .pill { display: inline-block; border: 1px solid #f59e0b; background: #fef3c7; border-radius: 999px; padding: 4px 9px; margin-right: 6px; margin-bottom: 4px; font-weight: 700; }
            .weekBlock { margin-top: 12px; }
            .studentSection { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .pageBreak { page-break-before: always; break-before: page; }
            .calendarHeaderRow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
            .calendarHeaderRow span { font-size: 12px; font-weight: 700; text-align: center; padding: 4px 0; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; }
            .calendarGrid { display: grid; gap: 6px; margin-top: 6px; }
            .calendarWeek { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
            .calendarCell { border: 1px solid #cbd5e1; border-radius: 8px; min-height: 120px; padding: 6px; background: #fff; }
            .calendarCell.muted { background: #f8fafc; }
            .calendarDate { font-size: 11px; font-weight: 700; margin-bottom: 4px; color: #334155; }
            .calendarCell ul { margin: 0; padding-left: 15px; display: grid; gap: 3px; }
            .calendarCell li { font-size: 11px; line-height: 1.3; }
            .emptyCell { margin: 0; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>Welcome to Summer Camp 2026 Summary</h1>
          <p class="meta"><strong>Parent/Guardian:</strong> ${escapeHtml(targetRegistration.parentName || 'not provided')} | <strong>Email:</strong> ${escapeHtml(targetRegistration.contactEmail || 'not provided')} | <strong>Phone:</strong> ${escapeHtml(targetRegistration.contactPhone || 'not provided')} | <strong>Generated:</strong> ${escapeHtml(todayLabel)}</p>
          <p class="note">This summary includes basic info, tuition table, and lunch calendar details.</p>
          ${studentSections}
          <div class="pageBreak"></div>
          <h2>Family Camp & Lunch Calendar</h2>
          <p class="note">Each camp day shows lunch plan and notable reminders (Wednesday: bring change of clothes, Thursday: BBQ included lunch, Friday: performance day).</p>
          ${familyCalendarHtml}
        </body>
      </html>
    `
  }

  function openSummaryOverlay(targetRegistration = registration) {
    if (typeof window === 'undefined') {
      return
    }
    const summaryDocument = buildRegistrationSummaryDocument({
      registration: targetRegistration,
      tuition: adminConfig.tuition,
      weeksById,
      generatedAtLabel: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      businessName: adminConfig.tuition.businessName || 'New England Wushu',
      businessAddress: adminConfig.tuition.businessAddress || '',
    })
    setSummaryOverlayHtml(`data:application/pdf;base64,${summaryDocument.pdfBase64}`)
    setSummaryOverlayOpen(true)
  }

  function printSummaryOverlay() {
    const iframeWindow = summaryIframeRef.current?.contentWindow
    if (!iframeWindow) {
      return
    }
    iframeWindow.focus()
    iframeWindow.print()
  }

  function emailSummaryToSelf(targetRegistration = registration) {
    if (!targetRegistration?.students?.length || summaryEmailSending || summaryEmailLocked) {
      return
    }
    const toEmail = String(targetRegistration.contactEmail || '').trim()
    if (!/\S+@\S+\.\S+/.test(toEmail)) {
      setMessage('A valid contact email is required before sending the summary email.')
      return
    }

    const summaryDocument = buildRegistrationSummaryDocument({
      registration: targetRegistration,
      tuition: adminConfig.tuition,
      weeksById,
      generatedAtLabel: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      businessName: adminConfig.tuition.businessName || 'New England Wushu',
      businessAddress: adminConfig.tuition.businessAddress || '',
    })

    const camperLabel =
      targetRegistration.students.length === 1
        ? targetRegistration.students[0]?.fullName?.trim() || 'Camper'
        : `${targetRegistration.students.length} Campers`

    setSummaryEmailSending(true)
    setMessage('')
    fetch('/api/email/accounting-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail,
        parentName: targetRegistration.parentName || 'Parent/Guardian',
        camperName: camperLabel,
        paymentMethod: getPaymentMethodLabel(targetRegistration.paymentMethod),
        summaryHtml: summaryDocument.html,
        summaryText: summaryDocument.plainText,
        pdfBase64: summaryDocument.pdfBase64,
      }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result?.error || 'Summary email failed.')
        }
        setSummaryEmailLocked(true)
        setMessage(
          result?.previewOnly
            ? 'Summary email generated as preview only.'
            : `Summary email sent to ${toEmail}.`
        )
      })
      .catch((error) => {
        setMessage(error?.message || 'Summary email failed.')
      })
      .finally(() => {
        setSummaryEmailSending(false)
      })
  }

  function buildReservationSummaryLines(targetRegistration = registration) {
    if (!targetRegistration?.students?.length) {
      return []
    }

    const lines = [
      `Location: ${getLocationLabel(targetRegistration.location)}`,
      `Parent/Guardian: ${targetRegistration.parentName?.trim() || 'not provided'}`,
      `Contact: ${targetRegistration.contactEmail || 'not provided'} | ${targetRegistration.contactPhone || 'not provided'}`,
      `Payment method: ${getPaymentMethodLabel(targetRegistration.paymentMethod)}`,
    ]
    for (const [index, student] of targetRegistration.students.entries()) {
      const camperName = student.fullName.trim() || `Camper ${index + 1}`
      const summary = getStudentSummary(student)
      const invoice = buildStudentPriceRows(summary, index, {
        applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      })
      const { registeredDays, paidLunchDays, includedLunchDays, packLunchNeededDays } =
        getLunchDecisionStats(student, weeksById)
      const selectedDayBlocks =
        summary.general.fullWeeks * 5 +
        summary.general.fullDays +
        summary.general.amDays +
        summary.general.pmDays +
        summary.bootcamp.fullWeeks * 5 +
        summary.bootcamp.fullDays +
        summary.bootcamp.amDays +
        summary.bootcamp.pmDays
      lines.push(
        `${camperName}: ${selectedDayBlocks} selected camp day blocks, lunch provided ${paidLunchDays + includedLunchDays}/${registeredDays} days (paid ${paidLunchDays}, Thu included ${includedLunchDays}), pack lunch needed ${packLunchNeededDays}, total ${currency(invoice.total)}`
      )
    }

    const grandTotal = targetRegistration.students.reduce((sum, student, studentIndex) => {
      const summary = getStudentSummary(student)
      const invoice = buildStudentPriceRows(summary, studentIndex, {
        applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      })
      return sum + Number(invoice.total || 0)
    }, 0)
    lines.push(`Grand total: ${currency(grandTotal)}`)
    lines.push('Weekly reminders: Wednesday bring a change of clothes. Thursday BBQ lunch is included (packing your own lunch is optional). Friday family performance showcase.')
    return lines
  }

  function buildPaymentPageLinkForRegistration(targetRegistration = registration) {
    const summaryLines = buildReservationSummaryLines(targetRegistration)
    const amountDue = (targetRegistration?.students || []).reduce((sum, student, studentIndex) => {
      const summary = getStudentSummary(student)
      const invoice = buildStudentPriceRows(summary, studentIndex, {
        applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      })
      return sum + Number(invoice.total || 0)
    }, 0)

    return buildPaymentPageHref(
      {
        registrationType: 'day-camp',
        guardianName: targetRegistration.parentName || 'Parent/Guardian',
        contactEmail: targetRegistration.contactEmail || '',
        location: getLocationLabel(targetRegistration.location),
        paymentMethod: getPaymentMethodLabel(targetRegistration.paymentMethod),
        summaryLines,
        amountDue,
        camperNames: (targetRegistration.students || []).map((student, index) => student.fullName.trim() || `Camper ${index + 1}`),
      },
      { baseUrl: getSiteBaseUrl() }
    )
  }

  async function submitRegistration(event) {
    event.preventDefault()

    if (!supabaseEnabled || !supabase) {
      setMessage('Add your Supabase URL and anon key to submit registrations.')
      return
    }

    setSubmitting(true)
    setMessage('')
    setRegistrationEmailResult(null)

    const firstStudent = registration.students[0]
    const nameParts = splitName(firstStudent?.fullName || '')

    const payload = {
      camper_first_name: nameParts.firstName,
      camper_last_name: nameParts.lastName,
      age: Math.max(3, Math.min(17, calcAge(firstStudent?.dob))),
      experience_level: 'mixed',
      guardian_name: registration.parentName.trim() || 'Parent/Guardian',
      guardian_email: registration.contactEmail.trim(),
      guardian_phone: registration.contactPhone.trim(),
      emergency_contact: registration.contactPhone.trim(),
      medical_notes: JSON.stringify({
        registration,
        locationLabel: getLocationLabel(registration.location),
        paymentMethodLabel: getPaymentMethodLabel(registration.paymentMethod),
        submittedAt: new Date().toISOString(),
      }),
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('registrations').insert(payload)

    if (error) {
      setSubmitting(false)
      setMessage(`Submission failed: ${error.message}`)
      return
    }

    const submittedSnapshot = JSON.parse(JSON.stringify(registration))
    setSubmittedRegistrationSnapshot(submittedSnapshot)
    const summaryLines = buildReservationSummaryLines(submittedSnapshot)
    const amountDue = submittedSnapshot.students.reduce((sum, student, studentIndex) => {
      const summary = getStudentSummary(student)
      const invoice = buildStudentPriceRows(summary, studentIndex, {
        applyLimitedDiscount: discountActive && registrationDiscountClaimed,
      })
      return sum + Number(invoice.total || 0)
    }, 0)
    const camperNames = submittedSnapshot.students.map((student, index) => student.fullName.trim() || `Camper ${index + 1}`)
    const primaryCamperName = camperNames[0] || ''
    const selectedWeekIds = Array.from(
      new Set(
        submittedSnapshot.students.flatMap((student) =>
          Array.isArray(student.selectedWeeks) ? student.selectedWeeks : []
        )
      )
    )
    const campWeeks = selectedWeekIds
      .map((weekId) => weeksById[weekId])
      .filter(Boolean)
      .map((week) => ({ start: week.start, end: week.end }))
    const paymentPageLink = buildPaymentPageLinkForRegistration(submittedSnapshot)

    let reservationJourneyStatus = 'failed'
    let reservationJourneyDetail = ''
    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue',
          payload: {
            contactEmail: submittedSnapshot.contactEmail,
            contactPhone: submittedSnapshot.contactPhone,
            location: submittedSnapshot.location,
            guardianName: submittedSnapshot.parentName || '',
            submittedAt: new Date().toISOString(),
            primaryCamperName,
            camperNames,
            summaryLines,
            amountDue,
            campWeeks,
            paymentPageLink,
          },
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.ok) {
        if (result?.immediateEmail?.sent) {
          reservationJourneyStatus = result?.immediateEmail?.usedAttachmentFallback ? 'sent-no-pdf' : 'sent'
          reservationJourneyDetail = result?.immediateEmail?.usedAttachmentFallback
            ? 'Step 1 payment email sent without the PDF attachment.'
            : 'Step 1 payment email sent successfully.'
        } else if (result?.immediateEmail?.previewOnly) {
          reservationJourneyStatus = 'preview'
          reservationJourneyDetail =
            result?.immediateEmail?.error ||
            'SES is not fully configured, so the email was generated as a preview only.'
        } else {
          reservationJourneyStatus = 'queued'
          reservationJourneyDetail =
            result?.immediateEmail?.error ||
            'The reminder flow was queued, but the first email was not confirmed as sent.'
        }
        if (result?.journeyStored === false && result?.warning) {
          reservationJourneyDetail = `${reservationJourneyDetail} Follow-up journey tracking could not be saved: ${result.warning}`
        }
      } else {
        reservationJourneyDetail = result?.error || 'The reminder email request failed.'
      }
    } catch {
      // Non-blocking: registration success should not fail if reminder email setup is temporarily unavailable.
      reservationJourneyDetail = 'The reminder email request could not be completed.'
    }

    setRegistrationEmailResult({
      status: reservationJourneyStatus,
      detail: reservationJourneyDetail,
    })

    setSubmitting(false)
    setMessage(
      reservationJourneyStatus === 'sent'
        ? 'Registration submitted successfully. Step 1 payment email was sent and the reminder flow is active.'
        : reservationJourneyStatus === 'sent-no-pdf'
          ? 'Registration submitted successfully. Step 1 payment email was sent without the PDF attachment, and the reminder flow is active.'
          : reservationJourneyStatus === 'preview'
            ? 'Registration submitted successfully. The reminder flow is queued, but SES is not fully configured so the step 1 email was preview-only.'
            : reservationJourneyStatus === 'queued'
              ? 'Registration submitted successfully. Payment reminder and auto-cancel email flow has been queued.'
              : 'Registration submitted successfully. Unable to queue automated payment reminder emails right now.'
    )
    setStep(4)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REGISTRATION_DRAFT_KEY)
    }
  }

  const resolvedActiveStudentId = activeStudentId || registration.students[0]?.id || ''
  const activeStudent = registration.students.find((student) => student.id === resolvedActiveStudentId)
  const activeStudentIndex = Math.max(
    0,
    registration.students.findIndex((student) => student.id === resolvedActiveStudentId)
  )
  const expandedStudent = registration.students.find((student) => student.id === expandedStudentId)
  const activeStudentDisplayName = activeStudent?.fullName?.trim() || 'this camper'
  const activeCamperLabel = activeStudent?.fullName?.trim() || `Camper ${activeStudentIndex + 1}`
  const selectedLocationLabel = getLocationLabel(registration.location)
  const locationAlbumTitle = registration.location.trim()
    ? `${selectedLocationLabel} Facility Photos`
    : 'Facility Photos'
  const activeLocationAlbumPhoto = locationFacilityPhotos[locationAlbumIndex] || ''
  const registrationIsSubmitted = Boolean(submittedRegistrationSnapshot)
  const locationMissing = !registration.location.trim()
  const parentNameMissing = !registration.parentName.trim()
  const contactEmailMissing = !registration.contactEmail.trim()
  const contactPhoneMissing = !registration.contactPhone.trim()
  const paymentMethodMissing = !registration.paymentMethod.trim()
  const expandedStudentFullNameMissing = expandedStudent ? !expandedStudent.fullName.trim() : false
  const expandedStudentDobMissing = expandedStudent ? !parseDateLocal(expandedStudent.dob) : false
  const expandedStudentAllergiesMissing = expandedStudent ? !expandedStudent.allergies.trim() : false
  const expandedStudentMedicationMissing = expandedStudent ? !expandedStudent.medication.trim() : false
  const expandedStudentInjuriesMissing = expandedStudent ? !expandedStudent.previousInjury.trim() : false
  const expandedStudentHealthNotesMissing = expandedStudent ? !expandedStudent.healthNotes.trim() : false
  const step2HasMissing = registration.students.some((student) => {
    for (const entry of Object.values(student.schedule || {})) {
      const hasAnySelected = Object.values(entry.days || {}).some((mode) => mode && mode !== 'NONE')
      if (hasAnySelected) {
        return false
      }
    }
    return true
  })
  const step3HasMissing = registration.students.some((student) => {
    return !hasValidLunchDecision(student)
  })
  const copySourceOptions = registration.students
    .map((student, index) => ({
      id: student.id,
      label: student.fullName.trim() || `Camper ${index + 1}`,
    }))
    .filter((student) => student.id !== resolvedActiveStudentId)
  const stepShortTitle =
    step === 1
      ? 'Step 1: Family & camper details'
      : step === 2
        ? `Step 2: Choose weeks, camp type, and days for ${activeStudentDisplayName}`
        : step === 3
          ? `Step 3: Select lunch options for ${activeStudentDisplayName}`
          : 'Step 4: Review totals and submit registration'
  const activeRegistrationStepImage = adminConfig.media.registrationStepImageUrls?.[step - 1] || ''
  const fullWeekDiscountAmount = useMemo(() => {
    const regularFullWeek = Number(adminConfig.tuition.regular.fullWeek || 0)
    const discountedFullWeek = Number(adminConfig.tuition.discount.fullWeek || 0)
    if (regularFullWeek <= 0 || discountedFullWeek <= 0) {
      return 0
    }
    return Math.max(0, regularFullWeek - discountedFullWeek)
  }, [adminConfig.tuition.discount.fullWeek, adminConfig.tuition.regular.fullWeek])
  const discountAmountLabel = useMemo(() => {
    return fullWeekDiscountAmount > 0 ? `${currency(fullWeekDiscountAmount)} OFF` : '$0 OFF'
  }, [fullWeekDiscountAmount])
  const discountEndDateSpokenLabel = useMemo(() => {
    const end = parseDateLocal(adminConfig.tuition.discountEndDate)
    if (!end) {
      return {
        en: 'the discount end date',
        zh: '优惠截止日',
      }
    }
    return {
      en: end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      zh: end.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
    }
  }, [adminConfig.tuition.discountEndDate])
  const surveyStepImageIndex =
    surveyStep === 1
      ? 0
      : surveyStep === 2
        ? 1
        : surveyStep === 3
          ? 2
          : surveyStep === 4
            ? 3
            : surveyStep === 5
              ? 4
              : 5
  const activeSurveyImage =
    adminConfig.media.surveyStepImageUrls?.[surveyStepImageIndex] ||
    adminConfig.media.heroImageUrl ||
    adminConfig.media.surveyStep1FlyerUrl ||
    ''
  const startHeroImage =
    adminConfig.media.heroImageUrl ||
    adminConfig.media.surveyStepImageUrls?.[0] ||
    adminConfig.media.surveyStep1FlyerUrl ||
    ''
  const activeSurveyVideo = adminConfig.media.surveyVideoUrl || ''
  const activeSurveyYouTubeEmbed = getYouTubeEmbedUrl(activeSurveyVideo)
  const landingSectionVisuals = useMemo(
    () => ({
      whyCamp: adminConfig.media.surveyStepImageUrls?.[1] || adminConfig.media.heroImageUrl || '',
      marketingFlow: adminConfig.media.surveyStepImageUrls?.[2] || adminConfig.media.heroImageUrl || '',
      testimonials: adminConfig.media.surveyStepImageUrls?.[3] || adminConfig.media.heroImageUrl || '',
      campDates: adminConfig.media.surveyStepImageUrls?.[4] || adminConfig.media.heroImageUrl || '',
      weekly: adminConfig.media.surveyStepImageUrls?.[5] || adminConfig.media.heroImageUrl || '',
    }),
    [adminConfig.media.heroImageUrl, adminConfig.media.surveyStepImageUrls]
  )
  const claimableDiscountTotal = getClaimableDiscountTotal()
  const surveyEmailInvalid =
    surveyStep === 1 && surveyMessage.toLowerCase().includes('valid email')
  const surveyDiscountReminder =
    adminConfig.tuition.discountEndDate && discountActive
      ? text(
        `Early discount is available through ${discountEndDateSpokenLabel.en}.`,
        `早鸟优惠有效期至 ${discountEndDateSpokenLabel.zh}。`
      )
      : ''
  const lunchInterestFeedback =
    surveyData.lunchInterest === 'yes'
      ? text(
          'Excellent choice. Daily lunch booking makes full camp schedules easier for busy families, and the Level Up app keeps planning simple.',
          '非常好的选择。按天订午餐可显著减轻家庭日程压力，Level Up 应用也会让安排更轻松。'
        )
      : surveyData.lunchInterest === 'no'
        ? text(
            'Great. You can still bring packed lunch, and your camper will receive the same structured coaching and full camp experience.',
            '很好。您仍可自带午餐，营员同样会获得完整的系统训练与营地体验。'
          )
        : ''
  const overnightFullWeekCurrentPrice =
    overnightPricingRows.find((row) => row.key === 'fullWeek')?.effective || 0
  const overnightFullDayCurrentPrice =
    overnightPricingRows.find((row) => row.key === 'fullDay')?.effective || 0
  const overnightSelectedWeeks = useMemo(
    () => overnightWeeks.filter((week) => overnightSelectedWeekIds.includes(week.id)),
    [overnightSelectedWeekIds, overnightWeeks]
  )
  const overnightRequestedWeeks = overnightSelectedWeeks.length

  useEffect(() => {
    setOvernightSelectedWeekIds((current) =>
      current.filter((id) => overnightWeeks.some((week) => week.id === id))
    )
  }, [overnightWeeks])

  function toggleOvernightActivity(option) {
    setOvernightActivitySelections((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    )
  }

  function toggleOvernightWeekSelection(weekId) {
    setOvernightSelectedWeekIds((current) =>
      current.includes(weekId) ? current.filter((id) => id !== weekId) : [...current, weekId]
    )
  }

  function nextOvernightEnrollmentStep() {
    if (overnightSelectedWeekIds.length === 0) {
      setOvernightMessage('Please select at least one overnight week.')
      return
    }
    if (overnightParentName.trim().length < 2) {
      setOvernightMessage('Please add a parent/guardian name for overnight registration.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(overnightContactEmail || '')) {
      setOvernightMessage('Please add a valid contact email for overnight registration.')
      return
    }
    if (overnightContactPhone.trim().length < 7) {
      setOvernightMessage('Please add a valid contact phone for overnight registration.')
      return
    }
    if (!overnightPaymentMethod.trim()) {
      setOvernightMessage('Please choose how you will pay for overnight registration.')
      return
    }
    setOvernightMessage('')
    setOvernightEnrollmentStep(2)
  }

  async function submitOvernightEnrollmentRequest() {
    if (overnightSubmitting) {
      return
    }
    if (overnightSelectedWeekIds.length === 0) {
      setOvernightMessage('Please select at least one overnight week.')
      setOvernightEnrollmentStep(1)
      return
    }
    if (overnightParentName.trim().length < 2 || !/\S+@\S+\.\S+/.test(overnightContactEmail || '') || overnightContactPhone.trim().length < 7 || !overnightPaymentMethod.trim()) {
      setOvernightMessage('Please complete all required fields in Step 1 before submitting.')
      setOvernightEnrollmentStep(1)
      return
    }
    setOvernightSubmitting(true)
    const optionLabel =
      overnightRequestOption === 'fullDay' ? 'Overnight Full Day' : 'Overnight Full Week'
    const selectedWeekLabel = overnightSelectedWeeks.length
      ? overnightSelectedWeeks.map((week) => formatWeekLabel(week)).join(', ')
      : 'none'
    const summaryLines = [
      `Parent/Guardian: ${overnightParentName.trim() || 'not provided'}`,
      `Contact: ${overnightContactEmail.trim() || 'not provided'} | ${overnightContactPhone.trim() || 'not provided'}`,
      `Payment method: ${getPaymentMethodLabel(overnightPaymentMethod)}`,
      `Program: ${optionLabel}`,
      `Selected weeks (${overnightRequestedWeeks}): ${selectedWeekLabel}`,
      `Current weekly rate: ${currency(overnightRate)}`,
      'Includes lodging and food only. Outing costs are billed separately.',
      `Activity picks: ${overnightActivitySelections.length}`,
      overnightActivityCustom.trim() ? `Other requests: ${overnightActivityCustom.trim()}` : 'Other requests: none',
    ]
    const overnightRate =
      overnightRequestOption === 'fullDay'
        ? Number(overnightFullDayCurrentPrice || 0)
        : Number(overnightFullWeekCurrentPrice || 0)
    const amountDue = overnightRequestedWeeks * overnightRate
    const campWeeks = overnightSelectedWeeks.map((week) => ({ start: week.start, end: week.end }))

    let queuedStatus = 'failed'
    try {
      const response = await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue',
          payload: {
            contactEmail: overnightContactEmail.trim(),
            contactPhone: overnightContactPhone.trim(),
            guardianName: overnightParentName.trim(),
            submittedAt: new Date().toISOString(),
            primaryCamperName: 'Overnight Camper',
            camperNames: ['Overnight Camper'],
            summaryLines,
            amountDue,
            campWeeks,
            registrationType: 'overnight-only',
          },
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.ok) {
        if (result?.immediateEmail?.sent) {
          queuedStatus = result?.immediateEmail?.usedAttachmentFallback ? 'sent-no-pdf' : 'sent'
        } else if (result?.immediateEmail?.previewOnly) {
          queuedStatus = 'preview'
        } else {
          queuedStatus = 'queued'
        }
      }
    } catch {
      queuedStatus = 'failed'
    }

    setOvernightSubmitting(false)
    setOvernightMessage(
      queuedStatus === 'sent'
        ? `Overnight enrollment request submitted for ${optionLabel} (${overnightRequestedWeeks} week${overnightRequestedWeeks === 1 ? '' : 's'}). Weeks: ${selectedWeekLabel}. Step 1 payment email was sent and the 72-hour reminder flow is active.`
        : queuedStatus === 'sent-no-pdf'
          ? `Overnight enrollment request submitted for ${optionLabel} (${overnightRequestedWeeks} week${overnightRequestedWeeks === 1 ? '' : 's'}). Weeks: ${selectedWeekLabel}. Step 1 payment email was sent without the PDF attachment, and the 72-hour reminder flow is active.`
          : queuedStatus === 'preview'
            ? `Overnight enrollment request submitted for ${optionLabel} (${overnightRequestedWeeks} week${overnightRequestedWeeks === 1 ? '' : 's'}). Weeks: ${selectedWeekLabel}. The reminder flow is queued, but SES is not fully configured so the step 1 email was preview-only.`
            : queuedStatus === 'queued'
              ? `Overnight enrollment request submitted for ${optionLabel} (${overnightRequestedWeeks} week${overnightRequestedWeeks === 1 ? '' : 's'}). Weeks: ${selectedWeekLabel}. Payment reminder and 72-hour cancellation email flow is queued.`
              : `Overnight enrollment request submitted for ${optionLabel} (${overnightRequestedWeeks} week${overnightRequestedWeeks === 1 ? '' : 's'}). Weeks: ${selectedWeekLabel}. We could not queue the automated email flow right now, but your request details are captured on this page.`
    )
  }
  const visibleSurveyFeedback =
    surveyStepFeedback || (surveyStep > 1 ? getSurveyFeedback(surveyStep - 1) : '')
  const welcomeBlock = (
    <div className="startWelcome">
      {adminConfig.media.welcomeLogoUrl ? (
        <img className="startLogoImage" src={adminConfig.media.welcomeLogoUrl} alt="Summer camp logo" />
      ) : (
        <div className="startLogoPlaceholder" aria-label="Logo placeholder">
          Logo Placeholder
        </div>
      )}
      <div>
        <h2>{text('Welcome to Wushu Summer Camp', '欢迎来到武术夏令营')}</h2>
        <p className="startAwardLine">
          {text(
            'Winner of 2022, 2023, 2024, 2025, and 2026 Best Martial Arts School in the area',
            '荣获 2022、2023、2024、2025 和 2026 年本地区最佳武术学校'
          )}
        </p>
        <p className="startWushuLine">
          {text('What is Wushu? Martial Arts. Power. Precision. Pride.', '什么是武术？武术。力量、精准、荣耀。')}
        </p>
        <p className="subhead">
          {text(
            'Train fierce, build confidence, and make unforgettable summer memories.',
            '强健体魄，建立自信，收获难忘夏日回忆。'
          )}
        </p>
        {discountActive && fullWeekDiscountAmount > 0 ? (
          <div className="startPremiumDiscount">
            <strong>{text(`${currency(fullWeekDiscountAmount)} OFF per full week`, `整周立减 ${currency(fullWeekDiscountAmount)}`)}</strong>
            <span>
              {text(
                `Premium early offer available through ${discountEndDateSpokenLabel.en}.`,
                `尊享早鸟优惠有效期至 ${discountEndDateSpokenLabel.zh}。`
              )}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
  const currentMode = isRegistrationRoute ? 'register' : entryMode
  const isMobileLearnOverlayOpen = currentMode === 'learn' && isMobileViewport
  const desktopAssistantMounted = currentMode === 'learn' && !isMobileViewport
  const desktopAssistantVisible = desktopAssistantMounted && !assistantCollapsed
  const keepFloatingUiVisible = false
  const showLegacyStartPage = false
  const showMainCampPage =
    isRegistrationRoute || currentMode === 'register' || (currentMode === 'learn' && !isMobileViewport)
  const showLandingOnlySections = !isRegistrationRoute && showMainCampPage
  const showRegistrationSections = isRegistrationRoute
  const pageHeroLogo = adminConfig.media.welcomeLogoUrl ? (
    <img className="pageHeroLogoImage" src={adminConfig.media.welcomeLogoUrl} alt="New England Wushu logo" />
  ) : (
    <div className="pageHeroLogoPlaceholder" aria-label="Logo placeholder">
      Logo
    </div>
  )

  useEffect(() => {
    if (!isMobileViewport || (!isRegistrationRoute && entryMode !== 'register')) {
      return
    }
    const timer = window.setTimeout(() => {
      scrollRegistrationStepToTop()
    }, 90)
    return () => window.clearTimeout(timer)
  }, [entryMode, isMobileViewport, isRegistrationRoute, scrollRegistrationStepToTop, step])

  return (
    <main
      className={`page ${isRegistrationRoute ? 'registrationRoute' : ''} ${currentMode === '' ? 'startOnly' : ''} ${
        currentMode === 'learn' && isMobileViewport ? 'learnOnly' : ''
      }`}
    >
      {showLandingOnlySections && !isMobileViewport ? (
      <aside className="desktopSideRail desktopCampRail" aria-label="Summer camp navigation">
        <div className="desktopSideRailCard">
          <div className="desktopSideRailBrand">
            {pageHeroLogo}
          </div>
          <p className="desktopSideRailEyebrow">Summer Camp</p>
          <div className="desktopSideRailLinks">
            {desktopCampNavItems.map((item) => (
              <a key={item.href} href={item.href} className="desktopSideRailLink">
                {item.label}
              </a>
            ))}
            <button type="button" className="desktopSideRailCta" onClick={jumpToRegistration}>
              {text('Claim Offer & Register', '领取优惠并报名')}
            </button>
          </div>
        </div>
      </aside>
      ) : null}

      {showRegistrationSections && !isMobileViewport ? (
      <aside className="desktopSideRail desktopRegistrationRail" aria-label="Registration steps">
        <div className="desktopSideRailCard">
          <div className="desktopSideRailBrand">
            {pageHeroLogo}
          </div>
          <p className="desktopSideRailEyebrow">Registration</p>
          <div className="desktopRegistrationRailSteps">
            {registrationSteps.map((item) => {
              const isComplete = isRegistrationStepComplete(item.id)
              const isMissing = !isComplete
              const isActive = step === item.id
              return (
                <button
                  key={`desktop-reg-step-${item.id}`}
                  type="button"
                  className={`desktopRegistrationRailBtn ${isActive ? 'active' : ''} ${
                    item.id < step && isComplete ? 'done' : ''
                  } ${item.id < step && isMissing ? 'incomplete' : ''}`}
                  onClick={() => {
                    setStepDirection(item.id > step ? 'next' : 'prev')
                    setStep(item.id)
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="desktopRegistrationRailNumber">{item.id}</span>
                  <span className="desktopRegistrationRailMeta">
                    <span className="desktopRegistrationRailTitle">{item.title}</span>
                    <span className="desktopRegistrationRailStatus">
                      {isActive ? 'Current step' : item.id < step && isComplete ? 'Complete' : item.id < step ? 'Needs attention' : 'Upcoming'}
                    </span>
                  </span>
                  {isMissing ? <span className="desktopRegistrationRailDot" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      </aside>
      ) : null}

      {showLegacyStartPage && (currentMode === '' || isMobileLearnOverlayOpen) ? (
      <section
        className={`card section startSection ${adminConfig.media.surveyMobileBgUrl ? 'startMobileBg' : ''}`}
        id="start-here"
        style={
          adminConfig.media.surveyMobileBgUrl
            ? { '--start-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
            : undefined
        }
      >
        {!isMobileViewport && startHeroImage ? (
          <figure className="startHeroVisual">
            <img src={startHeroImage} alt="Wushu summer camp hero" />
          </figure>
        ) : null}
        {welcomeBlock}
        <div className="startChoiceRow">
          <button
            type="button"
            className="startChoiceCard"
            onClick={jumpToRegistration}
          >
            <strong>{text('Claim Early Offer & Register', '领取早鸟优惠并报名')}</strong>
            <span>{text('Secure your spot now and lock in your camp weeks with priority pricing.', '立即锁定名额与营期，并享受优先优惠价格。')}</span>
          </button>
          <button
            type="button"
            className="startChoiceCard"
            onClick={chooseLearnPath}
          >
            <strong>{text('I want to learn more about your program', '我想了解更多课程信息')}</strong>
            <span>{text('This guided flow helps us determine the best-fit camp path for your family.', '这个引导流程将帮助我们为您的家庭匹配最适合的营地方案。')}</span>
          </button>
        </div>
        <p className="startChoiceNote">
          {text('Not sure yet? Click ', '还不确定？点击上方')}
          <strong>{text('Learn More', '了解更多')}</strong>
          {text(' above.', '。')}
        </p>
        <div className="startGoSummerInline">
          <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
            {text('Go to Summer Day Camp Page', '进入夏令营日营页面')}
          </button>
          <a className="button secondary goSummerChip" href="/overnight">
            {text('Go to Overnight Camp Page', '进入过夜营页面')}
          </a>
        </div>
      </section>
      ) : null}

      {currentMode === 'learn' && (isMobileViewport || desktopAssistantMounted) ? (
        isMobileViewport ? (
        <div
          className="learnOverlay"
          role="dialog"
          aria-modal="true"
          aria-label={text('Camp Fit Assistant', '营地匹配助手')}
          onClick={() => setEntryMode('')}
        >
        <section
          ref={surveyRef}
          className={`card section surveySection mobileLearnOverlayPanel ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`}
          id="program-guide"
          onClick={(event) => event.stopPropagation()}
          style={
            surveyStep === 1 && adminConfig.media.surveyMobileBgUrl
              ? { '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
              : undefined
          }
        >
          <article className={`surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`}>
            <div className="surveyStepPanel">
              {visibleSurveyFeedback ? <p className="surveyFeedback">{visibleSurveyFeedback}</p> : null}
              {surveyDiscountReminder && surveyStep >= 4 ? (
                <p className="surveyDiscountReminder">{surveyDiscountReminder}</p>
              ) : null}
              <div className="surveyVisual">
                {activeSurveyImage ? (
                  <img src={activeSurveyImage} alt={`Program finder step ${surveyStep} visual`} />
                ) : (
                  <div className="surveyVisualPlaceholder">Add images in /admin media to show step visuals.</div>
                )}
              </div>

              {surveyStep === 1 ? (
                <div className="surveyQuestion">
                  <h3>{text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')}</h3>
                  {adminConfig.media.surveyStep1FlyerUrl ? (
                    <div className="surveyFunFlyer">
                      <img src={adminConfig.media.surveyStep1FlyerUrl} alt="Summer camp marketing flyer" />
                    </div>
                  ) : null}
                  <label>
                    {text('Contact email', '联系邮箱')}
                    <input
                      type="email"
                      value={surveyData.contactEmail}
                      onChange={(event) => updateSurveyField('contactEmail', event.target.value)}
                      placeholder={text('name@email.com', 'name@email.com')}
                    />
                  </label>
                  <p className="marketingConsentNote">
                    {text(
                      'By continuing, you may receive camp updates and marketing emails related to this form.',
                      '继续填写即表示您可能会收到与此表单相关的营地更新和市场邮件。'
                    )}
                  </p>
                  {surveyEmailInvalid ? <p className="surveyFieldError">{text('Please enter a valid email address.', '请输入有效邮箱地址。')}</p> : null}
                  <label>
                    {text('Number of campers', '营员人数')}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={surveyData.camperCount}
                      onChange={(event) => setSurveyCamperCount(event.target.value)}
                    />
                  </label>
                  <div className="surveyAgeGrid">
                    {surveyData.camperAges.map((age, index) => (
                      <label key={`age-${index}`}>
                        {text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`)}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={age}
                          onChange={(event) => setSurveyCamperAge(index, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {surveyStep === 2 ? (
                <div className="surveyQuestion">
                  <h3>{text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 3 ? (
                <div className="surveyQuestion">
                  <h3>{text('3. Sports experience details', '3. 运动经历详情')}</h3>
                  {surveyData.hasSports === 'yes' ? (
                    <label>
                      {text('What sports?', '参与过哪些运动？')}
                      <input
                        value={surveyData.sportsList}
                        onChange={(event) => updateSurveyField('sportsList', event.target.value)}
                        placeholder={text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')}
                      />
                    </label>
                  ) : (
                    <>
                      <h3>{text('What would you like your child to build first?', '希望孩子优先提升哪方面？')}</h3>
                      <p className="subhead">
                        {text('Select up to 3', '最多选择3项')} ({surveyData.noSportsPriority.length}/3)
                      </p>
                      <div className="surveyChoiceRow">
                        {[
                          'confidence',
                          'coordination',
                          'focus',
                          'fitness',
                          'flexibility',
                          'strength',
                          'discipline',
                          'social confidence',
                        ].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`}
                            onClick={() => toggleNoSportsPriority(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="surveySupportMedia">
                        <div className="surveySupportCard">
                          {adminConfig.media.surveyStepImageUrls?.[2] ? (
                            <img src={adminConfig.media.surveyStepImageUrls[3] || adminConfig.media.surveyStepImageUrls[2]} alt="Step 3 support visual" />
                          ) : (
                            <div className="surveyVisualPlaceholder">Add Step 3B image in admin media</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {surveyStep === 4 ? (
                <div className="surveyQuestion">
                  <h3>{text('4. Martial arts experience', '4. 是否有武术经历')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 5 ? (
                <div className="surveyQuestion">
                  <h3>{text('5. Martial arts background details', '5. 武术背景详情')}</h3>
                  {surveyData.hasMartial === 'yes' ? (
                    <div className="surveyAgeGrid">
                      <label>
                        {text('Years', '年')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialYears}
                          onChange={(event) =>
                            updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                      <label>
                        {text('Months', '月')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialMonths}
                          onChange={(event) =>
                            updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="surveyInlineResponse">
                      {text(
                        'No problem at all. Many of our strongest students started with zero martial arts experience.',
                        '完全没问题。很多优秀学员都是从零基础开始。'
                      )}
                    </p>
                  )}
                </div>
              ) : null}

              {surveyStep === 6 ? (
                <div className="surveyQuestion">
                  <h3>{text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyActivities.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        className={`choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyActivity(activity.value)}
                      >
                        {text(activity.label, activity.zhLabel)}
                      </button>
                    ))}
                  </div>

                  <h3>{text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'yes')}
                    >
                      {text('Yes', '是')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'no')}
                    >
                      {text('No', '否')}
                    </button>
                  </div>
                  {lunchInterestFeedback ? <p className="surveyInlineResponse">{lunchInterestFeedback}</p> : null}
                  <p className="subhead">
                    {text(
                      'This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.',
                      '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。'
                    )}
                  </p>

                  <h3>{text('6c. What are your goals?', '6c. 您的目标是什么？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        className={`choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyGoal(goal.value)}
                      >
                        {text(goal.label, goal.zhLabel)}
                      </button>
                    ))}
                  </div>
                  {getGoalsEncouragement() ? <p className="surveyInlineResponse">{getGoalsEncouragement()}</p> : null}
                </div>
              ) : null}

              {surveyStep === 7 ? (
                <div className="surveyQuestion">
                <h3>{text('7. Recommended camp plan', '7. 推荐营地方案')}</h3>
                {(() => {
                  const recommendation = buildSurveyRecommendation()
                  const [leadLine, ...detailLines] = recommendation
                  return (
                    <div className="recommendationCard recommendationCardFinal">
                      <div className="recommendationBadgeRow">
                        <span className="recommendationBadge">{text('Awarded Best in Burlington', '伯灵顿获奖学院')}</span>
                        <span className="recommendationBadge secondary">{text('Certified Top Coaches', '认证顶级教练团队')}</span>
                      </div>
                      <p className="recommendationLead">{leadLine}</p>
                      <div className="surveyResultList">
                        {detailLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <h3>{text('Are you ready to register?', '准备好报名了吗？')}</h3>
                <div className="surveyChoiceRow">
                  <button type="button" className="button" onClick={handleReadyToRegister}>
                    {text('Yes, take me to registration', '是的，带我去报名')}
                  </button>
                  <button type="button" className="button secondary" onClick={handleThinkAboutIt}>
                    {text('I need time to think', '我需要再考虑一下')}
                  </button>
                </div>
                </div>
              ) : null}

              {getSurveyDidYouKnowFact() ? <p className="surveyDidYouKnow">{getSurveyDidYouKnowFact()}</p> : null}
            </div>

            <div className="surveyActions">
              <button
                type="button"
                className="button secondary"
                onClick={previousSurveyStep}
                disabled={surveyStep === 1}
              >
                {text('Back', '返回')}
              </button>
              {surveyStep < SURVEY_TOTAL_STEPS ? (
                <button type="button" className="button" onClick={nextSurveyStep} disabled={savingSurveyProfile}>
                  {savingSurveyProfile
                    ? text('Saving...', '保存中...')
                    : surveyAwaitingAdvanceStep === surveyStep
                      ? text('Continue', '继续')
                      : text('Next', '下一步')}
                </button>
              ) : null}
            </div>
            {surveyMessage ? <p className="message">{surveyMessage}</p> : null}
            {activeSurveyVideo ? (
              <div className="surveyVideoDock">
                {activeSurveyYouTubeEmbed ? (
                  <>
                    <iframe
                      src={activeSurveyYouTubeEmbed}
                      title="Program guide video"
                      loading="eager"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
                      allowFullScreen
                    />
                    <p className="surveyVideoHint">
                      {text(
                        'On iPhone, autoplay can be blocked in Low Power Mode. If it does not auto-play, tap play once.',
                        'iPhone 在省电模式下可能会阻止自动播放；若未自动播放，请点击播放一次。'
                      )}
                    </p>
                  </>
                ) : (
                  <video
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    src={activeSurveyVideo}
                  />
                )}
              </div>
            ) : null}
          </article>
          <div className="mobileSurveyQuickBar" aria-label={text('Survey quick actions', '问卷快捷操作')}>
            <button type="button" className="button goSummerChip mobileSurveyQuickBtn" onClick={jumpToCampTop}>
              {text('Summer Camp Page', '夏令营主页')}
            </button>
            <button
              type="button"
              className="button mobileSurveyQuickBtn mobileSurveyRegisterBtn"
              onClick={jumpToRegistration}
            >
              {text('Claim Offer & Register', '领取优惠并报名')}
            </button>
          </div>
        </section>
        </div>
      ) : (
        <section
          ref={surveyRef}
          className={`card section surveySection desktopAssistantWindow ${assistantCollapsed ? 'collapsed' : ''} ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`}
          id="program-guide"
          style={
            surveyStep === 1 && adminConfig.media.surveyMobileBgUrl
              ? { '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
              : undefined
          }
        >
          <div className="mobileOverlayTopActions desktopSurveyTopActions">
            <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
              {text('Go to Summer Day Camp Page', '进入夏令营日营页面')}
            </button>
            <button
              type="button"
              className="button secondary desktopHideAssistantBtn"
              onClick={() => {
                setAssistantCollapsed(true)
              }}
            >
              {text('Hide Assistant', '隐藏助手')}
            </button>
          </div>
          <article className={`surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`}>
            <div className="surveyStepPanel">
              {visibleSurveyFeedback ? <p className="surveyFeedback">{visibleSurveyFeedback}</p> : null}
              {surveyDiscountReminder && surveyStep >= 4 ? (
                <p className="surveyDiscountReminder">{surveyDiscountReminder}</p>
              ) : null}
              <div className="surveyVisual">
                {activeSurveyImage ? (
                  <img src={activeSurveyImage} alt={`Program finder step ${surveyStep} visual`} />
                ) : (
                  <div className="surveyVisualPlaceholder">Add images in /admin media to show step visuals.</div>
                )}
              </div>

              {surveyStep === 1 ? (
                <div className="surveyQuestion">
                  <h3>{text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')}</h3>
                  {adminConfig.media.surveyStep1FlyerUrl ? (
                    <div className="surveyFunFlyer">
                      <img src={adminConfig.media.surveyStep1FlyerUrl} alt="Summer camp marketing flyer" />
                    </div>
                  ) : null}
                  <label>
                    {text('Contact email', '联系邮箱')}
                    <input
                      type="email"
                      value={surveyData.contactEmail}
                      onChange={(event) => updateSurveyField('contactEmail', event.target.value)}
                      placeholder={text('name@email.com', 'name@email.com')}
                    />
                  </label>
                  {surveyEmailInvalid ? <p className="surveyFieldError">{text('Please enter a valid email address.', '请输入有效邮箱地址。')}</p> : null}
                  <label>
                    {text('Number of campers', '营员人数')}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={surveyData.camperCount}
                      onChange={(event) => setSurveyCamperCount(event.target.value)}
                    />
                  </label>
                  <div className="surveyAgeGrid">
                    {surveyData.camperAges.map((age, index) => (
                      <label key={`age-${index}`}>
                        {text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`)}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={age}
                          onChange={(event) => setSurveyCamperAge(index, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {surveyStep === 2 ? (
                <div className="surveyQuestion">
                  <h3>{text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 3 ? (
                <div className="surveyQuestion">
                  <h3>{text('3. Sports experience details', '3. 运动经历详情')}</h3>
                  {surveyData.hasSports === 'yes' ? (
                    <label>
                      {text('What sports?', '参与过哪些运动？')}
                      <input
                        value={surveyData.sportsList}
                        onChange={(event) => updateSurveyField('sportsList', event.target.value)}
                        placeholder={text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')}
                      />
                    </label>
                  ) : (
                    <>
                      <h3>{text('What would you like your child to build first?', '希望孩子优先提升哪方面？')}</h3>
                      <p className="subhead">
                        {text('Select up to 3', '最多选择3项')} ({surveyData.noSportsPriority.length}/3)
                      </p>
                      <div className="surveyChoiceRow">
                        {[
                          'confidence',
                          'coordination',
                          'focus',
                          'fitness',
                          'flexibility',
                          'strength',
                          'discipline',
                          'social confidence',
                        ].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`}
                            onClick={() => toggleNoSportsPriority(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="surveySupportMedia">
                        <div className="surveySupportCard">
                          {adminConfig.media.surveyStepImageUrls?.[2] ? (
                            <img src={adminConfig.media.surveyStepImageUrls[3] || adminConfig.media.surveyStepImageUrls[2]} alt="Step 3 support visual" />
                          ) : (
                            <div className="surveyVisualPlaceholder">Add Step 3B image in admin media</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {surveyStep === 4 ? (
                <div className="surveyQuestion">
                  <h3>{text('4. Martial arts experience', '4. 是否有武术经历')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 5 ? (
                <div className="surveyQuestion">
                  <h3>{text('5. Martial arts background details', '5. 武术背景详情')}</h3>
                  {surveyData.hasMartial === 'yes' ? (
                    <div className="surveyAgeGrid">
                      <label>
                        {text('Years', '年')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialYears}
                          onChange={(event) =>
                            updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                      <label>
                        {text('Months', '月')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialMonths}
                          onChange={(event) =>
                            updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="surveyInlineResponse">
                      {text(
                        'No problem at all. Many of our strongest students started with zero martial arts experience.',
                        '完全没问题。很多优秀学员都是从零基础开始。'
                      )}
                    </p>
                  )}
                </div>
              ) : null}

              {surveyStep === 6 ? (
                <div className="surveyQuestion">
                  <h3>{text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyActivities.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        className={`choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyActivity(activity.value)}
                      >
                        {text(activity.label, activity.zhLabel)}
                      </button>
                    ))}
                  </div>

                  <h3>{text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'yes')}
                    >
                      {text('Yes', '是')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'no')}
                    >
                      {text('No', '否')}
                    </button>
                  </div>
                  {lunchInterestFeedback ? <p className="surveyInlineResponse">{lunchInterestFeedback}</p> : null}
                  <p className="subhead">
                    {text(
                      'This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.',
                      '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。'
                    )}
                  </p>

                  <h3>{text('6c. What are your goals?', '6c. 您的目标是什么？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        className={`choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyGoal(goal.value)}
                      >
                        {text(goal.label, goal.zhLabel)}
                      </button>
                    ))}
                  </div>
                  {getGoalsEncouragement() ? <p className="surveyInlineResponse">{getGoalsEncouragement()}</p> : null}
                </div>
              ) : null}

              {surveyStep === 7 ? (
                <div className="surveyQuestion">
                <h3>{text('7. Recommended camp plan', '7. 推荐营地方案')}</h3>
                {(() => {
                  const recommendation = buildSurveyRecommendation()
                  const [leadLine, ...detailLines] = recommendation
                  return (
                    <div className="recommendationCard recommendationCardFinal">
                      <div className="recommendationBadgeRow">
                        <span className="recommendationBadge">{text('Awarded Best in Burlington', '伯灵顿获奖学院')}</span>
                        <span className="recommendationBadge secondary">{text('Certified Top Coaches', '认证顶级教练团队')}</span>
                      </div>
                      <p className="recommendationLead">{leadLine}</p>
                      <div className="surveyResultList">
                        {detailLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <h3>{text('Are you ready to register?', '准备好报名了吗？')}</h3>
                <div className="surveyChoiceRow">
                  <button type="button" className="button" onClick={handleReadyToRegister}>
                    {text('Yes, take me to registration', '是的，带我去报名')}
                  </button>
                  <button type="button" className="button secondary" onClick={handleThinkAboutIt}>
                    {text('I need time to think', '我需要再考虑一下')}
                  </button>
                </div>
                </div>
              ) : null}

              {getSurveyDidYouKnowFact() ? <p className="surveyDidYouKnow">{getSurveyDidYouKnowFact()}</p> : null}
            </div>

            <div className="surveyActions">
              <button
                type="button"
                className="button secondary"
                onClick={previousSurveyStep}
                disabled={surveyStep === 1}
              >
                {text('Back', '返回')}
              </button>
              {surveyStep < SURVEY_TOTAL_STEPS ? (
                <button type="button" className="button" onClick={nextSurveyStep} disabled={savingSurveyProfile}>
                  {savingSurveyProfile
                    ? text('Saving...', '保存中...')
                    : surveyAwaitingAdvanceStep === surveyStep
                      ? text('Continue', '继续')
                      : text('Next', '下一步')}
                </button>
              ) : null}
            </div>
            {surveyMessage ? <p className="message">{surveyMessage}</p> : null}
            {activeSurveyVideo ? (
              <div className="surveyVideoDock">
                {activeSurveyYouTubeEmbed ? (
                  <>
                    <iframe
                      src={activeSurveyYouTubeEmbed}
                      title="Program guide video"
                      loading="eager"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
                      allowFullScreen
                    />
                    <p className="surveyVideoHint">
                      {text(
                        'On iPhone, autoplay can be blocked in Low Power Mode. If it does not auto-play, tap play once.',
                        'iPhone 在省电模式下可能会阻止自动播放；若未自动播放，请点击播放一次。'
                      )}
                    </p>
                  </>
                ) : (
                  <video
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    src={activeSurveyVideo}
                  />
                )}
              </div>
            ) : null}
          </article>
        </section>
      )
      ) : null}

      {showMainCampPage ? (
        <>
      <section className="hero card" id="camp-info">
        <div className="heroIntroRow">
          <div className="heroIntroText">
            <p className="eyebrow">New England Wushu Summer Camp 2026</p>
            <p className="heroLocationLine">{text('Burlington & Acton Locations', 'Burlington 与 Acton 两大校区')}</p>
            <h1>{text('Structured martial arts camp for confident, active kids.', '为孩子打造有结构、有成长感的武术夏令营。')}</h1>
            <p className="subhead">
              {text(
                'Ages 3-17. All levels welcome. Full-week, full-day, and half-day options across summer.',
                '3-17岁。所有水平均可参加。整个夏季提供整周、全天与半天选择。'
              )}
            </p>
            <div className="heroQuickFacts" aria-label={text('Key camp facts', '营地关键信息')}>
              <span>{text('Ages 3-17', '3-17岁')}</span>
              <span>{text('Full-Day & Half-Day', '全天与半天可选')}</span>
              <span>{text(dayCampSeasonLabel, dayCampSeasonLabel)}</span>
              <span>{text('All Levels Welcome', '所有水平欢迎参加')}</span>
            </div>
          </div>
          <div className="heroIntroLogo" aria-label="New England Wushu logo">
            {pageHeroLogo}
          </div>
        </div>
        <div className="heroDecisionStrip">
          <article className="heroDecisionCard">
            <p className="heroAchievementLabel">{text('Program Format', '课程形式')}</p>
            <h3>{text('Weekly camps with flexible enrollment options', '按周报名，并可灵活选择上课形式')}</h3>
            <p>{text('Choose full week, full day, or half day based on your family schedule.', '可根据家庭安排选择整周、全天或半天。')}</p>
          </article>
          <article className="heroDecisionCard">
            <p className="heroAchievementLabel">{text('What makes it different', '核心差异')}</p>
            <h3>{text('Real martial arts training with structure and fun', '真正的武术训练，兼顾结构感与乐趣')}</h3>
            <p>{text('Not chaotic free play. Campers train, build discipline, and still have a great summer experience.', '不是无序放养式活动。孩子会训练、建立纪律，同时也能享受精彩夏天。')}</p>
          </article>
        </div>
        <div className="heroAchievementGrid" aria-label="Camp achievements">
          <article className="heroAchievementCard">
            <p className="heroAchievementLabel">{text('Locations', '校区')}</p>
            <h3>{text('Burlington & Acton', 'Burlington 与 Acton')}</h3>
            <p>
              {text(
                'Choose the location that works best for your commute and your camper’s weekly rhythm.',
                '选择最适合接送与家庭节奏的校区。'
              )}
            </p>
          </article>
          <article className="heroAchievementCard">
            <p className="heroAchievementLabel">{text('Camp Window', '营期')}</p>
            <h3>{text(dayCampSeasonLabel, dayCampSeasonLabel)}</h3>
            <p>
              {text(
                'Summer weeks run across the main family vacation window, so planning is straightforward.',
                '营期覆盖主要暑假时间段，方便家庭直接规划。'
              )}
            </p>
          </article>
          <article className="heroAchievementCard">
            <p className="heroAchievementLabel">{text('Pricing Snapshot', '价格概览')}</p>
            <h3>{text(`From ${currency(dayCampPricing.fullWeek)}/week`, `整周 ${currency(dayCampPricing.fullWeek)} 起`)}</h3>
            <p>
              {text(
                `Full day ${currency(dayCampPricing.fullDay)}/day. Half day ${halfDayPriceLabel || 'contact us for pricing'}.`,
                `全天 ${currency(dayCampPricing.fullDay)}/天。半天 ${halfDayPriceLabel || '价格请联系咨询'}。`
              )}
            </p>
          </article>
        </div>
        <div className="heroCompactPoints">
          <article className="heroCompactPointCard">
            <p className="heroAchievementLabel">{text('General Camp', '普通营')}</p>
            <h3>{text('Best for beginners and returning campers who want structure, movement, and fun.', '适合新学员与返营学员，重视结构、运动与乐趣。')}</h3>
          </article>
          <article className="heroCompactPointCard">
            <p className="heroAchievementLabel">{text('Competition Boot Camp', '竞赛集训营')}</p>
            <h3>{text('For serious athletes building technique, polish, and competition readiness.', '适合希望强化技术、细节与竞赛准备的学员。')}</h3>
          </article>
          <article className="heroCompactPointCard">
            <p className="heroAchievementLabel">{text('Family Confidence', '家长安心')}</p>
            <h3>{text('Daily structure, small groups, real coaching, and visible progress.', '日程清晰、小班教学、真实训练，并且成长可见。')}</h3>
          </article>
        </div>

        <div className="pointsGlowBox">
          <span className="pointsGlowBadge">Points by enrollment</span>
          <strong>{dayCampPointsBreakdown}</strong>
          <p>{dayCampPointsUseCopy}</p>
        </div>

        <div className="heroActions">
          <button type="button" className="button heroPrimaryCta" onClick={jumpToRegistration}>
            {text('Register Now', '立即报名')}
          </button>
          <a className="button" href="#camp-dates">
            {text('See Camp Options', '查看营地选项')}
          </a>
          <p className="heroActionNote">
            {text(
              'Secure your preferred weeks early and lock in current pricing.',
              '尽早锁定心仪营期并保留当前价格。'
            )}
          </p>
        </div>

        {activeCampGalleryItem ? (
          <div
            className="heroGalleryWrap"
            onTouchStart={onCampGalleryTouchStart}
            onTouchEnd={onCampGalleryTouchEnd}
          >
            <div className="heroGalleryRail">
              <button
                type="button"
                className="heroGalleryArrow left"
                onClick={previousCampGallerySlide}
                aria-label={text('Previous camp photo', '上一张营地照片')}
              >
                ←
              </button>
              <div className="heroGallerySide left" aria-hidden="true">
                {previousCampGalleryItem?.src ? (
                  <img src={previousCampGalleryItem.src} alt="" style={getLandingCarouselImageStyle(previousCampGalleryItem.positionIndex)} />
                ) : (
                  <div className="heroGalleryPlaceholderSide">{previousCampGalleryItem?.slot || text('Camp Photo', '营地照片')}</div>
                )}
              </div>
              <figure
                key={`gallery-${normalizedCampGalleryIndex}`}
                className={`heroGalleryMain ${campGalleryDirection === 'next' ? 'next' : 'prev'}`}
              >
                {activeCampGalleryItem.src ? (
                  <img
                    className="heroMedia"
                    src={activeCampGalleryItem.src}
                    alt={text('Summer camp gallery', '夏令营图集')}
                    style={getLandingCarouselImageStyle(activeCampGalleryItem.positionIndex)}
                  />
                ) : (
                  <div className="heroMediaPlaceholder">
                    <strong>{activeCampGalleryItem.slot}</strong>
                    <span>{text('Upload this photo slot in /admin media.', '请在 /admin 媒体中上传此照片位。')}</span>
                  </div>
                )}
              </figure>
              <div className="heroGallerySide right" aria-hidden="true">
                {nextCampGalleryItem?.src ? (
                  <img src={nextCampGalleryItem.src} alt="" style={getLandingCarouselImageStyle(nextCampGalleryItem.positionIndex)} />
                ) : (
                  <div className="heroGalleryPlaceholderSide">{nextCampGalleryItem?.slot || text('Camp Photo', '营地照片')}</div>
                )}
              </div>
              <button
                type="button"
                className="heroGalleryArrow right"
                onClick={nextCampGallerySlide}
                aria-label={text('Next camp photo', '下一张营地照片')}
              >
                →
              </button>
            </div>
            <p className="heroGalleryCaption">
              {text(activeCampGalleryCaption.en, activeCampGalleryCaption.zh)}
            </p>
            <div className="heroGalleryDots" aria-label={text('Camp photo position', '营地图集位置')}>
              {campGalleryItems.map((_, index) => (
                <button
                  key={`gallery-dot-${index}`}
                  type="button"
                  className={`dot ${index === normalizedCampGalleryIndex ? 'active' : ''}`}
                  onClick={() => goToCampGallerySlide(index, index > normalizedCampGalleryIndex ? 'next' : 'prev')}
                  aria-label={text(`Go to photo ${index + 1}`, `跳转到第 ${index + 1} 张`)}
                />
              ))}
            </div>
          </div>
        ) : null}

      </section>

      <section className="card section campFeatureShowcase" id="why-camp">
        {landingSectionVisuals.whyCamp ? (
          <figure className="sectionMediaBanner">
            <img src={landingSectionVisuals.whyCamp} alt="Camp highlights banner" />
          </figure>
        ) : null}
        <div className="featureShowcaseHead">
          <p className="eyebrow">{text('Why Families Choose Us', '家长为什么选择我们')}</p>
          <h2>{text('A premium camp experience with real structure behind it', '真正有体系支撑的高质量夏令营体验')}</h2>
        </div>
        <div className="premiumFeatureGrid">
          {perks.map((perk) => (
            <article key={perk.title} className="premiumFeatureCard">
              <span className="premiumFeatureIcon" aria-hidden="true">✓</span>
              <h3>{text(perk.title, perk.zhTitle)}</h3>
              <p>{text(perk.text, perk.zhText)}</p>
            </article>
          ))}
        </div>
        <div className="heroActions">
          <button type="button" className="button" onClick={jumpToRegistration}>
            {text('Register Now', '立即报名')}
          </button>
        </div>
      </section>

      <section id="camp-marketing-flow" className="card section appCarouselSection">
        {landingSectionVisuals.marketingFlow ? (
          <figure className="sectionMediaBanner">
            <img src={landingSectionVisuals.marketingFlow} alt="Camp fit flow banner" />
          </figure>
        ) : null}
        <h2>{text('Pricing', '价格')}</h2>
        <p className="subhead">
          {text(
            'Clear pricing for the main day-camp options. Families can add lunch by day and claim the current early offer before it ends.',
            '这是日营主要价格的一览。家庭可按天加购午餐，并在优惠截止前领取当前早鸟价格。'
          )}
        </p>
        <div className="pricingGrid">
          <article className="pricingCard featured">
            <p className="pricingLabel">{text('Full Week', '整周')}</p>
            <strong>{currency(dayCampPricing.fullWeek)}</strong>
            <span>{text('Best value for full camp immersion', '适合完整沉浸式营地体验')}</span>
          </article>
          <article className="pricingCard">
            <p className="pricingLabel">{text('Full Day', '全天')}</p>
            <strong>{currency(dayCampPricing.fullDay)}</strong>
            <span>{text('9:00 AM - 4:00 PM', '上午9点至下午4点')}</span>
          </article>
          <article className="pricingCard">
            <p className="pricingLabel">{text('Half Day', '半天')}</p>
            <strong>{halfDayPriceLabel || text('Contact Us', '请联系咨询')}</strong>
            <span>{text('AM or PM options', '上午或下午均可选')}</span>
          </article>
          <article className="pricingCard accent">
            <p className="pricingLabel">{text('Lunch Add-On', '午餐加购')}</p>
            <strong>{currency(adminConfig.tuition.lunchPrice)}</strong>
            <span>{text('Available by day', '可按天选择')}</span>
          </article>
        </div>
        {discountActive ? (
          <div className="pricingPromoCard">
            <strong>
              {text(
                `Early Bird Discount: Save ${currency(fullWeekDiscountAmount)} per full week before ${discountEndDateSpokenLabel.en}.`,
                `早鸟优惠：在 ${discountEndDateSpokenLabel.zh} 前报名，整周每周立减 ${currency(fullWeekDiscountAmount)}。`
              )}
            </strong>
            <p>{text('Reserve now to lock in the current offer.', '现在报名即可锁定当前优惠。')}</p>
          </div>
        ) : null}
        <div className="heroActions">
          <button type="button" className="button heroPrimaryCta" onClick={jumpToRegistration}>
            {text('Register Now', '立即报名')}
          </button>
        </div>
      </section>

      <section className="card section testimonialsHero" id="student-stories">
        {landingSectionVisuals.testimonials ? (
          <figure className="sectionMediaBanner">
            <img src={landingSectionVisuals.testimonials} alt="Student stories banner" />
          </figure>
        ) : null}
        <p className="eyebrow">{text('Student Stories', '学员故事')}</p>
        <h2>{text('What kind of growth do families actually see?', '家庭通常能看到哪些真实成长？')}</h2>
        <p className="subhead">
          {text(
            'Real stories from campers and parents, directly from our current program community.',
            '以下内容来自现有营地家庭的真实反馈。'
          )}
        </p>
        {activeTestimonial ? (
          <>
            <div className="testimonialCarousel">
              <button
                type="button"
                className="testimonialArrow"
                onClick={previousTestimonial}
                aria-label={text('Previous story', '上一条故事')}
              >
                ←
              </button>
              <article key={`story-${normalizedTestimonialIndex}-${language}`} className="testimonialCard testimonialCardActive">
                <p className="journeyDay">
                  {localizeTestimonialValue(
                    activeTestimonial.studentName,
                    text(`Student Story ${normalizedTestimonialIndex + 1}`, `学员故事 ${normalizedTestimonialIndex + 1}`)
                  )}
                </p>
                {language === 'zh' ? <p className="translatedTag">{text('Translated', '已翻译')}</p> : null}
                {activeTestimonialHighlights.length > 0 ? (
                  <div className="testimonialHighlights" aria-label={text('Story highlights', '故事亮点')}>
                    {activeTestimonialHighlights.map((item) => (
                      <span key={`testimonial-highlight-${item}`} className="testimonialHighlightTag">
                        {localizeTestimonialValue(item, item)}
                      </span>
                    ))}
                  </div>
                ) : null}
                <h3>{localizeTestimonialValue(activeTestimonial.headline, text('Progress story', '成长故事'))}</h3>
                <p>{localizeTestimonialValue(activeTestimonial.story, text('Story coming soon.', '故事即将更新。'))}</p>
                {activeTestimonial.outcome ? (
                  <p className="testimonialOutcome">
                    {localizeTestimonialValue(activeTestimonial.outcome, activeTestimonial.outcome)}
                  </p>
                ) : null}
              </article>
              <button
                type="button"
                className="testimonialArrow"
                onClick={nextTestimonial}
                aria-label={text('Next story', '下一条故事')}
              >
                →
              </button>
            </div>
            <div className="testimonialDots" aria-label={text('Story carousel position', '故事轮播位置')}>
              {featuredTestimonials.map((_, index) => (
                <button
                  key={`testimonial-dot-${index}`}
                  type="button"
                  className={`dot ${index === normalizedTestimonialIndex ? 'active' : ''}`}
                  onClick={() => setTestimonialIndex(index)}
                  aria-label={text(`Go to story ${index + 1}`, `跳转到故事 ${index + 1}`)}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section id="camp-dates" className="card section">
        <h2>{text('Camp Options', '营地选项')}</h2>
        <p className="subhead">
          {text(
            'The two main day-camp paths are easy to compare below. Overnight camp stays available as a separate immersive option.',
            '下方可直接比较两种主要日营路径。过夜营仍作为单独的沉浸式选择开放。'
          )}
        </p>
        {discountActive ? (
          <p className="campTypeDiscountNote">
            {text(
              `Early offer ends on ${discountEndDateSpokenLabel.en}. Claim your discount when you register.`,
              `早鸟优惠截止至 ${discountEndDateSpokenLabel.zh}，报名时即可领取。`
            )}
          </p>
        ) : null}
        <article className="campTypeShowcaseCard">
          <div className="campOptionsGrid">
            <article className="campOptionCard">
              <p className="heroAchievementLabel">{text('General Camp', '普通营')}</p>
              <h3>{text('All levels welcome', '所有水平均可参加')}</h3>
              <p>{text('Fun, structured training with games, arts and crafts, team activities, and weekly confidence-building moments.', '有趣且有结构的训练，融合游戏、手工、团队活动和每周建立自信的展示时刻。')}</p>
              <ul className="campTypeHighlightList">
                <li>{text('Best for beginners and returning campers', '适合新学员与返营学员')}</li>
                <li>{text('Balance of training, games, and creativity', '训练、游戏与创意活动平衡结合')}</li>
                <li>{text('Small groups and visible weekly progress', '小班教学，成长清晰可见')}</li>
              </ul>
            </article>
            <article className="campOptionCard bootcamp">
              <p className="heroAchievementLabel">{text('Competition Team Boot Camp', '竞赛队集训营')}</p>
              <h3>{text('Advanced and competition-focused', '偏进阶与竞赛导向')}</h3>
              <p>{text('A focused training path for students building performance quality, routine polish, and competition readiness.', '为希望提升表现力、套路细节与竞赛准备度的学员提供更专注的训练路径。')}</p>
              <ul className="campTypeHighlightList">
                <li>{text('For serious students preparing for competition', '适合认真准备竞赛的学员')}</li>
                <li>{text('More technical correction and training intensity', '更强调技术修正与训练强度')}</li>
                <li>{text('Led by experienced competition coaches', '由有竞赛经验的教练带领')}</li>
              </ul>
            </article>
          </div>
          <div className="campOptionFooter">
            <div className="pointsGlowBox compact">
              <span className="pointsGlowBadge">New England Wushu Level Up</span>
              <strong>{dayCampPointsBreakdown}</strong>
              <p>{dayCampPointsUseCopy}</p>
            </div>
            <div className="overnightMiniCard">
              <strong>{text('Need something more immersive?', '需要更沉浸式的选择吗？')}</strong>
              <p>{text('Our Overnight Camp offers a separate full-week live-in experience with training, outings, and camp-life bonding.', '过夜营提供独立的整周住宿式体验，包含训练、外出活动与营地生活。')}</p>
              <a className="button" href="/overnight">
                {text('Explore Overnight Camp', '查看过夜营')}
              </a>
            </div>
          </div>
        </article>
        <div className="heroActions">
          <button type="button" className="button heroPrimaryCta" onClick={jumpToRegistration}>
            {text('Register Now', '立即报名')}
          </button>
        </div>
      </section>

      <section id="weekly-structure" className="card section">
        {landingSectionVisuals.weekly ? (
          <figure className="sectionMediaBanner">
            <img src={landingSectionVisuals.weekly} alt="Weekly structure banner" />
          </figure>
        ) : null}
        <h2>{text('A Day at Camp', '营地的一天')}</h2>
        <p className="subhead">
          {text(
            'Parents want to know what the day actually feels like. This is the flow most families can expect from a standard full day at camp.',
            '家长最关心的一点之一就是：孩子一天大概怎么安排。以下是标准全天营的典型日程。'
          )}
        </p>
        <div className="dayTimeline">
          {dayAtCampTimeline.map((item) => (
            <article key={item.time} className="dayTimelineItem">
              <p className="dayTimelineTime">{item.time}</p>
              <div>
                <h3>{text(item.title, item.zhTitle)}</h3>
                <p>{text(item.note, item.zhNote)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="daySupportGrid">
          <article className="daySupportCard">
            <strong>{text('Built-in structure', '内置结构感')}</strong>
            <p>{text('The day has rhythm and purpose, not random filler activities.', '每天都有清晰节奏和目标，不是随意拼凑的活动。')}</p>
          </article>
          <article className="daySupportCard">
            <strong>{text('Lunch made easier', '午餐更省心')}</strong>
            <p>{text(`Lunch can be added by day for ${currency(adminConfig.tuition.lunchPrice)}, and Thursday BBQ is included.`, `午餐可按天加购，每天 ${currency(adminConfig.tuition.lunchPrice)}，周四烧烤已包含。`)}</p>
          </article>
          <article className="daySupportCard">
            <strong>{text('Visible progress', '成长可见')}</strong>
            <p>{text('Families get daily updates, photos, and coach notes through the app.', '家庭可通过应用查看每日日志、照片与教练反馈。')}</p>
          </article>
        </div>
        <div className="heroActions">
          <button type="button" className="button heroPrimaryCta" onClick={jumpToRegistration}>
            {text('Register Now', '立即报名')}
          </button>
        </div>
      </section>

      <section className="card section">
        <h2>{text('Camp Locations', '营地地点')}</h2>
        <p className="subhead">
          {text(
            'Families can choose Burlington or Acton during registration. We serve nearby families across these surrounding towns.',
            '家庭可在报名时选择 Burlington 或 Acton。我们服务周边多个相邻城镇的家庭。'
          )}
        </p>
        <div className="locationGrid">
          {LOCATION_OPTIONS.map((location) => (
            <article key={location.value} className="locationCard">
              <div className="locationCardHead">
                <span className="locationBadge">{location.label}</span>
                <strong>{text('Nearby towns served', '服务周边城镇')}</strong>
              </div>
              <div className="locationTownList">
                {location.towns.map((town) => (
                  <span key={`${location.value}-${town}`} className="locationTownChip">
                    {town}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {showLandingOnlySections ? (
      <section className="card section levelUpSection" id="level-up">
        <div
          className="phoneMock"
          aria-hidden="true"
          onTouchStart={onLevelUpTouchStart}
          onTouchEnd={onLevelUpTouchEnd}
        >
          <div className="phoneFrame">
            <div className="phoneNotch" />
            <div className="phoneScreen">
              {phoneScreenshots.length > 0 ? (
                <img
                  className={`phoneImage slideImage ${slideDirection === 'next' ? 'next' : 'prev'}`}
                  src={activeLevelUpScreenshot}
                  alt="Level Up app screenshot"
                  style={{
                    width: `${levelUpRenderScale}%`,
                    ...getLevelUpScreenshotStyle(activeLevelUpScreenshotIndex),
                  }}
                />
              ) : (
                <p>Level Up app screenshot goes here</p>
              )}
            </div>
          </div>
        </div>

        <div className="levelUpContent">
          <p className="eyebrow">Level Up App</p>
          <h2>{text('How do campers track real progress?', '营员如何跟踪真实进步？')}</h2>
          <p className="subhead">
            {text(
              'Camp leaders and coaches update daily progress in the app with photo/video logs, weekly schedules, and lunch ordering so parents can follow what campers do day to day.',
              '营地主任与教练会在应用内每日更新成长进度（含照片/视频日志）、每周日程与午餐下单，方便家长随时了解孩子每天的训练与进步。'
            )}
          </p>
          <div className="pointsGlowBox compact">
            <span className="pointsGlowBadge">Points by enrollment</span>
            <strong>{dayCampPointsBreakdown}</strong>
            <p>{dayCampPointsUseCopy}</p>
          </div>

          <div className="carouselControls">
            <button type="button" className="carouselBtn" onClick={previousLevelUpSlide}>
              Prev
            </button>
            <button type="button" className="carouselBtn" onClick={nextLevelUpSlide}>
              Next
            </button>
          </div>

          <div className="featureList featureCarousel">
            <article key={`${activeLevelUpFeature}-${levelUpSlideIndex}`} className="featureItem active">
              {activeLevelUpFeature}
            </article>
          </div>
          <div className="carouselDots" aria-label="Level Up slides">
            {Array.from({ length: levelUpSlideCount }).map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`dot ${index === levelUpSlideIndex ? 'active' : ''}`}
                onClick={() => goToLevelUpSlide(index, index > levelUpSlideIndex ? 'next' : 'prev')}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {showRegistrationSections ? (
      <section ref={registrationRef} className="card section" id="register">
        <header>
          {adminConfig.media.welcomeLogoUrl ? (
            <img className="brandMiniLogo" src={adminConfig.media.welcomeLogoUrl} alt="New England Wushu logo" />
          ) : null}
          <h2>{text('Registration flow', '报名流程')}</h2>
          <p className="subhead">
            {text(
              'Family registration with per-camper weekly scheduling. New this year: Level Up app access for lunch booking and daily progress photos/videos.',
              '家庭报名可为每位营员分别安排每周日程。今年新增：可通过 Level Up 应用预订午餐并查看每日照片/视频成长记录。'
            )}
          </p>
          <div className="pointsGlowBox compact">
            <span className="pointsGlowBadge">New England Wushu Level Up points</span>
            <strong>{dayCampPointsBreakdown}</strong>
            <p>{dayCampPointsUseCopy}</p>
          </div>
          <div className="registrationHeaderActions">
            <button type="button" className="button secondary" onClick={clearRegistrationForm}>
              {text('Clear form', '清空表单')}
            </button>
            <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
              {text('Go to Summer Day Camp Page', '进入夏令营日营页面')}
            </button>
          </div>
        </header>

        <div className="registrationTabBar">
          <div className="registrationTabs" role="tablist" aria-label={text('Registration steps', '报名步骤')}>
            {registrationSteps.map((item) => (
              (() => {
              const isComplete = isRegistrationStepComplete(item.id)
              const isMissing = !isComplete
              return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={step === item.id}
                className={`registrationTab ${item.id === step ? 'active' : item.id < step && isComplete ? 'done' : ''} ${item.id < step && isMissing ? 'incomplete' : ''}`}
                onClick={() => {
                  setStepDirection(item.id > step ? 'next' : 'prev')
                  setStep(item.id)
                }}
              >
                <span className="registrationTabNumber">{item.id}</span>
                <span className="registrationTabLabel">
                  {item.id === 1
                    ? text('Family & campers', '家庭与营员')
                    : item.id === 2
                      ? text('Camp weeks & times', '营期与时段')
                      : item.id === 3
                        ? text('Lunch days', '午餐日期')
                        : text('Review & submit', '检查并提交')}
                </span>
                {isMissing ? <span className="registrationStepAlertDot" aria-hidden="true" /> : null}
              </button>
              )
              })()
            ))}
          </div>
          <div className="registrationCamperRow">
            <p className="registrationViewingLabel">
              {text('Viewing:', '当前查看：')} <strong>{activeCamperLabel}</strong>
            </p>
          </div>
        </div>

        <div className="regSummarySticky">
          <div className="registrationStatusRow regSummaryStatusBar">
            <span className={`registrationStatusChip ${registrationIsSubmitted ? 'submitted' : 'pending'}`}>
              {registrationIsSubmitted ? text('Registration Submitted', '报名已提交') : text('Registration Not Confirmed', '报名未确认')}
            </span>
            <button type="button" className="button siblingAddButton regSummaryAddCamperSmall" onClick={addStudent}>
              {text('+ Add camper', '+ 添加营员')}
            </button>
          </div>
          <div className="regSummaryCamperSwitch regSummaryCamperSwitchTop" aria-label="Camper switcher">
            {registration.students.map((student, index) => {
              const label = student.fullName.trim() || `Camper ${index + 1}`
              const active = resolvedActiveStudentId === student.id
              const missing = isCamperMissingAnyStep(student)
              return (
                <div
                  key={`summary-camper-top-${student.id}`}
                  className={`registrationCamperTab regSummaryCamperChip ${active ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="regSummaryCamperMainBtn"
                    onClick={() => activateCamper(student.id)}
                    aria-pressed={active}
                  >
                    <span>{label}</span>
                    {missing ? <span className="registrationCamperAlertDot" aria-hidden="true" /> : null}
                  </button>
                  {registration.students.length > 1 ? (
                    <button
                      type="button"
                      className="regSummaryCamperRemoveBtn"
                      aria-label={text(`Remove ${label}`, `移除 ${label}`)}
                      onClick={() => confirmAndRemoveStudent(student.id)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            className="regSummaryToggle"
            onClick={() => setSummaryExpanded((current) => !current)}
            aria-expanded={summaryExpanded}
          >
            <span>
              <strong>{text('Registration summary', '报名摘要')}</strong>
              <em>
                {summaryExpanded
                  ? `${registration.students.length} ${text(registration.students.length === 1 ? 'camper' : 'campers', registration.students.length === 1 ? '位营员' : '位营员')} · ${summaryDigest.totalCampDays} ${text('selected day blocks', '个已选上课时段')} · ${summaryDigest.totalPaidLunchDays} ${text('paid lunch days', '个付费午餐日')} · ${summaryDigest.totalIncludedLunchDays} ${text('Thu included lunch days', '个周四含午餐日')}`
                  : text('Tap to expand summary', '点击展开摘要')}
              </em>
            </span>
            <span className="regSummaryToggleAction">
              {summaryExpanded ? text('Minimize', '最小化') : text('Expand', '展开')}
              <span className={`regSummaryChevron ${summaryExpanded ? 'open' : ''}`}>⌄</span>
            </span>
          </button>
          {summaryExpanded ? (
            <>
              <div className="regSummaryTopRow">
                <div className="registrationLocationBanner registrationLocationSummaryCard compact">
                  <span className="registrationLocationLabel">{text('Registration location', '报名地点')}</span>
                  <strong>{selectedLocationLabel}</strong>
                  <span className="registrationLocationHintText">{text('Tap to change location', '点击切换地点')}</span>
                  <div className="registrationLocationInlineToggle" role="group" aria-label={text('Choose registration location', '选择报名地点')}>
                    {LOCATION_OPTIONS.map((option) => {
                      const active = registration.location === option.value
                      return (
                        <button
                          key={`summary-location-${option.value}`}
                          type="button"
                          className={`registrationLocationToggleBtn ${active ? 'active' : ''}`}
                          aria-pressed={active}
                          onClick={() => updateContact('location', option.value)}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="regSummaryGrid">
              {summaries.map(({ student, summary }) => (
                (() => {
                const generalTotal =
                  summary.general.fullWeeks +
                  summary.general.fullDays +
                  summary.general.amDays +
                  summary.general.pmDays
                const bootTotal =
                  summary.bootcamp.fullWeeks +
                  summary.bootcamp.fullDays +
                  summary.bootcamp.amDays +
                  summary.bootcamp.pmDays

                return (
                  <button
                    key={student.id}
                    type="button"
                    className={`regSummaryCard regSummaryButton ${
                      resolvedActiveStudentId === student.id ? 'selected' : ''
                    }`}
                    onClick={() => setActiveStudentId(student.id)}
                    aria-pressed={resolvedActiveStudentId === student.id}
                  >
                    <div className="regSummaryHead">
                      <strong>{student.fullName || text('Unnamed camper', '未命名营员')}</strong>
                      {resolvedActiveStudentId === student.id ? <span className="selectedPill">{text('Selected', '已选中')}</span> : null}
                    </div>

                    {generalTotal > 0 ? (
                      <div className="summaryProgram general">
                        <p className="summaryProgramTitle">{text('General Camp', '普通夏令营')}</p>
                        <div className="summaryStatRow">
                          {summary.general.fullWeeks > 0 ? (
                            <span className="summaryStatPill">
                              {pluralize('Full Week', summary.general.fullWeeks)}
                            </span>
                          ) : null}
                          {summary.general.fullDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('Full Day', summary.general.fullDays)}</span>
                          ) : null}
                          {summary.general.amDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('AM Day', summary.general.amDays)}</span>
                          ) : null}
                          {summary.general.pmDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('PM Day', summary.general.pmDays)}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {bootTotal > 0 ? (
                      <div className="summaryProgram bootcamp">
                        <p className="summaryProgramTitle">{text('Competition Boot Camp', '竞赛强化营')}</p>
                        <div className="summaryStatRow">
                          {summary.bootcamp.fullWeeks > 0 ? (
                            <span className="summaryStatPill">
                              {pluralize('Full Week', summary.bootcamp.fullWeeks)}
                            </span>
                          ) : null}
                          {summary.bootcamp.fullDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('Full Day', summary.bootcamp.fullDays)}</span>
                          ) : null}
                          {summary.bootcamp.amDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('AM Day', summary.bootcamp.amDays)}</span>
                          ) : null}
                          {summary.bootcamp.pmDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('PM Day', summary.bootcamp.pmDays)}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {generalTotal + bootTotal === 0 ? (
                      <p className="summaryEmpty">{text('No camp days selected yet.', '尚未选择营期日期。')}</p>
                    ) : null}

                    <p className="summaryLunch">
                      {pluralize(text('Paid Lunch Day', '付费午餐日'), summary.lunchCount)} · {text('Thu included', '周四含午餐')}{' '}
                      {getLunchDecisionStats(student, weeksById).includedLunchDays}
                    </p>

                    {resolvedActiveStudentId === student.id ? (
                      <div className="regSummaryDetails">
                        <div className="regSummaryDetailRow">
                          <span className="regSummaryDetailLabel">{text('General Camp', '普通夏令营')}</span>
                          <span className="regSummaryDetailValue">
                            {summary.general.fullWeeks > 0 ? `${summary.general.fullWeeks} full week${summary.general.fullWeeks === 1 ? '' : 's'}` : '0'}
                            {summary.general.fullDays > 0 ? `, ${summary.general.fullDays} full day${summary.general.fullDays === 1 ? '' : 's'}` : ''}
                            {summary.general.amDays > 0 ? `, ${summary.general.amDays} AM` : ''}
                            {summary.general.pmDays > 0 ? `, ${summary.general.pmDays} PM` : ''}
                          </span>
                        </div>
                        <div className="regSummaryDetailRow">
                          <span className="regSummaryDetailLabel">{text('Boot Camp', '强化营')}</span>
                          <span className="regSummaryDetailValue">
                            {summary.bootcamp.fullWeeks > 0 ? `${summary.bootcamp.fullWeeks} full week${summary.bootcamp.fullWeeks === 1 ? '' : 's'}` : '0'}
                            {summary.bootcamp.fullDays > 0 ? `, ${summary.bootcamp.fullDays} full day${summary.bootcamp.fullDays === 1 ? '' : 's'}` : ''}
                            {summary.bootcamp.amDays > 0 ? `, ${summary.bootcamp.amDays} AM` : ''}
                            {summary.bootcamp.pmDays > 0 ? `, ${summary.bootcamp.pmDays} PM` : ''}
                          </span>
                        </div>
                        <div className="regSummaryDetailRow">
                          <span className="regSummaryDetailLabel">{text('Lunch', '午餐')}</span>
                          <span className="regSummaryDetailValue">
                            {getLunchDecisionStats(student, weeksById).lunchProvidedDays} provided, {getLunchDecisionStats(student, weeksById).packLunchNeededDays} pack-needed
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="regSummaryTapHint">{text('Tap to expand details', '点击展开详情')}</span>
                    )}
                  </button>
                )
                })()
              ))}
              </div>
            </>
          ) : null}
          <p className="regStepHint">
            <strong>{stepShortTitle}</strong>
          </p>
        </div>

        {missingConfig ? (
          <div className="warning">
            Missing environment variables. Copy <code>.env.example</code> to <code>.env</code> and add your
            Supabase project values.
          </div>
        ) : null}

        <form onSubmit={submitRegistration}>
          <article key={`reg-step-${step}`} className={`registrationStepCard ${stepDirection} ${step === 1 ? 'stepOneLayout' : ''}`}>
            <div className="registrationStepHero">
              <div className="registrationStepText">
                {adminConfig.media.welcomeLogoUrl ? (
                  <img className="brandMiniLogo inline" src={adminConfig.media.welcomeLogoUrl} alt="New England Wushu logo" />
                ) : null}
                <p className="eyebrow">{text(`Registration Step ${step}`, `报名步骤 ${step}`)}</p>
                <span className={`registrationStatusChip ${registrationIsSubmitted ? 'submitted' : 'pending'}`}>
                  {registrationIsSubmitted ? text('Registration Submitted', '报名已提交') : text('Registration Not Confirmed', '报名未确认')}
                </span>
                <span className="registrationLocationPill">{selectedLocationLabel}</span>
                <h3>{stepShortTitle}</h3>
              </div>
              <div className="registrationStepVisual">
                {activeRegistrationStepImage ? (
                  <img
                    src={activeRegistrationStepImage}
                    alt={`Registration step ${step} visual`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="surveyVisualPlaceholder">Add registration step {step} image in /admin media.</div>
                )}
              </div>
            </div>
          {step === 1 ? (
            <div className="grid registrationStepOneGrid">
              <label>
                      <span className="requiredFieldLabel">{text('Camp location', '营地地点')} {locationMissing ? <span className="requiredDot" /> : null}</span>
                <select
                  id="reg-location"
                  className={locationMissing ? 'fieldIncomplete' : ''}
                  value={registration.location}
                  onChange={(event) => updateContact('location', event.target.value)}
                  required
                >
                  <option value="">{text('Select location', '选择地点')}</option>
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={`location-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {registration.location.trim() ? (
                <div className="full locationAlbumCard">
                  <div className="locationAlbumIntro">
                    <div>
                      <p className="eyebrow">{text('Step 1 preview', '步骤 1 预览')}</p>
                      <h4>{locationAlbumTitle}</h4>
                      <p className="subhead">
                        {text('Preview the training space before you continue. Click to open the small album.', '继续前可先查看训练场地。点击打开相册预览。')}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => {
                        setLocationAlbumIndex(0)
                        setLocationAlbumOpen(true)
                      }}
                      disabled={locationFacilityPhotos.length === 0}
                    >
                      {locationFacilityPhotos.length > 0 ? text('Open photo album', '打开照片相册') : text('No facility photos added yet', '尚未添加场地照片')}
                    </button>
                  </div>
                  {locationFacilityPhotos.length > 0 ? (
                    <div className="locationAlbumPreviewStrip">
                      {locationFacilityPhotos.slice(0, 4).map((url, index) => (
                        <button
                          key={`location-preview-${registration.location}-${index}`}
                          type="button"
                          className="locationAlbumPreviewThumb"
                          onClick={() => {
                            setLocationAlbumIndex(index)
                            setLocationAlbumOpen(true)
                          }}
                        >
                          <img src={url} alt={`${selectedLocationLabel} facility preview ${index + 1}`} loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="subhead">{text('Admin can add Burlington and Acton facility photos in the media tab.', '管理员可在媒体标签中添加 Burlington 和 Acton 场地照片。')}</p>
                  )}
                </div>
              ) : null}

              <label>
                <span className="requiredFieldLabel">{text('Parent/Guardian name', '家长/监护人姓名')} {parentNameMissing ? <span className="requiredDot" /> : null}</span>
                <input
                  id="reg-parent-name"
                  className={parentNameMissing ? 'fieldIncomplete' : ''}
                  value={registration.parentName}
                  onChange={(event) => updateContact('parentName', event.target.value)}
                  required
                />
              </label>

              <label>
                <span className="requiredFieldLabel">{text('Contact email', '联系邮箱')} {contactEmailMissing ? <span className="requiredDot" /> : null}</span>
                <input
                  id="reg-contact-email"
                  type="email"
                  className={contactEmailMissing ? 'fieldIncomplete' : ''}
                  value={registration.contactEmail}
                  onChange={(event) => updateContact('contactEmail', event.target.value)}
                  required
                />
                <p className="marketingConsentNote">
                  {text('By continuing, you may receive camp updates and marketing emails related to this form.', '继续即表示您可能会收到与此表单相关的营地更新和营销邮件。')}
                </p>
              </label>

              <label>
                <span className="requiredFieldLabel">{text('Contact phone', '联系电话')} {contactPhoneMissing ? <span className="requiredDot" /> : null}</span>
                <input
                  id="reg-contact-phone"
                  className={contactPhoneMissing ? 'fieldIncomplete' : ''}
                  value={registration.contactPhone}
                  onChange={(event) => updateContact('contactPhone', event.target.value)}
                  required
                />
              </label>
              <label>
                <span className="requiredFieldLabel">
                  {text('How will you pay?', '您将如何付款？')} {paymentMethodMissing ? <span className="requiredDot" /> : null}
                </span>
                <select
                  id="reg-payment-method"
                  className={paymentMethodMissing ? 'fieldIncomplete' : ''}
                  value={registration.paymentMethod}
                  onChange={(event) => updateContact('paymentMethod', event.target.value)}
                  required
                >
                  <option value="">{text('Select payment method', '选择付款方式')}</option>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={`pay-method-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="full studentActionsRow">
                <div className="siblingAddCallout">
                  <strong>{text('Add sibling / additional camper', '添加兄弟姐妹 / 其他营员')}</strong>
                  <p>{text('Use this when the same family is enrolling another camper for the same selected location.', '当同一家庭要为同一地点再报名一位营员时，请使用此功能。')}</p>
                </div>
                <button
                  type="button"
                  className="button siblingAddButton"
                  onClick={addStudent}
                  disabled={registration.students.length >= MAX_CAMPERS}
                >
                  {text(`+ Add sibling camper (${registration.students.length}/${MAX_CAMPERS})`, `+ 添加兄弟姐妹营员（${registration.students.length}/${MAX_CAMPERS}）`)}
                </button>
              </div>

              {registration.students.map((student, index) => (
                <div key={student.id} className="full studentCollapsedRow">
                  <div className="studentCollapsedBar">
                    <button
                      type="button"
                      className="studentCollapsedHead"
                      onClick={() => {
                        setActiveStudentId(student.id)
                        setExpandedStudentId(expandedStudentId === student.id ? '' : student.id)
                      }}
                    >
                      <span>
                        <strong className="camperCardName">{student.fullName.trim() || `Camper ${index + 1}`}</strong>
                        <span className="camperCardMeta">{text(`Camper ${index + 1}`, `营员 ${index + 1}`)}</span>
                        <span className="studentDetailCta">
                          {text(`Click here to view details for ${student.fullName.trim() || `Camper ${index + 1}`}`, `点击查看 ${student.fullName.trim() || `营员 ${index + 1}`} 的详情`)}
                        </span>
                      </span>
                      {!isStudentComplete(student) ? <span className="requiredDot" /> : null}
                    </button>
                    {registration.students.length > 1 ? (
                      <button
                        type="button"
                        className="button secondary studentCollapsedRemoveBtn"
                        onClick={() => confirmAndRemoveStudent(student.id)}
                      >
                        {text('Remove camper', '移除此营员')}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              {expandedStudent ? (
                <div className="full studentBlock">
                  <div className="studentHeader">
                    <h3>
                      {expandedStudent.fullName || `Camper ${
                        registration.students.findIndex((student) => student.id === expandedStudent.id) + 1
                      }`}
                    </h3>
                    {registration.students.length > 1 ? (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => confirmAndRemoveStudent(expandedStudent.id)}
                      >
                        {text('Remove camper', '移除此营员')}
                      </button>
                    ) : null}
                  </div>
                  <div className="grid">
                    <label>
                      <span className="requiredFieldLabel">{text('Full name', '姓名')} {expandedStudentFullNameMissing ? <span className="requiredDot" /> : null}</span>
                      <input
                        id={`reg-student-fullname-${expandedStudent.id}`}
                        className={expandedStudentFullNameMissing ? 'fieldIncomplete' : ''}
                        value={expandedStudent.fullName}
                        onChange={(event) => updateStudentField(expandedStudent.id, 'fullName', event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      <span className="requiredFieldLabel">{text('Date of birth', '出生日期')} {expandedStudentDobMissing ? <span className="requiredDot" /> : null}</span>
                      <div className="dobInputRow">
                        <input
                          id={`reg-student-dob-${expandedStudent.id}`}
                          type="date"
                          className={expandedStudentDobMissing ? 'fieldIncomplete' : ''}
                          value={expandedStudent.dob}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(event) => updateStudentField(expandedStudent.id, 'dob', event.target.value)}
                          required
                        />
                        <select
                          aria-label={text('Birth year', '出生年份')}
                          className={expandedStudentDobMissing ? 'fieldIncomplete' : ''}
                          value={getDobYear(expandedStudent.dob)}
                          onChange={(event) => updateStudentField(expandedStudent.id, 'dob', setDobYear(expandedStudent.dob, event.target.value))}
                        >
                          <option value="">{text('Birth year', '出生年份')}</option>
                          {DOB_YEAR_OPTIONS.map((year) => (
                            <option key={`dob-year-${expandedStudent.id}-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">{text('Allergies', '过敏信息')} {expandedStudentAllergiesMissing ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-allergies-${expandedStudent.id}`}
                        className={expandedStudentAllergiesMissing ? 'fieldIncomplete' : ''}
                        rows="2"
                        value={expandedStudent.allergies}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'allergies', event.target.value)
                        }
                        placeholder={text('Food, medication, environmental, or none', '食物、药物、环境过敏，或填写无')}
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">{text('Medication', '用药情况')} {expandedStudentMedicationMissing ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-medication-${expandedStudent.id}`}
                        className={expandedStudentMedicationMissing ? 'fieldIncomplete' : ''}
                        rows="2"
                        value={expandedStudent.medication}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'medication', event.target.value)
                        }
                        placeholder={text('Current medications and timing instructions', '当前药物及服用时间说明')}
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">{text('Previous injuries', '既往受伤情况')} {expandedStudentInjuriesMissing ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-injuries-${expandedStudent.id}`}
                        className={expandedStudentInjuriesMissing ? 'fieldIncomplete' : ''}
                        rows="2"
                        value={expandedStudent.previousInjury}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'previousInjury', event.target.value)
                        }
                        placeholder={text('Any previous injuries or physical limitations', '任何既往受伤或身体限制情况')}
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">{text('Other important info', '其他重要信息')} {expandedStudentHealthNotesMissing ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-health-${expandedStudent.id}`}
                        className={expandedStudentHealthNotesMissing ? 'fieldIncomplete' : ''}
                        rows="2"
                        value={expandedStudent.healthNotes}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'healthNotes', event.target.value)
                        }
                        placeholder={text('Anything else our coaching team should know', '其他需要教练团队了解的信息')}
                        required
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <p className="subhead">{text('All camper fields are collapsed. Tap a camper chip to expand and edit.', '所有营员信息已折叠。点击营员标签即可展开并编辑。')}</p>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="full">
              <p className="requiredFieldHint">{step2HasMissing ? <span className="requiredDot" /> : null} {text('Select at least one camp day for each camper.', '请至少为每位营员选择一天课程。')}</p>
              <div className="summaryActionRow" style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <a className="button secondary" href="/overnight">
                  {text('Looking for Overnight Camp?', '想报名过夜营？')}
                </a>
              </div>
              {activeStudent && copySourceOptions.length > 0 ? (
                <div className="registrationStepTools">
                  <div className="copyWeeksPicker">
                    <span className="copyWeeksLabel">{text('Copy weeks from', '从以下营员复制周计划')}</span>
                    <div className="copyWeeksChipRow" aria-label="Copy weeks source camper">
                      {copySourceOptions.map((option) => (
                        <button
                          key={`copy-schedule-${option.id}`}
                          type="button"
                          className={`copyWeeksChip ${scheduleCopySourceId === option.id ? 'active' : ''}`}
                          onClick={() =>
                            setScheduleCopySourceId((current) => (current === option.id ? '' : option.id))
                          }
                          aria-pressed={scheduleCopySourceId === option.id}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button copyWeeksButton"
                    onClick={() => copyScheduleFromCamper(scheduleCopySourceId)}
                    disabled={!scheduleCopySourceId}
                  >
                    {text(`Copy to ${activeCamperLabel}`, `复制到 ${activeCamperLabel}`)}
                  </button>
                  <button type="button" className="button secondary" onClick={clearActiveStudentSchedule}>
                    {text('Clear all weeks', '清空所有周次')}
                  </button>
                </div>
              ) : null}
              {activeStudent ? (
                <div className="weekCardList">
                  {registrationWeeks.map((week, weekIndex) => {
                    const entry = activeStudent.schedule[week.id]
                    const weekSelectionSummary = getWeekSelectionSummary(entry, week)
                    const weekDayKeys = week.days.map((item) => item.key)
                    const weekIsFull = weekDayKeys.every((day) => (entry?.days?.[day] || 'NONE') === 'FULL')
                    const selectedCampType = entry?.campType || ''
                    const panelKey = `${activeStudent.id}:${week.id}`
                    const expanded = expandedWeekKey === panelKey

                    return (
                      <article key={week.id} className="weekCard">
                        <button
                          type="button"
                          className={`weekHead ${expanded ? 'selected' : ''}`}
                          data-week-head={panelKey}
                          onClick={() => setExpandedWeekKey(expanded ? '' : panelKey)}
                        >
                          <span className="weekHeadText">
                            <strong>
                              Week {weekIndex + 1}: {week.programLabel}
                            </strong>
                            <span>{formatWeekLabel(week)}</span>
                            <em>
                              {expanded ? 'Tap to close this week for ' : 'Open this week to choose camp type and days for '}
                              <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>
                            </em>
                            {weekSelectionSummary ? (
                              <span className="weekStatusChip">{weekSelectionSummary}</span>
                            ) : null}
                          </span>
                          <span className="weekHeadTapCta" aria-hidden="true">
                            <span className="weekHeadTapIcon">☝</span>
                            <span>{text(expanded ? 'Tap to collapse' : 'Tap to register', expanded ? '点按收起' : '点按报名')}</span>
                          </span>
                        </button>
                        {expanded ? (
                          <div className="weekBody">
                            <div className="toggleHintBox">
                              <p className="toggleHint">
                                <strong>{text('For this week, choose camp type first.', '这一周请先选择营种。')}</strong>
                              </p>
                              <p className="toggleHintSubline">
                                {text('Then tap each day to choose: Full Day -> AM -> PM -> Off.', '然后点击每天来选择：全天 -> 上午 -> 下午 -> 关闭。')}
                              </p>
                            </div>
                            <>
                              <div className="campTypeRow">
                                {week.availableCampTypes?.includes('general') ? (
                                  <button
                                    type="button"
                                    className={`campTypeChip general ${
                                      selectedCampType === 'general' ? 'selected' : ''
                                    }`}
                                    onClick={() => setDayCampType(activeStudent.id, week, 'general')}
                                  >
                                    {text('General Camp', '普通夏令营')}
                                  </button>
                                ) : null}
                                {week.availableCampTypes?.includes('bootcamp') ? (
                                  <button
                                    type="button"
                                    className={`campTypeChip bootcamp ${
                                      selectedCampType === 'bootcamp' ? 'selected' : ''
                                    }`}
                                    onClick={() => setDayCampType(activeStudent.id, week, 'bootcamp')}
                                  >
                                    {text('Competition Boot Camp', '竞赛强化营')}
                                  </button>
                                ) : null}
                              </div>
                              <p className="campTypeExplain">
                                {selectedCampType === 'general'
                                  ? text('General Camp selected. Now choose the days below.', '已选择普通夏令营。现在请在下方选择日期。')
                                  : selectedCampType === 'bootcamp'
                                    ? text('Competition Boot Camp selected. Now choose the days below.', '已选择竞赛强化营。现在请在下方选择日期。')
                                    : text('Select a camp type above to unlock this week’s day choices.', '请先在上方选择营种，再为这一周选择日期。')}
                              </p>
                              <button
                                type="button"
                                className={`modeChip ${weekIsFull ? 'active full' : ''}`}
                                onClick={() => toggleFullWeek(activeStudent.id, week)}
                              >
                                {text('Choose Full Week (all days = Full Day)', '选择整周（所有日期 = 全天）')}
                              </button>
                              <div className="chipRow">
                                {dayKeys.map((day) => {
                                  const mode = entry?.days?.[day] || 'NONE'
                                  return (
                                    <button
                                      key={`${week.id}-${day}`}
                                      type="button"
                                      className={`modeChip ${mode !== 'NONE' ? `active ${mode.toLowerCase()}` : ''}`}
                                      onClick={() => cycleDay(activeStudent.id, week, day)}
                                      disabled={!selectedCampType}
                                    >
                                      {mode === 'NONE' ? day : `${day} ${mode === 'FULL' ? text('FULL DAY', '全天') : mode}`}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="full">
              <p className="requiredFieldHint">{step3HasMissing ? <span className="requiredDot" /> : null} {text('Each camper must choose paid lunch days or confirm no paid lunch when applicable.', '每位营员都需要选择付费午餐日期，或在适用时确认不需要付费午餐。')}</p>
              <p className="subhead">
                {text(
                  `Lunch is ${currency(adminConfig.tuition.lunchPrice)} per day for General/Boot camp days. We send the menu at the start of each week. Options include box juice or bottled water. New this year, families can also manage lunch booking and see progress photos/videos in the Level Up app.`,
                  `普通营/强化营的午餐价格为每天 ${currency(adminConfig.tuition.lunchPrice)}。我们会在每周开始时发送菜单，选项包含盒装果汁或瓶装水。今年新增：家庭还可在 Level Up 应用中管理午餐预订并查看成长照片/视频。`
                )}
              </p>
              <div className="pointsGlowBox compact">
                <span className="pointsGlowBadge">Points by enrollment</span>
                <strong>{dayCampPointsBreakdown}</strong>
                <p>{dayCampPointsUseCopy}</p>
              </div>
              <p className="subhead">
                {text('Weekly reminders: Wednesday bring a change of clothes. Thursday BBQ lunch is included in tuition (packing lunch is optional). Friday is family performance day.', '每周提醒：周三请带备用衣物。周四烧烤午餐已包含在学费内（也可自带午餐）。周五为家庭展示日。')}
              </p>
              <p className="subhead">
                {text('Looking for overnight camp?', '想了解过夜营？')} <a href="/overnight">{text('Open overnight page.', '打开过夜营页面。')}</a>
              </p>
              {activeStudent && copySourceOptions.length > 0 ? (
                <div className="registrationStepTools">
                  <label>
                    {text('Copy another camper lunch', '复制另一位营员的午餐选择')}
                    <select
                      value={lunchCopySourceId}
                      onChange={(event) => setLunchCopySourceId(event.target.value)}
                    >
                      <option value="">{text('Select camper', '选择营员')}</option>
                      {copySourceOptions.map((option) => (
                        <option key={`copy-lunch-${option.id}`} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => copyLunchFromCamper(lunchCopySourceId)}
                    disabled={!lunchCopySourceId}
                  >
                    {text('Copy lunch', '复制午餐')}
                  </button>
                  <button type="button" className="button secondary" onClick={clearActiveStudentLunch}>
                    {text('Clear all lunch', '清空所有午餐')}
                  </button>
                </div>
              ) : null}

              {activeStudent ? (
                <div className="weekCardList">
                  {getLunchWeeksForStudent(activeStudent, weeksById).length === 0 ? (
                    <p className="subhead">{text('No registered camp days yet for this camper.', '这位营员尚未选择任何上课日期。')}</p>
                  ) : (
                    getLunchWeeksForStudent(activeStudent, weeksById).map((row, weekIndex) => {
                      const panelKey = `${activeStudent.id}:${row.weekId}`
                      const expanded = expandedLunchWeekKey === panelKey
                      const weekIncludedLunchDays = row.selectedDays.filter((day) => isIncludedLunchDay(day.dayKey)).length
                      const weekPaidLunchDays = row.selectedDays.filter(
                        (day) => !isIncludedLunchDay(day.dayKey) && Boolean(activeStudent.lunch[day.key])
                      ).length
                      const weekRegisteredDays = row.selectedDays.length
                      const weekProvidedLunchDays = weekIncludedLunchDays + weekPaidLunchDays
                      const weekPackDays = Math.max(0, weekRegisteredDays - weekProvidedLunchDays)
                      return (
                        <article key={row.weekId} className="weekCard">
                          <button
                            type="button"
                            className={`weekHead ${expanded ? 'selected' : ''}`}
                            onClick={() => setExpandedLunchWeekKey(expanded ? '' : panelKey)}
                          >
                            <span className="weekHeadText">
                              <strong>
                                Week {weekIndex + 1}: {row.week.programLabel}
                              </strong>
                              <span>{formatWeekLabel(row.week)}</span>
                              <em>
                                {text('Click to expand lunch choices for', '点击展开以下营员的午餐选择：')}{' '}
                                <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>
                              </em>
                              <span className="weekLunchSummaryLine">
                                {text(`Lunch provided ${weekProvidedLunchDays}/${weekRegisteredDays} days (paid ${weekPaidLunchDays}, Thu included ${weekIncludedLunchDays}) · Pack lunch needed ${weekPackDays} days`, `已提供午餐 ${weekProvidedLunchDays}/${weekRegisteredDays} 天（付费 ${weekPaidLunchDays} 天，周四含餐 ${weekIncludedLunchDays} 天）· 需自带午餐 ${weekPackDays} 天`)}
                              </span>
                            </span>
                          </button>
                          {expanded ? (
                            <div className="weekBody">
                              <em className="toggleHint">
                                {text('Tap each chip to toggle lunch for', '点击每个标签切换以下营员的午餐选择：')}{' '}
                                <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>.
                              </em>
                              <div className="chipRow">
                                {row.selectedDays.map((day) => {
                                  const isIncluded = isIncludedLunchDay(day.dayKey)
                                  const hasLunch = Boolean(activeStudent.lunch[day.key])
                                  return (
                                    <button
                                      key={day.key}
                                      type="button"
                                      className={`modeChip lunchChip ${isIncluded ? 'full' : hasLunch ? 'yes' : 'no'}`}
                                      onClick={() => toggleLunch(activeStudent.id, row.weekId, day.dayKey)}
                                    >
                                      {isIncluded
                                        ? `${day.dayKey} ${text('BBQ INCLUDED', '烧烤已含')}`
                                        : `${day.dayKey} ${text(`Lunch ${hasLunch ? 'YES' : 'NO'}`, hasLunch ? '午餐：是' : '午餐：否')}`}
                                    </button>
                                  )
                                })}
                              </div>
                              <p className="subhead">
                                {text('Wed: bring change of clothes · Thu: BBQ lunch included (pack optional) · Fri: family performance day', '周三：请带备用衣物 · 周四：烧烤午餐已含（也可自带） · 周五：家庭展示日')}
                              </p>
                            </div>
                          ) : null}
                        </article>
                      )
                    })
                  )}
                </div>
              ) : null}
              {activeStudent ? (
                <div className="lunchDecisionCard" data-lunch-decision={activeStudent.id}>
                  {(() => {
                    const hasAnyPaidLunch = Object.entries(activeStudent.lunch || {}).some(
                      ([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)
                    )
                    const selectableLunchDays = getSelectableLunchDayKeysForStudent(activeStudent).size
                    const needsDecision = selectableLunchDays > 0
                    return (
                      <>
                  <div className="lunchDecisionHeader">
                    <strong className="requiredFieldLabel">
                      Lunch decision {needsDecision && !hasAnyPaidLunch && !activeStudent.lunchConfirmedNone ? <span className="requiredDot" /> : null}
                    </strong>
                    {needsDecision && !hasAnyPaidLunch && !activeStudent.lunchConfirmedNone ? (
                      <span className="lunchRequiredTag">
                        <span className="requiredDot" />
                        Required
                      </span>
                    ) : null}
                  </div>
                  <p className="subhead">
                    {!needsDecision
                      ? 'Only Thursday camp days selected for this camper. BBQ lunch is already included, so no paid lunch selection is needed.'
                      : hasAnyPaidLunch
                        ? `Paid lunch selected for ${Object.entries(activeStudent.lunch || {}).filter(([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)).length} day(s).`
                        : 'No paid lunch days selected yet. Confirm no paid lunch if this camper does not need paid lunch.'}
                  </p>
                  <label className="lunchConfirmNoneRow">
                    <input
                      type="checkbox"
                      checked={Boolean(activeStudent.lunchConfirmedNone)}
                      onChange={(event) => setLunchConfirmedNone(activeStudent.id, event.target.checked)}
                      disabled={hasAnyPaidLunch || !needsDecision}
                    />
                    Confirm no paid lunch for this camper
                  </label>
                      </>
                    )
                  })()}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="full">
              {registrationIsSubmitted ? (
                <div className="registrationSubmittedCard">
                  <strong>Registration submitted.</strong>
                  <p>Your registration was submitted successfully for <strong>{selectedLocationLabel}</strong>. Review the summary below.</p>
                </div>
              ) : null}
              {registrationEmailResult ? (
                <div
                  className={`registrationEmailStatus registrationEmailStatus--${registrationEmailResult.status}`}
                >
                  <strong>
                    {registrationEmailResult.status === 'sent'
                      ? 'Step 1 email sent'
                      : registrationEmailResult.status === 'sent-no-pdf'
                        ? 'Step 1 email sent without PDF'
                        : registrationEmailResult.status === 'preview'
                          ? 'Email preview only'
                          : registrationEmailResult.status === 'queued'
                            ? 'Reminder flow queued'
                            : 'Email send needs attention'}
                  </strong>
                  <p>
                    {registrationEmailResult.status === 'preview'
                      ? `${registrationEmailResult.detail} Set AWS_REGION and AWS_SES_FROM_EMAIL in this app environment to send live emails.`
                      : registrationEmailResult.status === 'failed'
                        ? `${registrationEmailResult.detail} You can still use Send Due Journey Emails Now from admin after email delivery is configured.`
                        : registrationEmailResult.detail}
                  </p>
                </div>
              ) : null}
              <p className="subhead">Location selected: <strong>{selectedLocationLabel}</strong></p>
              {adminConfig.tuition.discountEndDate ? (
                <p className="subhead">
                  Discount pricing applies through {discountEndDateSpokenLabel.en}.{' '}
                  {discountActive ? 'Discount is currently active.' : 'Discount has ended; regular pricing applies.'}
                </p>
              ) : null}
              {discountActive && !registrationIsSubmitted ? (
                <div className={`stepFourDiscountClaim ${registrationDiscountClaimed ? 'claimed' : ''}`}>
                  <div>
                    <strong>Claim discount</strong>
                    <p>
                      You've earned {currency(claimableDiscountTotal)} in discount. Claim before{' '}
                      {discountEndDateSpokenLabel.en}.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button stepFourClaimBtn"
                    onClick={() => setRegistrationDiscountClaimed(true)}
                    disabled={registrationDiscountClaimed}
                  >
                    {registrationDiscountClaimed
                      ? `Discount Claimed (${currency(claimableDiscountTotal)})`
                      : `Claim ${currency(claimableDiscountTotal)} Discount`}
                  </button>
                </div>
              ) : null}
              {summaries.map(({ student, summary }) => {
                const studentIndex = registration.students.findIndex((item) => item.id === student.id)
                const invoice = buildStudentPriceRows(summary, studentIndex, {
                  applyLimitedDiscount: discountActive && registrationDiscountClaimed,
                })
                return (
                  <article
                    key={student.id}
                    className={`reviewPriceCard ${discountActive && registrationDiscountClaimed ? 'claimedDiscount' : ''}`}
                  >
                    <h3>{student.fullName || 'Unnamed camper'}</h3>
                    <table className="priceTable">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.rows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.label}</td>
                            <td>{row.qty}</td>
                            <td>{currency(row.effectivePrice)}</td>
                            <td>{row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
                            <td>{currency(row.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {invoice.limitedDiscountAmount > 0 && discountActive && registrationDiscountClaimed ? (
                      <>
                        <p className="totalLine subtotalLine crossed">Subtotal: {currency(invoice.subtotalRegular)}</p>
                        <p className="totalLine promoApplyLine">
                          Total discount: -{currency(invoice.limitedDiscountAmount)}
                        </p>
                        <p className="totalLine">New subtotal: {currency(invoice.subtotal)}</p>
                      </>
                    ) : (
                      <p className="totalLine">Subtotal: {currency(invoice.subtotalRegular)}</p>
                    )}
                    {invoice.siblingDiscountAmount > 0 ? (
                      <p className="totalLine discountLine">
                        Sibling discount ({invoice.siblingDiscountPct}%){' '}
                        {invoice.siblingAppliedBeforeLimitedDiscount
                          ? '(applied before camp discount)'
                          : '(applied after camp discount)'}
                        : -{currency(invoice.siblingDiscountAmount)}
                      </p>
                    ) : null}
                    <p className="totalLine">{student.fullName || 'Camper'} total: {currency(invoice.total)}</p>
                  </article>
                )
              })}
              <p className="totalLine grand">
                Grand total:{' '}
                {currency(
                  summaries.reduce((sum, item) => {
                    const studentIndex = registration.students.findIndex((student) => student.id === item.student.id)
                    return sum + buildStudentPriceRows(item.summary, studentIndex, {
                      applyLimitedDiscount: discountActive && registrationDiscountClaimed,
                    }).total
                  }, 0)
                )}
              </p>
              <div className="summaryActionRow">
                <div className="pointsGlowBox compact inlineSummaryPoints">
                  <span className="pointsGlowBadge">Rewards at a glance</span>
                  <strong>
                    {summaries.reduce((sum, item) => {
                      return sum + getDayCampPointsFromSummary(item.summary)
                    }, 0).toLocaleString('en-US')} New England Wushu Level Up points currently selected
                  </strong>
                  <p>{dayCampPointsBreakdown} {dayCampPointsUseCopy}</p>
                </div>
                <a
                  className="button"
                  href={buildPaymentPageLinkForRegistration(registrationIsSubmitted ? submittedRegistrationSnapshot || registration : registration)}
                >
                  Open Payment Options
                </a>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => openSummaryOverlay(registrationIsSubmitted ? submittedRegistrationSnapshot || registration : registration)}
                >
                  Open Summary PDF
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={summaryEmailSending || summaryEmailLocked}
                  onClick={() => emailSummaryToSelf(registrationIsSubmitted ? submittedRegistrationSnapshot || registration : registration)}
                >
                  {summaryEmailSending
                    ? 'Sending Summary...'
                    : summaryEmailLocked
                      ? 'Summary Email Sent'
                      : 'Email Summary to Myself'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="actions">
            {registrationIsSubmitted && step === registrationSteps.length ? (
              <>
                <button type="button" className="button secondary" onClick={jumpToCampTop}>
                  Go to Summer Day Camp Page
                </button>
                <button type="button" className="button secondary" onClick={clearRegistrationForm}>
                  Start New Registration
                </button>
              </>
            ) : step > 1 ? (
              <button type="button" className="button secondary" onClick={previousStep}>
                Back
              </button>
            ) : (
              <span />
            )}
            {!registrationIsSubmitted || step !== registrationSteps.length ? (
              step < registrationSteps.length ? (
              <button type="button" className="button" onClick={nextStep}>
                Continue
              </button>
              ) : (
              <div className="submitActionGroup">
                {discountActive && !registrationDiscountClaimed ? (
                  <div className="submitDiscountNudge">
                    <span>Don't forget to claim discount before submitting.</span>
                    <button
                      type="button"
                      className="button secondary submitDiscountClaimBtn"
                      onClick={() => setRegistrationDiscountClaimed(true)}
                    >
                      Claim {currency(claimableDiscountTotal)}
                    </button>
                  </div>
                ) : null}
                <button className="button" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit registration'}
                </button>
              </div>
              )
            ) : null}
          </div>
          <p className="reservationHoldNotice reservationHoldNoticeInline">
            Payment not received within 72 hours will cancel this reservation.
          </p>
          </article>
        </form>

        {message ? <p className="message">{message}</p> : null}
      </section>
      ) : null}

      {showRegistrationSections ? (
      <section className="card section" id="contact-us">
        <h2>Contact Us</h2>
        <p className="subhead">
          Questions before registering? Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <div className="contactGrid">
          <form className="contactForm" onSubmit={submitContact}>
            <label>
              Name
              <input
                value={contactForm.name}
                onChange={(event) => updateContactForm('name', event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={contactForm.email}
                onChange={(event) => updateContactForm('email', event.target.value)}
                required
              />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                value={contactForm.message}
                onChange={(event) => updateContactForm('message', event.target.value)}
                required
              />
            </label>
            <button type="submit" className="button">
              Send Message
            </button>
            {contactMessage ? <p className="message">{contactMessage}</p> : null}
          </form>
          <aside className="contactQrCard">
            <h3>WeChat Contact</h3>
            {adminConfig.media.wechatQrUrl ? (
              <img src={adminConfig.media.wechatQrUrl} alt="WeChat QR code" />
            ) : (
              <p className="subhead">Add a WeChat QR in /admin Media.</p>
            )}
          </aside>
        </div>
      </section>
      ) : null}

      {showRegistrationSections ? (
      <section className="card section" id="overnight-registration">
        <h2>Overnight Camp Registration</h2>
        <p className="subhead">
          Overnight Camp offers a weekly rate of $1180, or $980 through May 20. The second week receives an additional $100 off. Tuition covers 7 days of meals, 7 days of academy training, and 7 days of lodging. Outings and the Friday family & friends BBQ are billed separately.
        </p>
        <div className="campTypeFitBox">
          <strong>Enrollment Summary</strong>
          <p>
            Requested format:{' '}
            <strong>{overnightRequestOption === 'fullDay' ? 'Overnight Full Day' : 'Overnight Full Week'}</strong>
          </p>
          <p>
            Requested weeks: <strong>{overnightRequestedWeeks}</strong> · Available overnight weeks:{' '}
            <strong>{overnightWeeks.length}</strong>
          </p>
          {overnightSelectedWeeks.length > 0 ? (
            <p>
              Selected weeks:{' '}
              <strong>{overnightSelectedWeeks.map((week) => formatWeekLabel(week)).join(' · ')}</strong>
            </p>
          ) : null}
          {overnightWindowLabel ? (
            <p>
              Camp window: <strong>{overnightWindowLabel}</strong>
            </p>
          ) : null}
          <p>
            Current pricing: Full Week <strong>{currency(overnightFullWeekCurrentPrice)}</strong> · Full Day{' '}
            <strong>{currency(overnightFullDayCurrentPrice)}</strong>
          </p>
          <p>
            Meals and lodging are included. Sunday drop-off starts at 1:00 PM and Saturday pickup is at 4:00 PM at the camp house
            (address TBA). Outings and external activity costs are charged separately.
          </p>
          <p>
            Capacity: <strong>12 campers max per overnight week.</strong>
          </p>
        </div>
        <div className="campTypeFitBox">
          <strong>Overnight Lodging Highlights</strong>
          <ul className="campTypeHighlightList" style={{ marginTop: '0.5rem' }}>
            <li>2 full bathrooms and gender-divided lodging setup.</li>
            <li>Air hockey, ping pong, VR, golf simulator, and double-hoop basketball arcade game.</li>
            <li>Ample indoor space for supervised evening activities.</li>
            <li>Huge yard with fenced enclosure for safer outdoor play.</li>
          </ul>
        </div>
        {discountActive ? (
          <p className="campTypeDiscountNote">
            Overnight early offer: <strong>$200 off week 1, plus an extra $100 off week 2</strong> through {discountEndDateSpokenLabel.en}.
          </p>
        ) : null}
        <div className="scheduleList overnightScheduleList">
          {overnightSchedule.map((item) => (
            <article key={`overnight-${item.day}`} className="scheduleItem">
              <strong><span className="scheduleDayTag">{item.day}</span></strong>
              <div className="scheduleThemeGrid">
                <div className="scheduleThemeBlock">
                  <p className="scheduleThemeLabel">AM Theme</p>
                  <p className="scheduleThemeTitle">{item.amTheme}</p>
                </div>
                <div className="scheduleThemeBlock">
                  <p className="scheduleThemeLabel">PM Theme</p>
                  <p className="scheduleThemeTitle">{item.pmTheme}</p>
                </div>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <div className="tuitionTableWrap">
          <table className="priceTable">
            <thead>
              <tr>
                <th>Option</th>
                <th>Regular Price</th>
                <th>Discounted Price</th>
                <th>Discount</th>
                <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              {overnightPricingRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{currency(row.regular)}</td>
                  <td>{currency(row.discounted > 0 ? row.discounted : row.regular)}</td>
                  <td>{row.discountAmount > 0 ? `-${currency(row.discountAmount)}` : '-'}</td>
                  <td>{currency(row.effective)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overnightOptionChips" role="group" aria-label="Overnight option">
          <button
            type="button"
            className={`modeChip ${overnightRequestOption === 'fullWeek' ? 'active full' : ''}`}
            onClick={() => setOvernightRequestOption('fullWeek')}
          >
            Overnight Full Week
          </button>
          <button
            type="button"
            className={`modeChip ${overnightRequestOption === 'fullDay' ? 'active full' : ''}`}
            onClick={() => setOvernightRequestOption('fullDay')}
          >
            Overnight Full Day
          </button>
        </div>
        <div className="overnightWeeksRow">
          <strong>Select one or more overnight weeks</strong>
          <div className="overnightWeekCheckboxes">
            {overnightWeeks.length === 0 ? (
              <p className="subhead">No overnight weeks available yet in admin.</p>
            ) : (
              overnightWeeks.map((week) => (
                <label key={`overnight-week-select-${week.id}`} className="overnightWeekCheckbox">
                  <input
                    type="checkbox"
                    checked={overnightSelectedWeekIds.includes(week.id)}
                    onChange={() => toggleOvernightWeekSelection(week.id)}
                  />
                  <span>{formatWeekLabel(week)}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="grid" style={{ marginTop: '0.8rem' }}>
          <label>
            <span className="requiredFieldLabel">
              Parent/Guardian name {!overnightParentName.trim() ? <span className="requiredDot" /> : null}
            </span>
            <input
              value={overnightParentName}
              onChange={(event) => setOvernightParentName(event.target.value)}
              placeholder="Parent/guardian full name"
              required
            />
          </label>
          <label>
            <span className="requiredFieldLabel">
              Contact email {!/\S+@\S+\.\S+/.test(overnightContactEmail || '') ? <span className="requiredDot" /> : null}
            </span>
            <input
              type="email"
              value={overnightContactEmail}
              onChange={(event) => setOvernightContactEmail(event.target.value)}
              placeholder="parent@email.com"
              required
            />
          </label>
          <label>
            <span className="requiredFieldLabel">
              Contact phone {overnightContactPhone.trim().length < 7 ? <span className="requiredDot" /> : null}
            </span>
            <input
              value={overnightContactPhone}
              onChange={(event) => setOvernightContactPhone(event.target.value)}
              placeholder="(555) 555-5555"
              required
            />
          </label>
          <label>
            <span className="requiredFieldLabel">
              How will you pay? {!overnightPaymentMethod.trim() ? <span className="requiredDot" /> : null}
            </span>
            <select
              value={overnightPaymentMethod}
              onChange={(event) => setOvernightPaymentMethod(event.target.value)}
              required
            >
              <option value="">Select payment method</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={`overnight-pay-method-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {overnightEnrollmentStep === 1 ? (
          <>
          <div className="actions">
            <span />
            <button
              type="button"
              className="button"
              onClick={nextOvernightEnrollmentStep}
            >
              Next: Activity Survey
            </button>
          </div>
          <p className="reservationHoldNotice reservationHoldNoticeInline">
            Payment not received within 72 hours will cancel this reservation.
          </p>
          </>
        ) : null}

        {overnightEnrollmentStep === 2 ? (
          <article className="campTypeShowcaseCard" style={{ marginTop: '0.8rem' }}>
            <div className="campTypeContentPanel">
              <h3>Step 2: Activity Interest Survey (Overnight)</h3>
              <p className="subhead">
                Pick activities your camper enjoys. Choose as many as you want.
              </p>
              <div className="overnightActivityGrid">
                {overnightActivityOptions.map((option) => (
                  <button
                    key={`overnight-activity-${option}`}
                    type="button"
                    className={`chipButton ${overnightActivitySelections.includes(option) ? 'selected' : ''}`}
                    onClick={() => toggleOvernightActivity(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <label style={{ marginTop: '0.75rem' }}>
                Other activities or requests
                <textarea
                  rows="4"
                  value={overnightActivityCustom}
                  onChange={(event) => setOvernightActivityCustom(event.target.value)}
                  placeholder="Tell us any additional overnight interests, routines, or requests..."
                />
              </label>
              <div className="actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setOvernightEnrollmentStep(1)}
                >
                  Back
                </button>
                <button type="button" className="button" onClick={submitOvernightEnrollmentRequest} disabled={overnightSubmitting}>
                  {overnightSubmitting ? 'Submitting...' : 'Submit Overnight Enrollment Request'}
                </button>
              </div>
              <p className="reservationHoldNotice reservationHoldNoticeInline">
                Payment not received within 72 hours will cancel this reservation.
              </p>
            </div>
          </article>
        ) : null}
        {overnightMessage ? <p className="message">{overnightMessage}</p> : null}
      </section>
      ) : null}

      {showRegistrationSections && summaryOverlayOpen ? (
        <div className="summaryOverlayBackdrop" role="dialog" aria-modal="true" aria-label="Registration summary PDF view">
          <div className="summaryOverlayPanel">
            <div className="summaryOverlayBar">
              <strong>Registration Summary</strong>
              <div className="summaryOverlayActions">
                <button type="button" className="button secondary" onClick={printSummaryOverlay}>
                  Print / Save PDF
                </button>
                <button type="button" className="button secondary" onClick={() => setSummaryOverlayOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <iframe ref={summaryIframeRef} title="Registration summary preview" src={summaryOverlayHtml} />
          </div>
        </div>
      ) : null}

      {showRegistrationSections && locationAlbumOpen && activeLocationAlbumPhoto ? (
        <div
          className="locationAlbumOverlay"
          role="dialog"
          aria-modal="true"
          aria-label={locationAlbumTitle}
          onClick={() => setLocationAlbumOpen(false)}
        >
          <div className="locationAlbumPanel" onClick={(event) => event.stopPropagation()}>
            <div className="locationAlbumTop">
              <div>
                <strong>{locationAlbumTitle}</strong>
                <p>{locationAlbumIndex + 1} of {locationFacilityPhotos.length}</p>
              </div>
              <button type="button" className="button secondary" onClick={() => setLocationAlbumOpen(false)}>
                Close
              </button>
            </div>
            <div className="locationAlbumStage">
              <button
                type="button"
                className="locationAlbumNav"
                onClick={() =>
                  setLocationAlbumIndex((current) =>
                    current === 0 ? locationFacilityPhotos.length - 1 : current - 1
                  )
                }
                aria-label="Previous facility photo"
              >
                ‹
              </button>
              <img
                src={activeLocationAlbumPhoto}
                alt={`${selectedLocationLabel} facility photo ${locationAlbumIndex + 1}`}
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                className="locationAlbumNav"
                onClick={() =>
                  setLocationAlbumIndex((current) =>
                    current === locationFacilityPhotos.length - 1 ? 0 : current + 1
                  )
                }
                aria-label="Next facility photo"
              >
                ›
              </button>
            </div>
            <div className="locationAlbumThumbs">
              {locationFacilityPhotos.map((url, index) => (
                <button
                  key={`location-album-thumb-${registration.location}-${index}`}
                  type="button"
                  className={`locationAlbumThumb ${index === locationAlbumIndex ? 'active' : ''}`}
                  onClick={() => setLocationAlbumIndex(index)}
                >
                  <img src={url} alt={`${selectedLocationLabel} facility thumbnail ${index + 1}`} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showLandingOnlySections ? (
      <nav className="mobileSectionNav" aria-label="Section navigation">
        <a href="#camp-info">{text('Top', '顶部')}</a>
        <a href="#why-camp">{text('Highlights', '亮点')}</a>
        <a href="#student-stories">{text('Stories', '口碑')}</a>
        <a href="#weekly-structure">{text('Sample Week', '示例周安排')}</a>
        <button type="button" onClick={jumpToRegistration}>
          {text('Claim Offer & Register', '领取优惠并报名')}
        </button>
      </nav>
      ) : null}

      {!isRegistrationRoute ? (
      <>
        <div className="learnAssistDock" aria-label="Camp fit assistant shortcut">
          <div className="learnAssistHead">
            <span>{text('Not sure yet?', '还在犹豫？')}</span>
            {!isMobileViewport ? (
              <button
                type="button"
                className="assistCollapseBtn"
                onClick={() => {
                  if (desktopAssistantVisible) {
                    setAssistantCollapsed(true)
                  } else if (currentMode === 'learn' && assistantCollapsed) {
                    setAssistantCollapsed(false)
                  } else {
                    chooseLearnPath()
                  }
                }}
                aria-label={
                  desktopAssistantVisible
                    ? text('Hide assistant', '隐藏助手')
                    : text('Show assistant', '显示助手')
                }
                title={
                  desktopAssistantVisible
                    ? text('Hide assistant', '隐藏助手')
                    : text('Show assistant', '显示助手')
                }
              >
                {desktopAssistantVisible
                  ? text('Hide', '隐藏')
                  : text('Show Assistant', '显示助手')}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="learnAssistLink"
            onClick={() => {
              if (currentMode === 'learn' && assistantCollapsed && !isMobileViewport) {
                setAssistantCollapsed(false)
                return
              }
              chooseLearnPath()
            }}
          >
            {text('Use Camp Fit Assistant to find your best-fit program', '使用营地匹配助手找到最适合的课程')}
          </button>
        </div>
      </>
      ) : null}
      </>
      ) : null}
      {discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && isMobileViewport && isDiscountCollapsed ? (
        <button
          type="button"
          className="discountCollapsedRemnant"
          aria-label={text('Show discount', '展开优惠')}
          onClick={() => setIsDiscountCollapsed(false)}
        >
          ⌃
        </button>
      ) : null}
      {discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && (!isMobileViewport || !isDiscountCollapsed) ? (
        <div
          className={`discountCountdownDock ${isMobileViewport ? 'mobileStrip' : ''} ${
            showRegistrationSections && isMobileViewport ? 'registrationOffset' : ''
          }`}
          aria-label="Discount countdown"
        >
          <div className="discountCountdownMeta single">
            <p className="discountAmountHero">
              {discountAmountLabel}
              <span>{text('per week', '每周')}</span>
            </p>
            <div className="discountCountdownBoxes" aria-label="Countdown timer">
              <div className="discountTimeBox">
                <span className="discountTimeValue" suppressHydrationWarning>{discountCountdown.days}</span>
                <span className="discountTimeLabel">{isMobileViewport ? 'D' : text('Days', '天')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue" suppressHydrationWarning>{String(discountCountdown.hours).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{isMobileViewport ? 'H' : text('Hours', '时')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue" suppressHydrationWarning>{String(discountCountdown.minutes).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{isMobileViewport ? 'M' : text('Minutes', '分')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue" suppressHydrationWarning>{String(discountCountdown.seconds).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{isMobileViewport ? 'S' : text('Seconds', '秒')}</span>
              </div>
            </div>
            {!isMobileViewport ? (
              <>
                <span>{text('Ends on', '截止日期')} {discountCountdown.endLabel}</span>
                {adminConfig.tuition.discountCode ? (
                  <p className="discountCodeLine">
                    {text('Code', '优惠码')}: <code>{adminConfig.tuition.discountCode}</code>
                  </p>
                ) : null}
                <button type="button" className="button discountClaimBtn" onClick={jumpToRegistration}>
                  {text('Claim Discount', '立即报名')}
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      {showRegistrationSections && isMobileViewport ? (
        <nav className="mobileRegistrationStepBar" aria-label="Registration steps">
          <div className="mobileRegistrationFlowRibbon">Registering for Day Camp</div>
          {registrationSteps.map((item) => {
            const isComplete = isRegistrationStepComplete(item.id)
            const isMissing = !isComplete
            const isActive = step === item.id
            return (
              <button
                key={`mobile-reg-step-${item.id}`}
                type="button"
                className={`mobileRegistrationStepBtn ${isActive ? 'active' : ''} ${
                  item.id < step && isComplete ? 'done' : ''
                } ${item.id < step && isMissing ? 'incomplete' : ''}`}
                onClick={() => {
                  setStepDirection(item.id > step ? 'next' : 'prev')
                  setStep(item.id)
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="mobileRegistrationStepNumber">{item.id}</span>
                <span className="mobileRegistrationStepLabel">{item.title}</span>
                {isMissing ? <span className="mobileRegistrationStepDot" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </nav>
      ) : null}
      {(!isMobileLearnOverlayOpen || keepFloatingUiVisible) ? (
      <div className="langToggleDock" aria-label="Language toggle">
        <button
          type="button"
          className={`langToggleBtn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          🇺🇸 EN
        </button>
        <span>/</span>
        <button
          type="button"
          className={`langToggleBtn ${language === 'zh' ? 'active' : ''}`}
          onClick={() => setLanguage('zh')}
        >
          🇨🇳 中文
        </button>
      </div>
      ) : null}
    </main>
  )
}
