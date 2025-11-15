import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    Layers,
    ShieldCheck,
    Upload,
} from 'lucide-react';

type CourseProgram = {
    id: number;
    name: string;
    category_label?: string | null;
    color?: string | null;
};

type CourseTopic = {
    label: string | null;
    duration: string | null;
    subtopics?: string[];
};

type CourseSyllabusRow = {
    session?: number;
    course_topic?: string;
    learnings?: string[];
    outcomes?: string[];
    hours?: number | string;
};

type CourseEnrollment = {
    id: number;
    status: string;
    is_paid: boolean;
    payment_verified: boolean;
    payment_verified_at: string | null;
    payment_screenshot_url: string | null;
    submitted_at: string | null;
};

type CourseDetailProps = {
    course: {
        id: number;
        title: string;
        description: string | null;
        duration: string | null;
        course_type: 'guided' | 'self_paced' | string;
        course_type_label: string;
        featured: boolean;
        program: CourseProgram | null;
        key_learning_objectives: string[];
        topics: CourseTopic[];
        syllabus: CourseSyllabusRow[];
        enrollment: CourseEnrollment | null;
    };
};

const EnrollmentStatusNotice = ({ enrollment }: { enrollment: CourseEnrollment | null }) => {
    if (!enrollment) {
        return null;
    }

    if (enrollment.payment_verified) {
        return (
            <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/80 p-4 text-sm text-emerald-600 shadow-sm">
                <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-5 w-5" />
                    Payment verified! You are enrolled in this course.
                </div>
                {enrollment.payment_verified_at ? (
                    <p className="mt-2 text-xs text-emerald-700">
                        Verified on {new Date(enrollment.payment_verified_at).toLocaleString()}
                    </p>
                ) : null}
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 text-sm text-amber-700 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
                <ImageIcon className="h-5 w-5" />
                Payment screenshot submitted. Awaiting verification.
            </div>
            <p className="mt-2 text-xs">
                Our team will review your submission and notify you once your enrollment is confirmed.
            </p>
        </div>
    );
};

const CourseShow = ({ course }: CourseDetailProps) => {
    const page = usePage<{
        auth?: { user?: { id: number; name: string } };
        flash?: { success?: string; error?: string };
    }>();
    const { auth, flash } = page.props;

    const isSelfPaced = course.course_type === 'self_paced';
    const isAuthenticated = Boolean(auth?.user);

    const searchParams = useMemo(() => {
        const [, query = ''] = (page.url ?? '').split('?');
        return new URLSearchParams(query);
    }, [page.url]);

    const [showForm, setShowForm] = useState(() => searchParams.get('enroll') === '1');

    useEffect(() => {
        if (searchParams.get('enroll') === '1') {
            setShowForm(true);
        }
    }, [searchParams]);

    const form = useForm<{
        course_id: number;
        payment_screenshot: File | null;
    }>({
        course_id: course.id,
        payment_screenshot: null,
    });

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('payment_screenshot', file);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/academy/enrollments', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('payment_screenshot');
            },
        });
    };

    const formattedTopics = useMemo(
        () =>
            Array.isArray(course.topics)
                ? course.topics
                      .map((topic, index) => ({
                          id: `${course.id}-topic-${index}`,
                          label: topic?.label ?? null,
                          subtopics: topic?.subtopics ?? [],
                          duration: topic?.duration ?? null,
                      }))
                      .filter((topic) => Boolean(topic.label || topic.subtopics.length || topic.duration))
                : [],
        [course.id, course.topics],
    );

    const syllabusEntries = useMemo(
        () =>
            Array.isArray(course.syllabus)
                ? course.syllabus.map((row, index) => ({
                      id: `${course.id}-session-${index}`,
                      session: row.session ?? index + 1,
                      course_topic: row.course_topic ?? '',
                      learnings: Array.isArray(row.learnings) ? row.learnings.filter(Boolean) : [],
                      outcomes: Array.isArray(row.outcomes) ? row.outcomes.filter(Boolean) : [],
                      hours: row.hours ?? null,
                  }))
                : [],
        [course.id, course.syllabus],
    );

    const loginRedirect = `/login?redirect=${encodeURIComponent(`/academy/courses/${course.id}?enroll=1`)}`;

    const enrollButtonLabel = course.enrollment ? 'Update payment screenshot' : 'Enroll now';

    return (
        <AcademyLayout>
            <Head title={`${course.title} - Abhidh Academy`} />

            <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/40">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(226,90%,90%,0.6),transparent_60%)]" />
                    <div className="absolute inset-y-0 right-[-20%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,hsla(210,95%,85%,0.45),transparent_65%)] blur-3xl opacity-80" />
                    <div className="absolute bottom-[-35%] left-[-15%] h-[65%] w-[55%] rounded-full bg-[radial-gradient(circle,hsla(226,75%,80%,0.35),transparent_65%)] blur-3xl" />
                </div>

                <div className="container mx-auto px-4 py-16 md:py-20">
                    <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="bg-primary/10 text-primary">
                                    <Layers className="mr-2 h-3.5 w-3.5" />
                                    {course.course_type_label}
                                </Badge>
                                {course.program ? (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        {course.program.name}
                                    </span>
                                ) : null}
                                {course.program?.category_label ? (
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                        {course.program.category_label}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="text-4xl font-black text-foreground md:text-5xl lg:text-6xl">{course.title}</h1>
                            {course.description ? (
                                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">{course.description}</p>
                            ) : null}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {course.duration ? (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <span>{course.duration}</span>
                                    </div>
                                ) : null}
                                {course.key_learning_objectives.length ? (
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        <span>{course.key_learning_objectives.length} learning goals</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-primary/10 bg-white/85 p-6 shadow-[0_18px_60px_-32px_rgba(18,40,90,0.45)] backdrop-blur-xl">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {isSelfPaced
                                            ? 'Upload your payment screenshot to trigger the verification process. Our team validates submissions within 24 hours.'
                                            : 'Submit your interest and our success team will reach out with the next cohort schedule and enrollment steps.'}
                                    </p>
                                </div>

                                {flash?.success ? (
                                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                                        {flash.success}
                                    </div>
                                ) : null}
                                {flash?.error ? (
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {flash.error}
                                    </div>
                                ) : null}

                                <EnrollmentStatusNotice enrollment={course.enrollment} />

                                <p className="text-sm text-muted-foreground">
                                    Upload a payment screenshot to confirm your seat. Our team will verify within 24 hours and unlock your course access.
                                </p>

                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        <Button
                                            type="button"
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                            onClick={() => setShowForm(true)}
                                        >
                                            {enrollButtonLabel}
                                        </Button>

                                        {showForm ? (
                                            <form onSubmit={submit} className="space-y-4" id="enroll-form">
                                                <input type="hidden" name="course_id" value={course.id} />
                                                <div className="space-y-2">
                                                    <Label htmlFor="payment_screenshot" className="font-medium text-sm">
                                                        Payment Screenshot
                                                    </Label>
                                                    <Input
                                                        id="payment_screenshot"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className={cn(
                                                            'cursor-pointer',
                                                            form.errors.payment_screenshot
                                                                ? 'border-destructive focus-visible:ring-destructive'
                                                                : '',
                                                        )}
                                                    />
                                                    {form.errors.payment_screenshot ? (
                                                        <p className="text-xs text-destructive">{form.errors.payment_screenshot}</p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">
                                                            Accepted formats: JPG, PNG, GIF, WEBP. Maximum size 5MB.
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                                    disabled={form.processing}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {form.processing ? 'Submitting...' : 'Submit Payment Screenshot'}
                                                </Button>
                                            </form>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Please sign in to continue with enrollment. You can create an account in less than a minute.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <Link href={loginRedirect}>
                                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Log in</Button>
                                            </Link>
                                            <Link href="/register">
                                                <Button
                                                    variant="outline"
                                                    className="border-primary/30 text-primary hover:border-primary hover:text-primary"
                                                >
                                                    Create Account
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {course.enrollment?.payment_screenshot_url ? (
                                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-xs text-muted-foreground">
                                        <p className="font-medium text-primary">Latest submission</p>
                                        <p className="mt-1">
                                            Uploaded on{' '}
                                            {course.enrollment.submitted_at
                                                ? new Date(course.enrollment.submitted_at).toLocaleString()
                                                : '—'}
                                        </p>
                                        <a
                                            href={course.enrollment.payment_screenshot_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-2 text-primary underline"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                            View uploaded screenshot
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y bg-white/90 py-14">
                <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-8">
                        {course.key_learning_objectives.length ? (
                            <Card className="border border-primary/10">
                                <CardHeader>
                                    <CardTitle>What you&apos;ll learn</CardTitle>
                                    <CardDescription>
                                        Designed by Abhidh mentors to deliver tangible progress throughout the course.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3 sm:grid-cols-2">
                                    {course.key_learning_objectives.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null}

                        {isSelfPaced && formattedTopics.length ? (
                            <Card className="border border-primary/10">
                                <CardHeader>
                                    <CardTitle>Included modules</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {formattedTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-semibold">{topic.label}</span>
                                                {topic.duration ? <span className="text-xs text-muted-foreground">{topic.duration}</span> : null}
                                            </div>
                                            {topic.subtopics?.length ? (
                                                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                    {topic.subtopics.filter(Boolean).map((subtopic, subIndex) => (
                                                        <li key={`${topic.id}-subtopic-${subIndex}`} className="flex items-start gap-2">
                                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                                            {subtopic}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null}

                        {!isSelfPaced && syllabusEntries.length ? (
                            <Card className="border border-primary/10">
                                <CardHeader>
                                    <CardTitle>Course syllabus</CardTitle>
                                    <CardDescription>Every session is structured with live instruction and guided activities.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {syllabusEntries.map((session) => (
                                        <div key={session.id} className="rounded-xl border border-primary/10 bg-primary/5 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="text-sm font-semibold text-primary">
                                                    Session {session.session}
                                                </div>
                                                {session.hours ? (
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs text-primary">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {session.hours} hrs
                                                    </div>
                                                ) : null}
                                            </div>
                                            <h3 className="mt-2 text-lg font-semibold text-foreground">{session.course_topic}</h3>

                                            {session.learnings.length ? (
                                                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                    <p className="font-semibold text-foreground">Key learnings</p>
                                                    <ul className="space-y-1">
                                                        {session.learnings.map((learning, learningIndex) => (
                                                            <li key={`${session.id}-learning-${learningIndex}`} className="flex items-start gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                                                {learning}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}

                                            {session.outcomes.length ? (
                                                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                    <p className="font-semibold text-foreground">Expected outcomes</p>
                                                    <ul className="space-y-1">
                                                        {session.outcomes.map((outcome, outcomeIndex) => (
                                                            <li key={`${session.id}-outcome-${outcomeIndex}`} className="flex items-start gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                                                {outcome}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-primary/10">
                            <CardHeader>
                                <CardTitle>Why learners pick this track</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                                    <span>Structured journey designed by Abhidh mentors.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                                    <span>{isSelfPaced ? 'Lifetime access to modules and future updates.' : 'Live facilitation with mentor feedback.'}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                                    <span>Completion certificate upon satisfying the course outcomes.</span>
                                </div>
                            </CardContent>
                        </Card>

                        {course.program ? (
                            <Card className="border border-primary/10 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-primary">Part of {course.program.name}</CardTitle>
                                    <CardDescription>
                                        A curated experience within the {course.program.name} program, combining guided mentorship and industry-ready
                                        projects.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : null}

                        {!isSelfPaced ? (
                            <Card className="border border-primary/10">
                                <CardHeader>
                                    <CardTitle>Need schedule & pricing?</CardTitle>
                                    <CardDescription>
                                        Share your requirements and we&apos;ll customise the cohort timeline for your team or institution.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                                        <Link href={`/academy/contact?course=${course.id}`}>Talk to our success team</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </div>
            </section>
        </AcademyLayout>
    );
};

export default CourseShow;

