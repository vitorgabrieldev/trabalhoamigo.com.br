<?php

namespace App\Modules\Payments\Services;

use App\Models\Contract;
use App\Models\Payment;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeService
{
    private readonly StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Connect Express account for a provider.
     * Returns the onboarding URL.
     */
    public function createConnectAccount(User $provider): string
    {
        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => 'BR',
            'email' => $provider->email,
            'capabilities' => [
                'transfers' => ['requested' => true],
            ],
            'metadata' => ['user_uuid' => $provider->uuid],
        ]);

        $provider->update(['stripe_account_id' => $account->id]);

        return $this->createOnboardingLink($account->id, $provider->uuid);
    }

    public function createOnboardingLink(string $accountId, string $userUuid): string
    {
        $link = $this->stripe->accountLinks->create([
            'account' => $accountId,
            'refresh_url' => config('services.stripe.onboarding_refresh_url') . "?user={$userUuid}",
            'return_url' => config('services.stripe.onboarding_return_url') . "?user={$userUuid}",
            'type' => 'account_onboarding',
        ]);

        return $link->url;
    }

    /**
     * Create a Stripe Checkout Session (hosted page).
     * Contractor is redirected to Stripe, pays, then returns to successUrl.
     * Uses manual capture so funds are held until service completion.
     */
    public function createCheckoutSession(
        Proposal $proposal,
        User $contractor,
        string $successUrl,
        string $cancelUrl,
    ): string {
        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'brl',
                    'product_data' => [
                        'name' => $proposal->service->title,
                        'description' => 'Proposta #' . $proposal->uuid,
                    ],
                    'unit_amount' => (int) round($proposal->offered_price * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'customer_email' => $contractor->email,
            'payment_intent_data' => [
                'capture_method' => 'manual',
                'metadata' => [
                    'proposal_uuid' => $proposal->uuid,
                    'contractor_uuid' => $contractor->uuid,
                    'provider_uuid' => $proposal->provider->uuid,
                ],
            ],
            'metadata' => ['proposal_uuid' => $proposal->uuid],
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
        ]);

        return $session->url;
    }

    /**
     * Retrieve the PaymentIntent ID from a completed Checkout Session.
     */
    public function getPaymentIntentFromSession(string $sessionId): string
    {
        $session = $this->stripe->checkout->sessions->retrieve($sessionId, [
            'expand' => ['payment_intent'],
        ]);

        return is_string($session->payment_intent)
            ? $session->payment_intent
            : $session->payment_intent->id;
    }

    /**
     * Capture the held PaymentIntent after contractor confirms payment.
     */
    public function capturePaymentIntent(string $paymentIntentId): void
    {
        $this->stripe->paymentIntents->capture($paymentIntentId);
    }

    /**
     * Cancel (fully refund) a PaymentIntent before it is captured.
     * Used when provider rejects or contractor cancels before acceptance.
     */
    public function cancelPaymentIntent(string $paymentIntentId): void
    {
        $this->stripe->paymentIntents->cancel($paymentIntentId);
    }

    /**
     * Split payment: transfer provider_amount to their Connect account.
     * Platform keeps platform_fee in the main account.
     * Called when contract is marked as completed.
     */
    public function transferToProvider(Contract $contract): string
    {
        $providerAmountCents = (int) round($contract->provider_amount * 100);

        $transfer = $this->stripe->transfers->create([
            'amount' => $providerAmountCents,
            'currency' => 'brl',
            'destination' => $contract->provider->stripe_account_id,
            'metadata' => [
                'contract_uuid' => $contract->uuid,
                'proposal_uuid' => $contract->proposal->uuid,
            ],
        ]);

        return $transfer->id;
    }

    /**
     * Refund a captured PaymentIntent (full refund).
     * Used when dispute is resolved in favor of contractor.
     */
    public function refundPayment(string $paymentIntentId): void
    {
        $intent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        $this->stripe->refunds->create([
            'charge' => $intent->latest_charge,
        ]);
    }

    /**
     * Verify provider Stripe onboarding completion via webhook or manual check.
     */
    public function checkOnboardingStatus(User $provider): bool
    {
        if (! $provider->stripe_account_id) {
            return false;
        }

        $account = $this->stripe->accounts->retrieve($provider->stripe_account_id);
        $completed = $account->charges_enabled && $account->payouts_enabled;

        if ($completed && ! $provider->stripe_onboarding_completed) {
            $provider->update(['stripe_onboarding_completed' => true]);
        }

        return $completed;
    }

    /**
     * Construct and verify a Stripe webhook event.
     */
    public function constructWebhookEvent(string $payload, string $signature): \Stripe\Event
    {
        return \Stripe\Webhook::constructEvent(
            $payload,
            $signature,
            config('services.stripe.webhook_secret')
        );
    }
}
