import { Head } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { CourseCard, CourseResource as CourseCardResource } from '@/components/academy/course-card';
import { BookOpen, Layers, PlayCircle } from 'lucide-react';

interface SelfPacedProps {
    courses: CourseCardResource[];
}

const SelfPacedCourses = ({ courses }: SelfPacedProps) => {
    const totalTopics = courses.reduce((count, course) => count + (course.topics?.length ?? 0), 0);
    const programCount = new Set(courses.map((course) => course.program?.name).filter(Boolean)).size;

    return (
        <AcademyLayout>
            <Head title="Self-Paced Courses" />

            <section className="relative overflow-hidden border-b py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            On-demand Masterclasses
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Learn Smart. Learn Self-Paced.</h1>
                        <p className="text-lg text-muted-foreground/90 md:text-xl">
                            Gain access to Abhidh Academy&apos;s ever-growing library of immersive self-paced courses. Each track includes structured
                            milestones, bite-sized sessions, and practice activities designed for busy professionals.
                        </p>

                        <div className="mx-auto flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-card/60 px-6 py-4 text-sm backdrop-blur-lg shadow-[0_25px_60px_-35px_rgba(18,40,90,0.65)]">
                            <div className="flex items-center gap-2 text-foreground">
                                <PlayCircle className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{courses.length}</span>
                                <span className="text-muted-foreground/80">Courses</span>
                            </div>
                            <span className="text-muted-foreground/60">•</span>
                            <div className="flex items-center gap-2 text-foreground">
                                <Layers className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{totalTopics}</span>
                                <span className="text-muted-foreground/80">Topics</span>
                            </div>
                            <span className="text-muted-foreground/60">•</span>
                            <div className="flex items-center gap-2 text-foreground">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{programCount}</span>
                                <span className="text-muted-foreground/80">Programs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/15 to-background" />

                <div className="container relative mx-auto px-4">
                    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    {!courses.length ? (
                        <div className="mt-16 text-center text-muted-foreground">
                            Self-paced courses will be published here soon. Stay tuned!
                        </div>
                    ) : null}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default SelfPacedCourses;

