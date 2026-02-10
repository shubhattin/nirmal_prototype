import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { db } from '~/db/db';
import { getAssetFileSignedUrl } from '~/tools/s3/upload_file.server';

const jsonError = (message: string, status = 400) => NextResponse.json({ message }, { status });

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;
  if (!user) return jsonError('Authentication required', 401);

  const body = await request.json().catch(() => null);
  const actionId = typeof body?.actionId === 'number' ? body.actionId : null;
  if (!actionId) return jsonError('Invalid action id');

  const action = await db.query.actions.findFirst({
    where: (tbl, { eq }) => eq(tbl.id, actionId),
    columns: {
      s3_image_key: true,
      assigned_worker_id: true
    }
  });

  if (!action) return jsonError('Action not found', 404);

  // Only the assigned worker, admin, or super_admin can view
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isAssignedWorker = user.id === action.assigned_worker_id;
  if (!isAdmin && !isAssignedWorker) {
    return jsonError('Forbidden', 403);
  }

  if (!action.s3_image_key) {
    return jsonError('Image not attached', 404);
  }

  try {
    const url = await getAssetFileSignedUrl(action.s3_image_key, 60 * 5);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to generate signed url for action image', error);
    return jsonError('Failed to load image', 500);
  }
}
