import { Save } from 'lucide-react'
import { Button } from './ui/button'

export function SaveButton({
	handleSaveRecipe,
	children,
	isLoading
}: {
	handleSaveRecipe: () => void
	children: React.ReactNode
	isLoading?: boolean
}) {
	return (
		<Button
			isLoading={isLoading}
			variant='secondary'
			onClick={handleSaveRecipe}
			icon={<Save className='h-5 w-5' />}
		>
			{children}
		</Button>
	)
}
