import * as React from 'react';
import { Form } from '@inertiajs/react';
import ServiceController from '@/actions/App/Http/Controllers/ServiceController';
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
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import ColorPicker from '@/components/color-picker';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AddServiceDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [imgPreview, setImgPreview] = React.useState<string | null>(null);
    const [description, setDescription] = React.useState('');
    const [content, setContent] = React.useState('');
    const [accentColor, setAccentColor] = React.useState('');

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        setImgPreview(file ? URL.createObjectURL(file) : null);
    };

    const resetForm = () => {
        setImgPreview(null);
        setDescription('');
        setContent('');
        setAccentColor('');
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
                {trigger ?? <Button>New Service</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form
                    {...ServiceController.store.form()}
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
                                <DialogTitle>Create Service</DialogTitle>
                                <DialogDescription>
                                    Add a new service. Slug will be generated automatically.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Service Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Digital Marketing"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Category */}
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Select category</option>
                                    <option value="digital_marketing">Digital Marketing</option>
                                    <option value="it_development">IT & Development</option>
                                    <option value="creative_solutions">Creative Solutions</option>
                                </select>
                                <InputError message={errors.category} />
                            </div>

                            {/* Description (short) */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Brief description for service cards..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Content (rich text) */}
                            <div className="grid gap-2">
                                <Label htmlFor="content">Full Content</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write detailed service content…"
                                    name="content"
                                />
                                <InputError message={errors.content} />
                            </div>

                            {/* Thumbnail */}
                            <div className="grid gap-2">
                                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="thumbnail"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        Choose image
                                    </label>
                                    <input
                                        id="thumbnail"
                                        name="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {imgPreview && (
                                        <img
                                            src={imgPreview}
                                            alt="Preview"
                                            className="h-20 w-32 rounded object-cover border"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
                                <InputError message={errors.thumbnail} />
                            </div>

                            {/* Accent Color */}
                            <ColorPicker
                                id="accent_color"
                                name="accent_color"
                                value={accentColor}
                                onChange={setAccentColor}
                                error={errors.accent_color}
                            />

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

