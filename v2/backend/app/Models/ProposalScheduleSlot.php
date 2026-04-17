<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProposalScheduleSlot extends Model
{
    protected $fillable = [
        'uuid',
        'proposal_id',
        'proposed_date',
        'time_type',
        'start_time',
        'end_time',
        'is_selected',
    ];

    protected $hidden = ['id', 'proposal_id'];

    protected function casts(): array
    {
        return [
            'proposed_date' => 'date',
            'is_selected' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }
}
