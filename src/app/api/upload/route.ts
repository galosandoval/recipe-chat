import { put } from '@vercel/blob'

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return Response.error()
  }

  const blob = await put(filename, req.body as any, {
    access: 'public'
  })

  return Response.json(blob)
}
