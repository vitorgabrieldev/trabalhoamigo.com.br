<?php

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Categories\Controllers\CategoryController;
use App\Modules\Contracts\Controllers\ContractController;
use App\Modules\Messaging\Controllers\MessagingController;
use App\Modules\Payments\Controllers\StripeWebhookController;
use App\Modules\Proposals\Controllers\ProposalController;
use App\Modules\Reviews\Controllers\ReviewController;
use App\Modules\Schedule\Controllers\ScheduleController;
use App\Modules\Services\Controllers\ServiceController;
use App\Modules\Users\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ─── Stripe Webhook (no auth — Stripe signs it) ──────────────────────────────
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// ─── Public ───────────────────────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/services/{serviceUuid}/reviews', [ReviewController::class, 'forService']);
Route::get('/users/{uuid}', [UserController::class, 'show']);
Route::get('/schedule/{providerUuid}/month', [ScheduleController::class, 'month']);
Route::get('/schedule/{providerUuid}/week', [ScheduleController::class, 'week']);

// ─── Authenticated ────────────────────────────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    // Auth management
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/sessions', [AuthController::class, 'sessions']);
        Route::delete('/sessions/{sessionUuid}', [AuthController::class, 'revokeSession']);
        Route::delete('/sessions', [AuthController::class, 'revokeAllSessions']);
        Route::post('/totp/setup', [AuthController::class, 'setupTotp']);
        Route::post('/totp/confirm', [AuthController::class, 'confirmTotp']);
        Route::post('/totp/disable', [AuthController::class, 'disableTotp']);
    });

    // User profile
    Route::prefix('me')->group(function () {
        Route::get('/', [UserController::class, 'profile']);
        Route::patch('/', [UserController::class, 'updateProfile']);
        Route::put('/address', [UserController::class, 'updateAddress']);
        Route::post('/stripe/onboarding', [UserController::class, 'stripeOnboarding']);
        Route::get('/stripe/status', [UserController::class, 'stripeStatus']);
        Route::get('/calendar', [ScheduleController::class, 'myCalendar']);
    });

    // Services (provider actions)
    Route::prefix('services')->group(function () {
        Route::get('/my', [ServiceController::class, 'myServices']);
        Route::get('/community/availability', [ServiceController::class, 'communityAvailability']);
        Route::post('/', [ServiceController::class, 'store']);
        Route::patch('/{service}', [ServiceController::class, 'update']);
        Route::delete('/{service}', [ServiceController::class, 'destroy']);
    });

    // Proposals
    Route::prefix('proposals')->group(function () {
        Route::get('/sent', [ProposalController::class, 'myProposals']);
        Route::get('/received', [ProposalController::class, 'receivedProposals']);
        Route::get('/{proposal}', [ProposalController::class, 'show']);
        Route::post('/services/{service}', [ProposalController::class, 'store']);
        Route::post('/{proposal}/accept', [ProposalController::class, 'accept']);
        Route::post('/{proposal}/reject', [ProposalController::class, 'reject']);
        Route::post('/{proposal}/cancel', [ProposalController::class, 'cancel']);
        Route::post('/{proposal}/confirm-schedule', [ProposalController::class, 'confirmSchedule']);
    });

    // Contracts
    Route::prefix('contracts')->group(function () {
        Route::get('/', [ContractController::class, 'index']);
        Route::get('/{contract}', [ContractController::class, 'show']);
        Route::post('/{contract}/provider-complete', [ContractController::class, 'markProviderCompleted']);
        Route::post('/{contract}/contractor-confirm', [ContractController::class, 'markContractorConfirmed']);
        Route::post('/{contract}/dispute', [ContractController::class, 'openDispute']);
    });

    // Reviews
    Route::post('/contracts/{contract}/reviews', [ReviewController::class, 'store']);

    // Messaging
    Route::prefix('conversations')->group(function () {
        Route::get('/', [MessagingController::class, 'conversations']);
        Route::get('/{conversation}/messages', [MessagingController::class, 'messages']);
        Route::post('/{conversation}/messages', [MessagingController::class, 'send']);
    });
});
