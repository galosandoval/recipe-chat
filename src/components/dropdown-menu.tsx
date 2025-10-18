import { useTranslations, type TPaths } from '~/hooks/use-translations'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { DropdownMenu as DropdownMenuUI } from './ui/dropdown-menu'
import { Fragment } from 'react'

export type MenuItemProps =
  | {
      label?: TPaths
      icon?: React.ReactNode
      space?: 'above' | 'below'
      onClick?: () => void
    }
  | {
      slot: React.ReactNode
    }

export function DropdownMenu<T extends MenuItemProps | null>({
  items,
  title,
  trigger
}: {
  items: T[]
  title: string
  trigger: React.ReactNode
}) {
  const t = useTranslations()
  return (
    <DropdownMenuUI>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item, idx) => {
          if (!item) return null
          if ('slot' in item) {
            return (
              <DropdownMenuItem asChild key={idx}>
                {item.slot}
              </DropdownMenuItem>
            )
          }
          if (!item.label && !item.icon && !item.onClick)
            return <DropdownMenuSeparator key={idx} />
          return (
            <Fragment key={idx}>
              {item.space === 'above' && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={item.onClick}>
                {item.icon}
                {<span>{t.get(item.label ?? '')}</span>}
              </DropdownMenuItem>
              {item.space === 'below' && <DropdownMenuSeparator />}
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenuUI>
  )
}

export function buildMenuItem(item: MenuItemProps) {
  if ('slot' in item) {
    return {
      slot: item.slot
    }
  }
  return {
    label: item?.label,
    icon: item?.icon,
    space: item?.space,
    onClick: item?.onClick
  }
}
