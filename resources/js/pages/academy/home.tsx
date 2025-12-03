import { Head, Link } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard, CourseResource as CourseCardResource } from '@/components/academy/course-card';
import { hexToRgba } from '@/lib/colors';
import { cn, stripHtml } from '@/lib/utils';
import { Award, Briefcase, CheckCircle, Clock, GraduationCap, Laptop, Target, Users, ChevronLeft, ChevronRight, ArrowRight, Layers } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type ProgramResource = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    category_label?: string;
    color: string | null;
    courses_count: number;
    updated_at?: string | null;
};

type CourseResource = CourseCardResource;

type BlogResource = {
    id: number;
    title: string;
    slug: string;
    option: string | null;
    content: string | null;
    image_url: string | null;
    published_at: string | null;
};

type TrainerResource = {
    id: number;
    name: string;
    expertise: string | null;
    years_of_experience: number | null;
    photo_url: string | null;
};

interface HomeProps {
    programs: ProgramResource[];
    featuredCourses: CourseResource[];
    blogPosts: BlogResource[];
    trainers: TrainerResource[];
}

const stats = [
    { icon: GraduationCap, value: '500+', label: 'Students Trained' },
    { icon: Award, value: '100+', label: 'Trainings Available' },
    { icon: Briefcase, value: '10+', label: 'Corporate Clients' },
    { icon: Target, value: '95%', label: 'Success Rate' },
];

