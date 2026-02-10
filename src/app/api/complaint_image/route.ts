import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { db } from '~/db/db';
import { getAssetFileSignedUrl } from '~/tools/s3/upload_file.server';

const jsonError = (message: string, status = 400) => NextResponse.json({ message }, { status });

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;
  if (!user) {
    return jsonError('Authentication required', 401);
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return jsonError('Forbidden', 403);
  }

  const body = await request.json().catch(() => null);
  const complaintId = typeof body?.complaintId === 'string' ? body.complaintId.trim() : '';
  if (!complaintId) {
    return jsonError('Invalid complaint id');
  }

  const complaint = await db.query.complaints.findFirst({
    where: (tbl, { eq }) => eq(tbl.id, complaintId),
    columns: {
      image_s3_key: true
    }
  });

  if (!complaint) {
    return jsonError('Complaint not found', 404);
  }

  if (!complaint.image_s3_key) {
    return jsonError('Image not attached', 404);
  }

  try {
    const url = await getAssetFileSignedUrl(complaint.image_s3_key, 60 * 5);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to generate signed url', error);
    return jsonError('Failed to load image', 500);
  }
}
