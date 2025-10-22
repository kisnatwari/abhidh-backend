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
                    {gallery.description && (
                        <div 
                            className="text-muted-foreground prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: gallery.description }}
                        />
                    )}
                    
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
                    
                    <div className="text-sm text-muted-foreground">
                        <strong>Created:</strong> {new Date(gallery.created_at).toLocaleDateString()}
                        {gallery.photos && (
                            <span className="ml-4">
                                <strong>Photos:</strong> {gallery.photos.length}
                            </span>
                        )}
                    </div>
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
