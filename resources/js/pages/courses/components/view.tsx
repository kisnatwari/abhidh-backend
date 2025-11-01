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
import { cn } from '@/lib/utils';
import EditCourseDialog from './edit';
import DeleteCourseDialog from './delete';

const courseTypeLabels = {
    guided: 'Guided',
    self_paced: 'Self-Paced',
};

const courseTypeColors = {
    guided: 'bg-blue-500',
    self_paced: 'bg-green-500',
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
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{course.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Badge 
                            variant="secondary" 
                            className={cn('text-white', courseTypeColors[course.course_type as keyof typeof courseTypeColors])}
                        >
                            {courseTypeLabels[course.course_type as keyof typeof courseTypeLabels]}
                        </Badge>
                        {course.featured && (
                            <Badge variant="default">Featured</Badge>
                        )}
                        {course.program && (
                            <Badge variant="outline">{course.program.name}</Badge>
                        )}
                        {course.enrollments_count !== undefined && (
                            <Badge variant="outline">
                                {course.enrollments_count} enrollments
                            </Badge>
                        )}
                    </div>

                    {course.course_type === 'guided' && (
                        <>
                            {course.description && (
                                <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <div 
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>
                            )}
                            
                            {course.duration && (
                                <div>
                                    <h4 className="font-semibold mb-1">Duration</h4>
                                    <p>{course.duration}</p>
                                </div>
                            )}

                            {course.target_audience && (
                                <div>
                                    <h4 className="font-semibold mb-1">Target Audience</h4>
                                    <p>{course.target_audience}</p>
                                </div>
                            )}

                            {course.key_learning_objectives && course.key_learning_objectives.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Key Learning Objectives</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {course.key_learning_objectives.map((objective: string, index: number) => (
                                            <li key={index}>{objective}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {course.syllabus && course.syllabus.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Syllabus</h4>
                                    <div className="rounded-md border overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted">
                                                    <th className="px-3 py-2 text-left text-sm font-medium">Session</th>
                                                    <th className="px-3 py-2 text-left text-sm font-medium">Course Topic</th>
                                                    <th className="px-3 py-2 text-left text-sm font-medium">Learnings</th>
                                                    <th className="px-3 py-2 text-left text-sm font-medium">Outcomes</th>
                                                    <th className="px-3 py-2 text-left text-sm font-medium">Hours</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {course.syllabus.map((row: any, index: number) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="px-3 py-2">{row.session}</td>
                                                        <td className="px-3 py-2 font-medium">{row.course_topic}</td>
                                                        <td className="px-3 py-2">
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {row.learnings && row.learnings.map((learning: string, i: number) => (
                                                                    <li key={i} className="text-sm">{learning}</li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {row.outcomes && row.outcomes.length > 0 ? (
                                                                    row.outcomes.map((outcome: string, i: number) => (
                                                                        <li key={i} className="text-sm">{outcome}</li>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-sm text-muted-foreground">—</span>
                                                                )}
                                                            </ul>
                                                        </td>
                                                        <td className="px-3 py-2">{row.hours}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {course.course_type === 'self_paced' && (
                        <>
                            {course.topics && course.topics.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Topics</h4>
                                    <div className="space-y-4">
                                        {course.topics.map((topicRow: any, index: number) => (
                                            <div key={index} className="rounded-md border p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-semibold">{topicRow.topic}</h5>
                                                    {topicRow.duration && (
                                                        <Badge variant="outline">{topicRow.duration}</Badge>
                                                    )}
                                                </div>
                                                
                                                {topicRow.subtopics && topicRow.subtopics.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="text-sm font-medium mb-1">Subtopics:</h6>
                                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                                            {topicRow.subtopics.map((subtopic: string, i: number) => (
                                                                <li key={i}>{subtopic}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {topicRow.content && (
                                                    <div className="mt-3">
                                                        <div 
                                                            className="prose max-w-none text-sm"
                                                            dangerouslySetInnerHTML={{ __html: topicRow.content }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                        <strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    {programs && (
                        <EditCourseDialog course={course} programs={programs} trigger={<Button variant="outline">Edit</Button>} />
                    )}
                    <DeleteCourseDialog course={course} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

