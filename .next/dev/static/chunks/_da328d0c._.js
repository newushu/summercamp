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
"[project]/app/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdminApi.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const dayKeys = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri'
];
const nextMode = {
    NONE: 'FULL',
    FULL: 'AM',
    AM: 'PM',
    PM: 'NONE'
};
const registrationSteps = [
    {
        id: 1,
        title: 'Family & campers'
    },
    {
        id: 2,
        title: 'Camp weeks & times'
    },
    {
        id: 3,
        title: 'Lunch days'
    },
    {
        id: 4,
        title: 'Review & submit'
    }
];
const MAX_CAMPERS = 6;
const REGISTRATION_DRAFT_KEY = 'new-england-wushu-registration-draft-v1';
const SURVEY_DRAFT_KEY = 'new-england-wushu-survey-draft-v1';
const SUPPORT_EMAIL = 'info@newushu.com';
const surveyGoals = [
    {
        value: 'fun',
        label: 'Fun',
        zhLabel: '趣味'
    },
    {
        value: 'exercise',
        label: 'Exercise',
        zhLabel: '锻炼'
    },
    {
        value: 'competition',
        label: 'Competition',
        zhLabel: '竞赛'
    },
    {
        value: 'social/teamwork/friends',
        label: 'Social / Teamwork / Friends',
        zhLabel: '社交 / 团队 / 友谊'
    }
];
const surveyActivities = [
    {
        value: 'team-games',
        label: 'Team games',
        zhLabel: '团队游戏'
    },
    {
        value: 'movement-drills',
        label: 'Movement drills',
        zhLabel: '动作训练'
    },
    {
        value: 'flexibility',
        label: 'Flexibility training',
        zhLabel: '柔韧训练'
    },
    {
        value: 'performance',
        label: 'Performance / showcase',
        zhLabel: '表演 / 展示'
    },
    {
        value: 'conditioning',
        label: 'Fitness conditioning',
        zhLabel: '体能强化'
    },
    {
        value: 'partner-work',
        label: 'Partner work',
        zhLabel: '搭档协作'
    }
];
const SURVEY_TOTAL_STEPS = 7;
const perks = [
    {
        title: 'Daily training tracks',
        text: 'Age-based groups for movement, drills, confidence, and skill progress.'
    },
    {
        title: 'Certified coaches',
        text: 'Experienced instructors with first-aid awareness and youth coaching focus.'
    },
    {
        title: 'Weekly showcase',
        text: 'Campers demonstrate progress every Friday in a short family showcase.'
    }
];
const campTypes = [
    {
        name: 'General Camp',
        audience: 'General curriculum, beginner friendly, ages 3+',
        details: 'Perfect first camp experience with movement, balance, coordination, and fun fundamentals.',
        note: 'Best fit for new students and families exploring Wushu.'
    },
    {
        name: 'Competition Team Boot Camp',
        audience: 'For Taolu team and serious competition-track students',
        details: 'Focused technical training, routine polish, performance quality, and competition mindset.',
        note: 'Two weeks required for students who want to join the fall competition team.'
    },
    {
        name: 'Overnight Camp',
        audience: 'Immersive training and camp-life experience',
        details: 'Great for building friendships with intensive Wushu training, a fun camp atmosphere, and scheduled outings across all 7 days.',
        note: 'Limited spots and always a hit.'
    }
];
const schedule = [
    {
        day: 'Monday',
        activity: 'Footwork foundations + team games'
    },
    {
        day: 'Tuesday',
        activity: 'Technique stations + confidence drills'
    },
    {
        day: 'Wednesday',
        activity: 'Agility circuits + partner practice'
    },
    {
        day: 'Thursday',
        activity: 'Mini challenges + supervised sparring'
    },
    {
        day: 'Friday',
        activity: 'Showcase prep + parent performance'
    }
];
const levelUpFeatures = [
    'Camp leaders and coaches track each camper directly in the Level Up app.',
    'Daily logs with photos and videos keep parents in the loop.',
    'Parents can conveniently order lunch in the app.',
    'A weekly camp schedule is shown in-app so families know exactly what is happening.',
    'Parents can see day-to-day activity and clear progress over time.'
];
const campGalleryCaptions = [
    {
        en: 'Every week blends high-energy training, confidence-building, and summer fun.',
        zh: '每周都结合高能训练、自信培养与夏日乐趣。'
    },
    {
        en: 'Campers build real skills while making friends through team challenges.',
        zh: '营员在团队挑战中提升真实技能，也结交新朋友。'
    },
    {
        en: 'Daily movement, structure, and coaching help kids grow fast and stay motivated.',
        zh: '每日训练节奏与教练指导，帮助孩子快速成长并持续保持动力。'
    },
    {
        en: 'From first-timers to advanced students, every camper trains at the right level.',
        zh: '从零基础到进阶学员，每位营员都在适合自己的层级训练。'
    },
    {
        en: 'Weekly showcase moments turn progress into proud memories for families.',
        zh: '每周展示把成长转化为家庭共同见证的高光时刻。'
    },
    {
        en: 'A summer they enjoy now, with confidence and discipline that lasts beyond camp.',
        zh: '一个当下快乐、长期受益的夏天，自信与自律延续到营地之外。'
    }
];
const testimonialTranslationMap = {
    'Ethan, age 9': 'Ethan，9岁',
    'From shy beginner to confident performer': '从害羞新手到自信展示者',
    Confidence: '自信',
    Flexibility: '柔韧性',
    Showcase: '展示',
    'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.': 'Ethan在没有武术基础的情况下参加了普通营。经过两周系统训练，他的柔韧性、专注力和自信明显提升，并在周五家庭展示中自信完成表演。',
    'Parent reported stronger confidence, better discipline at home, and excitement to continue training.': '家长反馈：孩子更有自信，居家纪律更好，也更期待继续训练。',
    'Ava, age 8': 'Ava，8岁',
    'Lunch was easy, and every day felt meaningful': '午餐安排省心，每一天都很有收获',
    'Daily Routine': '每日节奏',
    'Skill Growth': '技能成长',
    'Coach Support': '教练支持',
    'Ava attended General Camp for three weeks. Her family appreciated the flexible lunch planning and clear weekly structure, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.': 'Ava参加了三周普通营。家长很认可灵活的午餐安排和清晰的每周结构；Ava每天回家都会分享团队游戏、新学技能，以及和教练在一起有多开心。',
    'Parent shared that planning lunches felt manageable, daily communication was clear, and Ava asked to come back next summer.': '家长表示午餐安排轻松可管理、每日沟通很清晰，而且Ava已经主动要求明年夏天继续参加。',
    'Noah, age 10': 'Noah，10岁',
    'Coaches who care and a reward system kids love': '用心教练团队，加上孩子超喜欢的奖励体系',
    Motivation: '积极性',
    Discipline: '纪律',
    Teamwork: '团队协作',
    'Noah joined General Camp to stay active and build confidence. The coaches were encouraging and patient, and he was motivated by the camp award system that recognized effort, teamwork, and progress all week.': 'Noah参加普通营是为了增强体能和自信。教练耐心且鼓励性强，而营地奖励体系会认可努力、协作和进步，让他整周都很有动力。',
    'Parent reported better confidence, strong connection with coaches, and real excitement about training because camp felt both supportive and fun.': '家长反馈：孩子自信心更强，与教练关系很好，也因为营地既有支持感又有趣而对训练充满热情。',
    'Mia, age 7': 'Mia，7岁',
    'From first-week nerves to independent confidence': '从第一周紧张到独立自信',
    'First-Time Camper': '首次参营',
    Independence: '独立性',
    'Mia started camp feeling shy about joining group activities. By the second week, she was volunteering for partner drills, practicing at home, and proudly showing new techniques during Friday showcase.': 'Mia刚开始参加营地时，对团队活动有些害羞。到第二周，她开始主动参与搭档训练、在家练习，并在周五展示中自豪地展示新动作。',
    'Parent reported a major confidence jump, better listening at home, and stronger willingness to try new challenges.': '家长反馈：孩子自信明显提升，在家更愿意倾听，也更愿意尝试新挑战。',
    'Lucas, age 11': 'Lucas，11岁',
    'Athletic focus and visible weekly progress': '运动能力聚焦与每周可见进步',
    'Athletic Development': '运动能力提升',
    Focus: '专注力',
    Consistency: '持续性',
    'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.': 'Lucas参加营地是为了提升多项运动所需的协调性和体能。结构化训练帮助他提升平衡、速度和控制力，并通过清晰的每周目标持续投入。',
    'Parent said he became more focused, looked forward to training each day, and showed measurable improvement by week three.': '家长表示他变得更专注、每天都期待训练，并在第三周就看到了可衡量的提升。'
};
function pluralize(label, count) {
    return `${count} ${label}${count === 1 ? '' : 's'}`;
}
function makeId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2, 10)}`;
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
        lunchConfirmedNone: false
    };
}
function isStudentComplete(student) {
    return Boolean(student.fullName.trim() && parseDateLocal(student.dob) && student.allergies.trim() && student.medication.trim() && student.previousInjury.trim() && student.healthNotes.trim());
}
function readRegistrationDraft() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = window.localStorage.getItem(REGISTRATION_DRAFT_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw);
    } catch  {
        return null;
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
        lunchConfirmedNone: Boolean(student?.lunchConfirmedNone)
    };
}
function parseDateLocal(input) {
    if (!input) {
        return null;
    }
    const raw = String(input).trim();
    if (!raw) {
        return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const date = new Date(`${raw}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, '$1').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const hasYear = /\b\d{4}\b/.test(cleaned);
    const withYear = hasYear ? cleaned : `${cleaned} ${new Date().getFullYear()}`;
    const parsed = new Date(withYear);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}
