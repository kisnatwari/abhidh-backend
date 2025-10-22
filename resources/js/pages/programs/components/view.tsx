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
import EditProgramDialog from './edit';
import DeleteProgramDialog from './delete';

const categoryLabels = {
    school: 'School',
    college: 'College',
    corporate: 'Corporate',
    it: 'IT',
    digital_marketing: 'Digital Marketing',
};

const categoryColors = {
    school: 'bg-blue-500',
    college: 'bg-green-500',
    corporate: 'bg-purple-500',
    it: 'bg-red-500',
    digital_marketing: 'bg-yellow-500',
};

export default function ViewProgramDialog({ program, trigger }: { program: any, trigger?: React.ReactNode }) {
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
                    <DialogTitle>{program.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Badge 
                            variant="secondary" 
                            className={`text-white ${program.color || categoryColors[program.category as keyof typeof categoryColors]}`}
                        >
                            {categoryLabels[program.category as keyof typeof categoryLabels]}
                        </Badge>
                        {program.courses_count !== undefined && (
                            <Badge variant="outline">
                                {program.courses_count} courses
                            </Badge>
                        )}
                    </div>
                    
                    {program.description && (
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: program.description }}
                        />
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                        <strong>Created:</strong> {new Date(program.created_at).toLocaleDateString()}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <EditProgramDialog program={program} trigger={<Button variant="outline">Edit</Button>} />
                    <DeleteProgramDialog program={program} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



