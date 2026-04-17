<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'jti',
        'refresh_token_hash',
        'device_name',
        'device_type',
        'ip_address',
        'user_agent',
        'last_active_at',
        'refresh_expires_at',
        'is_revoked',
    ];

    protected $hidden = ['id', 'refresh_token_hash'];

    protected function casts(): array
    {
        return [
            'last_active_at' => 'datetime',
            'refresh_expires_at' => 'datetime',
            'is_revoked' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->refresh_expires_at?->isPast() ?? true;
    }
}
