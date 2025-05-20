import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import { ClientRecipes } from './client-recipes'
import { RecentRecipes } from './recent-recipes'

export default async function RecipesPage() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth()
	if (!session?.user) {
		redirect('/')
	}

	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }
	return (
		<HydrateClient>
			<main className='h-app-screen relative flex w-full flex-1 flex-col items-stretch'>
				<div className='px-4 pt-4'>
					<RecentRecipes />
					<Recipes />
				</div>
			</main>
		</HydrateClient>
	)
}

async function Recipes() {
	const recipes = await api.recipes.infiniteRecipes({
		limit: 10,
		search: ''
	})

	return <ClientRecipes initialRecipes={recipes} />
}
