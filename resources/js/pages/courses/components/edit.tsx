// Edit dialog will reuse most of add.tsx logic but with initial values
// For now, we'll redirect to a full edit page, but this can be enhanced later
import * as React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import CourseController from '@/actions/App/Http/Controllers/CourseController';

export default function EditCourseDialog({ 
    course, 
    programs, 
    trigger 
}: { 
    course: any;
    programs: { id: number; name: string }[];
    trigger?: React.ReactNode;
}) {
    const handleEdit = () => {
        router.visit(CourseController.edit.url(course.id));
    };

    return (
        <Button 
            variant="outline" 
            onClick={handleEdit}
        >
            {trigger || 'Edit'}
        </Button>
    );
}

