module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/survey-recommendation/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
function buildFallbackRecommendation(surveyData, recommendationLines) {
    const ages = Array.isArray(surveyData?.camperAges) ? surveyData.camperAges.map((age)=>Number(age || 0)).filter((age)=>age > 0) : [];
    const hasCompetitionGoal = Array.isArray(surveyData?.goals) && surveyData.goals.includes('competition');
    const hasSocialGoal = Array.isArray(surveyData?.goals) && surveyData.goals.includes('social/teamwork/friends');
    const hasLunchNeed = surveyData?.lunchInterest === 'yes';
    const hasOlderCamper = ages.some((age)=>age > 9);
    const allUnder6 = ages.length > 0 && ages.every((age)=>age < 6);
    const leadLine = allUnder6 ? 'General Camp is the strongest starting point for your family right now.' : hasCompetitionGoal ? 'A smart path is Competition Team Boot Camp, with General Camp weeks mixed in as needed.' : 'General Camp is a great fit, with the option to add Competition Team Boot Camp as skills progress.';
    const reasonParts = [];
    if (hasCompetitionGoal) {
        reasonParts.push('competition-focused training goals');
    }
    if (hasSocialGoal) {
        reasonParts.push('social confidence and teamwork goals');
    }
    if (hasOlderCamper) {
        reasonParts.push('older-camper development in discipline and leadership');
    }
    if (reasonParts.length === 0) {
        reasonParts.push('age and readiness profile');
    }
    const logisticsLine = hasLunchNeed ? 'For convenience, you can select lunch by day during registration and build a schedule that fits your week.' : 'You can register by week and still keep flexibility with day-by-day scheduling choices.';
    const nextStep = recommendationLines?.[0] ? `Next step: ${recommendationLines[0].replace(/^Best fit:\s*/i, '')}` : 'Next step: open registration and choose weeks to get your preferred spots.';
    const marketLine = 'New England Wushu is awarded Best in Burlington and recognized as a top academy in the area, led by certified top coaches.';
    return `${leadLine} This recommendation is based on your ${reasonParts.join(' + ')}. ${logisticsLine} ${marketLine} ${nextStep}`;
}
function isWeakRecommendation(text) {
    if (!text) {
        return true;
    }
    const normalized = text.trim();
    if (normalized.length < 120) {
        return true;
    }
    return !/[.!?]$/.test(normalized);
}
async function POST(request) {
    try {
        const body = await request.json();
        const surveyData = body?.surveyData || {};
        const recommendationLines = Array.isArray(body?.recommendationLines) ? body.recommendationLines : [];
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return Response.json({
                configured: false,
                text: buildFallbackRecommendation(surveyData, recommendationLines)
            }, {
                status: 200
            });
        }
        const prompt = [
            'You are writing a polished, parent-facing summer camp recommendation.',
            'Return exactly 4 complete sentences in plain text.',
            'Sentence 1: best-fit camp plan (General Camp and/or Competition Team Boot Camp).',
            'Sentence 2: why it fits based on goals/ages.',
            'Sentence 3: include strong competitive positioning: awarded Best in Burlington, top academy in the area, certified top coaches.',
            'Sentence 4: specific next action to register now.',
            'Tone: confident, warm, concise, professional. No placeholders, no bullet list.',
            `Survey data JSON: ${JSON.stringify(surveyData)}`,
            `Rule-based draft lines: ${JSON.stringify(recommendationLines)}`
        ].join('\n');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.45,
                    maxOutputTokens: 260
                }
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return Response.json({
                configured: true,
                error: data?.error?.message || 'Gemini request failed.'
            }, {
                status: 500
            });
        }
        const textRaw = data?.candidates?.[0]?.content?.parts?.map((part)=>part?.text || '').join('\n').trim() || '';
        const text = isWeakRecommendation(textRaw) ? buildFallbackRecommendation(surveyData, recommendationLines) : textRaw;
        return Response.json({
            configured: true,
            text
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            configured: true,
            error: error.message || 'Request failed.'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0833d884._.js.map