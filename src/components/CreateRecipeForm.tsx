import { FormValues } from 'pages/chat'
import { ReactNode } from 'react'
import { UseFormReturn } from 'react-hook-form'

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
          <label htmlFor='name' className='label'>
            <span className='label-text'>Name</span>
          </label>
          <input id='name' {...props.form.register('name')} className='input' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>Description</span>
          </label>
          <input
            id='description'
            {...props.form.register('description')}
            className='input'
          />
        </div>

        <div className='flex gap-2'>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='prepTime' className='label'>
              <span className='label-text'>Prep time</span>
            </label>
            <input
              id='prepTime'
              type='text'
              className='input'
              {...props.form.register('prepTime')}
            />
          </div>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='cookTime' className='label'>
              <span className='label-text'>Cook time</span>
            </label>
            <input
              id='cookTime'
              type='text'
              className='input'
              {...props.form.register('cookTime')}
            />
          </div>
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>Ingredients</span>
          </label>
          <textarea
            id='ingredients'
            rows={
              props.form.getValues('ingredients')?.length > 6
                ? 6
                : props.form.getValues('ingredients')?.length
            }
            {...props.form.register('ingredients')}
            className='textarea resize-none'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>Instructions</span>
          </label>
          <textarea
            id='instructions'
            rows={
              props.form.getValues('instructions')?.length > 6
                ? 6
                : props.form.getValues('instructions')?.length
            }
            {...props.form.register('instructions')}
            className='textarea resize-none'
          />
        </div>
      </div>

      {props.slot}
    </form>
  )
}
