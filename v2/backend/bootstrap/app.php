<?php

use App\Http\Middleware\HandleCors;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (RuntimeException $e) {
            $code = (int) $e->getCode();
            if ($code >= 400 && $code < 500) {
                return false;
            }

            return null;
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => 'Dados inválidos.',
                    'errors' => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json(['message' => 'Não autenticado.'], 401);
            }

            if ($e instanceof AuthorizationException) {
                return response()->json(['message' => 'Não autorizado.'], 403);
            }

            if ($e instanceof NotFoundHttpException) {
                return response()->json(['message' => 'Recurso não encontrado.'], 404);
            }

            if ($e instanceof RuntimeException && $e->getCode() >= 400 && $e->getCode() < 600) {
                return response()->json(['message' => $e->getMessage()], (int) $e->getCode());
            }

            return null;
        });
    })->create();
