<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->enum('course_type', ['guided', 'self_paced']);
            $table->string('title');
            $table->text('description')->nullable(); // For both course types
            $table->string('duration')->nullable(); // For guided courses total duration (e.g., "19 Hours")
            $table->text('target_audience')->nullable(); // For guided courses
            $table->json('key_learning_objectives')->nullable(); // JSON array for guided courses
            $table->json('syllabus')->nullable(); // For guided courses - array of session objects
            $table->json('topics')->nullable(); // For self-paced - array of topic objects with content
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->dropForeign(['program_id']);
            });
        }
        Schema::dropIfExists('courses');
    }
};
