import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const PFPS_DIR = path.join(process.cwd(), 'public', 'pfps');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

if (!fs.existsSync(PFPS_DIR)) {
  fs.mkdirSync(PFPS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authUser.id;
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, and WebP images are allowed' }, { status: 400 });
    }

    const currentPfpResult = await query('SELECT profile_picture FROM users WHERE id = $1', [userId]);
    const oldPfp = currentPfpResult.rows[0]?.profile_picture;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const finalFilename = `${randomUUID()}.webp`;
    const webpPath = path.join(PFPS_DIR, finalFilename);

    await sharp(buffer)
      .webp({ quality: 85 })
      .resize(512, 512, { fit: 'cover', position: 'center' })
      .toFile(webpPath);

    fs.chmodSync(webpPath, 0o644);

    await query('UPDATE users SET profile_picture = $1 WHERE id = $2', [finalFilename, userId]);

    if (oldPfp && oldPfp !== finalFilename) {
      const oldFilename = path.basename(oldPfp);
      const oldPath = path.join(PFPS_DIR, oldFilename);
      if (oldPath.startsWith(PFPS_DIR) && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture: finalFilename,
      url: `/pfps/${finalFilename}`,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
