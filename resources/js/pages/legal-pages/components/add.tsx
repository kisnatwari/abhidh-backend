import * as React from 'react';
import { Form } from '@inertiajs/react';
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
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { CalendarDays, Loader2 } from 'lucide-react';

export default function AddLegalPageDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [content, setContent] = React.useState('');

    const resetForm = () => setContent('');

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm();
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? <Button>New Legal Page</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-3xl">
                <Form
                    method="post"
                    action="/legal-pages"
                    onSuccess={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create Legal Page</DialogTitle>
                                <DialogDescription>
                                    Add a Terms of Service or Privacy Policy page.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Type */}
                            <div className="grid gap-2">
                                <Label htmlFor="type">Page Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Select type</option>
                                    <option value="terms">Terms of Service</option>
                                    <option value="privacy">Privacy Policy</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            {/* Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="Terms of Service"
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Content */}
                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write the full legal content here…"
                                    name="content"
                                />
                                <InputError message={errors.content} />
                            </div>

                            {/* Publish Switch + Date */}
                            <div className="grid gap-2">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <input type="hidden" name="is_published" value="0" />
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            name="is_published"
                                            value="1"
                                            className="hidden peer"
                                        />
                                        <Switch
                                            aria-label="Publish"
                                            onCheckedChange={(checked) => {
                                                const checkbox = document.getElementById('is_published') as HTMLInputElement | null;
                                                if (checkbox) checkbox.checked = checked;
                                                if (checked) {
                                                    const form = checkbox?.closest('form') as HTMLFormElement | null;
                                                    const dateInput = form?.querySelector<HTMLInputElement>('input[name="published_at"]');
                                                    if (dateInput && !dateInput.value) {
                                                        dateInput.value = new Date().toISOString().slice(0, 10);
                                                    }
                                                }
                                            }}
                                        />
                                        <Label htmlFor="is_published">Publish</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                        <Input type="date" name="published_at" className="w-[12.5rem]" />
                                    </div>
                                </div>
                                <InputError message={errors.published_at} />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
