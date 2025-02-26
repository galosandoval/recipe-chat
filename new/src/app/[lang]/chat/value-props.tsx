import { type MouseEvent } from 'react'
import { Button } from '~/components/button'
import {
	ArrowUTurnLeftIcon,
	BookmarkIcon,
	ChatBubbleIcon,
	SparklesIcon
} from '~/components/icons'
import { useTranslations } from '~/hooks/use-translations'
import {
	LoginModal,
	SignUpModal,
	useLogin,
	useSignUp
} from '~/components/auth-modals'
import { useSession } from 'next-auth/react'
import { useChatForm, type ChatFormValues } from './use-chat-form'

export function ValueProps({
	children,
	onSubmit
}: {
	children: React.ReactNode
	onSubmit: (data: ChatFormValues) => void
}) {
	const t = useTranslations()
	return (
		<div className='prose mx-auto flex flex-col items-center justify-center gap-2 py-20'>
			<div className='flex w-full flex-1 flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<ChatBubbleIcon />}
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
						<span className='w-60'>{t.valueProps.firstButton}</span>
						<span>
							<ArrowUTurnLeftIcon />
						</span>
					</Button>
					<Button
						className='btn btn-outline w-full normal-case'
						onClick={() =>
							onSubmit({ prompt: t.valueProps.secondButton })
						}
					>
						<span className='w-60'>
							{t.valueProps.secondButton}
						</span>
						<span>
							<ArrowUTurnLeftIcon />
						</span>
					</Button>
					<Button
						className='btn btn-outline w-full normal-case'
						onClick={() =>
							onSubmit({ prompt: t.valueProps.thirdButton })
						}
					>
						<span className='w-60'>{t.valueProps.thirdButton}</span>
						<span>
							<ArrowUTurnLeftIcon />
						</span>
					</Button>
				</div>
			</div>

			<div className='flex flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<SparklesIcon />}
					label={t.capabilities.title}
				/>

				<div className='flex w-full flex-col items-center'>
					<p className='my-0 grid h-12 w-full items-center rounded-lg px-5 py-0 text-center text-sm font-semibold normal-case text-base-content'>
						{t.capabilities.firstDescription}
					</p>
					<p className='my-0 grid h-12 w-full items-center rounded-lg px-5 py-0 text-center text-sm font-semibold normal-case text-base-content'>
						{t.capabilities.secondDescription}
					</p>
					<p className='my-0 grid h-12 w-full items-center rounded-lg px-5 py-0 text-center text-sm font-semibold normal-case text-base-content'>
						{t.capabilities.thirdDescription}
					</p>
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
	const {
		handleOpen: handleOpenSignUpModal,
		handleClose: handleCloseSignUpModal,
		isOpen,
		errors: signUpErrors,
		handleSubmit: handleSignUpSubmit,
		isLoading: isSubmittingSignUp,
		onSubmit: onSubmitSignUp,
		register: registerSignUp
	} = useSignUp()

	const {
		errors: loginErrors,
		handleClose: handleCloseLoginModal,
		handleOpen: handleOpenLoginModal,
		handleSubmit: handleSubmitLogin,
		isOpen: isLoginOpen,
		isSubmitting: isLoggingIn,
		onSubmit: onSubmitLogin,
		register: registerLogin
	} = useLogin()

	if (isAuthenticated) {
		return null
	}

	return (
		<>
			<div className='flex w-full flex-col items-center justify-center'>
				<ValuePropsHeader
					icon={<BookmarkIcon />}
					label={t.valueProps.saveRecipes}
				/>

				<div className='flex w-full flex-col gap-2'>
					<button
						onClick={handleOpenSignUpModal}
						className='btn btn-primary'
					>
						{t.nav.menu.signUp}
					</button>
					<button
						onClick={handleOpenLoginModal}
						className='btn btn-outline'
					>
						{t.nav.menu.login}
					</button>
				</div>
			</div>

			<SignUpModal
				closeModal={handleCloseSignUpModal}
				errors={signUpErrors}
				handleSubmit={handleSignUpSubmit}
				isLoading={isSubmittingSignUp}
				isOpen={isOpen}
				onSubmit={onSubmitSignUp}
				register={registerSignUp}
			/>

			<LoginModal
				closeModal={handleCloseLoginModal}
				errors={loginErrors}
				handleSubmit={handleSubmitLogin}
				isOpen={isLoginOpen}
				isSubmitting={isLoggingIn}
				onSubmit={onSubmitLogin}
				register={registerLogin}
			/>
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
				<h2 className='mb-2 mt-2 text-lg'>{label}</h2>
				{icon}
			</div>
		</div>
	)
}
