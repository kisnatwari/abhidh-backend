<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'color',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            'school' => 'School',
            'college' => 'College',
            'corporate' => 'Corporate',
            'it' => 'IT',
            'digital_marketing' => 'Digital Marketing',
            default => ucfirst($this->category),
        };
    }
}


