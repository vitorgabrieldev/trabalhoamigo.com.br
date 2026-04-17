<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raised_by_id')->constrained('users')->comment('Contractor who opened dispute');
            $table->text('reason');
            $table->text('provider_response')->nullable();
            $table->timestamp('provider_responded_at')->nullable();

            // Admin fields (panel built later — schema prepared now)
            $table->enum('status', [
                'pending',           // Waiting admin
                'under_review',      // Admin reviewing
                'resolved_refunded', // Outcome: refund contractor
                'resolved_paid',     // Outcome: pay provider
                'closed',            // Closed without action
            ])->default('pending');

            $table->text('admin_notes')->nullable();
            $table->foreignId('resolved_by_id')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->unique('contract_id'); // One dispute per contract
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
