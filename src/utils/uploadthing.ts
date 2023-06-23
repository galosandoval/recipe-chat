import { generateReactHelpers } from '@uploadthing/react/hooks'
import { MyFileRouter } from 'server/uploadthing'

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<MyFileRouter>()
