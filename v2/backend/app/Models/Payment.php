<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'uuid',
        'proposal_id',
        'contract_id',
        'contractor_id',
        'provider_id',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_transfer_id',
        'amount_cents',
        'platform_fee_cents',
        'provider_amount_cents',
        'fee_rate',
        'currency',
        'status',
        'provider_payout_status',
        'is_community',
        'captured_at',
        'transferred_at',
        'provider_payout_eligible_at',
        'provider_payout_paid_at',
        'provider_payout_reference',
        'refunded_at',
    ];

    protected $hidden = ['id', 'proposal_id', 'contract_id', 'contractor_id', 'provider_id'];

    protected function casts(): array
    {
        return [
            'fee_rate' => 'decimal:4',
            'is_community' => 'boolean',
            'captured_at' => 'datetime',
            'transferred_at' => 'datetime',
            'provider_payout_eligible_at' => 'datetime',
            'provider_payout_paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    // Convert cents to BRL for display
    public function getAmountBrlAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    public function getPlatformFeeBrlAttribute(): float
    {
        return $this->platform_fee_cents / 100;
    }

    public function getProviderAmountBrlAttribute(): float
    {
        return $this->provider_amount_cents / 100;
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function contractor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'contractor_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
