'use client';

import { useState, useEffect } from 'react';

export interface LLMSettings {
    enabled: boolean;
    baseURL: string;
    apiKey: string;
    model: string;
    language: 'en' | 'ar';
}

const DEFAULT_SETTINGS: LLMSettings = {
    enabled: false,
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    language: 'en',
};

export function useLLM() {
    const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const loadSettings = () => {
            const stored = localStorage.getItem('verdict_byok_llm');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Migrate old settings: if they have systemPrompt but no language, default to 'en'
                    if (parsed.systemPrompt && !parsed.language) {
                        parsed.language = 'en';
                        delete parsed.systemPrompt;
                    }
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed });
                } catch (e) {
                    console.error('Failed to parse LLM settings');
                }
            }
        };

        loadSettings();

        window.addEventListener('llm_settings_changed', loadSettings);
        window.addEventListener('storage', loadSettings);

        return () => {
            window.removeEventListener('llm_settings_changed', loadSettings);
            window.removeEventListener('storage', loadSettings);
        };
    }, []);

    const saveSettings = (newSettings: LLMSettings) => {
        setSettings(newSettings);
        localStorage.setItem('verdict_byok_llm', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('llm_settings_changed'));
    };

    return { settings, saveSettings };
}
