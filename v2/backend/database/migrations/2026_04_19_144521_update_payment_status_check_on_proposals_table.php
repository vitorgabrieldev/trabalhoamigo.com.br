<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_payment_status_check');
        DB::statement("ALTER TABLE proposals ADD CONSTRAINT proposals_payment_status_check CHECK (payment_status IN ('pending','pending_payment','captured','transferred','refunded','disputed'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_payment_status_check');
        DB::statement("ALTER TABLE proposals ADD CONSTRAINT proposals_payment_status_check CHECK (payment_status IN ('pending','captured','transferred','refunded','disputed'))");
    }
};
