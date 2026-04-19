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
        Schema::table('contracts', function (Blueprint $table) {
            $table->text('provider_completion_note')->nullable()->after('provider_completed_at');
            $table->text('contractor_completion_note')->nullable()->after('contractor_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['provider_completion_note', 'contractor_completion_note']);
        });
    }
};
