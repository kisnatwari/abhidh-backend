import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AcademyLayout from '@/layouts/academy-layout';
import { CourseCard, CourseResource } from '@/components/academy/course-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ProgramResource = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    category_label?: string;
    color: string | null;
    courses_count: number;
};

type CourseGroup = {
    program: ProgramResource;
    courses: CourseResource[];
};

interface CoursesPageProps {
    programGroups: CourseGroup[];
    standaloneCourses: CourseResource[];
    selectedProgramId?: number | null;
}

const CoursesPage = ({ programGroups, standaloneCourses, selectedProgramId }: CoursesPageProps) => {
    // Calculate default tab based on selectedProgramId or first available tab
    const getDefaultTab = () => {
        if (selectedProgramId) {
            return `program-${selectedProgramId}`;
        }
        if (standaloneCourses.length > 0) {
            return 'standalone';
        }
        if (programGroups.length > 0) {
            return `program-${programGroups[0].program.id}`;
        }
        return 'all';
    };

    const [activeTab, setActiveTab] = useState<string>(getDefaultTab());

    // Update active tab when selectedProgramId changes
    useEffect(() => {
        if (selectedProgramId) {
            setActiveTab(`program-${selectedProgramId}`);
        }
    }, [selectedProgramId]);

    // Collect all courses for "All Courses" tab
    const allCourses: CourseResource[] = [
        ...standaloneCourses,
        ...programGroups.flatMap((group) => group.courses),
    ];

    // Determine if we should show tabs (only if there are multiple programs or standalone courses)
    const shouldShowTabs = programGroups.length > 1 || (programGroups.length > 0 && standaloneCourses.length > 0);

    // Calculate total courses count for "All" tab
    const totalCoursesCount = allCourses.length;

    return (
        <AcademyLayout>
            <Head title="Courses" />

            <section className="relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-background to-secondary/30 py-16 md:py-24">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(226,85%,92%,0.55),transparent_65%)]" />
                    <div className="absolute inset-y-0 right-[-20%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,hsla(210,95%,85%,0.45),transparent_65%)] blur-3xl opacity-80" />
                    <div className="absolute bottom-[-45%] left-[-10%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,hsla(226,80%,75%,0.35),transparent_65%)] blur-3xl" />
                </div>

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary backdrop-blur">
                            Explore Every Learning Track
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Browse All Courses
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                            Discover guided cohorts and self-paced experiences organised under Abhidh Academy&apos;s flagship programs. Each course is
                            built with measurable milestones, mentor support, and outcomes that matter.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {shouldShowTabs ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="mb-12 flex flex-col items-start justify-center gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                                        Browse by Program
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Select a program to explore its courses
                                    </p>
                                </div>
                                <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/30 p-1.5 md:w-auto">
                                    {standaloneCourses.length > 0 && (
                                        <TabsTrigger value="standalone" count={standaloneCourses.length}>
                                            Standalone
                                        </TabsTrigger>
                                    )}
                                    {programGroups.map(({ program }) => (
                                        <TabsTrigger
                                            key={program.id}
                                            value={`program-${program.id}`}
                                            count={program.courses_count}
                                            className={cn(
                                                program.color && 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                                            )}
                                        >
                                            {program.name}
                                        </TabsTrigger>
                                    ))}
                                    <TabsTrigger value="all" count={totalCoursesCount}>
                                        All Courses
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {standaloneCourses.length > 0 && (
                                <TabsContent value="standalone" className="mt-12">
                                    <div className="mb-10 space-y-4 rounded-2xl border-l-4 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 md:p-8">
                                        <div className="flex items-center gap-2">
                                            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                                Standalone
                                            </Badge>
                                            <Badge className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary/80">
                                                {standaloneCourses.length} course{standaloneCourses.length === 1 ? '' : 's'}
                                            </Badge>
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                                            Standalone Courses
                                        </h2>
                                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                            Independent experiences that give you immediate wins without enrolling in a larger program.
                                        </p>
                                    </div>
                                    {standaloneCourses.length > 0 ? (
                                        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                            {standaloneCourses.map((course) => (
                                                <CourseCard key={`standalone-${course.id}`} course={course} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-16 text-center">
                                            <div className="mx-auto max-w-md space-y-3">
                                                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <svg className="h-8 w-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground">No standalone courses available</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Standalone courses will appear here once they are published.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            )}

                            {programGroups.map(({ program, courses }) => {
                                const accent = program.color ?? '#2563eb';
                                return (
                                    <TabsContent key={program.id} value={`program-${program.id}`} className="mt-12">
                                        <div className="mb-10 space-y-4 rounded-2xl border-l-4 p-6 md:p-8 transition-colors duration-300" 
                                             style={{ 
                                                 borderLeftColor: accent,
                                                 background: `linear-gradient(to right, ${accent}10, transparent)`,
                                             }}>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {program.category_label && (
                                                    <Badge
                                                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm"
                                                        style={{ 
                                                            backgroundColor: `${accent}20`, 
                                                            color: accent,
                                                            borderColor: `${accent}30`,
                                                        }}
                                                    >
                                                        {program.category_label}
                                                    </Badge>
                                                )}
                                                <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/20">
                                                    {program.courses_count} course{program.courses_count === 1 ? '' : 's'}
                                                </Badge>
                                            </div>
                                            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                                                {program.name}
                                            </h2>
                                            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                                                {program.description ??
                                                    'This Abhidh Academy program bundles the right mentors, templates, and milestones to guarantee skill outcomes.'}
                                            </p>
                                        </div>
                                        {courses.length > 0 ? (
                                            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                                {courses.map((course) => (
                                                    <CourseCard
                                                        key={`${program.id}-${course.id}`}
                                                        course={course}
                                                        showProgramBadge={false}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-16 text-center">
                                                <div className="mx-auto max-w-md space-y-3">
                                                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <svg className="h-8 w-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-foreground">No courses available yet</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Courses for this program will appear here once they are published.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                );
                            })}

                            <TabsContent value="all" className="mt-12">
                                <div className="mb-10 space-y-4 rounded-2xl border-l-4 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 md:p-8">
                                    <div className="flex items-center gap-2">
                                        <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                            All Programs
                                        </Badge>
                                        <Badge className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary/80">
                                            {totalCoursesCount} course{totalCoursesCount === 1 ? '' : 's'}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                                        All Courses
                                    </h2>
                                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                        Browse through all available courses across all programs and standalone offerings.
                                    </p>
                                </div>
                                {allCourses.length > 0 ? (
                                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                        {allCourses.map((course) => (
                                            <CourseCard
                                                key={`all-${course.id}`}
                                                course={course}
                                                showProgramBadge={!course.program}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-16 text-center">
                                        <div className="mx-auto max-w-md space-y-3">
                                            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <svg className="h-8 w-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">No courses available yet</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Course listings will appear here once they are published. Stay tuned!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // Single program or no tabs needed - show direct content
                        <div className="space-y-10">
                            {standaloneCourses.length > 0 && (
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                            Standalone Courses
                                        </h2>
                                        <p className="max-w-2xl text-sm text-muted-foreground">
                                            Independent experiences that give you immediate wins without enrolling in a larger program.
                                        </p>
                                    </div>
                                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                        {standaloneCourses.map((course) => (
                                            <CourseCard key={`standalone-${course.id}`} course={course} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {programGroups.map(({ program, courses }) => {
                                const accent = program.color ?? '#2563eb';
                                return (
                                    <div key={program.id} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {program.category_label && (
                                                    <Badge
                                                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
                                                        style={{ backgroundColor: `${accent}15`, color: accent }}
                                                    >
                                                        {program.category_label}
                                                    </Badge>
                                                )}
                                                <Badge className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary/80">
                                                    {program.courses_count} course{program.courses_count === 1 ? '' : 's'}
                                                </Badge>
                                            </div>
                                            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                                {program.name}
                                            </h2>
                                            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/90">
                                                {program.description ??
                                                    'This Abhidh Academy program bundles the right mentors, templates, and milestones to guarantee skill outcomes.'}
                                            </p>
                                        </div>
                                        {courses.length > 0 ? (
                                            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                                {courses.map((course) => (
                                                    <CourseCard
                                                        key={`${program.id}-${course.id}`}
                                                        course={course}
                                                        showProgramBadge={false}
                                                    />
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}

                            {!programGroups.length && !standaloneCourses.length && (
                                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-12 text-center text-muted-foreground">
                                    Course listings will appear here once they are published. Stay tuned!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default CoursesPage;

