import { Head } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { CourseCard, CourseResource } from '@/components/academy/course-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { hexToRgba } from '@/lib/colors';

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
}

const CoursesPage = ({ programGroups, standaloneCourses }: CoursesPageProps) => {
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
                            Courses, grouped by program excellence
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                            Discover guided cohorts and self-paced experiences organised under Abhidh Academy&apos;s flagship programs. Each course is
                            built with measurable milestones, mentor support, and outcomes that matter.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20">
                <div className="container mx-auto space-y-16 px-4">
                    {standaloneCourses.length ? (
                        <div className="space-y-8">
                            <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
                                <div>
                                    <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Featured standalone courses</h2>
                                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                        Independent experiences that give you immediate wins without enrolling in a larger program.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                                {standaloneCourses.map((course) => (
                                    <CourseCard key={`standalone-${course.id}`} course={course} />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {programGroups.map(({ program, courses }) => {
                        const accent = program.color ?? '#2563eb';
                        return (
                            <section key={program.id} className="space-y-6">
                                <div className="space-y-3 border-l-4 border-primary/40 pl-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {program.category_label ? (
                                            <span
                                                className="rounded-full bg-primary/10 px-3 py-1 text-primary"
                                                style={{ color: accent }}
                                            >
                                                {program.category_label}
                                            </span>
                                        ) : null}
                                        <span className="rounded-full bg-primary/5 px-3 py-1 text-primary/80">
                                            {program.courses_count} course{program.courses_count === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-foreground md:text-[2.2rem]">{program.name}</h2>
                                    <p className="max-w-3xl text-sm text-muted-foreground/90">
                                        {program.description ??
                                            'This Abhidh Academy program bundles the right mentors, templates, and milestones to guarantee skill outcomes.'}
                                    </p>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                    {courses.map((course) => (
                                        <CourseCard key={`${program.id}-${course.id}`} course={course} showProgramBadge={false} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {!programGroups.length && !standaloneCourses.length ? (
                        <div className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-16 text-center text-muted-foreground">
                            Course listings will appear here once they are published. Stay tuned!
                        </div>
                    ) : null}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default CoursesPage;

