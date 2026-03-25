import {
  buildProgramWeekOptions,
  defaultAdminConfig,
  getSelectedWeeks,
  mergeAdminConfig,
} from './campAdmin'
import { supabase, supabaseEnabled } from './supabase'

const programKeys = ['general', 'bootcamp', 'overnight']

function normalizeDateKey(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }
  const sliced = raw.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) {
    return sliced
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toISOString().slice(0, 10)
}

export async function fetchAdminConfigFromSupabase() {
  if (!supabaseEnabled || !supabase) {
    return {
      data: defaultAdminConfig,
      error: new Error('Supabase is not configured.'),
    }
  }

  const [settingsResponse, windowsResponse, weeksResponse] = await Promise.all([
    supabase.from('camp_admin_settings').select('*').eq('id', true).maybeSingle(),
    supabase.from('camp_program_windows').select('program_key, start_date, end_date'),
    supabase.from('camp_program_selected_weeks').select('program_key, week_start, week_end'),
  ])

  const firstError = settingsResponse.error || windowsResponse.error || weeksResponse.error
  if (firstError) {
    return {
      data: defaultAdminConfig,
      error: firstError,
    }
  }

  const raw = {
    media: {
      heroImageUrl: settingsResponse.data?.hero_image_url || '',
      welcomeLogoUrl: settingsResponse.data?.welcome_logo_url || '',
      surveyVideoUrl: settingsResponse.data?.survey_video_url || '',
      surveyStep1FlyerUrl: settingsResponse.data?.survey_step1_flyer_url || '',
      surveyMobileBgUrl: settingsResponse.data?.survey_mobile_bg_url || '',
      surveyStepImageUrls: settingsResponse.data?.survey_step_image_urls || [],
      surveyStepImagePositions: settingsResponse.data?.survey_step_image_positions || [],
      landingCarouselImagePositions: settingsResponse.data?.landing_carousel_image_positions || [],
      registrationStepImageUrls: settingsResponse.data?.registration_step_image_urls || [],
      burlingtonFacilityImageUrls: settingsResponse.data?.burlington_facility_image_urls || [],
      actonFacilityImageUrls: settingsResponse.data?.acton_facility_image_urls || [],
      wellesleyFacilityImageUrls: settingsResponse.data?.wellesley_facility_image_urls || [],
      overnightLandingImageUrls: settingsResponse.data?.overnight_landing_image_urls || [],
      overnightGalleryImageUrls: settingsResponse.data?.overnight_gallery_image_urls || [],
      overnightRegistrationImageUrls: settingsResponse.data?.overnight_registration_image_urls || [],
      levelUpImageUrl: settingsResponse.data?.level_up_image_url || '',
      levelUpScreenshotUrls: settingsResponse.data?.level_up_screenshot_urls || [],
      levelUpScreenshotPositions: settingsResponse.data?.level_up_screenshot_positions || [],
      levelUpScreenshotSize: settingsResponse.data?.level_up_screenshot_size || 100,
      wechatQrUrl: settingsResponse.data?.wechat_qr_url || '',
    },
    emailJourney: settingsResponse.data?.email_journey_templates || [],
    testimonials: settingsResponse.data?.testimonials || [],
    campTypeShowcase: settingsResponse.data?.camp_type_showcase || {},
    tuition: {
      regular: {
        fullWeek: settingsResponse.data?.tuition_full_week || 0,
        fullDay: settingsResponse.data?.tuition_full_day || 0,
        amHalf: settingsResponse.data?.tuition_am_half || 0,
        pmHalf: settingsResponse.data?.tuition_pm_half || 0,
        overnightWeek: settingsResponse.data?.tuition_overnight_week || 0,
        overnightDay: settingsResponse.data?.tuition_overnight_day || 0,
      },
      discount: {
        fullWeek: settingsResponse.data?.discount_full_week || 0,
        fullDay: settingsResponse.data?.discount_full_day || 0,
        amHalf: settingsResponse.data?.discount_am_half || 0,
        pmHalf: settingsResponse.data?.discount_pm_half || 0,
        overnightWeek: settingsResponse.data?.discount_overnight_week || 0,
        overnightDay: settingsResponse.data?.discount_overnight_day || 0,
      },
      discountEndDate: settingsResponse.data?.discount_end_date || '',
      discountDisplayValue: settingsResponse.data?.discount_display_value || '',
      discountCode: settingsResponse.data?.discount_code || '',
      lunchPrice: settingsResponse.data?.lunch_price || 14,
      bootcampPremiumPct: settingsResponse.data?.bootcamp_premium_pct ?? 25,
      siblingDiscountPct: settingsResponse.data?.sibling_discount_pct ?? 10,
      businessName: settingsResponse.data?.invoice_business_name || 'New England Wushu',
      businessAddress: settingsResponse.data?.invoice_business_address || '',
    },
    programs: {
      general: { startDate: '', endDate: '', selectedWeeks: [], actonSelectedWeeks: [], wellesleySelectedWeeks: [] },
      bootcamp: { startDate: '', endDate: '', selectedWeeks: [] },
      overnight: { startDate: '', endDate: '', selectedWeeks: [] },
    },
    locations: settingsResponse.data?.location_addresses || {},
  }

  raw.programs.general.actonSelectedWeeks = Array.isArray(settingsResponse.data?.general_acton_selected_weeks)
    ? settingsResponse.data.general_acton_selected_weeks
    : []

  raw.programs.general.wellesleySelectedWeeks = Array.isArray(settingsResponse.data?.general_wellesley_selected_weeks)
    ? settingsResponse.data.general_wellesley_selected_weeks
    : []

  for (const row of windowsResponse.data || []) {
    if (!programKeys.includes(row.program_key)) {
      continue
    }

    raw.programs[row.program_key] = {
      ...raw.programs[row.program_key],
      startDate: normalizeDateKey(row.start_date) || '',
      endDate: normalizeDateKey(row.end_date) || '',
    }
  }

  for (const row of weeksResponse.data || []) {
    if (!programKeys.includes(row.program_key) || !row.week_start) {
      continue
    }

    const weekStart = normalizeDateKey(row.week_start)
    if (!weekStart) {
      continue
    }
    raw.programs[row.program_key].selectedWeeks.push(`${row.program_key}:${weekStart}`)
  }

  if (
    raw.media.levelUpScreenshotUrls.length === 0 &&
    typeof raw.media.levelUpImageUrl === 'string' &&
    raw.media.levelUpImageUrl
  ) {
    raw.media.levelUpScreenshotUrls = [raw.media.levelUpImageUrl]
  }

  return {
    data: mergeAdminConfig(raw),
    error: null,
  }
}

