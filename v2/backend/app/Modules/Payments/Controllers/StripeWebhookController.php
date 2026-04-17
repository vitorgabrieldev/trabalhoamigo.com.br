<?php

namespace App\Modules\Payments\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Payments\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StripeWebhookController extends Controller
{
    public function __construct(private readonly StripeService $stripe) {}

    public function handle(Request $request): Response
    {
        $signature = $request->header('Stripe-Signature');

        try {
            $event = $this->stripe->constructWebhookEvent(
                $request->getContent(),
                $signature
            );
        } catch (\Exception $e) {
            return response('Invalid signature', 400);
        }

        match ($event->type) {
            'account.updated' => $this->handleAccountUpdated($event->data->object),
            default => null,
        };

        return response('OK', 200);
    }

    private function handleAccountUpdated(object $account): void
    {
        $user = User::where('stripe_account_id', $account->id)->first();

        if (! $user) {
            return;
        }

        if ($account->charges_enabled && $account->payouts_enabled) {
            $user->update(['stripe_onboarding_completed' => true]);
        }
    }
}
