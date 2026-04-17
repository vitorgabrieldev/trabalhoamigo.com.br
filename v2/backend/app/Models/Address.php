<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'zip_code',
        'street',
        'neighborhood',
        'number',
        'complement',
        'city',
        'state',
    ];

    protected $hidden = ['id', 'user_id'];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
