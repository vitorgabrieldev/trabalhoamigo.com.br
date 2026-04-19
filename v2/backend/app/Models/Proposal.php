<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proposal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'service_id',
        'contractor_id',
        'provider_id',
        'offered_price',
        'platform_fee_rate',
        'platform_fee_amount',
        'provider_amount',
        'description',
        'status',
        'schedule_type',
        'any_time_date',
        'schedule_agreed',
        'schedule_agreed_at',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'payment_status',
        'accepted_scheduled_at',
        'provider_terms_accepted_at',
    ];

    protected $hidden = ['id', 'service_id', 'contractor_id', 'provider_id'];

    protected function casts(): array
    {
        return [
            'offered_price' => 'decimal:2',
            'platform_fee_rate' => 'decimal:4',
            'platform_fee_amount' => 'decimal:2',
            'provider_amount' => 'decimal:2',
            'any_time_date' => 'date',
            'schedule_agreed' => 'boolean',
            'schedule_agreed_at' => 'datetime',
            'accepted_scheduled_at' => 'datetime',
            'provider_terms_accepted_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
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

    public function scheduleSlots(): HasMany
    {
        return $this->hasMany(ProposalScheduleSlot::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }
}
