<?php

namespace App\Modules\Services\Services;

use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceManager
{
    private const COMMUNITY_LIMIT_PER_USER = 3;

    // Global cap: community services must not exceed 10% of all active services
    private const COMMUNITY_PLATFORM_RATIO = 0.10;

    /**
     * @param array<int, UploadedFile> $imageFiles
     */
    public function create(User $provider, array $data, array $imageFiles = []): Service
    {
        $this->assertMutuallyExclusiveFlags(
            acceptsOffer: (bool) ($data['accepts_offer'] ?? false),
            isCommunity: (bool) ($data['is_community'] ?? false),
        );

        if ($data['is_community'] ?? false) {
            $this->validateCommunityLimits($provider);
        }

        return DB::transaction(function () use ($provider, $data, $imageFiles) {
            $service = Service::create([
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

            if (! empty($imageFiles)) {
                $this->syncServiceImages($service, $imageFiles);
            }

            return $service;
        });
    }

    /**
     * @param array<int, UploadedFile> $imageFiles
     */
    public function update(Service $service, array $data, array $imageFiles = []): Service
    {
        $nextAcceptsOffer = array_key_exists('accepts_offer', $data)
            ? (bool) $data['accepts_offer']
            : (bool) $service->accepts_offer;
        $nextIsCommunity = array_key_exists('is_community', $data)
            ? (bool) $data['is_community']
            : (bool) $service->is_community;

        $this->assertMutuallyExclusiveFlags(
            acceptsOffer: $nextAcceptsOffer,
            isCommunity: $nextIsCommunity,
        );

        $becomingCommunity = ($data['is_community'] ?? false) && ! $service->is_community;

        if ($becomingCommunity) {
            $this->validateCommunityLimits($service->user);
        }

        return DB::transaction(function () use ($service, $data, $imageFiles) {
            $service->update([
                'title' => $data['title'] ?? $service->title,
                'description' => $data['description'] ?? $service->description,
                'base_price' => $data['base_price'] ?? $service->base_price,
                'accepts_offer' => $data['accepts_offer'] ?? $service->accepts_offer,
                'is_community' => $data['is_community'] ?? $service->is_community,
                'image_url' => $data['image_url'] ?? $service->image_url,
                'status' => $data['status'] ?? $service->status,
            ]);

            if (! empty($imageFiles)) {
                $this->syncServiceImages($service, $imageFiles);
            }

            return $service->fresh();
        });
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

    private function assertMutuallyExclusiveFlags(bool $acceptsOffer, bool $isCommunity): void
    {
        if ($acceptsOffer && $isCommunity) {
            throw new \RuntimeException('Serviço comunitário não pode aceitar propostas.', 422);
        }
    }

    /**
     * @param array<int, UploadedFile> $imageFiles
     */
    private function syncServiceImages(Service $service, array $imageFiles): void
    {
        if (empty($imageFiles)) {
            return;
        }

        $existingUrls = $service->images()->pluck('image_url')->all();
        foreach ($existingUrls as $url) {
            $this->deletePublicImageIfManaged($url);
        }

        $service->images()->delete();

        $imagesData = [];
        foreach ($imageFiles as $index => $file) {
            $path = $file->store("services/{$service->uuid}", 'public');
            $imagesData[] = [
                'image_url' => Storage::disk('public')->url($path),
                'position' => $index,
            ];
        }

        $service->images()->createMany($imagesData);
        $service->update(['image_url' => $imagesData[0]['image_url'] ?? $service->image_url]);
    }

    private function deletePublicImageIfManaged(string $url): void
    {
        $publicDisk = Storage::disk('public');
        $publicBaseUrl = rtrim($publicDisk->url(''), '/');

        if (str_starts_with($url, "{$publicBaseUrl}/")) {
            $relativePath = ltrim(Str::replaceFirst($publicBaseUrl, '', $url), '/');
            if ($relativePath !== '') {
                $publicDisk->delete($relativePath);
            }

            return;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path) || ! str_contains($path, '/storage/')) {
            return;
        }

        $relativePath = ltrim(Str::after($path, '/storage/'), '/');
        if ($relativePath !== '') {
            $publicDisk->delete($relativePath);
        }
    }
}
