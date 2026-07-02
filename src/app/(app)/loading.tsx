import { LogoMark } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <LogoMark className="w-16 h-16 rounded-2xl animate-scale-in" rounded="rounded-2xl" />
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
