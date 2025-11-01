import AppLayout from '@/layouts/app-layout';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { Loader2, Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

type SyllabusRow = {
    session: number;
    course_topic: string;
    learnings: string[];
    outcomes: string[];
    hours: number;
};

type TopicRow = {
    topic: string;
    subtopics: string[];
    duration: string;
    content: string;
};

type PageProps = {
    programs: { id: number; name: string }[];
};

export default function CreateCourse() {
    const { props } = usePage<PageProps>();
    const programs = props.programs;

    const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set([0]));
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));

    const { data, setData, post, processing, errors, reset } = useForm({
        course_type: 'guided' as 'guided' | 'self_paced',
        title: '',
        program_id: null as number | null,
        featured: false,
        // Guided course fields
        description: '',
        duration: '',
        target_audience: '',
        key_learning_objectives: [''] as string[],
        syllabus: [{ session: 1, course_topic: '', learnings: [''], outcomes: [''], hours: 0 }] as SyllabusRow[],
        // Self-paced course fields
        topics: [{ topic: '', subtopics: [''], duration: '', content: '' }] as TopicRow[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: CourseController.index().url },
        { title: 'Create Course', href: CourseController.create().url },
    ];

    // Guided course helpers
    const addSyllabusRow = () => {
        const newSyllabus = [...data.syllabus, {
            session: data.syllabus.length + 1,
            course_topic: '',
            learnings: [''],
            outcomes: [''],
            hours: 0,
        }];
        setData('syllabus', newSyllabus);
        setExpandedSessions(new Set([...expandedSessions, newSyllabus.length - 1]));
    };

    const removeSyllabusRow = (index: number) => {
        if (data.syllabus.length === 1) return;
        const newSyllabus = data.syllabus.filter((_, i) => i !== index);
        newSyllabus.forEach((row, i) => { row.session = i + 1; });
        setData('syllabus', newSyllabus);
        const reindexed = new Set<number>();
        expandedSessions.forEach(sessionIndex => {
            if (sessionIndex < index) {
                reindexed.add(sessionIndex);
            } else if (sessionIndex > index) {
                reindexed.add(sessionIndex - 1);
            }
        });
        setExpandedSessions(reindexed);
    };

    const toggleSession = (index: number) => {
        const newExpanded = new Set(expandedSessions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedSessions(newExpanded);
    };

    const updateSyllabusRow = (index: number, field: keyof SyllabusRow, value: any) => {
        const newSyllabus = [...data.syllabus];
        if ((field === 'learnings' || field === 'outcomes') && Array.isArray(value)) {
            (newSyllabus[index] as any)[field] = value;
        } else {
            (newSyllabus[index] as any)[field] = value;
        }
        setData('syllabus', newSyllabus);
    };

    const addLearning = (syllabusIndex: number) => {
        const newSyllabus = [...data.syllabus];
        newSyllabus[syllabusIndex].learnings.push('');
        setData('syllabus', newSyllabus);
    };

    const removeLearning = (syllabusIndex: number, learningIndex: number) => {
        const newSyllabus = [...data.syllabus];
        newSyllabus[syllabusIndex].learnings = newSyllabus[syllabusIndex].learnings.filter((_, i) => i !== learningIndex);
        setData('syllabus', newSyllabus);
    };

    const addOutcome = (syllabusIndex: number) => {
        const newSyllabus = [...data.syllabus];
        newSyllabus[syllabusIndex].outcomes.push('');
        setData('syllabus', newSyllabus);
    };

    const removeOutcome = (syllabusIndex: number, outcomeIndex: number) => {
        const newSyllabus = [...data.syllabus];
        newSyllabus[syllabusIndex].outcomes = newSyllabus[syllabusIndex].outcomes.filter((_, i) => i !== outcomeIndex);
        setData('syllabus', newSyllabus);
    };

    const addKeyLearningObjective = () => {
        setData('key_learning_objectives', [...data.key_learning_objectives, '']);
    };

    const removeKeyLearningObjective = (index: number) => {
        if (data.key_learning_objectives.length === 1) return;
        setData('key_learning_objectives', data.key_learning_objectives.filter((_, i) => i !== index));
    };

    // Self-paced course helpers
    const addTopic = () => {
        const newTopics = [...data.topics, { topic: '', subtopics: [''], duration: '', content: '' }];
        setData('topics', newTopics);
        setExpandedTopics(new Set([...expandedTopics, newTopics.length - 1]));
    };

    const removeTopic = (index: number) => {
        if (data.topics.length === 1) return;
        setData('topics', data.topics.filter((_, i) => i !== index));
        const reindexed = new Set<number>();
        expandedTopics.forEach(topicIndex => {
            if (topicIndex < index) {
                reindexed.add(topicIndex);
            } else if (topicIndex > index) {
                reindexed.add(topicIndex - 1);
            }
        });
        setExpandedTopics(reindexed);
    };

    const toggleTopic = (index: number) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTopics(newExpanded);
    };

    const updateTopic = (index: number, field: keyof TopicRow, value: any) => {
        const newTopics = [...data.topics];
        if (field === 'subtopics' && Array.isArray(value)) {
            newTopics[index].subtopics = value;
        } else {
            (newTopics[index] as any)[field] = value;
        }
        setData('topics', newTopics);
    };

    const addSubtopic = (topicIndex: number) => {
        const newTopics = [...data.topics];
        newTopics[topicIndex].subtopics.push('');
        setData('topics', newTopics);
    };

    const removeSubtopic = (topicIndex: number, subtopicIndex: number) => {
        const newTopics = [...data.topics];
        newTopics[topicIndex].subtopics = newTopics[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
        setData('topics', newTopics);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data with proper types and filtered empty values
        const submitData: any = {
            course_type: data.course_type,
            title: data.title,
            featured: Boolean(data.featured), // Ensure boolean
        };

        if (data.program_id) {
            submitData.program_id = data.program_id;
        }

        if (data.course_type === 'guided') {
            submitData.description = data.description;
            submitData.duration = data.duration || null;
            submitData.target_audience = data.target_audience;
            submitData.key_learning_objectives = data.key_learning_objectives.filter(obj => obj.trim() !== '');
            submitData.syllabus = data.syllabus.map(row => ({
                session: row.session,
                course_topic: row.course_topic,
                learnings: row.learnings.filter(l => l.trim() !== ''),
                outcomes: row.outcomes.filter(o => o.trim() !== ''),
                hours: row.hours,
            }));
        } else {
            submitData.description = data.description || null;
            submitData.topics = data.topics.map(row => ({
                topic: row.topic,
                subtopics: row.subtopics.filter(s => s.trim() !== ''),
                duration: row.duration || null,
                content: row.content,
            }));
        }

        // Use router.post directly with transformed data
        router.post(CourseController.store.url(), submitData, {
            onSuccess: () => {
                router.visit(CourseController.index().url);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit(CourseController.index().url)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create Course</h1>
                            <p className="text-sm text-muted-foreground">
                                Add a new course. Choose between Guided or Self-Paced course.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-6">
                    {/* Course Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="course_type">Course Type *</Label>
                                        <Select
                                            value={data.course_type}
                                            onValueChange={(value: 'guided' | 'self_paced') => setData('course_type', value)}
                                            required
                                        >
                                            <SelectTrigger className="w-full max-w-md">
                                                <SelectValue placeholder="Select course type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="guided">Guided Course (School/College/Corporate)</SelectItem>
                                                <SelectItem value="self_paced">Self-Paced Course</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.course_type} />
                    </div>

                    {/* Course Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Course Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Course Title"
                            className="max-w-2xl"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    {/* Program & Featured */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="grid gap-2">
                            <Label htmlFor="program_id">Program (Optional)</Label>
                            <Select
                                value={data.program_id ? String(data.program_id) : 'none'}
                                onValueChange={(value) => setData('program_id', value === 'none' ? null : Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select program (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.length > 0 ? (
                                        <>
                                            <SelectItem value="none">None</SelectItem>
                                            {programs.map((program) => (
                                                <SelectItem key={program.id} value={String(program.id)}>
                                                    {program.name}
                                                </SelectItem>
                                            ))}
                                        </>
                                    ) : (
                                        <SelectItem value="none" disabled>No programs available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.program_id} />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <Switch
                                id="featured"
                                checked={data.featured}
                                onCheckedChange={(checked) => setData('featured', checked)}
                            />
                            <Label htmlFor="featured">Featured Course</Label>
                            <input type="hidden" name="featured" value={data.featured ? '1' : '0'} />
                        </div>
                    </div>

                    {/* Guided Course Form */}
                    {data.course_type === 'guided' && (
                        <>
                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Course Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    placeholder="Describe the course..."
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="max-w-3xl"
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Duration & Target Audience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        placeholder="e.g., 19 Hours, 2 weeks"
                                    />
                                    <InputError message={errors.duration} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="target_audience">Target Audience *</Label>
                                    <Textarea
                                        id="target_audience"
                                        name="target_audience"
                                        required
                                        value={data.target_audience}
                                        onChange={(e) => setData('target_audience', e.target.value)}
                                        placeholder="HR Professionals, Managers, Team Leaders"
                                        rows={3}
                                    />
                                    <InputError message={errors.target_audience} />
                                </div>
                            </div>

                            {/* Key Learning Objectives */}
                            <div className="grid gap-2">
                                <Label>Key Learning Objectives</Label>
                                <div className="space-y-2">
                                    {data.key_learning_objectives.map((objective, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={objective}
                                                onChange={(e) => {
                                                    const newObjectives = [...data.key_learning_objectives];
                                                    newObjectives[index] = e.target.value;
                                                    setData('key_learning_objectives', newObjectives);
                                                }}
                                                placeholder="Learning objective"
                                                className="max-w-2xl"
                                            />
                                            {data.key_learning_objectives.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeKeyLearningObjective(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addKeyLearningObjective}
                                    className="w-fit"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Learning Objective
                                </Button>
                                <InputError message={errors.key_learning_objectives} />
                            </div>

                            {/* Syllabus - Card Layout */}
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold">Syllabus *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSyllabusRow}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Session
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.syllabus.map((row, syllabusIndex) => (
                                        <div
                                            key={syllabusIndex}
                                            className="rounded-lg border bg-card p-4 space-y-4"
                                        >
                                            {/* Session Header - Collapsible */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20">
                                                        <Label className="text-xs text-muted-foreground">Session</Label>
                                                        <Input
                                                            type="number"
                                                            value={row.session}
                                                            onChange={(e) => updateSyllabusRow(syllabusIndex, 'session', Number(e.target.value))}
                                                            className="w-20"
                                                            required
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleSession(syllabusIndex)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {expandedSessions.has(syllabusIndex) ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                        Session {row.session}
                                                    </Button>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeSyllabusRow(syllabusIndex)}
                                                    disabled={data.syllabus.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {expandedSessions.has(syllabusIndex) && (
                                                <div className="space-y-4 pl-6 border-l-2 border-muted">
                                                    {/* Course Topic - Full Width */}
                                                    <div className="grid gap-2">
                                                        <Label>Course Topic *</Label>
                                                        <Input
                                                            value={row.course_topic}
                                                            onChange={(e) => updateSyllabusRow(syllabusIndex, 'course_topic', e.target.value)}
                                                            placeholder="Introduction to Happiness at Workplace"
                                                            required
                                                            className="w-full"
                                                        />
                                                        <InputError message={errors[`syllabus.${syllabusIndex}.course_topic` as keyof typeof errors]} />
                                                    </div>

                                                    {/* Hours */}
                                                    <div className="grid gap-2 max-w-xs">
                                                        <Label>Hours *</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.5"
                                                            value={row.hours || ''}
                                                            onChange={(e) => updateSyllabusRow(syllabusIndex, 'hours', Number(e.target.value))}
                                                            required
                                                        />
                                                        <InputError message={errors[`syllabus.${syllabusIndex}.hours` as keyof typeof errors]} />
                                                    </div>

                                                    {/* Learnings */}
                                                    <div className="grid gap-2">
                                                        <Label>Learnings *</Label>
                                                        <div className="space-y-2">
                                                            {row.learnings.map((learning, learningIndex) => (
                                                                <div key={learningIndex} className="flex gap-2">
                                                                    <Input
                                                                        value={learning}
                                                                        onChange={(e) => {
                                                                            const newLearnings = [...row.learnings];
                                                                            newLearnings[learningIndex] = e.target.value;
                                                                            updateSyllabusRow(syllabusIndex, 'learnings', newLearnings);
                                                                        }}
                                                                        placeholder="Learning point"
                                                                        required
                                                                        className="flex-1"
                                                                    />
                                                                    {row.learnings.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => removeLearning(syllabusIndex, learningIndex)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addLearning(syllabusIndex)}
                                                            className="w-fit"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Learning
                                                        </Button>
                                                        <InputError message={errors[`syllabus.${syllabusIndex}.learnings` as keyof typeof errors]} />
                                                    </div>

                                                    {/* Outcomes */}
                                                    <div className="grid gap-2">
                                                        <Label>Outcomes</Label>
                                                        <div className="space-y-2">
                                                            {row.outcomes.map((outcome, outcomeIndex) => (
                                                                <div key={outcomeIndex} className="flex gap-2">
                                                                    <Input
                                                                        value={outcome}
                                                                        onChange={(e) => {
                                                                            const newOutcomes = [...row.outcomes];
                                                                            newOutcomes[outcomeIndex] = e.target.value;
                                                                            updateSyllabusRow(syllabusIndex, 'outcomes', newOutcomes);
                                                                        }}
                                                                        placeholder="Outcome"
                                                                        className="flex-1"
                                                                    />
                                                                    {row.outcomes.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => removeOutcome(syllabusIndex, outcomeIndex)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addOutcome(syllabusIndex)}
                                                            className="w-fit"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Outcome
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.syllabus} />
                            </div>
                        </>
                    )}

                    {/* Self-Paced Course Form */}
                    {data.course_type === 'self_paced' && (
                        <>
                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Course Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the course..."
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="max-w-3xl"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold">Topics *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addTopic}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Topic
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.topics.map((topicRow, topicIndex) => (
                                        <div
                                            key={topicIndex}
                                            className="rounded-lg border bg-card p-4 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleTopic(topicIndex)}
                                                    className="flex items-center gap-2"
                                                >
                                                    {expandedTopics.has(topicIndex) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                    Topic {topicIndex + 1}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeTopic(topicIndex)}
                                                    disabled={data.topics.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {expandedTopics.has(topicIndex) && (
                                                <div className="space-y-4 pl-6 border-l-2 border-muted">
                                                    <div className="grid gap-2">
                                                        <Label>Topic Name *</Label>
                                                        <Input
                                                            value={topicRow.topic}
                                                            onChange={(e) => updateTopic(topicIndex, 'topic', e.target.value)}
                                                            placeholder="e.g., Introduction to Digital Marketing"
                                                            required
                                                            className="w-full"
                                                        />
                                                        <InputError message={errors[`topics.${topicIndex}.topic` as keyof typeof errors]} />
                                                    </div>

                                                    <div className="grid gap-2 max-w-xs">
                                                        <Label>Duration</Label>
                                                        <Input
                                                            value={topicRow.duration}
                                                            onChange={(e) => updateTopic(topicIndex, 'duration', e.target.value)}
                                                            placeholder="e.g., 1.5 hrs, 2 hrs"
                                                        />
                                                        <InputError message={errors[`topics.${topicIndex}.duration` as keyof typeof errors]} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Subtopics</Label>
                                                        <div className="space-y-2">
                                                            {topicRow.subtopics.map((subtopic, subtopicIndex) => (
                                                                <div key={subtopicIndex} className="flex gap-2">
                                                                    <Input
                                                                        value={subtopic}
                                                                        onChange={(e) => {
                                                                            const newSubtopics = [...topicRow.subtopics];
                                                                            newSubtopics[subtopicIndex] = e.target.value;
                                                                            updateTopic(topicIndex, 'subtopics', newSubtopics);
                                                                        }}
                                                                        placeholder="Subtopic"
                                                                        className="flex-1"
                                                                    />
                                                                    {topicRow.subtopics.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addSubtopic(topicIndex)}
                                                            className="w-fit"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Subtopic
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Content *</Label>
                                                        <RichTextEditor
                                                            value={topicRow.content}
                                                            onChange={(value) => updateTopic(topicIndex, 'content', value)}
                                                            placeholder="Write the full content for this topic..."
                                                            name={`topics[${topicIndex}][content]`}
                                                        />
                                                        <InputError message={errors[`topics.${topicIndex}.content` as keyof typeof errors]} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.topics} />
                            </div>
                        </>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(CourseController.index().url)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Course
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
