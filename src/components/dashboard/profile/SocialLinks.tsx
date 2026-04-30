import { useState } from 'react';
import { ExternalLink, Pencil, Trash2, LogOut } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialLinksProps {
  profile: UserProfile;
  onEdit: (field: string, value: string) => void;
  onDelete: (field: 'telegram' | 'codeforces') => void;
}

function CodeforcesButton({ onClick, hasValue, value, onUnlink }: { onClick: () => void; hasValue: boolean; value?: string; onUnlink?: () => void }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setShowTooltip(true), 3000);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setShowTooltip(false);
  };

  const handleClick = () => {
    if (hasValue && onUnlink) onUnlink();
    else onClick();
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${hasValue ? 'bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
      >
        {hasValue ? (
          <>
            <span className="truncate max-w-[100px]">{value}</span>
            <LogOut size={12} className="opacity-60" />
          </>
        ) : (
          <>
            <Image src="/icons/Codeforces.colored.svg" alt="CF" width={14} height={14} className="object-contain" />
            Link Account
          </>
        )}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#171718] text-white text-xs font-semibold rounded-lg pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl"
          >
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#171718] border-r border-t border-white/10 rotate-45 transform" />
            <span className="relative z-10">{hasValue ? 'Click to unlink / sign out' : 'Connect your Codeforces account to sync stats'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SocialLinks({ profile, onEdit, onDelete }: SocialLinksProps) {
  const items = [
    { l: 'Telegram', v: profile.telegram_username, f: 'telegram' },
    { l: 'Codeforces', v: profile.codeforces_profile, f: 'codeforces' },
    { l: 'LeetCode', v: profile.leetcode_profile, f: 'leetcode' },
  ];

  return (
    <div className="hidden md:block bg-[#121212] rounded-xl border border-white/5 p-4">
      <h4 className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Profiles</h4>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.l} className="flex items-center justify-between">
            <span className="text-sm text-[#A0A0A0]">{item.l}</span>
            <div className="flex items-center gap-2">
              {item.v && (
                <a
                  href={item.l === 'Telegram' ? `https://t.me/${item.v}` : item.l === 'Codeforces' ? `https://codeforces.com/profile/${item.v}` : `https://leetcode.com/${item.v}`}
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-[#F2F2F2] hover:text-emerald-400 flex items-center gap-1"
                >
                  {item.v}<ExternalLink size={12} />
                </a>
              )}

              {item.f === 'codeforces' ? (
                <CodeforcesButton
                  onClick={() => onEdit(item.f, item.v || '')}
                  hasValue={!!item.v}
                  value={item.v || undefined}
                  onUnlink={() => onDelete('codeforces')}
                />
              ) : (
                <button onClick={() => onEdit(item.f, item.v || '')} className="text-emerald-400 hover:text-emerald-300 p-1">
                  <Pencil size={14} />
                </button>
              )}

              {item.v && item.f !== 'codeforces' && (
                <button onClick={() => onDelete(item.f as 'telegram')} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
