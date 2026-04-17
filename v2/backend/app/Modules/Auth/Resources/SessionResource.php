<?php

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'device_name' => $this->device_name,
            'device_type' => $this->device_type,
            'ip_address' => $this->ip_address,
            'last_active_at' => $this->last_active_at?->toIso8601String(),
            'expires_at' => $this->refresh_expires_at?->toIso8601String(),
            'is_current' => $this->jti === $this->currentJti($request),
        ];
    }

    private function currentJti(Request $request): ?string
    {
        try {
            return auth('api')->payload()->get('jti');
        } catch (\Throwable) {
            return null;
        }
    }
}
