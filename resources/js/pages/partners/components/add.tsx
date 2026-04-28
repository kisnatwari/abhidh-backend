import * as React from 'react';
import { useForm } from '@inertiajs/react';
import PartnerController from '@/actions/App/Http/Controllers/PartnerController';
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
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AddPartnerDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [imgPreview, setImgPreview] = React.useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        link: '',
        order: 0,
        is_active: true,
        logo_file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo_file', file);
            setImgPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(PartnerController.store.url(), {
            onSuccess: () => {
                setOpen(false);
                setImgPreview(null);
                reset();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    setImgPreview(null);
                    clearErrors();
                }
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? <Button>Add Partner</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Add Partner</DialogTitle>
                        <DialogDescription>
                            Add a new company partner logo and details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder="Abhidh Group"
                            autoFocus
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="link">Website Link (Optional)</Label>
                        <Input
                            id="link"
                            name="link"
                            type="url"
                            placeholder="https://example.com"
                            value={data.link}
                            onChange={e => setData('link', e.target.value)}
                        />
                        <InputError message={errors.link} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input
                                id="order"
                                name="order"
                                type="number"
                                value={data.order}
                                onChange={e => setData('order', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors.order} />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <Checkbox
                                id="is_active"
                                name="is_active"
                                checked={data.is_active}
                                onCheckedChange={v => setData('is_active', !!v)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            <InputError message={errors.is_active} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="logo_file">Company Logo</Label>
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="logo_file"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Choose logo
                            </label>
                            <input
                                id="logo_file"
                                name="logo_file"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {imgPreview && (
                                <div className="h-12 w-24 border rounded bg-white flex items-center justify-center p-1">
                                    <img
                                        src={imgPreview}
                                        alt="Preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">PNG/JPG/SVG/WebP up to 2MB. Transparent background recommended.</p>
                        <InputError message={errors.logo_file} />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Partner
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
