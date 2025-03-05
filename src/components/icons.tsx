import Image from 'next/image'

export const LogoIcon = () => {
	return (
		<Image
			src='/favicon.ico'
			alt='User Circle'
			className='m-0'
			width={20}
			height={20}
		/>
	)
}
