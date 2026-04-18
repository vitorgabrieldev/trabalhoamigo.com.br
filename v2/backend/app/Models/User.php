<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'uuid',
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'password',
        'cpf',
        'phone',
        'whatsapp',
        'landline',
        'avatar_url',
        'role',
        'stripe_account_id',
        'stripe_onboarding_completed',
        'stripe_customer_id',
        'totp_secret',
        'totp_enabled',
        'totp_last_timestamp',
        'google_id',
        'needs_onboarding',
    ];

    protected $hidden = [
        'id',
        'password',
        'totp_secret',
        'stripe_account_id',
        'stripe_customer_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'totp_enabled' => 'boolean',
            'totp_last_timestamp' => 'integer',
            'stripe_onboarding_completed' => 'boolean',
            'needs_onboarding' => 'boolean',
        ];
    }

    // UUID is the public identifier in routes/API responses
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    // JWT
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'uuid' => $this->uuid,
            'role' => $this->role,
        ];
    }

    // Helpers
    public function isProvider(): bool
    {
        return $this->role === 'provider';
    }

    public function isContractor(): bool
    {
        return $this->role === 'contractor';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStripeReady(): bool
    {
        return $this->stripe_onboarding_completed && $this->stripe_account_id !== null;
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Relationships
    public function address(): HasOne
    {
        return $this->hasOne(Address::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function sentProposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'contractor_id');
    }

    public function receivedProposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'provider_id');
    }

    public function contractsAsContractor(): HasMany
    {
        return $this->hasMany(Contract::class, 'contractor_id');
    }

    public function contractsAsProvider(): HasMany
    {
        return $this->hasMany(Contract::class, 'provider_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function calendarBlocks(): HasMany
    {
        return $this->hasMany(CalendarBlock::class);
    }

    public function activeCommunityServices(): HasMany
    {
        return $this->hasMany(Service::class)
            ->where('is_community', true)
            ->where('status', 'active');
    }
}
