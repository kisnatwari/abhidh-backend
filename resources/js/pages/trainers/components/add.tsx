import * as React from 'react';
import { Form } from '@inertiajs/react';
import TrainerController from '@/actions/App/Http/Controllers/TrainerController';
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
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AddTrainerDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [imgPreview, setImgPreview] = React.useState<string | null>(null);

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        setImgPreview(file ? URL.createObjectURL(file) : null);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) setImgPreview(null);
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? <Button>New Trainer</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <Form
                    {...TrainerController.store.form()}
                    encType="multipart/form-data"
                    onSuccess={() => {
                        setOpen(false);
                        setImgPreview(null);
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create Trainer</DialogTitle>
                                <DialogDescription>
                                    Add a new trainer to the system.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="John Doe"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Expertise */}
                            <div className="grid gap-2">
                                <Label htmlFor="expertise">Expertise</Label>
                                <Input
                                    id="expertise"
                                    name="expertise"
                                    required
                                    placeholder="e.g. Personal Training, Yoga"
                                />
                                <InputError message={errors.expertise} />
                            </div>

                            {/* Years of Experience */}
                            <div className="grid gap-2">
                                <Label htmlFor="years_of_experience">Years of Experience</Label>
                                <Input
                                    id="years_of_experience"
                                    name="years_of_experience"
                                    type="number"
                                    min="0"
                                    max="50"
                                    required
                                    placeholder="5"
                                />
                                <InputError message={errors.years_of_experience} />
                            </div>

                            {/* Photo */}
                            <div className="grid gap-2">
                                <Label htmlFor="photo">Photo</Label>
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="photo"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        Choose photo
                                    </label>
                                    <input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {imgPreview && (
                                        <img
                                            src={imgPreview}
                                            alt="Preview"
                                            className="h-12 w-12 rounded-full object-cover border"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
                                <InputError message={errors.photo} />
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
