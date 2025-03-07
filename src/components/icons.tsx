import Image from 'next/image'

export const LogoIcon = () => {
	return (
		<Image
			src='/images/favicon-32x32.png'
			alt='User Circle'
			className='m-0'
			width={20}
			height={20}
		/>
	)
}
