export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
      <div className="h-72 skeleton" />
      <div className="px-4 py-3 flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full skeleton" />
        <div className="h-6 w-24 rounded-full skeleton" />
        <div className="h-6 w-16 rounded-full skeleton" />
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
      </div>
      <div className="px-4 pb-4 flex gap-3">
        <div className="h-12 flex-1 rounded-2xl skeleton" />
        <div className="h-12 flex-1 rounded-2xl skeleton" />
      </div>
    </div>
  );
}

export function ProfileGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
