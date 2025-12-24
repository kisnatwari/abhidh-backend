<?php

namespace App\Services\Enrollment;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\EnrollmentTopicProgress;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentProgressService
{
    /**
     * Ensure there is one progress row per subtopic for the given enrollment.
     *
     * @param  array<int, array<string, mixed>>  $topics
     */
    public function syncTopics(Enrollment $enrollment, array $topics): void
    {
        // Build payload for all subtopics
        $subtopicPayload = collect($topics)
            ->flatMap(function (array $topic, int $topicIndex) {
                $topicKey = $topic['title'] ?? $topic['topic'] ?? null;
                $normalizedKey = $topicKey ? Str::slug($topicKey) : null;
                $subtopics = $topic['subtopics'] ?? [];

                return collect($subtopics)->mapWithKeys(function ($subtopic, int $subtopicIndex) use ($topicIndex, $normalizedKey) {
                    return [
                        "{$topicIndex}-{$subtopicIndex}" => [
                            'topic_index' => $topicIndex,
                            'subtopic_index' => $subtopicIndex,
                            'topic_key' => $normalizedKey,
                        ],
                    ];
                });
            });

        DB::transaction(function () use ($enrollment, $subtopicPayload) {
            $existing = $enrollment->topicProgress()
                ->whereNotNull('subtopic_index')
                ->get()
                ->keyBy(function ($progress) {
                    return "{$progress->topic_index}-{$progress->subtopic_index}";
                });

            $subtopicPayload->each(function (array $payload) use ($enrollment, $existing) {
                $key = "{$payload['topic_index']}-{$payload['subtopic_index']}";
                
                if (! $existing->has($key)) {
                    $enrollment->topicProgress()->create([
                        'topic_index' => $payload['topic_index'],
                        'subtopic_index' => $payload['subtopic_index'],
                        'topic_key' => $payload['topic_key'],
                        'status' => 'not_started',
                    ]);
                } else {
                    $existingProgress = $existing->get($key);

                    if (
                        $payload['topic_key'] &&
                        $existingProgress &&
                        $existingProgress->topic_key !== $payload['topic_key']
                    ) {
                        $existingProgress->update([
                            'topic_key' => $payload['topic_key'],
                        ]);
                    }
                }
            });

            // Remove stale progress if subtopics were removed
            $validKeys = $subtopicPayload->keys()->all();
            $enrollment->topicProgress()
                ->whereNotNull('subtopic_index')
                ->get()
                ->filter(function ($progress) use ($validKeys) {
                    $key = "{$progress->topic_index}-{$progress->subtopic_index}";
                    return !in_array($key, $validKeys);
                })
                ->each(function ($progress) {
                    $progress->delete();
                });
        });
    }

    public function markTopicStarted(Enrollment $enrollment, int $topicIndex): EnrollmentTopicProgress
    {
        return $this->updateTopicStatus($enrollment, $topicIndex, 'in_progress', false);
    }

    public function markTopicCompleted(Enrollment $enrollment, int $topicIndex): EnrollmentTopicProgress
    {
        return $this->updateTopicStatus($enrollment, $topicIndex, 'completed', true);
    }

    public function markSubtopicStarted(Enrollment $enrollment, int $topicIndex, int $subtopicIndex): EnrollmentTopicProgress
    {
        return $this->updateSubtopicStatus($enrollment, $topicIndex, $subtopicIndex, 'in_progress', false);
    }

