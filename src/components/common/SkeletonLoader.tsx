export default function SkeletonLoader({ lines = 8 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${Math.max(40, 100 - i * 8)}%` }}
        />
      ))}
    </div>
  );
}
