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
            'status' => $this->maskedStatus($user),
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),

            'price' => $isProvider
                ? ['amount' => (float) $this->provider_amount, 'currency' => 'BRL']
                : ['amount' => (float) $this->agreed_price, 'currency' => 'BRL'],

            'agreed_price' => (float) $this->agreed_price,
            'provider_amount' => $isProvider ? (float) $this->provider_amount : null,

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
                'category' => $this->service->relationLoaded('category') ? [
                    'uuid' => $this->service->category->uuid,
                    'name' => $this->service->category->name,
                ] : null,
            ]),

            'proposal' => $this->whenLoaded('proposal', fn () => $this->proposal ? [
                'uuid' => $this->proposal->uuid,
                'description' => $this->proposal->description,
                'offered_price' => (float) $this->proposal->offered_price,
                'schedule_type' => $this->proposal->schedule_type,
                'provider_terms_accepted_at' => $this->proposal->provider_terms_accepted_at?->toIso8601String(),
                'slots' => $this->proposal->relationLoaded('scheduleSlots')
                    ? $this->proposal->scheduleSlots->map(fn ($s) => [
                        'uuid' => $s->uuid,
                        'date' => $s->proposed_date->toDateString(),
                        'time_type' => $s->time_type,
                        'start_time' => $s->start_time,
                        'end_time' => $s->end_time,
                        'is_selected' => (bool) $s->is_selected,
                    ])
                    : [],
            ] : null),

            'payment' => $this->whenLoaded('payment', fn () => $this->payment ? [
                'uuid' => $this->payment->uuid,
                'amount' => (float) $this->payment->amount,
                'status' => $this->payment->status,
                'paid_at' => $this->payment->created_at?->toIso8601String(),
            ] : null),

            'contractor' => $this->whenLoaded('contractor', fn () => [
                'uuid' => $this->contractor->uuid,
                'first_name' => $this->contractor->first_name,
                'last_name' => $this->contractor->last_name,
                'name' => $this->contractor->full_name,
                'avatar_url' => $this->contractor->avatar_url,
                'email' => $this->contractor->email,
            ]),

            'provider' => $this->whenLoaded('provider', fn () => [
                'uuid' => $this->provider->uuid,
                'first_name' => $this->provider->first_name,
                'last_name' => $this->provider->last_name,
                'name' => $this->provider->full_name,
                'avatar_url' => $this->provider->avatar_url,
                'email' => $this->provider->email,
            ]),

            'review' => $this->whenLoaded('review', fn () => $this->review ? [
                'uuid' => $this->review->uuid,
                'stars' => $this->review->stars,
                'comment' => $this->review->comment,
            ] : null),

            'dispute' => $this->whenLoaded('dispute', fn () => $this->dispute ? [
                'uuid' => $this->dispute->uuid,
                'status' => $this->dispute->status,
                'reason' => $this->dispute->reason,
            ] : null),

            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    private function maskedStatus(mixed $user): string
    {
        if ($this->status !== 'disputed' || ! $user) {
            return $this->status;
        }

        $dispute = $this->whenLoaded('dispute', fn () => $this->dispute, null);
        $raisedById = $dispute?->raised_by_id;

        // Quem abriu a disputa vê "disputed"; a outra parte vê "payment_held"
        return $raisedById === $user->id ? 'disputed' : 'payment_held';
    }
}
