import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const PFPS_DIR = path.join(process.cwd(), 'public', 'pfps');

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authUser.id;
    const result = await query('SELECT profile_picture FROM users WHERE id = $1', [userId]);
    const currentPfp = result.rows[0]?.profile_picture;

    if (!currentPfp) {
      return NextResponse.json({ error: 'No profile picture to delete' }, { status: 404 });
    }

    const filename = path.basename(currentPfp);
    const filePath = path.join(PFPS_DIR, filename);
    if (filePath.startsWith(PFPS_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await query('UPDATE users SET profile_picture = NULL WHERE id = $1', [userId]);
    return NextResponse.json({ success: true, message: 'Profile picture deleted' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
