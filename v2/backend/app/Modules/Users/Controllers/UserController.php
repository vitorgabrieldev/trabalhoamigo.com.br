<?php

namespace App\Modules\Users\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Users\Requests\UpdateAddressRequest;
use App\Modules\Users\Requests\UpdatePayoutDetailsRequest;
use App\Modules\Users\Requests\UpdateProfileRequest;
use App\Modules\Users\Resources\UserProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
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

    // Provider: save payout bank details
    public function stripeOnboarding(UpdatePayoutDetailsRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isProvider()) {
            return response()->json(['message' => 'Somente prestadores podem configurar dados de recebimento.'], 403);
        }

        $user->update([
            ...$request->validated(),
            'bank_details_completed' => true,
            // Keep legacy field aligned while frontend migrates.
            'stripe_onboarding_completed' => true,
        ]);

        return response()->json([
            'message' => 'Dados bancários salvos com sucesso.',
            'payout_details_completed' => true,
            'bank_details' => $this->bankDetailsPayload($user->fresh()),
        ]);
    }

    // Provider: check payout setup status
    public function stripeStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isProvider()) {
            return response()->json(['message' => 'Não aplicável.'], 422);
        }

        $completed = $user->hasBankDetails();

        return response()->json([
            // Legacy compatibility with existing frontend typings.
            'stripe_onboarding_completed' => $completed,
            'payout_details_completed' => $completed,
            'message' => $completed
                ? 'Dados bancários cadastrados. Os pagamentos aprovados ficam retidos na plataforma até o repasse.'
                : 'Cadastre seus dados bancários para habilitar recebimentos dos contratos.',
            'bank_details' => $this->bankDetailsPayload($user),
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store("avatars/{$user->uuid}", 'public');
        $url = Storage::disk('public')->url($path);

        $user->update(['avatar_url' => $url]);

        return response()->json(['avatar_url' => $url]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->user()->delete();

        return response()->json(['message' => 'Conta excluída.']);
    }

    public function show(string $uuid): JsonResponse
    {
        $user = User::where('uuid', $uuid)
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
            'stripe_ready' => $user->hasBankDetails(),
            'member_since' => $user->created_at->toDateString(),
        ]);
    }

    private function bankDetailsPayload(User $user): array
    {
        return [
            'bank_holder_name' => $user->bank_holder_name,
            'bank_holder_document' => $user->bank_holder_document,
            'bank_name' => $user->bank_name,
            'bank_code' => $user->bank_code,
            'bank_agency' => $user->bank_agency,
            'bank_agency_digit' => $user->bank_agency_digit,
            'bank_account_number' => $user->bank_account_number,
            'bank_account_digit' => $user->bank_account_digit,
            'bank_account_type' => $user->bank_account_type,
            'bank_pix_key' => $user->bank_pix_key,
        ];
    }
}
