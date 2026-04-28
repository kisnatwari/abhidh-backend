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
import { Image as ImageIcon, Loader2, Pencil } from 'lucide-react';

type Partner = {
  id: number;
  name: string;
  logo_url: string | null;
  link: string | null;
  order: number;
  is_active: boolean;
};

export default function EditPartnerDialog({ partner }: { partner: Partner }) {
    const [open, setOpen] = React.useState(false);
    const [imgPreview, setImgPreview] = React.useState<string | null>(partner.logo_url);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: partner.name,
        link: partner.link ?? '',
        order: partner.order,
        is_active: partner.is_active,
        logo_file: null as File | null,
        _method: 'PATCH', // For multipart/form-data update
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
        // Since we are uploading a file, we must use POST with _method spoofing if it was PUT/PATCH
        // But our update route is registered as POST in api.php and web.php (likely)
        // Let's check web.php
        post(PartnerController.update.url({ partner: partner.id }), {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    setImgPreview(partner.logo_url);
                    clearErrors();
                }
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Edit Partner</DialogTitle>
                        <DialogDescription>
                            Update company partner details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Company Name</Label>
                        <Input
                            id="edit-name"
                            name="name"
                            required
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-link">Website Link (Optional)</Label>
                        <Input
                            id="edit-link"
                            name="link"
                            type="url"
                            value={data.link}
                            onChange={e => setData('link', e.target.value)}
                        />
                        <InputError message={errors.link} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-order">Display Order</Label>
                            <Input
                                id="edit-order"
                                name="order"
                                type="number"
                                value={data.order}
                                onChange={e => setData('order', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors.order} />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <Checkbox
                                id="edit-is_active"
                                name="is_active"
                                checked={data.is_active}
                                onCheckedChange={v => setData('is_active', !!v)}
                            />
                            <Label htmlFor="edit-is_active" className="cursor-pointer">Active</Label>
                            <InputError message={errors.is_active} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-logo_file">Company Logo</Label>
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="edit-logo_file"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Change logo
                            </label>
                            <input
                                id="edit-logo_file"
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
                        <p className="text-xs text-muted-foreground">PNG/JPG/SVG/WebP up to 2MB. Leave empty to keep current logo.</p>
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
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
