<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('contractor_id')->constrained('users');
            $table->foreignId('provider_id')->constrained('users');

            // Stripe references
            $table->string('stripe_payment_intent_id')->unique();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_transfer_id')->nullable()->comment('Transfer to provider');

            // Financial
            $table->integer('amount_cents')->comment('Total charged in cents (BRL)');
            $table->integer('platform_fee_cents');
            $table->integer('provider_amount_cents');
            $table->decimal('fee_rate', 5, 4);
            $table->string('currency', 3)->default('brl');

            $table->enum('status', [
                'pending',
                'captured',
                'transferred',
                'refunded',
                'partially_refunded',
                'disputed',
            ])->default('pending');

            $table->boolean('is_community')->default(false)->comment('Community = no fee');

            $table->timestamp('captured_at')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            $table->timestamps();

            $table->index(['contractor_id', 'status']);
            $table->index(['provider_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
