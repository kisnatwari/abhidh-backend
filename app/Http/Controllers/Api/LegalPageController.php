<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\JsonResponse;

class LegalPageController extends Controller
{
    public function show(string $type): JsonResponse
    {
        if (!in_array($type, ['terms', 'privacy'])) {
            return response()->json(['success' => false, 'message' => 'Invalid page type.'], 404);
        }

        $page = LegalPage::where('type', $type)
            ->where('is_published', true)
            ->latest('published_at')
            ->first();

        if (!$page) {
            return response()->json(['success' => false, 'message' => 'Page not found or not yet published.'], 404);
        }

        return response()->json(['success' => true, 'data' => $page]);
    }
}
