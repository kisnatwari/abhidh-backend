import * as React from 'react';
import { Form } from '@inertiajs/react';
import EnrollmentController from '@/actions/App/Http/Controllers/EnrollmentController';
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
import { Loader2 } from 'lucide-react';

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'dropped', label: 'Dropped' },
];

export default function EditEnrollmentDialog({ 
    enrollment, 
    courses, 
    users, 
    trigger,
    open: controlledOpen,
    onOpenChange
}: { 
    enrollment: any;
    courses: { id: number; name: string; program: { id: number; name: string } }[];
    users: { id: number; name: string; email: string }[];
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;
    const [isPaid, setIsPaid] = React.useState(enrollment.is_paid || false);
    const [enrollmentDate, setEnrollmentDate] = React.useState(
        enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toISOString().split('T')[0] : ''
    );

    const resetForm = () => {
        setIsPaid(enrollment.is_paid || false);
        setEnrollmentDate(enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toISOString().split('T')[0] : '');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm();
                setOpen(v);
            }}
        >
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-2xl">
                <Form
                    method="post"
                    action={EnrollmentController.update.url(enrollment.id)}
                    onSuccess={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Enrollment</DialogTitle>
                                <DialogDescription>
                                    Update the enrollment information.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Student */}
                            <div className="grid gap-2">
                                <Label htmlFor="user_id">Student</Label>
                                <Select name="user_id" defaultValue={String(enrollment.user_id)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                <div className="flex flex-col">
                                                    <span>{user.name}</span>
                                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.user_id} />
                            </div>

                            {/* Course */}
                            <div className="grid gap-2">
                                <Label htmlFor="course_id">Course</Label>
                                <Select name="course_id" defaultValue={String(enrollment.course_id)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                <div className="flex flex-col">
                                                    <span>{course.name}</span>
                                                    <span className="text-sm text-muted-foreground">{course.program.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.course_id} />
                            </div>

                            {/* Enrollment Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="enrollment_date">Enrollment Date</Label>
                                <Input
                                    id="enrollment_date"
                                    name="enrollment_date"
                                    type="date"
                                    value={enrollmentDate}
                                    onChange={(e) => setEnrollmentDate(e.target.value)}
                                />
                                <InputError message={errors.enrollment_date} />
                            </div>

                            {/* Status */}
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue={enrollment.status} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            {/* Payment Status */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_paid"
                                    name="is_paid"
                                    checked={isPaid}
                                    onCheckedChange={setIsPaid}
                                />
                                <Label htmlFor="is_paid">Payment Completed</Label>
                            </div>
                            <input type="hidden" name="is_paid" value={isPaid ? '1' : '0'} />

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Enrollment
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}


