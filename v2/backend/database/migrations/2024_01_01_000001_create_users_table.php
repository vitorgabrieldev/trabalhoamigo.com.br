<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->string('first_name', 60);
            $table->string('last_name', 80);
            $table->string('email', 100)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('cpf', 14)->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->string('landline', 20)->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('role', ['provider', 'contractor', 'admin'])->default('contractor');

            // Stripe Connect (providers only)
            $table->string('stripe_account_id')->nullable()->unique();
            $table->boolean('stripe_onboarding_completed')->default(false);
            $table->string('stripe_customer_id')->nullable()->unique();

            // 2FA
            $table->string('totp_secret', 50)->nullable();
            $table->boolean('totp_enabled')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['role', 'deleted_at']);
            $table->index('stripe_onboarding_completed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
