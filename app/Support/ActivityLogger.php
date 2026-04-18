<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public static function log(
        string $event,
        string $category,
        ?string $description = null,
        ?User $user = null,
        array $metadata = []
    ): void {
        $request = request();

        ActivityLog::query()->create([
            'user_id' => $user?->id,
            'event' => $event,
            'category' => $category,
            'description' => $description,
            'ip_address' => self::resolveIpAddress($request),
            'device_id' => self::resolveDeviceId($request),
            'user_agent' => self::resolveUserAgent($request),
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public static function logByRequest(
        Request $request,
        string $event,
        string $category,
        ?string $description = null,
        ?User $user = null,
        array $metadata = []
    ): void {
        ActivityLog::query()->create([
            'user_id' => $user?->id,
            'event' => $event,
            'category' => $category,
            'description' => $description,
            'ip_address' => self::resolveIpAddress($request),
            'device_id' => self::resolveDeviceId($request),
            'user_agent' => self::resolveUserAgent($request),
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);
    }

    private static function resolveIpAddress(?Request $request): ?string
    {
        return $request?->ip();
    }

    private static function resolveDeviceId(?Request $request): ?string
    {
        if (! $request) {
            return null;
        }

        $headerDevice = $request->header('X-Device-Id') ?: $request->header('X-Requested-Device');

        if (is_string($headerDevice) && $headerDevice !== '') {
            return $headerDevice;
        }

        $cookieDevice = $request->cookie('trusted_device');

        return is_string($cookieDevice) && $cookieDevice !== '' ? $cookieDevice : null;
    }

    private static function resolveUserAgent(?Request $request): ?string
    {
        return $request?->userAgent();
    }
}
