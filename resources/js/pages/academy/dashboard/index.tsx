import { Head, Link, usePage } from '@inertiajs/react';
import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, GraduationCap, Sparkles } from 'lucide-react';
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

type OverviewStats = {
    active: number;
    completed: number;
    pendingPayments: number;
};

type RecentEnrollment = {
    id: number;
    courseTitle?: string;
    status: string;
    paymentVerified: boolean;
    enrollmentDate: string | null;
    programName?: string;
    progress?: EnrollmentProgress | null;
};

type OverviewPageProps = {
    stats: OverviewStats;
    recentEnrollments: RecentEnrollment[];
};

const statusLabels: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
};

export default function DashboardOverview({ stats, recentEnrollments }: OverviewPageProps) {
    const { props } = usePage<{ auth?: { user?: { name?: string } } }>();
    const learnerName = props.auth?.user?.name ?? 'Learner';

    const summaryCards = [
        {
            label: 'Active courses',
            value: stats.active,
            description: 'Currently in progress',
            Icon: GraduationCap,
        },
        {
            label: 'Completed tracks',
            value: stats.completed,
            description: 'Successfully finished',
            Icon: CheckCircle,
        },
        {
            label: 'Pending verification',
            value: stats.pendingPayments,
            description: 'Awaiting mentor review',
            Icon: Clock,
        },
    ];

    return (
        <StudentDashboardLayout>
            <Head title="Learner Overview" />

            <header className="rounded-xl border border-slate-200 bg-white px-6 py-6 text-slate-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Student Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Hello, {learnerName}</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Track your course activity, payment verification, and upcoming tasks at a glance.
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {summaryCards.map(({ label, value, description, Icon }) => (
                            <Card key={label} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                <CardContent className="flex items-start gap-4 px-5 py-5">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-2xl font-semibold text-slate-900">{value}</p>
                                        <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
                                        <p className="mt-1 text-xs text-slate-500">{description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="space-y-5 px-5 py-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <Badge variant="outline" className="rounded-full border-primary/40 text-primary">
                                        Recent activity
                                    </Badge>
                                    <h2 className="mt-2 text-lg font-semibold text-slate-900">Latest enrollments</h2>
                                    <p className="text-sm text-slate-500">
                                        Track the latest movement across your guided cohorts and self-paced tracks.
                                    </p>
                                </div>
                                <Link href="/academy/my-enrollments" className="text-sm font-semibold text-primary hover:underline">
                                    View all →
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentEnrollments.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                        No enrollment activity yet. Start by joining your first cohort.
                                    </div>
                                )}

                                {recentEnrollments.map((enrollment) => {
                                    const progress = enrollment.progress;

                                    return (
                                        <div
                                            key={enrollment.id}
                                            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {enrollment.courseTitle ?? 'Course removed'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {enrollment.programName ?? 'Standalone course'} ·{' '}
                                                        {enrollment.enrollmentDate
                                                            ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                                                            : 'Date unavailable'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            'rounded-full px-3 py-1 text-xs font-medium',
                                                            enrollment.paymentVerified ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900',
                                                        )}
                                                    >
                                                        {enrollment.paymentVerified ? 'Verified' : 'Awaiting payment check'}
                                                    </Badge>
                                                    <Badge className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                                        {statusLabels[enrollment.status] ?? enrollment.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {progress && progress.topicCount > 0 ? (
                                                <div className="rounded-lg border border-slate-200 bg-white/75 p-3 text-xs text-slate-600">
                                                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                        <span>Self-paced progress</span>
                                                        <span className="text-primary tracking-normal">{progress.percentComplete}%</span>
                                                    </div>
                                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                                            style={{ width: `${progress.percentComplete}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                                        <span>
                                                            <strong className="font-semibold text-slate-700">{progress.completedCount}</strong> /{' '}
                                                            <strong className="font-semibold text-slate-700">{progress.topicCount}</strong> topics
                                                        </span>
                                                        {progress.percentComplete >= 100 || progress.completedCount === progress.topicCount ? (
                                                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                                                <Sparkles className="h-3 w-3" />
                                                                Done
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
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="space-y-4 px-5 py-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Learner tips</p>
                            <h3 className="text-lg font-semibold text-slate-900">Ways to stay ahead</h3>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                    Reserve 2 hours each week for mentor Q&amp;A and cohort syncs.
                                </li>
                                <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                    Upload your payment proof early to unlock course resources faster.
                                </li>
                                <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                    Review mentor notes after each session to track improvement areas.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="space-y-3 px-5 py-5 text-slate-700">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Need help staying on track?</h3>
                                <p className="text-sm text-slate-500">
                                    Set personal reminders, sync with mentors, and ask for curated resources whenever you feel stuck. We&apos;re here to help.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentDashboardLayout>
    );
}

