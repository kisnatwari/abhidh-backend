<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BlogFactory extends Factory
{
    protected $model = Blog::class;

    public function definition(): array
    {
        $title = $this->faker->sentence;

        return [
            'title'        => $title,
            'slug'         => Str::slug($title) . '-' . Str::random(5),
            'category'     => $this->faker->word,
            'content'      => $this->faker->paragraphs(5, true), // mock RTE HTML/text
            //'user_id'      => User::factory(),
            'published_at' => $this->faker->optional()->dateTimeThisYear(),
            'is_published' => $this->faker->boolean(70),
        ];
    }
}
