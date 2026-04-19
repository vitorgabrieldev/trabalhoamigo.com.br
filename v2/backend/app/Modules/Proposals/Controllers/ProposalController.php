<?php

namespace App\Modules\Proposals\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Service;
use App\Modules\Proposals\Requests\StoreProposalRequest;
use App\Modules\Proposals\Resources\ProposalResource;
use App\Modules\Proposals\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProposalController extends Controller
{
    public function __construct(private readonly ProposalService $proposalService) {}

    // Contractor: list my sent proposals
    public function myProposals(Request $request): JsonResponse
    {
        $proposals = QueryBuilder::for(
            Proposal::where('contractor_id', $request->user()->id)->with(['service.category', 'scheduleSlots'])
        )
            ->allowedFilters(AllowedFilter::exact('status'))
            ->allowedSorts('created_at', 'offered_price')
            ->defaultSort('-created_at')
            ->paginate(15);

        return response()->json(ProposalResource::collection($proposals)->response()->getData(true));
    }

    // Provider: list received proposals
    public function receivedProposals(Request $request): JsonResponse
    {
        $proposals = QueryBuilder::for(
            Proposal::where('provider_id', $request->user()->id)
                ->with(['service', 'contractor', 'scheduleSlots'])
        )
            ->allowedFilters(AllowedFilter::exact('status'))
            ->defaultSort('-created_at')
            ->paginate(15);

        return response()->json(ProposalResource::collection($proposals)->response()->getData(true));
    }

    public function show(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorizeView($request->user(), $proposal);

        $proposal->load(['service.category', 'contractor', 'provider', 'scheduleSlots', 'contract']);

        return response()->json(new ProposalResource($proposal));
    }

    // Contractor submits proposal
    public function store(StoreProposalRequest $request, Service $service): JsonResponse
    {
        if ($request->user()->role === 'provider') {
            return response()->json(['message' => 'Prestadores não podem contratar serviços de outros prestadores.'], 403);
        }

        $proposal = $this->proposalService->submit(
            $request->user(),
            $service,
            $request->validated()
        );

        return response()->json(new ProposalResource($proposal), 201);
    }

    // Provider accepts
    public function accept(Request $request, Proposal $proposal): JsonResponse
    {
        $request->validate([
            'slot_uuid' => ['nullable', 'string'],
            'terms_accepted' => ['required', 'accepted'],
        ]);

        if ($request->user()->id !== $proposal->provider_id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $updated = $this->proposalService->accept($proposal, $request->input('slot_uuid', ''));

        return response()->json(new ProposalResource($updated));
    }

    // Provider rejects
    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        if ($request->user()->id !== $proposal->provider_id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $this->proposalService->reject($proposal);

        return response()->json(['message' => 'Proposta recusada.']);
    }

    // Contractor cancels (before acceptance)
    public function cancel(Request $request, Proposal $proposal): JsonResponse
    {
        $this->proposalService->cancelBeforeAcceptance($proposal, $request->user());

        return response()->json(['message' => 'Proposta cancelada. O valor será estornado integralmente.']);
    }

    // Contractor: get Stripe Checkout Session ID → frontend redirects to Stripe
    public function checkout(Request $request, Proposal $proposal): JsonResponse
    {
        $baseUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
        $url = $this->proposalService->getCheckoutUrl($proposal, $request->user(), $baseUrl);

        return response()->json(['url' => $url]);
    }

    // Contractor: called on success return from Stripe
    public function pay(Request $request, Proposal $proposal): JsonResponse
    {
        $request->validate(['session_id' => ['required', 'string']]);

        $updated = $this->proposalService->completePayment(
            $proposal,
            $request->user(),
            $request->input('session_id'),
        );

        return response()->json(new ProposalResource($updated));
    }

    // Confirm "to be arranged" schedule agreement
    public function confirmSchedule(Request $request, Proposal $proposal): JsonResponse
    {
        $this->proposalService->confirmScheduleAgreement($proposal, $request->user());

        return response()->json(['message' => 'Horário confirmado como combinado entre as partes.']);
    }

    private function authorizeView(mixed $user, Proposal $proposal): void
    {
        if (! in_array($user->id, [$proposal->contractor_id, $proposal->provider_id]) && ! $user->isAdmin()) {
            abort(403, 'Não autorizado.');
        }
    }
}
