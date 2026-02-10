import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { db } from '~/db/db';
import { actions, notifications } from '~/db/schema';
import { uploadAssetFile } from '~/tools/s3/upload_file.server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';

const jsonError = (message: string, status = 400) => NextResponse.json({ message }, { status });

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'worker') return jsonError('Forbidden', 403);

  const formData = await request.formData();
  const actionIdEntry = formData.get('actionId');
  const imageFile = formData.get('image');

  if (typeof actionIdEntry !== 'string' || !actionIdEntry.trim()) {
    return jsonError('Action ID is required');
  }

  const actionId = parseInt(actionIdEntry, 10);
  if (isNaN(actionId)) return jsonError('Invalid action ID');

  // Verify action exists and belongs to this worker
  const action = await db.query.actions.findFirst({
    where: and(eq(actions.id, actionId), eq(actions.assigned_worker_id, user.id)),
    with: {
      complaint: {
        columns: { id: true, title: true, user_id: true }
      }
    }
  });

  if (!action) return jsonError('Action not found or not assigned to you', 404);
  if (action.status !== 'in_progress') {
    return jsonError('Action is not in a submittable state');
  }

  if (!imageFile || typeof imageFile === 'string') {
    return jsonError('Image is required');
  }

  try {
    const file = imageFile as File;
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const compressedWebpBuffer = await sharp(inputBuffer).webp({ quality: 30 }).toBuffer();

    const generatedKey = `actions/${user.id}-${uuidv4()}.webp` as const;
    await uploadAssetFile(generatedKey, compressedWebpBuffer);

    // Update action: set image key and status to under_review
    await db
      .update(actions)
      .set({
        s3_image_key: generatedKey,
        status: 'under_review'
      })
      .where(eq(actions.id, actionId));

    // Send notification to admins (notify the complaint's user_id is not the admin, we need admin notification)
    // For now, create a notification record — the admin will see it
    // We'll create a notification for the system (sent_by = worker, sent_to could be tracked separately)
    // Since we don't have a specific admin user, we skip admin notification here
    // The admin will see the status change in their dashboard

    return NextResponse.json({ success: true, key: generatedKey });
  } catch (error) {
    console.error('Failed to process or upload action image', error);
    return jsonError('Failed to upload image', 500);
  }
}
