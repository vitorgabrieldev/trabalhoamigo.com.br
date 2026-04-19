<?php

namespace App\Modules\Services\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('images')
            ? $this->images->pluck('image_url')->filter()->values()->all()
            : [];

        if (empty($images) && $this->image_url) {
            $images = [$this->image_url];
        }

        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'base_price' => $this->base_price ? (float) $this->base_price : null,
            'accepts_offer' => $this->accepts_offer,
            'is_community' => $this->is_community,
            'image_url' => $images[0] ?? $this->image_url,
            'images' => $images,
            'status' => $this->status,
            'average_rating' => round($this->average_rating, 1),

            'category' => $this->whenLoaded('category', fn () => [
                'uuid' => $this->category->uuid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),

            'provider' => $this->whenLoaded('user', fn () => [
                'uuid' => $this->user->uuid,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'avatar_url' => $this->user->avatar_url,
                'stripe_ready' => $this->user->hasBankDetails(),
                'created_at' => $this->user->created_at?->toIso8601String(),
                'address' => $this->user->relationLoaded('address') ? $this->user->address : null,
                'average_rating' => $this->user->average_rating ?? null,
                'reviews_count' => $this->user->reviews_count ?? null,
            ]),

            'reviews' => $this->whenLoaded('reviews', fn () => $this->reviews->map(fn ($r) => [
                'uuid' => $r->uuid,
                'stars' => $r->stars,
                'comment' => $r->comment,
                'created_at' => $r->created_at->toIso8601String(),
            ])
            ),

            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
