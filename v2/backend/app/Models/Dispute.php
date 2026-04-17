<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    protected $fillable = [
        'uuid',
        'contract_id',
        'raised_by_id',
        'reason',
        'provider_response',
        'provider_responded_at',
        'status',
        'admin_notes',
        'resolved_by_id',
        'resolved_at',
    ];

    protected $hidden = ['id', 'contract_id', 'raised_by_id', 'resolved_by_id'];

    protected function casts(): array
    {
        return [
            'provider_responded_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function raisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_id');
    }
}
