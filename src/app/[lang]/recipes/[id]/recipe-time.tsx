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
    <div className='stats glass-element my-2 rounded'>
      <div className='stat place-items-center px-3 py-3'>
        <div className='text-glass'>{t.recipes.prepTime}</div>
        <div className='text-glass whitespace-normal'>{prepTime}</div>
      </div>

      <div className='stat place-items-center px-3 py-3'>
        <div className='text-glass'>{t.recipes.cookTime}</div>
        <div className='text-glass whitespace-normal'>{cookTime}</div>
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
    <div className='stats glass-element my-2 rounded'>
      <div className='stat place-items-center px-3 py-3'>
        <div className='text-glass'>{t.recipes.prepTime}</div>
        <div className='text-glass whitespace-normal'>
          {formatTimeFromMinutes(prepMinutes, t)}
        </div>
      </div>
      <div className='stat place-items-center px-3 py-3'>
        <div className='text-glass'>{t.recipes.cookTime}</div>
        <div className='text-glass whitespace-normal'>
          {formatTimeFromMinutes(cookMinutes, t)}
        </div>
      </div>
    </div>
  )
}
