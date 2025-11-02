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
import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import { User, Mail, BookOpen, GraduationCap, Calendar, CheckCircle2, XCircle, Clock, FileImage } from 'lucide-react';
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
    trigger,
    open: controlledOpen,
    onOpenChange
}: { 
    enrollment: any;
    courses?: { id: number; name: string; program: { id: number; name: string } }[];
    users?: { id: number; name: string; email: string }[];
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [verifying, setVerifying] = React.useState(false);
    
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Enrollment Details</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Student Information Card */}
                    <div className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Information
                        </h3>
                        <div className="space-y-3 pl-7">
                            <div className="flex items-center gap-2">
                                <strong className="text-muted-foreground min-w-[80px]">Name:</strong>
                                <span className="font-medium">{enrollment.user?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <strong className="text-muted-foreground min-w-[80px]">Email:</strong>
                                <span>{enrollment.user?.email || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Course Information Card */}
                    <div className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Course Information
                        </h3>
                        <div className="space-y-3 pl-7">
                            <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-muted-foreground min-w-[80px]">Course:</strong>
                                {enrollment.course ? (
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto font-normal text-base"
                                        onClick={() => router.visit(CourseController.show.url(enrollment.course.id))}
                                    >
                                        {enrollment.course.title}
                                    </Button>
                                ) : (
                                    <span>Unknown</span>
                                )}
                            </div>
                            {enrollment.course?.program && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <strong className="text-muted-foreground min-w-[80px]">Program:</strong>
                                    <Badge variant="outline" className="font-normal">
                                        {enrollment.course.program.name}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Screenshot Section - Prominent Display */}
                    {enrollment.payment_screenshot_path && (
                        <div className="border rounded-lg p-4 bg-card border-yellow-200 dark:border-yellow-800">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <FileImage className="h-5 w-5" />
                                Payment Screenshot
                                {!enrollment.payment_verified && (
                                    <Badge variant="secondary" className="text-white bg-yellow-600 ml-2">
                                        Pending Review
                                    </Badge>
                                )}
                            </h3>
                            
                            {enrollment.payment_screenshot_url ? (
                                <div className="space-y-3 pl-7">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                                        <div className="relative w-full flex justify-center items-center">
                                            <img 
                                                src={enrollment.payment_screenshot_url} 
                                                alt="Payment Screenshot"
                                                className="max-w-full max-h-[500px] h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 dark:border-gray-800"
                                                onClick={() => window.open(enrollment.payment_screenshot_url, '_blank')}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-image.png';
                                                    target.alt = 'Failed to load image';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(enrollment.payment_screenshot_url, '_blank')}
                                        className="w-full sm:w-auto"
                                    >
                                        Open Full Size in New Tab
                                    </Button>
                                </div>
                            ) : (
                                <div className="pl-7 text-muted-foreground">
                                    Screenshot URL not available
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enrollment Details Card */}
                    <div className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Enrollment Details
                        </h3>
                        <div className="space-y-4 pl-7">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground min-w-[140px]">Status:</strong>
                                    <Badge 
                                        variant="secondary" 
                                        className={`text-white ${statusColors[enrollment.status as keyof typeof statusColors]}`}
                                    >
                                        {statusLabels[enrollment.status as keyof typeof statusLabels]}
                                    </Badge>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground min-w-[140px]">Payment Status:</strong>
                                    {enrollment.is_paid ? (
                                        <Badge variant="default" className="bg-green-600">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Paid
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Unpaid
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground min-w-[140px]">Verification:</strong>
                                    {enrollment.payment_verified ? (
                                        <Badge variant="secondary" className="text-white bg-green-600">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    ) : enrollment.payment_screenshot_path ? (
                                        <Badge variant="secondary" className="text-white bg-yellow-600">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">No Screenshot</Badge>
                                    )}
                                </div>
                            </div>

                            {(enrollment.payment_verified_at || enrollment.verified_by || enrollment.enrollment_date) && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        {enrollment.payment_verified_at && (
                                            <div className="flex items-center gap-2">
                                                <strong className="text-muted-foreground min-w-[140px]">Verified At:</strong>
                                                <span>{new Date(enrollment.payment_verified_at).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {enrollment.verified_by && (
                                            <div className="flex items-center gap-2">
                                                <strong className="text-muted-foreground min-w-[140px]">Verified By:</strong>
                                                <Badge variant="outline">{enrollment.verified_by.name}</Badge>
                                            </div>
                                        )}
                                        {enrollment.enrollment_date && (
                                            <div className="flex items-center gap-2">
                                                <strong className="text-muted-foreground min-w-[140px]">Enrollment Date:</strong>
                                                <span>{new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <Separator />
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <strong>Created:</strong> {new Date(enrollment.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-0 mt-4 flex-wrap">
                    {/* Show Verify button if payment screenshot exists but not verified */}
                    {enrollment.payment_screenshot_path && !enrollment.payment_verified && (
                        <Button
                            variant="default"
                            size="default"
                            onClick={() => {
                                if (confirm('Are you sure you want to verify this payment? The user will be automatically enrolled.')) {
                                    setVerifying(true);
                                    router.post(`/enrollments/${enrollment.id}/verify`, {}, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setOpen(false);
                                            setVerifying(false);
                                        },
                                        onError: () => {
                                            setVerifying(false);
                                        },
                                    });
                                }
                            }}
                            disabled={verifying}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {verifying ? 'Verifying...' : 'Verify Payment'}
                        </Button>
                    )}
                    {courses && users && (
                        <EditEnrollmentDialog 
                            enrollment={enrollment} 
                            courses={courses} 
                            users={users} 
                            trigger={<Button variant="outline" className="flex-1 sm:flex-none">Edit</Button>} 
                        />
                    )}
                    <DeleteEnrollmentDialog 
                        enrollment={enrollment} 
                        trigger={<Button variant="destructive" className="flex-1 sm:flex-none">Delete</Button>} 
                    />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="flex-1 sm:flex-none">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
