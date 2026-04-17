<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'uuid',
        'contract_id',
        'service_id',
        'reviewer_id',
        'reviewed_id',
        'stars',
        'comment',
        'trigger',
    ];

    protected $hidden = ['id', 'contract_id', 'service_id', 'reviewer_id', 'reviewed_id'];

    protected function casts(): array
    {
        return ['stars' => 'integer'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }
}
