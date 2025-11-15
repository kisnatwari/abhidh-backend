import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, BookOpen, BookOpenCheck, CheckCircle, Clock, LayoutList, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type TopicProgressItem = {
    order: number;
    status: 'not_started' | 'in_progress' | 'completed';
    lastViewedAt?: string | null;
    completedAt?: string | null;
};

type CourseProgressPayload = {
    items?: TopicProgressItem[] | null;
    summary?: {
        completedCount: number;
        topicCount: number;
        percentComplete: number;
        nextTopic?: {
            order: number;
            title: string;
        } | null;
    } | null;
};

type SelfPacedTopic = {
    id: number;
    order: number;
    title: string | null;
    duration: string | null;
    content: string | null;
    subtopics: string[];
    status?: TopicProgressItem['status'];
    lastViewedAt?: string | null;
    completedAt?: string | null;
};

type GuidedSession = {
    id: number | string;
    session: number | string;
    course_topic: string | null;
    hours: string | null;
    learnings: string[];
    activities: string[];
    description: string | null;
};

type EnrollmentCourse = {
    id: number | null;
    title: string | null;
    description: string | null;
    duration: string | null;
    courseType: string | null;
    courseTypeLabel: string | null;
    keyLearningObjectives: string[];
    program: { id: number; name: string } | null;
    topics?: SelfPacedTopic[];
    syllabus?: GuidedSession[];
    contentLocked?: boolean;
    lockReason?: string | null;
    progress?: CourseProgressPayload | null;
};

type EnrollmentDetailProps = {
    enrollment: {
        id: number;
        status: string;
        paymentVerified: boolean;
        isPaid: boolean;
        enrollmentDate: string | null;
        course: EnrollmentCourse | null;
    };
};

const statusLabels: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
};

const topicStatusLabels: Record<TopicProgressItem['status'], string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    completed: 'Completed',
};

