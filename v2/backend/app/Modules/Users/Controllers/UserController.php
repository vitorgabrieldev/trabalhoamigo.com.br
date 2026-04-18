<?php

namespace App\Modules\Users\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Services\StripeService;
use App\Modules\Users\Requests\UpdateAddressRequest;
use App\Modules\Users\Requests\UpdateProfileRequest;
use App\Modules\Users\Resources\UserProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(private readonly StripeService $stripeService) {}

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('address');

        return response()->json(new UserProfileResource($user));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json(new UserProfileResource($request->user()->fresh()));
    }

    public function updateAddress(UpdateAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = array_merge(['uuid' => Str::uuid()], $request->validated());

        $user->address()->updateOrCreate(['user_id' => $user->id], $data);

        return response()->json($user->fresh('address')->address);
    }

    // Provider: initiate Stripe Connect onboarding
    public function stripeOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isProvider()) {
            return response()->json(['message' => 'Somente prestadores podem conectar uma conta de pagamento.'], 403);
        }

        if ($user->stripe_onboarding_completed) {
            return response()->json(['message' => 'Conta de pagamento já configurada.'], 422);
        }

        if ($user->stripe_account_id) {
            // Refresh existing onboarding link
            $url = $this->stripeService->createOnboardingLink($user->stripe_account_id, $user->uuid);
        } else {
            $url = $this->stripeService->createConnectAccount($user);
        }

        return response()->json(['onboarding_url' => $url]);
    }

    // Provider: check onboarding status
    public function stripeStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isProvider()) {
            return response()->json(['message' => 'Não aplicável.'], 422);
        }

        $completed = $this->stripeService->checkOnboardingStatus($user);

        return response()->json([
            'stripe_onboarding_completed' => $completed,
            'message' => $completed
                ? 'Conta de pagamento configurada. Seus serviços estão visíveis.'
                : 'Configure sua conta de pagamento para que seus serviços fiquem disponíveis.',
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->user()->delete();

        return response()->json(['message' => 'Conta excluída.']);
    }

    public function show(string $uuid): JsonResponse
    {
        $user = \App\Models\User::where('uuid', $uuid)
            ->withCount(['services as active_services_count' => fn ($q) => $q->where('status', 'active')])
            ->withAvg('reviews as average_rating', 'stars')
            ->firstOrFail();

        return response()->json([
            'uuid' => $user->uuid,
            'name' => $user->full_name,
            'avatar_url' => $user->avatar_url,
            'role' => $user->role,
            'active_services_count' => $user->active_services_count,
            'average_rating' => round($user->average_rating ?? 0, 1),
            'stripe_ready' => $user->isStripeReady(),
            'member_since' => $user->created_at->toDateString(),
        ]);
    }
}
