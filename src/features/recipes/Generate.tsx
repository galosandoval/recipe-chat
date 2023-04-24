import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { api } from '../../utils/api'
import { z } from 'zod'

const generateRecipeFormSchema = z.object({ message: z.string().min(6) })
type GenerateRecipeParams = z.infer<typeof generateRecipeFormSchema>

export const GenerateRecipe = () => {
  const { data, status, mutate } = api.recipes.generate.useMutation()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<GenerateRecipeParams>()

  const onSubmit = async (values: GenerateRecipeParams) => {
    mutate(values)
  }

  return (
    <div className='flex h-full flex-col justify-between'>
      <div className='overflow-y-auto'>
        <div className='flex flex-1 flex-col'>
          <h2>Examples</h2>
          <div className=''>
            <p className=''>What should I make for dinner tonight?</p>
            <p className=''>I have an onion, and 2 carrots.</p>
          </div>
          <div>{JSON.stringify(data)}</div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='relative flex w-full items-center'
      >
        <textarea
          {...register('message')}
          placeholder='Generate recipe...'
          className='pr- relative max-h-48 w-full overflow-y-auto bg-slate-800 py-3 pl-3 pr-28 text-slate-300'
        ></textarea>
        <div className='absolute right-1'>
          <Button
            type='submit'
            disabled={!!errors.message}
            isLoading={status === 'loading'}
          >
            Generate
          </Button>
        </div>
      </form>
    </div>
  )
}
