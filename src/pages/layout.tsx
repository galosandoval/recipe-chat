import Link from 'next/link'
import React, { ReactNode } from 'react'

function Layout({ children }: { children: ReactNode }) {
  const menuItems = [
    { label: 'dashboard', value: '/' },
    { label: 'lists', value: '/lists' },
    { label: 'recipes', value: '/recipes' },
    { label: 'friends', value: '/friends' },
    { label: 'account', value: '/account' }
  ]
  return (
    <div className='flex bg-black border-white border'>
      <ul className='flex flex-col border border-white px-5 pt-10'>
        {menuItems.map((item) => (
          <Link href={item.value} key={item.label}>
            <li className='text-white text-2xl cursor-auto select-none w-full group my-1'>
              <span className='transition-all duration-150 border border-black group-hover:border-b-white py-1'>
                {item.label}
              </span>
            </li>
          </Link>
        ))}
      </ul>
      <div className=''>{children}</div>
    </div>
  )
}

export default Layout
