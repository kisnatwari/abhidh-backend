import * as React from 'react';
import { useForm, router } from '@inertiajs/react';
import { useCallback } from 'react';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function AddCourseDialog({ 
    programs, 
    trigger 
}: { 
    programs: { id: number; name: string }[];
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_type: 'guided' as 'guided' | 'self_paced',
        title: '',
        program_id: null as number | null,
        featured: false,
        price: null as number | null,
        // Guided course fields
        description: '',
        duration: '',
        target_audience: '',
        key_learning_objectives: [''] as string[],
        syllabus: [{ session: 1, course_topic: '', learnings: [''], outcomes: [''], hours: 0 }] as SyllabusRow[],
        // Self-paced course fields
        topics: [{ topic: '', subtopics: [''], duration: '', content: '' }] as TopicRow[],
    });

    const resetForm = () => {
        reset();
        setOpen(false);
    };

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
    };

    const removeSyllabusRow = (index: number) => {
        if (data.syllabus.length === 1) return;
        const newSyllabus = data.syllabus.filter((_, i) => i !== index);
        newSyllabus.forEach((row, i) => { row.session = i + 1; });
        setData('syllabus', newSyllabus);
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
    };

    const removeTopic = (index: number) => {
        if (data.topics.length === 1) return;
        setData('topics', data.topics.filter((_, i) => i !== index));
    };

    const updateTopic = React.useCallback((index: number, field: keyof TopicRow, value: any) => {
        setData((prevData) => {
            const newTopics = [...prevData.topics];
            if (field === 'subtopics' && Array.isArray(value)) {
                newTopics[index] = { ...newTopics[index], subtopics: value };
            } else {
                newTopics[index] = { ...newTopics[index], [field]: value };
            }
            return { ...prevData, topics: newTopics };
        });
    }, [setData]);

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
            submitData.topics = data.topics.map(row => ({
                topic: row.topic,
                subtopics: row.subtopics.filter(s => s.trim() !== ''),
                duration: row.duration || null,
                content: row.content,
            }));
        }

        router.post(CourseController.store.url(), submitData, {
            onSuccess: () => {
                resetForm();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm();
                setOpen(v);
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? <Button>New Course</Button>}
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Create Course</DialogTitle>
                        <DialogDescription>
                            Add a new course. Choose between Guided or Self-Paced course.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Course Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="course_type">Course Type</Label>
                        <Select
                            value={data.course_type}
                            onValueChange={(value: 'guided' | 'self_paced') => setData('course_type', value)}
                            required
                        >
                            <SelectTrigger>
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
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Course Title"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    {/* Program */}
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

                    {/* Featured */}
                    <div className="flex items-center gap-2">
                        <Switch
                            id="featured"
                            checked={data.featured}
                            onCheckedChange={(checked) => setData('featured', checked)}
                        />
                        <Label htmlFor="featured">Featured Course</Label>
                    </div>

                    {/* Guided Course Form */}
                    {data.course_type === 'guided' && (
                                <>
                                    {/* Description */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Course Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            required
                                            placeholder="Describe the course..."
                                            rows={5}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Duration */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration">Duration</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            placeholder="e.g., 19 Hours, 2 weeks"
                                            value={data.duration}
                                            onChange={(e) => setData('duration', e.target.value)}
                                        />
                                        <InputError message={errors.duration} />
                                    </div>

                                    {/* Target Audience */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_audience">Target Audience</Label>
                                        <Textarea
                                            id="target_audience"
                                            name="target_audience"
                                            required
                                            placeholder="HR Professionals, Managers, Team Leaders"
                                            rows={3}
                                            value={data.target_audience}
                                            onChange={(e) => setData('target_audience', e.target.value)}
                                        />
                                        <InputError message={errors.target_audience} />
                                    </div>

                                    {/* Key Learning Objectives */}
                                    <div className="grid gap-2">
                                        <Label>Key Learning Objectives</Label>
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

                                    {/* Syllabus Table */}
                                    <div className="grid gap-2">
                                        <Label>Syllabus</Label>
                                        <div className="rounded-md border">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Session</th>
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Course Topic</th>
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Learnings</th>
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Outcomes</th>
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Hours</th>
                                                            <th className="px-3 py-2 text-left text-sm font-medium">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.syllabus.map((row, syllabusIndex) => (
                                                            <tr key={syllabusIndex} className="border-b">
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        name={`syllabus[${syllabusIndex}][session]`}
                                                                        value={row.session}
                                                                        onChange={(e) => updateSyllabusRow(syllabusIndex, 'session', Number(e.target.value))}
                                                                        className="w-20"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        name={`syllabus[${syllabusIndex}][course_topic]`}
                                                                        value={row.course_topic}
                                                                        onChange={(e) => updateSyllabusRow(syllabusIndex, 'course_topic', e.target.value)}
                                                                        placeholder="Course Topic"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="space-y-1 min-w-[300px]">
                                                                        {row.learnings.map((learning, learningIndex) => (
                                                                            <div key={learningIndex} className="flex gap-1">
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
                                                                                />
                                                                                {row.learnings.length > 1 && (
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="outline"
                                                                                        size="icon"
                                                                                        onClick={() => removeLearning(syllabusIndex, learningIndex)}
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => addLearning(syllabusIndex)}
                                                                            className="w-full text-xs"
                                                                        >
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Add Learning
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="space-y-1 min-w-[300px]">
                                                                        {row.outcomes.map((outcome, outcomeIndex) => (
                                                                            <div key={outcomeIndex} className="flex gap-1">
                                                                                <Input
                                                                                    name={`syllabus[${syllabusIndex}][outcomes][${outcomeIndex}]`}
                                                                                    value={outcome}
                                                                                    onChange={(e) => {
                                                                                        const newOutcomes = [...row.outcomes];
                                                                                        newOutcomes[outcomeIndex] = e.target.value;
                                                                                        updateSyllabusRow(syllabusIndex, 'outcomes', newOutcomes);
                                                                                    }}
                                                                                    placeholder="Outcome"
                                                                                />
                                                                                {row.outcomes.length > 1 && (
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="outline"
                                                                                        size="icon"
                                                                                        onClick={() => removeOutcome(syllabusIndex, outcomeIndex)}
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => addOutcome(syllabusIndex)}
                                                                            className="w-full text-xs"
                                                                        >
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Add Outcome
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.5"
                                                                        name={`syllabus[${syllabusIndex}][hours]`}
                                                                        value={row.hours || ''}
                                                                        onChange={(e) => updateSyllabusRow(syllabusIndex, 'hours', Number(e.target.value))}
                                                                        className="w-20"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => removeSyllabusRow(syllabusIndex)}
                                                                        disabled={data.syllabus.length === 1}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSyllabusRow}
                                            className="w-fit"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Session
                                        </Button>
                                        <InputError message={errors.syllabus} />
                                    </div>
                                </>
                            )}

                            {/* Self-Paced Course Form */}
                            {data.course_type === 'self_paced' && (
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
                                            value={data.price ?? ''}
                                            onChange={(e) => setData('price', e.target.value ? Number(e.target.value) : null)}
                                        />
                                        <p className="text-xs text-muted-foreground">Enter price in Nepali Rupees (no decimals)</p>
                                        <InputError message={errors.price} />
                                    </div>

                                    {/* Topics Table */}
                                    <div className="grid gap-2">
                                        <Label>Topics</Label>
                                        <div className="space-y-4">
                                            {data.topics.map((topicRow, topicIndex) => (
                                                <div key={topicIndex} className="rounded-md border p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Topic {topicIndex + 1}</h4>
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

                                                    {/* Topic Name */}
                                                    <div className="grid gap-2">
                                                        <Label>Topic Name</Label>
                                                        <Input
                                                            name={`topics[${topicIndex}][topic]`}
                                                            value={topicRow.topic}
                                                            onChange={(e) => updateTopic(topicIndex, 'topic', e.target.value)}
                                                            placeholder="e.g., Introduction to Digital Marketing"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Duration */}
                                                    <div className="grid gap-2">
                                                        <Label>Duration</Label>
                                                        <Input
                                                            name={`topics[${topicIndex}][duration]`}
                                                            value={topicRow.duration}
                                                            onChange={(e) => updateTopic(topicIndex, 'duration', e.target.value)}
                                                            placeholder="e.g., 1.5 hrs, 2 hrs"
                                                        />
                                                    </div>

                                                    {/* Subtopics */}
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
                                                                    />
                                                                    {topicRow.subtopics.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
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
                                                    </div>

                                                    {/* Content (RTE) */}
                                                    <div className="grid gap-2">
                                                        <Label>Content</Label>
                                                        <RichTextEditor
                                                            value={topicRow.content}
                                                            onChange={(value) => updateTopic(topicIndex, 'content', value)}
                                                            placeholder="Write the full content for this topic..."
                                                            name={`topics[${topicIndex}][content]`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTopic}
                                            className="w-fit"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Topic
                                        </Button>
                                        <InputError message={errors.topics} />
                                    </div>
                                </>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Course
                                </Button>
                            </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

