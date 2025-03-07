import { useTranslations } from '~/hooks/use-translations'
import { signIn, useSession } from 'next-auth/react'
import { type ChatFormValues } from './use-chat-form'
import { Button } from '~/components/ui/button'
import { H3, P } from '~/components/ui/typography'
import GoogleSignInButton from 'react-google-button'
import { CornerDownLeft, MessagesSquare, Save, Sparkle } from 'lucide-react'

export function ValueProps({
	children,
	onSubmit
}: {
	children: React.ReactNode
	onSubmit: (data: ChatFormValues) => void
}) {
	const t = useTranslations()
	return (
		<div className='mx-auto flex flex-col items-center justify-center gap-2 py-20'>
			<div className='flex w-full flex-1 flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<MessagesSquare />}
					label={t.valueProps.title}
				/>

				<div className='flex w-full flex-col items-center gap-4'>
					<Button
						className='btn btn-outline w-full normal-case'
						onClick={() =>
							onSubmit({
								prompt: t.valueProps.firstButton
							})
						}
					>
						<span>{t.valueProps.firstButton}</span>
						<span>
							<CornerDownLeft />
						</span>
					</Button>
					<Button
						className='btn btn-outline w-full normal-case'
						onClick={() =>
							onSubmit({ prompt: t.valueProps.secondButton })
						}
					>
						<span>{t.valueProps.secondButton}</span>
						<span>
							<CornerDownLeft />
						</span>
					</Button>
					<Button
						className='btn btn-outline w-full normal-case'
						onClick={() =>
							onSubmit({ prompt: t.valueProps.thirdButton })
						}
					>
						<span>{t.valueProps.thirdButton}</span>
						<CornerDownLeft />
					</Button>
				</div>
			</div>

			<div className='flex flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<Sparkle />}
					label={t.capabilities.title}
				/>

				<div className='flex w-full flex-col items-center'>
					<P>{t.capabilities.firstDescription}</P>
					<P>{t.capabilities.secondDescription}</P>
					<P>{t.capabilities.thirdDescription}</P>
				</div>
			</div>

			{children}

			<Auth />
		</div>
	)
}

function Auth() {
	const session = useSession()
	const isAuthenticated = session.status === 'authenticated'
	const t = useTranslations()

	if (isAuthenticated) {
		return null
	}

	return (
		<>
			<div className='flex w-full flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<Save />}
					label={t.valueProps.saveRecipes}
				/>

				<div className='flex w-full justify-center'>
					<GoogleSignInButton onClick={() => signIn('google')} />
					{/* <SignUpModalTrigger>{t.nav.menu.signUp}</SignUpModalTrigger>
					<LoginModalTrigger>{t.nav.menu.login}</LoginModalTrigger> */}
				</div>
			</div>
		</>
	)
}

export function ValuePropsHeader({
	label,
	icon
}: {
	label: string
	icon: React.ReactNode
}) {
	return (
		<div className='divider'>
			<div className='flex items-center gap-2'>
				<H3 className='flex items-center justify-center gap-2 pb-2'>
					<span className='ml-2'>{icon}</span>
					{label}
				</H3>
			</div>
		</div>
	)
}
