/**
 * AI Behavior Learning System
 * Tracks user interactions and automatically adapts AI preferences
 */

export interface UserInteraction {
    timestamp: number;
    questionLength: number;
    questionType: 'simple' | 'medium' | 'complex';
    responseLength: number;
    userSatisfaction?: 'positive' | 'negative' | 'neutral'; // Inferred from follow-up questions
    language: 'arabic' | 'english' | 'mixed';
    hasCodeSelection: boolean;
}

export interface BehaviorPattern {
    preferredResponseLength: 'concise' | 'balanced' | 'detailed';
    averageQuestionLength: number;
    preferredLanguage: 'arabic' | 'english' | 'mixed';
    interactionCount: number;
    lastUpdated: number;
}

const BEHAVIOR_STORAGE_KEY = 'ai-behavior-patterns:v1';
const MAX_INTERACTIONS = 50; // Keep last 50 interactions

/**
 * Track a user interaction
 */
export function trackInteraction(interaction: Omit<UserInteraction, 'timestamp'>): void {
    if (typeof window === 'undefined') return;

    try {
        const stored = localStorage.getItem('ai-interactions:v1');
        const interactions: UserInteraction[] = stored ? JSON.parse(stored) : [];

        const fullInteraction: UserInteraction = {
            ...interaction,
            timestamp: Date.now()
        };

        interactions.push(fullInteraction);

        // Keep only last N interactions
        if (interactions.length > MAX_INTERACTIONS) {
            interactions.shift();
        }

        localStorage.setItem('ai-interactions:v1', JSON.stringify(interactions));

        // Update behavior patterns
        updateBehaviorPatterns(interactions);
    } catch (error) {
        console.error('[Behavior Tracking] Failed to track interaction:', error);
    }
}

/**
 * Analyze interactions and update behavior patterns
 */
function updateBehaviorPatterns(interactions: UserInteraction[]): void {
    if (interactions.length < 3) return; // Need at least 3 interactions to learn

    const patterns: BehaviorPattern = {
        preferredResponseLength: inferResponseLengthPreference(interactions),
        averageQuestionLength: calculateAverageQuestionLength(interactions),
        preferredLanguage: inferLanguagePreference(interactions),
        interactionCount: interactions.length,
        lastUpdated: Date.now()
    };

    try {
        localStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(patterns));
    } catch (error) {
        console.error('[Behavior Learning] Failed to save patterns:', error);
    }
}

/**
 * Infer preferred response length from interactions
 */
function inferResponseLengthPreference(interactions: UserInteraction[]): 'concise' | 'balanced' | 'detailed' {
    // Analyze question types
    const simpleCount = interactions.filter(i => i.questionType === 'simple').length;
    const complexCount = interactions.filter(i => i.questionType === 'complex').length;
    const total = interactions.length;

    // If user mostly asks simple questions, prefer concise
    if (simpleCount / total > 0.6) {
        return 'concise';
    }

    // If user mostly asks complex questions, prefer detailed
    if (complexCount / total > 0.6) {
        return 'detailed';
    }

    // Default to balanced
    return 'balanced';
}

/**
 * Calculate average question length
 */
function calculateAverageQuestionLength(interactions: UserInteraction[]): number {
    const total = interactions.reduce((sum, i) => sum + i.questionLength, 0);
    return Math.round(total / interactions.length);
}

/**
 * Infer language preference
 */
function inferLanguagePreference(interactions: UserInteraction[]): 'arabic' | 'english' | 'mixed' {
    const arabicCount = interactions.filter(i => i.language === 'arabic').length;
    const englishCount = interactions.filter(i => i.language === 'english').length;
    const total = interactions.length;

    if (arabicCount / total > 0.7) return 'arabic';
    if (englishCount / total > 0.7) return 'english';
    return 'mixed';
}

/**
 * Analyze question to determine type
 */
export function analyzeQuestion(question: string): {
    type: 'simple' | 'medium' | 'complex';
    length: number;
    language: 'arabic' | 'english' | 'mixed';
    isConfident: boolean;
} {
    const text = question.trim();
    const length = text.length;

    // Detect language
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    let language: 'arabic' | 'english' | 'mixed' = 'english';
    if (hasArabic && hasEnglish) language = 'mixed';
    else if (hasArabic) language = 'arabic';

    // Detect confidence signals
    const confidentSignals = [
        /i'm sure|i know|i'm certain|متأكد|أنا متأكد|أعرف/i,
        /this is correct|هذا صحيح|هذا صح/i
    ];
    const isConfident = confidentSignals.some(pattern => pattern.test(text));

    // Detect question type
    let type: 'simple' | 'medium' | 'complex' = 'medium';

    // Simple questions
    if (length < 30 ||
        /^(is|are|does|do|can|will|هل|ما|كيف)\s/i.test(text) ||
        /^\?$/.test(text.trim()) ||
        isConfident) {
        type = 'simple';
    }

    // Complex questions
    if (length > 100 ||
        /explain|how does|why does|what is|how to|اشرح|كيف يعمل|لماذا/i.test(text)) {
        type = 'complex';
    }

    return { type, length, language, isConfident };
}

/**
 * Load behavior patterns
 */
export function loadBehaviorPatterns(): BehaviorPattern | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(BEHAVIOR_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('[Behavior Learning] Failed to load patterns:', error);
    }

    return null;
}

/**
 * Infer preferences from behavior patterns
 */
export function inferPreferencesFromBehavior(
    patterns: BehaviorPattern | null,
    codeforcesRating?: number
): Partial<import('./ai-personalization').AILearningPreferences> {
    if (!patterns) return {};

    const preferences: Partial<import('./ai-personalization').AILearningPreferences> = {};

    // Map response length preference
    if (patterns.preferredResponseLength === 'concise') {
        preferences.explanationDepth = 'basic';
        preferences.learningStyle = 'concise';
        preferences.preferredExplanationFormat = 'mixed'; // Use valid value
    } else if (patterns.preferredResponseLength === 'detailed') {
        preferences.explanationDepth = 'comprehensive';
        preferences.learningStyle = 'detailed';
        preferences.preferredExplanationFormat = 'step-by-step';
    } else {
        preferences.explanationDepth = 'moderate';
        preferences.learningStyle = 'detailed';
        preferences.preferredExplanationFormat = 'mixed';
    }

    // Infer skill level from rating if available
    if (codeforcesRating) {
        if (codeforcesRating < 1200) {
            preferences.skillLevel = 'beginner';
        } else if (codeforcesRating < 1600) {
            preferences.skillLevel = 'intermediate';
        } else if (codeforcesRating < 2000) {
            preferences.skillLevel = 'advanced';
        } else {
            preferences.skillLevel = 'expert';
        }
    }

    return preferences;
}

/**
 * Track user satisfaction (inferred from follow-up behavior)
 */
export function trackSatisfaction(question: string, previousQuestion?: string): 'positive' | 'negative' | 'neutral' {
    if (!previousQuestion) return 'neutral';

    // If user asks a new question (not clarifying), likely satisfied
    const isNewTopic = !question.toLowerCase().includes(previousQuestion.toLowerCase().substring(0, 10));
    if (isNewTopic) return 'positive';

    // If user asks "why" or "how" after answer, might want more detail
    if (/why|how|explain more|more detail|لماذا|كيف|مزيد/i.test(question)) {
        return 'negative'; // Previous response was too short
    }

    // If user says "thanks" or similar, satisfied
    if (/thanks|thank you|شكرا|تمام|ok|got it/i.test(question)) {
        return 'positive';
    }

    return 'neutral';
}
