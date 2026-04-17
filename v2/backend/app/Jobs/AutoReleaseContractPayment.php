<?php

namespace App\Jobs;

use App\Models\Contract;
use App\Modules\Contracts\Services\ContractService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AutoReleaseContractPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 300; // 5 minutes between retries

    public function __construct(private readonly int $contractId) {}

    public function handle(ContractService $contractService): void
    {
        $contract = Contract::find($this->contractId);

        if (! $contract) {
            Log::warning("AutoRelease: Contract {$this->contractId} not found.");
            return;
        }

        if ($contract->status !== 'provider_completed') {
            // Contractor already confirmed or dispute opened — nothing to do
            return;
        }

        Log::info("AutoRelease: Liberando pagamento do contrato {$contract->uuid}");
        $contractService->autoRelease($contract);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("AutoRelease Job falhou para contrato {$this->contractId}: " . $exception->getMessage());
    }
}
