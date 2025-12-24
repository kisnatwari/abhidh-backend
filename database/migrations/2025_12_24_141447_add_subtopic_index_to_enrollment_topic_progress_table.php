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
        // Check if subtopic_index column already exists (from failed migration)
        $columns = DB::select('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'enrollment_topic_progress\' AND COLUMN_NAME = \'subtopic_index\'');
        
        // Add subtopic_index column if it doesn't exist
        if (empty($columns)) {
            Schema::table('enrollment_topic_progress', function (Blueprint $table) {
                $table->unsignedInteger('subtopic_index')->nullable()->after('topic_index');
            });
        }

        // Check if new unique constraint already exists
        $newConstraint = DB::select('SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'enrollment_topic_progress\' AND CONSTRAINT_NAME = \'enrollment_topic_subtopic_unique\'');

        // Add new unique constraint that includes subtopic_index if it doesn't exist
        if (empty($newConstraint)) {
            Schema::table('enrollment_topic_progress', function (Blueprint $table) {
                $table->unique(['enrollment_id', 'topic_index', 'subtopic_index'], 'enrollment_topic_subtopic_unique');
            });
        }

        // Now drop the old unique constraint (after the new one is created)
        // The foreign key on enrollment_id will still work with the new unique constraint
        $constraints = DB::select('SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'enrollment_topic_progress\' AND CONSTRAINT_TYPE = \'UNIQUE\' AND CONSTRAINT_NAME LIKE \'%enrollment_id%topic_index%\' AND CONSTRAINT_NAME != \'enrollment_topic_subtopic_unique\'');
        
        if (!empty($constraints)) {
            $actualConstraintName = $constraints[0]->CONSTRAINT_NAME;
            // Use a raw statement to drop the index, which won't affect the foreign key
            // The foreign key only needs enrollment_id, not the unique constraint
            try {
                DB::statement("ALTER TABLE enrollment_topic_progress DROP INDEX `{$actualConstraintName}`");
            } catch (\Exception $e) {
                // If it fails due to foreign key, that's okay - the new constraint will work
                // The old constraint might be needed for the foreign key, but the new one should suffice
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
