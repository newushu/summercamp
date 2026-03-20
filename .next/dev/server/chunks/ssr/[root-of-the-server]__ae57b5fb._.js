module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
        levelUpImageUrl: ''
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
    return {
        media: {
            heroImageUrl: raw.media?.heroImageUrl || '',
            levelUpImageUrl: raw.media?.levelUpImageUrl || ''
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
"[project]/app/admin/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/campAdmin.js [app-ssr] (ecmascript)");
'use client';
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
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadAdminConfig"])() || getInitialState());
    const [savedMessage, setSavedMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
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
            const nextProgram = {
                ...current.programs[programKey],
                [field]: value
            };
            const nextOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildProgramWeekOptions"])(programKey, nextProgram.startDate, nextProgram.endDate);
            const validIds = new Set(nextOptions.map((option)=>option.id));
            nextProgram.selectedWeeks = nextProgram.selectedWeeks.filter((id)=>validIds.has(id));
            return {
                ...current,
                programs: {
                    ...current.programs,
                    [programKey]: nextProgram
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
    function saveChanges() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveAdminConfig"])(config);
        setSavedMessage(`Saved ${new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })}`);
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
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Camp settings manager"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "subhead",
                        children: "Control media and camp date schedules. Weeks are generated automatically from each date range."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Media"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 161,
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
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 163,
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
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 160,
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
                            lineNumber: 192,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: meta.rhythm
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 193,
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
                                            lineNumber: 198,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 196,
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
                                            lineNumber: 207,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 205,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 195,
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
                                    lineNumber: 216,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "button secondary",
                                    onClick: ()=>clearWeeks(programKey),
                                    children: "Clear"
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 219,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        selectedCount,
                                        " selected"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 222,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 215,
                            columnNumber: 13
                        }, this),
                        options.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "subhead",
                            children: "Set a valid start and end date to generate options."
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 226,
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
                                            lineNumber: 231,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$campAdmin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatWeekLabel"])(week)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/page.jsx",
                                            lineNumber: 236,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, week.id, true, {
                                    fileName: "[project]/app/admin/page.jsx",
                                    lineNumber: 230,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/admin/page.jsx",
                            lineNumber: 228,
                            columnNumber: 15
                        }, this)
                    ]
                }, programKey, true, {
                    fileName: "[project]/app/admin/page.jsx",
                    lineNumber: 191,
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
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "ghostBtn",
                                href: "/",
                                children: "Back to site"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/page.jsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    savedMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "message",
                        children: savedMessage
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.jsx",
                        lineNumber: 254,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.jsx",
                lineNumber: 245,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/page.jsx",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ae57b5fb._.js.map