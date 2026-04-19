<?php

use App\Models\User;
use App\Models\UserSession;
use Illuminate\Support\Str;

it('allows renaming an active device session', function () {
    $user = User::factory()->create();

    $session = UserSession::create([
        'uuid' => Str::uuid(),
        'user_id' => $user->id,
        'jti' => Str::uuid()->toString(),
        'refresh_token_hash' => hash('sha256', Str::random(64)),
        'device_name' => 'Chrome',
        'device_type' => 'browser',
        'last_active_at' => now(),
        'refresh_expires_at' => now()->addDays(30),
        'is_revoked' => false,
    ]);

    $this->actingAs($user, 'api')
        ->patchJson("/api/auth/sessions/{$session->uuid}", [
            'device_name' => 'Notebook do escritório',
        ])
        ->assertOk()
        ->assertJsonFragment(['message' => 'Dispositivo renomeado com sucesso.']);

    $this->assertDatabaseHas('user_sessions', [
        'uuid' => (string) $session->uuid,
        'device_name' => 'Notebook do escritório',
    ]);
});

it('allows provider to save bank details for payouts', function () {
    $provider = User::factory()->create([
        'role' => 'provider',
        'bank_details_completed' => false,
        'stripe_onboarding_completed' => false,
    ]);

    $payload = [
        'bank_holder_name' => 'Maria Silva',
        'bank_holder_document' => '12345678901',
        'bank_name' => 'Banco do Brasil',
        'bank_code' => '001',
        'bank_agency' => '1234',
        'bank_agency_digit' => '5',
        'bank_account_number' => '987654',
        'bank_account_digit' => '1',
        'bank_account_type' => 'checking',
        'bank_pix_key' => 'maria@email.com',
    ];

    $this->actingAs($provider, 'api')
        ->postJson('/api/me/stripe/onboarding', $payload)
        ->assertOk()
        ->assertJsonPath('payout_details_completed', true);

    $this->assertDatabaseHas('users', [
        'id' => $provider->id,
        'bank_details_completed' => true,
        'bank_code' => '001',
        'bank_account_type' => 'checking',
    ]);
});

it('rejects payout bank detail updates for non providers', function () {
    $contractor = User::factory()->create(['role' => 'contractor']);

    $this->actingAs($contractor, 'api')
        ->postJson('/api/me/stripe/onboarding', [
            'bank_holder_name' => 'João Silva',
            'bank_holder_document' => '12345678901',
            'bank_name' => 'Banco do Brasil',
            'bank_code' => '001',
            'bank_agency' => '1234',
            'bank_account_number' => '987654',
            'bank_account_type' => 'checking',
        ])
        ->assertStatus(403);
});
