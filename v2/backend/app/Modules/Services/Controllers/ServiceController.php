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
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceController extends Controller
{
    public function __construct(private readonly ServiceManager $serviceManager) {}

    // Public listing — only visible providers
    public function index(): JsonResponse
    {
        $services = QueryBuilder::for(
            Service::visible()
                ->withAvg('reviews', 'stars')
                ->with(['user:id,uuid,first_name,last_name,avatar_url,created_at', 'user.address', 'category:id,uuid,name,slug', 'images'])
        )
            ->allowedFilters(
                AllowedFilter::callback('category_uuid', function ($query, $value) {
                    $uuids = is_array($value) ? $value : explode(',', (string) $value);
                    $query->whereHas('category', fn ($q) => $q->whereIn('uuid', array_filter($uuids)));
                }),
                AllowedFilter::callback('provider_uuid', function ($query, $value) {
                    $query->whereHas('user', fn ($q) => $q->where('uuid', $value));
                }),
                AllowedFilter::callback('exclude_uuid', function ($query, $value) {
                    $query->where('uuid', '!=', $value);
                }),
                AllowedFilter::exact('is_community'),
                AllowedFilter::exact('accepts_offer'),
                AllowedFilter::scope('search'),
                AllowedFilter::callback('price_min', fn ($q, $v) => $q->where('base_price', '>=', (float) $v)),
                AllowedFilter::callback('price_max', fn ($q, $v) => $q->where('base_price', '<=', (float) $v)),
                AllowedFilter::callback('min_rating', fn ($q, $v) => $q->having('reviews_avg_stars', '>=', (float) $v)),
                AllowedFilter::callback('city', fn ($q, $v) =>
                    $q->whereHas('user.address', fn ($aq) => $aq->where('city', 'like', "%{$v}%"))
                ),
                AllowedFilter::callback('state', fn ($q, $v) =>
                    $q->whereHas('user.address', fn ($aq) => $aq->whereRaw('UPPER(state) = ?', [strtoupper($v)]))
                ),
                AllowedFilter::callback('neighborhood', fn ($q, $v) =>
                    $q->whereHas('user.address', fn ($aq) => $aq->where('neighborhood', 'like', "%{$v}%"))
                ),
            )
            ->allowedSorts(
                'base_price',
                'created_at',
                AllowedSort::field('average_rating', 'reviews_avg_stars'),
            )
            ->defaultSort('-created_at')
            ->paginate(20);

        return response()->json(ServiceResource::collection($services)->response()->getData(true));
    }

    public function show(Service $service): JsonResponse
    {
        abort_if($service->status !== 'active', 404);
        $service->load(['user:id,uuid,first_name,last_name,avatar_url', 'category', 'images', 'reviews' => fn ($q) => $q->latest()->limit(5)]);

        return response()->json(new ServiceResource($service));
    }

    // Provider: my services
    public function myServices(Request $request): JsonResponse
    {
        $services = QueryBuilder::for(
            Service::where('user_id', $request->user()->id)->with(['category', 'images'])
        )
            ->allowedFilters(AllowedFilter::exact('status'))
            ->defaultSort('-created_at')
            ->paginate(20);

        return response()->json(ServiceResource::collection($services)->response()->getData(true));
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceManager->create(
            $request->user(),
            $request->validated(),
            $request->file('images', [])
        );

        return response()->json(new ServiceResource($service->load(['category', 'images'])), 201);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        abort_if($service->user_id !== $request->user()->id, 403);

        $updated = $this->serviceManager->update(
            $service,
            $request->validated(),
            $request->file('images', [])
        );

        return response()->json(new ServiceResource($updated->load(['category', 'images'])));
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
