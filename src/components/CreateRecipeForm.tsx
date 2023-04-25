import { ReactNode } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormValues } from '../pages/recipes/_create'

export function CreateRecipeForm(props: {
  form: UseFormReturn<FormValues, unknown>

  onSubmit: (values: FormValues) => void
  slot: ReactNode
}) {
  return (
    <form
      onSubmit={props.form.handleSubmit(props.onSubmit)}
      className='flex flex-col'
    >
      <div className='mt-2 flex flex-col gap-5'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='text-sm text-gray-500'>
            Name
          </label>
          <input {...props.form.register('name')} className='text-gray-500' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='name' className='text-sm text-gray-500'>
            Description
          </label>
          <input
            {...props.form.register('description')}
            className='text-gray-500'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='text-sm text-gray-500'>
            Ingredients
          </label>
          <textarea
            rows={
              (props.form.getValues('ingredients') || '').split('\n').length ||
              5
            }
            {...props.form.register('ingredients')}
            className='max-h-60 resize-none p-2 text-gray-500'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='text-sm text-gray-500'>
            Instructions
          </label>
          <textarea
            rows={
              (props.form.getValues('instructions') || '').split('\n').length ||
              5
            }
            {...props.form.register('instructions')}
            className='resize-none p-2 text-gray-500'
          />
        </div>
      </div>

      <slot />
    </form>
  )
}
