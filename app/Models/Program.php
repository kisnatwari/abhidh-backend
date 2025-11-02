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

    /**
     * Convert Tailwind color class to hex code
     */
    public function getColorHexAttribute(): ?string
    {
        if (!$this->color) {
            return null;
        }

        // Mapping of Tailwind color classes to hex codes
        $colorMap = [
            // Blue shades
            'bg-blue-50' => '#eff6ff',
            'bg-blue-100' => '#dbeafe',
            'bg-blue-200' => '#bfdbfe',
            'bg-blue-300' => '#93c5fd',
            'bg-blue-400' => '#60a5fa',
            'bg-blue-500' => '#3b82f6',
            'bg-blue-600' => '#2563eb',
            'bg-blue-700' => '#1d4ed8',
            'bg-blue-800' => '#1e40af',
            'bg-blue-900' => '#1e3a8a',
            
            // Green shades
            'bg-green-50' => '#f0fdf4',
            'bg-green-100' => '#dcfce7',
            'bg-green-200' => '#bbf7d0',
            'bg-green-300' => '#86efac',
            'bg-green-400' => '#4ade80',
            'bg-green-500' => '#22c55e',
            'bg-green-600' => '#16a34a',
            'bg-green-700' => '#15803d',
            'bg-green-800' => '#166534',
            'bg-green-900' => '#14532d',
            
            // Purple shades
            'bg-purple-50' => '#faf5ff',
            'bg-purple-100' => '#f3e8ff',
            'bg-purple-200' => '#e9d5ff',
            'bg-purple-300' => '#d8b4fe',
            'bg-purple-400' => '#c084fc',
            'bg-purple-500' => '#a855f7',
            'bg-purple-600' => '#9333ea',
            'bg-purple-700' => '#7e22ce',
            'bg-purple-800' => '#6b21a8',
            'bg-purple-900' => '#581c87',
            
            // Red shades
            'bg-red-50' => '#fef2f2',
            'bg-red-100' => '#fee2e2',
            'bg-red-200' => '#fecaca',
            'bg-red-300' => '#fca5a5',
            'bg-red-400' => '#f87171',
            'bg-red-500' => '#ef4444',
            'bg-red-600' => '#dc2626',
            'bg-red-700' => '#b91c1c',
            'bg-red-800' => '#991b1b',
            'bg-red-900' => '#7f1d1d',
            
            // Yellow shades
            'bg-yellow-50' => '#fefce8',
            'bg-yellow-100' => '#fef9c3',
            'bg-yellow-200' => '#fef08a',
            'bg-yellow-300' => '#fde047',
            'bg-yellow-400' => '#facc15',
            'bg-yellow-500' => '#eab308',
            'bg-yellow-600' => '#ca8a04',
            'bg-yellow-700' => '#a16207',
            'bg-yellow-800' => '#854d0e',
            'bg-yellow-900' => '#713f12',
            
            // Indigo shades
            'bg-indigo-50' => '#eef2ff',
            'bg-indigo-100' => '#e0e7ff',
            'bg-indigo-200' => '#c7d2fe',
            'bg-indigo-300' => '#a5b4fc',
            'bg-indigo-400' => '#818cf8',
            'bg-indigo-500' => '#6366f1',
            'bg-indigo-600' => '#4f46e5',
            'bg-indigo-700' => '#4338ca',
            'bg-indigo-800' => '#3730a3',
            'bg-indigo-900' => '#312e81',
        ];

        // Check if it's already a hex code
        if (preg_match('/^#[0-9A-Fa-f]{6}$/', $this->color)) {
            return $this->color;
        }

        // Return hex code from map, or null if not found
        return $colorMap[$this->color] ?? null;
    }
}


