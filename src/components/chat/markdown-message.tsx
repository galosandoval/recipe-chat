import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'

/**
 * Renders assistant chat content as markdown.
 *
 * The model often replies with headings, bold labels and nested lists; without
 * this the raw `**` / `-` markers leak into the bubble.
 */
export function MarkdownMessage({
  content,
  className
}: {
  content: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose prose-sm text-secondary-foreground max-w-none text-sm',
        // Bubbles are tight — collapse the plugin's generous block spacing.
        'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-headings:mt-3 prose-headings:mb-1 prose-headings:text-sm',
        'prose-ul:pl-4 prose-ol:pl-4',
        'first:prose-p:mt-0 last:prose-p:mb-0',
        // Inherit bubble colors instead of the plugin's gray scale.
        'prose-headings:text-current prose-strong:text-current prose-li:marker:text-current',
        'prose-a:text-current prose-a:underline',
        'prose-code:bg-foreground/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-foreground/10 prose-pre:text-current',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
