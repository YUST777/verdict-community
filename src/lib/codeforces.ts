export interface CodeforcesData {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    contribution: number;
    friendOfCount: number;
    lastOnlineTimeSeconds: number;
    registrationTimeSeconds: number;
    lastUpdated: string; // ISO date string
}

export function extractUsername(profileUrl: string, platform: string): string | null {
    if (!profileUrl) return null;

    try {
        // If it's already just a username (no URL)
        // Basic check: no slashes, no dots (unless part of a valid handle, though dots are allowed in handles, usually URLs have more structure)
        // Better heuristic: if it contains 'http' or 'codeforces.com', treat as URL.
        if (!profileUrl.includes('/') && !profileUrl.includes('codeforces.com')) {
            return profileUrl.trim();
        }

        // Extract from URL
        const url = new URL(profileUrl.includes('://') ? profileUrl : `https://${profileUrl}`);
        const parts = url.pathname.split('/').filter(Boolean);

        if (platform === 'codeforces') {
            // codeforces.com/profile/username
            const profileIndex = parts.indexOf('profile');
            if (profileIndex !== -1 && parts[profileIndex + 1]) {
                return parts[profileIndex + 1];
            }
            // Direct username in path (less common but possible in some routing variations, usually profile is required)
            // Fallback: take last part
            if (parts.length > 0) return parts[parts.length - 1];
        }

        return parts[parts.length - 1] || null;
    } catch {
        // If URL parsing fails, assume it's a raw username (clean it)
        return profileUrl.trim();
    }
}

export async function scrapeCodeforces(username: string): Promise<CodeforcesData | null> {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const data = await response.json();

        if (data.status === 'OK' && data.result && data.result[0]) {
            const user = data.result[0];
            return {
                handle: user.handle,
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || 'unrated',
                maxRank: user.maxRank || 'unrated',
                contribution: user.contribution || 0,
                friendOfCount: user.friendOfCount || 0,
                lastOnlineTimeSeconds: user.lastOnlineTimeSeconds,
                registrationTimeSeconds: user.registrationTimeSeconds,
                lastUpdated: new Date().toISOString() // Smart Refresh Timestamp
            };
        }
        return null;
    } catch (error) {
        console.error('Codeforces API error:', error);
        return null;
    }
}
