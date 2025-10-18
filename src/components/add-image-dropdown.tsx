import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from './toast'
import { type ChangeEvent } from 'react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { Button } from './button'
import { CameraIcon, DownloadIcon, ImageIcon } from 'lucide-react'
import { Dialog } from './dialog'
import Image from 'next/image'
import { DropdownMenu, type MenuItemProps } from './dropdown-menu'

function useAddImage() {
  const t = useTranslations()
  const utils = api.useUtils()
  const { id } = useParams()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'addImage' | 'uploadImage' | 'uploadingImage'
  >('addImage')

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
      setUploadImgButtonLabel('addImage')
    },

    onError: (error, _, context) => {
      setUploadImgButtonLabel('addImage')

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
        setUploadImgButtonLabel('addImage')

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

  return {
    uploadImgButtonLabel,
    handleFileChange
  }
}

export function AddImageDropdown() {
  const { uploadImgButtonLabel, handleFileChange } = useAddImage()
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false)
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  const menuItems: MenuItemProps[] = [
    {
      icon: <ImageIcon />,
      label: 'recipes.byId.selectImage',
      onClick: handleClick
    },
    {
      icon: <DownloadIcon />,
      label: 'recipes.byId.unsplash',
      onClick: () => setIsUnsplashOpen(true)
    }
  ]
  return (
    <>
      <DropdownMenu
        items={menuItems}
        title='Image'
        trigger={
          <Button variant='outline' className=''>
            <CameraIcon />
            {String(
              t.recipes.byId[
                uploadImgButtonLabel as keyof typeof t.recipes.byId
              ]
            )}
          </Button>
        }
      />
      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        name='file'
        className='hidden'
        onChange={handleFileChange}
      />
      <UnsplashDialog open={isUnsplashOpen} onOpenChange={setIsUnsplashOpen} />
    </>
  )
}

function UnsplashDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  return (
    <Dialog
      cancelText={t.common.cancel}
      submitText={t.recipes.byId.unsplash}
      title={t.recipes.byId.unsplash}
      description={t.recipes.byId.unsplashDescription}
      open={open}
      onOpenChange={onOpenChange}
    >
      <UnsplashImages />
    </Dialog>
  )
}

function UnsplashImages() {
  const { data: photos } = api.recipes.getPhotoFromTitle.useQuery({
    title: 'buffalo chicken wings'
  })
  if (!photos) return null

  const urls = photos.response?.results.map((result) => result.urls.regular)
  if (!urls) return null
  return (
    <div>
      {urls.map((url) => (
        <Image key={url} src={url} alt='unsplash' width={100} height={100} />
      ))}
    </div>
  )
}
