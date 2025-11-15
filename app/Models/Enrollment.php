<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'enrollment_date',
        'status',
        'is_paid',
        'payment_screenshot_path',
        'payment_verified',
        'payment_verified_at',
        'verified_by',
    ];

    protected $casts = [
        'enrollment_date' => 'datetime',
        'is_paid' => 'boolean',
        'payment_verified' => 'boolean',
        'payment_verified_at' => 'datetime',
    ];

    protected $appends = ['payment_screenshot_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function topicProgress(): HasMany
    {
        return $this->hasMany(EnrollmentTopicProgress::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'completed' => 'Completed',
            'dropped' => 'Dropped',
            default => ucfirst($this->status),
        };
    }

    public function getPaymentScreenshotUrlAttribute(): ?string
    {
        return $this->payment_screenshot_path
            ? \Storage::disk('public')->url($this->payment_screenshot_path)
            : null;
    }
}


