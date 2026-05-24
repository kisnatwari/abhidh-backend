import StudentDashboardLayout from '@/layouts/student-dashboard-layout';
import QuizController from '@/actions/App/Http/Controllers/User/QuizController';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, Trophy, RefreshCcw, Home, Award, Download } from 'lucide-react';

interface PageProps {
    attempt: any;
    course: any;
    passed: boolean;
    pass_mark: number;
    enrollment_id?: number;
    certificate?: { id: number; certificate_number: string } | null;
}

export default function QuizResult({ attempt, course, passed, pass_mark, enrollment_id, certificate }: PageProps) {
    const score = Math.round(attempt.score_percentage);

    return (
        <StudentDashboardLayout>
            <Head title={`Quiz Result - ${course.title}`} />
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
                <div className="w-full max-w-2xl text-center space-y-8">
                    {/* Status Icon */}
                    <div className="flex justify-center">
                        {passed ? (
                            <div className="bg-green-100 p-6 rounded-full border-8 border-green-50 shadow-lg shadow-green-100">
                                <Trophy className="h-20 w-20 text-green-600 animate-bounce" />
                            </div>
                        ) : (
                            <div className="bg-red-100 p-6 rounded-full border-8 border-red-50 shadow-lg shadow-red-100">
                                <XCircle className="h-20 w-20 text-red-600 animate-pulse" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className={`text-4xl font-extrabold tracking-tight ${passed ? 'text-green-700' : 'text-red-700'}`}>
                            {passed ? 'Congratulations! You Passed' : 'Keep Practicing! You failed'}
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">
                            {course.title} Final Assessment
                        </p>
                    </div>

                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-10 space-y-1">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Score</p>
                                    <p className={`text-6xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {score}<span className="text-2xl font-bold text-slate-400">%</span>
                                    </p>
                                </div>
                                <div className="p-10 space-y-1">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Passing Score</p>
                                    <p className="text-6xl font-black text-slate-700">
                                        {pass_mark}<span className="text-2xl font-bold text-slate-400">%</span>
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 flex justify-around border-t border-slate-100">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Total Questions</p>
                                    <p className="font-bold text-slate-700">{attempt.total_questions}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Correct Answers</p>
                                    <p className="font-bold text-slate-700">{attempt.correct_answers}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                    <Badge variant={passed ? 'default' : 'destructive'} className={passed ? "bg-green-600" : ""}>
                                        {passed ? 'PASSED' : 'FAILED'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {!passed && (
                            <Link href={QuizController.start.url(course.id)}>
                                <Button className="h-14 px-8 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 gap-2">
                                    <RefreshCcw className="h-5 w-5" /> Retake Quiz
                                </Button>
                            </Link>
                        )}
                        {passed && !certificate && (
                            <Link href={`/academy/quiz/certificate/${attempt.id}`} method="post" as="button">
                                <Button className="h-14 px-8 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-200 gap-2">
                                    <Award className="h-5 w-5" /> Get Certificate
                                </Button>
                            </Link>
                        )}
                        {passed && certificate && (
                            <a href={`/academy/certificate/${certificate.id}/download`} target="_blank" rel="noopener noreferrer">
                                <Button className="h-14 px-8 rounded-2xl font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-2">
                                    <Download className="h-5 w-5" /> Download Certificate
                                </Button>
                            </a>
                        )}
                        <Link href={`/academy/my-enrollments/${enrollment_id || ''}`}>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold gap-2 border-slate-200 hover:bg-slate-50">
                                <Home className="h-5 w-5" /> Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </StudentDashboardLayout>
    );
}
