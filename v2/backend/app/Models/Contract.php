<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Contract extends Model
{
    protected $fillable = [
        'uuid',
        'proposal_id',
        'service_id',
        'contractor_id',
        'provider_id',
        'agreed_price',
        'platform_fee_rate',
        'platform_fee_amount',
        'provider_amount',
        'scheduled_at',
        'status',
        'provider_completed_at',
        'contractor_confirmed_at',
        'auto_release_at',
        'transferred_at',
        'stripe_transfer_provider_id',
        'stripe_transfer_platform_id',
    ];

    protected $hidden = ['id', 'proposal_id', 'service_id', 'contractor_id', 'provider_id'];

    protected function casts(): array
    {
        return [
            'agreed_price' => 'decimal:2',
            'platform_fee_rate' => 'decimal:4',
            'platform_fee_amount' => 'decimal:2',
            'provider_amount' => 'decimal:2',
            'scheduled_at' => 'datetime',
            'provider_completed_at' => 'datetime',
            'contractor_confirmed_at' => 'datetime',
            'auto_release_at' => 'datetime',
            'transferred_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isAwaitingContractorConfirmation(): bool
    {
        return $this->status === 'provider_completed';
    }

    public function isFinished(): bool
    {
        return in_array($this->status, ['contractor_confirmed', 'auto_completed']);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function contractor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'contractor_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function dispute(): HasOne
    {
        return $this->hasOne(Dispute::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function calendarBlock(): HasOne
    {
        return $this->hasOne(CalendarBlock::class);
    }
}
