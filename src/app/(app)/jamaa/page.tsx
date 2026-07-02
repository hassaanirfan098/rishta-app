"use client";

import { Fragment, useEffect, useState } from "react";
import { Search, Bell, Heart, MessageSquare, Share2, BarChart2, X, Plus } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";
import { cn } from "@/lib/utils";

type Tab = "for-you" | "new" | "following";

interface Post {
  id: string;
  name: string;
  handle: string;
  group: string;
  time: string;
  body: string;
  likes: number;
  comments: number;
  views: number;
  color: string;
}

const GROUPS = [
  { name: "Wedding Tips", members: "12.4K" },
  { name: "Deen & Rishta", members: "8.1K" },
];

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    name: "Sana K.",
    handle: "@sana.k",
    group: "Wedding Tips",
    time: "3h ago",
    body: "Any recommendations for affordable mehndi artists in Lahore? 💛",
    likes: 24,
    comments: 9,
    views: 412,
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "p2",
    name: "Bilal Ahmed",
    handle: "@bilalahmed",
    group: "Deen & Rishta",
    time: "5h ago",
    body: "الحمدللہ engaged after 8 months on here 🥹 patience really is key.",
    likes: 156,
    comments: 31,
    views: 1900,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "p3",
    name: "Ayesha R.",
    handle: "@ayesha_r",
    group: "Random",
    time: "7h ago",
    body: "Assalam o Alaikum everyone 👋 new here, excited to be part of Jamaa!",
    likes: 41,
    comments: 12,
    views: 751,
    color: "bg-emerald-100 text-emerald-600",
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "new", label: "New" },
  { id: "following", label: "Following" },
];

export default function JamaaPage() {
  const [tab, setTab] = useState<Tab>("for-you");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeStreak, setLikeStreak] = useState(0);
  const [streakDismissed, setStreakDismissed] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");

  useEffect(() => {
    setBannerDismissed(localStorage.getItem("jamaa_banner_dismissed") === "1");
    const streak = parseInt(localStorage.getItem("jamaa_like_streak") || "0", 10);
    setLikeStreak(Math.min(streak, 5));
    setStreakDismissed(localStorage.getItem("jamaa_streak_dismissed") === "1");
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("jamaa_banner_dismissed", "1");
  };

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (likedIds.has(id) ? -1 : 1) } : p))
    );
    setLikedIds((prev) => {
      const next = new Set(prev);
      let nextStreak = likeStreak;
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        nextStreak = Math.min(likeStreak + 1, 5);
      }
      setLikeStreak(nextStreak);
      localStorage.setItem("jamaa_like_streak", String(nextStreak));
      return next;
    });
  };

  const submitPost = () => {
    if (!composeText.trim()) return;
    setPosts((prev) => [
      {
        id: `local-${Date.now()}`,
        name: "You",
        handle: "@you",
        group: "Random",
        time: "Just now",
        body: composeText.trim(),
        likes: 0,
        comments: 0,
        views: 1,
        color: "bg-emerald-600 text-white",
      },
      ...prev,
    ]);
    setComposeText("");
    setComposeOpen(false);
  };

  const orderedPosts =
    tab === "new" ? [...posts].reverse() : tab === "following" ? [] : posts;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="flex items-center gap-1.5 font-bold text-xl text-gray-900">
            <LogoGlyph className="w-5 h-5 text-emerald-600" />
            Jamaa
          </h1>
          <div className="flex items-center gap-1">
            <button aria-label="Search" className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50">
              <Search className="h-5 w-5" />
            </button>
            <button aria-label="Notifications" className="relative w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "min-h-[40px] px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                tab === t.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification opt-in banner */}
      {!bannerDismissed && (
        <div className="bg-gray-900 px-4 py-3.5 flex items-center gap-3 animate-fade-in">
          <p className="flex-1 text-white text-sm leading-snug">
            Never miss out! Get notified when people like or reply to you.
          </p>
          <button className="text-emerald-400 text-sm font-bold shrink-0 min-h-[44px] px-2">Enable</button>
          <button onClick={dismissBanner} aria-label="Dismiss" className="text-white/60 shrink-0 min-h-[44px] min-w-[24px] flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Gamified engagement tracker */}
      {!streakDismissed && likeStreak < 5 && (
        <div className="relative mx-4 mt-4 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-6 py-7 text-center overflow-hidden">
          <div className="absolute -top-8 -left-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
          <h2 className="text-white font-bold text-xl mb-1">Like {5 - likeStreak} more to get started</h2>
          <p className="text-white/70 text-sm mb-5">The more you like, the better your feed gets.</p>
          <div className="flex items-center justify-center gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors",
                    i < likeStreak ? "bg-white border-white" : "border-white/40"
                  )}
                >
                  <Heart className={cn("h-4 w-4", i < likeStreak ? "text-emerald-600 fill-emerald-600" : "text-white/50")} />
                </div>
                {i < 4 && <div className={cn("w-6 h-0.5", i < likeStreak ? "bg-white" : "bg-white/30")} />}
              </div>
            ))}
          </div>
        </div>
      )}
      {likeStreak >= 5 && !streakDismissed && (
        <div className="mx-4 mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center justify-between animate-fade-in">
          <p className="text-sm font-semibold text-emerald-800">🎉 Nice! Your feed is getting smarter.</p>
          <button onClick={() => setStreakDismissed(true)} aria-label="Dismiss" className="text-emerald-600 min-h-[44px] min-w-[24px] flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {tab === "following" || orderedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <LogoGlyph className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Nobody here yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Follow people from posts you like and their updates will show up here.
            </p>
          </div>
        ) : (
          orderedPosts.map((post, idx) => (
            <Fragment key={post.id}>
              {idx === 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{GROUPS[0].name}</p>
                    <p className="text-xs text-gray-500">{GROUPS[0].members} members</p>
                  </div>
                  <button className="min-h-[40px] px-4 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 transition-colors">
                    Join
                  </button>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0", post.color)}>
                      {post.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {post.name} <span className="text-gray-400 font-normal">· {post.handle}</span>
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">{post.group} · {post.time}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[15px] text-gray-800 leading-snug mb-3" dir="auto">{post.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLike(post.id)}
                      aria-pressed={likedIds.has(post.id)}
                      aria-label="Like"
                      className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-gray-500 hover:text-rose-500 transition-colors"
                    >
                      <Heart className={cn("h-[18px] w-[18px]", likedIds.has(post.id) && "fill-rose-500 text-rose-500")} />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </button>
                    <button aria-label="Comment" className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors">
                      <MessageSquare className="h-[18px] w-[18px]" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 bg-gray-50 rounded-full px-2.5 py-1.5 text-gray-400 text-xs">
                      <BarChart2 className="h-3.5 w-3.5" /> {post.views}
                    </span>
                    <button aria-label="Share" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </Fragment>
          ))
        )}
      </div>

      {/* Compose FAB */}
      <button
        onClick={() => setComposeOpen(true)}
        aria-label="New post"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 flex items-center justify-center text-white transition-colors z-30"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">New post</h3>
              <button onClick={() => setComposeOpen(false)} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="Share something with the Jamaa community…"
              dir="auto"
              rows={4}
              autoFocus
              className="w-full rounded-2xl border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <button
              onClick={submitPost}
              disabled={!composeText.trim()}
              className="w-full min-h-[48px] mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
