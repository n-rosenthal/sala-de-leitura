export function PageSkeleton() {
    return (
    <div className="space-y-4">
        <div className="h-6 w-1/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
    </div>
    );
}