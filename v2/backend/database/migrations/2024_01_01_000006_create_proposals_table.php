<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contractor_id')->constrained('users');
            $table->foreignId('provider_id')->constrained('users');

            // Pricing — snapshot at proposal creation time
            $table->decimal('offered_price', 10, 2);
            $table->decimal('platform_fee_rate', 5, 4)->comment('e.g. 0.1500 = 15%');
            $table->decimal('platform_fee_amount', 10, 2);
            $table->decimal('provider_amount', 10, 2)->comment('What provider sees and receives');

            $table->text('description')->nullable();

            // Status flow: pending → accepted/rejected/cancelled → (accepted) → disputed/provider_completed
            $table->enum('status', [
                'pending',
                'accepted',
                'rejected',
                'cancelled',
                'completed',
                'disputed',
            ])->default('pending');

            // Schedule
            $table->enum('schedule_type', [
                'specific_slots',
                'any_time_on_day',
                'to_be_arranged',
            ])->default('specific_slots');

            $table->date('any_time_date')->nullable()->comment('Used when schedule_type = any_time_on_day');
            $table->boolean('schedule_agreed')->default(false)->comment('Required checkbox when to_be_arranged');
            $table->timestamp('schedule_agreed_at')->nullable();

            // Stripe
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->enum('payment_status', [
                'pending',       // PaymentIntent created, awaiting capture
                'captured',      // Captured on acceptance
                'transferred',   // Split done, provider paid
                'refunded',      // Cancelled before acceptance
                'disputed',      // Under admin review
            ])->default('pending');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['contractor_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['service_id', 'status']);
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
