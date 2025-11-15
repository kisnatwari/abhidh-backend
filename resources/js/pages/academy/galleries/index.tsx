import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AcademyLayout from '@/layouts/academy-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hexToRgba } from '@/lib/colors';
import { cn, stripHtml } from '@/lib/utils';
import { Camera, ImageIcon, PlayCircle } from 'lucide-react';

type GalleryPhoto = {
    id: number;
    photo_path: string | null;
    photo_url: string | null;
    caption?: string | null;
};

type GalleryResource = {
    id: number;
    title: string;
    description: string | null;
    option: string | null;
    media_type?: 'image_group' | 'youtube';
    youtube_url?: string | null;
    photos: GalleryPhoto[];
    created_at: string | null;
};

interface GalleriesProps {
    galleries: GalleryResource[];
}

const optionLabels: Record<string, string> = {
    campus: 'Campus',
    classroom: 'Classroom',
    events: 'Events',
    success: 'Success Stories',
    workshop: 'Workshops',
    virtual: 'Virtual Sessions',
};

const formatOption = (option: string | null | undefined) => {
    if (!option) {
        return 'Highlights';
    }

    return optionLabels[option] ?? option.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const Galleries = ({ galleries }: GalleriesProps) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = useMemo(() => {
        const unique = new Map<string, string>();
        unique.set('all', 'All Galleries');

        galleries.forEach((gallery) => {
            const optionKey = gallery.option ?? 'highlights';
            if (!unique.has(optionKey)) {
                unique.set(optionKey, formatOption(gallery.option));
            }
        });

        return Array.from(unique.entries()).map(([id, label]) => ({ id, label }));
    }, [galleries]);

    const filteredGalleries =
        activeCategory === 'all'
            ? galleries
            : galleries.filter((gallery) => (gallery.option ?? 'highlights') === activeCategory);

    return (
        <AcademyLayout>
            <Head title="Galleries" />

            <section className="relative overflow-hidden border-b py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Campus &amp; Community Stories
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Gallery</h1>
                        <p className="text-lg text-muted-foreground/90 md:text-xl">
                            Relive the highlights from our classrooms, campus life, corporate engagements, and community events. Each album captures
                            the creativity, collaboration, and celebrations that define Abhidh Academy.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative py-20">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/15 to-background" />

                <div className="container relative mx-auto px-4 space-y-10">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    'rounded-full border px-5 py-2 text-sm font-medium transition',
                                    activeCategory === category.id
                                        ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'border-white/15 bg-white/5 text-foreground hover:border-primary/40 hover:text-primary',
                                )}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {filteredGalleries.map((gallery) => {
                            const isVideo = gallery.media_type === 'youtube' && Boolean(gallery.youtube_url);
                            const coverPhoto = !isVideo ? gallery.photos?.[0] : undefined;
                            const videoThumbnail = isVideo && gallery.youtube_url ? getYoutubeThumbnail(gallery.youtube_url) : null;
                            const accent = '#1d4ed8';
                            return (
                                <Card
                                    key={gallery.id}
                                    className={cn(
                                        'group relative overflow-hidden border bg-card/60 p-5 backdrop-blur-xl',
                                        'transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_85px_-45px_rgba(18,40,90,0.75)]',
                                    )}
                                    style={{
                                        borderColor: hexToRgba(accent, 0.25),
                                        boxShadow: `0 25px 70px -50px ${hexToRgba(accent, 0.45)}`,
                                    }}
                                >
                                    <Link
                                        href={`/academy/galleries/${gallery.id}`}
                                        className="relative block overflow-hidden rounded-2xl"
                                        aria-label={`View gallery ${gallery.title}`}
                                    >
                                        {isVideo ? (
                                            videoThumbnail ? (
                                                <>
                                                    <img
                                                        src={videoThumbnail}
                                                        alt={gallery.title}
                                                        className="h-56 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-muted-foreground">
                                                    <PlayCircle className="h-10 w-10" />
                                                </div>
                                            )
                                        ) : coverPhoto?.photo_url ? (
                                            <>
                                                <img
                                                    src={coverPhoto.photo_url}
                                                    alt={coverPhoto.caption ?? gallery.title}
                                                    className="h-56 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                                            </>
                                        ) : (
                                            <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-muted-foreground">
                                                <Camera className="h-10 w-10" />
                                            </div>
                                        )}

                                        <div className="absolute left-4 top-4 flex items-center gap-2">
                                            <Badge className="border border-white/15 bg-white/15 text-xs font-semibold text-white backdrop-blur">
                                                {formatOption(gallery.option)}
                                            </Badge>
                                            <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                                                {isVideo
                                                    ? 'YouTube Video'
                                                    : `${gallery.photos?.length ?? 0} photo${(gallery.photos?.length ?? 0) === 1 ? '' : 's'}`}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <h3 className="text-lg font-semibold leading-tight">{gallery.title}</h3>
                                        </div>
                                    </Link>

                                    <CardContent className="mt-5 space-y-4 text-sm text-muted-foreground/90">
                                        <p className="leading-relaxed line-clamp-3">
                                            {stripHtml(gallery.description) ||
                                                'A curated collection capturing the spirit and energy of Abhidh Academy events and milestones.'}
                                        </p>

                                        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground/80">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-2 w-2 rounded-full bg-primary/80" />
                                                <span>
                                                    Captured{' '}
                                                    <strong className="text-foreground">
                                                        {gallery.created_at
                                                            ? new Date(gallery.created_at).toLocaleDateString(undefined, {
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              })
                                                            : 'recently'}
                                                    </strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {isVideo ? (
                                                    <>
                                                        <PlayCircle className="h-3.5 w-3.5 text-primary" />
                                                        <span>Stream video</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                                        <span>High-resolution</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {!isVideo && gallery.photos?.slice(1, 4).length ? (
                                            <div className="flex items-center gap-3">
                                                {gallery.photos.slice(1, 4).map((photo) =>
                                                    photo.photo_url ? (
                                                        <img
                                                            key={photo.id}
                                                            src={photo.photo_url}
                                                            alt={photo.caption ?? gallery.title}
                                                            className="h-14 w-14 rounded-xl object-cover opacity-90 transition-all group-hover:opacity-100"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div key={photo.id} className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10" />
                                                    ),
                                                )}
                                                {gallery.photos.length > 4 ? (
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[11px] font-semibold text-muted-foreground/80 backdrop-blur">
                                                        +{gallery.photos.length - 4}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                className="rounded-full border-white/15 bg-white/5 text-xs font-semibold text-foreground transition hover:bg-white/15 hover:text-foreground"
                                                asChild
                                            >
                                                <Link href={`/academy/galleries/${gallery.id}`}>
                                                    {isVideo ? 'Watch video' : 'View gallery'}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80"
                                                asChild
                                            >
                                                <Link href={`/academy/galleries/${gallery.id}`}>Read story</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {!filteredGalleries.length ? (
                        <div className="mt-16 text-center text-muted-foreground">
                            No galleries in this category yet. Please check back soon.
                        </div>
                    ) : null}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default Galleries;

const getYoutubeThumbnail = (url?: string | null): string | null => {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        if (parsed.hostname === 'youtu.be') {
            return `https://img.youtube.com/vi/${parsed.pathname.replace('/', '') || ''}/hqdefault.jpg`;
        }

        if (parsed.searchParams.has('v')) {
            const id = parsed.searchParams.get('v');
            return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
        }

        if (parsed.pathname.startsWith('/embed/')) {
            const id = parsed.pathname.split('/')[2];
            return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
        }
    } catch (error) {
        return null;
    }

    return null;
};

