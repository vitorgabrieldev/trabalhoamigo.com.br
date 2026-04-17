<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $isPgsql = DB::getDriverName() === 'pgsql';

        Schema::create('services', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->string('title', 120);
            $table->text('description');
            $table->decimal('base_price', 10, 2)->nullable()->comment('Null = price open to negotiation');
            $table->boolean('accepts_offer')->default(false);
            $table->boolean('is_community')->default(false);
            $table->string('image_url')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');

            // Full-text search column — PostgreSQL only
            if ($isPgsql) {
                $table->tsvector('search_vector')->nullable();
            }

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'deleted_at']);
            $table->index(['user_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index('is_community');
        });

        if ($isPgsql) {
            DB::statement('CREATE INDEX services_search_vector_idx ON services USING GIN(search_vector)');

            DB::statement("
                CREATE OR REPLACE FUNCTION services_search_vector_update() RETURNS trigger AS \$\$
                BEGIN
                    NEW.search_vector :=
                        setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
                        setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B');
                    RETURN NEW;
                END
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("
                CREATE TRIGGER services_search_vector_trigger
                BEFORE INSERT OR UPDATE ON services
                FOR EACH ROW EXECUTE FUNCTION services_search_vector_update();
            ");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TRIGGER IF EXISTS services_search_vector_trigger ON services');
            DB::statement('DROP FUNCTION IF EXISTS services_search_vector_update');
        }
        Schema::dropIfExists('services');
    }
};
