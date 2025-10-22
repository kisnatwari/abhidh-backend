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
import EditCourseDialog from './edit';
import DeleteCourseDialog from './delete';

const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    all_levels: 'All Levels',
};

export default function ViewCourseDialog({ 
    course, 
    programs, 
    trigger 
}: { 
    course: any;
    programs?: { id: number; name: string }[];
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
                    <DialogTitle>{course.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Badge variant="secondary">
                            {course.program?.name || 'Unknown Program'}
                        </Badge>
                        <Badge variant="outline">
                            {levelLabels[course.level as keyof typeof levelLabels]}
                        </Badge>
                        {course.featured && (
                            <Badge variant="default">Featured</Badge>
                        )}
                        {course.enrollments_count !== undefined && (
                            <Badge variant="outline">
                                {course.enrollments_count} enrollments
                            </Badge>
                        )}
                    </div>
                    
                    {course.duration && (
                        <div className="text-sm">
                            <strong>Duration:</strong> {course.duration}
                        </div>
                    )}
                    
                    {course.description && (
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                        />
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                        <strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    {programs && (
                        <EditCourseDialog 
                            course={course} 
                            programs={programs} 
                            trigger={<Button variant="outline">Edit</Button>} 
                        />
                    )}
                    <DeleteCourseDialog 
                        course={course} 
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


