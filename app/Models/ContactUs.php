<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ContactUs extends Model
{
    use HasFactory;

    protected $table = 'contact_us';

    protected $fillable = [
        'source',
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'courses',
        'is_replied',
        'replied_at',
        'reply_message',
        'replied_by',
    ];

    protected $casts = [
        'is_replied' => 'boolean',
        'replied_at' => 'datetime',
    ];

    protected $appends = [
        'created_at_human',
        'replied_at_human',
    ];

    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    public function getCreatedAtHumanAttribute(): ?string
    {
        return $this->created_at ? $this->created_at->diffForHumans() : null;
    }

    public function getRepliedAtHumanAttribute(): ?string
    {
        return $this->replied_at ? $this->replied_at->diffForHumans() : null;
    }
}
