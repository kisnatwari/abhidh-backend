import { Head } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';

type BlogResource = {
    id: number;
    title: string;
    slug: string;
    option: string | null;
    content: string | null;
    image_url: string | null;
    published_at: string | null;
};

interface BlogShowProps {
    post: BlogResource;
}

const BlogShow = ({ post }: BlogShowProps) => {
    return (
        <AcademyLayout>
            <Head title={post.title} />

            <article className="bg-background py-16">
                <div className="container mx-auto max-w-4xl space-y-12 px-4">
                    <header className="space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            {post.option ?? 'Insights'}
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{post.title}</h1>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground">
                            {post.published_at
                                ? new Date(post.published_at).toLocaleDateString(undefined, {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                  })
                                : 'Unpublished draft'}
                        </p>
                    </header>

                    {post.image_url ? (
                        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                        </div>
                    ) : null}

                    <div
                        className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
                        dangerouslySetInnerHTML={{ __html: post.content ?? '<p>No content available.</p>' }}
                    />
                </div>
            </article>
        </AcademyLayout>
    );
};

export default BlogShow;

