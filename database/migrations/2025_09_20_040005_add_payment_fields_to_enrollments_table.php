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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('payment_screenshot_path')->nullable()->after('is_paid');
            $table->boolean('payment_verified')->default(false)->after('payment_screenshot_path');
            $table->timestamp('payment_verified_at')->nullable()->after('payment_verified');
            $table->foreignId('verified_by')->nullable()->after('payment_verified_at')->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['payment_screenshot_path', 'payment_verified', 'payment_verified_at', 'verified_by']);
        });
    }
};

