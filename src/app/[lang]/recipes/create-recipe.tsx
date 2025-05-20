import { FormLoader } from '~/components/loaders/form'
import { useTranslations } from '~/hooks/use-translations'
import type {
	LinkedDataRecipeField,
	RecipeUrlSchemaType
} from '~/schemas/recipes'
import { UploadRecipeUrlForm } from './client-recipes'
import { Button } from '~/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { Modal } from '~/components/modal'
import { useState } from 'react'
import { api } from '~/trpc/react'

export function CreateRecipe({
	data,
	closeModal
}: {
	data: LinkedDataRecipeField
	closeModal: () => void
}) {
	const t = useTranslations()

	// const {
	// 	handleSubmit,
	// 	getValues,
	// 	register,
	// 	onSubmit,
	// 	isSuccess,
	// 	isLoading
	// } = useCreateRecipe(data)

	// const ingredientsRowSize = (getValues('ingredients') || '').split(
	// 	'\n'
	// ).length
	// const instructionsRowSize = (getValues('instructions') || '').split(
	// 	'\n'
	// ).length

	return (
		<form className='flex flex-col'>
			<div className='mt-2 flex max-h-[38rem] flex-col gap-5 overflow-y-auto px-1 pb-1'>
				<div className='flex flex-col'>
					<label htmlFor='name' className='label'>
						<span className='label-text'>{t.recipes.name}</span>
					</label>
					<input
						id='name'
						// {...register('name')}
						className='input input-bordered'
					/>
				</div>
				<div className='flex flex-col'>
					<label htmlFor='description' className='label'>
						<span className='label-text'>
							{t.recipes.description}
						</span>
					</label>
					<input
						id='description'
						// {...register('description')}
						className='input input-bordered'
					/>
				</div>

				<div className='flex gap-2'>
					<div className='flex w-1/2 flex-col'>
						<label htmlFor='prepTime' className='label'>
							<span className='label-text'>
								{t.recipes.prepTime}
							</span>
						</label>
						<input
							id='prepTime'
							type='text'
							className='input input-bordered input-sm'
							// {...register('prepTime')}
						/>
					</div>
					<div className='flex w-1/2 flex-col'>
						<label htmlFor='cookTime' className='label'>
							<span className='label-text'>
								{t.recipes.cookTime}
							</span>
						</label>
						<input
							id='cookTime'
							type='text'
							className='input input-bordered input-sm pr-2'
							// {...register('cookTime')}
						/>
					</div>
				</div>
				<div className='flex flex-col'>
					<label htmlFor='ingredients' className='label'>
						<span className='label-text'>
							{t.recipes.ingredients}
						</span>
					</label>
					<textarea
						id='ingredients'
						// rows={ingredientsRowSize}
						// {...register('ingredients')}
						className='textarea textarea-bordered resize-none'
					/>
				</div>
				<div className='flex flex-col'>
					<label htmlFor='instructions' className='label'>
						<span className='label-text'>
							{t.recipes.instructions}
						</span>
					</label>
					<textarea
						id='instructions'
						// rows={instructionsRowSize}
						// {...register('instructions')}
						className='textarea textarea-bordered resize-none'
					/>
				</div>
			</div>
			<div className='flex w-full gap-1 px-2 py-2'>
				{/* {isSuccess ? (
					<Button
						className='btn btn-ghost w-1/2'
						onClick={closeModal}
					>
						Return
					</Button>
				) : (
					<>
						<Button
							type='button'
							onClick={closeModal}
							className='btn btn-ghost w-1/2'
						>
							{t('recipes.cancel')}
						</Button>
						<Button
							isLoading={isLoading}
							className='btn btn-primary w-1/2'
							type='submit'
						>
							{t('recipes.save')}
						</Button>
					</>
				)} */}
			</div>
		</form>
	)
}

function CreateRecipeButton() {
	const { isOpen, status, data, openModal, closeModal, onSubmitUrl } =
		useParseRecipe()

	let modalContent = <UploadRecipeUrlForm onSubmit={onSubmitUrl} />

	if (status === 'error') {
		modalContent = (
			<progress
				className='progress progress-error w-full'
				value='100'
				max='100'
			></progress>
		)
	}

	if (status === 'success') {
		modalContent = <FormLoader />
	}

	if (status === 'success' && data) {
		modalContent = <CreateRecipe data={data} closeModal={closeModal} />
	}

	return (
		<>
			<Button
				type='button'
				onClick={openModal}
				className='btn btn-circle btn-outline'
			>
				<PlusIcon size={6} />
			</Button>
			<Modal closeModal={closeModal} isOpen={isOpen}>
				{modalContent}
			</Modal>
		</>
	)
}

function useParseRecipe() {
	const [isOpen, setIsOpen] = useState(false)
	const { mutate, status, data, reset } =
		api.recipes.parseRecipeUrl.useMutation()

	function closeModal() {
		setIsOpen(false)
		setTimeout(() => {
			reset()
		}, 200)
	}

	function openModal() {
		setIsOpen(true)
	}

	function onSubmitUrl(values: RecipeUrlSchemaType) {
		mutate(values.url)
	}

	return {
		isOpen,
		status,
		data,
		openModal,
		closeModal,
		onSubmitUrl
	}
}