const topicStatusStyles: Record<TopicProgressItem['status'], string> = {
    not_started: 'text-slate-500 bg-slate-100 border-slate-200',
    in_progress: 'text-amber-600 bg-amber-50 border-amber-200',
    completed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const topicStatusIcon: Record<TopicProgressItem['status'], typeof Clock> = {
    not_started: Clock,
    in_progress: Play,
    completed: CheckCircle,
};

export default function EnrollmentDetail({ enrollment }: EnrollmentDetailProps) {
    const enrollmentDate = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate) : null;
    const statusLabel = statusLabels[enrollment.status] ?? enrollment.status;

    const isSelfPaced = enrollment.course?.courseType === 'self_paced';
    const contentLocked = Boolean(isSelfPaced && enrollment.course?.contentLocked);
    const lockReason =
        enrollment.course?.lockReason ??
        'Your payment proof is awaiting verification. Lessons unlock automatically once the academy team approves your submission.';

    const progressItems = useMemo(
        () =>
            (enrollment.course?.progress?.items ?? []).filter(
                (item): item is TopicProgressItem =>
                    item !== null &&
                    typeof item === 'object' &&
                    typeof item.order === 'number' &&
                    typeof item.status === 'string',
            ),
        [enrollment.course?.progress?.items],
    );

    const progressSummary = useMemo(() => enrollment.course?.progress?.summary ?? null, [enrollment.course?.progress?.summary]);

    const progressLookup = useMemo(() => {
        return progressItems.reduce<Record<number, TopicProgressItem>>((accumulator, item) => {
            accumulator[item.order] = item;
            return accumulator;
        }, {});
    }, [progressItems]);

    const topics = useMemo(() => {
        if (!isSelfPaced || !enrollment.course?.topics) {
            return [] as SelfPacedTopic[];
        }

        return enrollment.course.topics
            .filter((topic): topic is SelfPacedTopic => topic !== null && typeof topic === 'object')
            .map((topic, index) => {
                const order = typeof topic.order === 'number' ? topic.order : index;
                const progress = progressLookup[order];

                return {
                    ...topic,
                    title: topic.title ?? `Topic ${index + 1}`,
                    order,
                    status: progress?.status ?? 'not_started',
                    lastViewedAt: progress?.lastViewedAt ?? null,
                    completedAt: progress?.completedAt ?? null,
                    subtopics: Array.isArray(topic.subtopics) ? topic.subtopics.filter(Boolean) : [],
                };
            })
            .sort((a, b) => a.order - b.order);
    }, [enrollment.course?.topics, isSelfPaced, progressLookup]);

    const syllabusEntries = useMemo(() => {
        if (isSelfPaced || !enrollment.course?.syllabus) {
            return [] as GuidedSession[];
        }

        return enrollment.course.syllabus
            .filter((session): session is GuidedSession => session !== null && typeof session === 'object')
            .map((session, index) => ({
                ...session,
                session: session.session ?? index + 1,
                course_topic: session.course_topic ?? `Session ${index + 1}`,
                learnings: Array.isArray(session.learnings) ? session.learnings.filter(Boolean) : [],
                activities: Array.isArray(session.activities) ? session.activities.filter(Boolean) : [],
            }));
    }, [enrollment.course?.syllabus, isSelfPaced]);

    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [pendingAction, setPendingAction] = useState<'start' | 'complete' | null>(null);

    useEffect(() => {
        if (!isSelfPaced) {
            setActiveTopicIndex(0);
            return;
        }

        if (contentLocked) {
            setActiveTopicIndex(0);
            return;
        }

        if (typeof progressSummary?.nextTopic?.order === 'number') {
            const target = Math.min(progressSummary.nextTopic.order, Math.max(topics.length - 1, 0));
            setActiveTopicIndex(target);
            return;
        }

        if (topics.length > 0) {
            setActiveTopicIndex(Math.max(topics.length - 1, 0));
        } else {
            setActiveTopicIndex(0);
        }
    }, [isSelfPaced, contentLocked, progressSummary?.nextTopic?.order, topics.length]);

    const currentTopic = topics[activeTopicIndex] ?? null;
    const currentProgress = currentTopic ? progressLookup[currentTopic.order] : undefined;
    const topicCount = progressSummary?.topicCount ?? topics.length;
    const percentComplete = progressSummary?.percentComplete ?? 0;
    const isCourseComplete =
        progressSummary?.topicCount && progressSummary.topicCount > 0
            ? progressSummary.completedCount >= progressSummary.topicCount
            : false;
    const activeStatus = currentTopic?.status ?? 'not_started';
    const ActiveStatusIcon = topicStatusIcon[activeStatus];
    const activeStatusStyle = topicStatusStyles[activeStatus];
    const lastUpdatedLabel = currentTopic
        ? currentTopic.completedAt
            ? `Completed ${new Date(currentTopic.completedAt).toLocaleString()}`
            : currentTopic.lastViewedAt
                ? `Last viewed ${new Date(currentTopic.lastViewedAt).toLocaleString()}`
                : null
        : null;

    const postToProgress = (action: 'start' | 'complete', topic: SelfPacedTopic, options: { preserveActive?: boolean } = {}) => {
        if (pendingAction) {
            return;
        }

        const endpoint =
            action === 'start'
                ? `/academy/my-enrollments/${enrollment.id}/topics/${topic.order}/start`
                : `/academy/my-enrollments/${enrollment.id}/topics/${topic.order}/complete`;

        const targetIndex = topics.findIndex((item) => item.order === topic.order);

        setPendingAction(action);
        router.post(
            endpoint,
            {},
            {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
                onSuccess: () => {
                    if (targetIndex < 0) {
                        return;
                    }

                    if (options.preserveActive) {
                        setActiveTopicIndex((current) => (current === targetIndex ? current : targetIndex));
                    } else {
                        setActiveTopicIndex(targetIndex);
                    }
                },
            },
        );
    };

    const handleTopicSelect = (index: number) => {
        if (index < 0 || index >= topics.length) {
            return;
        }

        setActiveTopicIndex(index);

        const topic = topics[index];

        if (!contentLocked && topic.status === 'not_started') {
            postToProgress('start', topic, { preserveActive: true });
        }
    };

    const handleResume = () => {
        if (!isSelfPaced || topics.length === 0) {
            return;
        }

        const nextOrder = progressSummary?.nextTopic?.order;
        const targetIndex =
            typeof nextOrder === 'number'
                ? Math.max(
                      Math.min(
                          topics.findIndex((topic) => topic.order === nextOrder),
                          topics.length - 1,
                      ),
                      0,
                  )
                : Math.max(topics.length - 1, 0);

        handleTopicSelect(targetIndex);
    };

    return (
        <StudentDashboardLayout>
            <Head title={enrollment.course?.title ? `${enrollment.course.title} · Enrollment` : 'Enrollment detail'} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/academy/my-enrollments"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to enrollments
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        {enrollment.course?.courseTypeLabel ? (
                            <Badge variant="outline" className="rounded-full border-slate-300 text-slate-600">
                                {enrollment.course.courseTypeLabel}
                            </Badge>
                        ) : null}
                        <Badge className="rounded-full bg-primary/10 text-primary">{statusLabel}</Badge>
                        <Badge
                            className={
                                enrollment.paymentVerified
                                    ? 'rounded-full bg-emerald-500 text-white'
                                    : 'rounded-full bg-amber-400 text-slate-900'
                            }
                        >
                            {enrollment.paymentVerified ? 'Payment verified' : 'Verification pending'}
                        </Badge>
                    </div>
                </div>

                <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-5 px-6 py-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-slate-900">{enrollment.course?.title ?? 'Course removed'}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                {enrollment.course?.program?.name ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        {enrollment.course.program.name}
                                    </span>
                                ) : null}
                                {enrollment.course?.duration ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                        {enrollment.course.duration}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Enrollment date</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {enrollmentDate ? enrollmentDate.toLocaleString() : 'Not available'}
                                </p>
                                {enrollmentDate && (
                                    <p className="text-xs text-slate-500">
                                        {formatDistanceToNow(enrollmentDate, {
                                            addSuffix: true,
                                        })}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment status</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{enrollment.isPaid ? 'Paid' : 'Unpaid'}</p>
                                {enrollment.paymentVerified ? (
                                    <span className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-600">
                                        <CheckCircle className="h-4 w-4" />
                                        Verified by academy team
                                    </span>
                                ) : (
                                    <span className="mt-2 inline-flex items-center gap-2 text-xs text-amber-600">
                                        <BookOpen className="h-4 w-4" />
                                        Awaiting verification
                                    </span>
                                )}
                            </div>
                        </div>

                        {enrollment.course?.description ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Course overview</p>
                                <p className="text-sm leading-relaxed text-slate-600">{enrollment.course.description}</p>
                            </div>
                        ) : null}

                        {contentLocked ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                <p className="font-semibold">Content locked</p>
                                <p className="mt-1">{lockReason}</p>
                                <p className="mt-2 text-xs text-amber-600">
                                    Tip: once verification is complete, refresh this dashboard to access every lesson instantly.
                                </p>
                            </div>
                        ) : null}

                        {enrollment.course?.keyLearningObjectives?.length ? (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Key learning objectives</p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    {enrollment.course.keyLearningObjectives.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {!contentLocked && isSelfPaced && progressSummary && topicCount > 0 ? (
                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Learning progress</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-semibold text-slate-900">{percentComplete}%</span>
                                    <span className="text-xs text-slate-500">
                                        {progressSummary.completedCount} of {progressSummary.topicCount} topics complete
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 md:w-80">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${percentComplete}%` }}
                                    />
                                </div>
                                {isCourseComplete ? (
                                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        All modules completed – amazing work!
                                    </p>
                                ) : progressSummary.nextTopic ? (
                                    <p className="inline-flex items-center gap-2 text-xs text-slate-600">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        Next module: {progressSummary.nextTopic.title}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full px-4 py-2 text-sm"
                                    onClick={handleResume}
                                    disabled={topics.length === 0 || pendingAction !== null}
                                >
                                    {isCourseComplete ? 'Review modules' : 'Resume learning'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {isSelfPaced ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="space-y-4 px-5 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <LayoutList className="h-4 w-4 text-primary" />
                                        Course outline
                                    </div>
                                    {topics.length > 0 ? (
                                        <span className="text-xs text-slate-500">
                                            {activeTopicIndex + 1} / {topics.length}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    {topics.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-xs text-slate-500">
                                            Course topics will appear here once published.
                                        </div>
                                    ) : (
                                        topics.map((topic, index) => (
                                            <button
                                                key={topic.id}
                                                type="button"
                                                onClick={() => handleTopicSelect(index)}
                                                className={cn(
                                                    'w-full rounded-lg border px-3 py-3 text-left transition',
                                                    index === activeTopicIndex
                                                        ? 'border-primary/40 bg-primary/10 text-primary'
                                                        : 'border-slate-200 hover:border-primary/30 hover:bg-primary/5',
                                                    topic.status === 'completed' && index !== activeTopicIndex
                                                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
                                                        : '',
                                                    topic.status === 'in_progress' && index !== activeTopicIndex
                                                        ? 'border-amber-200 bg-amber-50/70 text-amber-700'
                                                        : '',
                                                )}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                                                        <span>{topic.title}</span>
                                                        {topic.duration ? (
                                                            <span className="text-xs font-medium text-slate-500">{topic.duration}</span>
                                                        ) : null}
                                                    </div>
                                                    {topic.subtopics?.length ? (
                                                        <p className="text-[11px] text-slate-500">
                                                            {topic.subtopics.slice(0, 2).join(' · ')}
                                                            {topic.subtopics.length > 2 ? '…' : ''}
                                                        </p>
                                                    ) : null}
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                        <span
                                                            className={cn(
                                                                'h-1.5 w-1.5 rounded-full',
                                                                topic.status === 'completed'
                                                                    ? 'bg-emerald-500'
                                                                    : topic.status === 'in_progress'
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-slate-300',
                                                            )}
                                                        />
                                                        <span>{topicStatusLabels[topic.status ?? 'not_started']}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 min-w-0">
                            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                <CardContent className="space-y-4 px-6 py-6">
                                    {currentTopic ? (
                                        <>
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Module {activeTopicIndex + 1}</p>
                                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{currentTopic.title}</h2>
                                                </div>
                                                {currentTopic.duration ? (
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {currentTopic.duration}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold',
                                                        activeStatusStyle,
                                                    )}
                                                >
                                                    <ActiveStatusIcon className="h-3.5 w-3.5" />
                                                    {topicStatusLabels[activeStatus]}
                                                </span>
                                                {lastUpdatedLabel ? (
                                                    <span className="text-[11px] text-slate-500">{lastUpdatedLabel}</span>
                                                ) : null}
                                            </div>

                                            {currentTopic.subtopics?.length ? (
                                                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subtopics</p>
                                                    <ul className="space-y-1">
                                                        {currentTopic.subtopics.map((subtopic, subIndex) => (
                                                            <li key={subIndex} className="flex items-start gap-2 text-xs">
                                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                                                {subtopic}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}

                                            {contentLocked ? (
                                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-700">
                                                    <p className="font-semibold">Awaiting payment verification</p>
                                                    <p className="mt-1">{lockReason}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <article
                                                        className="course-content space-y-4 text-sm leading-relaxed text-slate-700 [&>h1]:text-xl [&>h1]:font-semibold [&>h2]:text-lg [&>h2]:font-semibold [&>h3]:text-base [&>h3]:font-semibold [&>p]:mt-3 [&>p:first-of-type]:mt-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:bg-slate-900/90 [&>pre]:p-4 [&>pre]:text-xs [&>pre]:text-slate-100 [&>pre]:whitespace-pre-wrap [&>pre]:wrap-break-word [&>pre>code]:whitespace-pre-wrap [&>pre>code]:wrap-break-word"
                                                        dangerouslySetInnerHTML={{
                                                            __html: currentTopic.content ?? '<p>No written content available yet for this topic.</p>',
                                                        }}
                                                    />

                                                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                                            {lastUpdatedLabel ? <span>{lastUpdatedLabel}</span> : null}
                                                            {currentTopic.completedAt ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Completed
                                                                </span>
                                                            ) : currentTopic.status === 'in_progress' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                                                                    <Play className="h-3.5 w-3.5" />
                                                                    In progress
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="flex items-center gap-2"
                                                                onClick={() => currentTopic && postToProgress('start', currentTopic, { preserveActive: true })}
                                                                disabled={
                                                                    !currentTopic ||
                                                                    currentTopic.status === 'in_progress' ||
                                                                    currentTopic.status === 'completed' ||
                                                                    pendingAction !== null
                                                                }
                                                            >
                                                                <Play className="h-4 w-4" />
                                                                Mark in progress
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                                                onClick={() => currentTopic && postToProgress('complete', currentTopic)}
                                                                disabled={
                                                                    !currentTopic ||
                                                                    currentTopic.status === 'completed' ||
                                                                    pendingAction !== null
                                                                }
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Mark completed
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                                            Select a topic from the outline to start learning.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {topics.length > 0 ? (
                                <div className="flex flex-wrap justify-between gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleTopicSelect(activeTopicIndex - 1)}
                                        disabled={activeTopicIndex === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleTopicSelect(activeTopicIndex + 1)}
                                        disabled={activeTopicIndex >= topics.length - 1}
                                        className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                    >
                                        Next lesson
                                        <Play className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {syllabusEntries.length ? (
                            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                <CardContent className="space-y-4 px-6 py-6">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <BookOpenCheck className="h-4 w-4 text-primary" />
                                        Complete syllabus
                                    </div>

                                    <div className="space-y-4">
                                        {syllabusEntries.map((session) => (
                                            <div key={session.id} className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="text-sm font-semibold text-primary">
                                                        Session {session.session}
                                                    </div>
                                                    {session.hours ? (
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-medium text-primary">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {session.hours}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <h3 className="mt-2 text-base font-semibold text-slate-900">{session.course_topic}</h3>
                                                {session.description ? (
                                                    <p className="mt-2 text-sm text-slate-600">{session.description}</p>
                                                ) : null}

                                                {session.learnings.length ? (
                                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                                        <p className="font-semibold text-slate-900">Key learnings</p>
                                                        <ul className="space-y-1">
                                                            {session.learnings.map((learning, index) => (
                                                                <li key={`${session.id}-learning-${index}`} className="flex items-start gap-2 text-xs">
                                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                                                    {learning}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : null}

                                                {session.activities.length ? (
                                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                                        <p className="font-semibold text-slate-900">Activities</p>
                                                        <ul className="space-y-1">
                                                            {session.activities.map((activity, index) => (
                                                                <li key={`${session.id}-activity-${index}`} className="flex items-start gap-2 text-xs">
                                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                                                    {activity}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="rounded-xl border border-dashed border-slate-200 bg-white shadow-sm">
                                <CardContent className="px-6 py-10 text-center text-sm text-slate-500">
                                    Syllabus details will appear here once your mentor shares the module plan.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </StudentDashboardLayout>
    );
}

