'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/lib/hooks';
import { AchievementRevealModal } from '@/components/AchievementRevealModal';

/**
 * GlobalAchievementPopup
 * 
 * This component wraps the existing AchievementRevealModal and useAchievements hook
 * to display achievement notifications globally (on any page) after login.
 * 
 * Previously, achievements only popped up on /dashboard/profile.
 * Now they will appear on any page when the user has unseen achievements.
 */
export default function GlobalAchievementPopup() {
    const { isAuthenticated } = useAuth();
    const { unseenAchievement, markAsSeen } = useAchievements();

    // Only render if authenticated and there's an unseen achievement
    if (!isAuthenticated || !unseenAchievement) {
        return null;
    }

    return (
        <AchievementRevealModal
            achievement={unseenAchievement}
            onClose={() => markAsSeen(unseenAchievement.id)}
            onClaim={markAsSeen}
        />
    );
}
