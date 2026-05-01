'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings, User, Bell, Shield, Palette, LogOut, Save,
    Loader2, Check, AlertTriangle, Mail, GraduationCap, ExternalLink
} from 'lucide-react';

interface UserSettings {
    name: string;
    email: string;
    universityEmail?: string;
    universityName?: string;
    codeforcesHandle?: string;
    notifications: {
        emailDigest: boolean;
        achievementAlerts: boolean;
        leaderboardUpdates: boolean;
    };
    preferences: {
        theme: 'dark' | 'light' | 'system';
        showOnLeaderboard: boolean;
        publicProfile: boolean;
    };
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="text-emerald-400">{icon}</div>
                <h2 className="font-bold text-white">{title}</h2>
            </div>
            <div className="p-6 space-y-6">{children}</div>
        </div>
    );
}

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-medium text-white">{label}</p>
                {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
            </div>
            <div className="sm:flex-shrink-0">{children}</div>
        </div>
    );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-all ${
                checked ? 'bg-emerald-500' : 'bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    checked ? 'left-7' : 'left-1'
                }`}
            />
        </button>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [codeforcesHandle, setCodeforcesHandle] = useState('');
    const [notifications, setNotifications] = useState({
        emailDigest: true,
        achievementAlerts: true,
        leaderboardUpdates: false,
    });
    const [preferences, setPreferences] = useState<{
        theme: 'dark' | 'light' | 'system';
        showOnLeaderboard: boolean;
        publicProfile: boolean;
    }>({
        theme: 'dark',
        showOnLeaderboard: true,
        publicProfile: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;

                    const userSettings: UserSettings = {
                        name: user.name || '',
                        email: user.email,
                        universityEmail: user.university_email,
                        universityName: user.university_name,
                        codeforcesHandle: user.codeforces_handle || '',
                        notifications: user.notification_settings || {
                            emailDigest: true,
                            achievementAlerts: true,
                            leaderboardUpdates: false,
                        },
                        preferences: user.preferences || {
                            theme: 'dark',
                            showOnLeaderboard: true,
                            publicProfile: true,
                        },
                    };

                    setSettings(userSettings);
                    setName(userSettings.name);
                    setCodeforcesHandle(userSettings.codeforcesHandle || '');
                    setNotifications(userSettings.notifications);
                    setPreferences(userSettings.preferences);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    codeforces_handle: codeforcesHandle,
                    notification_settings: notifications,
                    preferences,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            router.push('/');
        } catch (err) {
            console.error('Failed to logout:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-16 bg-white/5 rounded-xl" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-white/5 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Settings className="text-emerald-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-white/40 text-sm">Manage your account preferences</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Profile Section */}
            <SettingsSection title="Profile" icon={<User size={20} />}>
                <SettingsRow label="Display Name" description="Your name shown on leaderboards and profile">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </SettingsRow>

                <SettingsRow label="Email" description="Your primary email address">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Mail className="w-4 h-4" />
                        {settings?.email}
                    </div>
                </SettingsRow>

                {settings?.universityEmail && (
                    <SettingsRow label="University Email" description="Verified for University Tier access">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <GraduationCap className="w-4 h-4" />
                            {settings.universityEmail}
                            <Check className="w-4 h-4" />
                        </div>
                    </SettingsRow>
                )}

                <SettingsRow label="Codeforces Handle" description="Link your Codeforces account">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={codeforcesHandle}
                            onChange={(e) => setCodeforcesHandle(e.target.value)}
                            placeholder="e.g. tourist"
                            className="w-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                        {codeforcesHandle && (
                            <a
                                href={`https://codeforces.com/profile/${codeforcesHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-white/40 hover:text-emerald-400 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </SettingsRow>
            </SettingsSection>

            {/* Notifications Section */}
            <SettingsSection title="Notifications" icon={<Bell size={20} />}>
                <SettingsRow label="Weekly Digest" description="Receive a weekly summary of your progress">
                    <Toggle
                        checked={notifications.emailDigest}
                        onChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
                    />
                </SettingsRow>

                <SettingsRow label="Achievement Alerts" description="Get notified when you unlock achievements">
                    <Toggle
                        checked={notifications.achievementAlerts}
                        onChange={(checked) => setNotifications({ ...notifications, achievementAlerts: checked })}
                    />
                </SettingsRow>

                <SettingsRow label="Leaderboard Updates" description="Notify when your rank changes significantly">
                    <Toggle
                        checked={notifications.leaderboardUpdates}
                        onChange={(checked) => setNotifications({ ...notifications, leaderboardUpdates: checked })}
                    />
                </SettingsRow>
            </SettingsSection>

            {/* Privacy Section */}
            <SettingsSection title="Privacy" icon={<Shield size={20} />}>
                <SettingsRow label="Show on Leaderboard" description="Appear on public and university leaderboards">
                    <Toggle
                        checked={preferences.showOnLeaderboard}
                        onChange={(checked) => setPreferences({ ...preferences, showOnLeaderboard: checked })}
                    />
                </SettingsRow>

                <SettingsRow label="Public Profile" description="Allow others to view your profile">
                    <Toggle
                        checked={preferences.publicProfile}
                        onChange={(checked) => setPreferences({ ...preferences, publicProfile: checked })}
                    />
                </SettingsRow>
            </SettingsSection>

            {/* Appearance Section */}
            <SettingsSection title="Appearance" icon={<Palette size={20} />}>
                <SettingsRow label="Theme" description="Choose your preferred color scheme">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        {(['dark', 'light', 'system'] as const).map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setPreferences({ ...preferences, theme })}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                                    preferences.theme === theme
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </SettingsRow>
            </SettingsSection>

            {/* Danger Zone */}
            <div className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/20 bg-red-500/5">
                    <AlertTriangle className="text-red-400" size={20} />
                    <h2 className="font-bold text-red-400">Danger Zone</h2>
                </div>
                <div className="p-6">
                    <SettingsRow label="Sign Out" description="Sign out of your account on this device">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-lg border border-red-500/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </SettingsRow>
                </div>
            </div>
        </div>
    );
}
