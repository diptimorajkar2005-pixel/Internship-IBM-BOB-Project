import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { filterQueryString } from "@/lib/repository";
import type { DashboardFilters } from "@/lib/types";

export function AppShell({
  children,
  filters,
}: {
  children: ReactNode;
  filters: DashboardFilters;
}) {
  const query = filterQueryString(filters);
  return (
    <div className="app-shell">
      <Sidebar query={query} />
      <main className="app-main">{children}</main>
    </div>
  );
}

export function PageHero({
  kicker,
  title,
  subtitle,
  image,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <header className="page-hero" style={{ backgroundImage: `url(${image})` }}>
      <div>
        <p className="eyebrow light">{kicker}</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
