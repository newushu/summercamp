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
        levelUpImageUrl: '',
        levelUpScreenshotUrls: [],
        levelUpScreenshotSize: 100
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
        durationDays: 2
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
    const screenshotSize = Number(raw.media?.levelUpScreenshotSize);
    return {
        media: {
            heroImageUrl: raw.media?.heroImageUrl || '',
            levelUpImageUrl: raw.media?.levelUpImageUrl || '',
            levelUpScreenshotUrls: screenshotUrls,
            levelUpScreenshotSize: Number.isFinite(screenshotSize) ? Math.max(40, Math.min(140, screenshotSize)) : 100
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
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('camp_admin_settings').select('hero_image_url, level_up_image_url, level_up_screenshot_urls, level_up_screenshot_size').eq('id', true).maybeSingle(),
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
            levelUpImageUrl: settingsResponse.data?.level_up_image_url || '',
            levelUpScreenshotUrls: settingsResponse.data?.level_up_screenshot_urls || [],
            levelUpScreenshotSize: settingsResponse.data?.level_up_screenshot_size || 100
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
        level_up_image_url: merged.media.levelUpImageUrl || null,
        level_up_screenshot_urls: merged.media.levelUpScreenshotUrls,
        level_up_screenshot_size: merged.media.levelUpScreenshotSize
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-ssr] (ecmascript)");
'use client';
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
        rhythm: 'Auto-generated Saturday to Sunday weekends'
    }
};
function getInitialState() {
    return {
        media: {
            heroImageUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.heroImageUrl,
            levelUpImageUrl: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAdminConfig"].media.levelUpImageUrl
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
function AdminPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(getInitialState);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savedMessage, setSavedMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [adminEmail, setAdminEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
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
        }
        bootstrap();
        return ()=>{
            active = false;
        };
    }, [
        router
    ]);
    const weekOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            general: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('general', config.programs.general.startDate, config.programs.general.endDate),
            bootcamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('bootcamp', config.programs.bootcamp.startDate, config.programs.bootcamp.endDate),
            overnight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])('overnight', config.programs.overnight.startDate, config.programs.overnight.endDate)
        }), [
        config.programs
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
        setSavedMessage('');
        setErrorMessage('');
        const error = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdminApi$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveAdminConfigToSupabase"])(config);
        if (error) {
            setErrorMessage(`Save failed: ${error.message}`);
            return;
        }
        setSavedMessage(`Saved ${new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })}`);
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
            className: "page",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "subhead",
                    children: "Loading admin settings..."
                }, void 0, false, {
                    fileName: "[project]/app/admin/page.jsx",
                    lineNumber: 225,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 224,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/admin/page.jsx",
            lineNumber: 223,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Admin Console"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Camp settings manager"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Control media and camp date schedules. Weeks are generated automatically from each date range."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 236,
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
                        lineNumber: 239,
                        columnNumber: 23
                    }, this) : null,
                    errorMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "errorMessage",
                        children: errorMessage
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 240,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Media"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "adminGrid",
                        children: [
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
                                        lineNumber: 248,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Level Up phone screenshot URL",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: config.media.levelUpImageUrl,
                                        onChange: (event)=>updateMedia('levelUpImageUrl', event.target.value),
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/page.jsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 243,
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
                            lineNumber: 275,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: meta.rhythm
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 276,
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
                                            lineNumber: 281,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 279,
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
                                            lineNumber: 290,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 288,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 278,
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
                                    lineNumber: 299,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: ()=>clearWeeks(programKey),
                                    children: "Clear"
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 302,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        selectedCount,
                                        " selected"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 305,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 298,
                            columnNumber: 13
                        }, this),
                        options.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: "Set a valid start and end date to generate options."
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 309,
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
                                            lineNumber: 314,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatWeekLabel"])(week)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 319,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, week.id, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 313,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 311,
                            columnNumber: 15
                        }, this)
                    ]
                }, programKey, true, {
                    fileName: "[project]/app/admin/page.jsx",
                    lineNumber: 274,
                    columnNumber: 11
                }, this);
            }),
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
                                children: "Save settings"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 330,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button secondary",
                                onClick: signOut,
                                children: "Sign out"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 333,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "ghostBtn",
                                href: "/",
                                children: "Back to site"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 336,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this),
                    savedMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "message",
                        children: savedMessage
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 340,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 328,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/page.jsx",
        lineNumber: 232,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1902d6d3._.js.map