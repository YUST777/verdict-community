import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { z } from 'zod';

// Validation schema for profile updates
const profileUpdateSchema = z.object({
    display_name: z.string().min(1).max(100).optional(),
    codeforces_handle: z.string().max(50).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user profile from users table
        const profileResult = await query(
            'SELECT * FROM public.users WHERE id = $1',
            [user.id]
        );

        if (profileResult.rows.length === 0) {
            // Return basic profile from auth user
            return NextResponse.json({
                profile: {
                    id: user.id,
                    email: user.email,
                    name: user.email?.split('@')[0],
                    created_at: new Date().toISOString(),
                },
            });
        }

        const profile = profileResult.rows[0];

        // Fetch university info directly from users.university_id
        let universityInfo = null;
        if (profile.university_id) {
            try {
                const uniResult = await query(
                    `SELECT id, name, short_name, slug, email_domain, type, logo_url, member_count, total_solves
                     FROM public.universities WHERE id = $1`,
                    [profile.university_id]
                );
                if (uniResult.rows.length > 0) {
                    const u = uniResult.rows[0];
                    universityInfo = {
                        id: u.id,
                        name: u.name,
                        shortName: u.short_name,
                        slug: u.slug,
                        domain: u.email_domain,
                        type: u.type,
                        logoUrl: u.logo_url,
                        memberCount: parseInt(u.member_count) || 0,
                        totalSolves: parseInt(u.total_solves) || 0,
                    };
                }
            } catch { /* universities table may not exist */ }
        }

        return NextResponse.json({
            profile: {
                ...profile,
                university: universityInfo,
            },
        });
    } catch (error) {
        console.error('Profile GET error:', error);
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
        const result = profileUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                error: 'Invalid input', 
                details: result.error.flatten() 
            }, { status: 400 });
        }

        const updates: string[] = [];
        const values: (string | number | null | object)[] = [];
        let paramIndex = 1;
        
        if (result.data.display_name !== undefined) {
            updates.push(`display_name = $${paramIndex++}`);
            values.push(result.data.display_name);
        }
        
        if (result.data.codeforces_handle !== undefined) {
            updates.push(`codeforces_handle = $${paramIndex++}`);
            values.push(result.data.codeforces_handle);
            
            // Optionally fetch CF rating if handle provided
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
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        updates.push(`updated_at = NOW()`);
        values.push(user.id);

        // Update user profile
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
            profile: updateResult.rows[0],
        });
    } catch (error) {
        console.error('Profile PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
