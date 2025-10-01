import { useTranslations } from '~/hooks/use-translations'
import { formatTimeFromMinutes } from '~/lib/format-time'

export function RecipeTime({
  prepTime,
  cookTime
}: {
  prepTime: string
  cookTime: string
}) {
  const t = useTranslations()
  return (
    <div className='glass-element my-2 rounded leading-0'>
      <div className='place-items-center px-2 py-2'>
        <div className='text-sm'>{t.recipes.prepTime}</div>
        <div className='text-sm whitespace-normal'>{prepTime}</div>
      </div>

      <div className='place-items-center px-2 py-2'>
        <div className='text-sm'>{t.recipes.cookTime}</div>
        <div className='text-sm whitespace-normal'>{cookTime}</div>
      </div>
    </div>
  )
}

export function NewRecipeTime({
  prepMinutes,
  cookMinutes
}: {
  prepMinutes: number
  cookMinutes: number
}) {
  const t = useTranslations()
  return (
    <div className='glass-element my-2 flex rounded leading-0'>
      <div className='place-items-center px-2 py-2'>
        <div className='text-sm'>{t.recipes.prepTime}</div>
        <div className='text-sm whitespace-normal'>
          {formatTimeFromMinutes(prepMinutes, t)}
        </div>
      </div>
      <div className='place-items-center px-2 py-2'>
        <div className='text-sm'>{t.recipes.cookTime}</div>
        <div className='text-sm whitespace-normal'>
          {formatTimeFromMinutes(cookMinutes, t)}
        </div>
      </div>
    </div>
  )
}
