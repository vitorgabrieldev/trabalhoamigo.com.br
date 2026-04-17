<?php

namespace App\Modules\Contracts\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Modules\Contracts\Requests\OpenDisputeRequest;
use App\Modules\Contracts\Resources\ContractResource;
use App\Modules\Contracts\Services\ContractService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ContractController extends Controller
{
    public function __construct(private readonly ContractService $contractService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $user->isProvider()
            ? Contract::where('provider_id', $user->id)
            : Contract::where('contractor_id', $user->id);

        $contracts = QueryBuilder::for($query->with(['service.category', 'contractor', 'provider']))
            ->allowedFilters([AllowedFilter::exact('status')])
            ->defaultSort('-created_at')
            ->paginate(15);

        return response()->json(ContractResource::collection($contracts)->response()->getData(true));
    }

    public function show(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeAccess($request->user(), $contract);
        $contract->load(['service.category', 'contractor', 'provider', 'review', 'dispute', 'calendarBlock']);

        return response()->json(new ContractResource($contract));
    }

    // Provider marks work as done
    public function markProviderCompleted(Request $request, Contract $contract): JsonResponse
    {
        $this->contractService->markProviderCompleted($contract, $request->user());

        return response()->json([
            'message' => 'Serviço marcado como concluído. O contratante tem 3 dias para confirmar.',
            'auto_release_at' => $contract->fresh()->auto_release_at->toIso8601String(),
        ]);
    }

    // Contractor confirms work done
    public function markContractorConfirmed(Request $request, Contract $contract): JsonResponse
    {
        $this->contractService->markContractorConfirmed($contract, $request->user());

        return response()->json(['message' => 'Serviço confirmado. O pagamento foi liberado ao prestador.']);
    }

    // Contractor opens dispute
    public function openDispute(OpenDisputeRequest $request, Contract $contract): JsonResponse
    {
        $dispute = $this->contractService->openDispute(
            $contract,
            $request->user(),
            $request->validated('reason')
        );

        return response()->json([
            'message' => 'Disputa aberta. Nossa equipe irá analisar o caso.',
            'dispute_uuid' => $dispute->uuid,
        ], 201);
    }

    private function authorizeAccess(mixed $user, Contract $contract): void
    {
        if (! in_array($user->id, [$contract->contractor_id, $contract->provider_id]) && ! $user->isAdmin()) {
            abort(403, 'Não autorizado.');
        }
    }
}
