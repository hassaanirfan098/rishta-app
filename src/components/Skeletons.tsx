export function ProfileCardSkeleton() {
  return (
    <div className="relative rounded-[28px] overflow-hidden h-[72vh] min-h-[460px] max-h-[640px] skeleton">
      <div className="absolute inset-x-0 bottom-0 p-5 space-y-3">
        <div className="h-8 w-2/3 rounded-lg bg-white/40" />
        <div className="h-4 w-1/3 rounded bg-white/30" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-white/25" />
          <div className="h-8 w-24 rounded-full bg-white/25" />
        </div>
        <div className="flex justify-center gap-5 pt-2">
          <div className="w-16 h-16 rounded-full bg-white/40" />
          <div className="w-20 h-20 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

export function ProfileGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-50">
      <div className="w-14 h-14 rounded-full skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
