<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add subtopic_index column if it doesn't exist
        if (!Schema::hasColumn('enrollment_topic_progress', 'subtopic_index')) {
            Schema::table('enrollment_topic_progress', function (Blueprint $table) {
                $table->unsignedInteger('subtopic_index')->nullable()->after('topic_index');
            });
        }

        // Add new unique constraint that includes subtopic_index if it doesn't exist
        // Note: SQLite doesn't support adding unique constraints after table creation in the same way, 
        // but Laravel's Schema handles it. However, checking if it exists is tricky in a DB-agnostic way.
        // We'll wrap in try-catch or just use a standard Schema call.
        try {
            Schema::table('enrollment_topic_progress', function (Blueprint $table) {
                $table->unique(['enrollment_id', 'topic_index', 'subtopic_index'], 'enrollment_topic_subtopic_unique');
            });
        } catch (\Exception $e) {
            // Already exists or not supported
        }

        // Standard Laravel way to drop indexes/constraints
        // For SQLite, we might skip dropping if it's too complex, or just use Schema
        if (DB::getDriverName() === 'mysql') {
            $constraints = DB::select('SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'enrollment_topic_progress\' AND CONSTRAINT_TYPE = \'UNIQUE\' AND CONSTRAINT_NAME LIKE \'%enrollment_id%topic_index%\' AND CONSTRAINT_NAME != \'enrollment_topic_subtopic_unique\'');
            
            if (!empty($constraints)) {
                $actualConstraintName = $constraints[0]->CONSTRAINT_NAME;
                try {
                    DB::statement("ALTER TABLE enrollment_topic_progress DROP INDEX `{$actualConstraintName}`");
                } catch (\Exception $e) {}
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollment_topic_progress', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('enrollment_topic_subtopic_unique');
        });

        // Restore the old unique constraint
        Schema::table('enrollment_topic_progress', function (Blueprint $table) {
            $table->unique(['enrollment_id', 'topic_index']);
        });

        // Remove subtopic_index column
        Schema::table('enrollment_topic_progress', function (Blueprint $table) {
            $table->dropColumn('subtopic_index');
        });
    }
};
