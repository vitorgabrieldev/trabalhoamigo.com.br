<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'description',
        'icon_url',
        'order',
        'is_active',
    ];

    protected $hidden = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
