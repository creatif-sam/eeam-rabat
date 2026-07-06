export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-40 md:h-52 rounded-2xl md:rounded-3xl bg-gray-200 dark:bg-gray-800" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
