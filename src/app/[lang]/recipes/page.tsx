import { HydrateClient } from '~/trpc/server'

export default async function Recipes() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// const session = await auth();

	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }
	return (
		<HydrateClient>
			<main className='transition-width relative flex h-[100svh] w-full flex-1 flex-col items-stretch'>
				Recipes
			</main>
		</HydrateClient>
	)
}
