import { Head, Link } from '@inertiajs/react';
import AcademyLayout from '@/layouts/academy-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { hexToRgba } from '@/lib/colors';
import { cn, formatCategoryLabel } from '@/lib/utils';
import { ArrowRight, BookOpenCheck, Layers } from 'lucide-react';

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

interface ProgramsProps {
    programs: ProgramResource[];
}

const Programs = ({ programs }: ProgramsProps) => {
    const totalCourses = programs.reduce((sum, program) => sum + (program.courses_count ?? 0), 0);
    const categoryCount = new Set(programs.map((program) => formatCategoryLabel(program.category))).size;

    return (
        <AcademyLayout>
            <Head title="Programs" />

            <section className="relative overflow-hidden border-b py-20 md:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/25 to-background" />
                <div className="absolute -top-24 right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-70" />
                <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl opacity-60" />

                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Guided &amp; Custom Programs
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                            Programs Built Around Student Outcomes
                        </h1>
                        <p className="text-lg text-muted-foreground/90 md:text-xl">
                            Discover curated learning paths designed with our industry experts. Every program blends strategic curriculum,
                            measurable milestones, and real-world application.
                        </p>
                        <div className="mx-auto flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-card/60 px-6 py-4 text-sm backdrop-blur-lg shadow-[0_25px_60px_-35px_rgba(18,40,90,0.65)]">
                            <div className="flex items-center gap-2 text-foreground">
                                <Layers className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{programs.length}</span>
                                <span className="text-muted-foreground/80">Programs</span>
                            </div>
                            <span className="text-muted-foreground/60">•</span>
                            <div className="flex items-center gap-2 text-foreground">
                                <BookOpenCheck className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{totalCourses}</span>
                                <span className="text-muted-foreground/80">Courses</span>
                            </div>
                            <span className="text-muted-foreground/60">•</span>
                            <div className="flex items-center gap-2 text-foreground">
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                                <span className="font-semibold">{categoryCount}</span>
                                <span className="text-muted-foreground/80">Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/15 to-background" />

                <div className="container relative mx-auto px-4">
                    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {programs.map((program) => {
                            const accentColor = program.color ?? '#1d4ed8';
                            const gradientOverlay = `radial-gradient(circle at top, ${hexToRgba(accentColor, 0.35)}, transparent 65%)`;
                            return (
                                <article
                                    key={program.id}
                                    className={cn(
                                        'group relative overflow-hidden rounded-3xl border bg-card/60 p-8 backdrop-blur-xl',
                                        'transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_80px_-45px_rgba(18,40,90,0.75)]',
                                    )}
                                    style={{
                                        borderColor: hexToRgba(accentColor, 0.35),
                                        boxShadow: `0 30px 75px -50px ${hexToRgba(accentColor, 0.6)}`,
                                    }}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                        style={{ background: gradientOverlay }}
                                    />

                                    <div className="relative flex h-full flex-col gap-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <Badge
                                                className="border border-white/15 bg-white/10 text-foreground"
                                                style={{
                                                    color: accentColor,
                                                    borderColor: hexToRgba(accentColor, 0.4),
                                                    background: hexToRgba(accentColor, 0.12),
                                                }}
                                            >
                                                {program.category_label ?? formatCategoryLabel(program.category)}
                                            </Badge>
                                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-muted-foreground/90 backdrop-blur">
                                                <Layers className="h-3.5 w-3.5 text-primary" />
                                                <span>{program.courses_count ?? 0} courses</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-semibold leading-tight text-foreground">{program.name}</h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground/90 line-clamp-4">
                                                {program.description ??
                                                    'This program is curated by Abhidh Academy to drive measurable outcomes for learners.'}
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                                                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                                <span>
                                                    Updated{' '}
                                                    <strong className="font-medium text-foreground">
                                                        {program.updated_at
                                                            ? new Date(program.updated_at).toLocaleDateString(undefined, {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                              })
                                                            : 'recently'}
                                                    </strong>
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                className="group/button relative w-full overflow-hidden rounded-full px-6 py-5 text-sm font-semibold text-primary-foreground shadow-[0_20px_45px_-25px_rgba(18,40,90,0.7)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-inherit focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.9)}, ${hexToRgba(accentColor, 0.75)})`,
                                                }}
                                                asChild
                                            >
                                                <Link href={`/academy/contact?program=${program.id}`}>
                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                        Collaborate on this program
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                                                    </span>
                                                    <span
                                                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
                                                        style={{ background: hexToRgba(accentColor, 0.35) }}
                                                    />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {!programs.length ? (
                        <div className="mt-16 text-center text-muted-foreground">There are no programs published yet. Please check back soon.</div>
                    ) : null}
                </div>
            </section>
        </AcademyLayout>
    );
};

export default Programs;

