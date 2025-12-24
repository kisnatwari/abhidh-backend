<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'abhidhgroup@gmail.com'],
            [
                'name' => 'Abhidh Group Admin',
                'password' => Hash::make('AbhidhGroup@2025'),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'kisnatwari@gmail.com'],
            [
                'name' => 'Krishna Tiwari',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]
        );
    }
}
