import * as React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EditGalleryDialog from './edit';
import DeleteGalleryDialog from './delete';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export default function ViewGalleryDialog({ gallery, trigger }: { gallery: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline">View</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{gallery.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{gallery.media_type === 'youtube' ? 'YouTube Video' : 'Image Collection'}</Badge>
                        {gallery.option ? (
                            <Badge variant="secondary">{gallery.option}</Badge>
                        ) : null}
                        <span>
                            Created {new Date(gallery.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    {gallery.description && (
                        <div 
                            className="text-muted-foreground prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: gallery.description }}
                        />
                    )}

                    {gallery.media_type === 'youtube' && gallery.youtube_url ? (
                        <div className="space-y-3">
                            <div className="aspect-video w-full overflow-hidden rounded-xl border">
                                <iframe
                                    src={toYoutubeEmbed(gallery.youtube_url)}
                                    title={gallery.title}
                                    className="h-full w-full"
                                    allowFullScreen
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => window.open(gallery.youtube_url, '_blank')}
                            >
                                Watch on YouTube
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.photos && gallery.photos.length > 0 ? (
                                gallery.photos.map((photo: any, index: number) => (
                                    <div key={photo.id || index} className="space-y-2">
                                        <img
                                            src={photo.photo_url}
                                            alt={photo.caption || `Photo ${index + 1}`}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        {photo.caption && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                {photo.caption}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    No photos in this gallery
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <EditGalleryDialog gallery={gallery} trigger={<Button variant="outline">Edit</Button>} />
                    <DeleteGalleryDialog gallery={gallery} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function toYoutubeEmbed(url: string): string {
    const videoId = extractYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function extractYoutubeId(url: string): string | null {
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
}
