import AppLayout from '@/layouts/app-layout';
import QuizController from '@/actions/App/Http/Controllers/Admin/QuizController';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, Download, Trash2, CheckCircle2, Settings, Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Option {
    id?: number;
    option_text: string;
    is_correct: boolean;
}

interface Quiz {
    id: number;
    question_text: string;
    pass_marks: number;
    options: Option[];
}

interface PageProps {
    course: any;
    quizzes: Quiz[];
    upload_report?: {
        success_count: number;
        errors: string[];
    };
    flash?: {
        success?: string;
        error?: string;
    }
}

export default function QuizIndex({ course, quizzes, upload_report, flash }: PageProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        course_id: course.id,
        question_text: '',
        options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ]
    });

    const settingsForm = useForm({
        quiz_time_limit_minutes: course.quiz_time_limit_minutes ?? 0,
        quiz_pass_marks: course.quiz_pass_marks ?? 40,
    });

    useEffect(() => {
        settingsForm.setData({
            quiz_time_limit_minutes: course.quiz_time_limit_minutes ?? 0,
            quiz_pass_marks: course.quiz_pass_marks ?? 40,
        });
    }, [course.id, course.quiz_time_limit_minutes, course.quiz_pass_marks]);

    const uploadForm = useForm({
        course_id: course.id,
        file: null as File | null,
    });

    const addOption = () => setData('options', [...data.options, { option_text: '', is_correct: false }]);
    
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(QuizController.store.url(), {
            onSuccess: () => {
                setIsManualOpen(false);
                reset();
            },
            onError: (errs) => {
                console.error("Store Errors:", errs);
                alert("Failed to save question. Check console or make sure all option texts are filled.");
            }
        });
    };

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post(QuizController.updateSettings.url(course.id), {
            onSuccess: () => setIsSettingsOpen(false),
            onError: (errs) => {
                console.error("Settings Errors:", errs);
                alert("Failed to save settings. Check console.");
            }
        });
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(QuizController.bulkUpload.url(), {
            onSuccess: () => {
                setIsUploadOpen(false);
                uploadForm.reset();
            }
        });
    };

    const downloadSample = () => {
        const csv = "question,option_1,option_2,option_3,option_4,correct_options\nWhat is Laravel?,A PHP Framework,A JS Library,A Database,A Browser,1";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz_sample.csv';
        a.click();
    };

    return (
        <AppLayout>
            <Head title={`Quiz - ${course.title}`} />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Quiz Management</h1>
                        <p className="text-muted-foreground">{course.title}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-primary font-medium">
                                <Timer className="h-4 w-4" /> {course.quiz_time_limit_minutes} mins
                            </span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 className="h-4 w-4" /> {course.quiz_pass_marks}% to pass
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Quiz Settings</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Course Quiz Settings</DialogTitle></DialogHeader>
                                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Time Limit (minutes)</Label>
                                        <Input 
                                            type="number" 
                                            value={settingsForm.data.quiz_time_limit_minutes} 
                                            onChange={e => settingsForm.setData('quiz_time_limit_minutes', e.target.value)} 
                                            required 
                                        />
                                        {settingsForm.errors.quiz_time_limit_minutes && <p className="text-sm text-red-500">{settingsForm.errors.quiz_time_limit_minutes}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Passing Percentage (%)</Label>
                                        <Input 
                                            type="number" 
                                            value={settingsForm.data.quiz_pass_marks} 
                                            onChange={e => settingsForm.setData('quiz_pass_marks', e.target.value)} 
                                            required 
                                            min="0" 
                                            max="100" 
                                        />
                                        {settingsForm.errors.quiz_pass_marks && <p className="text-sm text-red-500">{settingsForm.errors.quiz_pass_marks}</p>}
                                    </div>
                                    <Button type="submit" disabled={settingsForm.processing} className="w-full">Update Settings</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={downloadSample}>
                            <Download className="mr-2 h-4 w-4" /> Sample CSV
                        </Button>
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Upload Quiz CSV</DialogTitle></DialogHeader>
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="file">CSV File</Label>
                                        <Input id="file" type="file" onChange={e => uploadForm.setData('file', e.target.files ? e.target.files[0] : null)} accept=".csv" />
                                        {uploadForm.errors.file && <p className="text-sm text-red-500">{uploadForm.errors.file}</p>}
                                    </div>
                                    <Button type="submit" disabled={uploadForm.processing} className="w-full">
                                        {uploadForm.processing ? 'Uploading...' : 'Start Upload'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>New Quiz Question</DialogTitle></DialogHeader>
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Question Text</Label>
                                        <Input value={data.question_text} onChange={e => setData('question_text', e.target.value)} required placeholder="Enter the question..." />
                                        {errors.question_text && <p className="text-sm text-red-500">{errors.question_text}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="block mb-2">Options (Check correct ones)</Label>
                                        <div className="space-y-3">
                                            {data.options.map((opt, i) => (
                                                <div key={i} className="flex gap-3 items-center">
                                                    <div className="flex-1">
                                                        <Input 
                                                            value={opt.option_text} 
                                                            onChange={e => {
                                                                const newOpts = [...data.options];
                                                                newOpts[i].option_text = e.target.value;
                                                                setData('options', newOpts);
                                                            }} 
                                                            placeholder={`Option ${i+1}`} 
                                                            required 
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 text-primary rounded border-gray-300"
                                                            checked={opt.is_correct} 
                                                            onChange={e => {
                                                                const newOpts = [...data.options];
                                                                newOpts[i].is_correct = e.target.checked;
                                                                setData('options', newOpts);
                                                            }} 
                                                        />
                                                        <span className="text-sm">Correct</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={addOption} className="mt-2 text-primary">
                                            + Add Another Option
                                        </Button>
                                        {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
                                    </div>
                                    <Button type="submit" disabled={processing} className="w-full mt-6">
                                        {processing ? 'Saving...' : 'Save Question'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {upload_report && upload_report.errors.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader><CardTitle className="text-red-700 text-lg flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> Bulk Upload Issues ({upload_report.errors.length})
                        </CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 text-red-600 text-sm space-y-1">
                                {upload_report.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {flash?.success && (
                     <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6 flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" /> {flash.success}
                        </CardContent>
                     </Card>
                )}

                <Card className="overflow-hidden border-none shadow-lg">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[40%]">Question</TableHead>
                                <TableHead className="w-[50%]">Options & Correct Answers</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quizzes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        No questions found. Add some to start the quiz.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quizzes.map((q) => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium align-top py-4">{q.question_text}</TableCell>
                                        <TableCell className="align-top py-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {q.options.map(o => (
                                                    <div key={o.id} className="flex items-center gap-2">
                                                        <Badge variant={o.is_correct ? 'default' : 'secondary'} className={o.is_correct ? "bg-green-600 hover:bg-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}>
                                                            {o.is_correct && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                                                            {o.option_text}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right align-top py-4">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                if(confirm('Are you sure you want to delete this question?')) {
                                                    router.delete(QuizController.destroy.url(q.id));
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
