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
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
            return $query->whereRaw(
                "search_vector @@ plainto_tsquery('portuguese', ?)",
                [$term]
            )->orderByRaw(
                "ts_rank(search_vector, plainto_tsquery('portuguese', ?)) DESC",
                [$term]
            );
        }

        // SQLite fallback (development/testing)
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
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
