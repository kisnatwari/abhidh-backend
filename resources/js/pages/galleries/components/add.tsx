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
import { Image as ImageIcon, Loader2, X } from 'lucide-react';

type PhotoPreview = {
    file: File;
    preview: string;
    caption: string;
};

export default function AddGalleryDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [photos, setPhotos] = React.useState<PhotoPreview[]>([]);
    const [description, setDescription] = React.useState('');

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const files = Array.from(e.target.files || []);
        const newPhotos: PhotoPreview[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            caption: '',
        }));
        setPhotos(prev => [...prev, ...newPhotos]);
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
                                    Add a new photo gallery with multiple images.
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

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing || photos.length === 0}>
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
