import { put } from '@vercel/blob'
import { NextResponse, NextRequest } from 'next/server'

export const config = {
  runtime: 'edge'
}

export default async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.error()
  }

  const blob = await put(filename, req.body as any, {
    access: 'public'
  })

  return NextResponse.json(blob)
}
