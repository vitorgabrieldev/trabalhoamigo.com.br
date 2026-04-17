<?php

namespace App\Modules\Schedule\Services;

use App\Models\CalendarBlock;
use App\Models\Contract;
use App\Models\ProposalScheduleSlot;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ScheduleService
{
    /**
     * Check if a provider has a conflict for the given time range.
     */
    public function hasConflict(User $provider, Carbon $start, Carbon $end): bool
    {
        return CalendarBlock::where('user_id', $provider->id)
            ->where('status', 'booked')
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('starts_at', [$start, $end])
                    ->orWhereBetween('ends_at', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('starts_at', '<=', $start)
                            ->where('ends_at', '>=', $end);
                    });
            })
            ->exists();
    }

    /**
     * Check if ANY of the proposed slots conflict with provider's calendar.
     * Returns the first conflicting slot or null.
     */
    public function findConflictingSlot(User $provider, Collection $slots): ?ProposalScheduleSlot
    {
        foreach ($slots as $slot) {
            [$start, $end] = $this->resolveSlotBounds($slot);

            if ($this->hasConflict($provider, $start, $end)) {
                return $slot;
            }
        }

        return null;
    }

    /**
     * Block calendar for a contract. Called on proposal acceptance.
     */
    public function blockSlot(Contract $contract, Carbon $start, Carbon $end): CalendarBlock
    {
        return CalendarBlock::create([
            'uuid' => Str::uuid(),
            'user_id' => $contract->provider_id,
            'contract_id' => $contract->id,
            'starts_at' => $start,
            'ends_at' => $end,
            'status' => 'booked',
        ]);
    }

    /**
     * Free the calendar block when a contract is cancelled or completed.
     */
    public function releaseSlot(Contract $contract): void
    {
        CalendarBlock::where('contract_id', $contract->id)
            ->update(['status' => 'cancelled']);
    }

    /**
     * Return a provider's calendar for a given month.
     * Returns booked slots grouped by date.
     */
    public function getMonthCalendar(User $provider, int $year, int $month): array
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $blocks = CalendarBlock::where('user_id', $provider->id)
            ->where('status', 'booked')
            ->whereBetween('starts_at', [$start, $end])
            ->with('contract:id,uuid,status')
            ->get();

        $calendar = [];

        foreach (CarbonPeriod::create($start, $end) as $day) {
            $dateKey = $day->toDateString();
            $dayBlocks = $blocks->filter(
                fn ($b) => Carbon::parse($b->starts_at)->toDateString() === $dateKey
            );

            $calendar[$dateKey] = [
                'date' => $dateKey,
                'is_available' => $dayBlocks->isEmpty(),
                'blocks' => $dayBlocks->map(fn ($b) => [
                    'uuid' => $b->uuid,
                    'starts_at' => Carbon::parse($b->starts_at)->toIso8601String(),
                    'ends_at' => Carbon::parse($b->ends_at)->toIso8601String(),
                    'contract_uuid' => $b->contract?->uuid,
                ])->values(),
            ];
        }

        return $calendar;
    }

    /**
     * Get week view for a provider's calendar.
     */
    public function getWeekCalendar(User $provider, Carbon $weekStart): array
    {
        $weekEnd = $weekStart->copy()->endOfWeek();

        $blocks = CalendarBlock::where('user_id', $provider->id)
            ->where('status', 'booked')
            ->whereBetween('starts_at', [$weekStart, $weekEnd])
            ->with('contract:id,uuid,status')
            ->get();

        $days = [];
        for ($i = 0; $i <= 6; $i++) {
            $day = $weekStart->copy()->addDays($i);
            $dateKey = $day->toDateString();
            $dayBlocks = $blocks->filter(
                fn ($b) => Carbon::parse($b->starts_at)->toDateString() === $dateKey
            );

            $days[] = [
                'date' => $dateKey,
                'day_of_week' => $day->translatedFormat('l'),
                'is_available' => $dayBlocks->isEmpty(),
                'blocks' => $dayBlocks->map(fn ($b) => [
                    'uuid' => $b->uuid,
                    'starts_at' => Carbon::parse($b->starts_at)->format('H:i'),
                    'ends_at' => Carbon::parse($b->ends_at)->format('H:i'),
                ])->values(),
            ];
        }

        return $days;
    }

    public function resolveSlotBounds(ProposalScheduleSlot $slot): array
    {
        if ($slot->time_type === 'all_day') {
            $start = Carbon::parse($slot->proposed_date)->startOfDay();
            $end = Carbon::parse($slot->proposed_date)->endOfDay();
        } else {
            $start = Carbon::parse($slot->proposed_date->toDateString() . ' ' . $slot->start_time);
            $end = Carbon::parse($slot->proposed_date->toDateString() . ' ' . $slot->end_time);
        }

        return [$start, $end];
    }
}
