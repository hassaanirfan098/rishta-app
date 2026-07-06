"use client";

import { useRef, useState } from "react";
import { X, Heart, Lock, BadgeCheck, MapPin } from "lucide-react";
import { calculateAge } from "@/lib/utils";

export interface DeckItem {
  type: "member" | "directory";
  data: {
    id: string;
    full_name: string;
    date_of_birth?: string;
    age?: number;
    city?: string;
    country?: string;
    sect?: string;
    profession?: string;
    religiosity?: string;
    avatar_url?: string;
    is_verified?: boolean;
    gender?: string;
  };
}

function initials(name: string) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const SWIPE_THRESHOLD = 110;

/**
 * Muzz-style swipe deck, premium execution: one full-bleed card at a time,
 * drag-to-swipe with tilt, LIKE/PASS stamps, calm circular actions.
 * Member cards: swipe right = like, left = pass. Directory cards: swipe
 * left = skip, swipe right opens the unlock flow (no free likes on paid tier).
 */
export function SwipeDeck({
  items,
  onLike,
  onUnlock,
  onOpenProfile,
  emptyState,
}: {
  items: DeckItem[];
  onLike: (id: string) => void;
  onUnlock: (id: string) => void;
  onOpenProfile: (id: string) => void;
  emptyState?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const current = items[index];
  const upcoming = items[index + 1];

  const fly = (dir: "left" | "right") => {
    if (!current || leaving) return;
    if (dir === "right" && current.type === "directory") {
      // Paid tier — a right swipe means "I want this contact": open unlock
      setDrag(null);
      onUnlock(current.data.id);
      return;
    }
    setLeaving(dir);
    const item = current;
    setTimeout(() => {
      if (dir === "right" && item.type === "member") onLike(item.data.id);
      setIndex((i) => i + 1);
      setDrag(null);
      setLeaving(null);
    }, 280);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leaving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current || leaving) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true;
    setDrag({ x: dx, y: dy });
  };

  const onPointerUp = () => {
    if (!start.current) return;
    const dx = drag?.x ?? 0;
    start.current = null;
    if (dx > SWIPE_THRESHOLD) fly("right");
    else if (dx < -SWIPE_THRESHOLD) fly("left");
    else {
      setDrag(null);
      if (!moved.current && current) onOpenProfile(current.data.id);
    }
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {emptyState ?? (
          <>
            <h3 className="text-lg font-semibold text-ink">You&apos;re all caught up</h3>
            <p className="text-sm text-muted mt-2 max-w-xs">
              You&apos;ve seen everyone for now. New members join every day — check back soon.
            </p>
          </>
        )}
      </div>
    );
  }

  const dx = drag?.x ?? 0;
  const stampOpacity = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);
  const topTransform = leaving
    ? `translate(${leaving === "right" ? 120 : -120}vw, ${(drag?.y ?? 0) * 0.4}px) rotate(${leaving === "right" ? 18 : -18}deg)`
    : drag
      ? `translate(${dx}px, ${drag.y * 0.35}px) rotate(${dx / 22}deg)`
      : "none";

  const renderCardBody = (item: DeckItem) => {
    const p = item.data;
    const age = p.age ?? (p.date_of_birth ? calculateAge(p.date_of_birth) : null);
    const meta = [p.sect, p.profession].filter(Boolean).join(" · ");
    const isDirectory = item.type === "directory";

    return (
      <>
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar_url} alt={p.full_name} draggable={false} className="absolute inset-0 w-full h-full object-cover select-none" />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center text-6xl font-semibold ${
              isDirectory
                ? "bg-gradient-to-br from-gold-100 to-gold-300 text-gold-700"
                : "bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700"
            }`}
          >
            {initials(p.full_name)}
          </div>
        )}

        {/* Bottom scrim */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Top badge */}
        {isDirectory ? (
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
            <Lock className="h-3 w-3 text-gold-600" />
            Directory
          </span>
        ) : p.is_verified ? (
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
            <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
            Verified
          </span>
        ) : null}

        {/* Info */}
        <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none">
          <h2 className="text-white text-3xl font-semibold tracking-tight leading-none">
            {p.full_name}
            {age ? <span className="font-normal text-white/85">, {age}</span> : ""}
          </h2>
          {(p.city || p.country) && (
            <p className="text-white/80 text-sm mt-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {[p.city, p.country].filter(Boolean).join(", ")}
            </p>
          )}
          {meta && <p className="text-white/70 text-sm mt-1">{meta}</p>}
        </div>
      </>
    );
  };

  return (
    <div className="select-none">
      {/* Deck */}
      <div className="relative h-[min(66vh,600px)] min-h-[430px] max-w-md mx-auto">
        {/* Next card, peeking behind */}
        {upcoming && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden bg-surface-strong scale-[0.96] translate-y-2 shadow-card">
            {renderCardBody(upcoming)}
          </div>
        )}

        {/* Top card */}
        <div
          className="absolute inset-0 rounded-[20px] overflow-hidden bg-surface-strong shadow-card cursor-grab active:cursor-grabbing touch-none"
          style={{
            transform: topTransform,
            transition: drag ? "none" : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {renderCardBody(current)}

          {/* Drag stamps */}
          <span
            className="absolute top-8 left-6 px-3.5 py-1.5 rounded-lg border-[3px] border-white text-white text-xl font-bold tracking-widest uppercase -rotate-12 bg-brand-600/85"
            style={{ opacity: dx > 0 ? stampOpacity : 0 }}
          >
            {current.type === "directory" ? "Unlock" : "Like"}
          </span>
          <span
            className="absolute top-8 right-6 px-3.5 py-1.5 rounded-lg border-[3px] border-white text-white text-xl font-bold tracking-widest uppercase rotate-12 bg-ink/70"
            style={{ opacity: dx < 0 ? stampOpacity : 0 }}
          >
            Pass
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-5 pt-6 max-w-md mx-auto">
        <button
          aria-label="Pass"
          onClick={() => fly("left")}
          className="w-14 h-14 rounded-full bg-white border border-hairline shadow-card flex items-center justify-center text-ink hover:bg-surface-soft active:scale-95 transition-all"
        >
          <X className="h-6 w-6" />
        </button>
        {current.type === "directory" ? (
          <button
            onClick={() => onUnlock(current.data.id)}
            className="h-14 px-7 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-medium shadow-card flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Lock className="h-4 w-4" />
            Unlock — Rs 500
          </button>
        ) : (
          <button
            aria-label="Like"
            onClick={() => fly("right")}
            className="w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-700 shadow-card flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <Heart className="h-7 w-7 fill-white" />
          </button>
        )}
      </div>
    </div>
  );
}
