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
import EditBlogDialog from './edit';
import DeleteBlogDialog from './delete';

export default function ViewBlogDialog({ blog, trigger }: { blog: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline">View</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{blog.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {blog.image_url && (
                        <img src={blog.image_url} alt={blog.title} className="w-full max-h-64 object-cover rounded border" />
                    )}
                    <div>
                        <strong>Option:</strong> {blog.option || '—'}
                    </div>
                    <div>
                        <strong>Status:</strong> {blog.is_published ? 'Published' : 'Draft'}
                    </div>
                    <div>
                        <strong>Published at:</strong> {blog.published_at ? blog.published_at.slice(0, 10) : '—'}
                    </div>
                    <div>
                        <strong>Content:</strong>
                        <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <EditBlogDialog blog={blog} trigger={<Button variant="outline">Edit</Button>} />
                    <DeleteBlogDialog blog={blog} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
