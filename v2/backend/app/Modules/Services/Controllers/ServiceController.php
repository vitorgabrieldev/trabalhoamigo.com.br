<?php

namespace App\Modules\Services\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Modules\Services\Requests\StoreServiceRequest;
use App\Modules\Services\Requests\UpdateServiceRequest;
use App\Modules\Services\Resources\ServiceResource;
use App\Modules\Services\Services\ServiceManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceController extends Controller
{
    public function __construct(private readonly ServiceManager $serviceManager) {}

    // Public listing — only visible providers
    public function index(): JsonResponse
    {
        $services = QueryBuilder::for(
            Service::visible()->with(['user:id,uuid,first_name,last_name,avatar_url', 'category:id,uuid,name,slug'])
        )
            ->allowedFilters([
                AllowedFilter::exact('category_uuid', 'category.uuid'),
                AllowedFilter::exact('is_community'),
                AllowedFilter::scope('search'),
            ])
            ->allowedSorts(['base_price', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(20);

        return response()->json(ServiceResource::collection($services)->response()->getData(true));
    }

    public function show(Service $service): JsonResponse
    {
        abort_if($service->status !== 'active', 404);
        $service->load(['user:id,uuid,first_name,last_name,avatar_url', 'category', 'reviews' => fn ($q) => $q->latest()->limit(5)]);

        return response()->json(new ServiceResource($service));
    }

    // Provider: my services
    public function myServices(Request $request): JsonResponse
    {
        $services = QueryBuilder::for(
            Service::where('user_id', $request->user()->id)->with('category')
        )
            ->allowedFilters([AllowedFilter::exact('status')])
            ->defaultSort('-created_at')
            ->paginate(20);

        return response()->json(ServiceResource::collection($services)->response()->getData(true));
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceManager->create($request->user(), $request->validated());

        return response()->json(new ServiceResource($service->load('category')), 201);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        abort_if($service->user_id !== $request->user()->id, 403);

        $updated = $this->serviceManager->update($service, $request->validated());

        return response()->json(new ServiceResource($updated->load('category')));
    }

    public function destroy(Request $request, Service $service): JsonResponse
    {
        abort_if($service->user_id !== $request->user()->id, 403);
        $service->update(['status' => 'inactive']);
        $service->delete();

        return response()->json(['message' => 'Serviço removido.']);
    }

    public function communityAvailability(Request $request): JsonResponse
    {
        return response()->json($this->serviceManager->checkCommunityAvailability($request->user()));
    }
}
