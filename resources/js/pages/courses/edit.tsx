import AppLayout from '@/layouts/app-layout';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import { Head, router, usePage } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
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
import { useState, useEffect } from 'react';

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
    course: any;
    programs: { id: number; name: string }[];
};

export default function EditCourse() {
    const { props } = usePage<PageProps>();
    const { course, programs } = props;

    const [courseType, setCourseType] = useState<'guided' | 'self_paced'>(course.course_type || 'guided');
    const [programId, setProgramId] = useState<string | undefined>(course.program_id ? String(course.program_id) : undefined);
    
    // Guided course state
    const [description, setDescription] = useState(course.description || '');
    const [keyLearningObjectives, setKeyLearningObjectives] = useState<string[]>(
        course.key_learning_objectives && course.key_learning_objectives.length > 0 
            ? course.key_learning_objectives 
            : ['']
    );
    const [syllabus, setSyllabus] = useState<SyllabusRow[]>(
        course.syllabus && course.syllabus.length > 0
            ? course.syllabus.map((row: any) => ({
                session: row.session || 1,
                course_topic: row.course_topic || '',
                learnings: row.learnings && row.learnings.length > 0 ? row.learnings : [''],
                outcomes: row.outcomes && row.outcomes.length > 0 ? row.outcomes : [''],
                hours: row.hours || 0,
            }))
            : [{ session: 1, course_topic: '', learnings: [''], outcomes: [''], hours: 0 }]
    );
    const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set([0]));
    
    // Self-paced course state
    const [topics, setTopics] = useState<TopicRow[]>(
        course.topics && course.topics.length > 0
            ? course.topics.map((row: any) => ({
                topic: row.topic || '',
                subtopics: row.subtopics && row.subtopics.length > 0 ? row.subtopics : [''],
                duration: row.duration || '',
                content: row.content || '',
            }))
            : [{ topic: '', subtopics: [''], duration: '', content: '' }]
    );
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: CourseController.index().url },
        { title: course.title, href: CourseController.show.url(course.id) },
        { title: 'Edit', href: CourseController.edit.url(course.id) },
    ];

    // Guided course helpers (same as create.tsx)
    const addSyllabusRow = () => {
        const newSyllabus = [...syllabus, { 
            session: syllabus.length + 1, 
            course_topic: '', 
            learnings: [''], 
            outcomes: [''], 
            hours: 0 
        }];
        setSyllabus(newSyllabus);
        setExpandedSessions(new Set([...expandedSessions, newSyllabus.length - 1]));
    };

    const removeSyllabusRow = (index: number) => {
        if (syllabus.length === 1) return;
        const newSyllabus = syllabus.filter((_, i) => i !== index);
        newSyllabus.forEach((row, i) => { row.session = i + 1; });
        setSyllabus(newSyllabus);
        const newExpanded = new Set<number>();
        expandedSessions.forEach(sessionIndex => {
            if (sessionIndex < index) {
                newExpanded.add(sessionIndex);
            } else if (sessionIndex > index) {
                newExpanded.add(sessionIndex - 1);
            }
        });
        setExpandedSessions(newExpanded);
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
        const newSyllabus = [...syllabus];
        if ((field === 'learnings' || field === 'outcomes') && Array.isArray(value)) {
            (newSyllabus[index] as any)[field] = value;
        } else {
            (newSyllabus[index] as any)[field] = value;
        }
        setSyllabus(newSyllabus);
    };

    const addLearning = (syllabusIndex: number) => {
        const newSyllabus = [...syllabus];
        newSyllabus[syllabusIndex].learnings.push('');
        setSyllabus(newSyllabus);
    };

    const removeLearning = (syllabusIndex: number, learningIndex: number) => {
        const newSyllabus = [...syllabus];
        newSyllabus[syllabusIndex].learnings = newSyllabus[syllabusIndex].learnings.filter((_, i) => i !== learningIndex);
        setSyllabus(newSyllabus);
    };

    const addOutcome = (syllabusIndex: number) => {
        const newSyllabus = [...syllabus];
        newSyllabus[syllabusIndex].outcomes.push('');
        setSyllabus(newSyllabus);
    };

    const removeOutcome = (syllabusIndex: number, outcomeIndex: number) => {
        const newSyllabus = [...syllabus];
        newSyllabus[syllabusIndex].outcomes = newSyllabus[syllabusIndex].outcomes.filter((_, i) => i !== outcomeIndex);
        setSyllabus(newSyllabus);
    };

    const addKeyLearningObjective = () => {
        setKeyLearningObjectives([...keyLearningObjectives, '']);
    };

    const removeKeyLearningObjective = (index: number) => {
        if (keyLearningObjectives.length === 1) return;
        setKeyLearningObjectives(keyLearningObjectives.filter((_, i) => i !== index));
    };

    // Self-paced course helpers (same as create.tsx)
    const addTopic = () => {
        const newTopics = [...topics, { topic: '', subtopics: [''], duration: '', content: '' }];
        setTopics(newTopics);
        setExpandedTopics(new Set([...expandedTopics, newTopics.length - 1]));
    };

    const removeTopic = (index: number) => {
        if (topics.length === 1) return;
        setTopics(topics.filter((_, i) => i !== index));
        const newExpanded = new Set<number>();
        expandedTopics.forEach(topicIndex => {
            if (topicIndex < index) {
                newExpanded.add(topicIndex);
            } else if (topicIndex > index) {
                newExpanded.add(topicIndex - 1);
            }
        });
        setExpandedTopics(newExpanded);
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
        const newTopics = [...topics];
        if (field === 'subtopics' && Array.isArray(value)) {
            newTopics[index].subtopics = value;
        } else {
            (newTopics[index] as any)[field] = value;
        }
        setTopics(newTopics);
    };

    const addSubtopic = (topicIndex: number) => {
        const newTopics = [...topics];
        newTopics[topicIndex].subtopics.push('');
        setTopics(newTopics);
    };

    const removeSubtopic = (topicIndex: number, subtopicIndex: number) => {
        const newTopics = [...topics];
        newTopics[topicIndex].subtopics = newTopics[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
        setTopics(newTopics);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Course: ${course.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit(CourseController.show.url(course.id))}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Course</h1>
                            <p className="text-sm text-muted-foreground">
                                {course.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-lg border bg-card">
                    <Form
                        method="post"
                        action={CourseController.update.url(course.id)}
                        onSuccess={() => {
                            router.visit(CourseController.show.url(course.id));
                        }}
                        className="p-6 space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Course Type */}
                                <div className="grid gap-2">
                                    <Label htmlFor="course_type">Course Type *</Label>
                                    <Select 
                                        name="course_type" 
                                        value={courseType}
                                        onValueChange={(v: 'guided' | 'self_paced') => setCourseType(v)}
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
                                        defaultValue={course.title}
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
                                            value={programId} 
                                            onValueChange={(value) => setProgramId(value === 'none' ? undefined : value)}
                                            defaultValue={course.program_id ? String(course.program_id) : undefined}
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
                                        {programId && programId !== 'none' && (
                                            <input type="hidden" name="program_id" value={programId} />
                                        )}
                                        <InputError message={errors.program_id} />
                                    </div>

                                    <div className="flex items-center gap-2 pt-8">
                                        <Switch name="featured" id="featured" defaultChecked={course.featured} />
                                        <Label htmlFor="featured">Featured Course</Label>
                                    </div>
                                </div>

                                {/* Guided Course Form */}
                                {courseType === 'guided' && (
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
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
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
                                                    defaultValue={course.duration || ''}
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
                                                    defaultValue={course.target_audience || ''}
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
                                                {keyLearningObjectives.map((objective, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            name={`key_learning_objectives[${index}]`}
                                                            value={objective}
                                                            onChange={(e) => {
                                                                const newObjectives = [...keyLearningObjectives];
                                                                newObjectives[index] = e.target.value;
                                                                setKeyLearningObjectives(newObjectives);
                                                            }}
                                                            placeholder="Learning objective"
                                                            className="max-w-2xl"
                                                        />
                                                        {keyLearningObjectives.length > 1 && (
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
                                                <Label className="text-lg font-semibold">Syllabus</Label>
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
                                                {syllabus.map((row, syllabusIndex) => (
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
                                                                        name={`syllabus[${syllabusIndex}][session]`}
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
                                                                disabled={syllabus.length === 1}
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
                                                                        name={`syllabus[${syllabusIndex}][course_topic]`}
                                                                        value={row.course_topic}
                                                                        onChange={(e) => updateSyllabusRow(syllabusIndex, 'course_topic', e.target.value)}
                                                                        placeholder="Introduction to Happiness at Workplace"
                                                                        required
                                                                        className="w-full"
                                                                    />
                                                                </div>

                                                                {/* Hours */}
                                                                <div className="grid gap-2 max-w-xs">
                                                                    <Label>Hours *</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.5"
                                                                        name={`syllabus[${syllabusIndex}][hours]`}
                                                                        value={row.hours || ''}
                                                                        onChange={(e) => updateSyllabusRow(syllabusIndex, 'hours', Number(e.target.value))}
                                                                        required
                                                                    />
                                                                </div>

                                                                {/* Learnings */}
                                                                <div className="grid gap-2">
                                                                    <Label>Learnings *</Label>
                                                                    <div className="space-y-2">
                                                                        {row.learnings.map((learning, learningIndex) => (
                                                                            <div key={learningIndex} className="flex gap-2">
                                                                                <Input
                                                                                    name={`syllabus[${syllabusIndex}][learnings][${learningIndex}]`}
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
                                                                </div>

                                                                {/* Outcomes */}
                                                                <div className="grid gap-2">
                                                                    <Label>Outcomes</Label>
                                                                    <div className="space-y-2">
                                                                        {row.outcomes.map((outcome, outcomeIndex) => (
                                                                            <div key={outcomeIndex} className="flex gap-2">
                                                                                <Input
                                                                                    name={`syllabus[${syllabusIndex}][outcomes][${outcomeIndex}]`}
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
                                {courseType === 'self_paced' && (
                                    <>
                                        {/* Description */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Course Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Describe the course..."
                                                rows={5}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="max-w-3xl"
                                            />
                                            <InputError message={errors.description} />
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-lg font-semibold">Topics</Label>
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
                                                {topics.map((topicRow, topicIndex) => (
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
                                                                disabled={topics.length === 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {expandedTopics.has(topicIndex) && (
                                                            <div className="space-y-4 pl-6 border-l-2 border-muted">
                                                                <div className="grid gap-2">
                                                                    <Label>Topic Name *</Label>
                                                                    <Input
                                                                        name={`topics[${topicIndex}][topic]`}
                                                                        value={topicRow.topic}
                                                                        onChange={(e) => updateTopic(topicIndex, 'topic', e.target.value)}
                                                                        placeholder="e.g., Introduction to Digital Marketing"
                                                                        required
                                                                        className="w-full"
                                                                    />
                                                                </div>

                                                                <div className="grid gap-2 max-w-xs">
                                                                    <Label>Duration</Label>
                                                                    <Input
                                                                        name={`topics[${topicIndex}][duration]`}
                                                                        value={topicRow.duration}
                                                                        onChange={(e) => updateTopic(topicIndex, 'duration', e.target.value)}
                                                                        placeholder="e.g., 1.5 hrs, 2 hrs"
                                                                    />
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label>Subtopics</Label>
                                                                    <div className="space-y-2">
                                                                        {topicRow.subtopics.map((subtopic, subtopicIndex) => (
                                                                            <div key={subtopicIndex} className="flex gap-2">
                                                                                <Input
                                                                                    name={`topics[${topicIndex}][subtopics][${subtopicIndex}]`}
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
                                        onClick={() => router.visit(CourseController.show.url(course.id))}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Course
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

