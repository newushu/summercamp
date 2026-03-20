(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/campAdmin.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildProgramWeekOptions",
    ()=>buildProgramWeekOptions,
    "defaultAdminConfig",
    ()=>defaultAdminConfig,
    "formatDateLabel",
    ()=>formatDateLabel,
    "formatWeekLabel",
    ()=>formatWeekLabel,
    "getSelectedWeeks",
    ()=>getSelectedWeeks,
    "mergeAdminConfig",
    ()=>mergeAdminConfig
]);
const defaultAdminConfig = {
    media: {
        heroImageUrl: '',
        welcomeLogoUrl: '',
        surveyVideoUrl: '',
        surveyStep1FlyerUrl: '',
        surveyMobileBgUrl: '',
        surveyStepImageUrls: [
            '',
            '',
            '',
            '',
            '',
            ''
        ],
        surveyStepImagePositions: Array.from({
            length: 6
        }).map(()=>({
                x: 0,
                y: 0
            })),
        levelUpImageUrl: '',
        levelUpScreenshotUrls: [],
        levelUpScreenshotSize: 100,
        wechatQrUrl: ''
    },
    emailJourney: [
        {
            dayLabel: 'Immediately',
            title: 'Step 1 - Best-Fit Snapshot',
            subject: 'Your Summer Camp best-fit plan is ready',
            body: 'Hi {first_name}, thanks for completing the program guide. Based on your answers, our recommended start is: {recommended_plan}. You can reserve now with this link: {registration_link}. Questions? Reply to this email and our team will help today.'
        },
        {
            dayLabel: 'Day 2',
            title: 'Step 2 - Why This Plan Fits',
            subject: 'Why this camp path is a strong fit',
            body: 'Here is why this plan works for your family: age fit, current experience level, and clear next milestones. Our certified coaches build confidence, coordination, and discipline in a structured progression. Ready to lock weeks? {registration_link}'
        },
        {
            dayLabel: 'Day 4',
            title: 'Step 3 - Social + Team Value',
            subject: 'How camp builds friendships and confidence',
            body: 'Families choose us because campers build real friendships, teamwork, and social confidence through daily guided activities. If you have siblings, your second camper discount also applies. Reserve your weeks here: {registration_link}'
        },
        {
            dayLabel: 'Day 6',
            title: 'Step 4 - Logistics + Convenience',
            subject: 'Weekly schedule, lunch options, and onboarding',
            body: 'Quick logistics: you can mix General Camp and Competition Team Boot Camp by week, choose lunch by day, and get a clear onboarding checklist before week one. Questions are welcome. Register here: {registration_link}'
        },
        {
            dayLabel: 'Day 8',
            title: 'Step 5 - Final Priority Invite',
            subject: 'Final invite to secure your preferred camp weeks',
            body: 'Last reminder to reserve preferred weeks before spots fill. New England Wushu has been awarded Best in Burlington and our certified coaching team is ready to support your camper this summer. Reserve now: {registration_link}'
        }
    ],
    testimonials: [
        {
            studentName: 'Ethan, age 9',
            headline: 'From shy beginner to confident performer',
            story: 'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.',
            outcome: 'Parent reported stronger confidence, better discipline at home, and excitement to continue training.'
        }
    ],
    tuition: {
        regular: {
            fullWeek: 0,
            fullDay: 0,
            amHalf: 0,
            pmHalf: 0,
            overnightWeek: 0,
            overnightDay: 0
        },
        discount: {
            fullWeek: 0,
            fullDay: 0,
            amHalf: 0,
            pmHalf: 0,
            overnightWeek: 0,
            overnightDay: 0
        },
        discountEndDate: '',
        lunchPrice: 14,
        bootcampPremiumPct: 15,
        siblingDiscountPct: 10
    },
    programs: {
        general: {
            startDate: '',
            endDate: '',
            selectedWeeks: []
        },
        bootcamp: {
            startDate: '',
            endDate: '',
            selectedWeeks: []
        },
        overnight: {
            startDate: '',
            endDate: '',
            selectedWeeks: []
        }
    }
};
const programRules = {
    general: {
        startWeekday: 1,
        durationDays: 5
    },
    bootcamp: {
        startWeekday: 1,
        durationDays: 5
    },
    overnight: {
        startWeekday: 6,
        durationDays: 7
    }
};
function parseDate(input) {
    if (!input) {
        return null;
    }
    const parsed = new Date(`${input}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
}
function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}
function isoDate(date) {
    return date.toISOString().slice(0, 10);
}
function findWeekdayOnOrAfter(startDate, weekday) {
    const result = new Date(startDate);
    while(result.getDay() !== weekday){
        result.setDate(result.getDate() + 1);
    }
    return result;
}
function formatDateLabel(input) {
    const parsed = parseDate(input);
    if (!parsed) {
        return '';
    }
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}
function formatWeekLabel(week) {
    return `${formatDateLabel(week.start)} - ${formatDateLabel(week.end)}`;
}
function normalizeProgram(program = {}) {
    return {
        startDate: typeof program.startDate === 'string' ? program.startDate : '',
        endDate: typeof program.endDate === 'string' ? program.endDate : '',
        selectedWeeks: Array.isArray(program.selectedWeeks) ? program.selectedWeeks.filter((value)=>typeof value === 'string') : []
    };
}
function mergeAdminConfig(raw = {}) {
    const screenshotUrls = Array.isArray(raw.media?.levelUpScreenshotUrls) ? raw.media.levelUpScreenshotUrls.filter((value)=>typeof value === 'string') : [];
    const surveyStepImageUrlsRaw = Array.isArray(raw.media?.surveyStepImageUrls) ? raw.media.surveyStepImageUrls.filter((value)=>typeof value === 'string') : [];
    const surveyStepImageUrls = Array.from({
        length: 6
    }).map((_, index)=>surveyStepImageUrlsRaw[index] || '');
    const surveyStepImagePositionsRaw = Array.isArray(raw.media?.surveyStepImagePositions) ? raw.media.surveyStepImagePositions : [];
    const surveyStepImagePositions = Array.from({
        length: 6
    }).map((_, index)=>{
        const item = surveyStepImagePositionsRaw[index] || {};
        const x = Number(item?.x);
        const y = Number(item?.y);
        return {
            x: Number.isFinite(x) ? Math.max(-50, Math.min(50, x)) : 0,
            y: Number.isFinite(y) ? Math.max(-50, Math.min(50, y)) : 0
        };
    });
    const screenshotSize = Number(raw.media?.levelUpScreenshotSize);
    const toNumber = (value, fallback = 0)=>{
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const emailJourney = Array.from({
        length: 5
    }).map((_, index)=>{
        const base = defaultAdminConfig.emailJourney[index];
        const incoming = Array.isArray(raw.emailJourney) ? raw.emailJourney[index] || {} : {};
        return {
            dayLabel: typeof incoming.dayLabel === 'string' ? incoming.dayLabel : base.dayLabel,
            title: typeof incoming.title === 'string' ? incoming.title : base.title,
            subject: typeof incoming.subject === 'string' ? incoming.subject : base.subject,
            body: typeof incoming.body === 'string' ? incoming.body : base.body
        };
    });
    const testimonials = Array.isArray(raw.testimonials) ? raw.testimonials.map((item)=>({
            studentName: typeof item?.studentName === 'string' ? item.studentName : '',
            headline: typeof item?.headline === 'string' ? item.headline : '',
            story: typeof item?.story === 'string' ? item.story : '',
            outcome: typeof item?.outcome === 'string' ? item.outcome : ''
        })).filter((item)=>item.studentName || item.headline || item.story || item.outcome).slice(0, 12) : defaultAdminConfig.testimonials.map((item)=>({
            ...item
        }));
    return {
        media: {
            heroImageUrl: raw.media?.heroImageUrl || '',
            welcomeLogoUrl: raw.media?.welcomeLogoUrl || '',
            surveyVideoUrl: raw.media?.surveyVideoUrl || '',
            surveyStep1FlyerUrl: raw.media?.surveyStep1FlyerUrl || '',
            surveyMobileBgUrl: raw.media?.surveyMobileBgUrl || '',
            surveyStepImageUrls,
            surveyStepImagePositions,
            levelUpImageUrl: raw.media?.levelUpImageUrl || '',
            levelUpScreenshotUrls: screenshotUrls,
            levelUpScreenshotSize: Number.isFinite(screenshotSize) ? Math.max(40, Math.min(140, screenshotSize)) : 100,
            wechatQrUrl: raw.media?.wechatQrUrl || ''
        },
        emailJourney,
        testimonials: testimonials.length ? testimonials : defaultAdminConfig.testimonials.map((item)=>({
                ...item
            })),
        tuition: {
            regular: {
                fullWeek: toNumber(raw.tuition?.regular?.fullWeek),
                fullDay: toNumber(raw.tuition?.regular?.fullDay),
                amHalf: toNumber(raw.tuition?.regular?.amHalf),
                pmHalf: toNumber(raw.tuition?.regular?.pmHalf),
                overnightWeek: toNumber(raw.tuition?.regular?.overnightWeek),
                overnightDay: toNumber(raw.tuition?.regular?.overnightDay)
            },
            discount: {
                fullWeek: toNumber(raw.tuition?.discount?.fullWeek),
                fullDay: toNumber(raw.tuition?.discount?.fullDay),
                amHalf: toNumber(raw.tuition?.discount?.amHalf),
                pmHalf: toNumber(raw.tuition?.discount?.pmHalf),
                overnightWeek: toNumber(raw.tuition?.discount?.overnightWeek),
                overnightDay: toNumber(raw.tuition?.discount?.overnightDay)
            },
            discountEndDate: typeof raw.tuition?.discountEndDate === 'string' ? raw.tuition.discountEndDate : '',
            lunchPrice: Math.max(0, toNumber(raw.tuition?.lunchPrice, 14)),
            bootcampPremiumPct: Math.max(0, toNumber(raw.tuition?.bootcampPremiumPct, 15)),
            siblingDiscountPct: Math.max(0, toNumber(raw.tuition?.siblingDiscountPct, 10))
        },
        programs: {
            general: normalizeProgram(raw.programs?.general),
            bootcamp: normalizeProgram(raw.programs?.bootcamp),
            overnight: normalizeProgram(raw.programs?.overnight)
        }
    };
}
function buildProgramWeekOptions(programKey, startDateValue, endDateValue) {
    const startDate = parseDate(startDateValue);
    const endDate = parseDate(endDateValue);
    const rule = programRules[programKey];
    if (!startDate || !endDate || !rule || startDate > endDate) {
        return [];
    }
    const options = [];
    let cursor = findWeekdayOnOrAfter(startDate, rule.startWeekday);
    while(cursor <= endDate){
        const weekStart = new Date(cursor);
        const weekEnd = addDays(weekStart, rule.durationDays - 1);
        if (weekEnd <= endDate) {
            options.push({
                id: `${programKey}:${isoDate(weekStart)}`,
                start: isoDate(weekStart),
                end: isoDate(weekEnd)
            });
        }
        cursor = addDays(cursor, 7);
    }
    return options;
}
function getSelectedWeeks(programKey, programConfig) {
    const options = buildProgramWeekOptions(programKey, programConfig.startDate, programConfig.endDate);
    const selected = new Set(programConfig.selectedWeeks);
    return options.filter((option)=>selected.has(option.id));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseEnabled",
    ()=>supabaseEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://bgdicskoewekfwbavzwz.supabase.co") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VITE_SUPABASE_URL;
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZGljc2tvZXdla2Z3YmF2end6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTI4NTUsImV4cCI6MjA4NjQyODg1NX0.o3Tj6WJsQmc0_bKqAhirGjis0T609gPExmNhYpsQKMU") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VITE_SUPABASE_ANON_KEY;
const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = supabaseEnabled ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey) : null;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/campAdminApi.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAdminConfigFromSupabase",
    ()=>fetchAdminConfigFromSupabase,
    "filterSelectedWeeksByDateWindow",
    ()=>filterSelectedWeeksByDateWindow,
    "saveAdminConfigToSupabase",
    ()=>saveAdminConfigToSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-client] (ecmascript)");
;
;
const programKeys = [
    'general',
    'bootcamp',
    'overnight'
];
async function fetchAdminConfigFromSupabase() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
        return {
            data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"],
            error: new Error('Supabase is not configured.')
        };
    }
    const [settingsResponse, windowsResponse, weeksResponse] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_admin_settings').select('*').eq('id', true).maybeSingle(),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_windows').select('program_key, start_date, end_date'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').select('program_key, week_start, week_end')
    ]);
    const firstError = settingsResponse.error || windowsResponse.error || weeksResponse.error;
    if (firstError) {
        return {
            data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"],
            error: firstError
        };
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
            levelUpImageUrl: settingsResponse.data?.level_up_image_url || '',
            levelUpScreenshotUrls: settingsResponse.data?.level_up_screenshot_urls || [],
            levelUpScreenshotSize: settingsResponse.data?.level_up_screenshot_size || 100,
            wechatQrUrl: settingsResponse.data?.wechat_qr_url || ''
        },
        emailJourney: settingsResponse.data?.email_journey_templates || [],
        testimonials: settingsResponse.data?.testimonials || [],
        tuition: {
            regular: {
                fullWeek: settingsResponse.data?.tuition_full_week || 0,
                fullDay: settingsResponse.data?.tuition_full_day || 0,
                amHalf: settingsResponse.data?.tuition_am_half || 0,
                pmHalf: settingsResponse.data?.tuition_pm_half || 0,
                overnightWeek: settingsResponse.data?.tuition_overnight_week || 0,
                overnightDay: settingsResponse.data?.tuition_overnight_day || 0
            },
            discount: {
                fullWeek: settingsResponse.data?.discount_full_week || 0,
                fullDay: settingsResponse.data?.discount_full_day || 0,
                amHalf: settingsResponse.data?.discount_am_half || 0,
                pmHalf: settingsResponse.data?.discount_pm_half || 0,
                overnightWeek: settingsResponse.data?.discount_overnight_week || 0,
                overnightDay: settingsResponse.data?.discount_overnight_day || 0
            },
            discountEndDate: settingsResponse.data?.discount_end_date || '',
            lunchPrice: settingsResponse.data?.lunch_price || 14,
            bootcampPremiumPct: settingsResponse.data?.bootcamp_premium_pct ?? 15,
            siblingDiscountPct: settingsResponse.data?.sibling_discount_pct ?? 10
        },
        programs: {
            general: {
                startDate: '',
                endDate: '',
                selectedWeeks: []
            },
            bootcamp: {
                startDate: '',
                endDate: '',
                selectedWeeks: []
            },
            overnight: {
                startDate: '',
                endDate: '',
                selectedWeeks: []
            }
        }
    };
    for (const row of windowsResponse.data || []){
        if (!programKeys.includes(row.program_key)) {
            continue;
        }
        raw.programs[row.program_key] = {
            ...raw.programs[row.program_key],
            startDate: row.start_date || '',
            endDate: row.end_date || ''
        };
    }
    for (const row of weeksResponse.data || []){
        if (!programKeys.includes(row.program_key) || !row.week_start) {
            continue;
        }
        raw.programs[row.program_key].selectedWeeks.push(`${row.program_key}:${row.week_start}`);
    }
    if (raw.media.levelUpScreenshotUrls.length === 0 && typeof raw.media.levelUpImageUrl === 'string' && raw.media.levelUpImageUrl) {
        raw.media.levelUpScreenshotUrls = [
            raw.media.levelUpImageUrl
        ];
    }
    return {
        data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeAdminConfig"])(raw),
        error: null
    };
}
async function saveAdminConfigToSupabase(config) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
        return new Error('Supabase is not configured.');
    }
    const merged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeAdminConfig"])(config);
    const { error: settingsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_admin_settings').upsert({
        id: true,
        hero_image_url: merged.media.heroImageUrl || null,
        welcome_logo_url: merged.media.welcomeLogoUrl || null,
        survey_video_url: merged.media.surveyVideoUrl || null,
        survey_step1_flyer_url: merged.media.surveyStep1FlyerUrl || null,
        survey_mobile_bg_url: merged.media.surveyMobileBgUrl || null,
        survey_step_image_urls: merged.media.surveyStepImageUrls,
        survey_step_image_positions: merged.media.surveyStepImagePositions,
        level_up_image_url: merged.media.levelUpImageUrl || null,
        level_up_screenshot_urls: merged.media.levelUpScreenshotUrls,
        level_up_screenshot_size: merged.media.levelUpScreenshotSize,
        wechat_qr_url: merged.media.wechatQrUrl || null,
        email_journey_templates: merged.emailJourney,
        testimonials: merged.testimonials,
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
        lunch_price: merged.tuition.lunchPrice,
        bootcamp_premium_pct: merged.tuition.bootcampPremiumPct,
        sibling_discount_pct: merged.tuition.siblingDiscountPct
    }, {
        onConflict: 'id'
    });
    if (settingsError) {
        return settingsError;
    }
    const windowsPayload = programKeys.map((programKey)=>({
            program_key: programKey,
            start_date: merged.programs[programKey].startDate || null,
            end_date: merged.programs[programKey].endDate || null
        }));
    const { error: windowsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_windows').upsert(windowsPayload, {
        onConflict: 'program_key'
    });
    if (windowsError) {
        return windowsError;
    }
    const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').delete().in('program_key', programKeys);
    if (deleteError) {
        return deleteError;
    }
    const insertRows = [];
    for (const programKey of programKeys){
        const selectedWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSelectedWeeks"])(programKey, merged.programs[programKey]);
        for (const week of selectedWeeks){
            insertRows.push({
                program_key: programKey,
                week_start: week.start,
                week_end: week.end
            });
        }
    }
    if (insertRows.length > 0) {
        const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').insert(insertRows);
        if (insertError) {
            return insertError;
        }
    }
    window.dispatchEvent(new Event('camp-admin-updated'));
    return null;
}
function filterSelectedWeeksByDateWindow(config, programKey) {
    const program = config.programs[programKey];
    const generated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])(programKey, program.startDate, program.endDate);
    const validIds = new Set(generated.map((option)=>option.id));
    return {
        ...program,
        selectedWeeks: program.selectedWeeks.filter((id)=>validIds.has(id))
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/testimonials/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestimonialsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdminApi.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function TestimonialsPage() {
    _s();
    const [stories, setStories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"].testimonials);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TestimonialsPage.useEffect": ()=>{
            let active = true;
            async function load() {
                const { data } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAdminConfigFromSupabase"])();
                if (!active) {
                    return;
                }
                const incoming = Array.isArray(data?.testimonials) && data.testimonials.length > 0 ? data.testimonials : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"].testimonials;
                setStories(incoming);
            }
            load();
            return ({
                "TestimonialsPage.useEffect": ()=>{
                    active = false;
                }
            })["TestimonialsPage.useEffect"];
        }
    }["TestimonialsPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page testimonialsPage",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section testimonialsHero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Student Stories"
                    }, void 0, false, {
                        fileName: "[project]/app/testimonials/page.jsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Real progress from real families"
                    }, void 0, false, {
                        fileName: "[project]/app/testimonials/page.jsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Every story reflects structured coaching, measurable growth, and a confident next step for campers."
                    }, void 0, false, {
                        fileName: "[project]/app/testimonials/page.jsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/testimonials/page.jsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "testimonialsGrid",
                    children: stories.map((story, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: "testimonialCard",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "journeyDay",
                                    children: story.studentName || `Student Story ${index + 1}`
                                }, void 0, false, {
                                    fileName: "[project]/app/testimonials/page.jsx",
                                    lineNumber: 44,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    children: story.headline || 'Growth story'
                                }, void 0, false, {
                                    fileName: "[project]/app/testimonials/page.jsx",
                                    lineNumber: 45,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: story.story || 'Story coming soon.'
                                }, void 0, false, {
                                    fileName: "[project]/app/testimonials/page.jsx",
                                    lineNumber: 46,
                                    columnNumber: 15
                                }, this),
                                story.outcome ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "testimonialOutcome",
                                    children: story.outcome
                                }, void 0, false, {
                                    fileName: "[project]/app/testimonials/page.jsx",
                                    lineNumber: 47,
                                    columnNumber: 32
                                }, this) : null
                            ]
                        }, `${story.studentName || 'story'}-${index}`, true, {
                            fileName: "[project]/app/testimonials/page.jsx",
                            lineNumber: 43,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/testimonials/page.jsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/testimonials/page.jsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/testimonials/page.jsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(TestimonialsPage, "V3/I0fyD5DTZw1g7domu3seiK/c=");
_c = TestimonialsPage;
var _c;
__turbopack_context__.k.register(_c, "TestimonialsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_4fb7397c._.js.map