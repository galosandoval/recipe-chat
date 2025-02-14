import { prisma } from '~/server/db'

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id }
  })
}
