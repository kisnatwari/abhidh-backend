<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        $levels = ['beginner', 'intermediate', 'advanced', 'all_levels'];
        $durations = ['2 hours', '4 hours', '6 hours', '8 hours', '12 weeks', '16 weeks', '24 weeks'];

        return [
            'program_id' => Program::factory(),
            'name' => $this->faker->words(4, true),
            'description' => $this->faker->paragraphs(3, true),
            'duration' => $this->faker->randomElement($durations),
            'level' => $this->faker->randomElement($levels),
            'featured' => $this->faker->boolean(30), // 30% chance of being featured
        ];
    }
}


