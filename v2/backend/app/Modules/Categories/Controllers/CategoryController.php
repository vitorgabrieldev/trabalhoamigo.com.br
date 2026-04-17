<?php

namespace App\Modules\Categories\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get(['uuid', 'name', 'slug', 'description', 'icon_url']);

        return response()->json($categories);
    }
}
