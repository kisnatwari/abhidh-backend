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
import { Loader2, Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp, GraduationCap, BookOpen, Check } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import React, { useState, useEffect } from 'react';

type SyllabusRow = {
    session: number;
    course_topic: string;
    learnings: string[];
    outcomes: string[];
    hours: number;
};

type SubtopicRow = {
    name: string;
    content: string;
    hours: number;
};

type TopicRow = {
    topic: string;
    subtopics: SubtopicRow[];
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
    const [price, setPrice] = useState<number | null>(course.price ? Math.round(course.price) : null);
    const [featured, setFeatured] = useState<boolean>(course.featured || false);
    
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
    // Helper function to normalize old format to new format
    const normalizeTopics = (topicsData: any[]): TopicRow[] => {
        if (!topicsData || topicsData.length === 0) {
            return [{ topic: '', subtopics: [{ name: '', content: '', hours: 0 }] }];
        }
        
        return topicsData.map((row: any) => {
            // Handle old format (subtopics as strings, content/duration at topic level)
            if (row.subtopics && Array.isArray(row.subtopics) && row.subtopics.length > 0) {
                // Check if first subtopic is a string (old format) or object (new format)
                if (typeof row.subtopics[0] === 'string') {
                    // Old format: convert string subtopics to objects
                    return {
                        topic: row.topic || '',
                        subtopics: row.subtopics.map((sub: string, idx: number) => ({
                            name: sub || '',
                            content: idx === 0 ? (row.content || '') : '',
                            hours: idx === 0 ? (parseFloat(row.duration?.replace(/[^\d.]/g, '') || '0') || 0) : 0,
                        })),
                    };
                } else {
                    // New format: already objects
                    return {
                        topic: row.topic || '',
                        subtopics: row.subtopics.map((sub: any) => ({
                            name: sub.name || sub.topic || '',
                            content: sub.content || '',
                            hours: sub.hours || 0,
                        })),
                    };
                }
            }
            // No subtopics or empty: create default
            return {
                topic: row.topic || '',
                subtopics: [{ name: '', content: '', hours: 0 }],
            };
        });
    };
    
    const [topics, setTopics] = useState<TopicRow[]>(normalizeTopics(course.topics));
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));
    const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(() => {
        // Expand first subtopic of first topic by default
        const initial = new Set<string>();
        if (topics.length > 0 && topics[0].subtopics.length > 0) {
            initial.add('0-0');
        }
        return initial;
    });

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
        const newTopicIndex = topics.length;
        const newTopics = [...topics, { topic: '', subtopics: [{ name: '', content: '', hours: 0 }] }];
        setTopics(newTopics);
        setExpandedTopics(new Set([...expandedTopics, newTopicIndex]));
        // Expand all subtopics by default
        const newExpandedSubtopics = new Set(expandedSubtopics);
        newTopics[newTopicIndex].subtopics.forEach((_, subtopicIndex) => {
            newExpandedSubtopics.add(`${newTopicIndex}-${subtopicIndex}`);
        });
        setExpandedSubtopics(newExpandedSubtopics);
    };

    const removeTopic = (index: number) => {
        if (topics.length === 1) return;
        setTopics(topics.filter((_, i) => i !== index));
        
        // Remove expanded state for this topic's subtopics
        const newExpandedSubtopics = new Set(expandedSubtopics);
        topics[index].subtopics.forEach((_, subtopicIndex) => {
            newExpandedSubtopics.delete(`${index}-${subtopicIndex}`);
        });
        
        // Reindex remaining expanded subtopics
        const reindexedSubtopics = new Set<string>();
        newExpandedSubtopics.forEach(key => {
            const [tIdx, sIdx] = key.split('-').map(Number);
            if (tIdx < index) {
                reindexedSubtopics.add(key);
            } else if (tIdx > index) {
                reindexedSubtopics.add(`${tIdx - 1}-${sIdx}`);
            }
        });
        setExpandedSubtopics(reindexedSubtopics);
        
        // Reindex expanded topics
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
        const isCurrentlyExpanded = newExpanded.has(index);
        
        if (isCurrentlyExpanded) {
            newExpanded.delete(index);
            // Collapse all subtopics when topic is collapsed
            const newExpandedSubtopics = new Set(expandedSubtopics);
            topics[index].subtopics.forEach((_, subtopicIndex) => {
                newExpandedSubtopics.delete(`${index}-${subtopicIndex}`);
            });
            setExpandedSubtopics(newExpandedSubtopics);
        } else {
            newExpanded.add(index);
            // Expand all subtopics when topic is expanded
            const newExpandedSubtopics = new Set(expandedSubtopics);
            topics[index].subtopics.forEach((_, subtopicIndex) => {
                newExpandedSubtopics.add(`${index}-${subtopicIndex}`);
            });
            setExpandedSubtopics(newExpandedSubtopics);
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
        newTopics[topicIndex].subtopics.push({ name: '', content: '', hours: 0 });
        setTopics(newTopics);
        // Auto-expand the new subtopic
        const subtopicKey = `${topicIndex}-${newTopics[topicIndex].subtopics.length - 1}`;
        setExpandedSubtopics(new Set([...expandedSubtopics, subtopicKey]));
    };

    const removeSubtopic = (topicIndex: number, subtopicIndex: number) => {
        const newTopics = [...topics];
        newTopics[topicIndex].subtopics = newTopics[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
        setTopics(newTopics);
        // Remove from expanded set
        const subtopicKey = `${topicIndex}-${subtopicIndex}`;
        const newExpanded = new Set(expandedSubtopics);
        newExpanded.delete(subtopicKey);
        // Reindex remaining expanded subtopics
        const reindexed = new Set<string>();
        newExpanded.forEach(key => {
            const [tIdx, sIdx] = key.split('-').map(Number);
            if (tIdx === topicIndex && sIdx > subtopicIndex) {
                reindexed.add(`${tIdx}-${sIdx - 1}`);
            } else if (tIdx === topicIndex && sIdx < subtopicIndex) {
                reindexed.add(key);
            } else if (tIdx !== topicIndex) {
                reindexed.add(key);
            }
        });
        setExpandedSubtopics(reindexed);
    };

    const toggleSubtopic = (topicIndex: number, subtopicIndex: number) => {
        const subtopicKey = `${topicIndex}-${subtopicIndex}`;
        const newExpanded = new Set(expandedSubtopics);
        if (newExpanded.has(subtopicKey)) {
            newExpanded.delete(subtopicKey);
        } else {
            newExpanded.add(subtopicKey);
        }
        setExpandedSubtopics(newExpanded);
    };

    const updateSubtopic = (topicIndex: number, subtopicIndex: number, field: keyof SubtopicRow, value: any) => {
        const newTopics = [...topics];
        (newTopics[topicIndex].subtopics[subtopicIndex] as any)[field] = value;
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setCourseType('guided')}
                                            className={`relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md ${
                                                courseType === 'guided'
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border bg-card hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`rounded-full p-3 ${
                                                    courseType === 'guided'
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-base mb-1">Guided Course</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        School/College/Corporate
                                                    </p>
                                                </div>
                                                {courseType === 'guided' && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="rounded-full bg-primary p-1">
                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setCourseType('self_paced')}
                                            className={`relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md ${
                                                courseType === 'self_paced'
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border bg-card hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`rounded-full p-3 ${
                                                    courseType === 'self_paced'
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-base mb-1">Self-Paced Course</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Learn at your own pace
                                                    </p>
                                                </div>
                                                {courseType === 'self_paced' && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="rounded-full bg-primary p-1">
                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                    <input type="hidden" name="course_type" value={courseType} />
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
                                        <Switch 
                                            id="featured" 
                                            checked={featured}
                                            onCheckedChange={setFeatured}
                                        />
                                        <Label htmlFor="featured">Featured Course</Label>
                                        <input 
                                            type="hidden" 
                                            name="featured" 
                                            value={featured ? '1' : '0'}
                                        />
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

                                        {/* Price */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">Price (Rs.)</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="e.g., 5000"
                                                defaultValue={course.price ? Math.round(course.price) : ''}
                                                className="max-w-md"
                                            />
                                            <p className="text-xs text-muted-foreground">Enter price in Nepali Rupees (no decimals)</p>
                                            <InputError message={errors.price} />
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

                                                        {/* Hidden inputs for collapsed items - always present in form */}
                                                        {!expandedSessions.has(syllabusIndex) && (
                                                            <>
                                                                <input
                                                                    type="hidden"
                                                                    name={`syllabus[${syllabusIndex}][course_topic]`}
                                                                    value={row.course_topic || ''}
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name={`syllabus[${syllabusIndex}][hours]`}
                                                                    value={row.hours || ''}
                                                                />
                                                                {row.learnings.map((learning, learningIndex) => (
                                                                    <input
                                                                        key={learningIndex}
                                                                        type="hidden"
                                                                        name={`syllabus[${syllabusIndex}][learnings][${learningIndex}]`}
                                                                        value={learning || ''}
                                                                    />
                                                                ))}
                                                                {row.outcomes.map((outcome, outcomeIndex) => (
                                                                    <input
                                                                        key={outcomeIndex}
                                                                        type="hidden"
                                                                        name={`syllabus[${syllabusIndex}][outcomes][${outcomeIndex}]`}
                                                                        value={outcome || ''}
                                                                    />
                                                                ))}
                                                            </>
                                                        )}

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
                                        {/* Price */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">Price (Rs.)</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="e.g., 5000"
                                                value={price ?? ''}
                                                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null)}
                                                className="max-w-md"
                                            />
                                            <p className="text-xs text-muted-foreground">Enter price in Nepali Rupees (no decimals)</p>
                                            <InputError message={errors.price} />
                                        </div>

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

                                                        {/* Hidden inputs for collapsed topic and all its subtopics */}
                                                        {!expandedTopics.has(topicIndex) && (
                                                            <>
                                                                <input
                                                                    type="hidden"
                                                                    name={`topics[${topicIndex}][topic]`}
                                                                    value={topicRow.topic || ''}
                                                                />
                                                                {topicRow.subtopics.map((subtopic: any, subtopicIndex: number) => (
                                                                    <React.Fragment key={subtopicIndex}>
                                                                        <input
                                                                            type="hidden"
                                                                            name={`topics[${topicIndex}][subtopics][${subtopicIndex}][name]`}
                                                                            value={subtopic.name || ''}
                                                                        />
                                                                        <input
                                                                            type="hidden"
                                                                            name={`topics[${topicIndex}][subtopics][${subtopicIndex}][hours]`}
                                                                            value={subtopic.hours || 0}
                                                                        />
                                                                        <input
                                                                            type="hidden"
                                                                            name={`topics[${topicIndex}][subtopics][${subtopicIndex}][content]`}
                                                                            value={subtopic.content || ''}
                                                                        />
                                                                    </React.Fragment>
                                                                ))}
                                                            </>
                                                        )}

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

                                                                <div className="grid gap-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-base font-semibold">Subtopics *</Label>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => addSubtopic(topicIndex)}
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Add Subtopic
                                                                        </Button>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        {topicRow.subtopics.map((subtopic, subtopicIndex) => {
                                                                            const subtopicKey = `${topicIndex}-${subtopicIndex}`;
                                                                            const isExpanded = expandedSubtopics.has(subtopicKey);
                                                                            
                                                                            return (
                                                                                <div
                                                                                    key={subtopicIndex}
                                                                                    className="rounded-lg border bg-card p-4 space-y-4"
                                                                                    style={{ backgroundColor: '#eee' }}
                                                                                >
                                                                                    <div className="flex items-center justify-between">
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => toggleSubtopic(topicIndex, subtopicIndex)}
                                                                                            className="flex items-center gap-2"
                                                                                        >
                                                                                            {isExpanded ? (
                                                                                                <ChevronUp className="h-4 w-4" />
                                                                                            ) : (
                                                                                                <ChevronDown className="h-4 w-4" />
                                                                                            )}
                                                                                            Subtopic {subtopicIndex + 1}
                                                                                            {subtopic.name && (
                                                                                                <span className="text-muted-foreground"> - {subtopic.name}</span>
                                                                                            )}
                                                                                        </Button>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="icon"
                                                                                            onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                                                                                            disabled={topicRow.subtopics.length === 1}
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </div>

                                                                                    {/* Hidden inputs for collapsed subtopic */}
                                                                                    {!isExpanded && (
                                                                                        <>
                                                                                            <input
                                                                                                type="hidden"
                                                                                                name={`topics[${topicIndex}][subtopics][${subtopicIndex}][name]`}
                                                                                                value={subtopic.name || ''}
                                                                                            />
                                                                                            <input
                                                                                                type="hidden"
                                                                                                name={`topics[${topicIndex}][subtopics][${subtopicIndex}][hours]`}
                                                                                                value={subtopic.hours || 0}
                                                                                            />
                                                                                            <input
                                                                                                type="hidden"
                                                                                                name={`topics[${topicIndex}][subtopics][${subtopicIndex}][content]`}
                                                                                                value={subtopic.content || ''}
                                                                                            />
                                                                                        </>
                                                                                    )}

                                                                                    {isExpanded && (
                                                                                        <div className="space-y-4 pl-6 border-l-2 border-muted">
                                                                                            <div className="grid gap-2">
                                                                                                <Label>Subtopic Name *</Label>
                                                                                                <Input
                                                                                                    name={`topics[${topicIndex}][subtopics][${subtopicIndex}][name]`}
                                                                                                    value={subtopic.name}
                                                                                                    onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'name', e.target.value)}
                                                                                                    placeholder="e.g., Understanding SEO Basics"
                                                                                                    required
                                                                                                    className="w-full"
                                                                                                />
                                                                                                <InputError message={errors[`topics.${topicIndex}.subtopics.${subtopicIndex}.name` as keyof typeof errors]} />
                                                                                            </div>

                                                                                            <div className="grid gap-2 max-w-xs">
                                                                                                <Label>Hours *</Label>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    step="0.5"
                                                                                                    min="0"
                                                                                                    name={`topics[${topicIndex}][subtopics][${subtopicIndex}][hours]`}
                                                                                                    value={subtopic.hours || ''}
                                                                                                    onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'hours', Number(e.target.value) || 0)}
                                                                                                    placeholder="e.g., 1.5"
                                                                                                    required
                                                                                                />
                                                                                                <InputError message={errors[`topics.${topicIndex}.subtopics.${subtopicIndex}.hours` as keyof typeof errors]} />
                                                                                            </div>

                                                                                            <div className="grid gap-2">
                                                                                                <Label>Content *</Label>
                                                                                                <RichTextEditor
                                                                                                    value={subtopic.content}
                                                                                                    onChange={(value) => updateSubtopic(topicIndex, subtopicIndex, 'content', value)}
                                                                                                    placeholder="Write the full content for this subtopic..."
                                                                                                    name={`topics[${topicIndex}][subtopics][${subtopicIndex}][content]`}
                                                                                                />
                                                                                                <InputError message={errors[`topics.${topicIndex}.subtopics.${subtopicIndex}.content` as keyof typeof errors]} />
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {topicRow.subtopics.length === 0 && (
                                                                        <p className="text-sm text-muted-foreground">Add at least one subtopic to this topic.</p>
                                                                    )}
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

