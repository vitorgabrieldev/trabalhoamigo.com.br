<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bank_holder_name', 120)->nullable()->after('stripe_customer_id');
            $table->string('bank_holder_document', 20)->nullable()->after('bank_holder_name');
            $table->string('bank_name', 120)->nullable()->after('bank_holder_document');
            $table->string('bank_code', 10)->nullable()->after('bank_name');
            $table->string('bank_agency', 20)->nullable()->after('bank_code');
            $table->string('bank_agency_digit', 4)->nullable()->after('bank_agency');
            $table->string('bank_account_number', 30)->nullable()->after('bank_agency_digit');
            $table->string('bank_account_digit', 4)->nullable()->after('bank_account_number');
            $table->string('bank_account_type', 20)->nullable()->after('bank_account_digit');
            $table->string('bank_pix_key', 120)->nullable()->after('bank_account_type');
            $table->boolean('bank_details_completed')->default(false)->after('bank_pix_key');

            $table->index('bank_details_completed');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['bank_details_completed']);
            $table->dropColumn([
                'bank_holder_name',
                'bank_holder_document',
                'bank_name',
                'bank_code',
                'bank_agency',
                'bank_agency_digit',
                'bank_account_number',
                'bank_account_digit',
                'bank_account_type',
                'bank_pix_key',
                'bank_details_completed',
            ]);
        });
    }
};
