module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/campAdmin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
        registrationStepImageUrls: [
            '',
            '',
            '',
            ''
        ],
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
            highlights: [
                'Confidence',
                'Flexibility',
                'Showcase'
            ],
            story: 'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.',
            outcome: 'Parent reported stronger confidence, better discipline at home, and excitement to continue training.'
        },
        {
            studentName: 'Ava, age 8',
            headline: 'Lunch was easy, and every day felt meaningful',
            highlights: [
                'Daily Routine',
                'Skill Growth',
                'Coach Support'
            ],
            story: 'Ava attended General Camp for three weeks. Her family appreciated the flexible lunch planning and clear weekly structure, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.',
            outcome: 'Parent shared that planning lunches felt manageable, daily communication was clear, and Ava asked to come back next summer.'
        },
        {
            studentName: 'Noah, age 10',
            headline: 'Coaches who care and a reward system kids love',
            highlights: [
                'Motivation',
                'Discipline',
                'Teamwork'
            ],
            story: 'Noah joined General Camp to stay active and build confidence. The coaches were encouraging and patient, and he was motivated by the camp award system that recognized effort, teamwork, and progress all week.',
            outcome: 'Parent reported better confidence, strong connection with coaches, and real excitement about training because camp felt both supportive and fun.'
        },
        {
            studentName: 'Mia, age 7',
            headline: 'From first-week nerves to independent confidence',
            highlights: [
                'First-Time Camper',
                'Confidence',
                'Independence'
            ],
            story: 'Mia started camp feeling shy about joining group activities. By the second week, she was volunteering for partner drills, practicing at home, and proudly showing new techniques during Friday showcase.',
            outcome: 'Parent reported a major confidence jump, better listening at home, and stronger willingness to try new challenges.'
        },
        {
            studentName: 'Lucas, age 11',
            headline: 'Athletic focus and visible weekly progress',
            highlights: [
                'Athletic Development',
                'Focus',
                'Consistency'
            ],
            story: 'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.',
            outcome: 'Parent said he became more focused, looked forward to training each day, and showed measurable improvement by week three.'
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
        discountDisplayValue: '',
        discountCode: '',
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
    const registrationStepImageUrlsRaw = Array.isArray(raw.media?.registrationStepImageUrls) ? raw.media.registrationStepImageUrls.filter((value)=>typeof value === 'string') : [];
    const registrationStepImageUrls = Array.from({
        length: 4
    }).map((_, index)=>registrationStepImageUrlsRaw[index] || '');
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
            highlights: Array.isArray(item?.highlights) ? item.highlights.filter((value)=>typeof value === 'string').slice(0, 4) : [],
            story: typeof item?.story === 'string' ? item.story : '',
            outcome: typeof item?.outcome === 'string' ? item.outcome : ''
        })).filter((item)=>item.studentName || item.headline || item.story || item.outcome || item.highlights.length).slice(0, 12) : defaultAdminConfig.testimonials.map((item)=>({
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
            registrationStepImageUrls,
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
            discountDisplayValue: typeof raw.tuition?.discountDisplayValue === 'string' ? raw.tuition.discountDisplayValue : '',
            discountCode: typeof raw.tuition?.discountCode === 'string' ? raw.tuition.discountCode : '',
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
}),
"[project]/lib/supabase.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseEnabled",
    ()=>supabaseEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://bgdicskoewekfwbavzwz.supabase.co") || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZGljc2tvZXdla2Z3YmF2end6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTI4NTUsImV4cCI6MjA4NjQyODg1NX0.o3Tj6WJsQmc0_bKqAhirGjis0T609gPExmNhYpsQKMU") || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = supabaseEnabled ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey) : null;
}),
"[project]/lib/campAdminApi.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAdminConfigFromSupabase",
    ()=>fetchAdminConfigFromSupabase,
    "filterSelectedWeeksByDateWindow",
    ()=>filterSelectedWeeksByDateWindow,
    "saveAdminConfigToSupabase",
    ()=>saveAdminConfigToSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-ssr] (ecmascript)");
;
;
const programKeys = [
    'general',
    'bootcamp',
    'overnight'
];
async function fetchAdminConfigFromSupabase() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
        return {
            data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"],
            error: new Error('Supabase is not configured.')
        };
    }
    const [settingsResponse, windowsResponse, weeksResponse] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_admin_settings').select('*').eq('id', true).maybeSingle(),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_windows').select('program_key, start_date, end_date'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').select('program_key, week_start, week_end')
    ]);
    const firstError = settingsResponse.error || windowsResponse.error || weeksResponse.error;
    if (firstError) {
        return {
            data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"],
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
            registrationStepImageUrls: settingsResponse.data?.registration_step_image_urls || [],
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
            discountDisplayValue: settingsResponse.data?.discount_display_value || '',
            discountCode: settingsResponse.data?.discount_code || '',
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
        data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeAdminConfig"])(raw),
        error: null
    };
}
async function saveAdminConfigToSupabase(config) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
        return new Error('Supabase is not configured.');
    }
    const merged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeAdminConfig"])(config);
    const { error: settingsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_admin_settings').upsert({
        id: true,
        hero_image_url: merged.media.heroImageUrl || null,
        welcome_logo_url: merged.media.welcomeLogoUrl || null,
        survey_video_url: merged.media.surveyVideoUrl || null,
        survey_step1_flyer_url: merged.media.surveyStep1FlyerUrl || null,
        survey_mobile_bg_url: merged.media.surveyMobileBgUrl || null,
        survey_step_image_urls: merged.media.surveyStepImageUrls,
        survey_step_image_positions: merged.media.surveyStepImagePositions,
        registration_step_image_urls: merged.media.registrationStepImageUrls,
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
        discount_display_value: merged.tuition.discountDisplayValue || null,
        discount_code: merged.tuition.discountCode || null,
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
    const { error: windowsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_windows').upsert(windowsPayload, {
        onConflict: 'program_key'
    });
    if (windowsError) {
        return windowsError;
    }
    const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').delete().in('program_key', programKeys);
    if (deleteError) {
        return deleteError;
    }
    const insertRows = [];
    for (const programKey of programKeys){
        const selectedWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSelectedWeeks"])(programKey, merged.programs[programKey]);
        for (const week of selectedWeeks){
            insertRows.push({
                program_key: programKey,
                week_start: week.start,
                week_end: week.end
            });
        }
    }
    if (insertRows.length > 0) {
        const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_program_selected_weeks').insert(insertRows);
        if (insertError) {
            return insertError;
        }
    }
    window.dispatchEvent(new Event('camp-admin-updated'));
    return null;
}
function filterSelectedWeeksByDateWindow(config, programKey) {
    const program = config.programs[programKey];
    const generated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])(programKey, program.startDate, program.endDate);
    const validIds = new Set(generated.map((option)=>option.id));
    return {
        ...program,
        selectedWeeks: program.selectedWeeks.filter((id)=>validIds.has(id))
    };
}
}),
"[project]/lib/mediaLibraryApi.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMediaBucketName",
    ()=>getMediaBucketName,
    "getMediaPublicUrl",
    ()=>getMediaPublicUrl,
    "listMediaLibrary",
    ()=>listMediaLibrary,
    "uploadFilesToMediaBucket",
    ()=>uploadFilesToMediaBucket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-ssr] (ecmascript)");
;
const DEFAULT_BUCKET = 'camp-media';
function sanitizeFileName(fileName) {
    return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
}
function getMediaBucketName() {
    return process.env.NEXT_PUBLIC_MEDIA_BUCKET || DEFAULT_BUCKET;
}
function getMediaPublicUrl(path) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
        return '';
    }
    const bucket = getMediaBucketName();
    const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
