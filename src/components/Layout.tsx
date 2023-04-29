import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'
import chefHat from '../assets/chefHat.svg'
import { themeChange } from 'theme-change'

const darkTheme = 'night'
const lightTheme = 'winter'

export default function Layout({ children }: { children: ReactNode }) {
  // let theme: undefined | 'night' | 'winter'

  const router = useRouter()
  const { status } = useSession()
  const menuItems = [
    { label: 'dashboard', value: '/', icon: chefHat },
    { label: 'list', value: '/list', icon: chefHat },
    { label: 'recipes', value: '/recipes', icon: chefHat }
  ]
  const activeLinkStyles = (path: string) => {
    let styles = 'text-info text-primary'

    if (router.asPath === path) {
      styles += ' active'
    }

    return styles
  }
  useEffect(() => {
    const themeDoesNotExist = !('theme' in localStorage)
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    let { theme } = localStorage

    if (themeDoesNotExist && prefersDarkMode) {
      theme = darkTheme
    } else if (themeDoesNotExist && !prefersDarkMode) {
      theme = lightTheme
    }

    if (theme === lightTheme) {
      document.documentElement.setAttribute('data-theme', lightTheme)
      // document.documentElement.classList.remove(darkTheme, 'bg-slate-900')
      // document.documentElement.classList.add(lightTheme)
    } else {
      // document.documentElement.classList.remove(lightTheme)
      // document.documentElement.classList.add(darkTheme)
      document.documentElement.setAttribute('data-theme', darkTheme)
    }
  }, [])

  const handleToggleDarkMode = () => {
    const { theme } = localStorage

    if (theme === darkTheme) {
      localStorage.theme = lightTheme
      document.documentElement.setAttribute('data-theme', lightTheme)

      // document.documentElement.classList.remove(darkTheme)
      // document.documentElement.classList.add(lightTheme)
    } else {
      localStorage.theme = darkTheme
      // document.documentElement.classList.remove(lightTheme)
      // document.documentElement.classList.add(darkTheme)
      document.documentElement.setAttribute('data-theme', darkTheme)
    }
  }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

  if (status === 'unauthenticated') {
    return <>{children}</>
  }

  return (
    <div className='flex h-screen w-full flex-col-reverse md:flex-row'>
      <nav className='btm-nav relative z-10'>
        {menuItems.map((item) => (
          <Link
            className={activeLinkStyles(item.value)}
            href={item.value}
            key={item.label}
          >
            <svg
              width='24'
              height='24'
              xmlns='http://www.w3.org/2000/svg'
              fillRule='evenodd'
              clipRule='evenodd'
              fill='currentColor'
            >
              <path d='M8.742 2.397c.82-.861 1.977-1.397 3.258-1.397 1.282 0 2.439.536 3.258 1.397.699-.257 1.454-.397 2.242-.397 3.587 0 6.5 2.912 6.5 6.5 0 2.299-1.196 4.321-3 5.476v9.024h-18v-9.024c-1.803-1.155-3-3.177-3-5.476 0-3.588 2.913-6.5 6.5-6.5.788 0 1.543.14 2.242.397zm6.258 19.603h5v-7.505c-.715.307-1.38.47-1.953.525-.274.026-.518-.176-.545-.45-.025-.276.176-.52.451-.545 1.388-.132 5.047-1.399 5.047-5.525 0-3.036-2.465-5.5-5.5-5.5-1.099 0-1.771.29-2.512.563-1.521-1.596-2.402-1.563-2.988-1.563-.595 0-1.474-.026-2.987 1.563-.787-.291-1.422-.563-2.513-.563-3.035 0-5.5 2.464-5.5 5.5 0 4.13 3.663 5.394 5.048 5.525.274.025.476.269.45.545-.026.274-.27.476-.545.45-.573-.055-1.238-.218-1.953-.525v7.505h5v-3.5c0-.311.26-.5.5-.5.239 0 .5.189.5.5v3.5h4v-3.5c0-.311.26-.5.5-.5s.5.189.5.5v3.5z' />
            </svg>
            <span className='btm-nav-label'>{item.label}</span>
          </Link>
        ))}
        <div className='text-primary'>
          <label className='swap swap-rotate'>
            <input type='checkbox' />

            <svg
              className={`swap-on h-10 w-10 fill-current`}
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              // data-set-theme='winter'
              // data-act-class='ACTIVECLASS'
              onClick={handleToggleDarkMode}
            >
              <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
            </svg>
            <svg
              className={`swap-off h-10 w-10 fill-current`}
              xmlns='http://www.w3.org/2000/svg'
              // data-set-theme='night'
              // data-act-class='ACTIVECLASS'
              viewBox='0 0 24 24'
              onClick={handleToggleDarkMode}
            >
              <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
            </svg>
          </label>
        </div>
      </nav>
      <main className='container relative z-0 h-full overflow-y-auto'>
        {children}
      </main>
    </div>
  )
}

// export function SettingsPopover({
//   handleToggleDarkMode
// }: {
//   handleToggleDarkMode: () => void
// }) {
//   return (
//     <div className='w-full max-w-sm px-4'>
//       <Popover className='relative'>
//         {({ open }) => (
//           <>
//             <Popover.Button
//               className={`
//                 ${open ? '' : 'text-opacity-90'}
//                 group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
//             >
//               <span>Solutions</span>
//             </Popover.Button>

//             <AnimatePresence>
//               {open && (
//                 <Popover.Panel
//                   className='absolute left-0 z-10 mt-3 max-w-sm -translate-x-1/2 transform px-4 sm:px-0'
//                   as={motion.div}
//                   {...animationOptions}
//                 >
//                   <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5'>
//                     <Button onClick={handleToggleDarkMode}>theme</Button>
//                     <Button
//                       onClick={() =>
//                         signOut({
//                           callbackUrl: process.env.VERCEL_URL
//                             ? process.env.VERCEL_URL
//                             : 'http://localhost:3000/'
//                         })
//                       }
//                     >
//                       logout
//                     </Button>
//                   </div>
//                 </Popover.Panel>
//               )}
//             </AnimatePresence>
//           </>
//         )}
//       </Popover>
//     </div>
//   )
// }
