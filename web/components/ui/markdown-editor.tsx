'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  className?: string
  height?: number
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  ({ value, onChange, placeholder = 'Enter description...', className, height = 200 }, ref) => {
    const [content, setContent] = useState(value || '')
    const [renderedContent, setRenderedContent] = useState(value || '')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setContent(value || '')
      setRenderedContent(value || '')
    }, [value])

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value
      setContent(newContent)
      onChange?.(newContent)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        setRenderedContent(content)
      }
    }

    const handleBlur = () => {
      setRenderedContent(content)
    }

    return (
      <div ref={ref} className={cn('w-full relative', className)}>
        <div className="relative">
          {/* Invisible textarea for input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full p-3 border rounded-md bg-transparent resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring relative z-10 text-transparent caret-black dark:caret-white selection:bg-blue-200 dark:selection:bg-blue-800"
            style={{ height, minHeight: height }}
          />
          
          {/* Rendered markdown overlay */}
          <div
            ref={overlayRef}
            className="absolute top-0 left-0 w-full p-3 pointer-events-none prose prose-sm max-w-none dark:prose-invert z-0 overflow-hidden"
            style={{ height, minHeight: height }}
          >
            {renderedContent ? (
              <ReactMarkdown 
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-5">{children}</p>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 leading-5">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mb-2 leading-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-medium mb-2 leading-5">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 leading-5">{children}</li>,
                  code: ({ children, ...props }) => 
                    'inline' in props ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                    ) : (
                      <code className="block bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap leading-4">{children}</code>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted pl-4 italic leading-5">{children}</blockquote>
                  ),
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {renderedContent}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic text-sm leading-5">{placeholder}</p>
            )}
          </div>
        </div>
      </div>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'
