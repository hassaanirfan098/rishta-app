import { LogoMark } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gray-50">
      <LogoMark className="w-20 h-20 rounded-3xl animate-scale-in" rounded="rounded-3xl" animate />
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
