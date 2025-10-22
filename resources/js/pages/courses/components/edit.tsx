import * as React from 'react';
import { Form } from '@inertiajs/react';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
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
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { Loader2 } from 'lucide-react';

const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all_levels', label: 'All Levels' },
];

export default function EditCourseDialog({ 
    course, 
    programs, 
    trigger 
}: { 
    course: any;
    programs: { id: number; name: string }[];
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);
    const [description, setDescription] = React.useState(course.description || '');
    const [featured, setFeatured] = React.useState(course.featured || false);

    const resetForm = () => {
        setDescription(course.description || '');
        setFeatured(course.featured || false);
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
                    action={CourseController.update.url(course.id)}
                    onSuccess={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Course</DialogTitle>
                                <DialogDescription>
                                    Update the course information.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Program */}
                            <div className="grid gap-2">
                                <Label htmlFor="program_id">Program</Label>
                                <Select name="program_id" defaultValue={String(course.program_id)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={String(program.id)}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.program_id} />
                            </div>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={course.name}
                                    placeholder="Course Name"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Level */}
                            <div className="grid gap-2">
                                <Label htmlFor="level">Level</Label>
                                <Select name="level" defaultValue={course.level} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.level} />
                            </div>

                            {/* Duration */}
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    defaultValue={course.duration || ''}
                                    placeholder="e.g., 6 hours, 12 weeks"
                                />
                                <InputError message={errors.duration} />
                            </div>

                            {/* Featured */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="featured"
                                    name="featured"
                                    checked={featured}
                                    onCheckedChange={setFeatured}
                                />
                                <Label htmlFor="featured">Featured Course</Label>
                            </div>
                            <input type="hidden" name="featured" value={featured ? '1' : '0'} />

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Describe the course..."
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
                                    Update Course
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}


