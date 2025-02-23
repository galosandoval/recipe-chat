import { useTranslation as _useTranslation } from 'next-i18next'

export const useTranslation = () => {
	const { t } = _useTranslation('common')

	return t
}
