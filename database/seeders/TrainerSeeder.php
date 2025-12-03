<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainers = [
            [
                'name' => 'Dr. Priya Sharma',
                'expertise' => 'Mathematics & Statistics',
                'years_of_experience' => 15,
            ],
            [
                'name' => 'Prof. Rajesh Kumar',
                'expertise' => 'Computer Science & Programming',
                'years_of_experience' => 12,
            ],
            [
                'name' => 'Dr. Anjali Patel',
                'expertise' => 'Web Development & Full Stack',
                'years_of_experience' => 10,
            ],
            [
                'name' => 'Mr. Vikram Singh',
                'expertise' => 'Data Science & Analytics',
                'years_of_experience' => 8,
            ],
            [
                'name' => 'Dr. Meera Nair',
                'expertise' => 'Digital Marketing & SEO',
                'years_of_experience' => 9,
            ],
            [
                'name' => 'Prof. Arjun Reddy',
                'expertise' => 'Mobile App Development',
                'years_of_experience' => 11,
            ],
            [
                'name' => 'Ms. Kavita Desai',
                'expertise' => 'UI/UX Design',
                'years_of_experience' => 7,
            ],
            [
                'name' => 'Dr. Suresh Iyer',
                'expertise' => 'Cloud Computing & DevOps',
                'years_of_experience' => 13,
            ],
            [
                'name' => 'Prof. Neha Gupta',
                'expertise' => 'Machine Learning & AI',
                'years_of_experience' => 10,
            ],
            [
                'name' => 'Mr. Aditya Joshi',
                'expertise' => 'Cybersecurity',
                'years_of_experience' => 8,
            ],
        ];

        foreach ($trainers as $trainer) {
            Trainer::firstOrCreate(
                ['name' => $trainer['name']],
                $trainer
            );
        }

        $this->command->info('TrainerSeeder completed successfully!');
        $this->command->info('Created ' . count($trainers) . ' trainers.');
    }
}

