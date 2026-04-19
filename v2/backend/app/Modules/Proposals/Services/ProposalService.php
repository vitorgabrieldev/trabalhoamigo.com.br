<?php

namespace App\Modules\Proposals\Services;

use App\Models\Conversation;
use App\Models\Payment;
use App\Models\Proposal;
use App\Models\ProposalScheduleSlot;
use App\Models\Service;
use App\Models\User;
use App\Modules\Contracts\Services\ContractService;
use App\Modules\Payments\Services\FeeCalculator;
use App\Modules\Payments\Services\StripeService;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProposalService
{
    public function __construct(
        private readonly FeeCalculator $feeCalculator,
        private readonly StripeService $stripeService,
        private readonly ScheduleService $scheduleService,
        private readonly ContractService $contractService,
    ) {}

    /**
     * Contractor submits a proposal.
     * Creates PaymentIntent (holds funds) immediately.
     */
    public function submit(User $contractor, Service $service, array $data): Proposal
    {
        $provider = $service->user;

        if (! $provider->hasBankDetails()) {
            throw new \RuntimeException('Este prestador ainda não cadastrou os dados bancários para recebimento.', 422);
        }

        $fee = $this->feeCalculator->calculate($data['offered_price'], $service->is_community);

        return DB::transaction(function () use ($contractor, $service, $provider, $data, $fee) {
            $proposal = Proposal::create([
                'uuid' => Str::uuid(),
                'service_id' => $service->id,
                'contractor_id' => $contractor->id,
                'provider_id' => $provider->id,
                'offered_price' => $data['offered_price'],
                'platform_fee_rate' => $fee['fee_rate'],
                'platform_fee_amount' => $fee['fee_amount'],
                'provider_amount' => $fee['provider_amount'],
                'description' => $data['description'] ?? null,
                'schedule_type' => $data['schedule_type'],
                'any_time_date' => $data['any_time_date'] ?? null,
                'schedule_agreed' => false,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Create schedule slots if applicable
            if ($data['schedule_type'] === 'specific_slots' && ! empty($data['slots'])) {
                foreach ($data['slots'] as $slot) {
                    ProposalScheduleSlot::create([
                        'uuid' => Str::uuid(),
                        'proposal_id' => $proposal->id,
                        'proposed_date' => $slot['date'],
                        'time_type' => $slot['time_type'],
                        'start_time' => $slot['start_time'] ?? null,
                        'end_time' => $slot['end_time'] ?? null,
                    ]);
                }
            }

            // Create Stripe PaymentIntent (manual capture — holds funds)
            $paymentIntentId = $this->stripeService->createPaymentIntent($proposal, $contractor);
            $proposal->update(['stripe_payment_intent_id' => $paymentIntentId]);

            // Create payment record
            Payment::create([
                'uuid' => Str::uuid(),
                'proposal_id' => $proposal->id,
                'contractor_id' => $contractor->id,
                'provider_id' => $provider->id,
                'stripe_payment_intent_id' => $paymentIntentId,
                'amount_cents' => $this->feeCalculator->toCents($data['offered_price']),
                'platform_fee_cents' => $this->feeCalculator->toCents($fee['fee_amount']),
                'provider_amount_cents' => $this->feeCalculator->toCents($fee['provider_amount']),
                'fee_rate' => $fee['fee_rate'],
                'currency' => 'brl',
                'status' => 'pending',
                'is_community' => $service->is_community,
            ]);

            // Open conversation thread
            Conversation::create([
                'uuid' => Str::uuid(),
                'proposal_id' => $proposal->id,
                'contractor_id' => $contractor->id,
                'provider_id' => $provider->id,
            ]);

            return $proposal->load(['service', 'scheduleSlots', 'payment']);
        });
    }

    /**
     * Provider accepts a proposal.
     * Captures the PaymentIntent and creates the Contract.
     */
    public function accept(Proposal $proposal, string $selectedSlotUuid): Proposal
    {
        if (! $proposal->isPending()) {
            throw new \RuntimeException('Esta proposta não pode ser aceita.', 422);
        }

        $provider = $proposal->provider;

        // Validate selected slot (or to_be_arranged)
        $scheduledAt = $this->resolveScheduleForAcceptance($proposal, $selectedSlotUuid);

        // Check calendar conflict
        if ($scheduledAt) {
            $end = $scheduledAt->copy()->addHours(2); // Default duration
            if ($this->scheduleService->hasConflict($provider, $scheduledAt, $end)) {
                throw new \RuntimeException('Conflito de agenda neste horário.', 422);
            }
        }

        return DB::transaction(function () use ($proposal, $scheduledAt, $selectedSlotUuid) {
            // Mark selected slot
            if ($selectedSlotUuid) {
                $proposal->scheduleSlots()->where('uuid', $selectedSlotUuid)
                    ->update(['is_selected' => true]);
            }

            // Capture payment
            $this->stripeService->capturePaymentIntent($proposal->stripe_payment_intent_id);
            $proposal->payment->update(['status' => 'captured', 'captured_at' => now()]);

            $proposal->update([
                'status' => 'accepted',
                'payment_status' => 'captured',
            ]);

            // Create Contract
            $contract = $this->contractService->createFromProposal($proposal, $scheduledAt);

            return $proposal->fresh(['contract', 'scheduleSlots']);
        });
    }

    /**
     * Provider rejects a proposal — cancels PaymentIntent (full refund).
     */
    public function reject(Proposal $proposal): void
    {
        if (! $proposal->isPending()) {
            throw new \RuntimeException('Esta proposta não pode ser rejeitada.', 422);
        }

        DB::transaction(function () use ($proposal) {
            $this->stripeService->cancelPaymentIntent($proposal->stripe_payment_intent_id);
            $proposal->payment->update(['status' => 'refunded', 'refunded_at' => now()]);
            $proposal->update(['status' => 'rejected', 'payment_status' => 'refunded']);
        });
    }

    /**
     * Contractor cancels before provider accepts — full refund.
     */
    public function cancelBeforeAcceptance(Proposal $proposal, User $contractor): void
    {
        if ($proposal->contractor_id !== $contractor->id) {
            throw new \RuntimeException('Não autorizado.', 403);
        }

        if (! $proposal->isPending()) {
            throw new \RuntimeException('Somente propostas pendentes podem ser canceladas diretamente.', 422);
        }

        DB::transaction(function () use ($proposal) {
            $this->stripeService->cancelPaymentIntent($proposal->stripe_payment_intent_id);
            $proposal->payment->update(['status' => 'refunded', 'refunded_at' => now()]);
            $proposal->update(['status' => 'cancelled', 'payment_status' => 'refunded']);
        });
    }

    /**
     * Confirm that "to be arranged" schedule was agreed between both parties.
     */
    public function confirmScheduleAgreement(Proposal $proposal, User $user): void
    {
        if ($proposal->schedule_type !== 'to_be_arranged') {
            throw new \RuntimeException('Esta proposta não requer confirmação de horário a combinar.', 422);
        }

        if (! in_array($user->id, [$proposal->contractor_id, $proposal->provider_id])) {
            throw new \RuntimeException('Não autorizado.', 403);
        }

        $proposal->update([
            'schedule_agreed' => true,
            'schedule_agreed_at' => now(),
        ]);
    }

    private function resolveScheduleForAcceptance(Proposal $proposal, string $selectedSlotUuid): ?Carbon
    {
        if ($proposal->schedule_type === 'to_be_arranged') {
            return null;
        }

        if ($proposal->schedule_type === 'any_time_on_day') {
            return Carbon::parse($proposal->any_time_date)->startOfDay();
        }

        $slot = $proposal->scheduleSlots()->where('uuid', $selectedSlotUuid)->first();

        if (! $slot) {
            throw new \RuntimeException('Slot de horário inválido.', 422);
        }

        [$start] = $this->scheduleService->resolveSlotBounds($slot);

        return $start;
    }
}
