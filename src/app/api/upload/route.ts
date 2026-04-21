import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET = 'chat-files';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const roomId = formData.get('roomId') as string | null;

  if (!file || !roomId) {
    return NextResponse.json({ error: 'File and roomId required' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${roomId}/${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({
    url: publicUrl.publicUrl,
    name: file.name,
    type: file.type,
  });
}
