"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, Flag, Menu, X } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/profiles", icon: Users, label: "Profiles" },
  { href: "/admin/directory", icon: BookOpen, label: "Directory" },
  { href: "/admin/reports", icon: Flag, label: "Reports" },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <LogoGlyph className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Rishta</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors mb-1"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <LogoGlyph className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