function getCountdownParts(targetDate, nowDate) {
    const diffMs = Math.max(0, targetDate.getTime() - nowDate.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds % 86400 / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    return {
        days,
        hours,
        minutes,
        seconds
    };
}
function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}
function isoDate(date) {
    return date.toISOString().slice(0, 10);
}
function calcAge(dob) {
    const birth = parseDateLocal(dob);
    if (!birth) {
        return 0;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) {
        age -= 1;
    }
    return Math.max(age, 0);
}
function splitName(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return {
            firstName: 'Camper',
            lastName: 'Unknown'
        };
    }
    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: 'Student'
        };
    }
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
    };
}
function getWeekDays(weekStartIso, labels = dayKeys) {
    const start = parseDateLocal(weekStartIso);
    if (!start) {
        return [];
    }
    return labels.map((key, index)=>({
            key,
            date: isoDate(addDays(start, index))
        }));
}
function getStudentSummary(student) {
    const general = {
        fullWeeks: 0,
        fullDays: 0,
        amDays: 0,
        pmDays: 0
    };
    const bootcamp = {
        fullWeeks: 0,
        fullDays: 0,
        amDays: 0,
        pmDays: 0
    };
    for (const entry of Object.values(student.schedule || {})){
        const keys = dayKeys;
        const modes = keys.map((day)=>entry.days?.[day] || 'NONE');
        const fullWeek = modes.every((mode)=>mode === 'FULL');
        const bucket = entry.campType === 'bootcamp' ? bootcamp : general;
        if (fullWeek && entry.programKey !== 'overnight') {
            bucket.fullWeeks += 1;
            continue;
        }
        for (const mode of modes){
            if (mode === 'FULL') {
                bucket.fullDays += 1;
            } else if (mode === 'AM') {
                bucket.amDays += 1;
            } else if (mode === 'PM') {
                bucket.pmDays += 1;
            }
        }
    }
    const lunchCount = Object.values(student.lunch || {}).filter(Boolean).length;
    return {
        general,
        bootcamp,
        lunchCount
    };
}
function getLunchWeeksForStudent(student, weeksById) {
    const rows = [];
    for (const [weekId, entry] of Object.entries(student.schedule || {})){
        const week = weeksById[weekId];
        if (!week || week.programKey === 'overnight') {
            continue;
        }
        const selectedDays = [];
        for (const day of week.days){
            const mode = entry.days?.[day.key] || 'NONE';
            if (mode === 'NONE') {
                continue;
            }
            selectedDays.push({
                dayKey: day.key,
                date: day.date,
                mode,
                key: `${weekId}:${day.key}`
            });
        }
        if (selectedDays.length > 0) {
            rows.push({
                weekId,
                week,
                selectedDays
            });
        }
    }
    return rows.sort((a, b)=>a.week.start.localeCompare(b.week.start));
}
function escapeHtml(value) {
    return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function getTestimonialHighlights(item) {
    if (!item) {
        return [];
    }
    const explicit = Array.isArray(item.highlights) ? item.highlights.map((value)=>typeof value === 'string' ? value.trim() : '').filter(Boolean) : [];
    if (explicit.length > 0) {
        return explicit.slice(0, 4);
    }
    if (typeof item.headline === 'string' && item.headline.trim()) {
        return [
            item.headline.trim()
        ];
    }
    return [];
}
function startOfWeekSunday(date) {
    const next = new Date(date);
    next.setDate(next.getDate() - next.getDay());
    return next;
}
function endOfWeekSaturday(date) {
    const next = new Date(date);
    next.setDate(next.getDate() + (6 - next.getDay()));
    return next;
}
function getWeekSelectionSummary(entry, week) {
    if (!entry || !week) {
        return '';
    }
    const weekDayKeys = week.days.map((day)=>day.key);
    const fullWeekSelected = weekDayKeys.every((day)=>(entry.days?.[day] || 'NONE') === 'FULL');
    if (fullWeekSelected) {
        return 'Registered: Full Week';
    }
    const counts = {
        FULL: 0,
        AM: 0,
        PM: 0
    };
    for (const day of weekDayKeys){
        const mode = entry.days?.[day] || 'NONE';
        if (mode !== 'NONE') {
            counts[mode] += 1;
        }
    }
    const selectedDayTotal = counts.FULL + counts.AM + counts.PM;
    if (selectedDayTotal === 0) {
        return '';
    }
    const parts = [];
    if (counts.FULL > 0) {
        parts.push(pluralize('Full Day', counts.FULL));
    }
    if (counts.AM > 0) {
        parts.push(pluralize('AM Day', counts.AM));
    }
    if (counts.PM > 0) {
        parts.push(pluralize('PM Day', counts.PM));
    }
    return `Registered: ${pluralize('Day', selectedDayTotal)}${parts.length ? ` (${parts.join(', ')})` : ''}`;
}
function currency(amount) {
    return `$${Number(amount || 0).toFixed(2)}`;
}
function roundUpToFive(value) {
    const next = Math.ceil(Number(value || 0) / 5) * 5;
    return Number.isFinite(next) ? Math.max(0, next) : 0;
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
function getDefaultSurveyData() {
    return {
        contactEmail: '',
        camperCount: '1',
        camperAges: [
            ''
        ],
        hasSports: '',
        sportsList: '',
        noSportsPriority: [],
        hasMartial: '',
        martialYears: '',
        martialMonths: '',
        goals: [],
        activityInterests: [],
        lunchInterest: '',
        registrationIntent: ''
    };
}
function readSurveyDraft() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const nav = window.performance?.getEntriesByType?.('navigation')?.[0];
        if (nav && nav.type === 'reload') {
            window.localStorage.removeItem(SURVEY_DRAFT_KEY);
            return getDefaultSurveyData();
        }
        const raw = window.localStorage.getItem(SURVEY_DRAFT_KEY);
        if (!raw) {
            return getDefaultSurveyData();
        }
        const parsed = JSON.parse(raw);
        return {
            ...getDefaultSurveyData(),
            ...parsed,
            noSportsPriority: Array.isArray(parsed?.noSportsPriority) ? parsed.noSportsPriority.slice(0, 3) : [],
            camperAges: Array.isArray(parsed?.camperAges) ? parsed.camperAges : [
                ''
            ],
            goals: Array.isArray(parsed?.goals) ? parsed.goals : [],
            activityInterests: Array.isArray(parsed?.activityInterests) ? parsed.activityInterests : []
        };
    } catch  {
        return getDefaultSurveyData();
    }
}
function HomePage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const isRegistrationRoute = pathname === '/register';
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('en');
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [stepDirection, setStepDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('next');
    const [countdownNow, setCountdownNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "HomePage.useState": ()=>new Date()
    }["HomePage.useState"]);
    const [isMobileViewport, setIsMobileViewport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDiscountCollapsed, setIsDiscountCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [overnightRequestOption, setOvernightRequestOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('fullWeek');
    const [activeStudentId, setActiveStudentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedStudentId, setExpandedStudentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedWeekKey, setExpandedWeekKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedLunchWeekKey, setExpandedLunchWeekKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [scheduleCopySourceId, setScheduleCopySourceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [lunchCopySourceId, setLunchCopySourceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [helpWeekKey, setHelpWeekKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [levelUpSlideIndex, setLevelUpSlideIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [slideDirection, setSlideDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('next');
    const [entryMode, setEntryMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "HomePage.useState": ()=>{
            if (isRegistrationRoute) {
                return 'register';
            }
            if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.location.hash === '#camp-info') {
                return 'register';
            }
            return '';
        }
    }["HomePage.useState"]);
    const [marketingNeed, setMarketingNeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('confidence');
    const [marketingFlowIndex, setMarketingFlowIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [testimonialIndex, setTestimonialIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [campGalleryIndex, setCampGalleryIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [campGalleryDirection, setCampGalleryDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('next');
    const [summaryExpanded, setSummaryExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [summaryOverlayOpen, setSummaryOverlayOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [summaryOverlayHtml, setSummaryOverlayHtml] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [submittedRegistrationSnapshot, setSubmittedRegistrationSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [registrationDiscountClaimed, setRegistrationDiscountClaimed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [surveyStep, setSurveyStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [surveyDirection, setSurveyDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('next');
    const [surveyMessage, setSurveyMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [savingSurveyProfile, setSavingSurveyProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [surveyData, setSurveyData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        ...readSurveyDraft()
    });
    const [contactForm, setContactForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        email: '',
        message: ''
    });
    const [contactMessage, setContactMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [adminConfig, setAdminConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"]);
    const [draftReady, setDraftReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [registration, setRegistration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        contactEmail: '',
        contactPhone: '',
        students: [
            createStudent('student-1')
        ]
    });
    const registrationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const surveyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const summaryIframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const slideTouchStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const campGalleryTouchStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const missingConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[missingConfig]": ()=>!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseEnabled"]
    }["HomePage.useMemo[missingConfig]"], []);
    const generalWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[generalWeeks]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSelectedWeeks"])('general', adminConfig.programs.general)
    }["HomePage.useMemo[generalWeeks]"], [
        adminConfig.programs.general
    ]);
    const bootcampWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[bootcampWeeks]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSelectedWeeks"])('bootcamp', adminConfig.programs.bootcamp)
    }["HomePage.useMemo[bootcampWeeks]"], [
        adminConfig.programs.bootcamp
    ]);
    const overnightWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[overnightWeeks]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSelectedWeeks"])('overnight', adminConfig.programs.overnight)
    }["HomePage.useMemo[overnightWeeks]"], [
        adminConfig.programs.overnight
    ]);
    const featuredTestimonials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[featuredTestimonials]": ()=>{
            const incoming = Array.isArray(adminConfig.testimonials) ? adminConfig.testimonials : [];
            const merged = [
                ...incoming
            ];
            for (const fallback of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAdminConfig"].testimonials){
                const duplicate = merged.some({
                    "HomePage.useMemo[featuredTestimonials].duplicate": (item)=>item?.studentName === fallback.studentName && item?.headline === fallback.headline
                }["HomePage.useMemo[featuredTestimonials].duplicate"]);
                if (!duplicate) {
                    merged.push(fallback);
                }
            }
            return merged.slice(0, 5);
        }
    }["HomePage.useMemo[featuredTestimonials]"], [
        adminConfig.testimonials
    ]);
    const testimonialCount = featuredTestimonials.length;
    const normalizedTestimonialIndex = testimonialCount > 0 ? (testimonialIndex % testimonialCount + testimonialCount) % testimonialCount : 0;
    const activeTestimonial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[activeTestimonial]": ()=>{
            if (testimonialCount === 0) {
                return null;
            }
            return featuredTestimonials[normalizedTestimonialIndex];
        }
    }["HomePage.useMemo[activeTestimonial]"], [
        featuredTestimonials,
        normalizedTestimonialIndex,
        testimonialCount
    ]);
    const activeTestimonialHighlights = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[activeTestimonialHighlights]": ()=>getTestimonialHighlights(activeTestimonial)
    }["HomePage.useMemo[activeTestimonialHighlights]"], [
        activeTestimonial
    ]);
    const registrationWeeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[registrationWeeks]": ()=>{
            const dayCampMap = new Map();
            for (const week of generalWeeks){
                const id = `daycamp:${week.start}`;
                dayCampMap.set(id, {
                    id,
                    start: week.start,
                    end: week.end,
                    programKey: 'daycamp',
                    programLabel: 'Camp Week',
                    days: getWeekDays(week.start),
                    availableCampTypes: [
                        'general'
                    ]
                });
            }
            for (const week of bootcampWeeks){
                const id = `daycamp:${week.start}`;
                const existing = dayCampMap.get(id);
                if (existing) {
                    existing.availableCampTypes = existing.availableCampTypes.includes('bootcamp') ? existing.availableCampTypes : [
                        ...existing.availableCampTypes,
                        'bootcamp'
                    ];
                } else {
                    dayCampMap.set(id, {
                        id,
                        start: week.start,
                        end: week.end,
                        programKey: 'daycamp',
                        programLabel: 'Camp Week',
                        days: getWeekDays(week.start),
                        availableCampTypes: [
                            'bootcamp'
                        ]
                    });
                }
            }
            const mappedDayCamp = Array.from(dayCampMap.values()).sort({
                "HomePage.useMemo[registrationWeeks].mappedDayCamp": (a, b)=>a.start.localeCompare(b.start)
            }["HomePage.useMemo[registrationWeeks].mappedDayCamp"]);
            return mappedDayCamp;
        }
    }["HomePage.useMemo[registrationWeeks]"], [
        bootcampWeeks,
        generalWeeks
    ]);
    const weeksById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[weeksById]": ()=>{
            const byId = {};
            for (const week of registrationWeeks){
                byId[week.id] = week;
            }
            return byId;
        }
    }["HomePage.useMemo[weeksById]"], [
        registrationWeeks
    ]);
    const phoneScreenshots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[phoneScreenshots]": ()=>{
            if (adminConfig.media.levelUpScreenshotUrls.length > 0) {
                return adminConfig.media.levelUpScreenshotUrls;
            }
            if (adminConfig.media.levelUpImageUrl) {
                return [
                    adminConfig.media.levelUpImageUrl
                ];
            }
            return [];
        }
    }["HomePage.useMemo[phoneScreenshots]"], [
        adminConfig.media.levelUpImageUrl,
        adminConfig.media.levelUpScreenshotUrls
    ]);
    const isZh = language === 'zh';
    const text = (en, zh)=>isZh ? zh : en;
    const campGalleryItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[campGalleryItems]": ()=>{
            const surveyImages = Array.isArray(adminConfig.media.surveyStepImageUrls) ? adminConfig.media.surveyStepImageUrls : [];
            return [
                {
                    src: (adminConfig.media.heroImageUrl || '').trim(),
                    slot: isZh ? '营地主视觉' : 'Hero Camp Moment'
                },
                {
                    src: (surveyImages[0] || '').trim(),
                    slot: isZh ? '训练亮点' : 'Training Highlights'
                },
                {
                    src: (surveyImages[1] || '').trim(),
                    slot: isZh ? '团队与友谊' : 'Teamwork & Friends'
                },
                {
                    src: (surveyImages[2] || '').trim(),
                    slot: isZh ? '每周展示' : 'Weekly Showcase'
                }
            ];
        }
    }["HomePage.useMemo[campGalleryItems]"], [
        adminConfig.media.heroImageUrl,
        adminConfig.media.surveyStepImageUrls,
        isZh
    ]);
    const campGalleryCount = campGalleryItems.length;
    const normalizedCampGalleryIndex = campGalleryCount > 0 ? (campGalleryIndex % campGalleryCount + campGalleryCount) % campGalleryCount : 0;
    const activeCampGalleryItem = campGalleryCount > 0 ? campGalleryItems[normalizedCampGalleryIndex] : null;
    const previousCampGalleryItem = campGalleryCount > 1 ? campGalleryItems[(normalizedCampGalleryIndex - 1 + campGalleryCount) % campGalleryCount] : activeCampGalleryItem;
    const nextCampGalleryItem = campGalleryCount > 1 ? campGalleryItems[(normalizedCampGalleryIndex + 1) % campGalleryCount] : activeCampGalleryItem;
    const activeCampGalleryCaption = campGalleryCaptions[normalizedCampGalleryIndex % campGalleryCaptions.length];
    const levelUpSlideCount = Math.max(phoneScreenshots.length, levelUpFeatures.length, 1);
    const activeLevelUpFeature = levelUpFeatures[levelUpSlideIndex % levelUpFeatures.length];
    const activeLevelUpScreenshot = phoneScreenshots.length > 0 ? phoneScreenshots[levelUpSlideIndex % phoneScreenshots.length] : '';
    const summaries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[summaries]": ()=>registration.students.map({
                "HomePage.useMemo[summaries]": (student)=>({
                        student,
                        summary: getStudentSummary(student)
                    })
            }["HomePage.useMemo[summaries]"])
    }["HomePage.useMemo[summaries]"], [
        registration.students
    ]);
    const summaryDigest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[summaryDigest]": ()=>{
            const totalCampDays = summaries.reduce({
                "HomePage.useMemo[summaryDigest].totalCampDays": (acc, item)=>{
                    const summary = item.summary;
                    return acc + summary.general.fullWeeks * 5 + summary.general.fullDays + summary.general.amDays + summary.general.pmDays + summary.bootcamp.fullWeeks * 5 + summary.bootcamp.fullDays + summary.bootcamp.amDays + summary.bootcamp.pmDays;
                }
            }["HomePage.useMemo[summaryDigest].totalCampDays"], 0);
            const totalLunchDays = summaries.reduce({
                "HomePage.useMemo[summaryDigest].totalLunchDays": (acc, item)=>acc + item.summary.lunchCount
            }["HomePage.useMemo[summaryDigest].totalLunchDays"], 0);
            return {
                totalCampDays,
                totalLunchDays
            };
        }
    }["HomePage.useMemo[summaryDigest]"], [
        summaries
    ]);
    const discountActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[discountActive]": ()=>{
            const end = parseDateLocal(adminConfig.tuition.discountEndDate);
            if (!end) {
                return false;
            }
            const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
            return countdownNow.getTime() <= endDateTime.getTime();
        }
    }["HomePage.useMemo[discountActive]"], [
        adminConfig.tuition.discountEndDate,
        countdownNow
    ]);
    const discountCountdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[discountCountdown]": ()=>{
            const end = parseDateLocal(adminConfig.tuition.discountEndDate);
            if (!end) {
                return null;
            }
            const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
            if (countdownNow.getTime() > endDateTime.getTime()) {
                return null;
            }
            const parts = getCountdownParts(endDateTime, countdownNow);
            return {
                ...parts,
                endLabel: end.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            };
        }
    }["HomePage.useMemo[discountCountdown]"], [
        adminConfig.tuition.discountEndDate,
        countdownNow
    ]);
    const overnightPricingRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[overnightPricingRows]": ()=>{
            const regular = adminConfig.tuition.regular;
            const discounted = adminConfig.tuition.discount;
            const rows = [
                {
                    key: 'fullWeek',
                    label: 'Overnight Full Week',
                    regular: Number(regular.overnightWeek || 0),
                    discounted: Number(discounted.overnightWeek || 0)
                },
                {
                    key: 'fullDay',
                    label: 'Overnight Full Day',
                    regular: Number(regular.overnightDay || 0),
                    discounted: Number(discounted.overnightDay || 0)
                }
            ];
            return rows.map({
                "HomePage.useMemo[overnightPricingRows]": (row)=>{
                    const normalizedDiscounted = row.discounted > 0 ? row.discounted : row.regular;
                    const effective = discountActive ? Math.min(row.regular, normalizedDiscounted) : row.regular;
                    const discountAmount = Math.max(0, row.regular - effective);
                    return {
                        ...row,
                        effective,
                        discountAmount
                    };
                }
            }["HomePage.useMemo[overnightPricingRows]"]);
        }
    }["HomePage.useMemo[overnightPricingRows]"], [
        adminConfig.tuition,
        discountActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            let active = true;
            async function syncConfig() {
                const { data } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAdminConfigFromSupabase"])();
                if (active) {
                    setAdminConfig(data);
                }
            }
            syncConfig();
            window.addEventListener('camp-admin-updated', syncConfig);
            return ({
                "HomePage.useEffect": ()=>{
                    active = false;
                    window.removeEventListener('camp-admin-updated', syncConfig);
                }
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], []);
    function goToLevelUpSlide(nextIndex, direction = 'next') {
        if (levelUpSlideCount <= 0) {
            return;
        }
        setSlideDirection(direction);
        setLevelUpSlideIndex((nextIndex % levelUpSlideCount + levelUpSlideCount) % levelUpSlideCount);
    }
    function nextLevelUpSlide() {
        goToLevelUpSlide(levelUpSlideIndex + 1, 'next');
    }
    function previousLevelUpSlide() {
        goToLevelUpSlide(levelUpSlideIndex - 1, 'prev');
    }
    function onLevelUpTouchStart(event) {
        slideTouchStartRef.current = event.changedTouches[0]?.clientX || 0;
    }
    function onLevelUpTouchEnd(event) {
        const endX = event.changedTouches[0]?.clientX || 0;
        const delta = endX - slideTouchStartRef.current;
        if (Math.abs(delta) < 40) {
            return;
        }
        if (delta < 0) {
            nextLevelUpSlide();
        } else {
            previousLevelUpSlide();
        }
    }
    function goToCampGallerySlide(nextIndex, direction = 'next') {
        if (campGalleryCount <= 0) {
            return;
        }
        setCampGalleryDirection(direction);
        setCampGalleryIndex((nextIndex % campGalleryCount + campGalleryCount) % campGalleryCount);
    }
    function nextCampGallerySlide() {
        goToCampGallerySlide(campGalleryIndex + 1, 'next');
    }
    function previousCampGallerySlide() {
        goToCampGallerySlide(campGalleryIndex - 1, 'prev');
    }
    function onCampGalleryTouchStart(event) {
        campGalleryTouchStartRef.current = event.changedTouches?.[0]?.clientX || 0;
    }
    function onCampGalleryTouchEnd(event) {
        const endX = event.changedTouches?.[0]?.clientX || 0;
        const delta = endX - campGalleryTouchStartRef.current;
        if (Math.abs(delta) < 24) {
            return;
        }
        if (delta < 0) {
            nextCampGallerySlide();
        } else {
            previousCampGallerySlide();
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (levelUpSlideCount <= 1) {
                return undefined;
            }
            const timer = window.setInterval({
                "HomePage.useEffect.timer": ()=>{
                    setSlideDirection('next');
                    setLevelUpSlideIndex({
                        "HomePage.useEffect.timer": (current)=>(current + 1) % levelUpSlideCount
                    }["HomePage.useEffect.timer"]);
                }
            }["HomePage.useEffect.timer"], 2500);
            return ({
                "HomePage.useEffect": ()=>window.clearInterval(timer)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], [
        levelUpSlideCount
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            const timer = window.setInterval({
                "HomePage.useEffect.timer": ()=>{
                    setCountdownNow(new Date());
                }
            }["HomePage.useEffect.timer"], 1000);
            return ({
                "HomePage.useEffect": ()=>window.clearInterval(timer)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            window.localStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(surveyData));
        }
    }["HomePage.useEffect"], [
        surveyData
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            function syncViewport() {
                const mobile = window.matchMedia('(max-width: 700px)').matches;
                setIsMobileViewport(mobile);
                setIsDiscountCollapsed(mobile);
            }
            syncViewport();
            window.addEventListener('resize', syncViewport);
            return ({
                "HomePage.useEffect": ()=>window.removeEventListener('resize', syncViewport)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            const draft = readRegistrationDraft();
            if (draft?.registration) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setRegistration({
                    contactEmail: typeof draft.registration.contactEmail === 'string' ? draft.registration.contactEmail : '',
                    contactPhone: typeof draft.registration.contactPhone === 'string' ? draft.registration.contactPhone : '',
                    students: Array.isArray(draft.registration.students) && draft.registration.students.length ? draft.registration.students.map(normalizeStudentDraft) : [
                        createStudent('student-1')
                    ]
                });
                const draftStep = Number(draft.step);
                if (Number.isFinite(draftStep)) {
                    setStep(Math.max(1, Math.min(registrationSteps.length, draftStep)));
                }
                if (typeof draft.activeStudentId === 'string') {
                    setActiveStudentId(draft.activeStudentId);
                }
                if (typeof draft.expandedStudentId === 'string') {
                    setExpandedStudentId(draft.expandedStudentId);
                }
            }
            setDraftReady(true);
        }
    }["HomePage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (!draftReady || ("TURBOPACK compile-time value", "object") === 'undefined') {
                return;
            }
            window.localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify({
                step,
                activeStudentId,
                expandedStudentId,
                registration
            }));
        }
    }["HomePage.useEffect"], [
        activeStudentId,
        draftReady,
        expandedStudentId,
        registration,
        step
    ]);
    function jumpToRegistration() {
        if (!isRegistrationRoute) {
            router.push('/register');
            return;
        }
        setEntryMode('register');
        if ("TURBOPACK compile-time truthy", 1) {
            window.setTimeout(()=>{
                registrationRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 40);
        }
    }
    function jumpToCampTop() {
        if (isRegistrationRoute) {
            router.push('/#camp-info');
            return;
        }
        setEntryMode('register');
        if ("TURBOPACK compile-time truthy", 1) {
            window.setTimeout(()=>{
                document.getElementById('camp-info')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 40);
        }
    }
    function jumpToSurvey() {
        surveyRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    function updateSurveyField(field, value) {
        setSurveyData((current)=>({
                ...current,
                [field]: value
            }));
    }
    function toggleSurveyActivity(activity) {
        setSurveyData((current)=>({
                ...current,
                activityInterests: current.activityInterests.includes(activity) ? current.activityInterests.filter((item)=>item !== activity) : [
                    ...current.activityInterests,
                    activity
                ]
            }));
    }
    function setSurveySportsParticipation(value) {
        setSurveyData((current)=>({
                ...current,
                hasSports: value,
                sportsList: value === 'yes' ? current.sportsList : '',
                noSportsPriority: value === 'no' ? current.noSportsPriority : []
            }));
    }
    function toggleNoSportsPriority(priority) {
        setSurveyData((current)=>{
            const selected = Array.isArray(current.noSportsPriority) ? current.noSportsPriority : [];
            if (selected.includes(priority)) {
                return {
                    ...current,
                    noSportsPriority: selected.filter((item)=>item !== priority)
                };
            }
            if (selected.length >= 3) {
                return current;
            }
            return {
                ...current,
                noSportsPriority: [
                    ...selected,
                    priority
                ]
            };
        });
    }
    async function saveSurveyProfileLead(lastCompletedStep) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            return null;
        }
        const camperAges = surveyData.camperAges.map((age)=>Number(age || 0)).filter((age)=>Number.isFinite(age) && age > 0);
        const surveyContext = {
            camperCount: Math.max(1, Number(surveyData.camperCount || 1)),
            camperAges,
            hasSports: surveyData.hasSports || null,
            sportsList: surveyData.sportsList?.trim() || '',
            noSportsPriority: Array.isArray(surveyData.noSportsPriority) && surveyData.noSportsPriority.length > 0 ? surveyData.noSportsPriority : null,
            hasMartial: surveyData.hasMartial || null,
            martialYears: Number(surveyData.martialYears || 0),
            martialMonths: Number(surveyData.martialMonths || 0),
            goals: surveyData.goals,
            activityInterests: surveyData.activityInterests,
            lunchInterest: surveyData.lunchInterest || null,
            registrationIntent: surveyData.registrationIntent || null
        };
        const payload = {
            email: surveyData.contactEmail.trim(),
            camper_count: Math.max(1, Number(surveyData.camperCount || 1)),
            camper_ages: camperAges,
            profile_context: surveyContext,
            last_completed_step: Number(lastCompletedStep) || 1
        };
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('program_interest_profiles').insert(payload);
        return error;
    }
    function setSurveyCamperCount(value) {
        const cleaned = value.replace(/\D/g, '');
        if (!cleaned) {
            setSurveyData((current)=>({
                    ...current,
                    camperCount: '',
                    camperAges: []
                }));
            return;
        }
        const count = Math.max(1, Math.min(6, Number(cleaned)));
        setSurveyData((current)=>{
            const nextAges = Array.from({
                length: count
            }).map((_, index)=>current.camperAges[index] || '');
            return {
                ...current,
                camperCount: String(count),
                camperAges: nextAges
            };
        });
    }
    function setSurveyCamperAge(index, value) {
        const cleaned = value.replace(/\D/g, '');
        setSurveyData((current)=>({
                ...current,
                camperAges: current.camperAges.map((age, ageIndex)=>ageIndex === index ? cleaned : age)
            }));
    }
    function toggleSurveyGoal(goal) {
        setSurveyData((current)=>({
                ...current,
                goals: current.goals.includes(goal) ? current.goals.filter((item)=>item !== goal) : [
                    ...current.goals,
                    goal
                ]
            }));
    }
    function getSurveyFeedback(step) {
        const camperCount = Math.max(1, Number(surveyData.camperCount || 1));
        const ages = surveyData.camperAges.map((age)=>Number(age || 0)).filter((age)=>age > 0);
        const allUnder6 = ages.length > 0 && ages.every((age)=>age < 6);
        const hasYoungCamper = ages.some((age)=>age <= 6);
        const hasFiveToNine = ages.some((age)=>age >= 5 && age <= 9);
        const minAge = ages.length > 0 ? Math.min(...ages) : 0;
        const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
        const hasWideSiblingRange = camperCount > 1 && ages.length > 1 && maxAge - minAge >= 3;
        const familyLine = camperCount > 1 ? text('Good news: sibling discount is available, and camp is a great way for family and friends to spend summer time together through team-building activities.', '好消息：兄弟姐妹可享优惠，营地也通过团队活动帮助家人和朋友共度高质量暑期时光。') : text('Camp is also a great place to make new friends, with many team-building activities built into each week.', '营地也是结识新朋友的好地方，每周都有丰富的团队协作活动。');
        if (step === 1) {
            const stepOneLines = [];
            if (allUnder6) {
                stepOneLines.push(text('Great fit: for campers under 6, General Camp is usually the best starting point.', '非常适合：6岁以下营员通常最适合从普通营开始。'));
            } else {
                stepOneLines.push(text('Thanks for sharing your camper ages.', '感谢您提供营员年龄信息。'));
            }
            if (hasYoungCamper) {
                stepOneLines.push(text('We have dedicated programs for young campers ages 6 and under.', '我们为6岁及以下小营员设置了专属课程。'));
            }
            if (hasFiveToNine) {
                stepOneLines.push(text('Ages 5-9 are a great age to start Wushu.', '5-9岁是开始武术训练的黄金年龄。'));
            }
            if (hasWideSiblingRange) {
                stepOneLines.push(text('We accept and coach a wide range of sibling age groups in the same season.', '我们可在同一季为不同年龄段兄弟姐妹提供分层训练。'));
            }
            stepOneLines.push(familyLine);
            return stepOneLines.join(' ');
        }
        if (step === 2) {
            if (surveyData.hasSports === 'yes') {
                return text('Great. Next we will capture which sports they play so we can tailor training carry-over.', '很好。下一步我们会了解具体运动项目，以便做更精准的能力迁移训练。');
            }
            return text('Perfect. Next we will pick what to build first so we can personalize your starter path.', '很好。下一步我们会确定优先提升方向，定制孩子的起步路径。');
        }
        if (step === 3) {
            const hasOlderCamper = ages.some((age)=>age > 9);
            const olderCamperLine = hasOlderCamper ? 'For older kids, Wushu is especially effective for building discipline, athletic performance, confidence, and leadership.' : '';
            if (surveyData.hasSports === 'yes' && surveyData.sportsList.trim()) {
                return `Great - ${surveyData.sportsList} is an excellent base. Wushu will sharpen coordination, flexibility, balance, speed, and body control to elevate overall athletic performance.${olderCamperLine ? ` ${olderCamperLine}` : ''}`;
            }
            if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length > 0) {
                return `Great focus. We will help build ${surveyData.noSportsPriority.join(', ')} with clear coaching progress from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`;
            }
            return `Many of our students start with no sports experience. Our progression system builds coordination, strength, flexibility, confidence, and focus from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`;
        }
        if (step === 4) {
            return surveyData.hasMartial === 'yes' ? text('Nice. Next we will quickly capture years/months so we can place your camper at the right training level.', '很好。下一步将快速了解训练年限，便于准确分班。') : text('Great. No prior martial arts is totally fine. Next we will continue to goals and scheduling preferences.', '非常好。零基础完全没问题，下一步我们继续了解目标和日程偏好。');
        }
        if (step === 5) {
            if (surveyData.hasMartial === 'yes') {
                const years = Number(surveyData.martialYears || 0);
                const months = Number(surveyData.martialMonths || 0);
                const totalYears = years + months / 12;
                if (totalYears >= 3) {
                    return text('Your martial arts experience is a great fit for advanced training paths.', '您的武术基础很适合进阶训练路径。');
                }
                return text('Great foundation - we can build fast from your current experience level.', '基础很好，我们可以在现有水平上快速进阶。');
            }
            return text('That is great. New students do very well with our structured progression.', '很棒。我们的结构化进阶体系对新学员非常友好。');
        }
        if (step === 6) {
            const selectedActivities = surveyData.activityInterests.map((value)=>surveyActivities.find((item)=>item.value === value)?.label).filter(Boolean);
            const activityLine = selectedActivities.length > 0 ? `Great picks: ${selectedActivities.join(', ')}. We include similar training blocks every week to keep campers engaged and progressing.` : 'Great direction. We balance skill work, movement, and fun engagement every week.';
            const campWindow = registrationWeeks.length ? `Camp runs ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWeekLabel"])({
                start: registrationWeeks[0].start,
                end: registrationWeeks[registrationWeeks.length - 1].end
            })}.` : 'Camp start/end dates are posted in the dates section.';
            const scheduleLine = 'Typical week: Mon footwork/team games, Tue technique stations, Wed agility/partner drills, Thu mini challenges, Fri showcase prep.';
            if (surveyData.goals.includes('competition')) {
                return `${activityLine} ${scheduleLine} ${campWindow} Awesome goal. Competition Team Boot Camp will likely be a strong match.`;
            }
            if (surveyData.lunchInterest === 'yes') {
                return `${activityLine} ${scheduleLine} ${campWindow} Lunch can be added by day in registration, making full camp weeks easier for busy family schedules.`;
            }
            if (surveyData.goals.includes('social/teamwork/friends')) {
                return `${activityLine} ${scheduleLine} ${campWindow} Camp is designed to build teamwork, friendships, and social confidence through daily group activities.`;
            }
            return `${activityLine} ${scheduleLine} ${campWindow} We will match your family with a balanced and fun progression path.`;
        }
        return '';
    }
    function getSurveyDidYouKnowFact() {
        const hasFiveToNine = surveyData.camperAges.map((age)=>Number(age || 0)).some((age)=>age >= 5 && age <= 9);
        if (surveyStep === 1) {
            return hasFiveToNine ? text('Most of our top athletes started training between ages 5 and 9.', '我们很多顶尖学员都是在5到9岁开始训练的。') : text('We coach multiple age groups every week with level-based training tracks.', '我们每周提供分龄分级训练，覆盖多个年龄层。');
        }
        if (surveyStep === 2) {
            return text('Wushu helps athletes improve balance, mobility, coordination, speed, and focus across many sports.', '武术能显著提升平衡、协调、灵活性、速度和专注力。');
        }
        if (surveyStep === 3) {
            return text('We map your current sports background to Wushu training plans for faster progress transfer.', '我们会把现有运动背景映射到武术训练中，帮助更快迁移与进步。');
        }
        if (surveyStep === 4) {
            return text('Our academy has earned 500+ competition medals, and experienced coaches support both beginner and advanced pathways.', '学院已获得500+奖牌，经验教练可同时支持零基础与进阶路径。');
        }
        if (surveyStep === 5) {
            return text('Martial arts experience is optional. Many strong students start with no prior experience.', '无需武术基础，很多优秀学员都是从零开始。');
        }
        if (surveyStep === 6) {
            return text('Families can choose lunch by day during registration, making weekly planning easier.', '报名时可按天选择午餐，周计划更轻松。');
        }
        if (surveyStep === 7) {
            return text('You can mix General Camp and Competition Team Boot Camp by week based on your goals.', '可根据目标按周组合普通营与竞赛集训营。');
        }
        return '';
    }
    function getGoalsEncouragement() {
        if (surveyData.goals.length === 0) {
            return '';
        }
        if (surveyData.goals.includes('competition')) {
            return 'Excellent goal. We will map a progression path that builds skills for confident competition performance.';
        }
        if (surveyData.goals.includes('social/teamwork/friends')) {
            return 'Great goal. Camp includes partner drills and team activities that build friendships and social confidence.';
        }
        if (surveyData.goals.includes('exercise')) {
            return 'Great choice. Training builds athleticism, flexibility, and strong movement habits.';
        }
        return 'Love it. We keep training fun while building real skill and confidence each week.';
    }
    function buildSurveyRecommendation() {
        const camperCount = Math.max(1, Number(surveyData.camperCount || 1));
        const ages = surveyData.camperAges.map((age)=>Number(age || 0)).filter((age)=>age > 0);
        const allUnder6 = ages.length > 0 && ages.every((age)=>age < 6);
        const hasCompetitionGoal = surveyData.goals.includes('competition');
        const martialYears = Number(surveyData.martialYears || 0) + Number(surveyData.martialMonths || 0) / 12;
        const recommendCompetition = !allUnder6 && (hasCompetitionGoal || martialYears >= 3);
        const lines = [];
        if (registrationWeeks.length) {
            lines.push(`${text('Camp season', '营期时间')}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWeekLabel"])({
                start: registrationWeeks[0].start,
                end: registrationWeeks[registrationWeeks.length - 1].end
            })}.`);
        }
        if (allUnder6) {
            lines.push(text('Best fit: General Camp (100% recommendation for under-6 campers).', '最佳匹配：普通营（6岁以下建议优先100%匹配）。'));
        } else if (recommendCompetition) {
            lines.push(text('Best fit: Competition Team Boot Camp.', '最佳匹配：竞赛队集训营。'));
            lines.push(text('Suggested start: minimum 2 weeks of Competition Team Boot Camp for best skill learning.', '建议起步：至少2周竞赛队集训营，以获得更好的技能提升效果。'));
        } else {
            lines.push(text('Best fit: General Camp with progression options as skills improve.', '最佳匹配：普通营，并可随能力提升逐步进阶。'));
            lines.push(text('Suggested start: minimum 2 weeks for stronger skill retention and confidence gains.', '建议起步：至少2周，更有助于技能巩固与自信提升。'));
        }
        if (camperCount > 1) {
            lines.push(text('Sibling discount is available for your family.', '您的家庭可享兄弟姐妹优惠。'));
            lines.push(text('Camp includes lots of team-building activities, making it a great way for family and friends to spend time together in the summer.', '营地有丰富团队活动，非常适合家人和朋友在夏天共同成长与互动。'));
        } else {
            lines.push(text('Camp is a great place to make new friends through many team-building activities each week.', '营地是结交新朋友的好地方，每周都有丰富团队协作活动。'));
        }
        if (surveyData.goals.includes('social/teamwork/friends')) {
            lines.push(text('You selected social/teamwork goals: we include guided partner drills and group challenges every week.', '您选择了社交/团队目标：我们每周都有搭档训练与团队挑战。'));
        }
        if (surveyData.lunchInterest === 'yes') {
            lines.push(text('You marked lunch convenience as important: lunch can be selected by day during registration.', '您重视午餐便利：报名时可按天选择午餐。'));
        }
        lines.push(text('You can still mix General Camp and Competition Team Boot Camp by week.', '您也可以按周组合普通营与竞赛队集训营。'));
        lines.push(text('New England Wushu is awarded Best in Burlington and recognized as a top academy in the area, led by certified top coaches.', '新英格兰武术学院获评伯灵顿最佳之一，由认证顶级教练团队带领。'));
        return lines;
    }
    function validateSurveyStep(step) {
        if (step === 1) {
            const email = surveyData.contactEmail.trim();
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                return text('Please enter a valid email address.', '请输入有效邮箱地址。');
            }
            const count = Number(surveyData.camperCount || 0);
            if (!count || count < 1) {
                return text('Enter number of campers.', '请输入营员人数。');
            }
            const missingAges = surveyData.camperAges.some((age)=>!age);
            if (missingAges) {
                return text('Enter age for each camper.', '请填写每位营员年龄。');
            }
        }
        if (step === 2) {
            if (!surveyData.hasSports) {
                return text('Select whether your child has sports participation.', '请选择孩子是否有运动参与经历。');
            }
        }
        if (step === 3) {
            if (surveyData.hasSports === 'yes' && !surveyData.sportsList.trim()) {
                return text('Enter the sports your child participates in.', '请填写孩子参与过的运动项目。');
            }
            if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length === 0) {
                return text('Select what you want your child to build first.', '请选择希望孩子优先提升的方向。');
            }
        }
        if (step === 4) {
            if (!surveyData.hasMartial) {
                return text('Select whether your child has martial arts experience.', '请选择孩子是否有武术经历。');
            }
        }
        if (step === 6) {
            if (!surveyData.lunchInterest) {
                return text('Select whether lunch convenience would help your family schedule.', '请选择午餐服务是否有助于家庭安排。');
            }
            if (surveyData.activityInterests.length === 0) {
                return text('Select at least one preferred activity so we can tailor the fit.', '请至少选择一项活动偏好，便于我们匹配方案。');
            }
            if (surveyData.goals.length === 0) {
                return text('Select at least one goal so we can personalize recommendations.', '请至少选择一个目标，便于个性化推荐。');
            }
        }
        return '';
    }
    async function nextSurveyStep() {
        const error = validateSurveyStep(surveyStep);
        if (error) {
            setSurveyMessage(error);
            return;
        }
        if (surveyStep === 1) {
            setSavingSurveyProfile(true);
            const saveError = await saveSurveyProfileLead(1);
            setSavingSurveyProfile(false);
            if (saveError) {
                setSurveyMessage(`Could not save email profile: ${saveError.message}`);
                return;
            }
        } else {
            const saveError = await saveSurveyProfileLead(surveyStep);
            if (saveError) {
                setSurveyMessage(`Could not save survey context: ${saveError.message}`);
                return;
            }
        }
        setSurveyMessage('');
        setSurveyDirection('next');
        setSurveyStep((current)=>{
            const next = Math.min(current + 1, SURVEY_TOTAL_STEPS);
            return next;
        });
    }
    function previousSurveyStep() {
        setSurveyMessage('');
        setSurveyDirection('prev');
        setSurveyStep((current)=>Math.max(current - 1, 1));
    }
    function chooseLearnPath() {
        setEntryMode('learn');
        setSurveyStep(1);
        setSurveyMessage('');
        setSurveyDirection('next');
        if (!isMobileViewport) {
            jumpToSurvey();
        }
    }
    async function handleThinkAboutIt() {
        setSurveyData((current)=>({
                ...current,
                registrationIntent: 'think'
            }));
        const saveError = await saveSurveyProfileLead(SURVEY_TOTAL_STEPS);
        if (saveError) {
            setSurveyMessage(`Could not save follow-up intent: ${saveError.message}`);
            return;
        }
        setSurveyMessage('Great. We will follow up with useful info while you think it over.');
    }
    async function handleReadyToRegister() {
        setSurveyData((current)=>({
                ...current,
                registrationIntent: 'ready'
            }));
        await saveSurveyProfileLead(SURVEY_TOTAL_STEPS);
        jumpToRegistration();
    }
    function updateContactForm(field, value) {
        setContactForm((current)=>({
                ...current,
                [field]: value
            }));
    }
    function submitContact(event) {
        event.preventDefault();
        const subject = encodeURIComponent(`Summer Camp Question from ${contactForm.name || 'Family'}`);
        const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`);
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
        }
        setContactMessage('Opening your email app. If it does not open, email us directly.');
    }
    function getMarketingNeedResponse() {
        if (marketingNeed === 'athletic') {
            return text('Great choice. We focus on coordination, speed, flexibility, and structured conditioning so campers improve performance across sports.', '很棒。我们重点提升协调、速度、柔韧和体能，帮助孩子在多项运动中都更有表现。');
        }
        if (marketingNeed === 'tumbling') {
            return text('Excellent choice. Our qualified coaches have taught hundreds of students tumbling skills with step-by-step progressions for safe and confident learning.', '非常好。我们的专业教练已系统教授数百名学员翻腾技巧，通过分阶段训练实现安全且自信的进步。');
        }
        if (marketingNeed === 'social') {
            return text('Perfect fit. Daily team challenges and partner drills are designed to build friendships, communication, and social confidence.', '非常适合。每日团队挑战和搭档训练专门帮助建立友谊、沟通力和社交自信。');
        }
        return text('Excellent focus. Our step-by-step coaching model helps campers build confidence through visible progress every week.', '非常好。我们分阶段教练模型通过每周可见进步来持续建立孩子自信。');
    }
    function previousMarketingFlowStep() {
        setMarketingFlowIndex((current)=>Math.max(0, current - 1));
    }
    function nextMarketingFlowStep() {
        setMarketingFlowIndex((current)=>Math.min(3, current + 1));
    }
    function localizeTestimonialValue(value, fallbackValue) {
        if (language !== 'zh') {
            return value || fallbackValue;
        }
        if (!value) {
            return fallbackValue;
        }
        return testimonialTranslationMap[value] || value;
    }
    function previousTestimonial() {
        if (featuredTestimonials.length <= 1) {
            return;
        }
        setTestimonialIndex((current)=>(current - 1 + featuredTestimonials.length) % featuredTestimonials.length);
    }
    function nextTestimonial() {
        if (featuredTestimonials.length <= 1) {
            return;
        }
        setTestimonialIndex((current)=>(current + 1) % featuredTestimonials.length);
    }
    function updateContact(field, value) {
        setRegistration((current)=>({
                ...current,
                [field]: value
            }));
    }
    function updateStudentField(studentId, field, value) {
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === studentId ? {
                        ...student,
                        [field]: value
                    } : student)
            }));
    }
    function addStudent() {
        if (registration.students.length >= MAX_CAMPERS) {
            setMessage(`You can add up to ${MAX_CAMPERS} campers.`);
            return;
        }
        const next = createStudent();
        setRegistration((current)=>({
                ...current,
                students: [
                    ...current.students,
                    next
                ]
            }));
        setActiveStudentId(next.id);
        setExpandedStudentId(next.id);
    }
    function removeStudent(studentId) {
        setRegistration((current)=>{
            const remaining = current.students.filter((student)=>student.id !== studentId);
            return {
                ...current,
                students: remaining.length ? remaining : [
                    createStudent()
                ]
            };
        });
        if (activeStudentId === studentId) {
            setActiveStudentId('');
        }
        if (expandedStudentId === studentId) {
            setExpandedStudentId('');
        }
    }
    function clearRegistrationForm() {
        setRegistration({
            contactEmail: '',
            contactPhone: '',
            students: [
                createStudent('student-1')
            ]
        });
        setActiveStudentId('');
        setExpandedStudentId('');
        setExpandedWeekKey('');
        setExpandedLunchWeekKey('');
        setHelpWeekKey('');
        setStep(1);
        setMessage('Form cleared.');
        if ("TURBOPACK compile-time truthy", 1) {
            window.localStorage.removeItem(REGISTRATION_DRAFT_KEY);
        }
    }
    function setStudentWeek(studentId, week, updater) {
        const weekDayKeys = week.days.map((item)=>item.key);
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>{
                    if (student.id !== studentId) {
                        return student;
                    }
                    const currentEntry = student.schedule[week.id] || {
                        weekId: week.id,
                        programKey: week.programKey,
                        campType: week.programKey === 'daycamp' ? '' : week.programKey,
                        days: weekDayKeys.reduce((acc, day)=>({
                                ...acc,
                                [day]: 'NONE'
                            }), {})
                    };
                    const updatedEntry = updater(currentEntry);
                    const dayModes = weekDayKeys.map((day)=>updatedEntry.days?.[day] || 'NONE');
                    const hasAnyDay = dayModes.some((mode)=>mode !== 'NONE');
                    const nextSchedule = {
                        ...student.schedule
                    };
                    const nextLunch = {
                        ...student.lunch
                    };
                    if (hasAnyDay) {
                        nextSchedule[week.id] = updatedEntry;
                    } else {
                        delete nextSchedule[week.id];
                        for (const day of weekDayKeys){
                            delete nextLunch[`${week.id}:${day}`];
                        }
                    }
                    for (const day of weekDayKeys){
                        if ((updatedEntry.days?.[day] || 'NONE') === 'NONE') {
                            delete nextLunch[`${week.id}:${day}`];
                        }
                    }
                    return {
                        ...student,
                        schedule: nextSchedule,
                        lunch: nextLunch
                    };
                })
            }));
    }
    function setDayCampType(studentId, week, campType) {
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>{
                    if (student.id !== studentId) {
                        return student;
                    }
                    const existing = student.schedule[week.id] || {
                        weekId: week.id,
                        programKey: week.programKey,
                        campType: '',
                        days: dayKeys.reduce((acc, day)=>({
                                ...acc,
                                [day]: 'NONE'
                            }), {})
                    };
                    return {
                        ...student,
                        schedule: {
                            ...student.schedule,
                            [week.id]: {
                                ...existing,
                                campType
                            }
                        }
                    };
                })
            }));
    }
    function toggleFullWeek(studentId, week) {
        if (week.programKey === 'daycamp') {
            const student = registration.students.find((item)=>item.id === studentId);
            const campType = student?.schedule?.[week.id]?.campType || '';
            if (!campType) {
                setMessage('Select General or Boot Camp for this week first.');
                return;
            }
        }
        const weekDayKeys = week.days.map((item)=>item.key);
        setStudentWeek(studentId, week, (entry)=>{
            const alreadyFull = weekDayKeys.every((day)=>(entry.days?.[day] || 'NONE') === 'FULL');
            return {
                ...entry,
                days: weekDayKeys.reduce((acc, day)=>({
                        ...acc,
                        [day]: alreadyFull ? 'NONE' : 'FULL'
                    }), {})
            };
        });
    }
    function cycleDay(studentId, week, day) {
        if (week.programKey === 'daycamp') {
            const student = registration.students.find((item)=>item.id === studentId);
            const campType = student?.schedule?.[week.id]?.campType || '';
            if (!campType) {
                setMessage('Select General or Boot Camp for this week first.');
                return;
            }
        }
        setStudentWeek(studentId, week, (entry)=>{
            const currentMode = entry.days?.[day] || 'NONE';
            return {
                ...entry,
                days: {
                    ...entry.days,
                    [day]: nextMode[currentMode]
                }
            };
        });
    }
    function toggleLunch(studentId, weekId, day) {
        const key = `${weekId}:${day}`;
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>{
                    if (student.id !== studentId) {
                        return student;
                    }
                    const nextLunch = {
                        ...student.lunch,
                        [key]: !student.lunch[key]
                    };
                    const hasAnyLunch = Object.values(nextLunch).some(Boolean);
                    return {
                        ...student,
                        lunch: nextLunch,
                        lunchConfirmedNone: hasAnyLunch ? false : student.lunchConfirmedNone
                    };
                })
            }));
    }
    function setLunchConfirmedNone(studentId, confirmed) {
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === studentId ? {
                        ...student,
                        lunchConfirmedNone: Boolean(confirmed)
                    } : student)
            }));
    }
    function getSelectedDayKeysForStudent(student) {
        const keys = new Set();
        for (const [weekId, entry] of Object.entries(student.schedule || {})){
            for (const [dayKey, mode] of Object.entries(entry.days || {})){
                if (mode && mode !== 'NONE') {
                    keys.add(`${weekId}:${dayKey}`);
                }
            }
        }
        return keys;
    }
    function clearActiveStudentSchedule() {
        if (!activeStudent) {
            return;
        }
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === activeStudent.id ? {
                        ...student,
                        schedule: {},
                        lunch: {},
                        lunchConfirmedNone: false
                    } : student)
            }));
        setExpandedWeekKey('');
        setExpandedLunchWeekKey('');
        setMessage('Cleared all selected weeks/times for active camper.');
    }
    function copyScheduleFromCamper(sourceId) {
        if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
            return;
        }
        const sourceStudent = registration.students.find((student)=>student.id === sourceId);
        if (!sourceStudent) {
            return;
        }
        const copiedSchedule = Object.fromEntries(Object.entries(sourceStudent.schedule || {}).map(([weekId, entry])=>[
                weekId,
                {
                    ...entry,
                    days: {
                        ...entry.days || {}
                    }
                }
            ]));
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === activeStudent.id ? {
                        ...student,
                        schedule: copiedSchedule,
                        lunch: {},
                        lunchConfirmedNone: false
                    } : student)
            }));
        setExpandedWeekKey('');
        setExpandedLunchWeekKey('');
        setMessage('Copied weeks/times from selected camper.');
    }
    function clearActiveStudentLunch() {
        if (!activeStudent) {
            return;
        }
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === activeStudent.id ? {
                        ...student,
                        lunch: {},
                        lunchConfirmedNone: false
                    } : student)
            }));
        setExpandedLunchWeekKey('');
        setMessage('Cleared all lunch selections for active camper.');
    }
    function copyLunchFromCamper(sourceId) {
        if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
            return;
        }
        const sourceStudent = registration.students.find((student)=>student.id === sourceId);
        if (!sourceStudent) {
            return;
        }
        const allowedKeys = getSelectedDayKeysForStudent(activeStudent);
        const copiedLunch = Object.fromEntries(Object.entries(sourceStudent.lunch || {}).filter(([key, value])=>value && allowedKeys.has(key)));
        const hasAnyCopiedLunch = Object.values(copiedLunch).some(Boolean);
        setRegistration((current)=>({
                ...current,
                students: current.students.map((student)=>student.id === activeStudent.id ? {
                        ...student,
                        lunch: copiedLunch,
                        lunchConfirmedNone: hasAnyCopiedLunch ? false : Boolean(sourceStudent.lunchConfirmedNone)
                    } : student)
            }));
        setExpandedLunchWeekKey('');
        setMessage('Copied lunch selections from selected camper.');
    }
    function hasAnySelectedCampDay(student) {
        return Object.values(student.schedule || {}).some((entry)=>Object.values(entry.days || {}).some((mode)=>mode !== 'NONE'));
    }
    function isStepOneComplete() {
        const emailValid = /\S+@\S+\.\S+/.test(registration.contactEmail);
        const phoneValid = registration.contactPhone.trim().length >= 7;
        const studentsValid = registration.students.every((student)=>isStudentComplete(student));
        return emailValid && phoneValid && studentsValid;
    }
    function isStepTwoComplete() {
        return registration.students.every((student)=>hasAnySelectedCampDay(student));
    }
    function hasValidLunchDecision(student) {
        const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean);
        return hasAnyLunch || Boolean(student.lunchConfirmedNone);
    }
    function isStepThreeComplete() {
        return registration.students.every((student)=>hasValidLunchDecision(student));
    }
    function isStepFourComplete() {
        return isStepOneComplete() && isStepTwoComplete() && isStepThreeComplete();
    }
    function isRegistrationStepComplete(stepId) {
        if (stepId === 1) {
            return isStepOneComplete();
        }
        if (stepId === 2) {
            return isStepTwoComplete();
        }
        if (stepId === 3) {
            return isStepThreeComplete();
        }
        return isStepFourComplete();
    }
    function isCamperMissingAnyStep(student) {
        const stepOneMissing = !isStudentComplete(student);
        const stepTwoMissing = !hasAnySelectedCampDay(student);
        const stepThreeMissing = !hasValidLunchDecision(student);
        return stepOneMissing || stepTwoMissing || stepThreeMissing;
    }
    function validateStep(currentStep) {
        if (currentStep === 1) {
            return {
                ok: isStepOneComplete(),
                message: 'Please complete required fields for this step.'
            };
        }
        if (currentStep === 2) {
            const studentsMissingDays = registration.students.filter((student)=>{
                return !hasAnySelectedCampDay(student);
            });
            if (studentsMissingDays.length > 0) {
                const names = studentsMissingDays.map((student)=>{
                    const studentNumber = registration.students.findIndex((item)=>item.id === student.id) + 1;
                    return student.fullName.trim() || `Camper ${studentNumber}`;
                }).join(', ');
                return {
                    ok: false,
                    message: `Add at least one selected camp day for: ${names}.`
                };
            }
        }
        if (currentStep === 3) {
            const studentsMissingLunchDecision = registration.students.filter((student)=>{
                const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean);
                return !hasAnyLunch && !student.lunchConfirmedNone;
            });
            if (studentsMissingLunchDecision.length > 0) {
                const names = studentsMissingLunchDecision.map((student)=>{
                    const studentNumber = registration.students.findIndex((item)=>item.id === student.id) + 1;
                    return student.fullName.trim() || `Camper ${studentNumber}`;
                }).join(', ');
                return {
                    ok: false,
                    message: `Choose lunch days or confirm no lunch for: ${names}.`
                };
            }
        }
        return {
            ok: true,
            message: ''
        };
    }
    function scrollElementIntoFocusZone(element) {
        if (("TURBOPACK compile-time value", "object") === 'undefined' || !element) {
            return;
        }
        const rect = element.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;
        const targetTop = Math.max(0, absoluteTop - window.innerHeight * 0.6);
        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
        window.setTimeout(()=>{
            element.focus?.({
                preventScroll: true
            });
        }, 120);
    }
    function jumpToStepMissingField(currentStep) {
        if (typeof document === 'undefined') {
            return;
        }
        if (currentStep === 1) {
            if (!/\S+@\S+\.\S+/.test(registration.contactEmail || '')) {
                const emailInput = document.querySelector('#reg-contact-email');
                scrollElementIntoFocusZone(emailInput);
                return;
            }
            if (registration.contactPhone.trim().length < 7) {
                const phoneInput = document.querySelector('#reg-contact-phone');
                scrollElementIntoFocusZone(phoneInput);
                return;
            }
            const firstMissingStudent = registration.students.find((student)=>!isStudentComplete(student));
            if (!firstMissingStudent) {
                return;
            }
            setActiveStudentId(firstMissingStudent.id);
            setExpandedStudentId(firstMissingStudent.id);
            const focusTargets = [
                !firstMissingStudent.fullName.trim() ? `#reg-student-fullname-${firstMissingStudent.id}` : '',
                !parseDateLocal(firstMissingStudent.dob) ? `#reg-student-dob-${firstMissingStudent.id}` : '',
                !firstMissingStudent.allergies.trim() ? `#reg-student-allergies-${firstMissingStudent.id}` : '',
                !firstMissingStudent.medication.trim() ? `#reg-student-medication-${firstMissingStudent.id}` : '',
                !firstMissingStudent.previousInjury.trim() ? `#reg-student-injuries-${firstMissingStudent.id}` : '',
                !firstMissingStudent.healthNotes.trim() ? `#reg-student-health-${firstMissingStudent.id}` : ''
            ].filter(Boolean);
            const selector = focusTargets[0];
            if (selector) {
                window.setTimeout(()=>{
                    const target = document.querySelector(selector);
                    scrollElementIntoFocusZone(target);
                }, 140);
            }
            return;
        }
        if (currentStep === 2) {
            const firstMissingStudent = registration.students.find((student)=>!hasAnySelectedCampDay(student));
            if (!firstMissingStudent) {
                return;
            }
            setActiveStudentId(firstMissingStudent.id);
            const firstWeek = registrationWeeks[0];
            if (firstWeek) {
                const panelKey = `${firstMissingStudent.id}:${firstWeek.id}`;
                setExpandedWeekKey(panelKey);
                window.setTimeout(()=>{
                    const target = document.querySelector(`[data-week-head="${panelKey}"]`);
                    scrollElementIntoFocusZone(target);
                }, 140);
            }
            return;
        }
        if (currentStep === 3) {
            const firstMissingStudent = registration.students.find((student)=>{
                const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean);
                return !hasAnyLunch && !student.lunchConfirmedNone;
            });
            if (!firstMissingStudent) {
                return;
            }
            setActiveStudentId(firstMissingStudent.id);
            window.setTimeout(()=>{
                const target = document.querySelector(`[data-lunch-decision="${firstMissingStudent.id}"] input[type="checkbox"]`);
                scrollElementIntoFocusZone(target);
            }, 140);
        }
    }
    function nextStep() {
        const validation = validateStep(step);
        if (!validation.ok) {
            setMessage(validation.message);
            jumpToStepMissingField(step);
            return;
        }
        setMessage('');
        setStepDirection('next');
        setStep((current)=>Math.min(current + 1, registrationSteps.length));
    }
    function previousStep() {
        setMessage('');
        setStepDirection('prev');
        setStep((current)=>Math.max(current - 1, 1));
    }
    function buildStudentPriceRows(summary, studentIndex, options = {}) {
        const applyLimitedDiscount = Boolean(options.applyLimitedDiscount);
        const regular = adminConfig.tuition.regular;
        const discount = adminConfig.tuition.discount;
        const premiumFactor = 1 + Number(adminConfig.tuition.bootcampPremiumPct || 0) / 100;
        const siblingDiscountPct = studentIndex === 1 ? Number(adminConfig.tuition.siblingDiscountPct || 0) : 0;
        const bootcampRegular = {
            fullWeek: roundUpToFive(regular.fullWeek * premiumFactor),
            fullDay: roundUpToFive(regular.fullDay * premiumFactor),
            amHalf: roundUpToFive(regular.amHalf * premiumFactor),
            pmHalf: roundUpToFive(regular.pmHalf * premiumFactor)
        };
        const bootcampDiscounted = {
            fullWeek: roundUpToFive(discount.fullWeek * premiumFactor),
            fullDay: roundUpToFive(discount.fullDay * premiumFactor),
            amHalf: roundUpToFive(discount.amHalf * premiumFactor),
            pmHalf: roundUpToFive(discount.pmHalf * premiumFactor)
        };
        const rows = [
            {
                id: 'general-fullWeek',
                key: 'fullWeek',
                label: 'General Camp Full Week',
                qty: summary.general.fullWeeks,
                rateType: 'general'
            },
            {
                id: 'general-fullDay',
                key: 'fullDay',
                label: 'General Camp Full Day',
                qty: summary.general.fullDays,
                rateType: 'general'
            },
            {
                id: 'general-amHalf',
                key: 'amHalf',
                label: 'General Camp AM Half Day',
                qty: summary.general.amDays,
                rateType: 'general'
            },
            {
                id: 'general-pmHalf',
                key: 'pmHalf',
                label: 'General Camp PM Half Day',
                qty: summary.general.pmDays,
                rateType: 'general'
            },
            {
                id: 'bootcamp-fullWeek',
                key: 'fullWeek',
                label: 'Competition Team Full Week',
                qty: summary.bootcamp.fullWeeks,
                rateType: 'bootcamp'
            },
            {
                id: 'bootcamp-fullDay',
                key: 'fullDay',
                label: 'Competition Team Full Day',
                qty: summary.bootcamp.fullDays,
                rateType: 'bootcamp'
            },
            {
                id: 'bootcamp-amHalf',
                key: 'amHalf',
                label: 'Competition Team AM Half Day',
                qty: summary.bootcamp.amDays,
                rateType: 'bootcamp'
            },
            {
                id: 'bootcamp-pmHalf',
                key: 'pmHalf',
                label: 'Competition Team PM Half Day',
                qty: summary.bootcamp.pmDays,
                rateType: 'bootcamp'
            }
        ].map((item)=>{
            const regularPrice = item.rateType === 'bootcamp' ? bootcampRegular[item.key] || 0 : regular[item.key] || 0;
            const configuredDiscountedPrice = item.rateType === 'bootcamp' ? bootcampDiscounted[item.key] || 0 : discount[item.key] || 0;
            const normalizedDiscountedPrice = Number(configuredDiscountedPrice) > 0 ? Number(configuredDiscountedPrice) : regularPrice;
            const effectivePrice = applyLimitedDiscount ? Math.max(0, Math.min(regularPrice, normalizedDiscountedPrice)) : regularPrice;
            const discountAmount = applyLimitedDiscount ? Math.max(0, regularPrice - effectivePrice) : 0;
            return {
                ...item,
                regularPrice,
                discountAmount,
                effectivePrice,
                regularLineTotal: regularPrice * item.qty,
                discountLineTotal: discountAmount * item.qty,
                lineTotal: effectivePrice * item.qty
            };
        }).filter((item)=>item.qty > 0);
        const lunchPrice = adminConfig.tuition.lunchPrice || 14;
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
            lineTotal: lunchPrice * summary.lunchCount
        });
        const subtotalRegular = rows.reduce((acc, row)=>acc + row.regularLineTotal, 0);
        const limitedDiscountAmount = rows.reduce((acc, row)=>acc + row.discountLineTotal, 0);
        const subtotalAfterLimitedDiscount = rows.reduce((acc, row)=>acc + row.lineTotal, 0);
        const siblingAfterLimitedDiscount = siblingDiscountPct > 0 ? subtotalAfterLimitedDiscount * (siblingDiscountPct / 100) : 0;
        const totalWithSiblingAfterLimited = Math.max(0, subtotalAfterLimitedDiscount - siblingAfterLimitedDiscount);
        const siblingBeforeLimitedDiscount = siblingDiscountPct > 0 ? subtotalRegular * (siblingDiscountPct / 100) : 0;
        const baseAfterSiblingBeforeLimited = Math.max(0, subtotalRegular - siblingBeforeLimitedDiscount);
        const totalWithSiblingBeforeLimited = Math.max(0, baseAfterSiblingBeforeLimited - limitedDiscountAmount);
        const useSiblingBeforeLimited = totalWithSiblingBeforeLimited > totalWithSiblingAfterLimited;
        const siblingDiscountAmount = useSiblingBeforeLimited ? siblingBeforeLimitedDiscount : siblingAfterLimitedDiscount;
        const subtotal = subtotalAfterLimitedDiscount;
        const total = useSiblingBeforeLimited ? totalWithSiblingBeforeLimited : totalWithSiblingAfterLimited;
        return {
            rows,
            subtotalRegular,
            limitedDiscountAmount,
            subtotal,
            siblingDiscountPct,
            siblingDiscountAmount,
            siblingAppliedBeforeLimitedDiscount: useSiblingBeforeLimited,
            total
        };
    }
    function getClaimableDiscountTotal() {
        return summaries.reduce((sum, item)=>{
            const studentIndex = registration.students.findIndex((student)=>student.id === item.student.id);
            return sum + buildStudentPriceRows(item.summary, studentIndex, {
                applyLimitedDiscount: true
            }).limitedDiscountAmount;
        }, 0);
    }
    function buildRegistrationSummaryHtml(targetRegistration) {
        if (!targetRegistration || !Array.isArray(targetRegistration.students)) {
            return '';
        }
        const todayLabel = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const allCampEntries = [];
        const studentSections = targetRegistration.students.map((student, index)=>{
            const camperName = student.fullName.trim() || `Camper ${index + 1}`;
            const summary = getStudentSummary(student);
            const invoice = buildStudentPriceRows(summary, index, {
                applyLimitedDiscount: discountActive
            });
            const lunchWeeks = getLunchWeeksForStudent(student, weeksById);
            const registeredDays = lunchWeeks.reduce((sum, row)=>sum + row.selectedDays.length, 0);
            const lunchDays = lunchWeeks.reduce((sum, row)=>sum + row.selectedDays.filter((day)=>Boolean(student.lunch[day.key])).length, 0);
            const packDays = Math.max(0, registeredDays - lunchDays);
            const rowsHtml = invoice.rows.map((row)=>`
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${row.qty}</td>
              <td>${currency(row.effectivePrice)}</td>
              <td>${row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
              <td>${currency(row.lineTotal)}</td>
            </tr>
          `).join('');
            const lunchCalendarHtml = lunchWeeks.map((row, weekIndex)=>{
                const dayLines = row.selectedDays.map((day)=>{
                    const hasLunch = Boolean(student.lunch[day.key]);
                    allCampEntries.push({
                        date: day.date,
                        camperName,
                        hasLunch,
                        mode: day.mode
                    });
                    return `
                <tr>
                  <td>${escapeHtml(day.dayKey)}</td>
                  <td>${escapeHtml(day.date)}</td>
                  <td>${escapeHtml(day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`)}</td>
                  <td>${hasLunch ? 'Lunch selected (no packing needed)' : 'Pack lunch needed'}</td>
                </tr>
              `;
                }).join('');
                return `
            <section class="weekBlock">
              <h4>Week ${weekIndex + 1}: ${escapeHtml((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWeekLabel"])(row.week))}</h4>
              <table>
                <thead><tr><th>Day</th><th>Date</th><th>Camp Schedule</th><th>Lunch Plan</th></tr></thead>
                <tbody>${dayLines}</tbody>
              </table>
            </section>
          `;
            }).join('');
            return `
          <section class="studentSection">
            <h2>${escapeHtml(camperName)}</h2>
            <p>
              <span class="pill">Lunch selected: ${lunchDays}/${registeredDays} days</span>
              <span class="pill">Pack lunch needed: ${packDays} days</span>
            </p>
            <p class="note">On lunch-selected days, our team will contact you closer to each camp week to confirm lunch options.</p>

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
        `;
        }).join('');
        let familyCalendarHtml = '<p>No camp days selected yet.</p>';
        if (allCampEntries.length > 0) {
            const byDate = new Map();
            for (const entry of allCampEntries){
                const list = byDate.get(entry.date) || [];
                list.push(entry);
                byDate.set(entry.date, list);
            }
            const dateKeys = Array.from(byDate.keys()).sort((a, b)=>a.localeCompare(b));
            const firstDate = parseDateLocal(dateKeys[0]);
            const lastDate = parseDateLocal(dateKeys[dateKeys.length - 1]);
            if (firstDate && lastDate) {
                const start = startOfWeekSunday(firstDate);
                const end = endOfWeekSaturday(lastDate);
                const weekRows = [];
                let cursor = new Date(start);
                while(cursor <= end){
                    const weekCells = [];
                    for(let i = 0; i < 7; i += 1){
                        const key = isoDate(cursor);
                        const cellEntries = byDate.get(key) || [];
                        const itemsHtml = cellEntries.map((item)=>{
                            const modeLabel = item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`;
                            return `<li><strong>${escapeHtml(item.camperName)}</strong>: ${item.hasLunch ? 'Lunch purchase' : 'Pack lunch'} (${escapeHtml(modeLabel)})</li>`;
                        }).join('');
                        const inRange = key >= dateKeys[0] && key <= dateKeys[dateKeys.length - 1];
                        weekCells.push(`
              <div class="calendarCell ${inRange ? '' : 'muted'}">
                <div class="calendarDate">${escapeHtml(key)}</div>
                ${itemsHtml ? `<ul>${itemsHtml}</ul>` : '<p class="emptyCell">No camp</p>'}
              </div>
            `);
                        cursor = addDays(cursor, 1);
                    }
                    weekRows.push(`<div class="calendarWeek">${weekCells.join('')}</div>`);
                }
                familyCalendarHtml = `
          <div class="calendarHeaderRow">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="calendarGrid">${weekRows.join('')}</div>
        `;
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
          <p class="meta"><strong>Email:</strong> ${escapeHtml(targetRegistration.contactEmail || 'not provided')} | <strong>Generated:</strong> ${escapeHtml(todayLabel)}</p>
          <p class="note">This summary includes basic info, tuition table, and lunch calendar details.</p>
          ${studentSections}
          <div class="pageBreak"></div>
          <h2>Family Camp & Lunch Calendar</h2>
          <p class="note">Each camp day shows whether each camper will purchase lunch or needs to pack lunch.</p>
          ${familyCalendarHtml}
        </body>
      </html>
    `;
    }
    function openSummaryOverlay(targetRegistration = registration) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        setSummaryOverlayHtml(buildRegistrationSummaryHtml(targetRegistration));
        setSummaryOverlayOpen(true);
    }
    function printSummaryOverlay() {
        const iframeWindow = summaryIframeRef.current?.contentWindow;
        if (!iframeWindow) {
            return;
        }
        iframeWindow.focus();
        iframeWindow.print();
    }
    function emailSummaryToSelf(targetRegistration = registration) {
        if (!targetRegistration?.students?.length) {
            return;
        }
        const lines = targetRegistration.students.map((student, index)=>{
            const camperName = student.fullName.trim() || `Camper ${index + 1}`;
            const lunchWeeks = getLunchWeeksForStudent(student, weeksById);
            const registeredDays = lunchWeeks.reduce((sum, row)=>sum + row.selectedDays.length, 0);
            const lunchDays = lunchWeeks.reduce((sum, row)=>sum + row.selectedDays.filter((day)=>Boolean(student.lunch[day.key])).length, 0);
            const packDays = Math.max(0, registeredDays - lunchDays);
            return `${camperName}: lunch ${lunchDays}/${registeredDays}, pack lunch ${packDays}`;
        });
        const subject = encodeURIComponent('Summer Camp Registration Summary');
        const body = encodeURIComponent(`${lines.join('\n')}\n\n` + `On lunch-selected days, camp staff will contact you closer to date about lunch options.\n\n` + `To save a full PDF summary, open the registration summary overlay and click Print / Save PDF.`);
        const to = encodeURIComponent(targetRegistration.contactEmail || '');
        window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_self');
    }
    async function submitRegistration(event) {
        event.preventDefault();
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseEnabled"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            setMessage('Add your Supabase URL and anon key to submit registrations.');
            return;
        }
        setSubmitting(true);
        setMessage('');
        const firstStudent = registration.students[0];
        const nameParts = splitName(firstStudent?.fullName || '');
        const payload = {
            camper_first_name: nameParts.firstName,
            camper_last_name: nameParts.lastName,
            age: Math.max(3, Math.min(17, calcAge(firstStudent?.dob))),
            experience_level: 'mixed',
            guardian_name: 'Parent/Guardian',
            guardian_email: registration.contactEmail.trim(),
            guardian_phone: registration.contactPhone.trim(),
            emergency_contact: registration.contactPhone.trim(),
            medical_notes: JSON.stringify({
                registration,
                submittedAt: new Date().toISOString()
            }),
            created_at: new Date().toISOString()
        };
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('registrations').insert(payload);
        if (error) {
            setSubmitting(false);
            setMessage(`Submission failed: ${error.message}`);
            return;
        }
        const submittedSnapshot = JSON.parse(JSON.stringify(registration));
        setSubmittedRegistrationSnapshot(submittedSnapshot);
        setSubmitting(false);
        setMessage('Registration submitted successfully. You can still open your summary below.');
        setRegistration({
            contactEmail: '',
            contactPhone: '',
            students: [
                createStudent()
            ]
        });
        setActiveStudentId('');
        setExpandedStudentId('');
        setStep(1);
        if ("TURBOPACK compile-time truthy", 1) {
            window.localStorage.removeItem(REGISTRATION_DRAFT_KEY);
        }
    }
    const resolvedActiveStudentId = activeStudentId || registration.students[0]?.id || '';
    const activeStudent = registration.students.find((student)=>student.id === resolvedActiveStudentId);
    const activeStudentIndex = Math.max(0, registration.students.findIndex((student)=>student.id === resolvedActiveStudentId));
    const expandedStudent = registration.students.find((student)=>student.id === expandedStudentId);
    const activeStudentDisplayName = activeStudent?.fullName?.trim() || 'this camper';
    const activeCamperLabel = activeStudent?.fullName?.trim() || `Camper ${activeStudentIndex + 1}`;
    const contactEmailMissing = !registration.contactEmail.trim();
    const contactPhoneMissing = !registration.contactPhone.trim();
    const step2HasMissing = registration.students.some((student)=>{
        for (const entry of Object.values(student.schedule || {})){
            const hasAnySelected = Object.values(entry.days || {}).some((mode)=>mode && mode !== 'NONE');
            if (hasAnySelected) {
                return false;
            }
        }
        return true;
    });
    const step3HasMissing = registration.students.some((student)=>{
        const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean);
        return !hasAnyLunch && !student.lunchConfirmedNone;
    });
    const copySourceOptions = registration.students.map((student, index)=>({
            id: student.id,
            label: student.fullName.trim() || `Camper ${index + 1}`
        })).filter((student)=>student.id !== resolvedActiveStudentId);
    const stepShortTitle = step === 1 ? 'Step 1: Family & camper details' : step === 2 ? `Step 2: Select which weeks ${activeStudentDisplayName} will attend` : step === 3 ? `Step 3: Select lunch options for ${activeStudentDisplayName}` : 'Step 4: Review totals and submit registration';
    const activeRegistrationStepImage = adminConfig.media.registrationStepImageUrls?.[step - 1] || '';
    const fullWeekDiscountAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[fullWeekDiscountAmount]": ()=>{
            const regularFullWeek = Number(adminConfig.tuition.regular.fullWeek || 0);
            const discountedFullWeek = Number(adminConfig.tuition.discount.fullWeek || 0);
            if (regularFullWeek <= 0 || discountedFullWeek <= 0) {
                return 0;
            }
            return Math.max(0, regularFullWeek - discountedFullWeek);
        }
    }["HomePage.useMemo[fullWeekDiscountAmount]"], [
        adminConfig.tuition.discount.fullWeek,
        adminConfig.tuition.regular.fullWeek
    ]);
    const discountAmountLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePage.useMemo[discountAmountLabel]": ()=>{
            return fullWeekDiscountAmount > 0 ? `${currency(fullWeekDiscountAmount)} OFF` : '$0 OFF';
        }
    }["HomePage.useMemo[discountAmountLabel]"], [
        fullWeekDiscountAmount
    ]);
    const activeSurveyImage = surveyStep === 1 ? adminConfig.media.surveyStepImageUrls?.[0] || '' : surveyStep === 2 ? adminConfig.media.surveyStepImageUrls?.[1] || '' : surveyStep === 3 ? adminConfig.media.surveyStepImageUrls?.[2] || '' : surveyStep === 4 ? adminConfig.media.surveyStepImageUrls?.[3] || '' : surveyStep === 5 ? adminConfig.media.surveyStepImageUrls?.[3] || '' : surveyStep === 6 ? adminConfig.media.surveyStepImageUrls?.[4] || '' : adminConfig.media.surveyStepImageUrls?.[5] || '';
    const activeSurveyVideo = adminConfig.media.surveyVideoUrl || '';
    const activeSurveyYouTubeEmbed = getYouTubeEmbedUrl(activeSurveyVideo);
    const claimableDiscountTotal = getClaimableDiscountTotal();
    const surveyEmailInvalid = surveyStep === 1 && surveyMessage.toLowerCase().includes('valid email');
    const surveyDiscountReminder = adminConfig.tuition.discountEndDate && discountActive ? text(`Early discount is available through ${adminConfig.tuition.discountEndDate}.`, `早鸟优惠有效期至 ${adminConfig.tuition.discountEndDate}。`) : '';
    const welcomeBlock = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "startWelcome",
        children: [
            adminConfig.media.welcomeLogoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                className: "startLogoImage",
                src: adminConfig.media.welcomeLogoUrl,
                alt: "Summer camp logo"
            }, void 0, false, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 2640,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "startLogoPlaceholder",
                "aria-label": "Logo placeholder",
                children: "Logo Placeholder"
            }, void 0, false, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 2642,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: text('Welcome to Wushu Summer Camp', '欢迎来到武术夏令营')
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2647,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "startAwardLine",
                        children: text('Winner of 2025, 2025, 2025, 2023 Best Martial Arts School', '荣获 2025、2025、2025、2023 年度最佳武术学校')
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2648,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "startWushuLine",
                        children: text('What is Wushu? Martial Arts. Power. Precision. Pride.', '什么是武术？武术。力量、精准、荣耀。')
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2654,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: text('Train fierce, build confidence, and make unforgettable summer memories.', '强健体魄，建立自信，收获难忘夏日回忆。')
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2657,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 2646,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.jsx",
        lineNumber: 2638,
        columnNumber: 5
    }, this);
    const currentMode = isRegistrationRoute ? 'register' : entryMode;
    const isMobileLearnOverlayOpen = currentMode === 'learn' && isMobileViewport;
    const keepFloatingUiVisible = isRegistrationRoute;
    const showMainCampPage = isRegistrationRoute || currentMode === 'register' || currentMode === 'learn' && !isMobileViewport;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `page ${isRegistrationRoute ? 'registrationRoute' : ''} ${currentMode === '' ? 'startOnly' : ''} ${currentMode === 'learn' && isMobileViewport ? 'learnOnly' : ''}`,
        children: [
            currentMode === '' || isMobileLearnOverlayOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: `card section startSection ${adminConfig.media.surveyMobileBgUrl ? 'startMobileBg' : ''}`,
                id: "start-here",
                style: adminConfig.media.surveyMobileBgUrl ? {
                    '--start-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")`
                } : undefined,
                children: [
                    welcomeBlock,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "startChoiceRow",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "startChoiceCard",
                                onClick: jumpToRegistration,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: text('I am ready to register', '我准备报名')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 2695,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: text('Go directly to the registration flow and lock in your camp weeks.', '直接进入报名流程，锁定夏令营周次。')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 2696,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 2690,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "startChoiceCard",
                                onClick: chooseLearnPath,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: text('I want to learn more about your program', '我想了解更多课程信息')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 2703,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: text('This guided flow helps us determine the best-fit camp path for your family.', '这个引导流程将帮助我们为您的家庭匹配最适合的营地方案。')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 2704,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 2698,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2689,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "startChoiceNote",
                        children: [
                            text('Not sure yet? Click ', '还不确定？点击上方'),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: text('Learn More', '了解更多')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 2709,
                                columnNumber: 11
                            }, this),
                            text(' above.', '。')
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2707,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "startGoSummerInline",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "button secondary goSummerChip",
                            onClick: jumpToCampTop,
                            children: text('Go to Summer Camp Page', '进入夏令营页面')
                        }, void 0, false, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 2713,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 2712,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 2679,
                columnNumber: 7
            }, this) : null,
            currentMode === 'learn' ? isMobileViewport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "learnOverlay",
                role: "dialog",
                "aria-modal": "true",
                "aria-label": text('Camp Fit Assistant', '营地匹配助手'),
                onClick: ()=>setEntryMode(''),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    ref: surveyRef,
                    className: `card section surveySection mobileLearnOverlayPanel ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`,
                    id: "program-guide",
                    onClick: (event)=>event.stopPropagation(),
                    style: surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? {
                        '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")`
                    } : undefined,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mobileOverlayTopActions",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary goSummerChip",
                                onClick: jumpToCampTop,
                                children: text('Go to Summer Camp Page', '进入夏令营页面')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 2741,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 2740,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: `surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "surveyStepPanel",
                                    children: [
                                        surveyStep > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "surveyFeedback",
                                            children: getSurveyFeedback(surveyStep - 1)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2747,
                                            columnNumber: 33
                                        }, this) : null,
                                        surveyDiscountReminder && surveyStep >= 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "surveyDiscountReminder",
                                            children: surveyDiscountReminder
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2749,
                                            columnNumber: 17
                                        }, this) : null,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyVisual",
                                            children: activeSurveyImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: activeSurveyImage,
                                                alt: `Program finder step ${surveyStep} visual`
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 2753,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyVisualPlaceholder",
                                                children: "Add images in /admin media to show step visuals."
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 2755,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2751,
                                            columnNumber: 15
                                        }, this),
                                        surveyStep === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2761,
                                                    columnNumber: 19
                                                }, this),
                                                adminConfig.media.surveyStep1FlyerUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyFunFlyer",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: adminConfig.media.surveyStep1FlyerUrl,
                                                        alt: "Summer camp marketing flyer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 2764,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2763,
                                                    columnNumber: 21
                                                }, this) : null,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: [
                                                        text('Contact email', '联系邮箱'),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "email",
                                                            value: surveyData.contactEmail,
                                                            onChange: (event)=>updateSurveyField('contactEmail', event.target.value),
                                                            placeholder: text('name@email.com', 'name@email.com')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2769,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2767,
                                                    columnNumber: 19
                                                }, this),
                                                surveyEmailInvalid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "surveyFieldError",
                                                    children: text('Please enter a valid email address.', '请输入有效邮箱地址。')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2776,
                                                    columnNumber: 41
                                                }, this) : null,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: [
                                                        text('Number of campers', '营员人数'),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            inputMode: "numeric",
                                                            value: surveyData.camperCount,
                                                            onChange: (event)=>setSurveyCamperCount(event.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2779,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2777,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyAgeGrid",
                                                    children: surveyData.camperAges.map((age, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            children: [
                                                                text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    inputMode: "numeric",
                                                                    value: age,
                                                                    onChange: (event)=>setSurveyCamperAge(index, event.target.value)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2790,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, `age-${index}`, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2788,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2786,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2760,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2804,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`,
                                                            onClick: ()=>setSurveySportsParticipation('yes'),
                                                            children: text('Yes', '有')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2806,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`,
                                                            onClick: ()=>setSurveySportsParticipation('no'),
                                                            children: text('No', '没有')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2813,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2805,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2803,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('3. Sports experience details', '3. 运动经历详情')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2826,
                                                    columnNumber: 19
                                                }, this),
                                                surveyData.hasSports === 'yes' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: [
                                                        text('What sports?', '参与过哪些运动？'),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            value: surveyData.sportsList,
                                                            onChange: (event)=>updateSurveyField('sportsList', event.target.value),
                                                            placeholder: text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2830,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2828,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            children: text('What would you like your child to build first?', '希望孩子优先提升哪方面？')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2838,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "subhead",
                                                            children: [
                                                                text('Select up to 3', '最多选择3项'),
                                                                " (",
                                                                surveyData.noSportsPriority.length,
                                                                "/3)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2839,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "surveyChoiceRow",
                                                            children: [
                                                                'confidence',
                                                                'coordination',
                                                                'focus',
                                                                'fitness',
                                                                'flexibility',
                                                                'strength',
                                                                'discipline',
                                                                'social confidence'
                                                            ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: `choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`,
                                                                    onClick: ()=>toggleNoSportsPriority(item),
                                                                    children: item
                                                                }, item, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2853,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2842,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "surveySupportMedia",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "surveySupportCard",
                                                                children: adminConfig.media.surveyStepImageUrls?.[2] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: adminConfig.media.surveyStepImageUrls[2],
                                                                    alt: "Step 2 support visual"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2866,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "surveyVisualPlaceholder",
                                                                    children: "Add Step 2B image in admin media"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2868,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 2864,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2863,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2825,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('4. Martial arts experience', '4. 是否有武术经历')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2879,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`,
                                                            onClick: ()=>updateSurveyField('hasMartial', 'yes'),
                                                            children: text('Yes', '有')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2881,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`,
                                                            onClick: ()=>updateSurveyField('hasMartial', 'no'),
                                                            children: text('No', '没有')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2888,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2880,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2878,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 5 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('5. Martial arts background details', '5. 武术背景详情')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2901,
                                                    columnNumber: 19
                                                }, this),
                                                surveyData.hasMartial === 'yes' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyAgeGrid",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            children: [
                                                                text('Years', '年'),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    inputMode: "numeric",
                                                                    value: surveyData.martialYears,
                                                                    onChange: (event)=>updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2906,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2904,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            children: [
                                                                text('Months', '月'),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    inputMode: "numeric",
                                                                    value: surveyData.martialMonths,
                                                                    onChange: (event)=>updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 2917,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2915,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2903,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "surveyInlineResponse",
                                                    children: text('No problem at all. Many of our strongest students started with zero martial arts experience.', '完全没问题。很多优秀学员都是从零基础开始。')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2928,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2900,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 6 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2940,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: surveyActivities.map((activity)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`,
                                                            onClick: ()=>toggleSurveyActivity(activity.value),
                                                            children: text(activity.label, activity.zhLabel)
                                                        }, activity.value, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2943,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2941,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2954,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`,
                                                            onClick: ()=>updateSurveyField('lunchInterest', 'yes'),
                                                            children: text('Yes', '是')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2956,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`,
                                                            onClick: ()=>updateSurveyField('lunchInterest', 'no'),
                                                            children: text('No', '否')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2963,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2955,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: text('This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.', '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2971,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('6c. What are your goals?', '6c. 您的目标是什么？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2978,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: surveyGoals.map((goal)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: `choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`,
                                                            onClick: ()=>toggleSurveyGoal(goal.value),
                                                            children: text(goal.label, goal.zhLabel)
                                                        }, goal.value, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 2981,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2979,
                                                    columnNumber: 19
                                                }, this),
                                                getGoalsEncouragement() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "surveyInlineResponse",
                                                    children: getGoalsEncouragement()
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2991,
                                                    columnNumber: 46
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2939,
                                            columnNumber: 17
                                        }, this) : null,
                                        surveyStep === 7 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyQuestion",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('7. Recommended camp plan', '7. 推荐营地方案')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 2997,
                                                    columnNumber: 17
                                                }, this),
                                                (()=>{
                                                    const recommendation = buildSurveyRecommendation();
                                                    const [leadLine, ...detailLines] = recommendation;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "recommendationCard recommendationCardFinal",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "recommendationBadgeRow",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "recommendationBadge",
                                                                        children: text('Awarded Best in Burlington', '伯灵顿获奖学院')
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 3004,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "recommendationBadge secondary",
                                                                        children: text('Certified Top Coaches', '认证顶级教练团队')
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 3005,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3003,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "recommendationLead",
                                                                children: leadLine
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3007,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "surveyResultList",
                                                                children: detailLines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        children: line
                                                                    }, line, false, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 3010,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3008,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3002,
                                                        columnNumber: 21
                                                    }, this);
                                                })(),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: text('Are you ready to register?', '准备好报名了吗？')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3017,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "surveyChoiceRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button",
                                                            onClick: handleReadyToRegister,
                                                            children: text('Yes, take me to registration', '是的，带我去报名')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3019,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: handleThinkAboutIt,
                                                            children: text('I need time to think', '我需要再考虑一下')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3022,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3018,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 2996,
                                            columnNumber: 17
                                        }, this) : null,
                                        getSurveyDidYouKnowFact() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "surveyDidYouKnow",
                                            children: getSurveyDidYouKnowFact()
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3029,
                                            columnNumber: 44
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 2746,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "surveyActions",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "button secondary",
                                            onClick: previousSurveyStep,
                                            disabled: surveyStep === 1,
                                            children: text('Back', '返回')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3033,
                                            columnNumber: 15
                                        }, this),
                                        surveyStep < SURVEY_TOTAL_STEPS ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "button",
                                            onClick: nextSurveyStep,
                                            disabled: savingSurveyProfile,
                                            children: savingSurveyProfile ? text('Saving...', '保存中...') : text('Next', '下一步')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3042,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3032,
                                    columnNumber: 13
                                }, this),
                                surveyMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "message",
                                    children: surveyMessage
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3047,
                                    columnNumber: 30
                                }, this) : null,
                                activeSurveyVideo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "surveyVideoDock",
                                    children: activeSurveyYouTubeEmbed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                        src: activeSurveyYouTubeEmbed,
                                        title: "Program guide video",
                                        allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
                                        allowFullScreen: true
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3051,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                        controls: true,
                                        muted: true,
                                        autoPlay: true,
                                        loop: true,
                                        playsInline: true,
                                        preload: "metadata",
                                        src: activeSurveyVideo
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3058,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3049,
                                    columnNumber: 15
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 2745,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.jsx",
                    lineNumber: 2729,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 2722,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                ref: surveyRef,
                className: `card section surveySection desktopAssistantWindow ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`,
                id: "program-guide",
                style: surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? {
                    '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")`
                } : undefined,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mobileOverlayTopActions desktopSurveyTopActions",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "button secondary goSummerChip",
                            onClick: jumpToCampTop,
                            children: text('Go to Summer Camp Page', '进入夏令营页面')
                        }, void 0, false, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 3085,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3084,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: `surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "surveyStepPanel",
                                children: [
                                    surveyStep > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "surveyFeedback",
                                        children: getSurveyFeedback(surveyStep - 1)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3091,
                                        columnNumber: 33
                                    }, this) : null,
                                    surveyDiscountReminder && surveyStep >= 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "surveyDiscountReminder",
                                        children: surveyDiscountReminder
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3093,
                                        columnNumber: 17
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyVisual",
                                        children: activeSurveyImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: activeSurveyImage,
                                            alt: `Program finder step ${surveyStep} visual`
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3097,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "surveyVisualPlaceholder",
                                            children: "Add images in /admin media to show step visuals."
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3099,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3095,
                                        columnNumber: 15
                                    }, this),
                                    surveyStep === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3105,
                                                columnNumber: 19
                                            }, this),
                                            adminConfig.media.surveyStep1FlyerUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyFunFlyer",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: adminConfig.media.surveyStep1FlyerUrl,
                                                    alt: "Summer camp marketing flyer"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3108,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3107,
                                                columnNumber: 21
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    text('Contact email', '联系邮箱'),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "email",
                                                        value: surveyData.contactEmail,
                                                        onChange: (event)=>updateSurveyField('contactEmail', event.target.value),
                                                        placeholder: text('name@email.com', 'name@email.com')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3113,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3111,
                                                columnNumber: 19
                                            }, this),
                                            surveyEmailInvalid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "surveyFieldError",
                                                children: text('Please enter a valid email address.', '请输入有效邮箱地址。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3120,
                                                columnNumber: 41
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    text('Number of campers', '营员人数'),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        inputMode: "numeric",
                                                        value: surveyData.camperCount,
                                                        onChange: (event)=>setSurveyCamperCount(event.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3123,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3121,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyAgeGrid",
                                                children: surveyData.camperAges.map((age, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: [
                                                            text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                inputMode: "numeric",
                                                                value: age,
                                                                onChange: (event)=>setSurveyCamperAge(index, event.target.value)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3134,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, `age-${index}`, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3132,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3130,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3104,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3148,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`,
                                                        onClick: ()=>setSurveySportsParticipation('yes'),
                                                        children: text('Yes', '有')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3150,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`,
                                                        onClick: ()=>setSurveySportsParticipation('no'),
                                                        children: text('No', '没有')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3157,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3149,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3147,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('3. Sports experience details', '3. 运动经历详情')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3170,
                                                columnNumber: 19
                                            }, this),
                                            surveyData.hasSports === 'yes' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    text('What sports?', '参与过哪些运动？'),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: surveyData.sportsList,
                                                        onChange: (event)=>updateSurveyField('sportsList', event.target.value),
                                                        placeholder: text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3174,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3172,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        children: text('What would you like your child to build first?', '希望孩子优先提升哪方面？')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3182,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "subhead",
                                                        children: [
                                                            text('Select up to 3', '最多选择3项'),
                                                            " (",
                                                            surveyData.noSportsPriority.length,
                                                            "/3)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3183,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "surveyChoiceRow",
                                                        children: [
                                                            'confidence',
                                                            'coordination',
                                                            'focus',
                                                            'fitness',
                                                            'flexibility',
                                                            'strength',
                                                            'discipline',
                                                            'social confidence'
                                                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: `choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`,
                                                                onClick: ()=>toggleNoSportsPriority(item),
                                                                children: item
                                                            }, item, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3197,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3186,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "surveySupportMedia",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "surveySupportCard",
                                                            children: adminConfig.media.surveyStepImageUrls?.[2] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: adminConfig.media.surveyStepImageUrls[2],
                                                                alt: "Step 2 support visual"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3210,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "surveyVisualPlaceholder",
                                                                children: "Add Step 2B image in admin media"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3212,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3208,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3207,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3169,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('4. Martial arts experience', '4. 是否有武术经历')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3223,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`,
                                                        onClick: ()=>updateSurveyField('hasMartial', 'yes'),
                                                        children: text('Yes', '有')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3225,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`,
                                                        onClick: ()=>updateSurveyField('hasMartial', 'no'),
                                                        children: text('No', '没有')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3232,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3224,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3222,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 5 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('5. Martial arts background details', '5. 武术背景详情')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3245,
                                                columnNumber: 19
                                            }, this),
                                            surveyData.hasMartial === 'yes' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyAgeGrid",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: [
                                                            text('Years', '年'),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                inputMode: "numeric",
                                                                value: surveyData.martialYears,
                                                                onChange: (event)=>updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3250,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3248,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: [
                                                            text('Months', '月'),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                inputMode: "numeric",
                                                                value: surveyData.martialMonths,
                                                                onChange: (event)=>updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3261,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3259,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3247,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "surveyInlineResponse",
                                                children: text('No problem at all. Many of our strongest students started with zero martial arts experience.', '完全没问题。很多优秀学员都是从零基础开始。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3272,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3244,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 6 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3284,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: surveyActivities.map((activity)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`,
                                                        onClick: ()=>toggleSurveyActivity(activity.value),
                                                        children: text(activity.label, activity.zhLabel)
                                                    }, activity.value, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3287,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3285,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3298,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`,
                                                        onClick: ()=>updateSurveyField('lunchInterest', 'yes'),
                                                        children: text('Yes', '是')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3300,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`,
                                                        onClick: ()=>updateSurveyField('lunchInterest', 'no'),
                                                        children: text('No', '否')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3307,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3299,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: text('This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.', '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3315,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('6c. What are your goals?', '6c. 您的目标是什么？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3322,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: surveyGoals.map((goal)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`,
                                                        onClick: ()=>toggleSurveyGoal(goal.value),
                                                        children: text(goal.label, goal.zhLabel)
                                                    }, goal.value, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3325,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3323,
                                                columnNumber: 19
                                            }, this),
                                            getGoalsEncouragement() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "surveyInlineResponse",
                                                children: getGoalsEncouragement()
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3335,
                                                columnNumber: 46
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3283,
                                        columnNumber: 17
                                    }, this) : null,
                                    surveyStep === 7 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "surveyQuestion",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('7. Recommended camp plan', '7. 推荐营地方案')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3341,
                                                columnNumber: 17
                                            }, this),
                                            (()=>{
                                                const recommendation = buildSurveyRecommendation();
                                                const [leadLine, ...detailLines] = recommendation;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "recommendationCard recommendationCardFinal",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "recommendationBadgeRow",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "recommendationBadge",
                                                                    children: text('Awarded Best in Burlington', '伯灵顿获奖学院')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 3348,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "recommendationBadge secondary",
                                                                    children: text('Certified Top Coaches', '认证顶级教练团队')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 3349,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3347,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "recommendationLead",
                                                            children: leadLine
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3351,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "surveyResultList",
                                                            children: detailLines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    children: line
                                                                }, line, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 3354,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3352,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3346,
                                                    columnNumber: 21
                                                }, this);
                                            })(),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Are you ready to register?', '准备好报名了吗？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3361,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "button",
                                                        onClick: handleReadyToRegister,
                                                        children: text('Yes, take me to registration', '是的，带我去报名')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3363,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "button secondary",
                                                        onClick: handleThinkAboutIt,
                                                        children: text('I need time to think', '我需要再考虑一下')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3366,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3362,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3340,
                                        columnNumber: 17
                                    }, this) : null,
                                    getSurveyDidYouKnowFact() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "surveyDidYouKnow",
                                        children: getSurveyDidYouKnowFact()
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3373,
                                        columnNumber: 44
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3090,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "surveyActions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button secondary",
                                        onClick: previousSurveyStep,
                                        disabled: surveyStep === 1,
                                        children: text('Back', '返回')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3377,
                                        columnNumber: 15
                                    }, this),
                                    surveyStep < SURVEY_TOTAL_STEPS ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button",
                                        onClick: nextSurveyStep,
                                        disabled: savingSurveyProfile,
                                        children: savingSurveyProfile ? text('Saving...', '保存中...') : text('Next', '下一步')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3386,
                                        columnNumber: 17
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3376,
                                columnNumber: 13
                            }, this),
                            surveyMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "message",
                                children: surveyMessage
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3391,
                                columnNumber: 30
                            }, this) : null,
                            activeSurveyVideo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "surveyVideoDock",
                                children: activeSurveyYouTubeEmbed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                    src: activeSurveyYouTubeEmbed,
                                    title: "Program guide video",
                                    allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
                                    allowFullScreen: true
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3395,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                    controls: true,
                                    muted: true,
                                    autoPlay: true,
                                    loop: true,
                                    playsInline: true,
                                    preload: "metadata",
                                    src: activeSurveyVideo
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3402,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3393,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3089,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 3074,
                columnNumber: 9
            }, this) : null,
            showMainCampPage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "hero card",
                        id: "camp-info",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: "New England Wushu Summer Camp 2026"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3422,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: text('Train hard, build confidence, and have a summer kids remember.', '刻苦训练，建立自信，成就难忘夏天。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3423,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Ages 3-17. Small groups, skill-based coaching, and weekly family showcases.', '3-17岁。小班教学、分级训练、每周家庭展示。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3424,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heroTrustRow",
                                "aria-label": "Program highlights",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: text('Burlington award-winning academy', '伯灵顿获奖学院')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3426,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: text('500+ competition medals earned', '累计500+竞赛奖牌')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3427,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: text('Certified, experienced coaching team', '认证且经验丰富的教练团队')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3428,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3425,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heroMarketingCard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: text('Why families choose us', '为什么家庭选择我们')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3431,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: text('Structured training, real progress tracking, and a supportive team culture that keeps campers motivated all summer. New this year: the Level Up app lets families book lunch by day and follow progress with photos and videos.', '结构化训练、可视化成长追踪和支持型团队文化，让孩子整个夏天都保持动力。今年新增：Level Up 应用支持按天订午餐，并通过照片和视频跟踪成长。')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3432,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3430,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heroScienceRow",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "heroScienceCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Skill-Progressive Coaching', '循序渐进训练')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3441,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: text('Camp plans follow progressive motor-learning stages so kids build technique with confidence, not random drills.', '课程按运动学习阶段递进设计，让孩子通过系统训练稳定提升。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3442,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3440,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "heroScienceCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Weekly Feedback Loop', '每周反馈闭环')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3450,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: text('Coaches use weekly checkpoints and showcase prep to reinforce retention, focus, and measurable growth.', '教练通过每周检查点与展示准备，强化技能记忆、专注力与可见进步。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3451,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3449,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "heroScienceCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Confidence Through Team Learning', '团队学习提升自信')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3459,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: text('Partner drills and guided team challenges improve social confidence while accelerating athletic development.', '搭档训练与团队挑战在提升社交自信的同时，加快运动能力发展。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3460,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3458,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3439,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heroActions",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button",
                                    onClick: jumpToRegistration,
                                    children: text('Start Registration', '开始报名')
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3470,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3469,
                                columnNumber: 9
                            }, this),
                            activeCampGalleryItem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heroGalleryWrap",
                                onTouchStart: onCampGalleryTouchStart,
                                onTouchEnd: onCampGalleryTouchEnd,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "heroGalleryRail",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "heroGalleryArrow left",
                                                onClick: previousCampGallerySlide,
                                                "aria-label": text('Previous camp photo', '上一张营地照片'),
                                                children: "←"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3482,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "heroGallerySide left",
                                                "aria-hidden": "true",
                                                children: previousCampGalleryItem?.src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: previousCampGalleryItem.src,
                                                    alt: ""
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3492,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "heroGalleryPlaceholderSide",
                                                    children: previousCampGalleryItem?.slot || text('Camp Photo', '营地照片')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3494,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3490,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("figure", {
                                                className: `heroGalleryMain ${campGalleryDirection === 'next' ? 'next' : 'prev'}`,
                                                children: activeCampGalleryItem.src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    className: "heroMedia",
                                                    src: activeCampGalleryItem.src,
                                                    alt: text('Summer camp gallery', '夏令营图集')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3502,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "heroMediaPlaceholder",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: activeCampGalleryItem.slot
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3505,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: text('Upload this photo slot in /admin media.', '请在 /admin 媒体中上传此照片位。')
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3506,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3504,
                                                    columnNumber: 19
                                                }, this)
                                            }, `gallery-${normalizedCampGalleryIndex}`, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3497,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "heroGallerySide right",
                                                "aria-hidden": "true",
                                                children: nextCampGalleryItem?.src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: nextCampGalleryItem.src,
                                                    alt: ""
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3512,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "heroGalleryPlaceholderSide",
                                                    children: nextCampGalleryItem?.slot || text('Camp Photo', '营地照片')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3514,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3510,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "heroGalleryArrow right",
                                                onClick: nextCampGallerySlide,
                                                "aria-label": text('Next camp photo', '下一张营地照片'),
                                                children: "→"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3517,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3481,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "heroGalleryCaption",
                                        children: text(activeCampGalleryCaption.en, activeCampGalleryCaption.zh)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3526,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "heroGalleryDots",
                                        "aria-label": text('Camp photo position', '营地图集位置'),
                                        children: campGalleryItems.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: `dot ${index === normalizedCampGalleryIndex ? 'active' : ''}`,
                                                onClick: ()=>goToCampGallerySlide(index, index > normalizedCampGalleryIndex ? 'next' : 'prev'),
                                                "aria-label": text(`Go to photo ${index + 1}`, `跳转到第 ${index + 1} 张`)
                                            }, `gallery-dot-${index}`, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3531,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3529,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3476,
                                columnNumber: 11
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3421,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card section campFeatureShowcase",
                        id: "why-camp",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "featureShowcaseHead",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: text('Camp Highlights', '营地亮点')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3547,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: text('Designed for growth, confidence, and fun', '为成长、自信与快乐而设计')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3548,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3546,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "premiumFeatureGrid",
                                children: perks.map((perk)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "premiumFeatureCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "premiumFeatureIcon",
                                                "aria-hidden": "true",
                                                children: "◆"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3553,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: perk.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3554,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: perk.text
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3555,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, perk.title, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3552,
                                        columnNumber: 13
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3550,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3545,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        id: "camp-marketing-flow",
                        className: "card section appCarouselSection",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: text('What makes this camp the right fit?', '为什么这个营地是合适的选择？')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3562,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Follow this quick step-by-step guide to see fit, structure, options, and recommended next action.', '按步骤快速查看：匹配度、训练结构、课程选项与下一步建议。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3563,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Families also get access to our new Level Up app for lunch booking and daily training progress updates with photos/videos.', '家庭还可使用全新 Level Up 应用，进行午餐预订并查看每日训练照片/视频进度更新。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3569,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "marketingStepTabs",
                                "aria-label": text('Marketing flow steps', '营销流程步骤'),
                                children: [
                                    0,
                                    1,
                                    2,
                                    3
                                ].map((index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `marketingStepTab ${marketingFlowIndex === index ? 'active' : ''}`,
                                        onClick: ()=>setMarketingFlowIndex(index),
                                        children: text(`Step ${index + 1}`, `第 ${index + 1} 步`)
                                    }, `marketing-step-${index}`, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3577,
                                        columnNumber: 13
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3575,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "marketingFlowStack",
                                children: [
                                    marketingFlowIndex === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "overviewSlide next",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Step 1: Need a program that builds real confidence?', '第1步：需要真正提升自信的课程吗？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3590,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: text('Ages 3-17 train in level-based groups with clear weekly progress goals and family showcases.', '3-17岁分层训练，每周有清晰成长目标，并通过家庭展示强化成果。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3591,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overviewStatRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "overviewStatPill",
                                                        children: [
                                                            generalWeeks.length || 0,
                                                            " ",
                                                            text('General weeks', '普通营周次')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3598,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "overviewStatPill",
                                                        children: [
                                                            bootcampWeeks.length || 0,
                                                            " ",
                                                            text('Boot Camp weeks', '集训营周次')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3599,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "overviewStatPill",
                                                        children: [
                                                            overnightWeeks.length || 0,
                                                            " ",
                                                            text('Overnight blocks', '过夜营档期')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3600,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3597,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3589,
                                        columnNumber: 13
                                    }, this) : null,
                                    marketingFlowIndex === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "overviewSlide next",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Step 2: Want structure, not random activities?', '第2步：希望有体系，而不是零散活动？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3607,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overviewPointList",
                                                children: perks.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "overviewPointItem",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "overviewPointDot",
                                                                "aria-hidden": "true"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3611,
                                                                columnNumber: 21
                                                            }, this),
                                                            item.text
                                                        ]
                                                    }, item.title, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3610,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3608,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3606,
                                        columnNumber: 13
                                    }, this) : null,
                                    marketingFlowIndex === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "overviewSlide next",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Step 3: Need options for different goals?', '第3步：需要匹配不同目标的路径吗？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3621,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overviewPointList",
                                                children: campTypes.map((camp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "overviewPointItem",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "overviewPointDot",
                                                                "aria-hidden": "true"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3625,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: [
                                                                    camp.name,
                                                                    ":"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3626,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            camp.audience
                                                        ]
                                                    }, camp.name, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3624,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3622,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3620,
                                        columnNumber: 13
                                    }, this) : null,
                                    marketingFlowIndex === 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "overviewSlide marketingInteractiveCard next",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: text('Step 4: What matters most for your camper this summer?', '第4步：这个夏天您最看重孩子哪方面成长？')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3635,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "surveyChoiceRow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${marketingNeed === 'confidence' ? 'active' : ''}`,
                                                        onClick: ()=>setMarketingNeed('confidence'),
                                                        children: text('Confidence', '自信')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3637,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${marketingNeed === 'athletic' ? 'active' : ''}`,
                                                        onClick: ()=>setMarketingNeed('athletic'),
                                                        children: text('Athletic growth', '运动能力')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3644,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${marketingNeed === 'social' ? 'active' : ''}`,
                                                        onClick: ()=>setMarketingNeed('social'),
                                                        children: text('Social skills', '社交能力')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3651,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `choiceChip ${marketingNeed === 'tumbling' ? 'active' : ''}`,
                                                        onClick: ()=>setMarketingNeed('tumbling'),
                                                        children: text('Tumbling skills', '翻腾技巧')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3658,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3636,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "surveyInlineResponse",
                                                children: getMarketingNeedResponse()
                                            }, `marketing-need-${marketingNeed}`, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3666,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "adminActions",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button",
                                                    onClick: jumpToRegistration,
                                                    children: text('Start Registration', '开始报名')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3670,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3669,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3634,
                                        columnNumber: 13
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3587,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "marketingStepActions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button secondary",
                                        onClick: previousMarketingFlowStep,
                                        disabled: marketingFlowIndex === 0,
                                        children: text('Previous Step', '上一步')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3678,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button",
                                        onClick: nextMarketingFlowStep,
                                        disabled: marketingFlowIndex === 3,
                                        children: text('Next Step', '下一步')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3686,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3677,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3561,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card section testimonialsHero",
                        id: "student-stories",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: text('Student Stories', '学员故事')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3698,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: text('What kind of growth do families actually see?', '家庭通常能看到哪些真实成长？')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3699,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Real stories from campers and parents, directly from our current program community.', '以下内容来自现有营地家庭的真实反馈。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3700,
                                columnNumber: 9
                            }, this),
                            activeTestimonial ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "testimonialCarousel",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "testimonialArrow",
                                                onClick: previousTestimonial,
                                                "aria-label": text('Previous story', '上一条故事'),
                                                children: "←"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3709,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                                className: "testimonialCard testimonialCardActive",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "journeyDay",
                                                        children: localizeTestimonialValue(activeTestimonial.studentName, text(`Student Story ${normalizedTestimonialIndex + 1}`, `学员故事 ${normalizedTestimonialIndex + 1}`))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3718,
                                                        columnNumber: 17
                                                    }, this),
                                                    language === 'zh' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "translatedTag",
                                                        children: text('Translated', '已翻译')
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3724,
                                                        columnNumber: 38
                                                    }, this) : null,
                                                    activeTestimonialHighlights.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "testimonialHighlights",
                                                        "aria-label": text('Story highlights', '故事亮点'),
                                                        children: activeTestimonialHighlights.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "testimonialHighlightTag",
                                                                children: localizeTestimonialValue(item, item)
                                                            }, `testimonial-highlight-${item}`, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3728,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3726,
                                                        columnNumber: 19
                                                    }, this) : null,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        children: localizeTestimonialValue(activeTestimonial.headline, text('Progress story', '成长故事'))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3734,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: localizeTestimonialValue(activeTestimonial.story, text('Story coming soon.', '故事即将更新。'))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3735,
                                                        columnNumber: 17
                                                    }, this),
                                                    activeTestimonial.outcome ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "testimonialOutcome",
                                                        children: localizeTestimonialValue(activeTestimonial.outcome, activeTestimonial.outcome)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3737,
                                                        columnNumber: 19
                                                    }, this) : null
                                                ]
                                            }, `story-${normalizedTestimonialIndex}-${language}`, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3717,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "testimonialArrow",
                                                onClick: nextTestimonial,
                                                "aria-label": text('Next story', '下一条故事'),
                                                children: "→"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3742,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3708,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "testimonialDots",
                                        "aria-label": text('Story carousel position', '故事轮播位置'),
                                        children: featuredTestimonials.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: `dot ${index === normalizedTestimonialIndex ? 'active' : ''}`,
                                                onClick: ()=>setTestimonialIndex(index),
                                                "aria-label": text(`Go to story ${index + 1}`, `跳转到故事 ${index + 1}`)
                                            }, `testimonial-dot-${index}`, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3753,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3751,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3697,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        id: "camp-dates",
                        className: "card section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: text('When can my child join camp?', '孩子什么时候可以参加营地？')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3767,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Summer sessions run weekly. For General Camp and Boot Camp, families can choose Full Week, Full Day, AM Half Day, or PM Half Day based on schedule.', '夏令营按周开放。普通营和集训营可按家庭安排选择整周、整天、上午半天或下午半天。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3768,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "weekSummaryGrid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "weekSummaryCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: [
                                                    "General Camp (",
                                                    generalWeeks.length,
                                                    " weeks)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3776,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: generalWeeks.length ? text('Open now. Time options: Full Week, Full Day, AM Half Day, PM Half Day.', '现已开放。可选时间：整周、整天、上午半天、下午半天。') : text('No weeks selected yet in admin.', '后台尚未配置周次。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3777,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3775,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "weekSummaryCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: [
                                                    "Boot Camp (",
                                                    bootcampWeeks.length,
                                                    " weeks)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3787,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: bootcampWeeks.length ? text('Open now. Time options: Full Week, Full Day, AM Half Day, PM Half Day.', '现已开放。可选时间：整周、整天、上午半天、下午半天。') : text('No weeks selected yet in admin.', '后台尚未配置周次。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3788,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3786,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "weekSummaryCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: [
                                                    "Overnight Camp (",
                                                    overnightWeeks.length,
                                                    " blocks)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3798,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: overnightWeeks.length ? text('Overnight blocks are open with limited spots and separate scheduling.', '过夜营分档期开放，名额有限，采用独立排期。') : text('No weekends selected yet in admin.', '后台尚未配置过夜档期。')
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3799,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3797,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3774,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3766,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        id: "weekly-structure",
                        className: "card section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: text('What does a typical week look like?', '典型一周是怎样安排的？')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3812,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: text('Here is a clear Monday-Friday flow so families know exactly what training rhythm to expect each day.', '以下是清晰的周一到周五训练节奏，方便家庭提前了解每天安排。')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3813,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "scheduleList",
                                children: schedule.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "scheduleItem",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "scheduleDayTag",
                                                    children: item.day
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3822,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3822,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: item.activity
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3823,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, item.day, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3821,
                                        columnNumber: 13
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3819,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3811,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card section levelUpSection",
                        id: "level-up",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "phoneMock",
                                "aria-hidden": "true",
                                onTouchStart: onLevelUpTouchStart,
                                onTouchEnd: onLevelUpTouchEnd,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "phoneFrame",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "phoneNotch"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3837,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "phoneScreen",
                                            children: phoneScreenshots.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                className: `phoneImage slideImage ${slideDirection === 'next' ? 'next' : 'prev'}`,
                                                src: activeLevelUpScreenshot,
                                                alt: "Level Up app screenshot",
                                                style: {
                                                    width: `${adminConfig.media.levelUpScreenshotSize}%`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3840,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Level Up app screenshot goes here"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3847,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3838,
                                            columnNumber: 13
                                        }, this),
                                        activeLevelUpScreenshot ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            className: `phonePopoutImage ${slideDirection === 'next' ? 'next' : 'prev'}`,
                                            src: activeLevelUpScreenshot,
                                            alt: "Level Up screenshot popout effect"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3851,
                                            columnNumber: 15
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 3836,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3830,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "levelUpContent",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "Level Up App"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3861,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: text('How do campers track real progress?', '营员如何跟踪真实进步？')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3862,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: text('Camp leaders and coaches update daily progress in the app with photo/video logs, weekly schedules, and lunch ordering so parents can follow what campers do day to day.', '营地主任与教练会在应用内每日更新成长进度（含照片/视频日志）、每周日程与午餐下单，方便家长随时了解孩子每天的训练与进步。')
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3863,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "carouselControls",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "carouselBtn",
                                                onClick: previousLevelUpSlide,
                                                children: "Prev"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3871,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "carouselBtn",
                                                onClick: nextLevelUpSlide,
                                                children: "Next"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3874,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3870,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "featureList featureCarousel",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "featureItem active",
                                            children: activeLevelUpFeature
                                        }, `${activeLevelUpFeature}-${levelUpSlideIndex}`, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3880,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3879,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "carouselDots",
                                        "aria-label": "Level Up slides",
                                        children: Array.from({
                                            length: levelUpSlideCount
                                        }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: `dot ${index === levelUpSlideIndex ? 'active' : ''}`,
                                                onClick: ()=>goToLevelUpSlide(index, index > levelUpSlideIndex ? 'next' : 'prev'),
                                                "aria-label": `Go to slide ${index + 1}`
                                            }, `dot-${index}`, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3886,
                                                columnNumber: 15
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3884,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3860,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3829,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        ref: registrationRef,
                        className: "card section",
                        id: "register",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "Registration flow"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3900,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "subhead",
                                        children: "Family registration with per-camper weekly scheduling. New this year: Level Up app access for lunch booking and daily progress photos/videos."
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3901,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "registrationHeaderActions",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "button secondary",
                                            onClick: jumpToCampTop,
                                            children: text('Go to Summer Camp Page', '进入夏令营页面')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 3906,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3905,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3899,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "registrationTabBar",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "registrationTabs",
                                        role: "tablist",
                                        "aria-label": "Registration steps",
                                        children: registrationSteps.map((item)=>(()=>{
                                                const isComplete = isRegistrationStepComplete(item.id);
                                                const isMissing = !isComplete;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    role: "tab",
                                                    "aria-selected": step === item.id,
                                                    className: `registrationTab ${item.id === step ? 'active' : item.id < step && isComplete ? 'done' : ''} ${item.id < step && isMissing ? 'incomplete' : ''}`,
                                                    onClick: ()=>{
                                                        setStepDirection(item.id > step ? 'next' : 'prev');
                                                        setStep(item.id);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "registrationTabNumber",
                                                            children: item.id
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3930,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "registrationTabLabel",
                                                            children: item.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3931,
                                                            columnNumber: 17
                                                        }, this),
                                                        isMissing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "registrationStepAlertDot",
                                                            "aria-hidden": "true"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 3932,
                                                            columnNumber: 30
                                                        }, this) : null
                                                    ]
                                                }, item.id, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 3919,
                                                    columnNumber: 15
                                                }, this);
                                            })())
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3913,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "registrationCamperRow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "registrationViewingLabel",
                                                children: [
                                                    "Viewing: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: activeCamperLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3940,
                                                        columnNumber: 24
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3939,
                                                columnNumber: 13
                                            }, this),
                                            registration.students.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "registrationCamperTabs",
                                                "aria-label": "Active camper",
                                                children: registration.students.map((student, index)=>{
                                                    const label = student.fullName.trim() || `Camper ${index + 1}`;
                                                    const active = resolvedActiveStudentId === student.id;
                                                    const missing = isCamperMissingAnyStep(student);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: `registrationCamperTab ${active ? 'active' : ''}`,
                                                        onClick: ()=>{
                                                            setActiveStudentId(student.id);
                                                            setExpandedStudentId(student.id);
                                                        },
                                                        "aria-pressed": active,
                                                        children: [
                                                            label,
                                                            missing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "registrationCamperAlertDot",
                                                                "aria-hidden": "true"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 3960,
                                                                columnNumber: 34
                                                            }, this) : null
                                                        ]
                                                    }, `camper-tab-${student.id}`, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3949,
                                                        columnNumber: 21
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3943,
                                                columnNumber: 15
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3938,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3912,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "regSummarySticky",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "regSummaryToggle",
                                        onClick: ()=>setSummaryExpanded((current)=>!current),
                                        "aria-expanded": summaryExpanded,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Registration summary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3977,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                        children: [
                                                            registration.students.length,
                                                            " ",
                                                            registration.students.length === 1 ? 'camper' : 'campers',
                                                            " ·",
                                                            ' ',
                                                            summaryDigest.totalCampDays,
                                                            " selected day blocks · ",
                                                            summaryDigest.totalLunchDays,
                                                            " lunch days"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 3978,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3976,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `regSummaryChevron ${summaryExpanded ? 'open' : ''}`,
                                                children: "⌄"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 3983,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3970,
                                        columnNumber: 11
                                    }, this),
                                    summaryExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "regSummaryGrid",
                                        children: summaries.map(({ student, summary })=>(()=>{
                                                const generalTotal = summary.general.fullWeeks + summary.general.fullDays + summary.general.amDays + summary.general.pmDays;
                                                const bootTotal = summary.bootcamp.fullWeeks + summary.bootcamp.fullDays + summary.bootcamp.amDays + summary.bootcamp.pmDays;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: `regSummaryCard regSummaryButton ${resolvedActiveStudentId === student.id ? 'selected' : ''}`,
                                                    onClick: ()=>setActiveStudentId(student.id),
                                                    "aria-pressed": resolvedActiveStudentId === student.id,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "regSummaryHead",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: student.fullName || 'Unnamed camper'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4011,
                                                                    columnNumber: 23
                                                                }, this),
                                                                resolvedActiveStudentId === student.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "selectedPill",
                                                                    children: "Selected"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4012,
                                                                    columnNumber: 65
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4010,
                                                            columnNumber: 21
                                                        }, this),
                                                        generalTotal > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "summaryProgram general",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "summaryProgramTitle",
                                                                    children: "General Camp"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4017,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "summaryStatRow",
                                                                    children: [
                                                                        summary.general.fullWeeks > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('Full Week', summary.general.fullWeeks)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4020,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.general.fullDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('Full Day', summary.general.fullDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4025,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.general.amDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('AM Day', summary.general.amDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4028,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.general.pmDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('PM Day', summary.general.pmDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4031,
                                                                            columnNumber: 29
                                                                        }, this) : null
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4018,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4016,
                                                            columnNumber: 23
                                                        }, this) : null,
                                                        bootTotal > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "summaryProgram bootcamp",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "summaryProgramTitle",
                                                                    children: "Competition Boot Camp"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4039,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "summaryStatRow",
                                                                    children: [
                                                                        summary.bootcamp.fullWeeks > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('Full Week', summary.bootcamp.fullWeeks)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4042,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.bootcamp.fullDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('Full Day', summary.bootcamp.fullDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4047,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.bootcamp.amDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('AM Day', summary.bootcamp.amDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4050,
                                                                            columnNumber: 29
                                                                        }, this) : null,
                                                                        summary.bootcamp.pmDays > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "summaryStatPill",
                                                                            children: pluralize('PM Day', summary.bootcamp.pmDays)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4053,
                                                                            columnNumber: 29
                                                                        }, this) : null
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4040,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4038,
                                                            columnNumber: 23
                                                        }, this) : null,
                                                        generalTotal + bootTotal === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "summaryEmpty",
                                                            children: "No camp days selected yet."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4060,
                                                            columnNumber: 23
                                                        }, this) : null,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "summaryLunch",
                                                            children: pluralize('Lunch Day', summary.lunchCount)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4063,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, student.id, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4001,
                                                    columnNumber: 19
                                                }, this);
                                            })())
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 3986,
                                        columnNumber: 13
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "regStepHint",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: stepShortTitle
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4071,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4070,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 3969,
                                columnNumber: 9
                            }, this),
                            missingConfig ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "warning",
                                children: [
                                    "Missing environment variables. Copy ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: ".env.example"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4077,
                                        columnNumber: 49
                                    }, this),
                                    " to ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: ".env"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4077,
                                        columnNumber: 78
                                    }, this),
                                    " and add your Supabase project values."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4076,
                                columnNumber: 11
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: submitRegistration,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: `registrationStepCard ${stepDirection}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "registrationStepHero",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "registrationStepText",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "eyebrow",
                                                            children: [
                                                                "Registration Step ",
                                                                step
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4086,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            children: stepShortTitle
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4087,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4085,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "registrationStepVisual",
                                                    children: activeRegistrationStepImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: activeRegistrationStepImage,
                                                        alt: `Registration step ${step} visual`,
                                                        loading: "lazy",
                                                        decoding: "async"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4091,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "surveyVisualPlaceholder",
                                                        children: [
                                                            "Add registration step ",
                                                            step,
                                                            " image in /admin media."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4098,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4089,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4084,
                                            columnNumber: 13
                                        }, this),
                                        step === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "requiredFieldLabel",
                                                            children: [
                                                                "Contact email ",
                                                                contactEmailMissing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "requiredDot"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4105,
                                                                    columnNumber: 91
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4105,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "reg-contact-email",
                                                            type: "email",
                                                            value: registration.contactEmail,
                                                            onChange: (event)=>updateContact('contactEmail', event.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4106,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4104,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "requiredFieldLabel",
                                                            children: [
                                                                "Contact phone ",
                                                                contactPhoneMissing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "requiredDot"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4116,
                                                                    columnNumber: 91
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4116,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "reg-contact-phone",
                                                            value: registration.contactPhone,
                                                            onChange: (event)=>updateContact('contactPhone', event.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4117,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4115,
                                                    columnNumber: 15
                                                }, this),
                                                registration.students.map((student, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "full studentCollapsedRow",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "studentCollapsedHead",
                                                            onClick: ()=>{
                                                                setActiveStudentId(student.id);
                                                                setExpandedStudentId(expandedStudentId === student.id ? '' : student.id);
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                            className: "camperCardName",
                                                                            children: student.fullName.trim() || `Camper ${index + 1}`
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4136,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "camperCardMeta",
                                                                            children: [
                                                                                "Camper ",
                                                                                index + 1
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4137,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "studentDetailCta",
                                                                            children: [
                                                                                "Click here to view details for ",
                                                                                student.fullName.trim() || `Camper ${index + 1}`
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4138,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4135,
                                                                    columnNumber: 21
                                                                }, this),
                                                                !isStudentComplete(student) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "requiredDot"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4142,
                                                                    columnNumber: 52
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4127,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, student.id, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4126,
                                                        columnNumber: 17
                                                    }, this)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "full studentActionsRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: addStudent,
                                                            disabled: registration.students.length >= MAX_CAMPERS,
                                                            children: [
                                                                "+ Add family member (",
                                                                registration.students.length,
                                                                "/",
                                                                MAX_CAMPERS,
                                                                ")"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4148,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: clearRegistrationForm,
                                                            children: "Clear form"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4156,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4147,
                                                    columnNumber: 15
                                                }, this),
                                                expandedStudent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "full studentBlock",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "studentHeader",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    children: expandedStudent.fullName || `Camper ${registration.students.findIndex((student)=>student.id === expandedStudent.id) + 1}`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4164,
                                                                    columnNumber: 21
                                                                }, this),
                                                                registration.students.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "button secondary",
                                                                    onClick: ()=>removeStudent(expandedStudent.id),
                                                                    children: "Remove"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4170,
                                                                    columnNumber: 23
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4163,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Full name ",
                                                                                !expandedStudent.fullName.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4181,
                                                                                    columnNumber: 106
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4181,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            id: `reg-student-fullname-${expandedStudent.id}`,
                                                                            value: expandedStudent.fullName,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'fullName', event.target.value),
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4182,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4180,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Date of birth ",
                                                                                !parseDateLocal(expandedStudent.dob) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4190,
                                                                                    columnNumber: 114
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4190,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            id: `reg-student-dob-${expandedStudent.id}`,
                                                                            type: "date",
                                                                            value: expandedStudent.dob,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'dob', event.target.value),
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4191,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4189,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "full",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Allergies ",
                                                                                !expandedStudent.allergies.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4200,
                                                                                    columnNumber: 107
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4200,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            id: `reg-student-allergies-${expandedStudent.id}`,
                                                                            rows: "2",
                                                                            value: expandedStudent.allergies,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'allergies', event.target.value),
                                                                            placeholder: "Food, medication, environmental, or none",
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4201,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4199,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "full",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Medication ",
                                                                                !expandedStudent.medication.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4213,
                                                                                    columnNumber: 109
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4213,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            id: `reg-student-medication-${expandedStudent.id}`,
                                                                            rows: "2",
                                                                            value: expandedStudent.medication,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'medication', event.target.value),
                                                                            placeholder: "Current medications and timing instructions",
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4214,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4212,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "full",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Previous injuries ",
                                                                                !expandedStudent.previousInjury.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4226,
                                                                                    columnNumber: 120
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4226,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            id: `reg-student-injuries-${expandedStudent.id}`,
                                                                            rows: "2",
                                                                            value: expandedStudent.previousInjury,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'previousInjury', event.target.value),
                                                                            placeholder: "Any previous injuries or physical limitations",
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4227,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4225,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "full",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredFieldLabel",
                                                                            children: [
                                                                                "Other important info ",
                                                                                !expandedStudent.healthNotes.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "requiredDot"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4239,
                                                                                    columnNumber: 120
                                                                                }, this) : null
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4239,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            id: `reg-student-health-${expandedStudent.id}`,
                                                                            rows: "2",
                                                                            value: expandedStudent.healthNotes,
                                                                            onChange: (event)=>updateStudentField(expandedStudent.id, 'healthNotes', event.target.value),
                                                                            placeholder: "Anything else our coaching team should know",
                                                                            required: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4240,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4238,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4179,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4162,
                                                    columnNumber: 17
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: "All camper fields are collapsed. Tap a camper chip to expand and edit."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4254,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4103,
                                            columnNumber: 13
                                        }, this) : null,
                                        step === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "requiredFieldHint",
                                                    children: [
                                                        step2HasMissing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "requiredDot"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4261,
                                                            columnNumber: 67
                                                        }, this) : null,
                                                        " Select at least one camp day for each camper."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4261,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: [
                                                        "Looking for overnight camp? ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "#overnight-registration",
                                                            children: "Click here."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4263,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4262,
                                                    columnNumber: 15
                                                }, this),
                                                activeStudent && copySourceOptions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "registrationStepTools",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            children: [
                                                                `Copy "${activeCamperLabel}" weeks`,
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                    value: scheduleCopySourceId,
                                                                    onChange: (event)=>setScheduleCopySourceId(event.target.value),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: "",
                                                                            children: "Select camper"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4273,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        copySourceOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: option.id,
                                                                                children: option.label
                                                                            }, `copy-schedule-${option.id}`, false, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4275,
                                                                                columnNumber: 25
                                                                            }, this))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4269,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4267,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: ()=>copyScheduleFromCamper(scheduleCopySourceId),
                                                            disabled: !scheduleCopySourceId,
                                                            children: "Copy weeks"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4281,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: clearActiveStudentSchedule,
                                                            children: "Clear all weeks"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4289,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4266,
                                                    columnNumber: 17
                                                }, this) : null,
                                                activeStudent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "weekCardList",
                                                    children: registrationWeeks.map((week, weekIndex)=>{
                                                        const entry = activeStudent.schedule[week.id];
                                                        const weekSelectionSummary = getWeekSelectionSummary(entry, week);
                                                        const weekDayKeys = week.days.map((item)=>item.key);
                                                        const weekIsFull = weekDayKeys.every((day)=>(entry?.days?.[day] || 'NONE') === 'FULL');
                                                        const selectedCampType = entry?.campType || '';
                                                        const panelKey = `${activeStudent.id}:${week.id}`;
                                                        const expanded = expandedWeekKey === panelKey;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                                            className: "weekCard",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "weekHead",
                                                                    "data-week-head": panelKey,
                                                                    onClick: ()=>setExpandedWeekKey(expanded ? '' : panelKey),
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "weekHeadText",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                children: [
                                                                                    "Week ",
                                                                                    weekIndex + 1,
                                                                                    ": ",
                                                                                    week.programLabel
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4314,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWeekLabel"])(week)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4317,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                                children: [
                                                                                    "Click to expand and register for",
                                                                                    ' ',
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "activeStudentName",
                                                                                        children: activeStudent.fullName || 'this camper'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4320,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4318,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            weekSelectionSummary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "weekStatusChip",
                                                                                children: weekSelectionSummary
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4323,
                                                                                columnNumber: 31
                                                                            }, this) : null
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4313,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4307,
                                                                    columnNumber: 25
                                                                }, this),
                                                                expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "weekBody",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "toggleHintRow",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                                    className: "toggleHint",
                                                                                    children: [
                                                                                        "Select a camp type first. Then tap day chips to toggle FULL DAY, AM, PM, then off for",
                                                                                        ' ',
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "activeStudentName",
                                                                                            children: activeStudent.fullName || 'this camper'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/page.jsx",
                                                                                            lineNumber: 4332,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        "."
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4330,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    className: "tooltipBtn",
                                                                                    onClick: ()=>setHelpWeekKey(helpWeekKey === panelKey ? '' : panelKey),
                                                                                    title: "Show toggle help",
                                                                                    children: "?"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4334,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4329,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        helpWeekKey === panelKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "tooltipBubble",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                    children: "How it works:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4345,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                " select a camp type first, then tap each day chip to cycle ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                    children: "FULL DAY"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4346,
                                                                                    columnNumber: 39
                                                                                }, this),
                                                                                " -> ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                    children: "AM"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4346,
                                                                                    columnNumber: 71
                                                                                }, this),
                                                                                " -> ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                    children: "PM"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4346,
                                                                                    columnNumber: 97
                                                                                }, this),
                                                                                ' ',
                                                                                "-> off."
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4344,
                                                                            columnNumber: 31
                                                                        }, this) : null,
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "campTypeRow",
                                                                                    children: [
                                                                                        week.availableCampTypes?.includes('general') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            className: `campTypeChip general ${selectedCampType === 'general' ? 'selected' : ''}`,
                                                                                            onClick: ()=>setDayCampType(activeStudent.id, week, 'general'),
                                                                                            children: "General Camp"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/page.jsx",
                                                                                            lineNumber: 4353,
                                                                                            columnNumber: 35
                                                                                        }, this) : null,
                                                                                        week.availableCampTypes?.includes('bootcamp') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            className: `campTypeChip bootcamp ${selectedCampType === 'bootcamp' ? 'selected' : ''}`,
                                                                                            onClick: ()=>setDayCampType(activeStudent.id, week, 'bootcamp'),
                                                                                            children: "Competition Boot Camp"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/page.jsx",
                                                                                            lineNumber: 4364,
                                                                                            columnNumber: 35
                                                                                        }, this) : null
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4351,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "campTypeExplain",
                                                                                    children: selectedCampType === 'general' ? 'General Camp selected: foundational skill building for all levels.' : selectedCampType === 'bootcamp' ? 'Competition Boot Camp selected: Taolu-focused training for competition track.' : 'Choose camp type for this week.'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4375,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    className: `modeChip ${weekIsFull ? 'active full' : ''}`,
                                                                                    onClick: ()=>toggleFullWeek(activeStudent.id, week),
                                                                                    children: "Full Week (all Full Day)"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4382,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "chipRow",
                                                                                    children: dayKeys.map((day)=>{
                                                                                        const mode = entry?.days?.[day] || 'NONE';
                                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            className: `modeChip ${mode !== 'NONE' ? `active ${mode.toLowerCase()}` : ''}`,
                                                                                            onClick: ()=>cycleDay(activeStudent.id, week, day),
                                                                                            disabled: !selectedCampType,
                                                                                            children: mode === 'NONE' ? day : `${day} ${mode === 'FULL' ? 'FULL DAY' : mode}`
                                                                                        }, `${week.id}-${day}`, false, {
                                                                                            fileName: "[project]/app/page.jsx",
                                                                                            lineNumber: 4393,
                                                                                            columnNumber: 37
                                                                                        }, this);
                                                                                    })
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4389,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4328,
                                                                    columnNumber: 27
                                                                }, this) : null
                                                            ]
                                                        }, week.id, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4306,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4295,
                                                    columnNumber: 17
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4260,
                                            columnNumber: 13
                                        }, this) : null,
                                        step === 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "requiredFieldHint",
                                                    children: [
                                                        step3HasMissing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "requiredDot"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4418,
                                                            columnNumber: 67
                                                        }, this) : null,
                                                        " Each camper must choose lunch days or confirm no lunch."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4418,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: [
                                                        "Lunch is ",
                                                        currency(adminConfig.tuition.lunchPrice),
                                                        " per day for General/Boot camp days. We send the menu at the start of each week. Options include box juice or bottled water. New this year, families can also manage lunch booking and see progress photos/videos in the Level Up app."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4419,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: [
                                                        "Looking for overnight camp? ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "#overnight-registration",
                                                            children: "Click here."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4425,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4424,
                                                    columnNumber: 15
                                                }, this),
                                                activeStudent && copySourceOptions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "registrationStepTools",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            children: [
                                                                "Copy another camper lunch",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                    value: lunchCopySourceId,
                                                                    onChange: (event)=>setLunchCopySourceId(event.target.value),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: "",
                                                                            children: "Select camper"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4435,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        copySourceOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: option.id,
                                                                                children: option.label
                                                                            }, `copy-lunch-${option.id}`, false, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4437,
                                                                                columnNumber: 25
                                                                            }, this))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4431,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4429,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: ()=>copyLunchFromCamper(lunchCopySourceId),
                                                            disabled: !lunchCopySourceId,
                                                            children: "Copy lunch"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4443,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: clearActiveStudentLunch,
                                                            children: "Clear all lunch"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4451,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4428,
                                                    columnNumber: 17
                                                }, this) : null,
                                                activeStudent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "weekCardList",
                                                    children: getLunchWeeksForStudent(activeStudent, weeksById).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "subhead",
                                                        children: "No registered camp days yet for this camper."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4460,
                                                        columnNumber: 21
                                                    }, this) : getLunchWeeksForStudent(activeStudent, weeksById).map((row, weekIndex)=>{
                                                        const panelKey = `${activeStudent.id}:${row.weekId}`;
                                                        const expanded = expandedLunchWeekKey === panelKey;
                                                        const weekLunchDays = row.selectedDays.filter((day)=>Boolean(activeStudent.lunch[day.key])).length;
                                                        const weekRegisteredDays = row.selectedDays.length;
                                                        const weekPackDays = Math.max(0, weekRegisteredDays - weekLunchDays);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                                            className: "weekCard",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: `weekHead ${expanded ? 'selected' : ''}`,
                                                                    onClick: ()=>setExpandedLunchWeekKey(expanded ? '' : panelKey),
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "weekHeadText",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                children: [
                                                                                    "Week ",
                                                                                    weekIndex + 1,
                                                                                    ": ",
                                                                                    row.week.programLabel
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4476,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWeekLabel"])(row.week)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4479,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                                children: [
                                                                                    "Click to expand lunch choices for",
                                                                                    ' ',
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "activeStudentName",
                                                                                        children: activeStudent.fullName || 'this camper'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4482,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4480,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "weekLunchSummaryLine",
                                                                                children: [
                                                                                    "Lunch ",
                                                                                    weekLunchDays,
                                                                                    "/",
                                                                                    weekRegisteredDays,
                                                                                    " days · Pack lunch ",
                                                                                    weekPackDays,
                                                                                    " days"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4484,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4475,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4470,
                                                                    columnNumber: 27
                                                                }, this),
                                                                expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "weekBody",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                            className: "toggleHint",
                                                                            children: [
                                                                                "Tap each chip to toggle lunch for",
                                                                                ' ',
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "activeStudentName",
                                                                                    children: activeStudent.fullName || 'this camper'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4493,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                "."
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4491,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "chipRow",
                                                                            children: row.selectedDays.map((day)=>{
                                                                                const hasLunch = Boolean(activeStudent.lunch[day.key]);
                                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    className: `modeChip lunchChip ${hasLunch ? 'yes' : 'no'}`,
                                                                                    onClick: ()=>toggleLunch(activeStudent.id, row.weekId, day.dayKey),
                                                                                    children: [
                                                                                        day.dayKey,
                                                                                        " Lunch ",
                                                                                        hasLunch ? 'YES' : 'NO'
                                                                                    ]
                                                                                }, day.key, true, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4499,
                                                                                    columnNumber: 37
                                                                                }, this);
                                                                            })
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4495,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4490,
                                                                    columnNumber: 29
                                                                }, this) : null
                                                            ]
                                                        }, row.weekId, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4469,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4458,
                                                    columnNumber: 17
                                                }, this) : null,
                                                activeStudent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "lunchDecisionCard",
                                                    "data-lunch-decision": activeStudent.id,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "lunchDecisionHeader",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    className: "requiredFieldLabel",
                                                                    children: [
                                                                        "Lunch decision ",
                                                                        !Object.values(activeStudent.lunch || {}).some(Boolean) && !activeStudent.lunchConfirmedNone ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredDot"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4522,
                                                                            columnNumber: 134
                                                                        }, this) : null
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4521,
                                                                    columnNumber: 21
                                                                }, this),
                                                                !Object.values(activeStudent.lunch || {}).some(Boolean) && !activeStudent.lunchConfirmedNone ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "lunchRequiredTag",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "requiredDot"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4526,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Required"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4525,
                                                                    columnNumber: 23
                                                                }, this) : null
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4520,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "subhead",
                                                            children: Object.values(activeStudent.lunch || {}).some(Boolean) ? `Lunch selected for ${Object.values(activeStudent.lunch || {}).filter(Boolean).length} day(s).` : 'No lunch days selected yet. Confirm no lunch if this camper does not need lunch.'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4531,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "lunchConfirmNoneRow",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: Boolean(activeStudent.lunchConfirmedNone),
                                                                    onChange: (event)=>setLunchConfirmedNone(activeStudent.id, event.target.checked),
                                                                    disabled: Object.values(activeStudent.lunch || {}).some(Boolean)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4537,
                                                                    columnNumber: 21
                                                                }, this),
                                                                "Confirm no lunch for this camper"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4536,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4519,
                                                    columnNumber: 17
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4417,
                                            columnNumber: 13
                                        }, this) : null,
                                        step === 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "full",
                                            children: [
                                                adminConfig.tuition.discountEndDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "subhead",
                                                    children: [
                                                        "Discount pricing applies through ",
                                                        adminConfig.tuition.discountEndDate,
                                                        ".",
                                                        ' ',
                                                        discountActive ? 'Discount is currently active.' : 'Discount has ended; regular pricing applies.'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4553,
                                                    columnNumber: 17
                                                }, this) : null,
                                                discountActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `stepFourDiscountClaim ${registrationDiscountClaimed ? 'claimed' : ''}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Claim discount"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4561,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    children: [
                                                                        "You've earned ",
                                                                        currency(claimableDiscountTotal),
                                                                        " in discount. Claim before",
                                                                        ' ',
                                                                        adminConfig.tuition.discountEndDate || 'the discount end date',
                                                                        "."
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.jsx",
                                                                    lineNumber: 4562,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4560,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button stepFourClaimBtn",
                                                            onClick: ()=>setRegistrationDiscountClaimed(true),
                                                            disabled: registrationDiscountClaimed,
                                                            children: registrationDiscountClaimed ? `Discount Claimed (${currency(claimableDiscountTotal)})` : `Claim ${currency(claimableDiscountTotal)} Discount`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4567,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4559,
                                                    columnNumber: 17
                                                }, this) : null,
                                                summaries.map(({ student, summary })=>{
                                                    const studentIndex = registration.students.findIndex((item)=>item.id === student.id);
                                                    const invoice = buildStudentPriceRows(summary, studentIndex, {
                                                        applyLimitedDiscount: discountActive && registrationDiscountClaimed
                                                    });
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                                        className: `reviewPriceCard ${discountActive && registrationDiscountClaimed ? 'claimedDiscount' : ''}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                children: student.fullName || 'Unnamed camper'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 4589,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                                className: "priceTable",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                    children: "Item"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4593,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                    children: "Qty"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4594,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                    children: "Unit Price"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4595,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                    children: "Discount"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4596,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                    children: "Total"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.jsx",
                                                                                    lineNumber: 4597,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.jsx",
                                                                            lineNumber: 4592,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4591,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                        children: invoice.rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        children: row.label
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4603,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        children: row.qty
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4604,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        children: currency(row.effectivePrice)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4605,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        children: row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4606,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        children: currency(row.lineTotal)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.jsx",
                                                                                        lineNumber: 4607,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, row.id, true, {
                                                                                fileName: "[project]/app/page.jsx",
                                                                                lineNumber: 4602,
                                                                                columnNumber: 27
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4600,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 4590,
                                                                columnNumber: 21
                                                            }, this),
                                                            invoice.limitedDiscountAmount > 0 && discountActive && registrationDiscountClaimed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "totalLine subtotalLine crossed",
                                                                        children: [
                                                                            "Subtotal: ",
                                                                            currency(invoice.subtotalRegular)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4614,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "totalLine promoApplyLine",
                                                                        children: [
                                                                            "Total discount: -",
                                                                            currency(invoice.limitedDiscountAmount)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4615,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "totalLine",
                                                                        children: [
                                                                            "New subtotal: ",
                                                                            currency(invoice.subtotal)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.jsx",
                                                                        lineNumber: 4618,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "totalLine",
                                                                children: [
                                                                    "Subtotal: ",
                                                                    currency(invoice.subtotalRegular)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 4621,
                                                                columnNumber: 23
                                                            }, this),
                                                            invoice.siblingDiscountAmount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "totalLine discountLine",
                                                                children: [
                                                                    "Sibling discount (",
                                                                    invoice.siblingDiscountPct,
                                                                    "%)",
                                                                    ' ',
                                                                    invoice.siblingAppliedBeforeLimitedDiscount ? '(applied before camp discount)' : '(applied after camp discount)',
                                                                    ": -",
                                                                    currency(invoice.siblingDiscountAmount)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 4624,
                                                                columnNumber: 23
                                                            }, this) : null,
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "totalLine",
                                                                children: [
                                                                    student.fullName || 'Camper',
                                                                    " total: ",
                                                                    currency(invoice.total)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.jsx",
                                                                lineNumber: 4632,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, student.id, true, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4585,
                                                        columnNumber: 19
                                                    }, this);
                                                }),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "totalLine grand",
                                                    children: [
                                                        "Grand total:",
                                                        ' ',
                                                        currency(summaries.reduce((sum, item)=>{
                                                            const studentIndex = registration.students.findIndex((student)=>student.id === item.student.id);
                                                            return sum + buildStudentPriceRows(item.summary, studentIndex, {
                                                                applyLimitedDiscount: discountActive && registrationDiscountClaimed
                                                            }).total;
                                                        }, 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4636,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "reservationHoldNotice",
                                                    children: "Reservations are held for 72 hours and canceled automatically if payment is not received."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4647,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "summaryActionRow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: ()=>openSummaryOverlay(registration),
                                                            children: "Open Summary PDF"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4651,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "button secondary",
                                                            onClick: ()=>emailSummaryToSelf(registration),
                                                            children: "Email Summary to Myself"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4654,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4650,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4551,
                                            columnNumber: 13
                                        }, this) : null,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "actions",
                                            children: [
                                                step > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button secondary",
                                                    onClick: previousStep,
                                                    children: "Back"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4663,
                                                    columnNumber: 15
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4667,
                                                    columnNumber: 15
                                                }, this),
                                                step < registrationSteps.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button",
                                                    onClick: nextStep,
                                                    children: "Continue"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4671,
                                                    columnNumber: 15
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "button",
                                                    type: "submit",
                                                    disabled: submitting,
                                                    children: submitting ? 'Submitting...' : 'Submit registration'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4675,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4661,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, `reg-step-${step}`, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4083,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4082,
                                columnNumber: 9
                            }, this),
                            message ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "message",
                                children: message
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4683,
                                columnNumber: 20
                            }, this) : null,
                            submittedRegistrationSnapshot ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "summaryActionRow",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button secondary",
                                        onClick: ()=>openSummaryOverlay(submittedRegistrationSnapshot),
                                        children: "Open Submitted Summary PDF"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4686,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "button secondary",
                                        onClick: ()=>emailSummaryToSelf(submittedRegistrationSnapshot),
                                        children: "Email Submitted Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4693,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4685,
                                columnNumber: 11
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 3898,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card section",
                        id: "contact-us",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Contact Us"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4705,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: [
                                    "Questions before registering? Email us at ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `mailto:${SUPPORT_EMAIL}`,
                                        children: SUPPORT_EMAIL
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4707,
                                        columnNumber: 53
                                    }, this),
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4706,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "contactGrid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        className: "contactForm",
                                        onSubmit: submitContact,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Name",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: contactForm.name,
                                                        onChange: (event)=>updateContactForm('name', event.target.value),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4713,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4711,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Email",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "email",
                                                        value: contactForm.email,
                                                        onChange: (event)=>updateContactForm('email', event.target.value),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4721,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4719,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                children: [
                                                    "Message",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: "4",
                                                        value: contactForm.message,
                                                        onChange: (event)=>updateContactForm('message', event.target.value),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4730,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4728,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "button",
                                                children: "Send Message"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4737,
                                                columnNumber: 13
                                            }, this),
                                            contactMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "message",
                                                children: contactMessage
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4740,
                                                columnNumber: 31
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4710,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                        className: "contactQrCard",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "WeChat Contact"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4743,
                                                columnNumber: 13
                                            }, this),
                                            adminConfig.media.wechatQrUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: adminConfig.media.wechatQrUrl,
                                                alt: "WeChat QR code"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4745,
                                                columnNumber: 15
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "subhead",
                                                children: "Add a WeChat QR in /admin Media."
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4747,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4742,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4709,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4704,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card section",
                        id: "overnight-registration",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Overnight Camp Registration"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4754,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subhead",
                                children: "Overnight Camp offers both Full Week and Full Day options. Use this table for current pricing, then request your preferred option below."
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4755,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tuitionTableWrap",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "priceTable",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Option"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4763,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Regular Price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4764,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Discounted Price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4765,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Discount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4766,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "Current Price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.jsx",
                                                        lineNumber: 4767,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.jsx",
                                                lineNumber: 4762,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4761,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: overnightPricingRows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4773,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: currency(row.regular)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4774,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: currency(row.discounted > 0 ? row.discounted : row.regular)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4775,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: row.discountAmount > 0 ? `-${currency(row.discountAmount)}` : '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4776,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: currency(row.effective)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.jsx",
                                                            lineNumber: 4777,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, row.key, true, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4772,
                                                    columnNumber: 17
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4770,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4760,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4759,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overnightOptionChips",
                                role: "group",
                                "aria-label": "Overnight option",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `modeChip ${overnightRequestOption === 'fullWeek' ? 'active full' : ''}`,
                                        onClick: ()=>setOvernightRequestOption('fullWeek'),
                                        children: "Overnight Full Week"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4784,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `modeChip ${overnightRequestOption === 'fullDay' ? 'active full' : ''}`,
                                        onClick: ()=>setOvernightRequestOption('fullDay'),
                                        children: "Overnight Full Day"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.jsx",
                                        lineNumber: 4791,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4783,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary",
                                onClick: ()=>setMessage(`Requested overnight info for ${overnightRequestOption === 'fullDay' ? 'Overnight Full Day' : 'Overnight Full Week'}.`),
                                children: "Request Overnight Info"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4799,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4753,
                        columnNumber: 7
                    }, this),
                    summaryOverlayOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "summaryOverlayBackdrop",
                        role: "dialog",
                        "aria-modal": "true",
                        "aria-label": "Registration summary PDF view",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "summaryOverlayPanel",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "summaryOverlayBar",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Registration Summary"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4812,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "summaryOverlayActions",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button secondary",
                                                    onClick: printSummaryOverlay,
                                                    children: "Print / Save PDF"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4814,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "button secondary",
                                                    onClick: ()=>setSummaryOverlayOpen(false),
                                                    children: "Close"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.jsx",
                                                    lineNumber: 4817,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4813,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4811,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                    ref: summaryIframeRef,
                                    title: "Registration summary preview",
                                    srcDoc: summaryOverlayHtml
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4822,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4810,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4809,
                        columnNumber: 9
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "mobileSectionNav",
                        "aria-label": "Section navigation",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#camp-info",
                                children: "Info"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4828,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#overview",
                                children: "Overview"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4829,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#weekly-structure",
                                children: "Week"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4830,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#level-up",
                                children: "App"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4831,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#register",
                                children: "Register"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4832,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#contact-us",
                                children: "Contact"
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4833,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4827,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "learnAssistDock",
                        "aria-label": "Camp fit assistant shortcut",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: text('Not sure yet?', '还在犹豫？')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4837,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "learnAssistLink",
                                onClick: chooseLearnPath,
                                children: text('Use Camp Fit Assistant to find your best-fit program', '使用营地匹配助手找到最适合的课程')
                            }, void 0, false, {
                                fileName: "[project]/app/page.jsx",
                                lineNumber: 4838,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4836,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true) : null,
            discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && isMobileViewport && isDiscountCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "discountCollapsedRemnant",
                "aria-label": text('Show discount', '展开优惠'),
                onClick: ()=>setIsDiscountCollapsed(false),
                children: "⌃"
            }, void 0, false, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 4845,
                columnNumber: 9
            }, this) : null,
            discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && (!isMobileViewport || !isDiscountCollapsed) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "discountCountdownDock",
                "aria-label": "Discount countdown",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "discountCountdownMeta single",
                    children: [
                        isMobileViewport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "discountHideBtn",
                            "aria-label": text('Hide discount', '收起优惠'),
                            onClick: ()=>setIsDiscountCollapsed(true),
                            children: text('Hide', '收起')
                        }, void 0, false, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4858,
                            columnNumber: 15
                        }, this) : null,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "discountAmountHero",
                            children: [
                                discountAmountLabel,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: text('per week', '每周')
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4869,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4867,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "discountCountdownBoxes",
                            "aria-label": "Countdown timer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "discountTimeBox",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeValue",
                                            children: discountCountdown.days
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4873,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeLabel",
                                            children: text('Days', '天')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4874,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4872,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "discountTimeBox",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeValue",
                                            children: String(discountCountdown.hours).padStart(2, '0')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4877,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeLabel",
                                            children: text('Hours', '时')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4878,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4876,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "discountTimeBox",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeValue",
                                            children: String(discountCountdown.minutes).padStart(2, '0')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4881,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeLabel",
                                            children: text('Minutes', '分')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4882,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4880,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "discountTimeBox",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeValue",
                                            children: String(discountCountdown.seconds).padStart(2, '0')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4885,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "discountTimeLabel",
                                            children: text('Seconds', '秒')
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.jsx",
                                            lineNumber: 4886,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4884,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4871,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                text('Ends on', '截止日期'),
                                " ",
                                discountCountdown.endLabel
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4889,
                            columnNumber: 13
                        }, this),
                        adminConfig.tuition.discountCode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "discountCodeLine",
                            children: [
                                text('Code', '优惠码'),
                                ": ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    children: adminConfig.tuition.discountCode
                                }, void 0, false, {
                                    fileName: "[project]/app/page.jsx",
                                    lineNumber: 4892,
                                    columnNumber: 40
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4891,
                            columnNumber: 15
                        }, this) : null,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "button discountClaimBtn",
                            onClick: jumpToRegistration,
                            children: text('Claim Discount', '立即报名')
                        }, void 0, false, {
                            fileName: "[project]/app/page.jsx",
                            lineNumber: 4895,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.jsx",
                    lineNumber: 4856,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 4855,
                columnNumber: 9
            }, this) : null,
            !isMobileLearnOverlayOpen || keepFloatingUiVisible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "langToggleDock",
                "aria-label": "Language toggle",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `langToggleBtn ${language === 'en' ? 'active' : ''}`,
                        onClick: ()=>setLanguage('en'),
                        children: "🇺🇸 EN"
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4903,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "/"
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4910,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `langToggleBtn ${language === 'zh' ? 'active' : ''}`,
                        onClick: ()=>setLanguage('zh'),
                        children: "🇨🇳 中文"
                    }, void 0, false, {
                        fileName: "[project]/app/page.jsx",
                        lineNumber: 4911,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.jsx",
                lineNumber: 4902,
                columnNumber: 7
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.jsx",
        lineNumber: 2673,
        columnNumber: 5
    }, this);
}
_s(HomePage, "WcE9j2XkLSLBMo2qd56uwwY0FgQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_da328d0c._.js.map