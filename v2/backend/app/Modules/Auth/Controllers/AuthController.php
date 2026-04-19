<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Requests\RenameSessionRequest;
use App\Modules\Auth\Requests\TotpConfirmRequest;
use App\Modules\Auth\Resources\SessionResource;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register([
            ...$request->validated(),
            'device_name' => $request->header('X-Device-Name', 'Unknown'),
        ]);

        return response()->json($result, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->validated(),
                $request->header('X-Device-Name', 'Unknown'),
                $request
            );

            return response()->json($result);
        } catch (\RuntimeException $e) {
            if ($e->getCode() === 422 && str_contains($e->getMessage(), '2FA')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'requires_totp' => true,
                ], 422);
            }

            return response()->json(['message' => $e->getMessage()], (int) $e->getCode() ?: 400);
        }
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        $request->validate(['role' => 'required|in:provider,contractor']);

        $this->authService->completeOnboarding($request->user(), $request->role);

        return response()->json(['message' => 'Perfil configurado com sucesso.']);
    }

    public function googleRedirect(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback(Request $request): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
            $result = $this->authService->loginWithGoogle($socialUser, $request);

            if (isset($result['totp_required'])) {
                $query = http_build_query([
                    'totp_required' => '1',
                    'temp_token' => $result['temp_token'],
                ]);

                return redirect("{$frontendUrl}/auth/google/callback?{$query}");
            }

            $query = http_build_query([
                'access_token' => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
            ]);

            return redirect("{$frontendUrl}/auth/google/callback?{$query}");
        } catch (\Throwable $e) {
            return redirect("{$frontendUrl}/login?error=".urlencode($e->getMessage()));
        }
    }

    public function verifyGoogleTotp(Request $request): JsonResponse
    {
        $request->validate([
            'temp_token' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        try {
            $result = $this->authService->verifyGoogleTotp(
                $request->temp_token,
                $request->code,
                $request
            );

            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], (int) $e->getCode() ?: 400);
        }
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        $result = $this->authService->refresh($request->refresh_token, $request);

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $payload = JWTAuth::parseToken()->getPayload();
        $this->authService->logout($payload->get('jti'));

        return response()->json(['message' => 'Sessão encerrada.']);
    }

    public function sessions(Request $request): JsonResponse
    {
        $sessions = $request->user()
            ->sessions()
            ->where('is_revoked', false)
            ->where('refresh_expires_at', '>', now())
            ->latest('last_active_at')
            ->get();

        return response()->json(SessionResource::collection($sessions));
    }

    public function revokeSession(Request $request, string $sessionUuid): JsonResponse
    {
        $this->authService->revokeSession($request->user(), $sessionUuid);

        return response()->json(['message' => 'Dispositivo desconectado.']);
    }

    public function renameSession(RenameSessionRequest $request, string $sessionUuid): JsonResponse
    {
        $this->authService->renameSession(
            $request->user(),
            $sessionUuid,
            $request->validated('device_name')
        );

        return response()->json(['message' => 'Dispositivo renomeado com sucesso.']);
    }

    public function revokeAllSessions(Request $request): JsonResponse
    {
        $jti = JWTAuth::parseToken()->getPayload()->get('jti');
        $this->authService->revokeAllSessions($request->user(), $jti);

        return response()->json(['message' => 'Todos os outros dispositivos foram desconectados.']);
    }

    public function setupTotp(Request $request): JsonResponse
    {
        $data = $this->authService->enableTotp($request->user());

        return response()->json($data);
    }

    public function confirmTotp(TotpConfirmRequest $request): JsonResponse
    {
        $this->authService->confirmTotp($request->user(), $request->code);

        return response()->json(['message' => '2FA ativado com sucesso.']);
    }

    public function disableTotp(TotpConfirmRequest $request): JsonResponse
    {
        $this->authService->disableTotp($request->user(), $request->code);

        return response()->json(['message' => '2FA desativado.']);
    }
}
