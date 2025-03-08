import { HydrateClient } from '~/trpc/server'

export default async function List() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// const session = await auth();

	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }
	console.log('something', process.env.NEXT_PUBLIC_BASE_PATH)
	return (
		<HydrateClient>
			<main className=''>List</main>
		</HydrateClient>
	)
}
