import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronRight, Compass, Rocket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type EnrollmentProgress = {
    completedCount: number;
    topicCount: number;
    percentComplete: number;
    nextTopic?: {
        order: number;
        title: string;
    } | null;
};

type EnrollmentSummary = {
    id: number;
    courseTitle?: string;
    courseType?: string;
    programName?: string;
    status: string;
    paymentStatus: string;
    paymentVerified: boolean;
    enrollmentDate: string | null;
    progress?: EnrollmentProgress | null;
};

type EnrollmentListProps = {
    enrollments: EnrollmentSummary[];
    availableCourses: AvailableCourse[];
};

const statusColors: Record<string, string> = {
    Active: 'bg-blue-500 text-white',
    Completed: 'bg-emerald-500 text-white',
    Dropped: 'bg-slate-300 text-slate-700',
};

export default function EnrollmentList({ enrollments, availableCourses }: EnrollmentListProps) {
    const [showCatalog, setShowCatalog] = useState(false);

    return (
        <StudentDashboardLayout>
            <Head title="My Enrollments" />

            <header className="rounded-xl border border-slate-200 bg-white px-6 py-6 text-slate-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Courses</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Enrollment history</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Track payment status, cohort participation, and mentor verification for every course you join.
                </p>
                <div className="mt-4">
                    <Button
                        type="button"
                        variant={showCatalog ? 'outline' : 'default'}
                        onClick={() => setShowCatalog((value) => !value)}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                    >
                        {showCatalog ? (
                            <>
                                Hide course suggestions
                                <Rocket className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Browse more courses
                                <Sparkles className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 px-6 py-6">
                    {enrollments.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                            You haven&apos;t enrolled in any courses yet. Browse the academy to get started.
                        </div>
                    )}

                    {enrollments.map((enrollment) => {
                        const enrollmentDate = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate) : null;
                        const statusLabel = enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1);
                        const progress = enrollment.progress;

                        return (
                            <Link
                                key={enrollment.id}
                                href={`/academy/my-enrollments/${enrollment.id}`}
                                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{enrollment.courseTitle ?? 'Course removed'}</p>
                                        <p className="text-xs text-slate-500">
                                            {enrollment.programName ?? 'Standalone course'}
                                            {enrollmentDate ? ` · ${enrollmentDate.toLocaleDateString()}` : null}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {enrollmentDate && (
                                            <span>
                                                {formatDistanceToNow(enrollmentDate, {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                                    <Badge variant="outline" className="rounded-full border-slate-300 text-slate-600">
                                        {enrollment.courseType ?? 'Course'}
                                    </Badge>
                                    <Badge className={`rounded-full px-3 py-1 ${statusColors[statusLabel] ?? 'bg-slate-300 text-slate-700'}`}>
                                        {statusLabel}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'rounded-full border px-3 py-1',
                                            enrollment.paymentVerified ? 'border-emerald-300 text-emerald-600' : 'border-amber-300 text-amber-600',
                                        )}
                                    >
                                        {enrollment.paymentVerified ? 'Payment verified' : enrollment.paymentStatus}
                                    </Badge>
                                </div>

                                {progress && progress.topicCount > 0 ? (
                                    <div className="rounded-lg border border-slate-200 bg-white/70 p-4 text-xs text-slate-600">
                                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                            <span>Self-paced progress</span>
                                            <span className="text-primary tracking-normal">{progress.percentComplete}%</span>
                                        </div>
                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-500"
                                                style={{ width: `${progress.percentComplete}%` }}
                                            />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                            <span>
                                                <strong className="font-semibold text-slate-700">{progress.completedCount}</strong> of{' '}
                                                <strong className="font-semibold text-slate-700">{progress.topicCount}</strong> topics completed
                                            </span>
                                            {progress.percentComplete >= 100 || progress.completedCount === progress.topicCount ? (
                                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                                    <Sparkles className="h-3 w-3" />
                                                    Course completed
                                                </span>
                                            ) : progress.nextTopic ? (
                                                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                                    <Sparkles className="h-3 w-3 text-primary" />
                                                    Next: {progress.nextTopic.title}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                            </Link>
                        );
                    })}
                </CardContent>
            </Card>

            {showCatalog ? (
                <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-6 px-6 py-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
                                    Ready for more?
                                </Badge>
                                <h2 className="text-lg font-semibold text-slate-900">Explore other courses</h2>
                                <p className="text-sm text-slate-500">
                                    Extend your learning path with additional cohort or self-paced programs curated for you.
                                </p>
                            </div>
                            <Link
                                href="/academy/courses"
                                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                            >
                                Browse all courses
                                <Compass className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {availableCourses.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                Great work! You are already enrolled in all available courses at the moment.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {availableCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50/70 p-4 transition hover:border-primary/40 hover:bg-white"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <Badge variant="outline" className="rounded-full border-slate-300 text-xs text-slate-600">
                                                {course.courseTypeLabel ?? course.courseType ?? 'Course'}
                                            </Badge>
                                            {course.program ? (
                                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
                                                    <span
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            backgroundColor: course.program?.color ?? '#1d4ed8',
                                                        }}
                                                    />
                                                    {course.program.name}
                                                </span>
                                            ) : null}
                                        </div>
                                        <h3 className="mt-3 text-base font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
                                        {course.description ? (
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-3">{course.description}</p>
                                        ) : null}
                                        <div className="mt-auto flex flex-col gap-3 pt-4 text-xs text-slate-500">
                                            {course.duration ? <span>Duration: {course.duration}</span> : null}
                                            <Link
                                                href={`/academy/courses/${course.id}`}
                                                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                                            >
                                                View course details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}
        </StudentDashboardLayout>
    );
}

type AvailableCourse = {
    id: number;
    title: string;
    description: string | null;
    courseType: string | null;
    courseTypeLabel: string | null;
    duration: string | null;
    program: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    featured: boolean;
};

