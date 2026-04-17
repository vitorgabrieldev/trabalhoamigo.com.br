<?php

namespace App\Modules\Reviews\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Review;
use App\Modules\Reviews\Requests\StoreReviewRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function store(StoreReviewRequest $request, Contract $contract): JsonResponse
    {
        $user = $request->user();

        if ($contract->contractor_id !== $user->id) {
            return response()->json(['message' => 'Somente o contratante pode avaliar.'], 403);
        }

        if (! $contract->isFinished()) {
            return response()->json(['message' => 'O serviço precisa estar concluído ou cancelado para avaliar.'], 422);
        }

        if ($contract->review()->exists()) {
            return response()->json(['message' => 'Este contrato já foi avaliado.'], 422);
        }

        // Determine trigger: completed or cancelled
        $trigger = in_array($contract->status, ['contractor_confirmed', 'auto_completed'])
            ? 'completed'
            : 'cancelled';

        $review = Review::create([
            'uuid' => Str::uuid(),
            'contract_id' => $contract->id,
            'service_id' => $contract->service_id,
            'reviewer_id' => $user->id,
            'reviewed_id' => $contract->provider_id,
            'stars' => $request->validated('stars'),
            'comment' => $request->validated('comment'),
            'trigger' => $trigger,
        ]);

        return response()->json([
            'uuid' => $review->uuid,
            'stars' => $review->stars,
            'comment' => $review->comment,
            'created_at' => $review->created_at->toIso8601String(),
        ], 201);
    }

    public function forService(string $serviceUuid): JsonResponse
    {
        $reviews = Review::whereHas('service', fn ($q) => $q->where('uuid', $serviceUuid))
            ->with('reviewer:id,uuid,first_name,last_name,avatar_url')
            ->latest()
            ->paginate(15);

        return response()->json($reviews->through(fn ($r) => [
            'uuid' => $r->uuid,
            'stars' => $r->stars,
            'comment' => $r->comment,
            'trigger' => $r->trigger,
            'reviewer' => [
                'uuid' => $r->reviewer->uuid,
                'name' => $r->reviewer->full_name,
                'avatar_url' => $r->reviewer->avatar_url,
            ],
            'created_at' => $r->created_at->toIso8601String(),
        ]));
    }
}
