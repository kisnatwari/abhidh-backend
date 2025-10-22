<?php

namespace Database\Factories;

use App\Models\Trainer;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainerFactory extends Factory
{
    protected $model = Trainer::class;

    public function definition(): array
    {
        $expertiseOptions = [
            'Personal Training',
            'Yoga Instructor',
            'CrossFit Coach',
            'Pilates Instructor',
            'Boxing Trainer',
            'Swimming Coach',
            'Dance Instructor',
            'Martial Arts',
            'Nutrition Coach',
            'Strength Training'
        ];

        return [
            'name' => $this->faker->name,
            'expertise' => $this->faker->randomElement($expertiseOptions),
            'years_of_experience' => $this->faker->numberBetween(1, 20),
        ];
    }
}
