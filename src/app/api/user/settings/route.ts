import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { z } from 'zod';

// Validation schema for settings updates
const settingsUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    codeforces_handle: z.string().max(50).optional(),
    notification_settings: z.object({
        emailDigest: z.boolean().optional(),
        achievementAlerts: z.boolean().optional(),
        leaderboardUpdates: z.boolean().optional(),
    }).optional(),
    preferences: z.object({
        theme: z.enum(['dark', 'light', 'system']).optional(),
        showOnLeaderboard: z.boolean().optional(),
        publicProfile: z.boolean().optional(),
    }).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user settings
        const profileResult = await query(
            'SELECT id, name, email, codeforces_handle, notification_settings, preferences, created_at FROM public.users WHERE id = $1',
            [user.id]
        );

        if (profileResult.rows.length === 0) {
            // Return defaults if user doesn't exist in users table yet
            return NextResponse.json({
                settings: {
                    name: user.email?.split('@')[0] || '',
                    email: user.email,
                    codeforces_handle: '',
                    notification_settings: {
                        emailDigest: true,
                        achievementAlerts: true,
                        leaderboardUpdates: false,
                    },
                    preferences: {
                        theme: 'dark',
                        showOnLeaderboard: true,
                        publicProfile: true,
                    },
                },
            });
        }

        const profile = profileResult.rows[0];

        // Fetch university info
        const uniResult = await query(
            `SELECT uu.university_email, u.name as university_name
             FROM public.university_users uu
             JOIN public.universities u ON u.id = uu.university_id
             WHERE uu.user_id = $1`,
            [user.id]
        );

        const uniRow = uniResult.rows[0];

        return NextResponse.json({
            settings: {
                ...profile,
                email: user.email,
                university_email: uniRow?.university_email,
                university_name: uniRow?.university_name,
                notification_settings: profile.notification_settings || {
                    emailDigest: true,
                    achievementAlerts: true,
                    leaderboardUpdates: false,
                },
                preferences: profile.preferences || {
                    theme: 'dark',
                    showOnLeaderboard: true,
                    publicProfile: true,
                },
            },
        });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request body
        const body = await req.json();
        const result = settingsUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                error: 'Invalid input', 
                details: result.error.flatten() 
            }, { status: 400 });
        }

        const updates: string[] = [];
        const values: (string | number | null | object)[] = [];
        let paramIndex = 1;
        
        if (result.data.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(result.data.name);
        }
        
        if (result.data.codeforces_handle !== undefined) {
            updates.push(`codeforces_handle = $${paramIndex++}`);
            values.push(result.data.codeforces_handle);
            
            // Fetch CF rating if handle provided
            if (result.data.codeforces_handle) {
                try {
                    const cfRes = await fetch(
                        `https://codeforces.com/api/user.info?handles=${result.data.codeforces_handle}`
                    );
                    if (cfRes.ok) {
                        const cfData = await cfRes.json();
                        if (cfData.status === 'OK' && cfData.result?.[0]) {
                            updates.push(`codeforces_rating = $${paramIndex++}`);
                            values.push(cfData.result[0].rating || null);
                            updates.push(`codeforces_data = $${paramIndex++}`);
                            values.push(JSON.stringify(cfData.result[0]));
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch CF data:', e);
                }
            } else {
                updates.push(`codeforces_rating = $${paramIndex++}`);
                values.push(null);
                updates.push(`codeforces_data = $${paramIndex++}`);
                values.push(null);
            }
        }

        if (result.data.notification_settings !== undefined) {
            // Merge with existing settings
            const existingResult = await query(
                'SELECT notification_settings FROM public.users WHERE id = $1',
                [user.id]
            );
            
            const existing = existingResult.rows[0]?.notification_settings || {};
            updates.push(`notification_settings = $${paramIndex++}`);
            values.push(JSON.stringify({
                ...existing,
                ...result.data.notification_settings,
            }));
        }

        if (result.data.preferences !== undefined) {
            // Merge with existing preferences
            const existingResult = await query(
                'SELECT preferences FROM public.users WHERE id = $1',
                [user.id]
            );
            
            const existing = existingResult.rows[0]?.preferences || {};
            updates.push(`preferences = $${paramIndex++}`);
            values.push(JSON.stringify({
                ...existing,
                ...result.data.preferences,
            }));
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        updates.push(`updated_at = NOW()`);
        values.push(user.id);

        // Update user settings
        const updateResult = await query(
            `UPDATE public.users 
             SET ${updates.join(', ')} 
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (updateResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            settings: updateResult.rows[0],
        });
    } catch (error) {
        console.error('Settings PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
