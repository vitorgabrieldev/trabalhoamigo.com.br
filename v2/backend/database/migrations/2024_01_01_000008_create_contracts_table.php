<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('proposal_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained();
            $table->foreignId('contractor_id')->constrained('users');
            $table->foreignId('provider_id')->constrained('users');

            // Agreed values (snapshot from proposal)
            $table->decimal('agreed_price', 10, 2);
            $table->decimal('platform_fee_rate', 5, 4);
            $table->decimal('platform_fee_amount', 10, 2);
            $table->decimal('provider_amount', 10, 2);

            // Agreed schedule
            $table->timestamp('scheduled_at')->nullable();

            // Status flow
            $table->enum('status', [
                'active',               // Accepted, work in progress
                'provider_completed',   // Provider marked as done, waiting contractor
                'contractor_confirmed', // Contractor confirmed — triggers transfer
                'auto_completed',       // 3-day grace period expired — triggers transfer
                'cancelled',            // Cancelled after acceptance (dispute outcome)
                'disputed',             // Under admin analysis
            ])->default('active');

            // Completion timestamps
            $table->timestamp('provider_completed_at')->nullable();
            $table->timestamp('contractor_confirmed_at')->nullable();
            $table->timestamp('auto_release_at')->nullable()->comment('provider_completed_at + 3 days');
            $table->timestamp('transferred_at')->nullable();

            // Stripe Transfer IDs
            $table->string('stripe_transfer_provider_id')->nullable();
            $table->string('stripe_transfer_platform_id')->nullable();

            $table->timestamps();

            $table->index(['contractor_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index('auto_release_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
