import { myFileRouter } from 'server/uploadthing'
import { createNextPageApiHandler } from 'uploadthing/next-legacy'

const handler = createNextPageApiHandler({
  router: myFileRouter
})

export default handler
