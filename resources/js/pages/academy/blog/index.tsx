import { Head, Link, usePage } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { Card, CardContent } from '@/components/ui/card';
import { stripHtml } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

type BlogResource = {
    id: number;
    title: string;
    slug: string;
    option: string | null;
    content: string | null;
    image_url: string | null;
    published_at: string | null;
};

type PaginationLinkDto = {
    url: string | null;
    label: string;
    active: boolean;
};

interface BlogIndexProps {
    posts: {
        data: BlogResource[];
        links: PaginationLinkDto[];
    };
}

const BlogIndex = ({ posts }: BlogIndexProps) => {
    const { url } = usePage();

    const sanitizedLinks = posts.links.filter((link) => !link.label.includes('&laquo;') && !link.label.includes('&raquo;'));

    return (
        <AcademyLayout>
            <Head title="Blog" />

            <section className="relative overflow-hidden border-b py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Abhidh Academy Insights
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog &amp; Resources</h1>
                        <p className="text-lg text-muted-foreground/90 md:text-xl">
                            Fresh perspectives, best practices, and stories from our mentors and alumni.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    {posts.data.length ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post) => (
                                <Card
                                    key={post.id}
                                    className="group flex h-full flex-col overflow-hidden border border-white/10 bg-card/60 backdrop-blur transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-background text-lg font-semibold text-primary">
                                                Abhidh Academy
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent opacity-80" />
                                        <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
                                            {post.option ?? 'Insights'}
                                        </div>
                                    </div>
                                    <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {post.published_at
                                                ? new Date(post.published_at).toLocaleDateString(undefined, {
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : 'Unpublished'}
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground transition group-hover:text-accent">{post.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">{stripHtml(post.content)}</p>
                                        <div className="mt-auto">
                                            <Link
                                                href={`/academy/blog/${post.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:gap-3"
                                            >
                                                Read article →
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-white/10 bg-card/70 p-12 text-center shadow-lg">
                            <h2 className="text-2xl font-semibold text-foreground">No blog posts yet</h2>
                            <p className="mt-2 text-sm text-muted-foreground">We&apos;re crafting new stories. Check back soon.</p>
                        </div>
                    )}

                    {sanitizedLinks.length > 1 ? (
                        <Pagination className="mt-12">
                            <PaginationContent>
                                {sanitizedLinks.map((link) => (
                                    <PaginationItem key={`${link.label}-${link.url ?? url}`}>
                                        {link.url ? (
                                            <PaginationLink href={link.url} isActive={link.active}>
                                                {link.label}
                                            </PaginationLink>
                                        ) : (
                                            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground">{link.label}</span>
                                        )}
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    ) : null}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default BlogIndex;

