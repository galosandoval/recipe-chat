import { useTranslations, type TPaths } from '~/hooks/use-translations'
import { Button } from './ui/button'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { DropdownMenu as DropdownMenuUI } from './ui/dropdown-menu'

export type MenuItemProps = {
  label?: TPaths
  icon?: React.ReactNode
  onClick?: () => void
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
  console.log('items', items)
  return (
    <DropdownMenuUI>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          {trigger}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item, idx) => {
          if (!item) return null
          if (!item.label && !item.icon && !item.onClick)
            return <DropdownMenuSeparator key={idx} />
          return (
            <DropdownMenuItem key={idx} onClick={item.onClick}>
              {item.icon}
              {<span>{t.get(item.label as TPaths)}</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenuUI>
  )
}
