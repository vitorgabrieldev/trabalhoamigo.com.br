<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Models\UserSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PragmaRX\Google2FA\Google2FA;

class AuthService
{
    public function __construct(private readonly Google2FA $google2fa) {}

    public function register(array $data): array
    {
        $user = User::create([
            'uuid' => Str::uuid(),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'cpf' => $data['cpf'] ?? null,
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'role' => $data['role'],
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

            $valid = $this->google2fa->verifyKey($user->totp_secret, $credentials['totp_code']);

            if (! $valid) {
                throw new \RuntimeException('Código 2FA inválido.', 422);
            }
        }

        return $this->issueTokens($user, $deviceName, $request);
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
        $valid = $this->google2fa->verifyKey($user->totp_secret, $code);

        if (! $valid) {
            throw new \RuntimeException('Código inválido para ativar 2FA.', 422);
        }

        $user->update(['totp_enabled' => true]);
    }

    public function disableTotp(User $user, string $code): void
    {
        $valid = $this->google2fa->verifyKey($user->totp_secret, $code);

        if (! $valid) {
            throw new \RuntimeException('Código inválido.', 422);
        }

        $user->update(['totp_enabled' => false, 'totp_secret' => null]);
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
