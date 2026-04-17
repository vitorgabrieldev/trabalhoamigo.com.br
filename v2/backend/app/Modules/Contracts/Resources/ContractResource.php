<?php

namespace App\Modules\Contracts\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isProvider = $user && $user->id === $this->provider_id;

        return [
            'uuid' => $this->uuid,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),

            // Price visibility rules
            'price' => $isProvider
                ? ['amount' => (float) $this->provider_amount, 'currency' => 'BRL']
                : ['amount' => (float) $this->agreed_price, 'currency' => 'BRL'],

            'provider_completed_at' => $this->provider_completed_at?->toIso8601String(),
            'auto_release_at' => $this->auto_release_at?->toIso8601String(),
            'contractor_confirmed_at' => $this->contractor_confirmed_at?->toIso8601String(),
            'transferred_at' => $this->transferred_at?->toIso8601String(),

            'can_review' => $this->isFinished() && ! $this->relationLoaded('review'),
            'can_dispute' => in_array($this->status, ['active', 'provider_completed'])
                && ! $this->whenLoaded('dispute', fn () => $this->dispute !== null, false),

            'service' => $this->whenLoaded('service', fn () => [
                'uuid' => $this->service->uuid,
                'title' => $this->service->title,
            ]),

            'contractor' => $this->whenLoaded('contractor', fn () => [
                'uuid' => $this->contractor->uuid,
                'name' => $this->contractor->full_name,
                'avatar_url' => $this->contractor->avatar_url,
            ]),

            'provider' => $this->whenLoaded('provider', fn () => [
                'uuid' => $this->provider->uuid,
                'name' => $this->provider->full_name,
                'avatar_url' => $this->provider->avatar_url,
            ]),

            'review' => $this->whenLoaded('review', fn () => $this->review ? [
                'uuid' => $this->review->uuid,
                'stars' => $this->review->stars,
                'comment' => $this->review->comment,
            ] : null),

            'dispute' => $this->whenLoaded('dispute', fn () => $this->dispute ? [
                'uuid' => $this->dispute->uuid,
                'status' => $this->dispute->status,
            ] : null),

            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
