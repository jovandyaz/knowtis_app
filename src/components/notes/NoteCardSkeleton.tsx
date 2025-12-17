import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function NoteCardSkeleton() {
  return (
    <Card className="h-[200px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="mb-2 h-4 w-full animate-pulse rounded-md bg-muted" />
        <div className="mb-4 h-4 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="flex items-center gap-2 pt-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
