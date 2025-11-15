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
     * Ensure there is one progress row per topic for the given enrollment.
     *
     * @param  array<int, array<string, mixed>>  $topics
     */
    public function syncTopics(Enrollment $enrollment, array $topics): void
    {
        $topicPayload = collect($topics)
            ->mapWithKeys(function (array $topic, int $index) {
                $topicKey = $topic['title'] ?? $topic['topic'] ?? null;
                $normalizedKey = $topicKey ? Str::slug($topicKey) : null;

                return [
                    $index => [
                        'topic_index' => $index,
                        'topic_key' => $normalizedKey,
                    ],
                ];
            });

        DB::transaction(function () use ($enrollment, $topicPayload) {
            $existing = $enrollment->topicProgress()
                ->get()
                ->keyBy('topic_index');

            $topicPayload->each(function (array $payload, int $topicIndex) use ($enrollment, $existing) {
                if (! $existing->has($topicIndex)) {
                    $enrollment->topicProgress()->create([
                        'topic_index' => $payload['topic_index'],
                        'topic_key' => $payload['topic_key'],
                        'status' => 'not_started',
                    ]);
                } else {
                    $existingProgress = $existing->get($topicIndex);

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

            // Remove stale progress if topics were removed.
            $topicIndexes = $topicPayload->keys()->all();

            $enrollment->topicProgress()
                ->whereNotIn('topic_index', $topicIndexes)
                ->delete();
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

                $content = $includeContent ? ($topic['content'] ?? null) : null;

                return [
                    'id' => $index + 1,
                    'order' => $index,
                    'title' => $title,
                    'duration' => $topic['duration'] ?? null,
                    'content' => $content,
                    'subtopics' => collect($topic['subtopics'] ?? [])
                        ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                        ->values()
                        ->all(),
                ];
            })
            ->filter()
            ->values()
            ->map(function (array $topic, int $index) use ($includeContent) {
                $topic['order'] = $index;

                if (! $includeContent) {
                    $topic['content'] = null;
                }

                return $topic;
            })
            ->all();
    }

    public function summarize(Collection $progress, int $topicCount): array
    {
        $completed = $progress->where('status', 'completed')->count();
        $inProgress = $progress->where('status', 'in_progress')->count();
        $percent = $topicCount > 0 ? round(($completed / $topicCount) * 100) : 0;

        $nextTopicIndex = null;

        if ($topicCount > 0) {
            for ($i = 0; $i < $topicCount; $i++) {
                $topicProgress = $progress->firstWhere('topic_index', $i);

                if (! $topicProgress || $topicProgress->status !== 'completed') {
                    $nextTopicIndex = $i;
                    break;
                }
            }
        }

        return [
            'completed_count' => $completed,
            'in_progress_count' => $inProgress,
            'topic_count' => $topicCount,
            'percent_complete' => $percent,
            'next_topic_index' => $nextTopicIndex,
        ];
    }

    protected function updateTopicStatus(Enrollment $enrollment, int $topicIndex, string $status, bool $markCompletion): EnrollmentTopicProgress
    {
        return DB::transaction(function () use ($enrollment, $topicIndex, $status, $markCompletion) {
            $progress = $enrollment->topicProgress()
                ->lockForUpdate()
                ->firstOrCreate(
                    ['topic_index' => $topicIndex],
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
}

