import {
  Card as CardUI,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'
import { cn } from '~/lib/utils'
export const Card = ({
  children,
  title,
  description,
  footer,
  className
}: {
  children: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  className?: string
}) => (
  <CardUI className={cn('pt-3', className)}>
    {title ||
      (description && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      ))}
    <CardContent>{children}</CardContent>
    {footer && <CardFooter>{footer}</CardFooter>}
  </CardUI>
)
