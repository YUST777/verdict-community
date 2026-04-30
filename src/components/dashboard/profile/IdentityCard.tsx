import { Shield, Camera, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/lib/types';
import { StatsGrid } from './StatsGrid';
import { getDisplayName } from '@/lib/utils';

interface IdentityCardProps {
  user?: { id?: number; email?: string; student_id?: string; role?: string };
  profile: UserProfile;
  profilePicture: string | null;
  uploadingPfp: boolean;
  pfpError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePfpUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeletePfp: () => void;
  rating: number | string;
  rank: string;
}

export function IdentityCard({
  user,
  profile,
  profilePicture,
  uploadingPfp,
  pfpError,
  fileInputRef,
  handlePfpUpload,
  handleDeletePfp,
  rating,
  rank,
}: IdentityCardProps) {
  return (
    <div className="bg-[#121212] rounded-2xl border border-white/5 relative overflow-hidden h-full flex flex-col group hover:border-white/10 transition-colors w-full">
      <div className="h-32 bg-gradient-to-r from-emerald-500/20 via-emerald-700/10 to-transparent relative">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px]" />
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
          <Shield size={12} className="text-emerald-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            {user?.role === 'instructor' || user?.role === 'owner' || profile?.role === 'instructor' || profile?.role === 'owner' ? 'Instructor' : 'Trainee'}
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 flex-1 flex flex-col items-center -mt-12 relative z-10">
        <div className="w-24 h-24 rounded-2xl bg-[#121212] p-1.5 shadow-2xl relative group/avatar">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-black overflow-hidden relative">
            {profilePicture ? (
              <div className="relative w-full h-full">
                <Image src={profilePicture} alt={profile.name} fill className="object-cover" sizes="(max-width: 96px) 100vw, 96px" unoptimized />
              </div>
            ) : (
              <span className="absolute inset-0 flex items-center justify-center">{profile.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}

            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {uploadingPfp ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-white hover:text-emerald-400 transition-colors">
                    <Camera size={16} />
                    <span className="text-[10px] font-medium">Change</span>
                  </button>
                  {profilePicture && (
                    <button onClick={handleDeletePfp} className="flex items-center gap-1 text-white/70 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                      <span className="text-[10px]">Remove</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handlePfpUpload}
          className="hidden"
        />

        {pfpError && <p className="text-red-400 text-xs mt-2">{pfpError}</p>}

        <div className="mt-4 text-center space-y-1 w-full">
          <h2 className="text-2xl font-bold text-[#F2F2F2] tracking-tight truncate">{getDisplayName(profile.name) || 'Member'}</h2>
          <p className="text-xs text-[#666] font-mono">@{profile.student_id || user?.email?.split('@')[0]}</p>
        </div>

        <StatsGrid rating={rating} rank={rank} />
      </div>
    </div>
  );
}
