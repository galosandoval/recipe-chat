'use client'

import { type ChangeEvent, type SubmitEvent, useState } from 'react'
import Image from 'next/image'
import { api } from '~/trpc/react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { toast } from '~/components/toast'
import { Button } from '~/components/button'
import { useTranslations } from '~/hooks/use-translations'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

/**
 * Inline image replace control for an existing Recipe image. Renders nothing
 * until the Recipe has an image; the no-image add flow lives in the reading
 * view's {@link AddImageDropdown}. Upload is its own optimistic mutation, kept
 * separate from the staged text/Facet draft (image edits commit immediately).
 */
export function UpdateImage({
  imgUrl,
  id
}: {
  imgUrl: string | null
  id: string
}) {
  const utils = api.useUtils()
  const t = useTranslations()
  const slug = useRecipeSlug()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'updateImage' | 'uploadImage' | 'uploadingImage'
  >('updateImage')

  const { mutate: updateImgUrl } = api.recipes.updateImgUrl.useMutation({
    onMutate: async ({ imgUrl }) => {
      await utils.recipes.bySlug.cancel({ slug })

      const previousData = utils.recipes.bySlug.getData({ slug })

      if (!previousData) return previousData

      utils.recipes.bySlug.setData({ slug }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipes.bySlug.invalidate({ slug })

      toast.success(t.recipes.byId.updateImageSuccess)
    },

    onError: (error, _, context) => {
      const previousData = context?.previousData

      if (previousData) {
        utils.recipes.bySlug.setData({ slug }, previousData)
      }

      toast.error(error.message)
    }
  })

  const handleFileChange = async (
    event: SubmitEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return

    const fileList = event.target.files

    if (!fileList) {
      const fileInput = document.querySelector(
        '#file-input'
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.click()
      }
    } else if (fileList.length) {
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

        updateImgUrl({ id, imgUrl: newBlob.url, oldUrl: imgUrl ?? undefined })
      } catch (error) {
        if (error instanceof BlobAccessError || error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error(t.error.somethingWentWrong)
        }
      }
      setUploadImgButtonLabel('uploadImage')
    }
  }

  if (!imgUrl) return null

  return (
    <div className='relative mx-auto h-32 w-32' onSubmit={handleFileChange}>
      <Image
        className='rounded object-cover'
        src={imgUrl}
        alt='recipe'
        fill
        sizes='128px'
      />
      <span className='absolute inset-0 flex flex-col items-center justify-center gap-4 rounded backdrop-blur-sm'>
        <div className='px-5'>
          <input
            id='file-input'
            type='file'
            name='file'
            className='hidden'
            onChange={handleFileChange}
          />
        </div>

        <div className='flex w-full justify-center'>
          <Button
            type='button'
            onClick={() => {
              const fileInput = document.querySelector(
                '#file-input'
              ) as HTMLInputElement | null

              if (fileInput) {
                fileInput.click()
              }
            }}
          >
            {String(
              t.recipes.byId[
                uploadImgButtonLabel as keyof typeof t.recipes.byId
              ]
            )}
          </Button>
        </div>
      </span>
    </div>
  )
}
