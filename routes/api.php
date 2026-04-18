<?php

use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Admin only: List all users for syncing
Route::middleware('auth:api')->get('/users', function (Request $request) {
    return User::select(['id', 'name', 'username', 'email', 'email_verified_at'])
        ->orderBy('id')
        ->get();
});

// Public: Check application active status by OAuth client_id
Route::get('/application/status', function (Request $request) {
    $clientId = $request->query('client_id');

    if (! $clientId) {
        return response()->json(['message' => 'client_id is required.'], 422);
    }

    $application = Application::where('oauth_client_id', $clientId)->first();

    if (! $application) {
        return response()->json(['is_active' => false, 'message' => 'Application not found.'], 404);
    }

    return response()->json([
        'is_active' => (bool) $application->is_active,
        'name' => $application->name,
    ]);
});
