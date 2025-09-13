import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from './toast'
import { type ChangeEvent } from 'react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { Button } from './ui/button'
import { CameraIcon } from 'lucide-react'

export function UploadImageButton() {
  const t = useTranslations()
  const utils = api.useUtils()
  const { id } = useParams()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'selectImage' | 'uploadImage' | 'uploadingImage'
  >('selectImage')

  const { mutate: updateImgUrl } = api.recipes.updateImgUrl.useMutation({
    onMutate: async ({ id, imgUrl }) => {
      await utils.recipes.byId.cancel({ id })

      const previousData = utils.recipes.byId.getData({ id })

      if (!previousData) return previousData

      utils.recipes.byId.setData({ id }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipes.byId.invalidate({ id: id as string })
      setUploadImgButtonLabel('selectImage')
    },

    onError: (error, _, context) => {
      setUploadImgButtonLabel('selectImage')

      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.byId.setData({ id: id as string }, previousData)
      }

      toast.error(error.message)
    }
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const fileList = event.target.files

    if (fileList.length) {
      setUploadImgButtonLabel('uploadingImage')

      try {
        if (!fileList?.length) {
          throw Error(t.recipes.byId.noFile)
        }

        const file = fileList[0]

        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file
        })

        const newBlob = (await response.json()) as PutBlobResult

        updateImgUrl({ id: id as string, imgUrl: newBlob.url })
      } catch (error) {
        setUploadImgButtonLabel('selectImage')

        // handle a recognized error
        if (error instanceof BlobAccessError || error instanceof Error) {
          toast.error(error.message)
        } else if (error instanceof Error) {
          toast.error(error.message)
        } else {
          // handle an unrecognized error
          toast.error(t.error.somethingWentWrong)
        }
      }
    }

    setUploadImgButtonLabel('uploadImage')
  }

  return (
    <div className='gap flex flex-col items-center justify-center'>
      <input
        id='file-input'
        type='file'
        name='file'
        className='invisible hidden'
        onChange={handleFileChange}
      />
      <Button
        onClick={() => {
          const fileInput = document.querySelector(
            '#file-input'
          ) as HTMLInputElement | null

          if (fileInput) {
            fileInput.click()
          }
        }}
        variant='outline'
        className='w-3/4'
      >
        <CameraIcon />
        {String(
          t.recipes.byId[uploadImgButtonLabel as keyof typeof t.recipes.byId]
        )}
      </Button>
    </div>
  )
}
