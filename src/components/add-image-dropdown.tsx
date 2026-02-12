import { cn } from '~/lib/utils'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useRef, useState } from 'react'
import { toast } from './toast'
import { type ChangeEvent } from 'react'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { Button } from './button'
import { CameraIcon, CheckIcon, DownloadIcon, ImageIcon, SaveIcon } from 'lucide-react'
import { Dialog } from './dialog'
import Image from 'next/image'
import { DropdownMenu, type MenuItemProps } from './dropdown-menu'
import { useRecipe } from '~/hooks/use-recipe'
import { LoadingSpinner } from './loaders/loading-spinner'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import type { Basic } from 'unsplash-js/dist/methods/photos/types'

function useAddImage(recipeId: string) {
  const t = useTranslations()
  const utils = api.useUtils()
  const slug = useRecipeSlug()

  const [uploadImageButtonLabel, setUploadImageButtonLabel] = useState<
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
      setUploadImageButtonLabel('addImage')
    },

    onError: (error, _, context) => {
      setUploadImageButtonLabel('addImage')

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
      setUploadImageButtonLabel('uploadingImage')

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
        setUploadImageButtonLabel('addImage')

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

    setUploadImageButtonLabel('uploadImage')
  }

  return {
    uploadImageButtonLabel,
    handleFileChange
  }
}

export function AddImageDropdown({ recipeId }: { recipeId: string }) {
  const { uploadImageButtonLabel, handleFileChange } = useAddImage(recipeId)
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
              uploadImageButtonLabel as keyof typeof t.recipes.byId
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
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('')

  const { data: recipe } = useRecipe()
  const title = recipe?.name
  const { data, isLoading: isLoadingPhotos } = useUnsplashImages(title)
  const { mutate: triggerDownload, isPending: isTriggeringDownload } =
    api.recipes.triggerUnsplashDownload.useMutation()

  const photos = data?.response?.results
  const { mutate: updateImgUrl, isPending: isSaving } =
    api.recipes.updateImgUrl.useMutation({
      onSuccess: () => {
        onOpenChange(false)
        setSelectedPhotoId('')
        utils.recipes.bySlug.invalidate({ slug })
        utils.recipes.infiniteRecipes.invalidate()
        utils.recipes.recentRecipes.invalidate()
        // Trigger download tracking (required by Unsplash API)
        if (photos) {
          const selectedPhoto = photos.find((p) => p.id === selectedPhotoId)
          if (selectedPhoto) {
            triggerDownload({ downloadLocations: [selectedPhoto.links.download_location] })
          }
        }
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })

  const handleSave = () => {
    if (!photos || !selectedPhotoId) return

    const selectedPhoto = photos.find((p) => p.id === selectedPhotoId)
    if (!selectedPhoto) return

    updateImgUrl({ id: recipeId, imgUrl: selectedPhoto.urls.regular })
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
      isDisabled={!selectedPhotoId}
    >
      {isLoadingPhotos ? (
        <LoadingSpinner />
      ) : photos ? (
        <UnsplashImages
          photos={photos}
          selectedPhotoId={selectedPhotoId}
          onSelect={setSelectedPhotoId}
        />
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

function UnsplashImages({
  photos,
  selectedPhotoId,
  onSelect
}: {
  photos: Basic[]
  selectedPhotoId: string
  onSelect: (id: string) => void
  }) {
  const displayPhotos = photos.slice(0, 4)

  return (
    <div className='grid grid-cols-2 gap-4'>
      {displayPhotos.map((photo) => (
        <UnsplashPhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedPhotoId === photo.id}
          onSelect={() => onSelect(photo.id)}
        />
      ))}
    </div>
  )
}

function UnsplashPhotoCard({
  photo,
  isSelected,
  onSelect
}: {
  photo: Basic
  isSelected: boolean
  onSelect: () => void
}) {
  const t = useTranslations()
  return (
    <button
      type='button'
      className='flex flex-col gap-2 text-left'
      onClick={onSelect}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-md ring-2 transition-all',
          isSelected
            ? 'ring-primary ring-offset-2 ring-offset-background'
            : 'ring-transparent hover:ring-muted-foreground/30'
        )}
      >
        <Image
          src={photo.urls.small}
          alt={photo.alt_description || 'Photo from Unsplash'}
          width={300}
          height={200}
          sizes='(max-width: 768px) 50vw, 300px'
          className='aspect-[3/2] object-cover w-full'
        />
        {isSelected && (
          <div className='bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1'>
            <CheckIcon className='h-3 w-3' />
          </div>
        )}
      </div>
      {/* Attribution as required by Unsplash guidelines */}
      <p className='text-muted-foreground text-xs'>
        {t.recipes.byId.photoBy}{' '}
        <a
          href={`${photo.user.links.html}?utm_source=recipe_chat&utm_medium=referral`}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground underline'
          onClick={(e) => e.stopPropagation()}
        >
          {photo.user.name}
        </a>{' '}
        {t.recipes.byId.on}{' '}
        <a
          href='https://unsplash.com?utm_source=recipe_chat&utm_medium=referral'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground underline'
          onClick={(e) => e.stopPropagation()}
        >
          Unsplash
        </a>
      </p>
    </button>
  )
}
