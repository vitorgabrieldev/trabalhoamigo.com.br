<?php

use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

beforeEach(function () {
    $publicDiskRoot = base_path('tests/.tmp/public');
    File::ensureDirectoryExists($publicDiskRoot);
    config()->set('filesystems.disks.public.root', $publicDiskRoot);
    config()->set('filesystems.disks.public.url', 'http://localhost/storage');

    $this->seed(CategorySeeder::class);
    $this->category = Category::first();
});

it('lists active services publicly', function () {
    $provider = User::factory()->provider()->create();
    Service::factory()->count(3)->create(['user_id' => $provider->id, 'category_id' => $this->category->id]);

    $this->getJson('/api/services')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

it('allows provider to create a service', function () {
    $provider = User::factory()->provider()->create();

    $this->actingAs($provider, 'api')
        ->postJson('/api/services', [
            'title' => 'Pintura residencial',
            'description' => 'Pintura completa de residências com tinta de qualidade.',
            'category_uuid' => $this->category->uuid,
            'base_price' => 350.00,
            'accepts_offer' => true,
            'is_community' => false,
        ])
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'Pintura residencial']);

    $this->assertDatabaseHas('services', ['title' => 'Pintura residencial']);
});

it('allows provider to create a service with multiple images', function () {
    $provider = User::factory()->provider()->create();
    $tinyPng = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6pE9oAAAAASUVORK5CYII=');

    $response = $this->actingAs($provider, 'api')
        ->post('/api/services', [
            'title' => 'Serviço com fotos',
            'description' => 'Descrição detalhada do serviço com imagens.',
            'category_uuid' => $this->category->uuid,
            'base_price' => '120.00',
            'accepts_offer' => '1',
            'is_community' => '0',
            'images' => [
                UploadedFile::fake()->createWithContent('foto-1.png', $tinyPng),
                UploadedFile::fake()->createWithContent('foto-2.png', $tinyPng),
            ],
        ], ['Accept' => 'application/json']);

    $response
        ->assertStatus(201)
        ->assertJsonCount(2, 'images')
        ->assertJsonPath('title', 'Serviço com fotos');

    $service = Service::where('title', 'Serviço com fotos')->firstOrFail();

    $this->assertDatabaseHas('service_images', ['service_id' => $service->id, 'position' => 0]);
    $this->assertDatabaseHas('service_images', ['service_id' => $service->id, 'position' => 1]);
});

it('prevents contractor from creating a service', function () {
    $contractor = User::factory()->contractor()->create();

    $this->actingAs($contractor, 'api')
        ->postJson('/api/services', [
            'title' => 'Tentativa inválida',
            'description' => 'Descrição do serviço.',
            'category_uuid' => $this->category->uuid,
        ])
        ->assertStatus(403);
});

it('prevents a community service from accepting proposals at the same time', function () {
    $provider = User::factory()->provider()->create();

    $this->actingAs($provider, 'api')
        ->postJson('/api/services', [
            'title' => 'Serviço inválido',
            'description' => 'Descrição de teste para flags incompatíveis.',
            'category_uuid' => $this->category->uuid,
            'accepts_offer' => true,
            'is_community' => true,
        ])
        ->assertStatus(422)
        ->assertJsonFragment(['message' => 'Serviço comunitário não pode aceitar propostas.']);
});

it('enforces community service limit of 3 per user', function () {
    $provider = User::factory()->provider()->create();

    // Create 3 community services
    for ($i = 1; $i <= 3; $i++) {
        Service::create([
            'uuid' => Str::uuid(),
            'user_id' => $provider->id,
            'category_id' => $this->category->id,
            'title' => "Serviço comunitário {$i}",
            'description' => 'Descrição.',
            'is_community' => true,
            'status' => 'active',
        ]);
    }

    // 4th should fail
    $this->actingAs($provider, 'api')
        ->postJson('/api/services', [
            'title' => 'Quarto serviço comunitário',
            'description' => 'Descrição do quarto serviço comunitário.',
            'category_uuid' => $this->category->uuid,
            'is_community' => true,
        ])
        ->assertStatus(422)
        ->assertJsonFragment(['message' => 'Você atingiu o limite de 3 serviços comunitários ativos.']);
});

it('provider can update their own service', function () {
    $provider = User::factory()->provider()->create();
    $service = Service::create([
        'uuid' => Str::uuid(),
        'user_id' => $provider->id,
        'category_id' => $this->category->id,
        'title' => 'Serviço original',
        'description' => 'Descrição original.',
        'status' => 'active',
    ]);

    $this->actingAs($provider, 'api')
        ->patchJson("/api/services/{$service->uuid}", ['title' => 'Serviço atualizado'])
        ->assertOk()
        ->assertJsonFragment(['title' => 'Serviço atualizado']);
});

it('prevents editing another providers service', function () {
    $providerA = User::factory()->provider()->create();
    $providerB = User::factory()->provider()->create();

    $service = Service::create([
        'uuid' => Str::uuid(),
        'user_id' => $providerA->id,
        'category_id' => $this->category->id,
        'title' => 'Serviço do A',
        'description' => 'Descrição.',
        'status' => 'active',
    ]);

    $this->actingAs($providerB, 'api')
        ->patchJson("/api/services/{$service->uuid}", ['title' => 'Tentativa'])
        ->assertStatus(403);
});
