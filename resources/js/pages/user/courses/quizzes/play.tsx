import { Head, router } from '@inertiajs/react';
import QuizController from '@/actions/App/Http/Controllers/User/QuizController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Timer, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

interface Option {
    id: number;
    option_text: string;
}

interface Quiz {
    id: number;
    question_text: string;
    options: Option[];
}

interface PageProps {
    course: any;
    quizzes: Quiz[];
    attempt: any;
    time_limit: number;
}

export default function QuizPlay({ course, quizzes, attempt, time_limit }: PageProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number[]>>({}); // { question_id: [option_id, ...] }
    const [timeLeft, setTimeLeft] = useState(time_limit * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (time_limit <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Prevent back navigation/refresh
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(timer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleOption = (qId: number, oId: number) => {
        setAnswers(prev => {
            const current = prev[qId] || [];
            const next = current.includes(oId) 
                ? current.filter(id => id !== oId)
                : [...current, oId];
            return { ...prev, [qId]: next };
        });
    };

    const submitQuiz = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        
        router.post(QuizController.submit.url(), {
            attempt_id: attempt.id,
            answers: answers,
        }, {
            onFinish: () => setIsSubmitting(false)
        });
    };

    const quiz = quizzes[currentIdx];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 md:px-6">
            <Head title={`Quiz - ${course.title}`} />
            
            <div className="w-full max-w-3xl space-y-6">
                {/* Header Card */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="font-bold text-xl text-slate-800">{course.title}</h2>
                        <p className="text-sm text-slate-500 font-medium">Final Assessment • Question {currentIdx + 1} of {quizzes.length}</p>
                    </div>
                    {time_limit > 0 && (
                        <div className={`flex items-center gap-3 font-mono text-2xl font-bold px-6 py-3 rounded-2xl transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse border border-red-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>
                            <Timer className={`h-6 w-6 ${timeLeft < 60 ? 'animate-bounce' : ''}`} />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{Math.round(((currentIdx + 1) / quizzes.length) * 100)}%</span>
                    </div>
                    <Progress value={((currentIdx + 1) / quizzes.length) * 100} className="h-3 rounded-full bg-slate-200" />
                </div>

                {/* Question Card */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                            {quiz.question_text}
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-4 bg-white">
                        <p className="text-sm font-medium text-slate-400 mb-6 flex items-center gap-2">
                           <AlertCircle className="h-4 w-4" /> Select one or more correct options
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            {quiz.options.map((opt) => {
                                const isSelected = (answers[quiz.id] || []).includes(opt.id);
                                return (
                                    <div 
                                        key={opt.id} 
                                        onClick={() => toggleOption(quiz.id, opt.id)}
                                        className={`group flex items-center gap-5 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                            {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
                                        </div>
                                        <span className={`text-lg font-semibold ${isSelected ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}>{opt.option_text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => setCurrentIdx(prev => prev - 1)} 
                        disabled={currentIdx === 0 || isSubmitting}
                        className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-800"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                    </Button>
                    
                    {currentIdx < quizzes.length - 1 ? (
                        <Button 
                            onClick={() => setCurrentIdx(prev => prev + 1)} 
                            disabled={isSubmitting}
                            className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-transform active:scale-95"
                        >
                            Next Question <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={submitQuiz}
                            disabled={isSubmitting}
                            className="h-14 px-12 rounded-2xl font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95"
                        >
                            {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
