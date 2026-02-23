'use client';

import { useEffect } from 'react';

const APP_VERSION = '1.6.0';

export default function ClientVersionManager() {
    useEffect(() => {
        const checkVersion = async () => {
            const currentVersion = localStorage.getItem('app_version');

            if (currentVersion !== APP_VERSION) {
                // Loop protection: Check if we just reloaded for this version
                const lastReloadVersion = sessionStorage.getItem('last_reload_version');
                const reloadCount = parseInt(sessionStorage.getItem('reload_count') || '0');

                if (lastReloadVersion === APP_VERSION && reloadCount > 2) {
                    console.warn('Version Manager: Aborting reload to prevent loop.');
                    // Force update local storage anyway to break the cycle
                    localStorage.setItem('app_version', APP_VERSION);
                    return;
                }

                // 1. Unregister Service Workers
                if ('serviceWorker' in navigator) {
                    try {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                            }
                    } catch (error) {
                        console.error('Version Manager: Failed to unregister SW', error);
                    }
                }

                // 2. Clear Caches
                if ('caches' in window) {
                    try {
                        const keys = await caches.keys();
                        await Promise.all(keys.map(key => caches.delete(key)));
                        } catch (error) {
                        console.error('Version Manager: Failed to clear caches', error);
                    }
                }

                // 3. Clear Local Storage (except specific keys if needed, but user asked for FULL FLUSH)
                // Saving the new version is crucial, so we do it AFTER clearing
                localStorage.clear();
                // Don't clear session storage entirely, we need loop protection
                // sessionStorage.clear(); 

                // Set new version
                localStorage.setItem('app_version', APP_VERSION);
                sessionStorage.setItem('last_reload_version', APP_VERSION);
                sessionStorage.setItem('reload_count', (reloadCount + 1).toString());

                // 4. Hard Reload
                window.location.reload();
            } else {
                // Version match, clear loop protection
                sessionStorage.removeItem('last_reload_version');
                sessionStorage.removeItem('reload_count');
            }
        };

        checkVersion();
    }, []);

    return null;
}
