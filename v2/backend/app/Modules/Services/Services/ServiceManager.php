<?php

namespace App\Modules\Services\Services;

use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceManager
{
    private const COMMUNITY_LIMIT_PER_USER = 3;

    // Global cap: community services must not exceed 10% of all active services
    private const COMMUNITY_PLATFORM_RATIO = 0.10;

    public function create(User $provider, array $data): Service
    {
        if ($data['is_community'] ?? false) {
            $this->validateCommunityLimits($provider);
        }

        return DB::transaction(function () use ($provider, $data) {
            return Service::create([
                'uuid' => Str::uuid(),
                'user_id' => $provider->id,
                'category_id' => $this->resolveCategoryId($data['category_uuid']),
                'title' => $data['title'],
                'description' => $data['description'],
                'base_price' => $data['base_price'] ?? null,
                'accepts_offer' => $data['accepts_offer'] ?? false,
                'is_community' => $data['is_community'] ?? false,
                'image_url' => $data['image_url'] ?? null,
                'status' => 'active',
            ]);
        });
    }

    public function update(Service $service, array $data): Service
    {
        $becomingCommunity = ($data['is_community'] ?? false) && ! $service->is_community;

        if ($becomingCommunity) {
            $this->validateCommunityLimits($service->user);
        }

        $service->update([
            'title' => $data['title'] ?? $service->title,
            'description' => $data['description'] ?? $service->description,
            'base_price' => $data['base_price'] ?? $service->base_price,
            'accepts_offer' => $data['accepts_offer'] ?? $service->accepts_offer,
            'is_community' => $data['is_community'] ?? $service->is_community,
            'image_url' => $data['image_url'] ?? $service->image_url,
            'status' => $data['status'] ?? $service->status,
        ]);

        return $service->fresh();
    }

    public function checkCommunityAvailability(User $provider): array
    {
        $userCount = $provider->activeCommunityServices()->count();
        $globalTotal = Service::where('status', 'active')->count();
        $globalCommunity = Service::where('status', 'active')->where('is_community', true)->count();

        $userLimitReached = $userCount >= self::COMMUNITY_LIMIT_PER_USER;

        $globalLimitReached = $globalTotal > 0
            && ($globalCommunity / $globalTotal) >= self::COMMUNITY_PLATFORM_RATIO;

        return [
            'available' => ! $userLimitReached && ! $globalLimitReached,
            'user_count' => $userCount,
            'user_limit' => self::COMMUNITY_LIMIT_PER_USER,
            'user_limit_reached' => $userLimitReached,
            'global_limit_reached' => $globalLimitReached,
            'reason' => match (true) {
                $userLimitReached => "Você atingiu o limite de " . self::COMMUNITY_LIMIT_PER_USER . " serviços comunitários ativos.",
                $globalLimitReached => "A plataforma atingiu o limite global de serviços comunitários por medida de segurança. Tente novamente mais tarde.",
                default => null,
            },
        ];
    }

    private function validateCommunityLimits(User $provider): void
    {
        $status = $this->checkCommunityAvailability($provider);

        if (! $status['available']) {
            throw new \RuntimeException($status['reason'], 422);
        }
    }

    private function resolveCategoryId(string $categoryUuid): int
    {
        return \App\Models\Category::where('uuid', $categoryUuid)->value('id')
            ?? throw new \RuntimeException('Categoria inválida.', 422);
    }
}
