<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    private array $allowedOrigins;

    public function __construct()
    {
        $frontend = config('app.frontend_url', 'http://localhost:3000');

        $this->allowedOrigins = array_filter(array_unique([
            $frontend,
            'http://localhost:3000',
            'http://localhost:3001',
        ]));
    }

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin', '');

        if ($request->isMethod('OPTIONS')) {
            return $this->preflight($origin);
        }

        $response = $next($request);

        return $this->addCorsHeaders($response, $origin);
    }

    private function preflight(string $origin): Response
    {
        return response('', 204)
            ->header('Access-Control-Allow-Origin', $this->resolveOrigin($origin))
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Name, Accept')
            ->header('Access-Control-Allow-Credentials', 'true')
            ->header('Access-Control-Max-Age', '86400');
    }

    private function addCorsHeaders(Response $response, string $origin): Response
    {
        $response->headers->set('Access-Control-Allow-Origin', $this->resolveOrigin($origin));
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Name, Accept');

        return $response;
    }

    private function resolveOrigin(string $origin): string
    {
        return in_array($origin, $this->allowedOrigins, true) ? $origin : $this->allowedOrigins[0] ?? '*';
    }
}
