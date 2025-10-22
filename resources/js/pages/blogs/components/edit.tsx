import * as React from 'react';
import { Form } from '@inertiajs/react';
import BlogController from '@/actions/App/Http/Controllers/BlogController';
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
import { CalendarDays, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function EditBlogDialog({ blog, trigger }: { blog: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [imgPreview, setImgPreview] = React.useState<string | null>(blog.image_url || null);
    const [content, setContent] = React.useState(blog.content || '');

    const handlePublishToggle = (checked: boolean, form: HTMLFormElement | null) => {
        const publishInput = form?.querySelector<HTMLInputElement>('input[name="published_at"]');
        if (checked && publishInput && !publishInput.value) {
            publishInput.value = new Date().toISOString().slice(0, 10);
        }
    };

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        setImgPreview(file ? URL.createObjectURL(file) : blog.image_url || null);
    };

    const resetForm = () => {
        setImgPreview(blog.image_url || null);
        setContent(blog.content || '');
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

            <DialogContent className="sm:max-w-3xl">
                <Form
                    method="post"
                    action={BlogController.update.url(blog.id)}
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
                                <DialogTitle>Edit Blog</DialogTitle>
                                <DialogDescription>
                                    Update the blog post. Slug will be regenerated on the server.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={blog.title}
                                    placeholder="Awesome announcement"
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Category */}
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    defaultValue={blog.category || ''}
                                    placeholder="e.g. Tech, Lifestyle"
                                />
                                <InputError message={errors.category} />
                            </div>

                            {/* Cover Image */}
                            <div className="grid gap-2">
                                <Label htmlFor="image">Cover image</Label>
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="image"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        Choose image
                                    </label>
                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {imgPreview && (
                                        <img
                                            src={imgPreview}
                                            alt="Preview"
                                            className="h-12 w-16 rounded object-cover border"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
                                <InputError message={errors.image} />
                            </div>

                            {/* Content */}
                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write your post…"
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
                                            defaultChecked={blog.is_published}
                                        />
                                        <Switch
                                            aria-label="Publish"
                                            defaultChecked={blog.is_published}
                                            onCheckedChange={(checked) => {
                                                const form = document.getElementById('is_published')
                                                    ?.closest('form') as HTMLFormElement | null;
                                                const checkbox = document.getElementById('is_published') as HTMLInputElement | null;
                                                if (checkbox) checkbox.checked = checked;
                                                handlePublishToggle(checked, form);
                                            }}
                                        />
                                        <Label htmlFor="is_published">Publish</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                        <Input type="date" name="published_at" className="w-[12.5rem]" defaultValue={blog.published_at ? blog.published_at.slice(0, 10) : ''} />
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
                                    Update
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
