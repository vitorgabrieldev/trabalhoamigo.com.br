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

            if ($e instanceof RuntimeException) {
                $rawCode = $e->getCode();
                $status = null;

                if (is_int($rawCode) || (is_string($rawCode) && ctype_digit($rawCode))) {
                    $numericCode = (int) $rawCode;
                    if ($numericCode >= 400 && $numericCode < 600) {
                        $status = $numericCode;
                    }
                }

                if ($status !== null) {
                    return response()->json(['message' => $e->getMessage()], $status);
                }
            }

            return null;
        });
    })->create();
