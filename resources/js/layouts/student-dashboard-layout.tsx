import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap, Home, LayoutDashboard, LogOut, Notebook, UserCheck } from 'lucide-react';

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
    { label: 'Overview', href: '/academy/dashboard', icon: LayoutDashboard },
    { label: 'My Enrollments', href: '/academy/my-enrollments', icon: Notebook },
    { label: 'Profile', href: '/academy/profile', icon: UserCheck },
];

export default function StudentDashboardLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const activeHref = url ?? '';

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
                <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-6 py-10 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-8 lg:overflow-y-auto">
                    <Link href="/" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold tracking-wide text-slate-900">Abhidh Academy</span>
                            <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Learner Hub</span>
                        </div>
                    </Link>

                    <nav className="space-y-1 text-sm font-medium text-slate-600">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeHref === item.href || activeHref.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center justify-between rounded-xl px-4 py-2 transition',
                                        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100',
                                    )}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </span>
                                    {isActive ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                            Need help? Contact your mentor or the academy team for personalised guidance.
                        </div>
                        <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quick actions</p>
                            <Link
                                href="/academy"
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/30 hover:text-primary"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Home className="h-4 w-4 text-primary" />
                                    Visit academy home
                                </span>
                                <span className="text-xs text-slate-400">↗</span>
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center justify-between rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </span>
                                <span className="text-xs text-primary-foreground/80">↘</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 px-6 py-10 lg:h-screen lg:overflow-y-auto lg:px-12 lg:py-12">
                    <div className="flex w-full flex-col gap-6">{children}</div>
                </main>
            </div>
        </div>
    );
}

