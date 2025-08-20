import { Card, CardContent } from '@/components/ui/card'

interface ErrorDisplayProps {
  error: string
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Card className="backdrop-blur-xl bg-red-50/40 dark:bg-red-900/40 border border-red-200/50 dark:border-red-700/50 shadow-lg">
      <CardContent className="py-4">
        <div className="text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      </CardContent>
    </Card>
  )
}
