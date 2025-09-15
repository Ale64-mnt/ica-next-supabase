export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-96 bg-gray-100 animate-pulse rounded" />
      <div className="space-y-3 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
