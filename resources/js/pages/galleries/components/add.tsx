import * as React from 'react';
import { Form } from '@inertiajs/react';
import GalleryController from '@/actions/App/Http/Controllers/GalleryController';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { Image as ImageIcon, Loader2, X, Youtube } from 'lucide-react';

type PhotoPreview = {
    file: File;
    preview: string;
    caption: string;
};

// Helper function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export default function AddGalleryDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [photos, setPhotos] = React.useState<PhotoPreview[]>([]);
    const [description, setDescription] = React.useState('');
    const [mediaType, setMediaType] = React.useState<'image_group' | 'youtube'>('image_group');
    const [youtubeUrl, setYoutubeUrl] = React.useState('');
    const [youtubeVideoId, setYoutubeVideoId] = React.useState<string | null>(null);

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const files = Array.from(e.target.files || []);
        const newPhotos: PhotoPreview[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            caption: '',
        }));
        setPhotos(prev => [...prev, ...newPhotos]);
    };

    const handleYoutubeUrlChange = (url: string) => {
        setYoutubeUrl(url);
        const videoId = extractYouTubeVideoId(url);
        setYoutubeVideoId(videoId);
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            const newPhotos = [...prev];
            URL.revokeObjectURL(newPhotos[index].preview);
            newPhotos.splice(index, 1);
            return newPhotos;
        });
    };

    const updateCaption = (index: number, caption: string) => {
        setPhotos(prev => {
            const newPhotos = [...prev];
            newPhotos[index].caption = caption;
            return newPhotos;
        });
    };

    const resetForm = () => {
        photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
        setDescription('');
        setMediaType('image_group');
        setYoutubeUrl('');
        setYoutubeVideoId(null);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm();
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? <Button>New Gallery</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form
                    {...GalleryController.store.form()}
                    encType="multipart/form-data"
                    onSuccess={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create Gallery</DialogTitle>
                                <DialogDescription>
                                    Create a gallery of images or highlight a YouTube video.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="My Photo Gallery"
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Describe your gallery..."
                                    name="description"
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Option */}
                            <div className="grid gap-2">
                                <Label htmlFor="option">Option</Label>
                                <select
                                    id="option"
                                    name="option"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select an option</option>
                                    <option value="Abhidh">Abhidh</option>
                                    <option value="Abhidh Creative">Abhidh Creative</option>
                                    <option value="Abhidh Academy">Abhidh Academy</option>
                                </select>
                                <InputError message={errors.option} />
                            </div>

                            {/* Media Type */}
                            <div className="grid gap-2">
                                <Label htmlFor="media_type">Content Type</Label>
                                <select
                                    id="media_type"
                                    name="media_type"
                                    value={mediaType}
                                    onChange={(event) => {
                                        const value = event.target.value as 'image_group' | 'youtube';
                                        setMediaType(value);
                                        if (value === 'youtube') {
                                            photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
                                            setPhotos([]);
                                        } else {
                                            setYoutubeUrl('');
                                            setYoutubeVideoId(null);
                                        }
                                    }}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="image_group">Group of Images</option>
                                    <option value="youtube">YouTube Video</option>
                                </select>
                                <InputError message={errors.media_type} />
                            </div>

                            {mediaType === 'youtube' ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="youtube_url">YouTube Video URL</Label>
                                    <div className="relative">
                                        <Input
                                            id="youtube_url"
                                            name="youtube_url"
                                            type="url"
                                            required
                                            value={youtubeUrl}
                                            onChange={(event) => handleYoutubeUrlChange(event.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                        <Youtube className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Paste the full YouTube link. We will embed the video in the gallery.
                                    </p>
                                    {youtubeVideoId && (
                                        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                            <Label className="text-sm font-medium text-foreground mb-2 block">Video Preview</Label>
                                            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                                                <img
                                                    src={getYouTubeThumbnail(youtubeVideoId)}
                                                    alt="YouTube video thumbnail"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback to hqdefault if maxresdefault fails
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="rounded-full bg-red-600/90 p-3 shadow-lg">
                                                        <Youtube className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <InputError message={errors.youtube_url} />
                                </div>
                            ) : (
                                <>
                                    {/* Photo Upload */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="photos">Photos</Label>
                                        <div className="flex items-center gap-3">
                                            <label
                                                htmlFor="photos"
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                                Choose photos
                                            </label>
                                            <input
                                                id="photos"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB each. Select multiple files.</p>
                                        <InputError message={errors.photos} />
                                    </div>

                                    {/* Photo Previews */}
                                    {photos.length > 0 && (
                                        <div className="space-y-3">
                                            <Label>Photo Previews</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {photos.map((photo, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={photo.preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded border"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                            onClick={() => removePhoto(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                        <Input
                                                            placeholder="Caption (optional)"
                                                            value={photo.caption}
                                                            onChange={(e) => updateCaption(index, e.target.value)}
                                                            className="mt-2 text-xs"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden inputs for form submission */}
                                    {photos.map((photo, index) => (
                                        <input
                                            key={`photo-${index}`}
                                            type="file"
                                            name="photos[]"
                                            style={{ display: 'none' }}
                                            ref={(el) => {
                                                if (el) {
                                                    const dataTransfer = new DataTransfer();
                                                    dataTransfer.items.add(photo.file);
                                                    el.files = dataTransfer.files;
                                                }
                                            }}
                                        />
                                    ))}
                                    {photos.map((photo, index) => (
                                        <input
                                            key={`caption-${index}`}
                                            type="hidden"
                                            name={`captions[${index}]`}
                                            value={photo.caption}
                                        />
                                    ))}
                                </>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing
                                        || (mediaType === 'image_group' && photos.length === 0)
                                        || (mediaType === 'youtube' && youtubeUrl.trim() === '')
                                    }
                                >
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Gallery
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
