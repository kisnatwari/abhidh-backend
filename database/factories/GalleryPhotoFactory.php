<?php

namespace Database\Factories;

use App\Models\Gallery;
use App\Models\GalleryPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

class GalleryPhotoFactory extends Factory
{
    protected $model = GalleryPhoto::class;

    public function definition(): array
    {
        return [
            'gallery_id' => Gallery::factory(),
            'photo_path' => 'galleries/' . $this->faker->uuid() . '.jpg',
            'caption' => $this->faker->optional(0.7)->sentence(),
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
