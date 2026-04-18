<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'category_id',
        'title',
        'description',
        'base_price',
        'accepts_offer',
        'is_community',
        'image_url',
        'status',
    ];

    protected $hidden = ['id', 'user_id', 'category_id', 'search_vector'];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'accepts_offer' => 'boolean',
            'is_community' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVisible($query)
    {
        return $query->active()
            ->whereHas('user', fn ($q) => $q
                ->where('stripe_onboarding_completed', true)
                ->whereNull('deleted_at')
            );
    }

    public function scopeSearch($query, string $term)
    {
        // Split into meaningful words — drop tokens of 1-2 chars (stop words)
        $words = array_values(array_filter(
            preg_split('/\s+/', mb_strtolower(trim($term))),
            fn ($w) => mb_strlen($w) > 2
        ));

        if (empty($words)) {
            return $query;
        }

        if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
            // Build OR tsquery: plainto_tsquery(w1) || plainto_tsquery(w2) ...
            // plainto_tsquery applies Portuguese stemming to each word.
            $placeholders = implode(' || ', array_fill(0, count($words), "plainto_tsquery('portuguese', ?)"));

            return $query
                ->where(function ($q) use ($words, $placeholders) {
                    // Layer 1 — FTS exact stems (OR across words)
                    $q->whereRaw("search_vector @@ ({$placeholders})", $words);

                    // Layer 2 — pg_trgm word similarity for typos / partial words
                    foreach ($words as $word) {
                        $q->orWhereRaw('word_similarity(?, title) > 0.3', [$word])
                          ->orWhereRaw('word_similarity(?, description) > 0.2', [$word]);
                    }
                })
                ->orderByRaw(
                    // Rank: FTS relevance primary, trigram similarity secondary
                    "ts_rank(search_vector, ({$placeholders})) DESC",
                    $words
                );
        }

        // SQLite fallback — OR LIKE across all words
        return $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('title', 'like', "%{$word}%")
                  ->orWhere('description', 'like', "%{$word}%");
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getAverageRatingAttribute(): float
    {
        return (float) $this->reviews()->avg('stars') ?? 0;
    }
}