export async function saveAdminConfigToSupabase(config) {
  if (!supabaseEnabled || !supabase) {
    return new Error('Supabase is not configured.')
  }

  const merged = mergeAdminConfig(config)

  const { error: settingsError } = await supabase.from('camp_admin_settings').upsert(
    {
      id: true,
      hero_image_url: merged.media.heroImageUrl || null,
      welcome_logo_url: merged.media.welcomeLogoUrl || null,
      survey_video_url: merged.media.surveyVideoUrl || null,
      survey_step1_flyer_url: merged.media.surveyStep1FlyerUrl || null,
      survey_mobile_bg_url: merged.media.surveyMobileBgUrl || null,
      survey_step_image_urls: merged.media.surveyStepImageUrls,
      survey_step_image_positions: merged.media.surveyStepImagePositions,
      landing_carousel_image_positions: merged.media.landingCarouselImagePositions,
      registration_step_image_urls: merged.media.registrationStepImageUrls,
      burlington_facility_image_urls: merged.media.burlingtonFacilityImageUrls,
      acton_facility_image_urls: merged.media.actonFacilityImageUrls,
      overnight_landing_image_urls: merged.media.overnightLandingImageUrls,
      overnight_gallery_image_urls: merged.media.overnightGalleryImageUrls,
      overnight_registration_image_urls: merged.media.overnightRegistrationImageUrls,
      level_up_image_url: merged.media.levelUpImageUrl || null,
      level_up_screenshot_urls: merged.media.levelUpScreenshotUrls,
      level_up_screenshot_positions: merged.media.levelUpScreenshotPositions,
      level_up_screenshot_size: merged.media.levelUpScreenshotSize,
      wechat_qr_url: merged.media.wechatQrUrl || null,
      email_journey_templates: merged.emailJourney,
      testimonials: merged.testimonials,
      camp_type_showcase: merged.campTypeShowcase,
      tuition_full_week: merged.tuition.regular.fullWeek,
      tuition_full_day: merged.tuition.regular.fullDay,
      tuition_am_half: merged.tuition.regular.amHalf,
      tuition_pm_half: merged.tuition.regular.pmHalf,
      tuition_overnight_week: merged.tuition.regular.overnightWeek,
      tuition_overnight_day: merged.tuition.regular.overnightDay,
      discount_full_week: merged.tuition.discount.fullWeek,
      discount_full_day: merged.tuition.discount.fullDay,
      discount_am_half: merged.tuition.discount.amHalf,
      discount_pm_half: merged.tuition.discount.pmHalf,
      discount_overnight_week: merged.tuition.discount.overnightWeek,
      discount_overnight_day: merged.tuition.discount.overnightDay,
      discount_end_date: merged.tuition.discountEndDate || null,
      discount_display_value: merged.tuition.discountDisplayValue || null,
      discount_code: merged.tuition.discountCode || null,
      lunch_price: merged.tuition.lunchPrice,
      bootcamp_premium_pct: merged.tuition.bootcampPremiumPct,
      sibling_discount_pct: merged.tuition.siblingDiscountPct,
      invoice_business_name: merged.tuition.businessName || null,
      invoice_business_address: merged.tuition.businessAddress || null,
      general_acton_selected_weeks: merged.programs.general.actonSelectedWeeks,
      general_wellesley_selected_weeks: merged.programs.general.wellesleySelectedWeeks,
      wellesley_facility_image_urls: merged.media.wellesleyFacilityImageUrls,
      location_addresses: merged.locations,
    },
    { onConflict: 'id' }
  )

  if (settingsError) {
    if (
      String(settingsError.message || '').includes('burlington_facility_image_urls') ||
      String(settingsError.message || '').includes('acton_facility_image_urls')
    ) {
      return new Error(
        'Save failed because the location facility photo columns are missing. Run sql/add_location_facility_image_urls.sql in Supabase, then save again.'
      )
    }
    if (String(settingsError.message || '').includes('general_acton_selected_weeks')) {
      return new Error(
        'Save failed because the Acton General Camp week column is missing. Run sql/add_general_acton_selected_weeks.sql in Supabase, then save again.'
      )
    }
    if (String(settingsError.message || '').includes('general_wellesley_selected_weeks')) {
      return new Error(
        'Save failed because the Wellesley General Camp week column is missing. Run sql/add_general_wellesley_selected_weeks.sql in Supabase, then save again.'
      )
    }
    if (String(settingsError.message || '').includes('wellesley_facility_image_urls')) {
      return new Error(
        'Save failed because the Wellesley facility image column is missing. Run sql/add_wellesley_location.sql in Supabase, then save again.'
      )
    }
    if (String(settingsError.message || '').includes('location_addresses')) {
      return new Error(
        'Save failed because the location addresses column is missing. Run sql/add_wellesley_location.sql in Supabase, then save again.'
      )
    }
    if (
      String(settingsError.message || '').includes('invoice_business_name') ||
      String(settingsError.message || '').includes('invoice_business_address')
    ) {
      return new Error(
        'Save failed because the invoice business info columns are missing. Run sql/supabase_admin_media_setup.sql in Supabase, then save again.'
      )
    }
    if (String(settingsError.message || '').includes('camp_type_showcase')) {
      return new Error(
        'Save failed because the camp type showcase column is missing. Run sql/supabase_admin_media_setup.sql in Supabase, then save again.'
      )
    }
    return settingsError
  }

  const windowsPayload = programKeys.map((programKey) => ({
    program_key: programKey,
    start_date: merged.programs[programKey].startDate || null,
    end_date: merged.programs[programKey].endDate || null,
  }))

  const { error: windowsError } = await supabase
    .from('camp_program_windows')
    .upsert(windowsPayload, { onConflict: 'program_key' })

  if (windowsError) {
    return windowsError
  }

  const { error: deleteError } = await supabase
    .from('camp_program_selected_weeks')
    .delete()
    .in('program_key', programKeys)

  if (deleteError) {
    return deleteError
  }

  const insertRows = []
  for (const programKey of programKeys) {
    const selectedWeeks = getSelectedWeeks(programKey, merged.programs[programKey])
    for (const week of selectedWeeks) {
      insertRows.push({
        program_key: programKey,
        week_start: week.start,
        week_end: week.end,
      })
    }
  }

  if (insertRows.length > 0) {
    const { error: insertError } = await supabase.from('camp_program_selected_weeks').insert(insertRows)
    if (insertError) {
      if (String(insertError.message || '').includes('camp_program_selected_weeks_check')) {
        return new Error(
          'Save failed because DB week-block validation is outdated. Run sql/fix_camp_program_selected_weeks_constraint.sql in Supabase, then save again.'
        )
      }
      return insertError
    }
  }

  window.dispatchEvent(new Event('camp-admin-updated'))
  return null
}

export function filterSelectedWeeksByDateWindow(config, programKey) {
  const program = config.programs[programKey]
  const generated = buildProgramWeekOptions(programKey, program.startDate, program.endDate)
  const validIds = new Set(generated.map((option) => option.id))

  return {
    ...program,
    selectedWeeks: program.selectedWeeks.filter((id) => validIds.has(id)),
    actonSelectedWeeks: Array.isArray(program.actonSelectedWeeks)
      ? program.actonSelectedWeeks.filter((id) => validIds.has(id))
      : [],
    wellesleySelectedWeeks: Array.isArray(program.wellesleySelectedWeeks)
      ? program.wellesleySelectedWeeks.filter((id) => validIds.has(id))
      : [],
  }
}
