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

type ExistingPhoto = {
    id: number;
    photo_url: string;
    caption: string | null;
    sort_order: number;
};

export default function EditGalleryDialog({ gallery, trigger }: { gallery: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [newPhotos, setNewPhotos] = React.useState<PhotoPreview[]>([]);
    const [existingPhotos, setExistingPhotos] = React.useState<ExistingPhoto[]>(gallery.photos || []);
    const [deletedPhotos, setDeletedPhotos] = React.useState<number[]>([]);
    const [description, setDescription] = React.useState(gallery.description || '');
    const [hasExistingPhotoChanges, setHasExistingPhotoChanges] = React.useState(false);

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const files = Array.from(e.target.files || []);
        const newPhotoPreviews: PhotoPreview[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            caption: '',
        }));
        setNewPhotos(prev => [...prev, ...newPhotoPreviews]);
    };

    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => {
            const newPhotos = [...prev];
            URL.revokeObjectURL(newPhotos[index].preview);
            newPhotos.splice(index, 1);
            return newPhotos;
        });
    };

    const removeExistingPhoto = (photoId: number) => {
        setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
        setDeletedPhotos(prev => [...prev, photoId]);
        setHasExistingPhotoChanges(true);
    };

    const updateNewPhotoCaption = (index: number, caption: string) => {
        setNewPhotos(prev => {
            const newPhotos = [...prev];
            newPhotos[index].caption = caption;
            return newPhotos;
        });
    };

    const updateExistingPhotoCaption = (photoId: number, caption: string) => {
        setExistingPhotos(prev => 
            prev.map(photo => 
                photo.id === photoId ? { ...photo, caption } : photo
            )
        );
        setHasExistingPhotoChanges(true);
    };

    const resetForm = () => {
        newPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setNewPhotos([]);
        setExistingPhotos(gallery.photos || []);
        setDeletedPhotos([]);
        setDescription(gallery.description || '');
        setHasExistingPhotoChanges(false);
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
                {trigger ?? <Button variant="outline">Edit</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form
                    method="post"
                    action={GalleryController.update.url(gallery.id)}
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
                                <DialogTitle>Edit Gallery</DialogTitle>
                                <DialogDescription>
                                    Update the gallery information and photos.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={gallery.title}
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
                                    defaultValue={gallery.option || ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select an option</option>
                                    <option value="Abhidh">Abhidh</option>
                                    <option value="Abhidh Creative">Abhidh Creative</option>
                                    <option value="Abhidh Academy">Abhidh Academy</option>
                                </select>
                                <InputError message={errors.option} />
                            </div>

                            {/* Existing Photos */}
                            {existingPhotos.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Existing Photos</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {existingPhotos.map((photo) => (
                                            <div key={photo.id} className="relative group">
                                                <img
                                                    src={photo.photo_url}
                                                    alt={photo.caption || 'Gallery photo'}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                    onClick={() => removeExistingPhoto(photo.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                <Input
                                                    placeholder="Caption (optional)"
                                                    value={photo.caption || ''}
                                                    onChange={(e) => updateExistingPhotoCaption(photo.id, e.target.value)}
                                                    className="mt-2 text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Photos */}
                            <div className="grid gap-2">
                                <Label htmlFor="photos">Add More Photos</Label>
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

                            {/* New Photo Previews */}
                            {newPhotos.length > 0 && (
                                <div className="space-y-3">
                                    <Label>New Photo Previews</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {newPhotos.map((photo, index) => (
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
                                                    onClick={() => removeNewPhoto(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                <Input
                                                    placeholder="Caption (optional)"
                                                    value={photo.caption}
                                                    onChange={(e) => updateNewPhotoCaption(index, e.target.value)}
                                                    className="mt-2 text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hidden inputs for form submission - only send if there are changes to existing photos */}
                            {hasExistingPhotoChanges && existingPhotos.map((photo) => (
                                <input
                                    key={`existing-${photo.id}`}
                                    type="hidden"
                                    name={`existing_photos[${photo.id}][id]`}
                                    value={photo.id}
                                />
                            ))}
                            {hasExistingPhotoChanges && existingPhotos.map((photo) => (
                                <input
                                    key={`existing-caption-${photo.id}`}
                                    type="hidden"
                                    name={`existing_photos[${photo.id}][caption]`}
                                    value={photo.caption || ''}
                                />
                            ))}
                            {deletedPhotos.map((photoId) => (
                                <input
                                    key={`deleted-${photoId}`}
                                    type="hidden"
                                    name={`deleted_photos[]`}
                                    value={photoId}
                                />
                            ))}
                            {newPhotos.map((photo, index) => (
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
                            {newPhotos.map((photo, index) => (
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
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Gallery
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
