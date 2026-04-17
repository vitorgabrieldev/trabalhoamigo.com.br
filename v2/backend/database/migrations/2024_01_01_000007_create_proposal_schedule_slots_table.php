<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_schedule_slots', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->date('proposed_date');
            $table->enum('time_type', ['specific_time', 'all_day'])->default('specific_time');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_selected')->default(false)->comment('Provider selects which slot to confirm');
            $table->timestamps();

            $table->index(['proposal_id', 'proposed_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_schedule_slots');
    }
};
