import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const PFPS_DIR = path.join(process.cwd(), 'public', 'pfps');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Ensure pfps directory exists
if (!fs.existsSync(PFPS_DIR)) {
    fs.mkdirSync(PFPS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authUser = await verifyAuth(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authUser.id;

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Only PNG, JPG, and WebP images are allowed' }, { status: 400 });
        }

        // Get current profile picture to delete later
        const currentPfpResult = await query(
            'SELECT profile_picture FROM users WHERE id = $1',
            [userId]
        );
        const oldPfp = currentPfpResult.rows[0]?.profile_picture;

        // Generate UUID filename
        const uuid = randomUUID();
        const finalFilename = `${uuid}.webp`;
        const webpPath = path.join(PFPS_DIR, finalFilename);

        // Convert to buffer and process with sharp
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
            await sharp(buffer)
                .webp({ quality: 85 })
                .resize(512, 512, { fit: 'cover', position: 'center' })
                .toFile(webpPath);

            // Set file permissions so nginx can read it
            fs.chmodSync(webpPath, 0o644);

            } catch (sharpError) {
            console.error('Sharp conversion error:', sharpError);
            return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
        }

        // Update database with new profile picture filename
        try {
            await query(
                'UPDATE users SET profile_picture = $1 WHERE id = $2',
                [finalFilename, userId]
            );
        } catch (dbError) {
            // Database update failed, cleanup the uploaded file
            console.error('Database update failed:', dbError);
            try {
                fs.unlinkSync(webpPath);
            } catch { /* ignore cleanup errors */ }
            return NextResponse.json({ error: 'Failed to save profile picture' }, { status: 500 });
        }

        // Delete old profile picture if exists
        if (oldPfp && oldPfp !== finalFilename) {
            const oldPath = path.join(PFPS_DIR, oldPfp);
            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    }
            } catch (err) {
                console.error('Error deleting old profile picture:', err);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profile_picture: finalFilename,
            url: `/pfps/${finalFilename}`
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
