import { Menu, Transition } from '@headlessui/react'
import { ThemeToggle, useTheme } from './ThemeToggle'
import { ArrowLeftOnRectangleIcon, UserPlusIcon } from './Icons'
import { signOut } from 'next-auth/react'
import { LoginModal, SignUpModal, useLogin, useSignUp } from './AuthModals'

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu as='div' className='relative'>
      <Menu.Button className='btn-ghost btn-circle btn'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-6 w-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
          />
        </svg>
      </Menu.Button>
      <Transition
        enter='transition duration-100 ease-out'
        enterFrom='transform scale-95 opacity-0'
        enterTo='transform scale-100 opacity-100'
        leave='transition duration-75 ease-out'
        leaveFrom='transform scale-100 opacity-100'
        leaveTo='transform scale-95 opacity-0'
      >
        <Menu.Items className='absolute right-0 top-[0.5rem] z-20 flex flex-col gap-1 rounded-md bg-primary-content shadow'>
          {children}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export function PublicDropdownMenu() {
  const { theme, updateTheme } = useTheme()

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

  return (
    <>
      <Menu as='div' className='relative'>
        <Menu.Button className='btn-ghost btn-circle btn'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
            />
          </svg>
        </Menu.Button>
        <Transition
          enter='transition duration-100 ease-out'
          enterFrom='transform scale-95 opacity-0'
          enterTo='transform scale-100 opacity-100'
          leave='transition duration-75 ease-out'
          leaveFrom='transform scale-100 opacity-100'
          leaveTo='transform scale-95 opacity-0'
        >
          <Menu.Items className='absolute right-0 top-[0.5rem] z-20 flex w-32 flex-col gap-1 rounded-md bg-primary-content shadow'>
            <Menu.Item>
              <button
                className='btn-ghost btn w-full whitespace-nowrap'
                onClick={handleOpenSignUpModal}
              >
                Sign up
                <UserPlusIcon />
              </button>
            </Menu.Item>

            <Menu.Item>
              <button
                className='btn-ghost btn w-full whitespace-nowrap'
                onClick={handleOpenLoginModal}
              >
                Log in
                <ArrowLeftOnRectangleIcon />
              </button>
            </Menu.Item>

            <Menu.Item>
              <ThemeToggle theme={theme} updateTheme={updateTheme} />
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
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

export function ProtectedDropdownMenu() {
  const { theme, updateTheme } = useTheme()

  return (
    <DropdownMenu>
      <Menu.Item>
        <>
          <ThemeToggle updateTheme={updateTheme} theme={theme} />
        </>
      </Menu.Item>
      <Menu.Item>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className='btn-ghost no-animation btn w-[8rem]'
        >
          <span>Logout</span>
          <ArrowLeftOnRectangleIcon />
        </button>
      </Menu.Item>
    </DropdownMenu>
  )
}
