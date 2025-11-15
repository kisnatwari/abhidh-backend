import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const links = [
    { label: 'Programs', href: '/academy/programs' },
    { label: 'Self-Paced Courses', href: '/academy/self-paced-courses' },
    { label: 'Galleries', href: '/academy/galleries' },
    { label: 'Blog', href: '/academy/blog' },
    { label: 'Contact', href: '/academy/contact' },
];

const socials = [
    { icon: Facebook, href: 'https://www.facebook.com/', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://www.youtube.com/', label: 'YouTube' },
];

const SiteFooter = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="mt-20 border-t border-white/10 bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-10 md:grid-cols-3">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-foreground">
                            ABHIDH <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">ACADEMY</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Empowering professionals with guided and self-paced learning paths crafted by industry experts.
                        </p>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-accent/50 hover:text-accent"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Explore</h4>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="transition hover:text-accent">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Visit</h4>
                        <p className="mt-4 text-sm text-foreground/80">
                            Nardevi, Kathmandu, Nepal
                            <br />
                            info@abhidhgroup.com
                            <br />
                            +977-9841080407
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-muted-foreground md:flex-row">
                    <p>© {year} Abhidh Academy. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="transition hover:text-accent">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="transition hover:text-accent">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;

