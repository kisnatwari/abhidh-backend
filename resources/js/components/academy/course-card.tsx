import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { hexToRgba } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Clock, Sparkles } from 'lucide-react';

export type CourseResource = {
    id: number;
    title: string;
    description: string | null;
    duration: string | null;
    course_type: string;
    course_type_label: string;
    featured: boolean;
    program: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    topics: {
        label: string | null;
        duration: string | null;
        subtopics?: string[];
    }[];
    key_learning_objectives: string[];
};

interface CourseCardProps {
    course: CourseResource;
    className?: string;
    showProgramBadge?: boolean;
}

const defaultHighlights = ['Expert mentors', 'Live support', 'Certification included'];

export const CourseCard = ({ course, className, showProgramBadge = true }: CourseCardProps) => {
    const accent = course.program?.color ?? '#2563eb';
    const isSelfPaced = course.course_type === 'self_paced';

    const topicHighlights = isSelfPaced
        ? course.topics
              .map((topic) => topic.label)
              .filter((label): label is string => Boolean(label))
        : course.key_learning_objectives;

    const highlights = (topicHighlights.length > 0 ? topicHighlights : defaultHighlights).slice(0, 3);

    return (
        <Card
            className={cn(
                'group relative overflow-hidden border border-primary/10 bg-white shadow-[0_16px_45px_-28px_rgba(18,40,90,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(18,40,90,0.45)]',
                className,
            )}
            style={{
                borderColor: hexToRgba(accent, 0.22),
            }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(circle at 18% -8%, ${hexToRgba(accent, 0.22)}, transparent 65%)`,
                }}
            />
            <CardContent className="relative flex h-full flex-col gap-5 p-8">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                        <Badge className="border border-white/20 bg-white/10 text-primary">{course.course_type_label}</Badge>
                        {showProgramBadge && course.program ? (
                            <span
                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                                style={{
                                    borderColor: hexToRgba(accent, 0.35),
                                    color: accent,
                                    backgroundColor: hexToRgba(accent, 0.1),
                                }}
                            >
                                {course.program.name}
                            </span>
                        ) : null}
                    </div>
                    {course.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/50 bg-yellow-200/25 px-3 py-1 text-[11px] font-semibold text-yellow-900/80 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Featured
                        </span>
                    ) : null}
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">{course.title}</h3>
                        <p className="text-sm text-muted-foreground/90 line-clamp-3">
                            {course.description ??
                                'A curated Abhidh Academy experience crafted with real-world projects and mentor feedback every step of the way.'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/75">
                            {isSelfPaced ? 'Included modules' : 'Key outcomes'}
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground/85">
                            {highlights.map((highlight, index) => (
                                <li key={`${course.id}-highlight-${index}`} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-4 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                        {course.duration ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 font-medium text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                {course.duration}
                            </span>
                        ) : (
                            <span />
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 font-medium text-primary/80">
                            {isSelfPaced ? 'Self-paced access' : 'Guided cohort'}
                        </span>
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <Link href={`/academy/courses/${course.id}`}>
                            View course
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

