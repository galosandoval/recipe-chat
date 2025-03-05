import { Save } from 'lucide-react'
import { Button } from './ui/button'

export function SaveButton({
	handleSaveRecipe,
	children
}: {
	handleSaveRecipe: () => void
	children: React.ReactNode
}) {
	return (
		<Button onClick={handleSaveRecipe}>
			<Save className='h-5 w-5' />
			{children}
		</Button>
	)
}
