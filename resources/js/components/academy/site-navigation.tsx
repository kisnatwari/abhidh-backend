import { Link, usePage, router } from '@inertiajs/react';
import { ChevronDown, LogIn, LogOut, Menu, PlusCircle, User2, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const links = [
    { name: 'Home', href: '/', match: (url: string) => url === '/' },
    { name: 'Programs', href: '/academy/programs', match: (url: string) => url.startsWith('/academy/programs') },
    { name: 'Courses', href: '/academy/courses', match: (url: string) => url.startsWith('/academy/courses') },
    { name: 'Self-Paced', href: '/academy/self-paced-courses', match: (url: string) => url.startsWith('/academy/self-paced-courses') },
    { name: 'Galleries', href: '/academy/galleries', match: (url: string) => url.startsWith('/academy/galleries') },
    { name: 'Blog', href: '/academy/blog', match: (url: string) => url.startsWith('/academy/blog') },
    { name: 'Contact', href: '/academy/contact', match: (url: string) => url.startsWith('/academy/contact') },
];

const SiteNavigation = () => {
    const { url, props } = usePage();
    const [open, setOpen] = useState(false);
    const { auth } = props as { auth?: { user?: { name?: string; is_admin?: boolean } } };

    const isActive = (match: (url: string) => boolean) => match(url);
    const roleLabel = auth?.user?.is_admin ? 'Admin' : 'Student';

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-40">
            <div className="border-b border-primary/10 bg-white/85 shadow-[0_12px_40px_-28px_rgba(18,40,90,0.35)] backdrop-blur-xl">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            ABHIDH <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">ACADEMY</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-base font-medium transition-colors duration-200',
                                    isActive(link.match) ? 'text-primary' : 'text-foreground/85 hover:text-primary',
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-[0_16px_40px_-28px_rgba(18,40,90,0.75)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                    >
                                        <User2 className="h-4 w-4" />
                                        {roleLabel} Menu
                                        <ChevronDown className="h-4 w-4 opacity-75" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-primary/10 bg-white/95 p-2 shadow-[0_18px_60px_-32px_rgba(18,40,90,0.35)] backdrop-blur">
                                    <DropdownMenuItem asChild>
                                        <Link href={auth.user.is_admin ? '/dashboard' : '/academy/dashboard'} className="inline-flex w-full items-center gap-2 text-sm font-medium">
                                            <User2 className="h-4 w-4 text-primary" />
                                            {roleLabel} Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-primary/10" />
                                    <DropdownMenuItem
                                        className="text-sm font-medium text-destructive focus:text-destructive"
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Login
                                        <ChevronDown className="h-4 w-4 opacity-75" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-primary/10 bg-white/95 p-2 shadow-[0_18px_60px_-32px_rgba(18,40,90,0.35)] backdrop-blur">
                                    <DropdownMenuItem asChild>
                                        <Link href="/login" className="inline-flex w-full items-center gap-2 text-sm font-medium">
                                            <LogIn className="h-4 w-4 text-primary" />
                                            Login
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-primary/10" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/register" className="inline-flex w-full items-center gap-2 text-sm font-medium">
                                            <PlusCircle className="h-4 w-4 text-primary" />
                                            Create an account
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </nav>

                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-foreground transition hover:border-accent/40 hover:text-accent md:hidden"
                        onClick={() => setOpen((state) => !state)}
                        aria-label="Toggle navigation"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {open ? (
                    <div className="container mx-auto flex flex-col gap-3 px-4 pb-4 md:hidden">
                        <div className="rounded-2xl border border-primary/10 bg-white/90 px-6 py-6 shadow-[0_12px_40px_-24px_rgba(18,40,90,0.35)] backdrop-blur-xl">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'block rounded-full px-4 py-2 text-base font-medium transition-colors',
                                        isActive(link.match) ? 'bg-primary/10 text-primary' : 'text-foreground/85 hover:bg-white/10 hover:text-primary',
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="mt-4 flex flex-col gap-2">
                                {auth?.user ? (
                                    <>
                                        <Link
                                            href={auth.user.is_admin ? '/dashboard' : '/academy/dashboard'}
                                            onClick={() => setOpen(false)}
                                            className="rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground shadow-[0_12px_40px_-24px_rgba(18,40,90,0.45)]"
                                        >
                                            {roleLabel} Dashboard
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(false);
                                                handleLogout();
                                            }}
                                            className="rounded-full border border-primary/20 px-4 py-2 text-center text-sm font-semibold text-primary transition hover:border-primary hover:text-primary/80"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-[0_12px_40px_-24px_rgba(18,40,90,0.35)]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    router.visit('/login');
                                                }}
                                                className="flex w-full items-center justify-between rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_35px_-22px_rgba(18,40,90,0.45)] transition hover:bg-primary/90"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <LogIn className="h-4 w-4" />
                                                    Login
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-75" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    router.visit('/register');
                                                }}
                                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:text-primary/80"
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                Create an account
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default SiteNavigation;

