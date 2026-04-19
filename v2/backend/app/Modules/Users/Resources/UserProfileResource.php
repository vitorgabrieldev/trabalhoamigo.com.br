<?php

namespace App\Modules\Users\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'needs_onboarding' => $this->needs_onboarding,
            'totp_enabled' => $this->totp_enabled,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),

            // Provider-specific
            'stripe_onboarding_completed' => $this->when(
                $this->isProvider(),
                $this->bank_details_completed
            ),
            'payout_details_completed' => $this->when(
                $this->isProvider(),
                $this->bank_details_completed
            ),
            'bank_details' => $this->when($this->isProvider(), fn () => [
                'bank_holder_name' => $this->bank_holder_name,
                'bank_holder_document' => $this->bank_holder_document,
                'bank_name' => $this->bank_name,
                'bank_code' => $this->bank_code,
                'bank_agency' => $this->bank_agency,
                'bank_agency_digit' => $this->bank_agency_digit,
                'bank_account_number' => $this->bank_account_number,
                'bank_account_digit' => $this->bank_account_digit,
                'bank_account_type' => $this->bank_account_type,
                'bank_pix_key' => $this->bank_pix_key,
            ]),

            // Kept for backward compatibility with old API consumers.
            'legacy_stripe_account_connected' => $this->when(
                $this->isProvider(),
                $this->stripe_onboarding_completed
            ),

            'address' => $this->whenLoaded('address', fn () => $this->address ? [
                'uuid' => $this->address->uuid,
                'zip_code' => $this->address->zip_code,
                'street' => $this->address->street,
                'neighborhood' => $this->address->neighborhood,
                'number' => $this->address->number,
                'complement' => $this->address->complement,
                'city' => $this->address->city,
                'state' => $this->address->state,
            ] : null),

            'google_linked' => ! is_null($this->google_id),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
