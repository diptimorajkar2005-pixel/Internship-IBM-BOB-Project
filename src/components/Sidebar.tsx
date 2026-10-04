"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { APP_SUBTITLE, APP_TITLE } from "@/lib/constants";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Student Performance", icon: Users },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/semesters", label: "Semesters", icon: CalendarRange },
  { href: "/study", label: "Study Analysis", icon: BookOpen },
  { href: "/attention", label: "Academic Attention", icon: AlertTriangle },
  { href: "/insights", label: "Data Insights", icon: Lightbulb },
  { href: "/data-quality", label: "Data Quality", icon: ShieldCheck },
];

export function Sidebar({ query }: { query: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
        Menu
      </button>
      {open ? <button type="button" className="nav-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" /> : null}
      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="brand-block">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="brand-kicker">Academic Analytics</p>
            <h1>{APP_TITLE}</h1>
            <p className="brand-sub">{APP_SUBTITLE}</p>
          </div>
          <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <nav>
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={`${link.href}${query}`}
                className={active ? "nav-link active" : "nav-link"}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footnote">
          <BarChart3 size={16} />
          <p>CSV → Cleaning → Analytics → Insights</p>
        </div>
      </aside>
    </>
  );
}
