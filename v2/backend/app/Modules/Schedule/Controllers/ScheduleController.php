<?php

namespace App\Modules\Schedule\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleService $schedule) {}

    public function month(Request $request, string $providerUuid): JsonResponse
    {
        $request->validate([
            'year' => ['nullable', 'integer', 'min:2024'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $provider = User::where('uuid', $providerUuid)->where('role', 'provider')->firstOrFail();

        $year = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $calendar = $this->schedule->getMonthCalendar($provider, $year, $month);

        return response()->json([
            'provider_uuid' => $providerUuid,
            'year' => $year,
            'month' => $month,
            'days' => $calendar,
        ]);
    }

    public function week(Request $request, string $providerUuid): JsonResponse
    {
        $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $provider = User::where('uuid', $providerUuid)->where('role', 'provider')->firstOrFail();
        $weekStart = Carbon::parse($request->input('date', now()))->startOfWeek();

        $days = $this->schedule->getWeekCalendar($provider, $weekStart);

        return response()->json([
            'provider_uuid' => $providerUuid,
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekStart->copy()->endOfWeek()->toDateString(),
            'days' => $days,
        ]);
    }

    public function myCalendar(Request $request): JsonResponse
    {
        $request->validate([
            'year' => ['nullable', 'integer'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $year = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $calendar = $this->schedule->getMonthCalendar($request->user(), $year, $month);

        return response()->json([
            'year' => $year,
            'month' => $month,
            'days' => $calendar,
        ]);
    }
}
