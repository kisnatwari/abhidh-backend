<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentTopicProgress extends Model
{
    use HasFactory;

    protected $table = 'enrollment_topic_progress';

    protected $fillable = [
        'enrollment_id',
        'topic_index',
        'topic_key',
        'status',
        'last_viewed_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'last_viewed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}


