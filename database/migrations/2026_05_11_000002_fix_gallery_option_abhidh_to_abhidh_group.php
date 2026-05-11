<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('galleries')
            ->where('option', 'Abhidh')
            ->update(['option' => 'Abhidh Group']);
    }

    public function down(): void
    {
        DB::table('galleries')
            ->where('option', 'Abhidh Group')
            ->update(['option' => 'Abhidh']);
    }
};
