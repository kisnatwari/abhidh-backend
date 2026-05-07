import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, BookOpen, BookOpenCheck, CheckCircle, Clock, LayoutList, Play, Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type TopicProgressItem = {
    order: number;
    status: 'not_started' | 'in_progress' | 'completed';
    lastViewedAt?: string | null;
    completedAt?: string | null;
    subtopics?: SubtopicProgress[];
};

type CourseProgressPayload = {
    items?: TopicProgressItem[] | null;
    summary?: {
        completedCount: number;
        topicCount: number;
        subtopicCount?: number;
        percentComplete: number;
        nextTopic?: {
            order: number;
            title: string;
        } | null;
        nextSubtopicIndex?: number | null;
    } | null;
};

type Subtopic = {
    name: string;
    content: string;
    hours: number;
};

type SubtopicProgress = {
    index: number;
    status: TopicProgressItem['status'];
    lastViewedAt?: string | null;
    completedAt?: string | null;
};

type SelfPacedTopic = {
    id: number;
    order: number;
    title: string | null;
    duration: string | null;
    content: string | null;
    subtopics: (string | Subtopic)[];
    status?: TopicProgressItem['status'];
    lastViewedAt?: string | null;
    completedAt?: string | null;
    subtopicsProgress?: Array<{
        index: number;
        status: TopicProgressItem['status'];
        lastViewedAt?: string | null;
        completedAt?: string | null;
    }>;
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
    grade: string | null;
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

        // Get progress items which contain subtopic progress
        const progressItems = enrollment.course?.progress?.items || [];

        return enrollment.course.topics
            .filter((topic): topic is SelfPacedTopic => topic !== null && typeof topic === 'object')
            .map((topic, index) => {
                const order = typeof topic.order === 'number' ? topic.order : index;
                const progress = progressLookup[order];

                // Find progress item for this topic (contains subtopics progress)
                const topicProgressItem = progressItems.find((item: any) => item.order === order);

                // Parse subtopics - handle both old format (strings) and new format (objects)
                const parsedSubtopics = Array.isArray(topic.subtopics)
                    ? topic.subtopics.filter(Boolean).map((st) => {
                        if (typeof st === 'string') return st;
                        if (typeof st === 'object' && st !== null && 'name' in st) {
                            return { name: st.name || '', content: st.content || '', hours: st.hours || 0 };
                        }
                        return null;
                    }).filter(Boolean) as (string | Subtopic)[]
                    : [];

                // Get subtopics progress from progress item
                const subtopicsProgress = topicProgressItem?.subtopics || [];

                return {
                    ...topic,
                    title: topic.title ?? `Topic ${index + 1}`,
                    order,
                    status: progress?.status ?? 'not_started',
                    lastViewedAt: progress?.lastViewedAt ?? null,
                    completedAt: progress?.completedAt ?? null,
                    subtopics: parsedSubtopics,
                    subtopicsProgress: subtopicsProgress,
                };
            })
            .sort((a, b) => a.order - b.order);
    }, [enrollment.course?.topics, enrollment.course?.progress?.items, isSelfPaced, progressLookup]);

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
    const [activeSubtopicIndex, setActiveSubtopicIndex] = useState(0);
    const [pendingAction, setPendingAction] = useState<'start' | 'complete' | null>(null);
    // Track if we've initialized the active topic/subtopic to prevent useEffect from resetting on every render
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!isSelfPaced) {
            setActiveTopicIndex(0);
            setActiveSubtopicIndex(0);
            setInitialized(true);
            return;
        }

        if (contentLocked) {
            setActiveTopicIndex(0);
            setActiveSubtopicIndex(0);
            setInitialized(true);
            return;
        }

        // Only auto-set on initial load, not on every update
        if (initialized) {
            return;
        }

        // Find next incomplete subtopic
        if (typeof progressSummary?.nextTopic?.order === 'number' && typeof progressSummary?.nextSubtopicIndex === 'number') {
            const topicIndex = topics.findIndex(t => t.order === progressSummary.nextTopic?.order);
            if (topicIndex >= 0) {
                setActiveTopicIndex(topicIndex);
                setActiveSubtopicIndex(progressSummary.nextSubtopicIndex);
                setInitialized(true);
                return;
            }
        }

        // Find first incomplete subtopic
        for (let tIdx = 0; tIdx < topics.length; tIdx++) {
            const topic = topics[tIdx];
            const subtopics = topic.subtopics || [];
            for (let sIdx = 0; sIdx < subtopics.length; sIdx++) {
                const subtopicProgress = topic.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === sIdx);
                if (!subtopicProgress || subtopicProgress.status !== 'completed') {
                    setActiveTopicIndex(tIdx);
                    setActiveSubtopicIndex(sIdx);
                    setInitialized(true);
                    return;
                }
            }
        }

        // Default to first topic, first subtopic
        if (topics.length > 0) {
            setActiveTopicIndex(0);
            setActiveSubtopicIndex(0);
            setInitialized(true);
        }
    }, [isSelfPaced, contentLocked, progressSummary?.nextTopic?.order, progressSummary?.nextSubtopicIndex, topics.length, initialized]);

    const currentTopic = topics[activeTopicIndex] ?? null;
    const currentSubtopic = currentTopic?.subtopics?.[activeSubtopicIndex] ?? null;
    const currentSubtopicProgress = currentTopic?.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === activeSubtopicIndex);

    // Get current subtopic as object
    const currentSubtopicObj = currentSubtopic && typeof currentSubtopic === 'object'
        ? currentSubtopic
        : currentSubtopic
            ? { name: currentSubtopic, content: '', hours: 0 }
            : null;

    const topicCount = progressSummary?.topicCount ?? topics.length;
    const subtopicCount = progressSummary?.subtopicCount ?? topics.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0);
    const percentComplete = progressSummary?.percentComplete ?? 0;
    const isCourseComplete = subtopicCount > 0 && (progressSummary?.completedCount ?? 0) >= subtopicCount;

    const activeStatus: TopicProgressItem['status'] = (currentSubtopicProgress?.status ?? 'not_started') as TopicProgressItem['status'];
    const ActiveStatusIcon = topicStatusIcon[activeStatus];
    const activeStatusStyle = topicStatusStyles[activeStatus];
    const lastUpdatedLabel = currentSubtopicProgress
        ? currentSubtopicProgress.completedAt
            ? `Completed ${new Date(currentSubtopicProgress.completedAt).toLocaleString()}`
            : currentSubtopicProgress.lastViewedAt
                ? `Last viewed ${new Date(currentSubtopicProgress.lastViewedAt).toLocaleString()}`
                : null
        : null;

    const postToSubtopicProgress = (action: 'start' | 'complete', topicIndex: number, subtopicIndex: number, options: { preserveActive?: boolean } = {}) => {
        if (pendingAction) {
            return;
        }

        const topic = topics[topicIndex];
        if (!topic) return;

        const endpoint =
            action === 'start'
                ? `/academy/my-enrollments/${enrollment.id}/topics/${topic.order}/subtopics/${subtopicIndex}/start`
                : `/academy/my-enrollments/${enrollment.id}/topics/${topic.order}/subtopics/${subtopicIndex}/complete`;

        setPendingAction(action);
        router.post(
            endpoint,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setPendingAction(null),
                onSuccess: () => {
                    // Always mark as initialized to prevent useEffect from resetting
                    setInitialized(true);
                    if (options.preserveActive) {
                        // Keep current active topic/subtopic - already set before API call
                    } else {
                        // Move to next incomplete subtopic or next topic
                        const nextSubtopic = findNextIncompleteSubtopic(topicIndex, subtopicIndex);
                        if (nextSubtopic) {
                            setActiveTopicIndex(nextSubtopic.topicIndex);
                            setActiveSubtopicIndex(nextSubtopic.subtopicIndex);
                        }
                    }
                },
            },
        );
    };

    const findNextIncompleteSubtopic = (startTopicIndex: number, startSubtopicIndex: number) => {
        // Check remaining subtopics in current topic
        const currentTopic = topics[startTopicIndex];
        if (currentTopic) {
            for (let sIdx = startSubtopicIndex + 1; sIdx < (currentTopic.subtopics?.length || 0); sIdx++) {
                const progress = currentTopic.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === sIdx);
                if (!progress || progress.status !== 'completed') {
                    return { topicIndex: startTopicIndex, subtopicIndex: sIdx };
                }
            }
        }

        // Check next topics
        for (let tIdx = startTopicIndex + 1; tIdx < topics.length; tIdx++) {
            const topic = topics[tIdx];
            const subtopics = topic.subtopics || [];
            for (let sIdx = 0; sIdx < subtopics.length; sIdx++) {
                const progress = topic.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === sIdx);
                if (!progress || progress.status !== 'completed') {
                    return { topicIndex: tIdx, subtopicIndex: sIdx };
                }
            }
        }

        return null;
    };

    const handleTopicSelect = (topicIndex: number) => {
        if (topicIndex < 0 || topicIndex >= topics.length) {
            return;
        }

        setActiveTopicIndex(topicIndex);
        // Reset to first subtopic when selecting a topic
        setActiveSubtopicIndex(0);
    };

    const handleSubtopicSelect = (topicIndex: number, subtopicIndex: number) => {
        if (topicIndex < 0 || topicIndex >= topics.length) {
            return;
        }

        const topic = topics[topicIndex];
        if (!topic || subtopicIndex < 0 || subtopicIndex >= (topic.subtopics?.length || 0)) {
            return;
        }

        // Set state immediately (before API call)
        setActiveTopicIndex(topicIndex);
        setActiveSubtopicIndex(subtopicIndex);
        setInitialized(true); // Mark as initialized so useEffect doesn't reset it

        // Auto-start subtopic if not started (this will trigger an API call)
        if (!contentLocked) {
            const progress = topic.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === subtopicIndex);
            if (!progress || progress.status === 'not_started') {
                postToSubtopicProgress('start', topicIndex, subtopicIndex, { preserveActive: true });
            }
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
                    <CardContent className="space-y-4 px-5 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2 flex-1 min-w-0">
                                <h1 className="text-xl font-semibold text-slate-900">{enrollment.course?.title ?? 'Course removed'}</h1>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    {enrollment.course?.program?.name ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium">
                                            <Sparkles className="h-3 w-3 text-primary" />
                                            {enrollment.course?.program?.name}
                                        </span>
                                    ) : null}
                                    {enrollment.course?.duration ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium">
                                            <Clock className="h-3 w-3 text-primary" />
                                            {enrollment.course?.duration}
                                        </span>
                                    ) : null}
                                    {enrollment.course?.grade ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-primary">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            Grade: {enrollment.course?.grade}
                                        </span>
                                    ) : null}
                                    <span className="text-slate-400">·</span>
                                    <span className="text-slate-500">
                                        {enrollmentDate ? formatDistanceToNow(enrollmentDate, { addSuffix: true }) : 'Recently enrolled'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {enrollment.paymentVerified ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                        <BookOpen className="h-3 w-3" />
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {contentLocked ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                <p className="font-semibold">Content locked</p>
                                <p className="mt-1 text-xs">{lockReason}</p>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {!contentLocked && isSelfPaced && progressSummary && topicCount > 0 ? (
                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-slate-900">{percentComplete}%</span>
                                    <span className="text-xs text-slate-500">
                                        {progressSummary.completedCount} / {subtopicCount} subtopics
                                    </span>
                                </div>
                                <div className="h-2 flex-1 min-w-[120px] max-w-xs overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${percentComplete}%` }}
                                    />
                                </div>
                            </div>
                            {isCourseComplete ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Completed
                                </span>
                            ) : progressSummary.nextTopic ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    Next: {progressSummary.nextTopic.title}
                                </span>
                            ) : null}
                        </CardContent>
                    </Card>
                ) : null}

                {isCourseComplete && isSelfPaced && !contentLocked && (
                    <Card className="rounded-xl border border-primary/20 bg-primary/5 shadow-md overflow-hidden">
                        <CardContent className="p-8 text-center space-y-4">
                            <Sparkles className="h-12 w-12 text-primary mx-auto" />
                            <h2 className="text-xl font-bold text-slate-900">Assessment Ready!</h2>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">
                                You've finished all topics! Ready to test your knowledge? Take the final assessment to complete the course.
                            </p>
                            <Button 
                                onClick={() => router.visit(`/academy/courses/${enrollment.course?.id}/quiz`)}
                                className="h-12 px-10 rounded-full font-bold shadow-lg shadow-primary/20"
                            >
                                Start Final Quiz
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {isSelfPaced ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
                            <CardContent className="space-y-4 px-4 py-4">
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

                                <div className="space-y-3">
                                    {topics.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-xs text-slate-500">
                                            Course topics will appear here once published.
                                        </div>
                                    ) : (
                                        topics.map((topic, topicIndex) => {
                                            const isTopicActive = topicIndex === activeTopicIndex;
                                            const subtopics = topic.subtopics || [];

                                            return (
                                                <div key={topic.id} className="space-y-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTopicSelect(topicIndex)}
                                                        className={cn(
                                                            'w-full rounded-lg border px-3 py-2.5 text-left transition',
                                                            isTopicActive
                                                                ? 'border-primary/40 bg-primary/10 text-primary'
                                                                : 'border-slate-200 hover:border-primary/30 hover:bg-primary/5',
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-semibold">{topic.title}</span>
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
                                                        </div>
                                                    </button>

                                                    {isTopicActive && subtopics.length > 0 && (
                                                        <div className="ml-2 space-y-1 border-l-2 border-primary/20 pl-3">
                                                            {subtopics.map((subtopic, subtopicIndex) => {
                                                                const subtopicName = typeof subtopic === 'string' ? subtopic : subtopic.name;
                                                                const subtopicHours = typeof subtopic === 'string' ? null : subtopic.hours;
                                                                const isSubtopicActive = topicIndex === activeTopicIndex && subtopicIndex === activeSubtopicIndex;
                                                                const subtopicProgress = topic.subtopicsProgress?.find((sp: SubtopicProgress) => sp.index === subtopicIndex);
                                                                const subtopicStatus = subtopicProgress?.status ?? 'not_started';

                                                                return (
                                                                    <button
                                                                        key={subtopicIndex}
                                                                        type="button"
                                                                        onClick={() => handleSubtopicSelect(topicIndex, subtopicIndex)}
                                                                        className={cn(
                                                                            'w-full rounded-md border px-2.5 py-2 text-left text-xs transition',
                                                                            isSubtopicActive
                                                                                ? 'border-primary/50 bg-primary/15 text-primary font-medium'
                                                                                : 'border-slate-200 hover:border-primary/30 hover:bg-primary/5',
                                                                            subtopicStatus === 'completed'
                                                                                ? 'border-emerald-200 bg-emerald-50/50'
                                                                                : subtopicStatus === 'in_progress'
                                                                                    ? 'border-amber-200 bg-amber-50/50'
                                                                                    : '',
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <span className="flex-1 truncate">{subtopicName}</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                {subtopicHours !== null && subtopicHours > 0 && (
                                                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                                                        {subtopicHours}h
                                                                                    </span>
                                                                                )}
                                                                                <span
                                                                                    className={cn(
                                                                                        'h-1 w-1 rounded-full',
                                                                                        subtopicStatus === 'completed'
                                                                                            ? 'bg-emerald-500'
                                                                                            : subtopicStatus === 'in_progress'
                                                                                                ? 'bg-amber-500'
                                                                                                : 'bg-slate-300',
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 min-w-0">
                            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                <CardContent className="space-y-5 px-8 py-8">
                                    {currentTopic && currentSubtopicObj ? (
                                        <>
                                            <div className="space-y-3 border-b border-slate-100 pb-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                                            {currentTopic.title} · Subtopic {activeSubtopicIndex + 1}
                                                        </p>
                                                        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">{currentSubtopicObj.name}</h2>
                                                    </div>
                                                    {currentSubtopicObj.hours > 0 && (
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary whitespace-nowrap">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {currentSubtopicObj.hours} {currentSubtopicObj.hours === 1 ? 'hour' : 'hours'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-semibold',
                                                            activeStatusStyle,
                                                        )}
                                                    >
                                                        <ActiveStatusIcon className="h-3 w-3" />
                                                        {topicStatusLabels[activeStatus]}
                                                    </span>
                                                    {lastUpdatedLabel ? (
                                                        <span className="text-[11px] text-slate-500">{lastUpdatedLabel}</span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {contentLocked ? (
                                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-700">
                                                    <p className="font-semibold">Awaiting payment verification</p>
                                                    <p className="mt-1">{lockReason}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <article
                                                        className="prose prose-slate prose-base max-w-none leading-relaxed text-slate-700"
                                                        dangerouslySetInnerHTML={{
                                                            __html: currentSubtopicObj.content || '<p>No written content available yet for this subtopic.</p>',
                                                        }}
                                                    />

                                                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                            {currentSubtopicProgress?.completedAt ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Completed
                                                                </span>
                                                            ) : currentSubtopicProgress?.status === 'in_progress' ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                                                                    <Play className="h-3.5 w-3.5" />
                                                                    In progress
                                                                </span>
                                                            ) : null}
                                                            {lastUpdatedLabel ? <span className="text-[11px]">{lastUpdatedLabel}</span> : null}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="flex items-center gap-2"
                                                                onClick={() => postToSubtopicProgress('start', activeTopicIndex, activeSubtopicIndex, { preserveActive: true })}
                                                                disabled={
                                                                    !currentSubtopicObj ||
                                                                    currentSubtopicProgress?.status === 'in_progress' ||
                                                                    pendingAction !== null
                                                                }
                                                            >
                                                                <Play className="h-4 w-4" />
                                                                Mark in progress
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                                                onClick={() => postToSubtopicProgress('complete', activeTopicIndex, activeSubtopicIndex)}
                                                                disabled={
                                                                    !currentSubtopicObj ||
                                                                    currentSubtopicProgress?.status === 'completed' ||
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
                                            Select a subtopic from the outline to start learning.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {currentTopic && currentTopic.subtopics && currentTopic.subtopics.length > 0 ? (
                                <div className="flex flex-wrap justify-between gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (activeSubtopicIndex > 0) {
                                                handleSubtopicSelect(activeTopicIndex, activeSubtopicIndex - 1);
                                            } else if (activeTopicIndex > 0) {
                                                const prevTopic = topics[activeTopicIndex - 1];
                                                const prevSubtopicCount = prevTopic?.subtopics?.length || 0;
                                                if (prevSubtopicCount > 0) {
                                                    handleSubtopicSelect(activeTopicIndex - 1, prevSubtopicCount - 1);
                                                }
                                            }
                                        }}
                                        disabled={activeTopicIndex === 0 && activeSubtopicIndex === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const currentTopic = topics[activeTopicIndex];
                                            const currentSubtopicCount = currentTopic?.subtopics?.length || 0;
                                            if (activeSubtopicIndex < currentSubtopicCount - 1) {
                                                handleSubtopicSelect(activeTopicIndex, activeSubtopicIndex + 1);
                                            } else if (activeTopicIndex < topics.length - 1) {
                                                handleSubtopicSelect(activeTopicIndex + 1, 0);
                                            }
                                        }}
                                        disabled={
                                            activeTopicIndex >= topics.length - 1 &&
                                            activeSubtopicIndex >= (currentTopic?.subtopics?.length || 0) - 1
                                        }
                                        className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
                                    >
                                        Next subtopic
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
        </StudentDashboardLayout >
    );
}

