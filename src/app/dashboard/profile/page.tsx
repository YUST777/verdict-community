'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Hexagon, ChevronDown, Pencil } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { fetchWithCache } from '@/lib/cache/api-cache';

import AchievementsWidget from '@/components/achievements/AchievementsWidget';
import CurrentSheetWidget from '@/components/dashboard/CurrentSheetWidget';
import { AchievementRevealModal } from '@/components/achievements/AchievementRevealModal';
import { UserProfile } from '@/lib/types';
import { useAchievements } from '@/hooks/useAchievements';

import { ProfileEditModal } from '@/components/dashboard/profile/ProfileEditModal';
import { SocialLinks } from '@/components/dashboard/profile/SocialLinks';
import { LeaderboardWidget } from '@/components/dashboard/profile/LeaderboardWidget';
import { IdentityCard } from '@/components/dashboard/profile/IdentityCard';

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile, isAuthenticated } = useAuth();
  const profile: UserProfile = (authProfile as unknown as UserProfile) || {
    name: user?.email?.split('@')[0] || 'User',
    role: 'student',
    id: user?.id || 0,
    email: user?.email || '',
  };

  const { stats, loading: statsLoading } = useDashboardStats();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUserInfoOpen, setUserInfoOpen] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [pfpError, setPfpError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetsRank, setSheetsRank] = useState<number | null>(null);

  const { unseenAchievement, markAsSeen } = useAchievements(isAuthenticated);

  const openEditModal = (field: string, currentValue: string) => {
    setEditField(field);
    setInputValue(currentValue || '');
    setShowEditModal(true);
  };

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const lbData = await fetchWithCache<any>('/api/leaderboard/sheets', { credentials: 'include' }, 300);
        if (lbData.leaderboard && Array.isArray(lbData.leaderboard)) {
          const myEntryIndex = lbData.leaderboard.findIndex((u: { userId: number }) => u.userId === user?.id);
          if (myEntryIndex !== -1) setSheetsRank(myEntryIndex + 1);
        }
      } catch {
      }
    };

    if (user) fetchRank();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, string> = {};
      let finalValue = inputValue;
      if (editField === 'telegram') finalValue = inputValue.replace('@', '').trim();
      if (editField === 'codeforces' && inputValue.includes('codeforces.com/profile/')) {
        const parts = inputValue.split('/');
        finalValue = parts[parts.length - 1] || inputValue;
      }

      if (editField === 'telegram') updateData.telegram_username = finalValue;
      if (editField === 'codeforces') updateData.codeforces_profile = finalValue;
      if (editField === 'leetcode') updateData.leetcode_profile = finalValue;

      await fetch('/api/auth/update-profile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (editField === 'codeforces') {
        await fetch('/api/user/refresh-cf', { method: 'POST', credentials: 'include' }).catch(() => {});
      }

      await refreshProfile();
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowEditModal(false);
      }, 1500);
    } catch {
    }
    setSaving(false);
  };

  const handleDelete = async (field: 'telegram' | 'codeforces') => {
    if (!window.confirm(`Are you sure you want to delete your ${field === 'telegram' ? 'Telegram' : 'Codeforces'} profile data?`)) return;
    try {
      await fetch('/api/user/delete-profile-data', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      await refreshProfile();
    } catch {
    }
  };

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPfpError('File too large. Maximum size is 5MB.');
      setTimeout(() => setPfpError(''), 5000);
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPfpError('Only PNG, JPG, and WebP images are allowed.');
      setTimeout(() => setPfpError(''), 5000);
      return;
    }

    setPfpError('');
    setUploadingPfp(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/user/upload-pfp', { method: 'POST', credentials: 'include', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setPfpError(data.error || 'Failed to upload image');
        setTimeout(() => setPfpError(''), 5000);
      } else {
        await refreshProfile();
      }
    } catch {
      setPfpError('Failed to upload image');
      setTimeout(() => setPfpError(''), 5000);
    } finally {
      setUploadingPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePfp = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;
    setUploadingPfp(true);
    setPfpError('');
    try {
      const res = await fetch('/api/user/delete-pfp', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.ok) await refreshProfile();
      else {
        setPfpError(data.error || 'Failed to delete profile picture');
        setTimeout(() => setPfpError(''), 5000);
      }
    } catch {
      setPfpError('Failed to delete profile picture');
      setTimeout(() => setPfpError(''), 5000);
    } finally {
      setUploadingPfp(false);
    }
  };

  const cfData = profile.codeforces_data || {};
  const rating = cfData.rating || 'N/A';
  const rank = cfData.rank || 'Unrated';
  const profilePicture = user?.profile_picture ? `/pfps/${user.profile_picture}` : null;

  return (
    <>
      {unseenAchievement && (
        <AchievementRevealModal
          achievement={unseenAchievement}
          onClose={() => markAsSeen(unseenAchievement.id)}
          onClaim={markAsSeen}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        <div className="md:hidden bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
          <button onClick={() => setUserInfoOpen(!isUserInfoOpen)} className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3"><Hexagon className="text-emerald-400" size={20} /><span className="font-medium text-[#F2F2F2]">User Info</span></div>
            <ChevronDown size={18} className={`text-[#A0A0A0] transition-transform ${isUserInfoOpen ? 'rotate-180' : ''}`} />
          </button>
          {isUserInfoOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {[{ l: 'Telegram', v: profile.telegram_username, f: 'telegram' }, { l: 'Codeforces', v: profile.codeforces_profile, f: 'codeforces' }, { l: 'LeetCode', v: profile.leetcode_profile, f: 'leetcode' }].map(item => (
                <div key={item.l} className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{item.l}</span>
                  <div className="flex items-center gap-2">
                    {item.v ? <span className="text-xs text-[#F2F2F2]">{item.v}</span> : <span className="text-xs text-[#666]">Not set</span>}
                    <button onClick={() => openEditModal(item.f, String(item.v || ''))} className="text-emerald-400 hover:text-emerald-300">
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IdentityCard
              user={user as any}
              profile={profile}
              profilePicture={profilePicture}
              uploadingPfp={uploadingPfp}
              pfpError={pfpError}
              fileInputRef={fileInputRef}
              handlePfpUpload={handlePfpUpload}
              handleDeletePfp={handleDeletePfp}
              rating={rating}
              rank={rank}
            />

            <div className="space-y-6 flex flex-col">
              <LeaderboardWidget sheetsRank={sheetsRank} />
              <SocialLinks profile={profile} onEdit={openEditModal} onDelete={handleDelete} />
            </div>

            <div className="w-full">
              <CurrentSheetWidget sheet={stats.currentSheet} loading={statsLoading} />
            </div>

            <div className="w-full">
              <AchievementsWidget profile={profile as unknown as Record<string, unknown>} user={user || undefined} />
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editField={editField}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSave={handleSave}
        saving={saving}
        saved={saved}
      />
    </>
  );
}
