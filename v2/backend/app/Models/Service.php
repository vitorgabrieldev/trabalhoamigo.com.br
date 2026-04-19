<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

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
                ->where('bank_details_completed', true)
                ->whereNull('deleted_at')
            );
    }

    public function scopeSearch($query, string $term)
    {
        // Tokenise: split on whitespace, drop stop words (≤ 2 chars)
        $words = array_values(array_filter(
            preg_split('/\s+/', mb_strtolower(trim($term))),
            fn ($w) => mb_strlen($w) > 2
        ));

        if (empty($words)) {
            return $query;
        }

        if (DB::getDriverName() === 'pgsql') {
            $n = count($words);

            // ── Layer 1: FTS (OR per word, Portuguese stemming) ───────────────
            // plainto_tsquery('portuguese', w) handles morphology:
            //   "pintando" → "pint", "casas" → "cas"
            $ftsParts = implode(' || ', array_fill(0, $n, "plainto_tsquery('portuguese', ?)"));

            // ── Layer 2: similarity() — full query vs title ───────────────────
            // Good for short queries; uses GIN trgm index.

            // ── Layer 3: word_similarity() — each word vs title / description ─
            // Finds the best matching substring; tolerates partial words & typos.

            // ── Layer 4: Levenshtein — edit distance per title token ──────────
            // Compares each search word against every space-split token in title.
            // Catches single-char typos ("pintira" → "pintura").

            // Candidate filter — any of the 4 layers can surface a result
            $query->where(function ($q) use ($words, $ftsParts, $term) {
                // L1
                $q->whereRaw("search_vector @@ ({$ftsParts})", $words);

                // L2
                $q->orWhereRaw('similarity(?, title) > 0.1', [$term]);

                // L3 + L4 per word
                foreach ($words as $word) {
                    $q->orWhereRaw('word_similarity(?, title)       > 0.3', [$word])
                        ->orWhereRaw('word_similarity(?, description) > 0.2', [$word])
                      // L4: edit distance ≤ 2 against any token inside title
                        ->orWhereRaw(
                            "EXISTS (
                              SELECT 1
                              FROM   unnest(regexp_split_to_array(lower(title), '\\s+')) AS tok
                              WHERE  length(tok) > 2
                              AND    levenshtein_less_equal(?, tok, 2) <= 2
                          )",
                            [$word]
                        );
                }
            });

            // Combined relevance score (higher = more relevant)
            // L1 weight 4 · L2 weight 2 · L3 weight 3 (title) + 1 (desc)
            $wordSimTitle = implode(', ', array_fill(0, $n, 'word_similarity(?, title)'));
            $wordSimDesc = implode(', ', array_fill(0, $n, 'word_similarity(?, description)'));

            $query->orderByRaw(
                "( ts_rank(search_vector, ({$ftsParts}))      * 4
                 + similarity(?, title)                        * 2
                 + GREATEST({$wordSimTitle})                   * 3
                 + GREATEST({$wordSimDesc})                    * 1
                 ) DESC",
                array_merge($words, [$term], $words, $words)
            );

            return $query;
        }

        // ── SQLite fallback (development) ─────────────────────────────────────
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
