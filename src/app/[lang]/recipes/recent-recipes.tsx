import type { Recipe } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { RecipeFallbackSVG } from '~/components/icons'
import { Card } from '~/components/ui/card'
import { api } from '~/trpc/server'

export async function RecentRecipes() {
	const recentRecipes = await api.recipes.recentRecipes()

	return (
		<div className='grid-2 col-span-2 grid grid-cols-2 gap-4 sm:col-span-4 sm:grid-cols-4'>
			{recentRecipes.map((recipe) => (
				<RecentRecipe key={recipe.id} recipe={recipe} />
			))}
		</div>
	)
}

function RecentRecipe({ recipe }: { recipe: Recipe }) {
	return (
		<Card key={recipe.id}>
			<Link
				href={`/recipes/${recipe.id}?name=${encodeURIComponent(
					recipe.name
				)}`}
				className='flex h-10 gap-2 overflow-hidden rounded-md'
			>
				{recipe.imgUrl ? (
					<Image
						src={recipe.imgUrl}
						alt='recipe'
						height={40}
						width={40}
						className='object-fill'
					/>
				) : (
					<div className='bg-primary-content self-center'>
						<RecipeFallbackSVG className='h-10 w-10' />
					</div>
				)}
				<p className='self-center truncate whitespace-nowrap text-left text-xs'>
					{recipe.name}
				</p>
			</Link>
		</Card>
	)
}
