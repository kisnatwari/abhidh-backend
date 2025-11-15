import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AcademyLayout from '@/layouts/academy-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, PlayCircle, Calendar, Images, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type GalleryPhoto = {
    id: number;
    photo_path: string;
    photo_url: string;
    caption: string | null;
};

type GalleryResource = {
    id: number;
    title: string;
    description: string | null;
    option: string | null;
    media_type: 'image_group' | 'youtube';
    youtube_url: string | null;
    created_at: string | null;
    photos: GalleryPhoto[];
};

type RelatedGallery = Pick<GalleryResource, 'id' | 'title' | 'media_type' | 'youtube_url' | 'photos'>;

interface GalleryShowProps {
    gallery: GalleryResource;
    relatedGalleries: RelatedGallery[];
}

const GalleryShow = ({ gallery, relatedGalleries }: GalleryShowProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const isVideo = gallery.media_type === 'youtube' && Boolean(gallery.youtube_url);
    const formattedDate = useMemo(() => formatDate(gallery.created_at), [gallery.created_at]);

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const goNext = () => {
        setActiveIndex((prev) => {
            const total = gallery.photos.length;
            return total === 0 ? prev : (prev + 1) % total;
        });
    };

    const goPrev = () => {
        setActiveIndex((prev) => {
            const total = gallery.photos.length;
            if (total === 0) return prev;
            return (prev - 1 + total) % total;
        });
    };

    const currentPhoto = gallery.photos[activeIndex] ?? null;

    return (
        <AcademyLayout>
            <Head title={`${gallery.title} | Gallery`} />

            <div className="relative overflow-hidden border-b py-16">
                <div className="absolute inset-0 bg-linear-to-br from-background via-secondary/10 to-background" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="container relative z-10 mx-auto px-4">
                    <Link
                        href="/academy/galleries"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                        <ChevronLeft className="h-4 w-4" />
        Back to galleries
                    </Link>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Badge variant="secondary">{formatOption(gallery.option)}</Badge>
                        <Badge variant="outline">
                            {isVideo ? 'YouTube Video' : 'Image Collection'}
                        </Badge>
                        {formattedDate ? (
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Captured {formattedDate}
                            </span>
                        ) : null}
                        {!isVideo ? (
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <Images className="h-4 w-4" />
                                {gallery.photos.length} photo{gallery.photos.length === 1 ? '' : 's'}
                            </span>
                        ) : null}
                    </div>

                    <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                        {gallery.title}
                    </h1>

                    {gallery.description ? (
                        <div
                            className="prose prose-lg mt-6 max-w-3xl text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: gallery.description }}
                        />
                    ) : null}
                </div>
            </div>

            <section className="relative py-16">
                <div className="container mx-auto px-4">
                    {isVideo ? (
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-3xl border shadow-xl">
                                <ResponsiveEmbed url={gallery.youtube_url ?? ''} title={gallery.title} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button asChild>
                                    <Link href={gallery.youtube_url ?? '#'} target="_blank" rel="noopener noreferrer">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Watch on YouTube
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : gallery.photos.length > 0 ? (
                        <div className="space-y-8">
                            <div className="overflow-hidden rounded-3xl border shadow-lg">
                                <button
                                    type="button"
                                    className="relative block w-full focus:outline-none"
                                    onClick={() => openLightbox(activeIndex)}
                                >
                                    <img
                                        src={gallery.photos[activeIndex]?.photo_url ?? gallery.photos[0].photo_url}
                                        alt={gallery.photos[activeIndex]?.caption ?? gallery.title}
                                        className="w-full max-h-[520px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-30" />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button onClick={() => openLightbox(activeIndex)}>Open lightbox</Button>
                                <span className="text-sm text-muted-foreground">
                                    Click any thumbnail below to view it larger.
                                </span>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {gallery.photos.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        className={cn(
                                            'group relative overflow-hidden rounded-2xl border text-left transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary',
                                            activeIndex === index ? 'ring-2 ring-primary' : ''
                                        )}
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img
                                            src={photo.photo_url}
                                            alt={photo.caption ?? `Gallery image ${index + 1}`}
                                            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        {photo.caption ? (
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 text-xs text-white">
                                                {photo.caption}
                                            </div>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border bg-muted/30 p-12 text-center text-muted-foreground">
                            No images have been added to this gallery yet.
                        </div>
                    )}

                    {relatedGalleries.length > 0 ? (
                        <div className="mt-16 space-y-8">
                            <div>
                                <h2 className="text-2xl font-semibold text-foreground">More stories</h2>
                                <p className="text-sm text-muted-foreground">
                                    Explore other highlights captured across Abhidh Academy.
                                </p>
                            </div>
                            <Separator />
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {relatedGalleries.map((item) => (
                                    <RelatedGalleryCard key={item.id} gallery={item} />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            <LightboxDialog
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
                onNext={goNext}
                onPrev={goPrev}
                photo={currentPhoto}
                hasMultiple={gallery.photos.length > 1}
            />
        </AcademyLayout>
    );
};

type LightboxDialogProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onNext: () => void;
    onPrev: () => void;
    photo: GalleryPhoto | null;
    hasMultiple: boolean;
};

const LightboxDialog = ({ open, onOpenChange, onNext, onPrev, photo, hasMultiple }: LightboxDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 text-white">
            <div className="relative flex flex-col items-center gap-4 p-6">
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                </button>

                {photo ? (
                    <div className="relative flex w-full flex-col items-center gap-4">
                        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
                            <img
                                src={photo.photo_url}
                                alt={photo.caption ?? 'Gallery image'}
                                className="mx-auto max-h-[520px] w-full object-contain"
                            />

                            {hasMultiple ? (
                                <>
                                    <button
                                        type="button"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                                        onClick={onPrev}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                                        onClick={onNext}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </>
                            ) : null}
                        </div>

                        {photo.caption ? (
                            <p className="max-w-2xl text-center text-sm text-white/80">{photo.caption}</p>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex h-64 w-full items-center justify-center text-sm text-white/60">
                        No image selected.
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

type RelatedCardProps = {
    gallery: RelatedGallery;
};

const RelatedGalleryCard = ({ gallery }: RelatedCardProps) => {
    const isVideo = gallery.media_type === 'youtube' && Boolean(gallery.youtube_url);
    const thumbnail = isVideo
        ? getYoutubeThumbnail(gallery.youtube_url)
        : gallery.photos?.[0]?.photo_url ?? null;

    return (
        <Link
            href={`/academy/galleries/${gallery.id}`}
            className="group flex items-center gap-4 rounded-2xl border bg-card/70 p-4 transition hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="relative h-20 w-28 overflow-hidden rounded-xl border">
                {thumbnail ? (
                    <img src={thumbnail} alt={gallery.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <Images className="h-6 w-6" />
                    </div>
                )}
                {isVideo ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                ) : null}
            </div>

            <div className="flex-1 space-y-2">
                <h3 className="text-base font-semibold text-foreground">{gallery.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="uppercase tracking-wide">
                        {isVideo ? 'Video' : 'Photos'}
                    </Badge>
                    <span>View story</span>
                </div>
            </div>
        </Link>
    );
};

const formatOption = (option: string | null): string => {
    if (!option) return 'Highlights';
    return option.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (timestamp: string | null): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
    });
};

const ResponsiveEmbed = ({ url, title }: { url: string; title: string }) => {
    const embedUrl = toYoutubeEmbed(url);

    return (
        <div className="aspect-video w-full">
            <iframe
                src={embedUrl}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    );
};

const toYoutubeEmbed = (url: string): string => {
    const videoId = extractYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const extractYoutubeId = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname === 'youtu.be') {
            return parsed.pathname.replace('/', '') || null;
        }

        if (parsed.searchParams.has('v')) {
            return parsed.searchParams.get('v');
        }

        if (parsed.pathname.startsWith('/embed/')) {
            return parsed.pathname.split('/')[2] ?? null;
        }
    } catch (error) {
        return null;
    }

    return null;
};

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

export default GalleryShow;