const Home = ({ programs, featuredCourses, blogPosts, trainers }: HomeProps) => {
    return (
        <AcademyLayout>
            <Head title="Home" />

            <section className="relative min-h-screen overflow-hidden bg-background">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-secondary/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,hsla(226,75%,80%,0.18),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,hsla(226,65%,75%,0.12),transparent_60%)]" />
                    <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsla(226,70%,70%,0.35),transparent_65%)] blur-3xl opacity-80" />
                    <div className="absolute bottom-0 left-[-15%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,hsla(226,62%,68%,0.28),transparent_65%)] blur-3xl opacity-70" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,hsla(226,70%,94%,0.5)_0%,transparent_60%)]" />
                </div>

                <div className="relative container mx-auto px-6 py-20 lg:py-24">
                    <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                        <div className="space-y-12 lg:pr-10">
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-white/85 px-5 py-2.5 shadow-[0_12px_35px_-24px_rgba(18,40,90,0.45)] backdrop-blur transition hover:shadow-[0_18px_45px_-24px_rgba(18,40,90,0.55)]">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Nepal&apos;s Leading Professional Academy</span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                                    Master Skills That
                                    <span className="mt-3 block text-primary/70">
                                        Transform Careers
                                    </span>
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                                    Join <span className="font-bold text-primary">500+ successful professionals</span> who accelerated their careers with
                                    industry-certified programs in technology, business, and soft skills.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Button
                                    size="lg"
                                className="group relative h-auto overflow-hidden rounded-full bg-primary px-9 py-6 text-base font-semibold text-primary-foreground shadow-[0_20px_45px_-22px_rgba(18,40,90,0.45)] transition hover:bg-primary/90 hover:shadow-[0_26px_55px_-28px_rgba(18,40,90,0.55)]"
                                    asChild
                                >
                                    <Link href="/academy/programs">
                                        Explore Programs
                                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-auto rounded-full border-2 border-primary/30 px-10 py-6 text-base font-semibold text-primary transition hover:border-primary hover:text-primary/80"
                                    asChild
                                >
                                    <Link href="/academy/contact">Talk to an Advisor</Link>
                                </Button>
                            </div>

                            <Card className="max-w-2xl border border-white/70 bg-white/85 shadow-[0_28px_70px_-42px_rgba(18,40,90,0.45)] backdrop-blur-lg">
                                <CardContent className="grid gap-6 px-6 py-6 sm:grid-cols-2">
                                    {stats.map(({ icon: Icon, value, label }) => (
                                        <div key={label} className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-foreground">{value}</p>
                                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="relative lg:ml-auto lg:mt-8">
                            <div className="pointer-events-none absolute -top-16 right-4 hidden h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(45,106,255,0.35),transparent_65%)] blur-2xl lg:block" />
                            <Card className="relative overflow-hidden border border-white/60 bg-white/90 shadow-[0_30px_75px_-40px_rgba(18,40,90,0.45)] backdrop-blur-xl transition hover:shadow-[0_35px_90px_-45px_rgba(18,40,90,0.55)]">
                                <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary via-accent to-primary/80" />
                                <CardContent className="relative flex flex-col gap-6 p-9">
                                    <div className="space-y-4 text-left">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                                            Certified Mentors
                                        </span>
                                        <h3 className="text-2xl font-semibold text-foreground">Guided cohorts launching every month</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground/90">
                                            Access instructor-led sessions, interactive cohort discussions, and real-world capstone projects curated with
                                            industry partners.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Corporate Trainings', value: '12+' },
                                            { label: 'Students Trainings', value: '10+' },
                                            { label: 'Self Paced Learnings', value: '10+' },
                                            { label: 'Career counselling', value: 'Regular' },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-primary/10 bg-linear-to-br from-primary/10 via-background to-white/75 p-4 shadow-inner"
                                            >
                                                <div className="text-xl font-bold text-foreground">{item.value}</div>
                                                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">{item.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y bg-secondary/30 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Choose Your Learning Path</h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Select the learning style that fits your schedule and goals
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <Card className="group overflow-hidden border-2 transition hover:-translate-y-2 hover:border-accent hover:shadow-2xl hover:shadow-accent/10">
                            <CardContent className="p-8">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Users className="h-8 w-8" />
                                </div>
                                <h3 className="mb-4 text-2xl font-bold">In Person Training</h3>
                                <p className="mb-6 text-muted-foreground">
                                    Instructor-led classroom training with hands-on practice, live Q&amp;A, and peer collaboration. Perfect for
                                    structured learning with expert guidance.
                                </p>
                                <ul className="mb-6 space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Live interactive sessions
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Expert instructors
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Certification included
                                    </li>
                                </ul>
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                                    <Link href="/academy/programs">Explore Guided Courses</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="group overflow-hidden border-2 transition hover:-translate-y-2 hover:border-accent hover:shadow-2xl hover:shadow-accent/10">
                            <CardContent className="p-8">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Laptop className="h-8 w-8" />
                                </div>
                                <h3 className="mb-4 text-2xl font-bold">Self-Paced Learning</h3>
                                <p className="mb-6 text-muted-foreground">
                                    Learn at your own pace with on-demand video lessons, downloadable resources, and lifetime access. Ideal for busy
                                    professionals.
                                </p>
                                <ul className="mb-6 space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Learn anytime, anywhere
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Lifetime course access
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        Self-assessment tools
                                    </li>
                                </ul>
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                                    <Link href="/academy/self-paced-courses">Browse Self-Paced Courses</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="bg-background py-16 md:py-24">
                <div className="container mx-auto space-y-10 px-4">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-3xl font-bold md:text-4xl">Featured Courses</h2>
                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Priority picks curated by our academic council across guided and self-paced experiences.
                            </p>
                        </div>
                        <Link
                            href="/academy/courses"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 hover:text-primary/80"
                        >
                            Browse all courses →
                        </Link>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {featuredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    {!featuredCourses.length ? (
                        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-10 text-center text-muted-foreground">
                            Featured courses will appear here once they are published.
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="border-t bg-background py-20">
                <div className="container mx-auto space-y-10 px-4">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-3xl font-bold md:text-4xl">Available Programs</h2>
                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Multi-course journeys designed to deliver deep capability uplift for individuals and teams.
                            </p>
                        </div>
                        <Link
                            href="/academy/programs"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 hover:text-primary/80"
                        >
                            View all programs →
                        </Link>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {programs.map((program) => {
                            const accent = program.color ?? '#1d4ed8';
                            const overlay = `radial-gradient(circle at top, ${hexToRgba(accent, 0.35)}, transparent 65%)`;
                            return (
                                <Card
                                    key={program.id}
                                    className="group relative overflow-hidden border bg-card/60 backdrop-blur-xl transition hover:-translate-y-2 hover:shadow-[0_35px_80px_-45px_rgba(18,40,90,0.75)]"
                                    style={{
                                        borderColor: hexToRgba(accent, 0.35),
                                        boxShadow: `0 30px 75px -50px ${hexToRgba(accent, 0.6)}`,
                                    }}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                                        style={{ background: overlay }}
                                    />
                                    <CardContent className="relative flex h-full flex-col space-y-5 p-8">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <span
                                                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground"
                                                style={{
                                                    color: accent,
                                                    borderColor: hexToRgba(accent, 0.3),
                                                    background: hexToRgba(accent, 0.12),
                                                }}
                                            >
                                                {program.category_label ?? program.category ?? 'Program'}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-muted-foreground/90">
                                                <Layers className="h-3.5 w-3.5 text-primary" />
                                                {program.courses_count} courses
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-semibold text-foreground">{program.name}</h3>
                                            <p className="text-sm text-muted-foreground/90 line-clamp-4">
                                                {program.description ??
                                                    'This Abhidh Academy program brings together the right mentors, resources, and milestones for sustainable growth.'}
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-2">
                                            <Button
                                                variant="ghost"
                                                className="group/button relative w-full overflow-hidden rounded-full px-6 py-5 text-sm font-semibold text-primary-foreground shadow-[0_20px_45px_-25px_rgba(18,40,90,0.7)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-inherit focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${hexToRgba(accent, 0.9)}, ${hexToRgba(accent, 0.75)})`,
                                                }}
                                                asChild
                                            >
                                                <Link href={`/academy/courses?program_id=${program.id}`}>
                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                        View Courses
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                                                    </span>
                                                    <span
                                                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
                                                        style={{ background: hexToRgba(accent, 0.35) }}
                                                    />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-secondary/25 py-20">
                <div className="container mx-auto space-y-10 px-4">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-3xl font-bold md:text-4xl">Meet the Experts</h2>
                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                The facilitators and mentors who guide our learners through hands-on outcomes.
                            </p>
                        </div>
                        <Link
                            href="/academy/contact"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 hover:text-primary/80"
                        >
                            Work with us →
                        </Link>
                    </div>

                    <div className="relative">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                    spaceBetween: 24,
                                },
                                1024: {
                                    slidesPerView: 3,
                                    spaceBetween: 32,
                                },
                                1280: {
                                    slidesPerView: 4,
                                    spaceBetween: 32,
                                },
                            }}
                            navigation={{
                                nextEl: '.swiper-button-next-trainers',
                                prevEl: '.swiper-button-prev-trainers',
                            }}
                            pagination={{
                                clickable: true,
                                el: '.swiper-pagination-trainers',
                            }}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            loop={trainers.length > 4}
                            className="!pb-12"
                        >
                            {trainers.map((trainer) => (
                                <SwiperSlide key={trainer.id}>
                                    <Card className="group overflow-hidden border border-white/10 bg-card/60 text-center backdrop-blur transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10 h-full">
                                        <div className="relative h-80 overflow-hidden">
                                            {trainer.photo_url ? (
                                                <img src={trainer.photo_url} alt={trainer.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 via-accent/15 to-background text-3xl font-semibold text-primary">
                                                    {trainer.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                                        </div>
                                        <CardContent className="space-y-2 p-6">
                                            <h3 className="text-xl font-semibold text-foreground">{trainer.name}</h3>
                                            <p className="text-sm font-medium text-primary">{trainer.expertise ?? 'Creative Specialist'}</p>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                {trainer.years_of_experience ? `${trainer.years_of_experience}+ years of experience` : 'Experienced facilitator'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {/* Navigation buttons */}
                        <button className="swiper-button-prev-trainers absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors shadow-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="swiper-button-next-trainers absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors shadow-lg">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Pagination */}
                        <div className="swiper-pagination-trainers mt-8 flex justify-center gap-2" />
                    </div>
                </div>
            </section>

            <section className="border-t bg-background py-20">
                <div className="container mx-auto space-y-10 px-4">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-3xl font-bold md:text-4xl">Latest Insights</h2>
                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Articles, frameworks, and reflections from Abhidh Academy mentors.
                            </p>
                        </div>
                        <Link
                            href="/academy/blog"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 hover:text-primary/80"
                        >
                            View all articles →
                        </Link>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.map((post) => (
                            <Card
                                key={post.id}
                                className="group flex h-full flex-col overflow-hidden border border-white/10 bg-card/60 backdrop-blur transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 via-accent/10 to-background text-lg font-semibold text-primary">
                                            Abhidh Academy
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-primary/35 via-transparent to-transparent opacity-80" />
                                    <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
                                        {post.option ?? 'Insights'}
                                    </div>
                                </div>
                                <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {post.published_at
                                            ? new Date(post.published_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : 'Unpublished'}
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground transition group-hover:text-primary">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">{stripHtml(post.content)}</p>
                                    <div className="mt-auto">
                                        <Link
                                            href={`/academy/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 hover:text-primary/80"
                                        >
                                            Read article →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </AcademyLayout>
    );
};

export default Home;