async function listMediaLibrary() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
        return {
            items: [],
            error: new Error('Supabase is not configured.')
        };
    }
    const bucket = getMediaBucketName();
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from(bucket).list('uploads', {
        limit: 200,
        offset: 0,
        sortBy: {
            column: 'created_at',
            order: 'desc'
        }
    });
    if (error) {
        return {
            items: [],
            error
        };
    }
    const items = (data || []).filter((item)=>item.name).map((item)=>{
        const path = `uploads/${item.name}`;
        return {
            path,
            name: item.name,
            publicUrl: getMediaPublicUrl(path),
            createdAt: item.created_at || ''
        };
    });
    return {
        items,
        error: null
    };
}
async function uploadFilesToMediaBucket(fileList) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
        return {
            uploaded: [],
            error: new Error('Supabase is not configured.')
        };
    }
    const files = Array.from(fileList || []);
    if (files.length === 0) {
        return {
            uploaded: [],
            error: null
        };
    }
    const bucket = getMediaBucketName();
    const uploaded = [];
    for (const file of files){
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitizeFileName(file.name)}`;
        const path = `uploads/${fileName}`;
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || undefined
        });
        if (error) {
            return {
                uploaded,
                error
            };
        }
        uploaded.push({
            path,
            name: file.name,
            publicUrl: getMediaPublicUrl(path)
        });
    }
    return {
        uploaded,
        error: null
    };
}
}),
"[project]/app/admin/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdminApi.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mediaLibraryApi.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const programMeta = {
    general: {
        title: 'General Camp',
        rhythm: 'Auto-generated Monday to Friday weeks'
    },
    bootcamp: {
        title: 'Competition Team Boot Camp',
        rhythm: 'Auto-generated Monday to Friday weeks'
    },
    overnight: {
        title: 'Overnight Camp',
        rhythm: 'Auto-generated 7-day blocks starting Saturday'
    }
};
function money(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}
function roundUpToFive(value) {
    const next = Math.ceil(Number(value || 0) / 5) * 5;
    return Number.isFinite(next) ? Math.max(0, next) : 0;
}
function discountAmount(regular, discountedPrice) {
    return Math.max(0, Number(regular || 0) - Number(discountedPrice || 0));
}
function buildBootcampTuition(tuition) {
    const premiumFactor = 1 + Number(tuition.bootcampPremiumPct || 0) / 100;
    const derive = (value)=>roundUpToFive(Number(value || 0) * premiumFactor);
    return {
        regular: {
            fullWeek: derive(tuition.regular.fullWeek),
            fullDay: derive(tuition.regular.fullDay),
            amHalf: derive(tuition.regular.amHalf),
            pmHalf: derive(tuition.regular.pmHalf)
        },
        discount: {
            fullWeek: derive(tuition.discount.fullWeek),
            fullDay: derive(tuition.discount.fullDay),
            amHalf: derive(tuition.discount.amHalf),
            pmHalf: derive(tuition.discount.pmHalf)
        }
    };
}
function buildTuitionChecks(tuition) {
    const regular = tuition.regular;
    const discounted = tuition.discount;
    function evaluateRule(label, baselineValue, unitPrice, unitCount, multiplier) {
        const baseline = Number(baselineValue || 0);
        const actualTotal = Number(unitPrice || 0) * unitCount;
        const targetTotal = baseline > 0 ? roundUpToFive(baseline * multiplier) : 0;
        const targetUnit = baseline > 0 ? roundUpToFive(targetTotal / unitCount) : 0;
        const deficitTotal = Math.max(0, targetTotal - actualTotal);
        const deficitUnit = deficitTotal > 0 ? roundUpToFive(deficitTotal / unitCount) : 0;
        const pass = baseline > 0 ? actualTotal >= targetTotal : true;
        return {
            pass,
            line: `${label}: ${money(actualTotal)} vs target ${money(targetTotal)} (${money(targetUnit)} per day)`,
            raiseText: pass ? '' : `Raise by ${money(deficitTotal)} total (about +${money(deficitUnit)}/day)`
        };
    }
    const regularFullDay = evaluateRule('Regular Full Day x5', regular.fullWeek, regular.fullDay, 5, 1.15);
    const discountFullDay = evaluateRule('Discounted Full Day x5', discounted.fullWeek, discounted.fullDay, 5, 1.15);
    const regularAM = evaluateRule('Regular AM x5', regular.fullWeek, regular.amHalf, 5, 0.65);
    const discountAM = evaluateRule('Discounted AM x5', discounted.fullWeek, discounted.amHalf, 5, 0.65);
    const regularPM = evaluateRule('Regular PM x5', regular.fullWeek, regular.pmHalf, 5, 0.75);
    const discountPM = evaluateRule('Discounted PM x5', discounted.fullWeek, discounted.pmHalf, 5, 0.75);
    const regularOvernight = evaluateRule('Regular Overnight Day x7', regular.overnightWeek, regular.overnightDay, 7, 1.35);
    const discountOvernight = evaluateRule('Discounted Overnight Day x7', discounted.overnightWeek, discounted.overnightDay, 7, 1.35);
    return {
        fullWeek: {
            pass: true,
            lines: [
                'Baseline row. Set Full Week first, then optimize all other rows against it.'
            ],
            raises: []
        },
        fullDay: {
            pass: regularFullDay.pass && discountFullDay.pass,
            lines: [
                regularFullDay.line,
                discountFullDay.line
            ],
            raises: [
                regularFullDay.raiseText,
                discountFullDay.raiseText
            ].filter(Boolean)
        },
        amHalf: {
            pass: regularAM.pass && discountAM.pass,
            lines: [
                regularAM.line,
                discountAM.line
            ],
            raises: [
                regularAM.raiseText,
                discountAM.raiseText
            ].filter(Boolean)
        },
        pmHalf: {
            pass: regularPM.pass && discountPM.pass,
            lines: [
                regularPM.line,
                discountPM.line
            ],
            raises: [
                regularPM.raiseText,
                discountPM.raiseText
            ].filter(Boolean)
        },
        overnightDay: {
            pass: regularOvernight.pass && discountOvernight.pass,
            lines: [
                regularOvernight.line,
                discountOvernight.line
            ],
            raises: [
                regularOvernight.raiseText,
                discountOvernight.raiseText
            ].filter(Boolean)
        },
        overnightWeek: {
            pass: true,
            lines: [
                'Baseline row. Overnight Full Week drives Overnight Day x7 target.'
            ],
            raises: []
        }
    };
}
function getInitialState() {
    return {
        media: {
            heroImageUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.heroImageUrl,
            welcomeLogoUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.welcomeLogoUrl,
            surveyVideoUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.surveyVideoUrl,
            surveyStep1FlyerUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.surveyStep1FlyerUrl,
            surveyMobileBgUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.surveyMobileBgUrl,
            surveyStepImageUrls: [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.surveyStepImageUrls
            ],
            surveyStepImagePositions: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.surveyStepImagePositions.map((item)=>({
                    ...item
                })),
            registrationStepImageUrls: [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.registrationStepImageUrls
            ],
            levelUpImageUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.levelUpImageUrl,
            levelUpScreenshotUrls: [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.levelUpScreenshotUrls
            ],
            levelUpScreenshotSize: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.levelUpScreenshotSize,
            wechatQrUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.wechatQrUrl
        },
        emailJourney: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].emailJourney.map((item)=>({
                ...item
            })),
        testimonials: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].testimonials.map((item)=>({
                ...item
            })),
        tuition: {
            regular: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.regular
            },
            discount: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.discount
            },
            discountEndDate: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.discountEndDate,
            discountDisplayValue: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.discountDisplayValue,
            discountCode: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.discountCode,
            lunchPrice: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.lunchPrice,
            bootcampPremiumPct: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.bootcampPremiumPct,
            siblingDiscountPct: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].tuition.siblingDiscountPct
        },
        programs: {
            general: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].programs.general
            },
            bootcamp: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].programs.bootcamp
            },
            overnight: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].programs.overnight
            }
        }
    };
}
function getResizedPreviewUrl(url, width, height, quality = 70) {
    if (!url) {
        return '';
    }
    try {
        const parsed = new URL(url);
        parsed.searchParams.set('width', String(width));
        parsed.searchParams.set('height', String(height));
        parsed.searchParams.set('resize', 'cover');
        parsed.searchParams.set('quality', String(quality));
        return parsed.toString();
    } catch  {
        return url;
    }
}
function isVideoUrl(url) {
    if (!url) {
        return false;
    }
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.toLowerCase();
        return /\.(mp4|mov|webm|m4v|ogg)$/i.test(pathname);
    } catch  {
        return /\.(mp4|mov|webm|m4v|ogg)$/i.test(String(url).toLowerCase());
    }
}
function getYouTubeVideoId(url) {
    if (!url) {
        return '';
    }
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        if (host === 'youtu.be') {
            return parsed.pathname.replace('/', '').trim();
        }
        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsed.pathname === '/watch') {
                return parsed.searchParams.get('v') || '';
            }
            if (parsed.pathname.startsWith('/embed/')) {
                return parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
            }
            if (parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
            }
        }
    } catch  {
        return '';
    }
    return '';
}
function getYouTubeEmbedUrl(url) {
    const id = getYouTubeVideoId(url);
    if (!id) {
        return '';
    }
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&controls=1&rel=0`;
}
const surveyStepQuestions = [
    'Step 1: Email + camper ages',
    'Step 2A: Sports participation and experience',
    'Step 2B: Build-first support visuals',
    'Step 3: Martial arts experience',
    'Step 4: Lunch convenience + family goals',
    'Step 5: Recommendation and register prompt'
];
const registrationStepQuestions = [
    'Registration Step 1: Family & campers',
    'Registration Step 2: Camp weeks & times',
    'Registration Step 3: Lunch days',
    'Registration Step 4: Review & submit'
];
const emailJourneyBlueprint = [
    {
        step: 'Step 1',
        objective: 'Deliver recommendation immediately while intent is high.',
        cta: 'View recommended plan + start registration'
    },
    {
        step: 'Step 2',
        objective: 'Explain why the recommendation fits the camper profile.',
        cta: 'Review fit breakdown + reserve weeks'
    },
    {
        step: 'Step 3',
        objective: 'Highlight social/team value and sibling-discount appeal.',
        cta: 'See community benefits + register now'
    },
    {
        step: 'Step 4',
        objective: 'Reduce friction with logistics, lunch, and onboarding clarity.',
        cta: 'Review logistics + secure schedule'
    },
    {
        step: 'Step 5',
        objective: 'Create urgency and close with a clear final invitation.',
        cta: 'Final call to reserve preferred weeks'
    }
];
function AdminPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(getInitialState);
    const [activeJourneyTab, setActiveJourneyTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingLibrary, setLoadingLibrary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savedMessage, setSavedMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [adminEmail, setAdminEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [mediaLibrary, setMediaLibrary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activePreviewIndex, setActivePreviewIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [activeLibraryPreviewIndex, setActiveLibraryPreviewIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [openStepLibraryPicker, setOpenStepLibraryPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [openRegistrationStepLibraryPicker, setOpenRegistrationStepLibraryPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingEmailTracking, setLoadingEmailTracking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [emailJourneyRuns, setEmailJourneyRuns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [emailReplies, setEmailReplies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [emailEvents, setEmailEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [testEmail, setTestEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [sendingTestStep, setSendingTestStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [aiReplyInput, setAiReplyInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        customerName: '',
        subject: '',
        message: '',
        tone: 'professional'
    });
    const [aiReplyDraft, setAiReplyDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [aiReplyLoading, setAiReplyLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedReplyId, setSelectedReplyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [replyFilterEmail, setReplyFilterEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const refreshMediaLibrary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoadingLibrary(true);
        const { items, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listMediaLibrary"])();
        if (error) {
            setErrorMessage(`Media library failed: ${error.message}`);
            setLoadingLibrary(false);
            return;
        }
        setMediaLibrary(items);
        setLoadingLibrary(false);
    }, []);
    const refreshEmailTracking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            return;
        }
        setLoadingEmailTracking(true);
        const [runsResponse, repliesResponse, eventsResponse] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_journey_runs').select('id, email, status, current_step, last_sent_at, next_send_at, created_at').order('created_at', {
                ascending: false
            }).limit(30),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_replies').select('id, email, from_email, subject, body_text, is_unread, received_at, ai_status, ai_error, ai_draft').order('received_at', {
                ascending: false
            }).limit(30),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_journey_events').select('id, email, step_number, event_type, event_at').order('event_at', {
                ascending: false
            }).limit(30)
        ]);
        const firstError = runsResponse.error || repliesResponse.error || eventsResponse.error;
        if (firstError) {
            setErrorMessage(`Email tracking load failed: ${firstError.message}`);
            setLoadingEmailTracking(false);
            return;
        }
        setEmailJourneyRuns(runsResponse.data || []);
        setEmailReplies(repliesResponse.data || []);
        setEmailEvents(eventsResponse.data || []);
        setLoadingEmailTracking(false);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        async function bootstrap() {
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
                if (active) {
                    setErrorMessage('Supabase env vars are missing.');
                    setLoading(false);
                }
                return;
            }
            const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }
            if (active) {
                setAdminEmail(session.user.email || '');
            }
            const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchAdminConfigFromSupabase"])();
            if (!active) {
                return;
            }
            if (error) {
                setErrorMessage(`Load failed: ${error.message}`);
            } else {
                setErrorMessage('');
            }
            setConfig(data);
            setLoading(false);
            refreshMediaLibrary();
            refreshEmailTracking();
        }
        bootstrap();
        return ()=>{
            active = false;
        };
    }, [
        refreshEmailTracking,
        refreshMediaLibrary,
        router
    ]);
    const weekOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            general: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('general', config.programs.general.startDate, config.programs.general.endDate),
            bootcamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('bootcamp', config.programs.bootcamp.startDate, config.programs.bootcamp.endDate),
            overnight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('overnight', config.programs.overnight.startDate, config.programs.overnight.endDate)
        }), [
        config.programs
    ]);
    const tuitionChecks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>buildTuitionChecks(config.tuition), [
        config.tuition
    ]);
    const bootcampTuition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>buildBootcampTuition(config.tuition), [
        config.tuition
    ]);
    const activePreviewUrl = config.media.levelUpScreenshotUrls[activePreviewIndex] || config.media.levelUpScreenshotUrls[0] || '';
    const activeLibraryPreviewUrl = mediaLibrary[activeLibraryPreviewIndex]?.publicUrl || mediaLibrary[0]?.publicUrl || '';
    const filteredEmailReplies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>replyFilterEmail ? emailReplies.filter((item)=>(item.email || item.from_email || '') === replyFilterEmail) : emailReplies, [
        emailReplies,
        replyFilterEmail
    ]);
    function updateMedia(field, value) {
        setConfig((current)=>({
                ...current,
                media: {
                    ...current.media,
                    [field]: value
                }
            }));
    }
    function updateEmailJourneyStep(index, field, value) {
        setConfig((current)=>({
                ...current,
                emailJourney: current.emailJourney.map((item, itemIndex)=>itemIndex === index ? {
                        ...item,
                        [field]: value
                    } : item)
            }));
    }
    function updateTestimonial(index, field, value) {
        setConfig((current)=>({
                ...current,
                testimonials: current.testimonials.map((item, itemIndex)=>itemIndex === index ? {
                        ...item,
                        [field]: value
                    } : item)
            }));
    }
    function addTestimonial() {
        setConfig((current)=>({
                ...current,
                testimonials: [
                    ...current.testimonials,
                    {
                        studentName: '',
                        headline: '',
                        story: '',
                        outcome: ''
                    }
                ]
            }));
    }
    function removeTestimonial(index) {
        setConfig((current)=>({
                ...current,
                testimonials: current.testimonials.filter((_, itemIndex)=>itemIndex !== index)
            }));
    }
    function renderTestTemplate(text) {
        const registrationLink = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '{registration_link}';
        return String(text || '').replaceAll('{first_name}', 'Test Parent').replaceAll('{recommended_plan}', 'General Camp + 2 weeks Competition Team Boot Camp').replaceAll('{registration_link}', registrationLink);
    }
    async function sendTestEmailForStep(stepIndex) {
        const recipient = testEmail.trim();
        if (!/\S+@\S+\.\S+/.test(recipient)) {
            setErrorMessage('Enter a valid test email first.');
            return;
        }
        const template = config.emailJourney[stepIndex];
        if (!template?.subject || !template?.body) {
            setErrorMessage(`Step ${stepIndex + 1} is missing subject or body.`);
            return;
        }
        setSendingTestStep(stepIndex + 1);
        setErrorMessage('');
        setSavedMessage('');
        const response = await fetch('/api/email/send-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                toEmail: recipient,
                stepNumber: stepIndex + 1,
                template: {
                    subject: renderTestTemplate(template.subject),
                    body: renderTestTemplate(template.body)
                }
            })
        });
        const result = await response.json();
        if (!response.ok) {
            setErrorMessage(result?.error || 'Test email failed.');
            setSendingTestStep(0);
            return;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            const { data: runRows } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_journey_runs').insert({
                email: recipient,
                status: result?.previewOnly ? 'test_preview_only' : 'test_sent',
                current_step: stepIndex + 1,
                last_sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).select('id').limit(1);
            const runId = runRows?.[0]?.id || null;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_journey_events').insert({
                run_id: runId,
                email: recipient,
                step_number: stepIndex + 1,
                event_type: result?.previewOnly ? 'test_preview_only' : 'test_sent',
                subject: renderTestTemplate(template.subject),
                body_preview: renderTestTemplate(template.body).slice(0, 400),
                event_payload: result
            });
        }
        setSavedMessage(result?.previewOnly ? 'Template preview succeeded. Configure SendGrid to send real test emails.' : `Step ${stepIndex + 1} test email sent to ${recipient}.`);
        setSendingTestStep(0);
        refreshEmailTracking();
    }
    async function generateAiReplyDraft() {
        if (!aiReplyInput.message.trim()) {
            setErrorMessage('Paste an inbound email message first.');
            return;
        }
        setAiReplyLoading(true);
        setErrorMessage('');
        const response = await fetch('/api/email/draft-reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aiReplyInput)
        });
        const result = await response.json();
        if (!response.ok) {
            setErrorMessage(result?.error || 'Failed to generate AI reply.');
            setAiReplyLoading(false);
            return;
        }
        setAiReplyDraft(result?.draft || '');
        if (selectedReplyId && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_replies').update({
                ai_status: 'drafted',
                ai_draft: result?.draft || '',
                ai_generated_at: new Date().toISOString(),
                ai_error: null
            }).eq('id', selectedReplyId);
            refreshEmailTracking();
        }
        setAiReplyLoading(false);
    }
    function selectReplyForAssistant(reply) {
        setSelectedReplyId(reply.id);
        setAiReplyInput((current)=>({
                ...current,
                customerName: '',
                subject: reply.subject || '',
                message: reply.body_text || ''
            }));
        setAiReplyDraft(reply.ai_draft || '');
    }
    async function markReplyHandled() {
        if (!selectedReplyId || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            return;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('email_replies').update({
            is_unread: false,
            ai_status: 'closed'
        }).eq('id', selectedReplyId);
        setSavedMessage('Reply marked as handled.');
        refreshEmailTracking();
    }
    function updateSurveyStepImage(index, value) {
        setConfig((current)=>({
                ...current,
                media: {
                    ...current.media,
                    surveyStepImageUrls: Array.from({
                        length: 6
                    }).map((_, imageIndex)=>imageIndex === index ? value : current.media.surveyStepImageUrls?.[imageIndex] || '')
                }
            }));
    }
    function updateRegistrationStepImage(index, value) {
        setConfig((current)=>({
                ...current,
                media: {
                    ...current.media,
                    registrationStepImageUrls: Array.from({
                        length: 4
                    }).map((_, imageIndex)=>imageIndex === index ? value : current.media.registrationStepImageUrls?.[imageIndex] || '')
                }
            }));
    }
    function assignSurveyStepImageFromLibrary(index, url) {
        updateSurveyStepImage(index, url);
        setOpenStepLibraryPicker(null);
    }
    function assignRegistrationStepImageFromLibrary(index, url) {
        updateRegistrationStepImage(index, url);
        setOpenRegistrationStepLibraryPicker(null);
    }
    async function uploadRegistrationStepImage(index, event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateRegistrationStepImage(index, first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    function updateSurveyStepImagePosition(index, axis, value) {
        const numeric = Number(value);
        setConfig((current)=>({
                ...current,
                media: {
                    ...current.media,
                    surveyStepImagePositions: current.media.surveyStepImagePositions.map((item, itemIndex)=>itemIndex === index ? {
                            ...item,
                            [axis]: Number.isFinite(numeric) ? Math.max(-50, Math.min(50, numeric)) : 0
                        } : item)
                }
            }));
    }
    function getSurveyImageStyle(index) {
        const pos = config.media.surveyStepImagePositions[index] || {
            x: 0,
            y: 0
        };
        return {
            objectPosition: `${50 + Number(pos.x || 0)}% ${50 + Number(pos.y || 0)}%`
        };
    }
    function updateTuition(group, field, value) {
        setConfig((current)=>({
                ...current,
                tuition: {
                    ...current.tuition,
                    [group]: {
                        ...current.tuition[group],
                        [field]: value === '' ? '' : Number(value)
                    }
                }
            }));
    }
    function updateTuitionField(field, value) {
        setConfig((current)=>({
                ...current,
                tuition: {
                    ...current.tuition,
                    [field]: field === 'lunchPrice' || field === 'bootcampPremiumPct' || field === 'siblingDiscountPct' ? value === '' ? '' : Math.max(0, Number(value) || 0) : value
                }
            }));
    }
    function addScreenshotUrl(url) {
        if (!url) {
            return;
        }
        setConfig((current)=>{
            const next = current.media.levelUpScreenshotUrls.includes(url) ? current.media.levelUpScreenshotUrls : [
                ...current.media.levelUpScreenshotUrls,
                url
            ];
            return {
                ...current,
                media: {
                    ...current.media,
                    levelUpScreenshotUrls: next,
                    levelUpImageUrl: next[0] || ''
                }
            };
        });
    }
    function removeScreenshotUrl(url) {
        setConfig((current)=>{
            const next = current.media.levelUpScreenshotUrls.filter((item)=>item !== url);
            return {
                ...current,
                media: {
                    ...current.media,
                    levelUpScreenshotUrls: next,
                    levelUpImageUrl: next[0] || ''
                }
            };
        });
    }
    async function uploadScreenshots(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        for (const item of uploaded){
            addScreenshotUrl(item.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadWeChatQr(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateMedia('wechatQrUrl', first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadWelcomeLogo(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateMedia('welcomeLogoUrl', first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadSurveyVideo(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateMedia('surveyVideoUrl', first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadSurveyFlyer(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateMedia('surveyStep1FlyerUrl', first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadSurveyMobileBg(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { uploaded, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        const first = uploaded[0];
        if (first?.publicUrl) {
            updateMedia('surveyMobileBgUrl', first.publicUrl);
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    async function uploadToLibrary(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        setUploading(true);
        setErrorMessage('');
        const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFilesToMediaBucket"])(fileList);
        if (error) {
            setErrorMessage(`Upload failed: ${error.message}`);
            setUploading(false);
            return;
        }
        await refreshMediaLibrary();
        setUploading(false);
        event.target.value = '';
    }
    function updateProgramDate(programKey, field, value) {
        setConfig((current)=>{
            const next = {
                ...current,
                programs: {
                    ...current.programs,
                    [programKey]: {
                        ...current.programs[programKey],
                        [field]: value
                    }
                }
            };
            return {
                ...next,
                programs: {
                    ...next.programs,
                    [programKey]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterSelectedWeeksByDateWindow"])(next, programKey)
                }
            };
        });
    }
    function toggleWeek(programKey, weekId) {
        setConfig((current)=>{
            const existing = new Set(current.programs[programKey].selectedWeeks);
            if (existing.has(weekId)) {
                existing.delete(weekId);
            } else {
                existing.add(weekId);
            }
            return {
                ...current,
                programs: {
                    ...current.programs,
                    [programKey]: {
                        ...current.programs[programKey],
                        selectedWeeks: Array.from(existing)
                    }
                }
            };
        });
    }
    function selectAllWeeks(programKey) {
        setConfig((current)=>({
                ...current,
                programs: {
                    ...current.programs,
                    [programKey]: {
                        ...current.programs[programKey],
                        selectedWeeks: weekOptions[programKey].map((option)=>option.id)
                    }
                }
            }));
    }
    function clearWeeks(programKey) {
        setConfig((current)=>({
                ...current,
                programs: {
                    ...current.programs,
                    [programKey]: {
                        ...current.programs[programKey],
                        selectedWeeks: []
                    }
                }
            }));
    }
    async function saveChanges() {
        if (saving) {
            return;
        }
        setSaving(true);
        setSavedMessage('');
        setErrorMessage('');
        const error = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveAdminConfigToSupabase"])(config);
        if (error) {
            setErrorMessage(`Save failed: ${error.message}`);
            setSaving(false);
            return;
        }
        setSavedMessage(`Saved ${new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })}`);
        setSaving(false);
    }
    async function signOut() {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            return;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        router.replace('/login');
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "page adminPage",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "subhead",
                    children: "Loading admin settings..."
                }, void 0, false, {
                    fileName: "[project]/app/admin/page.jsx",
                    lineNumber: 1088,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 1087,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/admin/page.jsx",
            lineNumber: 1086,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page adminPage",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Admin Console"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1097,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Camp settings manager"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1098,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Control media and camp date schedules. Weeks are generated automatically from each date range."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1099,
                        columnNumber: 9
                    }, this),
                    adminEmail ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: [
                            "Signed in as ",
                            adminEmail
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1102,
                        columnNumber: 23
                    }, this) : null,
                    errorMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "errorMessage",
                        children: errorMessage
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1103,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 1096,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Media"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: [
                            "Bucket: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mediaLibraryApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMediaBucketName"])()
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1108,
                                columnNumber: 40
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminGrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Welcome logo URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.welcomeLogoUrl,
                                        onChange: (event)=>updateMedia('welcomeLogoUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1112,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1110,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Upload welcome logo",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: uploadWelcomeLogo
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Hero image URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.heroImageUrl,
                                        onChange: (event)=>updateMedia('heroImageUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1125,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Survey video URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.surveyVideoUrl,
                                        onChange: (event)=>updateMedia('surveyVideoUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1137,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Upload survey video",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "video/*",
                                        onChange: uploadSurveyVideo
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1147,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Survey Step 1 flyer URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.surveyStep1FlyerUrl,
                                        onChange: (event)=>updateMedia('surveyStep1FlyerUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1152,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1150,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Upload Step 1 flyer",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: uploadSurveyFlyer
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1162,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Survey mobile background URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.surveyMobileBgUrl,
                                        onChange: (event)=>updateMedia('surveyMobileBgUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1167,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1165,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Upload mobile survey background",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: uploadSurveyMobileBg
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1177,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1175,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Add phone screenshots (multiple)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        multiple: true,
                                        onChange: uploadScreenshots
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1182,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Upload WeChat QR",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: uploadWeChatQr
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1185,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1109,
                        columnNumber: 9
                    }, this),
                    config.media.welcomeLogoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mediaLogoPreview",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Current welcome logo preview"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1192,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: getResizedPreviewUrl(config.media.welcomeLogoUrl, 200, 200),
                                alt: "Welcome logo preview",
                                loading: "lazy",
                                decoding: "async"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1193,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1191,
                        columnNumber: 11
                    }, this) : null,
                    config.media.surveyVideoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminSurveyVideoPreview",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Current survey video preview"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1203,
                                columnNumber: 13
                            }, this),
                            getYouTubeEmbedUrl(config.media.surveyVideoUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                src: getYouTubeEmbedUrl(config.media.surveyVideoUrl),
                                title: "Survey video preview",
                                allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
                                allowFullScreen: true
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1205,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                controls: true,
                                playsInline: true,
                                preload: "metadata",
                                src: config.media.surveyVideoUrl
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1212,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1202,
                        columnNumber: 11
                    }, this) : null,
                    config.media.surveyStep1FlyerUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mediaLogoPreview",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Step 1 flyer preview"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1218,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: getResizedPreviewUrl(config.media.surveyStep1FlyerUrl, 640, 360),
                                alt: "Survey Step 1 flyer preview",
                                loading: "lazy",
                                decoding: "async"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1219,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1217,
                        columnNumber: 11
                    }, this) : null,
                    config.media.surveyMobileBgUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mediaLogoPreview",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Survey mobile background preview"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1229,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: getResizedPreviewUrl(config.media.surveyMobileBgUrl, 640, 960),
                                alt: "Survey mobile background preview",
                                loading: "lazy",
                                decoding: "async"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1230,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1228,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminGrid mediaControls",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Manual screenshot URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.levelUpImageUrl,
                                        onChange: (event)=>updateMedia('levelUpImageUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1242,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1240,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Screenshot size (",
                                    Math.round(config.media.levelUpScreenshotSize),
                                    "%)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "40",
                                        max: "140",
                                        value: config.media.levelUpScreenshotSize,
                                        onChange: (event)=>updateMedia('levelUpScreenshotSize', Number(event.target.value))
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1252,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1250,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "WeChat QR URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.wechatQrUrl,
                                        onChange: (event)=>updateMedia('wechatQrUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1265,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1263,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminActions",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "button secondary",
                            onClick: ()=>addScreenshotUrl(config.media.levelUpImageUrl),
                            children: "Add manual URL to phone list"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1275,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1274,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "subCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Program Finder step images"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1285,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Assign one image per survey step/question."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "surveyStepAssetGrid",
                                children: surveyStepQuestions.map((questionLabel, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "surveyStepAssetCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                children: questionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1290,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyContextFrame",
                                                children: config.media.surveyStepImageUrls[index] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: getResizedPreviewUrl(config.media.surveyStepImageUrls[index], 640, 360),
                                                    alt: `${questionLabel} preview`,
                                                    style: getSurveyImageStyle(index),
                                                    loading: "lazy",
                                                    decoding: "async"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1293,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyVisualPlaceholder",
                                                    children: "No image assigned"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1301,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1291,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Image URL",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "url",
                                                        value: config.media.surveyStepImageUrls[index] || '',
                                                        onChange: (event)=>updateSurveyStepImage(index, event.target.value),
                                                        placeholder: "https://..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1306,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1304,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "sliderRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: [
                                                            "X (",
                                                            Math.round(config.media.surveyStepImagePositions[index]?.x || 0),
                                                            ")",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "range",
                                                                min: "-50",
                                                                max: "50",
                                                                value: config.media.surveyStepImagePositions[index]?.x || 0,
                                                                onChange: (event)=>updateSurveyStepImagePosition(index, 'x', event.target.value)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1316,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1314,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: [
                                                            "Y (",
                                                            Math.round(config.media.surveyStepImagePositions[index]?.y || 0),
                                                            ")",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "range",
                                                                min: "-50",
                                                                max: "50",
                                                                value: config.media.surveyStepImagePositions[index]?.y || 0,
                                                                onChange: (event)=>updateSurveyStepImagePosition(index, 'y', event.target.value)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1326,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1324,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1313,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "adminActions",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button secondary",
                                                    onClick: ()=>setOpenStepLibraryPicker((current)=>current === index ? null : index),
                                                    disabled: mediaLibrary.length === 0,
                                                    children: openStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1336,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1335,
                                                columnNumber: 17
                                            }, this),
                                            openStepLibraryPicker === index ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyLibraryPickerGrid",
                                                children: mediaLibrary.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: "No media files found."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1350,
                                                    columnNumber: 23
                                                }, this) : mediaLibrary.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "surveyLibraryPickerItem",
                                                        onClick: ()=>assignSurveyStepImageFromLibrary(index, item.publicUrl),
                                                        children: [
                                                            isVideoUrl(item.publicUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                                src: item.publicUrl,
                                                                muted: true,
                                                                playsInline: true,
                                                                preload: "metadata"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1360,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: getResizedPreviewUrl(item.publicUrl, 260, 146),
                                                                alt: item.name,
                                                                loading: "lazy",
                                                                decoding: "async"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1367,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: item.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1374,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, `step-${index}-${item.path}`, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1353,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1348,
                                                columnNumber: 19
                                            }, this) : null
                                        ]
                                    }, questionLabel, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1289,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1287,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "subCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Registration step images"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1386,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Assign one visual per registration step card. You can upload from your computer or choose from bucket media."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1387,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "surveyStepAssetGrid",
                                children: registrationStepQuestions.map((questionLabel, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "surveyStepAssetCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                children: questionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1391,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyContextFrame",
                                                children: config.media.registrationStepImageUrls?.[index] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: getResizedPreviewUrl(config.media.registrationStepImageUrls[index], 640, 360),
                                                    alt: `${questionLabel} preview`,
                                                    loading: "lazy",
                                                    decoding: "async"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1394,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyVisualPlaceholder",
                                                    children: "No image assigned"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1401,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1392,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Image URL",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "url",
                                                        value: config.media.registrationStepImageUrls?.[index] || '',
                                                        onChange: (event)=>updateRegistrationStepImage(index, event.target.value),
                                                        placeholder: "https://..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1406,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1404,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "adminActions",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "button secondary",
                                                        children: [
                                                            "Upload from computer",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "file",
                                                                accept: "image/*",
                                                                onChange: (event)=>uploadRegistrationStepImage(index, event),
                                                                style: {
                                                                    display: 'none'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1416,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1414,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "button secondary",
                                                        onClick: ()=>setOpenRegistrationStepLibraryPicker((current)=>current === index ? null : index),
                                                        children: openRegistrationStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1423,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1413,
                                                columnNumber: 17
                                            }, this),
                                            openRegistrationStepLibraryPicker === index ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyLibraryPickerGrid",
                                                children: mediaLibrary.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: "No media files found in bucket."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1436,
                                                    columnNumber: 23
                                                }, this) : mediaLibrary.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "surveyLibraryPickerItem",
                                                        onClick: ()=>assignRegistrationStepImageFromLibrary(index, item.publicUrl),
                                                        children: [
                                                            isVideoUrl(item.publicUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                                src: item.publicUrl,
                                                                muted: true,
                                                                playsInline: true,
                                                                preload: "metadata"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1446,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: getResizedPreviewUrl(item.publicUrl, 260, 146),
                                                                alt: item.name,
                                                                loading: "lazy",
                                                                decoding: "async"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1448,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: item.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1455,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, `registration-step-${index}-${item.path}`, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1439,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1434,
                                                columnNumber: 19
                                            }, this) : null
                                        ]
                                    }, questionLabel, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1390,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1388,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1385,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "subCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Upload to bucket for later use"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1467,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Upload files now, then assign them to sections from Media Library."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1468,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: "image/*,video/*",
                                multiple: true,
                                onChange: uploadToLibrary
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1469,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1466,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminPreviewGrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "previewCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Selected phone screenshots"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1474,
                                        columnNumber: 13
                                    }, this),
                                    config.media.levelUpScreenshotUrls.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: "No screenshots selected yet."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1476,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "adminPhoneStage",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "phoneFrame adminPhoneFrame",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "phoneNotch"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1481,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "phoneScreen",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                className: "phoneImage",
                                                                src: getResizedPreviewUrl(activePreviewUrl, 520, 920),
                                                                alt: "Phone render preview",
                                                                style: {
                                                                    width: `${config.media.levelUpScreenshotSize}%`
                                                                },
                                                                loading: "lazy",
                                                                decoding: "async"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1483,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1482,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1480,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1479,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: "Tap a screenshot below to preview it in the phone render."
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1494,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "thumbGrid",
                                                children: config.media.levelUpScreenshotUrls.map((url, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `thumbItem ${activePreviewIndex === index ? 'selected' : ''}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "thumbPreviewBtn",
                                                                onClick: ()=>setActivePreviewIndex(index),
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: getResizedPreviewUrl(url, 280, 380),
                                                                    alt: "Selected screenshot preview",
                                                                    loading: "lazy",
                                                                    decoding: "async"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 1506,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1501,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "thumbActions",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "button secondary",
                                                                    onClick: ()=>removeScreenshotUrl(url),
                                                                    children: "Remove"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 1514,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1513,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, url, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1497,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1495,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1473,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "previewCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Media library"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1526,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "adminActions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "button secondary",
                                                onClick: refreshMediaLibrary,
                                                disabled: loadingLibrary,
                                                children: loadingLibrary ? 'Refreshing...' : 'Refresh library'
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1528,
                                                columnNumber: 15
                                            }, this),
                                            uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Uploading..."
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1531,
                                                columnNumber: 28
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1527,
                                        columnNumber: 13
                                    }, this),
                                    mediaLibrary.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: "No media files found in bucket."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1535,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "adminPhoneStage",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "phoneFrame adminPhoneFrame",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "phoneNotch"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1540,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "phoneScreen",
                                                            children: isVideoUrl(activeLibraryPreviewUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                                className: "phoneImage",
                                                                src: activeLibraryPreviewUrl,
                                                                controls: true,
                                                                playsInline: true,
                                                                preload: "metadata",
                                                                style: {
                                                                    width: `${config.media.levelUpScreenshotSize}%`
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1543,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                className: "phoneImage",
                                                                src: getResizedPreviewUrl(activeLibraryPreviewUrl, 520, 920),
                                                                alt: "Media library phone preview",
                                                                style: {
                                                                    width: `${config.media.levelUpScreenshotSize}%`
                                                                },
                                                                loading: "lazy",
                                                                decoding: "async"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1552,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1541,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1539,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1538,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: "All uploaded media can be previewed in the phone viewport."
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1564,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "thumbGrid",
                                                children: mediaLibrary.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `thumbItem ${activeLibraryPreviewIndex === index ? 'selected' : ''}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "thumbPreviewBtn",
                                                                onClick: ()=>setActiveLibraryPreviewIndex(index),
                                                                children: isVideoUrl(item.publicUrl) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                                    src: item.publicUrl,
                                                                    muted: true,
                                                                    playsInline: true,
                                                                    preload: "metadata"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 1577,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: getResizedPreviewUrl(item.publicUrl, 280, 380),
                                                                    alt: item.name,
                                                                    loading: "lazy",
                                                                    decoding: "async"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 1579,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1571,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "thumbActions",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('welcomeLogoUrl', item.publicUrl),
                                                                        children: "Use as welcome logo"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1588,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('heroImageUrl', item.publicUrl),
                                                                        children: "Use as hero"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1595,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('surveyVideoUrl', item.publicUrl),
                                                                        children: "Use as survey video"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1602,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('surveyStep1FlyerUrl', item.publicUrl),
                                                                        children: "Use as Step 1 flyer"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1609,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('surveyMobileBgUrl', item.publicUrl),
                                                                        children: "Use as survey mobile bg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1616,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>addScreenshotUrl(item.publicUrl),
                                                                        children: "Add to phone"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1623,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateMedia('wechatQrUrl', item.publicUrl),
                                                                        children: "Use as WeChat QR"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1630,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(0, item.publicUrl),
                                                                        children: "Use as Step 1 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1637,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(1, item.publicUrl),
                                                                        children: "Use as Step 2A image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1644,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(2, item.publicUrl),
                                                                        children: "Use as Step 2B image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1651,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(3, item.publicUrl),
                                                                        children: "Use as Step 3 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1658,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(4, item.publicUrl),
                                                                        children: "Use as Step 4 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1665,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateSurveyStepImage(5, item.publicUrl),
                                                                        children: "Use as Step 5 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1672,
                                                                        columnNumber: 24
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateRegistrationStepImage(0, item.publicUrl),
                                                                        children: "Use as Reg Step 1 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1679,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateRegistrationStepImage(1, item.publicUrl),
                                                                        children: "Use as Reg Step 2 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1686,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateRegistrationStepImage(2, item.publicUrl),
                                                                        children: "Use as Reg Step 3 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1693,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>updateRegistrationStepImage(3, item.publicUrl),
                                                                        children: "Use as Reg Step 4 image"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1700,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 1587,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, item.path, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1567,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1565,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1525,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1472,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 1106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Tuition table"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1718,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminGrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Discount end date",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: config.tuition.discountEndDate,
                                        onChange: (event)=>updateTuitionField('discountEndDate', event.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1722,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1720,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Competition Team premium (% over General)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0",
                                        step: "1",
                                        value: config.tuition.bootcampPremiumPct,
                                        onChange: (event)=>updateTuitionField('bootcampPremiumPct', event.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1730,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1728,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Sibling discount (% from 2nd camper)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0",
                                        step: "1",
                                        value: config.tuition.siblingDiscountPct,
                                        onChange: (event)=>updateTuitionField('siblingDiscountPct', event.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1740,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1738,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Discount value label",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: config.tuition.discountDisplayValue,
                                        onChange: (event)=>updateTuitionField('discountDisplayValue', event.target.value),
                                        placeholder: "Example: Save up to $350"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1750,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1748,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Discount code",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: config.tuition.discountCode,
                                        onChange: (event)=>updateTuitionField('discountCode', event.target.value),
                                        placeholder: "Example: SUMMER350"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1758,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1756,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1719,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tuitionTableWrap",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "tuitionTable",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Method"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1769,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Regular"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1770,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Discounted Price"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1771,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Discount Amount"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1772,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Checks"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1773,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1768,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1767,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: [
                                        [
                                            [
                                                'fullWeek',
                                                'Full Week'
                                            ],
                                            [
                                                'fullDay',
                                                'Full Day'
                                            ],
                                            [
                                                'amHalf',
                                                'AM Half Day'
                                            ],
                                            [
                                                'pmHalf',
                                                'PM Half Day'
                                            ],
                                            [
                                                'overnightWeek',
                                                'Overnight Full Week'
                                            ],
                                            [
                                                'overnightDay',
                                                'Overnight Camp Day'
                                            ]
                                        ].map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: label
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1786,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            step: "1",
                                                            value: config.tuition.regular[key],
                                                            onChange: (event)=>updateTuition('regular', key, event.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1788,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1787,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            step: "1",
                                                            value: config.tuition.discount[key],
                                                            onChange: (event)=>updateTuition('discount', key, event.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1797,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1796,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: money(discountAmount(config.tuition.regular[key], config.tuition.discount[key]))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1805,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: `checkCell ${tuitionChecks[key]?.pass ? 'pass' : 'warn'}`,
                                                        children: tuitionChecks[key] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `checkBadge ${tuitionChecks[key].pass ? 'pass' : 'warn'}`,
                                                                    children: tuitionChecks[key].pass ? 'GREEN LIGHT' : 'Needs update'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 1809,
                                                                    columnNumber: 25
                                                                }, this),
                                                                tuitionChecks[key].lines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        children: line
                                                                    }, line, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1813,
                                                                        columnNumber: 27
                                                                    }, this)),
                                                                (tuitionChecks[key].raises || []).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "raiseBox",
                                                                        children: item
                                                                    }, item, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 1816,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "No rule for this row."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 1822,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1806,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1785,
                                                columnNumber: 17
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "Lunch (per day)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1828,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        step: "1",
                                                        value: config.tuition.lunchPrice,
                                                        onChange: (event)=>updateTuitionField('lunchPrice', event.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1830,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1829,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1838,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1839,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "checkCell",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Used in registration step 3 totals."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1841,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1840,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1827,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1776,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1766,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1765,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tuitionTableWrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Competition Team Boot Camp (auto-calculated)"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1849,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: [
                                    "Derived from General prices using +",
                                    Number(config.tuition.bootcampPremiumPct || 0),
                                    "% premium, then rounded up to the nearest $5."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1850,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "tuitionTable",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    children: "Method"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1857,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    children: "Regular (Auto)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1858,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    children: "Discounted Price (Auto)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1859,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    children: "Discount Amount (Auto)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 1860,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1856,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1855,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: [
                                            [
                                                'fullWeek',
                                                'Full Week'
                                            ],
                                            [
                                                'fullDay',
                                                'Full Day'
                                            ],
                                            [
                                                'amHalf',
                                                'AM Half Day'
                                            ],
                                            [
                                                'pmHalf',
                                                'PM Half Day'
                                            ]
                                        ].map(([key, label])=>{
                                            const regularValue = bootcampTuition.regular[key];
                                            const discountValue = bootcampTuition.discount[key];
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: label
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1874,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: money(regularValue)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1875,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: money(discountValue)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1876,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        children: money(discountAmount(regularValue, discountValue))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 1877,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, `boot-${key}`, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1873,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1863,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1854,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1848,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 1717,
                columnNumber: 7
            }, this),
            Object.entries(programMeta).map(([programKey, meta])=>{
                const program = config.programs[programKey];
                const options = weekOptions[programKey];
                const selectedCount = program.selectedWeeks.length;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "card section",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: meta.title
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1893,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: meta.rhythm
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1894,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "adminGrid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    children: [
                                        "Start date",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: program.startDate,
                                            onChange: (event)=>updateProgramDate(programKey, 'startDate', event.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1899,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1897,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    children: [
                                        "End date",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: program.endDate,
                                            onChange: (event)=>updateProgramDate(programKey, 'endDate', event.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1908,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1906,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1896,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "adminActions",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: ()=>selectAllWeeks(programKey),
                                    children: "Select all"
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1917,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: ()=>clearWeeks(programKey),
                                    children: "Clear"
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1920,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        selectedCount,
                                        " selected"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1923,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1916,
                            columnNumber: 13
                        }, this),
                        options.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: "Set a valid start and end date to generate options."
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1927,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "adminWeekList",
                            children: options.map((week)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "weekRow",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: program.selectedWeeks.includes(week.id),
                                            onChange: ()=>toggleWeek(programKey, week.id)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1932,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatWeekLabel"])(week)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 1937,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, week.id, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1931,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 1929,
                            columnNumber: 15
                        }, this)
                    ]
                }, programKey, true, {
                    fileName: "[project]/app/admin/page.jsx",
                    lineNumber: 1892,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Email Journey Builder"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1947,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: 'Configure follow-up email sequence for families who click "I need time to think" on the survey.'
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1948,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminGrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Test recipient email",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        value: testEmail,
                                        onChange: (event)=>setTestEmail(event.target.value),
                                        placeholder: "you@example.com"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1954,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1952,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "adminActions",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: ()=>sendTestEmailForStep(activeJourneyTab),
                                    disabled: sendingTestStep > 0,
                                    children: sendingTestStep === activeJourneyTab + 1 ? 'Sending test...' : `Send Test for Step ${activeJourneyTab + 1}`
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 1962,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1961,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1951,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "journeyGrid",
                        children: emailJourneyBlueprint.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "journeyCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "journeyDay",
                                        children: item.step
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1975,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        children: item.objective
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1976,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "CTA:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1977,
                                                columnNumber: 18
                                            }, this),
                                            " ",
                                            item.cta
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1977,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, item.step, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1974,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1972,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "surveySubTabs",
                        children: config.emailJourney.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: `subTabBtn ${activeJourneyTab === index ? 'active' : ''}`,
                                onClick: ()=>setActiveJourneyTab(index),
                                children: [
                                    "Step ",
                                    index + 1
                                ]
                            }, `${item.dayLabel}-${index}`, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1983,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1981,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "journeyCard adminJourneyCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "journeyDay",
                                children: config.emailJourney[activeJourneyTab]?.dayLabel || ''
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1994,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                children: config.emailJourney[activeJourneyTab]?.title || `Step ${activeJourneyTab + 1}`
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1995,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "adminGrid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        children: [
                                            "Send timing label",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: config.emailJourney[activeJourneyTab]?.dayLabel || '',
                                                onChange: (event)=>updateEmailJourneyStep(activeJourneyTab, 'dayLabel', event.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 1999,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 1997,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        children: [
                                            "Card title",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: config.emailJourney[activeJourneyTab]?.title || '',
                                                onChange: (event)=>updateEmailJourneyStep(activeJourneyTab, 'title', event.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2006,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2004,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "full",
                                        children: [
                                            "Email subject",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: config.emailJourney[activeJourneyTab]?.subject || '',
                                                onChange: (event)=>updateEmailJourneyStep(activeJourneyTab, 'subject', event.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2013,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2011,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "full",
                                        children: [
                                            "Email body draft",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                rows: "4",
                                                value: config.emailJourney[activeJourneyTab]?.body || '',
                                                onChange: (event)=>updateEmailJourneyStep(activeJourneyTab, 'body', event.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2020,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2018,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 1996,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 1993,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "journeyCard adminJourneyCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "AI Reply Assistant"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2030,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Paste an inbound email and generate a draft reply you can edit before sending."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2031,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "adminGrid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        children: [
                                            "Selected reply",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: selectedReplyId ? `Reply #${selectedReplyId}` : 'None selected',
                                                disabled: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2035,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2033,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "adminActions",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "button secondary",
                                            onClick: markReplyHandled,
                                            disabled: !selectedReplyId,
                                            children: "Mark selected reply handled"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 2041,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2040,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2032,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "adminGrid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        children: [
                                            "Parent name (optional)",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: aiReplyInput.customerName,
                                                onChange: (event)=>setAiReplyInput((current)=>({
                                                            ...current,
                                                            customerName: event.target.value
                                                        })),
                                                placeholder: "Parent name"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2049,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2047,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        children: [
                                            "Tone",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: aiReplyInput.tone,
                                                onChange: (event)=>setAiReplyInput((current)=>({
                                                            ...current,
                                                            tone: event.target.value
                                                        })),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "professional",
                                                        children: "Professional"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2063,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "warm",
                                                        children: "Warm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2064,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "direct",
                                                        children: "Direct"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2065,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2059,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2057,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "full",
                                        children: [
                                            "Subject (optional)",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: aiReplyInput.subject,
                                                onChange: (event)=>setAiReplyInput((current)=>({
                                                            ...current,
                                                            subject: event.target.value
                                                        })),
                                                placeholder: "Reply subject"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2070,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2068,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "full",
                                        children: [
                                            "Inbound email text",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                rows: "5",
                                                value: aiReplyInput.message,
                                                onChange: (event)=>setAiReplyInput((current)=>({
                                                            ...current,
                                                            message: event.target.value
                                                        })),
                                                placeholder: "Paste parent email here..."
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2080,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2078,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2046,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "adminActions",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: generateAiReplyDraft,
                                    disabled: aiReplyLoading,
                                    children: aiReplyLoading ? 'Generating...' : selectedReplyId ? 'Generate draft for selected reply' : 'Generate AI reply draft'
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 2091,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2090,
                                columnNumber: 11
                            }, this),
                            aiReplyDraft ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "full",
                                children: [
                                    "Draft reply",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        rows: "7",
                                        value: aiReplyDraft,
                                        onChange: (event)=>setAiReplyDraft(event.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2103,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2101,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2029,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 1946,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Testimonials"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Manage student stories shown on the testimonials page."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminActions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary",
                                onClick: addTestimonial,
                                children: "Add testimonial"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "ghostBtn",
                                href: "/testimonials",
                                target: "_blank",
                                rel: "noreferrer",
                                children: "Preview testimonials page"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2116,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "journeyGrid",
                        children: config.testimonials.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: "No testimonials yet."
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 2122,
                            columnNumber: 13
                        }, this) : config.testimonials.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "journeyCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "adminActions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "journeyDay",
                                                children: [
                                                    "Story ",
                                                    index + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2127,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "button secondary",
                                                onClick: ()=>removeTestimonial(index),
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2128,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2126,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "adminGrid",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Student name",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: item.studentName || '',
                                                        onChange: (event)=>updateTestimonial(index, 'studentName', event.target.value),
                                                        placeholder: "Ethan, age 9"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2139,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2137,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Headline",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: item.headline || '',
                                                        onChange: (event)=>updateTestimonial(index, 'headline', event.target.value),
                                                        placeholder: "From shy beginner to confident performer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2147,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2145,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "full",
                                                children: [
                                                    "Story",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: "4",
                                                        value: item.story || '',
                                                        onChange: (event)=>updateTestimonial(index, 'story', event.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2155,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2153,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "full",
                                                children: [
                                                    "Outcome",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: "2",
                                                        value: item.outcome || '',
                                                        onChange: (event)=>updateTestimonial(index, 'outcome', event.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2163,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2161,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2136,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, `testimonial-${index}`, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2125,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 2109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Email Tracking"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Track who has been sent emails, delivery activity, and incoming replies."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2178,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: [
                            "Automation endpoint: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "POST /api/email/auto-reply"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2182,
                                columnNumber: 32
                            }, this),
                            " with header ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "x-cron-secret"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2182,
                                columnNumber: 84
                            }, this),
                            ". Use cron to run every 5-10 minutes."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminActions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary",
                                onClick: refreshEmailTracking,
                                disabled: loadingEmailTracking,
                                children: loadingEmailTracking ? 'Refreshing...' : 'Refresh tracking'
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2186,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Filter replies by email",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: replyFilterEmail,
                                        onChange: (event)=>setReplyFilterEmail(event.target.value),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "All emails"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2197,
                                                columnNumber: 15
                                            }, this),
                                            Array.from(new Set(emailReplies.map((item)=>item.email || item.from_email).filter(Boolean))).map((email)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: email,
                                                    children: email
                                                }, email, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2200,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2196,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2194,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Unread replies: ",
                                    emailReplies.filter((item)=>item.is_unread).length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2207,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminPreviewGrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "previewCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Journey runs"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2212,
                                        columnNumber: 13
                                    }, this),
                                    emailJourneyRuns.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: "No runs yet."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2214,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tuitionTableWrap",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "tuitionTable",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Email"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2220,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2221,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Step"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2222,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Last Sent"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2223,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2219,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2218,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: emailJourneyRuns.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.email
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2229,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.status || '-'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2230,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.current_step || '-'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2231,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.last_sent_at ? new Date(row.last_sent_at).toLocaleString() : '-'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2232,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, `run-${row.id}`, true, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2228,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2226,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 2217,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2216,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2211,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: "previewCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Replies"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2242,
                                        columnNumber: 13
                                    }, this),
                                    filteredEmailReplies.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: "No replies yet."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2244,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tuitionTableWrap",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "tuitionTable",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Action"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2250,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "From"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2251,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Subject"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2252,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "AI Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2253,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Received"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2254,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Unread"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/admin/page.jsx",
                                                                lineNumber: 2255,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2249,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2248,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: filteredEmailReplies.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: selectedReplyId === row.id ? 'selectedReplyRow' : '',
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "button secondary",
                                                                        onClick: ()=>selectReplyForAssistant(row),
                                                                        children: "Select"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/admin/page.jsx",
                                                                        lineNumber: 2262,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2261,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.from_email || row.email
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2266,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.subject || '(No subject)'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2267,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.ai_status || 'pending'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2268,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.received_at ? new Date(row.received_at).toLocaleString() : '-'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2269,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: row.is_unread ? 'Yes' : 'No'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/page.jsx",
                                                                    lineNumber: 2270,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, `reply-${row.id}`, true, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2260,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2258,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 2247,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 2246,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2241,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "previewCard",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Recent send/delivery events"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2281,
                                columnNumber: 11
                            }, this),
                            emailEvents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "No events yet."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2283,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tuitionTableWrap",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "tuitionTable",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Email"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2289,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Step"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2290,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Event"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2291,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "When"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/page.jsx",
                                                        lineNumber: 2292,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/page.jsx",
                                                lineNumber: 2288,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 2287,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: emailEvents.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.email
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2298,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.step_number || '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2299,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.event_type
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2300,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.event_at ? new Date(row.event_at).toLocaleString() : '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/page.jsx",
                                                            lineNumber: 2301,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, `event-${row.id}`, true, {
                                                    fileName: "[project]/app/admin/page.jsx",
                                                    lineNumber: 2297,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 2295,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 2286,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2285,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2280,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 2176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminFooter",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button",
                                onClick: saveChanges,
                                disabled: saving,
                                children: saving ? 'Saving...' : 'Save settings'
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2313,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary",
                                onClick: signOut,
                                children: "Sign out"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2316,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "ghostBtn",
                                href: "/",
                                children: "Back to site"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2319,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2312,
                        columnNumber: 9
                    }, this),
                    savedMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "message",
                        children: savedMessage
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2323,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 2311,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "adminFloatingSaveBar",
                role: "region",
                "aria-label": "Save admin settings",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminFloatingSaveMeta",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Save all settings"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2328,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: savedMessage || (saving ? 'Saving changes...' : 'Unsaved edits on this page')
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 2329,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2327,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button",
                        onClick: saveChanges,
                        disabled: saving,
                        children: saving ? 'Saving...' : 'Save all'
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 2331,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 2326,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/page.jsx",
        lineNumber: 1095,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e4611e2f._.js.map