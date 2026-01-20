import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">About DikporaRoom</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-foreground">
          <p>
            DikporaRoom is a modern room booking management system designed to streamline workspace allocation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
