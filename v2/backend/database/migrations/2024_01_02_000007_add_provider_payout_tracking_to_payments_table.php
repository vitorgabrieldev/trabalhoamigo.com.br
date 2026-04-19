<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider_payout_status', 30)->default('not_eligible')->after('status');
            $table->timestamp('provider_payout_eligible_at')->nullable()->after('transferred_at');
            $table->timestamp('provider_payout_paid_at')->nullable()->after('provider_payout_eligible_at');
            $table->string('provider_payout_reference', 120)->nullable()->after('provider_payout_paid_at');

            $table->index('provider_payout_status');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['provider_payout_status']);
            $table->dropColumn([
                'provider_payout_status',
                'provider_payout_eligible_at',
                'provider_payout_paid_at',
                'provider_payout_reference',
            ]);
        });
    }
};
