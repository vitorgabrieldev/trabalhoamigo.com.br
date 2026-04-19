<?php

namespace App\Modules\Contracts\Services;

use App\Models\Contract;
use App\Models\Dispute;
use App\Models\Proposal;
use App\Models\User;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContractService
{
    public function __construct(private readonly ScheduleService $scheduleService) {}

    public function createFromProposal(Proposal $proposal, ?Carbon $scheduledAt): Contract
    {
        $contract = Contract::create([
            'uuid' => Str::uuid(),
            'proposal_id' => $proposal->id,
            'service_id' => $proposal->service_id,
            'contractor_id' => $proposal->contractor_id,
            'provider_id' => $proposal->provider_id,
            'agreed_price' => $proposal->offered_price,
            'platform_fee_rate' => $proposal->platform_fee_rate,
            'platform_fee_amount' => $proposal->platform_fee_amount,
            'provider_amount' => $proposal->provider_amount,
            'scheduled_at' => $scheduledAt,
            'status' => 'active',
        ]);

        // Block provider calendar
        if ($scheduledAt) {
            $end = $scheduledAt->copy()->addHours(2);
            $this->scheduleService->blockSlot($contract, $scheduledAt, $end);
        }

        // Link payment to contract
        $proposal->payment->update(['contract_id' => $contract->id]);

        return $contract;
    }

    /**
     * Provider marks work as done.
     * Starts the 3-day countdown for contractor confirmation.
     */
    public function markProviderCompleted(Contract $contract, User $provider): void
    {
        if ($contract->provider_id !== $provider->id) {
            throw new \RuntimeException('Não autorizado.', 403);
        }

        if (! $contract->isActive()) {
            throw new \RuntimeException('Este contrato não está ativo.', 422);
        }

        $contract->update([
            'status' => 'provider_completed',
            'provider_completed_at' => now(),
            'auto_release_at' => now()->addDays(3),
        ]);
    }

    /**
     * Contractor confirms work is done.
     * Marks payout as eligible for provider bank transfer by the platform.
     */
    public function markContractorConfirmed(Contract $contract, User $contractor): void
    {
        if ($contract->contractor_id !== $contractor->id) {
            throw new \RuntimeException('Não autorizado.', 403);
        }

        if (! $contract->isAwaitingContractorConfirmation()) {
            throw new \RuntimeException('Aguardando o prestador marcar como concluído primeiro.', 422);
        }

        DB::transaction(function () use ($contract) {
            $contract->update([
                'status' => 'contractor_confirmed',
                'contractor_confirmed_at' => now(),
            ]);

            $contract->payment->update([
                'status' => 'captured',
                'provider_payout_status' => 'eligible',
                'provider_payout_eligible_at' => now(),
            ]);
        });

        $this->scheduleService->releaseSlot($contract);
    }

    /**
     * Auto-release after 3 days without contractor confirmation.
     * Called by scheduled job.
     */
    public function autoRelease(Contract $contract): void
    {
        if ($contract->status !== 'provider_completed') {
            return;
        }

        DB::transaction(function () use ($contract) {
            $contract->update([
                'status' => 'auto_completed',
            ]);

            $contract->payment->update([
                'status' => 'captured',
                'provider_payout_status' => 'eligible',
                'provider_payout_eligible_at' => now(),
            ]);
        });

        $this->scheduleService->releaseSlot($contract);
    }

    /**
     * Contractor opens a dispute after acceptance.
     * Requires manual admin review.
     */
    public function openDispute(Contract $contract, User $contractor, string $reason): Dispute
    {
        if ($contract->contractor_id !== $contractor->id) {
            throw new \RuntimeException('Não autorizado.', 403);
        }

        if (! in_array($contract->status, ['active', 'provider_completed'])) {
            throw new \RuntimeException('Não é possível abrir disputa neste estado.', 422);
        }

        if ($contract->dispute) {
            throw new \RuntimeException('Já existe uma disputa aberta para este contrato.', 422);
        }

        DB::transaction(function () use ($contract, $reason) {
            $contract->update(['status' => 'disputed']);

            Dispute::create([
                'uuid' => Str::uuid(),
                'contract_id' => $contract->id,
                'raised_by_id' => $contract->contractor_id,
                'reason' => $reason,
                'status' => 'pending',
            ]);

            $contract->payment->update(['status' => 'disputed']);
            $contract->proposal->update(['payment_status' => 'disputed']);
        });

        return $contract->fresh('dispute')->dispute;
    }
}
