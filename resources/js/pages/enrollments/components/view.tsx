import * as React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditEnrollmentDialog from './edit';
import DeleteEnrollmentDialog from './delete';

const statusLabels = {
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
};

const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    dropped: 'bg-red-500',
};

export default function ViewEnrollmentDialog({ 
    enrollment, 
    courses, 
    users, 
    trigger 
}: { 
    enrollment: any;
    courses?: { id: number; name: string; program: { id: number; name: string } }[];
    users?: { id: number; name: string; email: string }[];
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline">View</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Enrollment Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Student Information */}
                    <div className="grid gap-2">
                        <h3 className="font-semibold">Student Information</h3>
                        <div className="pl-4 space-y-1">
                            <div><strong>Name:</strong> {enrollment.user?.name || 'Unknown'}</div>
                            <div><strong>Email:</strong> {enrollment.user?.email || 'Unknown'}</div>
                        </div>
                    </div>

                    {/* Course Information */}
                    <div className="grid gap-2">
                        <h3 className="font-semibold">Course Information</h3>
                        <div className="pl-4 space-y-1">
                            <div><strong>Course:</strong> {enrollment.course?.name || 'Unknown'}</div>
                            <div><strong>Program:</strong> {enrollment.course?.program?.name || 'Unknown'}</div>
                        </div>
                    </div>

                    {/* Enrollment Details */}
                    <div className="grid gap-2">
                        <h3 className="font-semibold">Enrollment Details</h3>
                        <div className="pl-4 space-y-2">
                            <div className="flex items-center gap-4">
                                <div><strong>Status:</strong></div>
                                <Badge 
                                    variant="secondary" 
                                    className={`text-white ${statusColors[enrollment.status as keyof typeof statusColors]}`}
                                >
                                    {statusLabels[enrollment.status as keyof typeof statusLabels]}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div><strong>Payment:</strong></div>
                                {enrollment.is_paid ? (
                                    <Badge variant="default">Paid</Badge>
                                ) : (
                                    <Badge variant="outline">Unpaid</Badge>
                                )}
                            </div>
                            
                            <div><strong>Enrollment Date:</strong> {new Date(enrollment.enrollment_date).toLocaleDateString()}</div>
                            <div><strong>Created:</strong> {new Date(enrollment.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    {courses && users && (
                        <EditEnrollmentDialog 
                            enrollment={enrollment} 
                            courses={courses} 
                            users={users} 
                            trigger={<Button variant="outline">Edit</Button>} 
                        />
                    )}
                    <DeleteEnrollmentDialog 
                        enrollment={enrollment} 
                        trigger={<Button variant="destructive">Delete</Button>} 
                    />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


