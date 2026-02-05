import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { db } from '~/db/db';
import { complaints, CATEGORY_ENUM_SCHEMA } from '~/db/schema';
import { uploadAssetFile } from '~/tools/s3/upload_file.server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const jsonError = (message: string, status = 400) => NextResponse.json({ message }, { status });

const parseCoordinate = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;
  if (!user) {
    return jsonError('Authentication required', 401);
  }

  const formData = await request.formData();
  const titleEntry = formData.get('title');
  const descriptionEntry = formData.get('description');
  const categoryEntry = formData.get('category');
  const longitudeEntry = formData.get('longitude');
  const latitudeEntry = formData.get('latitude');

  if (typeof titleEntry !== 'string' || !titleEntry.trim()) {
    return jsonError('Title is required');
  }

  if (typeof descriptionEntry !== 'string' || !descriptionEntry.trim()) {
    return jsonError('Description is required');
  }

  if (typeof categoryEntry !== 'string') {
    return jsonError('Category is required');
  }

  const categoryParsed = CATEGORY_ENUM_SCHEMA.safeParse(categoryEntry);
  if (!categoryParsed.success) {
    return jsonError('Invalid category');
  }

  const longitude = parseCoordinate(longitudeEntry);
  if (longitude === null) {
    return jsonError('Invalid longitude');
  }

  const latitude = parseCoordinate(latitudeEntry);
  if (latitude === null) {
    return jsonError('Invalid latitude');
  }

  let imageS3Key: string | null = null;
  const imageFile = formData.get('image');
  if (imageFile && typeof imageFile !== 'string') {
    try {
      const file = imageFile as File;
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      const compressedWebpBuffer = await sharp(inputBuffer)
        .webp({
          quality: 30
        })
        .toBuffer();

      const generatedKey = `complaints/${user.id}-${uuidv4()}.webp` as const;
      await uploadAssetFile(generatedKey, compressedWebpBuffer);
      imageS3Key = generatedKey;
    } catch (error) {
      console.error('Failed to process or upload complaint image', error);
      return jsonError('Failed to upload image', 500);
    }
  }

  const complaint = await db
    .insert(complaints)
    .values({
      title: titleEntry.trim(),
      description: descriptionEntry.trim(),
      category: categoryParsed.data,
      longitude,
      latitude,
      user_id: user.id,
      status: 'open',
      ...(imageS3Key ? { image_s3_key: imageS3Key } : {})
    })
    .returning();

  if (!complaint[0]) {
    return jsonError('Failed to create complaint', 500);
  }

  return NextResponse.json({ id: complaint[0].id });
}
