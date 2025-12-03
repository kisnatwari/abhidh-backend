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
import { Badge } from '@/components/ui/badge';
import EditServiceDialog from './edit';
import DeleteServiceDialog from './delete';

export default function ViewServiceDialog({ service, trigger }: { service: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline">View</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{service.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {service.thumbnail_url && (
                        <img src={service.thumbnail_url} alt={service.name} className="w-full max-h-64 object-cover rounded border" />
                    )}
                    <div className="flex gap-2">
                        <Badge variant="outline">{service.category?.replace('_', ' ') || '—'}</Badge>
                        {service.is_published ? (
                            <Badge variant="default">Published</Badge>
                        ) : (
                            <Badge variant="secondary">Draft</Badge>
                        )}
                        {service.featured && (
                            <Badge variant="default">Featured</Badge>
                        )}
                    </div>
                    <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-sm text-muted-foreground">{service.description || '—'}</p>
                    </div>
                    <div>
                        <strong>Content:</strong>
                        <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: service.content || 'No content' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Order:</strong> {service.order || 0}
                        </div>
                        <div>
                            <strong>Accent Color:</strong> {service.accent_color || '—'}
                        </div>
                    </div>
                    <div>
                        <strong>Created:</strong> {service.created_at ? new Date(service.created_at).toLocaleDateString() : '—'}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <EditServiceDialog service={service} trigger={<Button variant="outline">Edit</Button>} />
                    <DeleteServiceDialog service={service} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

