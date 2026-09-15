export default function Loading() {
  return (
    <div className="app-background min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-[1180px] animate-pulse">
        <div className="h-12 w-48 rounded-[10px] bg-soft" />
        <div className="mt-12 h-16 max-w-xl rounded-[10px] bg-soft" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-44 rounded-[12px] border border-line bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}