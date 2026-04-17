<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->comment('Contractor who reviews');
            $table->foreignId('reviewed_id')->constrained('users')->comment('Provider being reviewed');
            $table->tinyInteger('stars')->comment('1 to 5');
            $table->text('comment')->nullable();
            $table->enum('trigger', ['completed', 'cancelled'])->comment('What state allowed this review');
            $table->timestamps();

            $table->unique('contract_id'); // One review per contract
            $table->index(['reviewed_id', 'stars']);
            $table->index('service_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
