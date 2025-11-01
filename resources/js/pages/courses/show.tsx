import AppLayout from '@/layouts/app-layout';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import DeleteCourseDialog from './components/delete';

type Course = {
    id: number;
    course_type: 'guided' | 'self_paced';
    title: string;
    description: string | null;
    duration: string | null;
    target_audience: string | null;
    key_learning_objectives: string[] | null;
    syllabus: any[] | null;
    topics: any[] | null;
    program_id: number | null;
    program: { id: number; name: string } | null;
    featured: boolean;
    enrollments_count: number;
    created_at: string;
};

type PageProps = {
    course: Course;
    programs?: { id: number; name: string }[];
};

const courseTypeLabels = {
    guided: 'Guided',
    self_paced: 'Self-Paced',
};

const courseTypeColors = {
    guided: 'bg-blue-500',
    self_paced: 'bg-green-500',
};

export default function ShowCourse() {
    const { props } = usePage<PageProps>();
    const { course, programs } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: CourseController.index().url },
        { title: course.title, href: CourseController.show.url(course.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Course: ${course.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit(CourseController.index().url)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{course.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                    variant="secondary" 
                                    className={cn('text-white', courseTypeColors[course.course_type])}
                                >
                                    {courseTypeLabels[course.course_type]}
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
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {programs && (
                            <Button
                                variant="outline"
                                onClick={() => router.visit(CourseController.edit.url(course.id))}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        <DeleteCourseDialog course={course} />
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-lg border bg-card p-6 space-y-6 overflow-hidden">
                    {course.course_type === 'guided' && (
                        <>
                            {course.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <div 
                                        className="prose max-w-none text-sm overflow-x-auto break-words"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {course.duration && (
                                    <div>
                                        <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Duration</h4>
                                        <p className="text-sm">{course.duration}</p>
                                    </div>
                                )}

                                {course.target_audience && (
                                    <div>
                                        <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Target Audience</h4>
                                        <p className="text-sm">{course.target_audience}</p>
                                    </div>
                                )}
                            </div>

                            {course.key_learning_objectives && course.key_learning_objectives.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Key Learning Objectives</h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        {course.key_learning_objectives.map((objective: string, index: number) => (
                                            <li key={index} className="text-sm">{objective}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {course.syllabus && course.syllabus.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4">Syllabus</h3>
                                    <div className="space-y-4">
                                        {course.syllabus.map((row: any, index: number) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border bg-card p-4 space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline">Session {row.session}</Badge>
                                                        <h4 className="font-semibold">{row.course_topic}</h4>
                                                    </div>
                                                    {row.hours && (
                                                        <Badge variant="secondary">{row.hours} hours</Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                                                    {row.learnings && row.learnings.length > 0 && (
                                                        <div>
                                                            <h5 className="font-medium mb-2 text-sm text-muted-foreground">Learnings</h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {row.learnings.map((learning: string, i: number) => (
                                                                    <li key={i} className="text-sm">{learning}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {row.outcomes && row.outcomes.length > 0 && (
                                                        <div>
                                                            <h5 className="font-medium mb-2 text-sm text-muted-foreground">Outcomes</h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {row.outcomes.map((outcome: string, i: number) => (
                                                                    <li key={i} className="text-sm">{outcome}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {course.course_type === 'self_paced' && (
                        <>
                            {course.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <div 
                                        className="prose max-w-none text-sm overflow-x-auto break-words"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>
                            )}
                            
                            {course.topics && course.topics.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4">Topics</h3>
                                    <div className="space-y-4">
                                        {course.topics.map((topicRow: any, index: number) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border bg-card p-4 space-y-3 overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-lg">{topicRow.topic}</h4>
                                                    {topicRow.duration && (
                                                        <Badge variant="outline">{topicRow.duration}</Badge>
                                                    )}
                                                </div>
                                                
                                                {topicRow.subtopics && topicRow.subtopics.length > 0 && (
                                                    <div>
                                                        <h5 className="font-medium mb-2 text-sm text-muted-foreground">Subtopics</h5>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {topicRow.subtopics.map((subtopic: string, i: number) => (
                                                                <li key={i} className="text-sm">{subtopic}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {topicRow.content && (
                                                    <div className="mt-3 pt-3 border-t overflow-hidden">
                                                        <div 
                                                            className="prose max-w-none text-sm overflow-x-auto break-words"
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
                    
                    <div className="pt-4 border-t text-sm text-muted-foreground">
                        <strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

