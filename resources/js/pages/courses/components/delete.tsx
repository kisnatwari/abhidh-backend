import * as React from 'react';
import { router } from '@inertiajs/react';
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
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteCourseDialog({ course, trigger }: { course: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [processing, setProcessing] = React.useState(false);

    const handleDelete = async () => {
        setProcessing(true);
        router.delete(`/courses/${course.id}`, {
            onSuccess: () => setOpen(false),
            onFinish: () => setProcessing(false),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Course</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{course.title}"? This will also delete all associated enrollments. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={processing}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Course
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