    public function markSubtopicCompleted(Enrollment $enrollment, int $topicIndex, int $subtopicIndex): EnrollmentTopicProgress
    {
        $progress = $this->updateSubtopicStatus($enrollment, $topicIndex, $subtopicIndex, 'completed', true);
        
        // Check if all subtopics in this topic are completed, then auto-complete the topic
        $this->checkAndCompleteTopic($enrollment, $topicIndex);
        
        return $progress;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function extractTopics(Course $course, bool $includeContent = true): array
    {
        if ($course->course_type !== 'self_paced') {
            return [];
        }

        return collect($course->topics ?: [])
            ->map(function ($topic, int $index) use ($includeContent) {
                if (is_string($topic)) {
                    return [
                        'id' => $index + 1,
                        'order' => $index,
                        'title' => $topic,
                        'duration' => null,
                        'content' => $includeContent ? $topic : null,
                        'subtopics' => [],
                    ];
                }

                if (! is_array($topic)) {
                    return null;
                }

                $title = $topic['topic'] ?? $topic['title'] ?? null;

                if (! $title) {
                    $title = 'Topic '.($index + 1);
                }

                // Handle new structure: subtopics are objects with name, content, hours
                // Also handle old structure for backward compatibility
                $subtopics = collect($topic['subtopics'] ?? [])
                    ->map(function ($subtopic, int $subIndex) use ($includeContent) {
                        // New format: subtopic is an object with name, content, hours
                        if (is_array($subtopic) && isset($subtopic['name'])) {
                            return [
                                'name' => $subtopic['name'] ?? '',
                                'content' => $includeContent ? ($subtopic['content'] ?? '') : '',
                                'hours' => $subtopic['hours'] ?? 0,
                            ];
                        }
                        // Old format: subtopic is a string
                        if (is_string($subtopic) && trim($subtopic) !== '') {
                            return [
                                'name' => $subtopic,
                                'content' => '',
                                'hours' => 0,
                            ];
                        }
                        return null;
                    })
                    ->filter()
                    ->values()
                    ->all();

                // For backward compatibility: if old format had content at topic level, use it
                $content = null;
                if ($includeContent) {
                    // New format: content is in subtopics
                    // Old format: content might be at topic level
                    if (isset($topic['content']) && !empty($topic['content'])) {
                        // Old format - content at topic level
                        $content = $topic['content'];
                    }
                }

                return [
                    'id' => $index + 1,
                    'order' => $index,
                    'title' => $title,
                    'duration' => null, // Duration is now at subtopic level (hours)
                    'content' => $content, // Content is now at subtopic level, but keep for backward compatibility
                    'subtopics' => $subtopics,
                ];
            })
            ->filter()
            ->values()
            ->map(function (array $topic, int $index) use ($includeContent) {
                $topic['order'] = $index;

                if (! $includeContent) {
                    $topic['content'] = null;
                    // Also remove content from subtopics
                    $topic['subtopics'] = collect($topic['subtopics'] ?? [])
                        ->map(function ($subtopic) {
                            $subtopic['content'] = null;
                            return $subtopic;
                        })
                        ->all();
                }

                return $topic;
            })
            ->all();
    }

    public function summarize(Collection $progress, int $topicCount, array $topics = []): array
    {
        // Count subtopic progress (where subtopic_index is not null)
        $subtopicProgress = $progress->whereNotNull('subtopic_index');
        $completed = $subtopicProgress->where('status', 'completed')->count();
        $inProgress = $subtopicProgress->where('status', 'in_progress')->count();
        
        // Calculate total subtopics
        $totalSubtopics = collect($topics)->sum(function ($topic) {
            return count($topic['subtopics'] ?? []);
        });
        
        $percent = $totalSubtopics > 0 ? round(($completed / $totalSubtopics) * 100) : 0;

        // Find next incomplete subtopic
        $nextTopicIndex = null;
        $nextSubtopicIndex = null;

        if (count($topics) > 0) {
            foreach ($topics as $topicIndex => $topic) {
                $subtopics = $topic['subtopics'] ?? [];
                foreach ($subtopics as $subtopicIndex => $subtopic) {
                    $subtopicProgress = $progress->firstWhere(function ($p) use ($topicIndex, $subtopicIndex) {
                        return $p->topic_index === $topicIndex 
                            && $p->subtopic_index === $subtopicIndex 
                            && $p->status === 'completed';
                    });

                    if (!$subtopicProgress) {
                        $nextTopicIndex = $topicIndex;
                        $nextSubtopicIndex = $subtopicIndex;
                        break 2;
                    }
                }
            }
        }

        return [
            'completed_count' => $completed,
            'in_progress_count' => $inProgress,
            'topic_count' => $topicCount,
            'subtopic_count' => $totalSubtopics,
            'percent_complete' => $percent,
            'next_topic_index' => $nextTopicIndex,
            'next_subtopic_index' => $nextSubtopicIndex,
        ];
    }

    protected function updateTopicStatus(Enrollment $enrollment, int $topicIndex, string $status, bool $markCompletion): EnrollmentTopicProgress
    {
        return DB::transaction(function () use ($enrollment, $topicIndex, $status, $markCompletion) {
            $progress = $enrollment->topicProgress()
                ->where('topic_index', $topicIndex)
                ->whereNull('subtopic_index')
                ->lockForUpdate()
                ->firstOrCreate(
                    ['topic_index' => $topicIndex, 'subtopic_index' => null],
                    ['status' => 'not_started']
                );

            $attributes = [
                'status' => $status,
                'last_viewed_at' => now(),
            ];

            if ($markCompletion) {
                $attributes['completed_at'] = now();
            }

            $progress->fill($attributes);
            $progress->save();

            return $progress;
        });
    }

    protected function updateSubtopicStatus(Enrollment $enrollment, int $topicIndex, int $subtopicIndex, string $status, bool $markCompletion): EnrollmentTopicProgress
    {
        return DB::transaction(function () use ($enrollment, $topicIndex, $subtopicIndex, $status, $markCompletion) {
            $progress = $enrollment->topicProgress()
                ->where('topic_index', $topicIndex)
                ->where('subtopic_index', $subtopicIndex)
                ->lockForUpdate()
                ->firstOrCreate(
                    ['topic_index' => $topicIndex, 'subtopic_index' => $subtopicIndex],
                    ['status' => 'not_started']
                );

            $attributes = [
                'status' => $status,
                'last_viewed_at' => now(),
            ];

            if ($markCompletion) {
                $attributes['completed_at'] = now();
            }

            $progress->fill($attributes);
            $progress->save();

            return $progress;
        });
    }

    protected function checkAndCompleteTopic(Enrollment $enrollment, int $topicIndex): void
    {
        // Get the course to count subtopics
        $course = $enrollment->course;
        if (!$course) {
            return;
        }

        $topics = $this->extractTopics($course, includeContent: false);
        if (!isset($topics[$topicIndex])) {
            return;
        }

        $topic = $topics[$topicIndex];
        $subtopics = $topic['subtopics'] ?? [];
        $subtopicCount = count($subtopics);

        if ($subtopicCount === 0) {
            return;
        }

        // Count completed subtopics for this topic
        $completedSubtopics = $enrollment->topicProgress()
            ->where('topic_index', $topicIndex)
            ->whereNotNull('subtopic_index')
            ->where('status', 'completed')
            ->count();

        // If all subtopics are completed, mark the topic as completed
        if ($completedSubtopics >= $subtopicCount) {
            $this->updateTopicStatus($enrollment, $topicIndex, 'completed', true);
        }
    }
}

