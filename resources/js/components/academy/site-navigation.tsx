import { Link, usePage, router } from '@inertiajs/react';
import { ChevronDown, LogIn, LogOut, Menu, User2, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';

type Program = {
    id: number;
    name: string;
};

const links = [
    { name: 'Home', href: '/', match: (url: string) => url === '/' },
    { name: 'Programs', href: '/academy/programs', match: (url: string) => url.startsWith('/academy/programs') },
    { name: 'Self-Paced', href: '/academy/self-paced-courses', match: (url: string) => url.startsWith('/academy/self-paced-courses') },
    { name: 'Galleries', href: '/academy/galleries', match: (url: string) => url.startsWith('/academy/galleries') },
    { name: 'Blog', href: '/academy/blog', match: (url: string) => url.startsWith('/academy/blog') },
    { name: 'Contact', href: '/academy/contact', match: (url: string) => url.startsWith('/academy/contact') },
];

const SiteNavigation = () => {
    const { url, props } = usePage();
    const [open, setOpen] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programsLoading, setProgramsLoading] = useState(true);
    const { auth } = props as { auth?: { user?: { name?: string; is_admin?: boolean } } };

    const isActive = (match: (url: string) => boolean) => match(url);
    const isCoursesActive = url.startsWith('/academy/courses');
    const roleLabel = auth?.user?.is_admin ? 'Admin' : 'Student';

    useEffect(() => {
        // Fetch programs from API
        fetch('/api/programs?per_page=100')
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data) {
                    setPrograms(data.data);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch programs:', error);
            })
            .finally(() => {
                setProgramsLoading(false);
            });
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-40">
            <div className="border-b border-primary/10 bg-white/85 shadow-[0_12px_40px_-28px_rgba(18,40,90,0.35)] backdrop-blur-xl">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center">
                        <img 
                            src="/logo.png" 
                            alt="Abhidh Academy Logo" 
                            className="h-14 w-auto object-contain"
                        />
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex md:ml-auto">
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

                        {/* Courses Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        'inline-flex items-center gap-1 text-base font-medium transition-colors duration-200',
                                        isCoursesActive ? 'text-primary' : 'text-foreground/85 hover:text-primary',
                                    )}
                                >
                                    Courses
                                    <ChevronDown className="h-4 w-4 opacity-75" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 rounded-2xl border border-primary/10 bg-white/95 p-2 shadow-[0_18px_60px_-32px_rgba(18,40,90,0.35)] backdrop-blur">
                                <DropdownMenuItem asChild>
                                    <Link href="/academy/courses" className="inline-flex w-full items-center gap-2 text-sm font-medium">
                                        All Courses
                                    </Link>
                                </DropdownMenuItem>
                                {programs.length > 0 && <DropdownMenuSeparator className="bg-primary/10" />}
                                {programsLoading ? (
                                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                                        Loading programs...
                                    </DropdownMenuItem>
                                ) : programs.length > 0 ? (
                                    programs.map((program) => (
                                        <DropdownMenuItem key={program.id} asChild>
                                            <Link 
                                                href={`/academy/courses?program_id=${program.id}`}
                                                className="inline-flex w-full items-center gap-2 text-sm font-medium"
                                            >
                                                {program.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                                        No programs available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

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
                            <>
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
                            </>
                        )}
                    </nav>

                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-foreground transition hover:border-accent/40 hover:text-accent md:hidden"
                                aria-label="Toggle navigation"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </DrawerTrigger>
                        <DrawerContent className="max-h-[85vh] overflow-y-auto">
                            <DrawerHeader className="text-left">
                                <div className="flex items-center justify-between">
                                    <Link href="/" className="flex items-center space-x-3" onClick={() => setOpen(false)}>
                                        <img 
                                            src="/logo.png" 
                                            alt="Abhidh Academy Logo" 
                                            className="h-10 w-auto object-contain"
                                        />
                                    </Link>
                                    <DrawerClose asChild>
                                        <button
                                            type="button"
                                            className="rounded-full p-2 text-foreground hover:bg-muted transition-colors"
                                            aria-label="Close menu"
                                        >
                                            <ChevronDown className="h-5 w-5 rotate-180" />
                                        </button>
                                    </DrawerClose>
                                </div>
                            </DrawerHeader>
                            <div className="px-4 pb-4 space-y-2">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                                            isActive(link.match) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50',
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {/* Courses Dropdown for Mobile */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors',
                                                isCoursesActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50',
                                            )}
                                        >
                                            <span>Courses</span>
                                            <ChevronDown className="h-4 w-4 opacity-75" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56 rounded-2xl border border-primary/10 bg-white/95 p-2 shadow-[0_18px_60px_-32px_rgba(18,40,90,0.35)] backdrop-blur">
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                href="/academy/courses" 
                                                onClick={() => setOpen(false)}
                                                className="inline-flex w-full items-center gap-2 text-sm font-medium"
                                            >
                                                All Courses
                                            </Link>
                                        </DropdownMenuItem>
                                        {programs.length > 0 && <DropdownMenuSeparator className="bg-primary/10" />}
                                        {programsLoading ? (
                                            <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                                                Loading programs...
                                            </DropdownMenuItem>
                                        ) : programs.length > 0 ? (
                                            programs.map((program) => (
                                                <DropdownMenuItem key={program.id} asChild>
                                                    <Link 
                                                        href={`/academy/courses?program_id=${program.id}`}
                                                        onClick={() => setOpen(false)}
                                                        className="inline-flex w-full items-center gap-2 text-sm font-medium"
                                                    >
                                                        {program.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))
                                        ) : (
                                            <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                                                No programs available
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="pt-4 space-y-2 border-t border-border mt-4">
                                    {auth?.user ? (
                                        <>
                                            <Link
                                                href={auth.user.is_admin ? '/dashboard' : '/academy/dashboard'}
                                                onClick={() => setOpen(false)}
                                                className="block w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm"
                                            >
                                                {roleLabel} Dashboard
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full rounded-lg border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(false);
                                                router.visit('/login');
                                            }}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-primary/25 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                                        >
                                            <LogIn className="h-4 w-4" />
                                            Login
                                        </button>
                                    )}
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
        </header>
    );
};

export default SiteNavigation;

