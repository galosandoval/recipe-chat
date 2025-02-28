'use client'

// import React, { createContext, useContext, useRef, useEffect } from 'react'

// // 1. Create the context
// const TopRefContext = createContext<React.RefObject<HTMLDivElement> | null>(
// 	null
// )
// const BottomRefContext = createContext<React.RefObject<HTMLDivElement> | null>(
// 	null
// )

// // 2. Context Provider
// const InputRefProvider = ({ children }: { children: React.ReactNode }) => {
// 	const topRef = useRef<HTMLDivElement>(null) // Ref managed at the top level
// 	const bottomRef = useRef<HTMLDivElement>(null) // Ref managed at the top level
// 	return (
// 		<TopRefContext.Provider value={topRef}>
// 			<BottomRefContext.Provider value={bottomRef}>
// 				{children}
// 			</BottomRefContext.Provider>
// 		</TopRefContext.Provider>
// 	)
// }

// // 3. Hook to use the context
// const useTopRef = () => useContext(TopRefContext)
// const useBottomRef = () => useContext(BottomRefContext)

// const useScrollToBottom = () => {
// 	const bottomRef = useBottomRef()
// 	const topRef = useTopRef()

// 	// useEffect(() => {
// 	// 	bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
// 	// }, [])

// 	const scrollToBottom = () => {
// 		bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
// 	}

// 	const scrollToTop = () => {
// 		topRef?.current?.scrollIntoView({ behavior: 'smooth' })
// 	}

// 	return {
// 		bottomRef,
// 		topRef,
// 		scrollToBottom,
// 		scrollToTop
// 	}
// }
// export { InputRefProvider, useTopRef, useBottomRef, useScrollToBottom }

import React, { createContext, useContext, useRef } from 'react'

// Create the Context
const ScrollContext = createContext<React.RefObject<HTMLDivElement> | null>(
	null
)

// Provider Component
export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
	const bottomRef = useRef<HTMLDivElement>(null) // Ref for the target element

	return (
		<ScrollContext.Provider value={bottomRef}>
			{children}
		</ScrollContext.Provider>
	)
}

// Custom hook to use the context
export const useScrollRef = () => useContext(ScrollContext)
