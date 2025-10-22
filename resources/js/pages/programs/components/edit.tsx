import * as React from 'react';
import { Form } from '@inertiajs/react';
import ProgramController from '@/actions/App/Http/Controllers/ProgramController';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { Loader2 } from 'lucide-react';

const categories = [
    { value: 'school', label: 'School' },
    { value: 'college', label: 'College' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'it', label: 'IT' },
    { value: 'digital_marketing', label: 'Digital Marketing' },
];

const colors = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-indigo-500', label: 'Indigo' },
];

export default function EditProgramDialog({ program, trigger }: { program: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [description, setDescription] = React.useState(program.description || '');

    const resetForm = () => {
        setDescription(program.description || '');
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

            <DialogContent className="sm:max-w-2xl">
                <Form
                    method="post"
                    action={ProgramController.update.url(program.id)}
                    onSuccess={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Program</DialogTitle>
                                <DialogDescription>
                                    Update the program information.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={program.name}
                                    placeholder="Program Name"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Category */}
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" defaultValue={program.category} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>

                            {/* Color */}
                            <div className="grid gap-2">
                                <Label htmlFor="color">Color</Label>
                                <Select name="color" defaultValue={program.color || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select color (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((color) => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded ${color.value}`} />
                                                    {color.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.color} />
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Describe the program..."
                                    name="description"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Program
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}



