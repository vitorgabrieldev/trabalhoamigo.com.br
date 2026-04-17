<?php

namespace App\Modules\Services\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'base_price' => $this->base_price ? (float) $this->base_price : null,
            'accepts_offer' => $this->accepts_offer,
            'is_community' => $this->is_community,
            'image_url' => $this->image_url,
            'status' => $this->status,
            'average_rating' => round($this->average_rating, 1),

            'category' => $this->whenLoaded('category', fn () => [
                'uuid' => $this->category->uuid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),

            'provider' => $this->whenLoaded('user', fn () => [
                'uuid' => $this->user->uuid,
                'name' => $this->user->full_name,
                'avatar_url' => $this->user->avatar_url,
                'stripe_ready' => $this->user->isStripeReady(),
            ]),

            'reviews' => $this->whenLoaded('reviews', fn () =>
                $this->reviews->map(fn ($r) => [
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
