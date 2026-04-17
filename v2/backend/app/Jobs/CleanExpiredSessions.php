<?php

namespace App\Jobs;

use App\Models\UserSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanExpiredSessions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $deleted = UserSession::where('refresh_expires_at', '<', now())
            ->orWhere('is_revoked', true)
            ->where('updated_at', '<', now()->subDays(7))
            ->delete();

        Log::info("CleanSessions: {$deleted} sessões expiradas removidas.");
    }
}
