<?php

use App\Jobs\AutoReleaseContractPayment;
use App\Jobs\CleanExpiredSessions;
use App\Models\Contract;
use Illuminate\Support\Facades\Schedule;

// Check every 5 minutes for contracts past the 3-day auto-release window
Schedule::call(function () {
    Contract::where('status', 'provider_completed')
        ->where('auto_release_at', '<=', now())
        ->get()
        ->each(fn ($contract) => AutoReleaseContractPayment::dispatch($contract->id));
})->everyFiveMinutes()->name('auto-release-contracts')->withoutOverlapping();

// Clean expired and revoked sessions weekly
Schedule::job(new CleanExpiredSessions())->weekly()->name('clean-expired-sessions');
