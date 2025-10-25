import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useRef, useState } from 'react'
import { toast } from './toast'
import { type ChangeEvent } from 'react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { Button } from './button'
import { CameraIcon, DownloadIcon, ImageIcon, SaveIcon } from 'lucide-react'
import { Dialog } from './dialog'
import Image from 'next/image'
import { DropdownMenu, type MenuItemProps } from './dropdown-menu'
import { useRecipe } from '~/hooks/use-recipe'
import { LoadingSpinner } from './loaders/loading-spinner'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

function useAddImage(recipeId: string) {
  const t = useTranslations()
  const utils = api.useUtils()
  const slug = useRecipeSlug()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'addImage' | 'uploadImage' | 'uploadingImage'
  >('addImage')

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
      setUploadImgButtonLabel('addImage')
    },

    onError: (error, _, context) => {
      setUploadImgButtonLabel('addImage')

      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.bySlug.setData({ slug }, previousData)
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

        updateImgUrl({ id: recipeId, imgUrl: newBlob.url })
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

export function AddImageDropdown({ recipeId }: { recipeId: string }) {
  const { uploadImgButtonLabel, handleFileChange } = useAddImage(recipeId)
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
      icon: <CameraIcon />,
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
        trigger={
          <Button variant='outline' className=''>
            <ImageIcon />
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
      <UnsplashDialog
        open={isUnsplashOpen}
        onOpenChange={setIsUnsplashOpen}
        recipeId={recipeId}
      />
    </>
  )
}

function UnsplashDialog({
  open,
  onOpenChange,
  recipeId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipeId: string
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const slug = useRecipeSlug()

  const { data: recipe } = useRecipe()
  const title = recipe?.name
  const { data: photos, isLoading: isLoadingPhotos } = useUnsplashImages(title)
  const { mutate: triggerDownload, isPending: isTriggeringDownload } =
    api.recipes.triggerUnsplashDownload.useMutation()

  const photo = photos?.response?.results[0]
  const { mutate: updateImgUrl, isPending: isSaving } =
    api.recipes.updateImgUrl.useMutation({
      onSuccess: () => {
        onOpenChange(false)
        utils.recipes.bySlug.invalidate({ slug })
        utils.recipes.infiniteRecipes.invalidate()
        utils.recipes.recentRecipes.invalidate()
        // Trigger download tracking (required by Unsplash API)
        if (photo) {
          triggerDownload({ downloadLocation: photo.links.download_location })
        }
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })

  const handleSave = () => {
    if (!photo) return

    // Update recipe with the raw Unsplash image URL
    updateImgUrl({ id: recipeId, imgUrl: photo.urls.regular })
  }

  const isSubmitting = isSaving || isTriggeringDownload

  return (
    <Dialog
      cancelText={t.common.cancel}
      submitIcon={<SaveIcon className='h-4 w-4' />}
      submitText={t.common.save}
      title={t.recipes.byId.unsplash}
      description={t.recipes.byId.unsplashDescription}
      open={open}
      onOpenChange={onOpenChange}
      onClickConfirm={handleSave}
      isLoading={isSubmitting}
    >
      {isLoadingPhotos ? (
        <LoadingSpinner />
      ) : photo ? (
        <UnsplashImage photo={photo} />
      ) : (
        <p className='text-muted-foreground text-sm'>{t.recipes.noPhotos}</p>
      )}
    </Dialog>
  )
}

function useUnsplashImages(title?: string) {
  return api.recipes.getPhotoFromTitle.useQuery(
    {
      title: title || ''
    },
    {
      enabled: !!title
    }
  )
}

function UnsplashImage({ photo }: { photo: any }) {
  const t = useTranslations()
  return (
    <div className='flex flex-col gap-2 overflow-hidden'>
      <div className='max-h-[400px] overflow-hidden rounded-md'>
        <Image
          src={photo.urls.small}
          alt={photo.alt_description || 'Photo from Unsplash'}
          width={400}
          height={300}
          sizes='(max-width: 768px) 100vw, 400px'
          className='object-cover'
        />
      </div>
      {/* Attribution as required by Unsplash guidelines */}
      <p className='text-muted-foreground text-sm'>
        {t.recipes.byId.photoBy}{' '}
        <a
          href={`${photo.user.links.html}?utm_source=recipe_chat&utm_medium=referral`}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground underline'
        >
          {photo.user.name}
        </a>{' '}
        {t.recipes.byId.on}{' '}
        <a
          href='https://unsplash.com?utm_source=recipe_chat&utm_medium=referral'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground underline'
        >
          Unsplash
        </a>
      </p>
    </div>
  )
}
