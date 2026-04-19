<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Models\UserSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PragmaRX\Google2FA\Google2FA;

class AuthService
{
    public function __construct(private readonly Google2FA $google2fa) {}

    public function register(array $data): array
    {
        // Remove any soft-deleted record with the same email so the unique DB constraint doesn't block insertion
        User::withTrashed()
            ->where('email', $data['email'])
            ->whereNotNull('deleted_at')
            ->forceDelete();

        $user = User::create([
            'uuid' => Str::uuid(),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'cpf' => $data['cpf'] ?? null,
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'role' => $data['role'] ?? 'contractor',
            'needs_onboarding' => true,
        ]);

        if (isset($data['address'])) {
            $user->address()->create([
                'uuid' => Str::uuid(),
                ...$data['address'],
            ]);
        }

        return $this->issueTokens($user, $data['device_name'] ?? 'Unknown', request());
    }

    public function login(array $credentials, string $deviceName, $request): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new \RuntimeException('Credenciais inválidas.', 401);
        }

        if ($user->deleted_at) {
            throw new \RuntimeException('Conta desativada.', 403);
        }

        if ($user->totp_enabled) {
            if (empty($credentials['totp_code'])) {
                throw new \RuntimeException('Código 2FA obrigatório.', 422);
            }

            $timestamp = $this->google2fa->verifyKeyNewer(
                $user->totp_secret,
                $credentials['totp_code'],
                $user->totp_last_timestamp ?? 0
            );

            if ($timestamp === false) {
                throw new \RuntimeException('Código 2FA inválido ou já utilizado.', 422);
            }

            $user->update(['totp_last_timestamp' => $timestamp]);
        }

        return $this->issueTokens($user, $deviceName, $request);
    }

    public function loginWithGoogle(SocialiteUser $socialUser, $request): array
    {
        // Permanently remove any soft-deleted record with the same google_id or email
        // so the DB unique constraint doesn't block creating a fresh account
        User::withTrashed()
            ->whereNotNull('deleted_at')
            ->where(function ($q) use ($socialUser) {
                $q->where('google_id', $socialUser->getId())
                    ->orWhere('email', $socialUser->getEmail());
            })
            ->forceDelete();

        $user = User::where('google_id', $socialUser->getId())->first()
            ?? User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            $user->update([
                'google_id' => $socialUser->getId(),
                'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            $nameParts = explode(' ', $socialUser->getName(), 2);
            $user = User::create([
                'uuid' => Str::uuid(),
                'first_name' => $nameParts[0],
                'last_name' => $nameParts[1] ?? '',
                'email' => $socialUser->getEmail(),
                'google_id' => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
                'role' => 'contractor',
                'needs_onboarding' => true,
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        if ($user->totp_enabled) {
            $tempToken = Str::random(64);
            Cache::put("totp_pending:{$tempToken}", $user->id, now()->addMinutes(5));

            return ['totp_required' => true, 'temp_token' => $tempToken];
        }

        return $this->issueTokens($user, 'Google OAuth', $request);
    }

    public function verifyGoogleTotp(string $tempToken, string $code, $request): array
    {
        $userId = Cache::get("totp_pending:{$tempToken}");
        if (! $userId) {
            throw new \RuntimeException('Token inválido ou expirado.', 422);
        }

        $user = User::find($userId);
        if (! $user) {
            throw new \RuntimeException('Usuário não encontrado.', 404);
        }

        $timestamp = $this->google2fa->verifyKeyNewer(
            $user->totp_secret,
            $code,
            $user->totp_last_timestamp ?? 0
        );

        if ($timestamp === false) {
            throw new \RuntimeException('Código 2FA inválido ou já utilizado.', 422);
        }

        $user->update(['totp_last_timestamp' => $timestamp]);
        Cache::forget("totp_pending:{$tempToken}");

        return $this->issueTokens($user, 'Google OAuth', $request);
    }

    public function completeOnboarding(User $user, string $role): void
    {
        $user->update([
            'role' => $role,
            'needs_onboarding' => false,
        ]);
    }

    public function refresh(string $refreshToken, $request): array
    {
        $hash = hash('sha256', $refreshToken);
        $session = UserSession::where('refresh_token_hash', $hash)
            ->where('is_revoked', false)
            ->with('user')
            ->first();

        if (! $session || $session->isExpired()) {
            throw new \RuntimeException('Refresh token inválido ou expirado.', 401);
        }

        // Rotate: revoke old session, issue new pair
        $session->update(['is_revoked' => true]);

        return $this->issueTokens($session->user, $session->device_name, $request);
    }

    public function logout(string $jti): void
    {
        UserSession::where('jti', $jti)->update(['is_revoked' => true]);
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    public function revokeSession(User $user, string $sessionUuid): void
    {
        $user->sessions()->where('uuid', $sessionUuid)->update(['is_revoked' => true]);
    }

    public function renameSession(User $user, string $sessionUuid, string $deviceName): void
    {
        $updated = $user->sessions()
            ->where('uuid', $sessionUuid)
            ->where('is_revoked', false)
            ->update(['device_name' => $deviceName]);

        if (! $updated) {
            throw new \RuntimeException('Sessão não encontrada.', 404);
        }
    }

    public function revokeAllSessions(User $user, ?string $exceptJti = null): void
    {
        $query = $user->sessions()->where('is_revoked', false);

        if ($exceptJti) {
            $query->where('jti', '!=', $exceptJti);
        }

        $query->update(['is_revoked' => true]);
    }

    public function enableTotp(User $user): array
    {
        $secret = $this->google2fa->generateSecretKey();
        $user->update(['totp_secret' => $secret]);

        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return ['secret' => $secret, 'qr_url' => $qrUrl];
    }

    public function confirmTotp(User $user, string $code): void
    {
        $timestamp = $this->google2fa->verifyKeyNewer(
            $user->totp_secret,
            $code,
            $user->totp_last_timestamp ?? 0
        );

        if ($timestamp === false) {
            throw new \RuntimeException('Código inválido para ativar 2FA.', 422);
        }

        $user->update(['totp_enabled' => true, 'totp_last_timestamp' => $timestamp]);
    }

    public function disableTotp(User $user, string $code): void
    {
        $timestamp = $this->google2fa->verifyKeyNewer(
            $user->totp_secret,
            $code,
            $user->totp_last_timestamp ?? 0
        );

        if ($timestamp === false) {
            throw new \RuntimeException('Código inválido.', 422);
        }

        $user->update(['totp_enabled' => false, 'totp_secret' => null, 'totp_last_timestamp' => null]);
    }

    private function issueTokens(User $user, string $deviceName, $request): array
    {
        $jti = Str::uuid()->toString();

        $token = JWTAuth::claims(['jti' => $jti])->fromUser($user);
        $refreshToken = Str::random(64);

        UserSession::create([
            'uuid' => Str::uuid(),
            'user_id' => $user->id,
            'jti' => $jti,
            'refresh_token_hash' => hash('sha256', $refreshToken),
            'device_name' => $deviceName,
            'device_type' => $this->detectDeviceType($request->userAgent() ?? ''),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_active_at' => now(),
            'refresh_expires_at' => Carbon::now()->addDays(30),
            'is_revoked' => false,
        ]);

        return [
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ];
    }

    private function detectDeviceType(string $userAgent): string
    {
        $ua = strtolower($userAgent);

        if (str_contains($ua, 'mobile') || str_contains($ua, 'android')) {
            return 'mobile';
        }

        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            return 'tablet';
        }

        return 'browser';
    }
}
