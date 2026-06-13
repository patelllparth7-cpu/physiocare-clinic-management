"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  Wallet,
  BarChart3,
  Settings,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Daily Treatment", href: "/treatment", icon: ClipboardList },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Payments", href: "/payments", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-700 p-5 text-white shadow-2xl">
      <div className="mb-8 rounded-3xl bg-white/10 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-lg">
            <HeartPulse size={30} />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-tight">PhysioCare</h1>
            <p className="text-xs font-medium text-blue-100">
              Clinic Management
            </p>
          </div>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-blue-200">
        Main Menu
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-blue-700 shadow-xl"
                  : "text-blue-50 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={20} />
                {item.name}
              </span>

              {active ? (
                <ChevronRight size={17} />
              ) : (
                <ChevronRight
                  size={17}
                  className="opacity-0 transition group-hover:opacity-100"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5 space-y-4">
       

       
      </div>
    </aside>
  );
}