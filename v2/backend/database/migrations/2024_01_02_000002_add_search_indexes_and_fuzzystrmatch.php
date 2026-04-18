<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Layer 4: Levenshtein distance
        DB::statement('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch');

        // GIN trigram indexes — speed up similarity() and word_similarity() queries
        DB::statement('CREATE INDEX IF NOT EXISTS services_title_trgm ON services USING GIN (title gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS services_desc_trgm  ON services USING GIN (description gin_trgm_ops)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }
        DB::statement('DROP INDEX IF EXISTS services_title_trgm');
        DB::statement('DROP INDEX IF EXISTS services_desc_trgm');
    }
};
