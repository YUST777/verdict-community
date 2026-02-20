'use client';

import { useState, useEffect } from 'react';

export interface LLMSettings {
    enabled: boolean;
    baseURL: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
}

const DEFAULT_SETTINGS: LLMSettings = {
    enabled: false,
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    systemPrompt: 'You are a helpful coding and competitive programming assistant. When asked about code, provide clear and concise explanations. Under the hood you have access to a variety of coding tools. When explaining competitive programming answers, keep complexity (time and space) in mind.',
};

export function useLLM() {
    const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const loadSettings = () => {
            const stored = localStorage.getItem('verdict_byok_llm');
            if (stored) {
                try {
                    setSettings(JSON.parse(stored));
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
