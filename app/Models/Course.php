<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_type',
        'title',
        'description',
        'duration',
        'target_audience',
        'key_learning_objectives',
        'syllabus',
        'topics',
        'program_id',
        'featured',
    ];

    protected $casts = [
        'syllabus' => 'array',
        'topics' => 'array',
        'key_learning_objectives' => 'array',
        'featured' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function getCourseTypeLabelAttribute(): string
    {
        return match($this->course_type) {
            'guided' => 'Guided Course',
            'self_paced' => 'Self-Paced Course',
            default => ucfirst($this->course_type),
        };
    }
}
