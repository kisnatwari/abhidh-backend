<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            [
                'name' => 'Sarah Johnson',
                'designation' => 'Creative Director',
                'years_of_experience' => 8,
            ],
            [
                'name' => 'Michael Chen',
                'designation' => 'Lead Developer',
                'years_of_experience' => 10,
            ],
            [
                'name' => 'Emily Rodriguez',
                'designation' => 'Marketing Strategist',
                'years_of_experience' => 6,
            ],
            [
                'name' => 'David Kim',
                'designation' => 'UX/UI Designer',
                'years_of_experience' => 7,
            ],
            [
                'name' => 'Jessica Williams',
                'designation' => 'Content Manager',
                'years_of_experience' => 5,
            ],
            [
                'name' => 'Robert Taylor',
                'designation' => 'Project Manager',
                'years_of_experience' => 9,
            ],
            [
                'name' => 'Amanda Brown',
                'designation' => 'Brand Strategist',
                'years_of_experience' => 6,
            ],
            [
                'name' => 'James Wilson',
                'designation' => 'Full Stack Developer',
                'years_of_experience' => 8,
            ],
            [
                'name' => 'Lisa Anderson',
                'designation' => 'Social Media Manager',
                'years_of_experience' => 4,
            ],
            [
                'name' => 'Christopher Martinez',
                'designation' => 'SEO Specialist',
                'years_of_experience' => 5,
            ],
            [
                'name' => 'Nicole Thompson',
                'designation' => 'Graphic Designer',
                'years_of_experience' => 6,
            ],
            [
                'name' => 'Daniel Garcia',
                'designation' => 'DevOps Engineer',
                'years_of_experience' => 7,
            ],
        ];

        foreach ($teams as $team) {
            Team::firstOrCreate(
                ['name' => $team['name']],
                $team
            );
        }

        $this->command->info('TeamSeeder completed successfully!');
        $this->command->info('Created ' . count($teams) . ' team members.');
    }
}

