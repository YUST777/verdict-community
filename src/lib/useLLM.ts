'use client';

import { useState, useEffect, useCallback } from 'react';
import { encryptValue, decryptValue, isEncrypted } from '@/lib/client-encryption';

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

const STORAGE_KEY = 'verdict_byok_llm';

export function useLLM() {
    const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);

    const loadSettings = useCallback(async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored);

            // Migrate old settings: if they have systemPrompt but no language, default to 'en'
            if (parsed.systemPrompt && !parsed.language) {
                parsed.language = 'en';
                delete parsed.systemPrompt;
            }

            // Decrypt the API key (handles both encrypted and plain text for migration)
            if (parsed.apiKey) {
                parsed.apiKey = await decryptValue(parsed.apiKey);

                // If it was plain text (legacy), re-save with encryption
                const rawStored = JSON.parse(stored);
                if (rawStored.apiKey && !isEncrypted(rawStored.apiKey)) {
                    const encrypted = await encryptValue(parsed.apiKey);
                    rawStored.apiKey = encrypted;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawStored));
                }
            }

            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (e) {
            console.error('Failed to parse LLM settings');
        }
    }, []);

    useEffect(() => {
        loadSettings();

        const handleChange = () => { loadSettings(); };
        window.addEventListener('llm_settings_changed', handleChange);
        window.addEventListener('storage', handleChange);

        return () => {
            window.removeEventListener('llm_settings_changed', handleChange);
            window.removeEventListener('storage', handleChange);
        };
    }, [loadSettings]);

    const saveSettings = async (newSettings: LLMSettings) => {
        setSettings(newSettings);

        // Encrypt the API key before storing
        const toStore = { ...newSettings };
        if (toStore.apiKey) {
            toStore.apiKey = await encryptValue(toStore.apiKey);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
        window.dispatchEvent(new Event('llm_settings_changed'));
    };

    return { settings, saveSettings };
}

