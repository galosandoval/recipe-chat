import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy'
import { prisma } from './db'
import { z } from 'zod'
import { getServerAuthSession } from './auth'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const myFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  recipeImage: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ recipeId: z.number() }))

    .middleware(async ({ req, res, input }) => {
      const session = await getServerAuthSession({ req, res })

      // Throw if user isn't signed in
      if (!session?.user.id)
        throw new Error('You must be logged in to upload a profile picture')


      // Return userId to be used in onUploadComplete
      return { userId: session.user.id, recipeId: input.recipeId }
    })
    
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await prisma.recipe.update({
        where: { id: metadata.recipeId },
        data: { imgUrl: file.url }
      })
    })
} satisfies FileRouter

export type MyFileRouter = typeof myFileRouter
