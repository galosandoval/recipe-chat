import { put } from '@vercel/blob'
import { NextResponse, NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
  api: { bodyParser: false }
}

export default async function upload(req: NextRequest) {
  console.log('first')

  console.log(req.url)

  const { searchParams } = new URL(req.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.error()
  }
  console.log('fileNmae', filename)
  const blob = await put(filename, req as any, {
    access: 'public'
  })

  return NextResponse.json(blob)
}
// nvpvglkh9iqe2xny.public.blob.vercel-storage.com
