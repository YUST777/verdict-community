'use client';

import { useRef, useCallback } from 'react';
import { useLLM } from '@/lib/useLLM';
import { extractAndParseJson } from '@/lib/json-utils';
import { VideoScript } from '../../video';

interface UseVideoTutorProps {
    language: string;
    problemDescription?: string;
    addMessage: (message: any, tabId?: string) => void;
    updateMessage: (id: string, content: string, videoScript?: VideoScript, tabId?: string) => void;
    setIsVideoLoading: (loading: boolean, tabId?: string) => void;
    setIsTutorActive: (active: boolean, tabId?: string) => void;
}

export function useVideoTutor({
    language,
    problemDescription,
    addMessage,
    updateMessage,
    setIsVideoLoading,
    setIsTutorActive
}: UseVideoTutorProps) {
    const { settings } = useLLM();
    const abortControllers = useRef<Record<string, AbortController | null>>({});

    const startVideoTutor = useCallback(async (msg: string, userCode: string, tabId: string = 'default') => {
        if (!settings.enabled || !settings.apiKey) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: settings.language === 'ar' ? 'برجاء إعداد الـ LLM الخاص بك في الإعدادات أولاً.' : 'Please configure your LLM in Settings first.',
                timestamp: new Date()
            }, tabId);
            return;
        }

        if (abortControllers.current[tabId]) {
            abortControllers.current[tabId]?.abort();
        }
        abortControllers.current[tabId] = new AbortController();
        const signal = abortControllers.current[tabId]?.signal;

        setIsVideoLoading(true, tabId);
        setIsTutorActive(true, tabId);

        const videoMsgId = `video-${Date.now()}`;
        addMessage({
            id: videoMsgId,
            role: 'assistant',
            content: `<think>\nGenerating line-by-line video explanation script...\n</think>\n\n🎬 *${settings.language === 'ar' ? 'بجهز فيديو شرح المسألة...' : 'Preparing video explanation...'}*`,
            timestamp: new Date()
        }, tabId);

        try {
            // Reconnect to the high-quality internal API that handles SVGs and Arabic formatting
            const response = await fetch('/api/ai/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemDescription,
                    solution: userCode,
                    language,
                    settings
                }),
                signal
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `API request failed: ${response.status}`);
            }

            const parsed = await response.json();

            if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
                throw new Error('Invalid video script generated: missing scenes array');
            }

            const videoScript: VideoScript = {
                title: parsed.title || (settings.language === 'ar' ? 'شرح الحل سطر بسطر' : 'Line-by-line Explanation'),
                description: parsed.explanation_script || (settings.language === 'ar' ? 'فيديو تم توليده بالذكاء الاصطناعي لشرح الكود الخاص بك.' : 'AI-generated video explanation for your code.'),
                scenes: parsed.scenes.map((s: any, i: number) => ({
                    id: s.id || `scene-${i}-${Date.now()}`,
                    type: s.type || 'code',
                    text: s.text || '',
                    script: s.script || '',
                    code: s.code,
                    highlight: s.highlight,
                    duration: s.duration || 5,
                    svg: s.svg
                }))
            };

            updateMessage(videoMsgId, `<think>\nVideo script generated successfully via API.\n</think>\n\n🎥 ${settings.language === 'ar' ? 'الفيديو جاهز للمراجعة!' : 'Your video explanation is ready!'}`, videoScript, tabId);

        } catch (err: any) {
            if (err.name === 'AbortError' || err.message === 'signal is aborted without reason') {
                updateMessage(videoMsgId, settings.language === 'ar' ? 'تم إيقاف توليد الفيديو.' : `Video generation stopped.`, undefined, tabId);
            } else {
                addMessage({
                    id: `err-video-${Date.now()}`,
                    role: 'assistant',
                    content: (settings.language === 'ar' ? 'خطأ في توليد الفيديو: ' : 'Video Generation Error: ') + err.message,
                    timestamp: new Date()
                }, tabId);
            }
        } finally {
            setIsVideoLoading(false, tabId);
            setIsTutorActive(false, tabId);
            abortControllers.current[tabId] = null;
        }
    }, [language, problemDescription, settings, addMessage, updateMessage, setIsVideoLoading, setIsTutorActive]);

    const stopVideoTutor = useCallback((tabId?: string) => {
        if (tabId) {
            if (abortControllers.current[tabId]) {
                abortControllers.current[tabId]?.abort();
                abortControllers.current[tabId] = null;
            }
            setIsVideoLoading(false, tabId);
            setIsTutorActive(false, tabId);
        } else {
            Object.keys(abortControllers.current).forEach(id => {
                if (abortControllers.current[id]) {
                    abortControllers.current[id]?.abort();
                    abortControllers.current[id] = null;
                }
                setIsVideoLoading(false, id);
                setIsTutorActive(false, id);
            });
        }
    }, [setIsVideoLoading, setIsTutorActive]);

    return {
        startVideoTutor,
        stopVideoTutor
    };
}
