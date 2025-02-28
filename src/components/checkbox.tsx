import { type ChangeEvent } from 'react'

export const Checkbox = ({
	checked,
	id,
	label,
	onChange
}: {
	checked: boolean
	id: string
	onChange: (event: ChangeEvent<HTMLInputElement>) => void
	label: string
}) => {
	return (
		<div className='form-control'>
			<label
				className='label flex cursor-pointer flex-row-reverse gap-2'
				htmlFor={id}
			>
				<span className='label-text mr-auto'>{label}</span>
				<input
					className='checkbox-primary checkbox'
					type='checkbox'
					name={id}
					id={id}
					checked={checked}
					onChange={onChange}
				/>
			</label>
		</div>
	)
}
