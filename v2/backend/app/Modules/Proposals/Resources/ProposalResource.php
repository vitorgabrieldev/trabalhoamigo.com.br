<?php

namespace App\Modules\Proposals\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'uuid' => $this->uuid,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'schedule_type' => $this->schedule_type,
            'any_time_date' => $this->any_time_date?->toDateString(),
            'schedule_agreed' => $this->schedule_agreed,
            'schedule_agreed_at' => $this->schedule_agreed_at?->toIso8601String(),
            'description' => $this->description,

            // Price — provider only sees what they'll receive
            'price' => $this->priceForUser($user),

            'slots' => $this->whenLoaded('scheduleSlots', fn () =>
                $this->scheduleSlots->map(fn ($s) => [
                    'uuid' => $s->uuid,
                    'date' => $s->proposed_date->toDateString(),
                    'time_type' => $s->time_type,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'is_selected' => $s->is_selected,
                ])
            ),

            'service' => $this->whenLoaded('service', fn () => [
                'uuid' => $this->service->uuid,
                'title' => $this->service->title,
                'category' => $this->service->relationLoaded('category') ? [
                    'uuid' => $this->service->category->uuid,
                    'name' => $this->service->category->name,
                ] : null,
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

            'contract_uuid' => $this->whenLoaded('contract', fn () => $this->contract?->uuid),

            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    private function priceForUser(mixed $user): array
    {
        // Provider sees only what they'll receive — fee is hidden
        if ($user && $user->id === $this->provider_id) {
            return [
                'amount' => (float) $this->provider_amount,
                'currency' => 'BRL',
            ];
        }

        // Contractor sees the full amount they offered
        return [
            'amount' => (float) $this->offered_price,
            'currency' => 'BRL',
        ];
    }
}
