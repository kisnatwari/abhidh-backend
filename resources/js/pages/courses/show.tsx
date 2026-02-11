import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import DeleteCourseDialog from './components/delete';

type Course = {
    id: number;
    course_type: 'guided' | 'self_paced';
    title: string;
    description: string | null;
    duration: string | null;
    grade: string | null;
    price: number | null;
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

    // State to track which subtopic contents are visible
    const [visibleSubtopicContents, setVisibleSubtopicContents] = useState<Set<string>>(new Set());
    const [showAllContents, setShowAllContents] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: CourseController.index().url },
        { title: course.title, href: CourseController.show.url(course.id) },
    ];

    const toggleSubtopicContent = (topicIndex: number, subtopicIndex: number) => {
        const key = `${topicIndex}-${subtopicIndex}`;
        const newSet = new Set(visibleSubtopicContents);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setVisibleSubtopicContents(newSet);
        setShowAllContents(false);
    };

    const showAllSubtopicContents = () => {
        if (course.course_type === 'self_paced' && course.topics) {
            const allKeys = new Set<string>();
            course.topics.forEach((topicRow: any, topicIndex: number) => {
                if (topicRow.subtopics) {
                    topicRow.subtopics.forEach((_: any, subtopicIndex: number) => {
                        allKeys.add(`${topicIndex}-${subtopicIndex}`);
                    });
                }
            });
            setVisibleSubtopicContents(allKeys);
            setShowAllContents(true);
        }
    };

    const hideAllSubtopicContents = () => {
        setVisibleSubtopicContents(new Set());
        setShowAllContents(false);
    };

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
                                        className="prose max-w-none text-sm overflow-x-auto wrap-break-word"
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

                                {course.grade && (
                                    <div>
                                        <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Grade</h4>
                                        <p className="text-sm">{course.grade}</p>
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
                                        className="prose max-w-none text-sm overflow-x-auto wrap-break-word"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>
                            )}

                            {course.price && (
                                <div>
                                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Price</h4>
                                    <p className="text-lg font-bold text-primary">Rs. {Math.round(course.price).toLocaleString('en-US')}</p>
                                </div>
                            )}

                            {course.topics && course.topics.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Topics</h3>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={showAllSubtopicContents}
                                                className="text-xs"
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                Show All Contents
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={hideAllSubtopicContents}
                                                className="text-xs"
                                            >
                                                <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                                                Hide All Contents
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {course.topics.map((topicRow: any, index: number) => {
                                            // Calculate total hours from subtopics
                                            const totalHours = topicRow.subtopics?.reduce((sum: number, subtopic: any) => {
                                                const hours = typeof subtopic === 'object' && subtopic?.hours
                                                    ? parseFloat(String(subtopic.hours)) || 0
                                                    : 0;
                                                return sum + hours;
                                            }, 0) || 0;

                                            const totalHoursNum = typeof totalHours === 'number' ? totalHours : parseFloat(String(totalHours)) || 0;

                                            return (
                                                <div
                                                    key={index}
                                                    className="rounded-lg border bg-card p-4 space-y-4 overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-lg">{topicRow.topic}</h4>
                                                        {totalHoursNum > 0 && (
                                                            <Badge variant="outline">
                                                                {totalHoursNum === Math.floor(totalHoursNum)
                                                                    ? `${totalHoursNum} hrs`
                                                                    : `${totalHoursNum.toFixed(1)} hrs`}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {topicRow.subtopics && topicRow.subtopics.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h5 className="font-medium text-sm text-muted-foreground">Subtopics</h5>
                                                            <div className="space-y-3 pl-4 border-l-2 border-muted">
                                                                {topicRow.subtopics.map((subtopic: any, i: number) => {
                                                                    // Handle both new format (object) and old format (string) for backward compatibility
                                                                    const subtopicName = typeof subtopic === 'object' ? subtopic.name : subtopic;
                                                                    const subtopicContent = typeof subtopic === 'object' ? subtopic.content : null;
                                                                    const subtopicHoursRaw = typeof subtopic === 'object' ? subtopic.hours : 0;
                                                                    const subtopicHours = typeof subtopicHoursRaw === 'number'
                                                                        ? subtopicHoursRaw
                                                                        : parseFloat(String(subtopicHoursRaw)) || 0;
                                                                    const contentKey = `${index}-${i}`;
                                                                    const isContentVisible = visibleSubtopicContents.has(contentKey);

                                                                    return (
                                                                        <div key={i} className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-medium text-foreground">{subtopicName}</span>
                                                                                    {subtopicContent && (
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => toggleSubtopicContent(index, i)}
                                                                                            className="h-6 px-2 text-xs"
                                                                                        >
                                                                                            {isContentVisible ? (
                                                                                                <>
                                                                                                    <ChevronUp className="h-3 w-3 mr-1" />
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <ChevronDown className="h-3 w-3 mr-1" />
                                                                                                </>
                                                                                            )}
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                                {subtopicHours > 0 && (
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        {subtopicHours === Math.floor(subtopicHours)
                                                                                            ? `${subtopicHours} hrs`
                                                                                            : `${subtopicHours.toFixed(1)} hrs`}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            {subtopicContent && isContentVisible && (
                                                                                <div
                                                                                    className="prose prose-sm max-w-none text-xs overflow-x-auto wrap-break-word text-muted-foreground rounded-md p-4"
                                                                                    style={{ backgroundColor: 'rgb(250, 250, 250)' }}
                                                                                    dangerouslySetInnerHTML={{ __html: subtopicContent }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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
