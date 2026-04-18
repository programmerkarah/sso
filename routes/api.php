<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Admin only: List all users for syncing
Route::middleware('auth:api')->get('/users', function (Request $request) {
    // Optional: Add admin check here
    // if (! $request->user()->isAdmin()) {
    //     return response()->json(['message' => 'Unauthorized'], 403);
    // }
    
    return User::select(['id', 'name', 'username', 'email', 'email_verified_at'])
        ->orderBy('id')
        ->get();
});

