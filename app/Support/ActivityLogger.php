<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityLogger
{
    /**
     * @var array<int, string>
     */
    private const SENSITIVE_FIELDS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'secret',
        'authorization',
        '_token',
    ];

    /**
     * @param  array<string, mixed>  $metadata
     */
    public static function log(
        string $event,
        string $category,
        ?string $description = null,
        ?User $user = null,
        array $metadata = [],
        string $status = 'success'
    ): void {
        $request = request();
        $enrichedMetadata = self::appendRequestContext($metadata, $request);

        ActivityLog::query()->create([
            'user_id' => $user?->id,
            'event' => $event,
            'category' => $category,
            'status' => self::normalizeStatus($status),
            'description' => $description,
            'ip_address' => self::resolveIpAddress($request),
            'device_id' => self::resolveDeviceId($request),
            'user_agent' => self::resolveUserAgent($request),
            'metadata' => $enrichedMetadata,
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
        array $metadata = [],
        string $status = 'success'
    ): void {
        $enrichedMetadata = self::appendRequestContext($metadata, $request);

        ActivityLog::query()->create([
            'user_id' => $user?->id,
            'event' => $event,
            'category' => $category,
            'status' => self::normalizeStatus($status),
            'description' => $description,
            'ip_address' => self::resolveIpAddress($request),
            'device_id' => self::resolveDeviceId($request),
            'user_agent' => self::resolveUserAgent($request),
            'metadata' => $enrichedMetadata,
            'occurred_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    private static function appendRequestContext(array $metadata, ?Request $request): array
    {
        if (! $request) {
            return $metadata;
        }

        $requestContext = [
            'request_method' => $request->method(),
            'request_path' => '/'.ltrim($request->path(), '/'),
            'request_url' => $request->fullUrl(),
            'request_payload' => self::sanitizePayload($request->except(['_token'])),
        ];

        return [
            ...$requestContext,
            ...$metadata,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private static function sanitizePayload(array $payload): array
    {
        $sanitized = [];

        foreach ($payload as $key => $value) {
            $normalizedKey = Str::lower((string) $key);

            if (self::isSensitiveField($normalizedKey)) {
                $sanitized[$key] = '***';

                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = self::sanitizePayload($value);

                continue;
            }

            if (is_string($value) && strlen($value) > 2000) {
                $sanitized[$key] = substr($value, 0, 2000).'...(truncated)';

                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }

    private static function isSensitiveField(string $field): bool
    {
        foreach (self::SENSITIVE_FIELDS as $sensitiveField) {
            if (str_contains($field, $sensitiveField)) {
                return true;
            }
        }

        return false;
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
            return self::sanitizeDeviceId($headerDevice);
        }

        $cookieDevice = $request->cookie('trusted_device');

        return is_string($cookieDevice) && $cookieDevice !== ''
            ? self::sanitizeDeviceId($cookieDevice)
            : null;
    }

    private static function sanitizeDeviceId(string $rawDeviceId): string
    {
        $normalizedDeviceId = trim($rawDeviceId);

        if ($normalizedDeviceId === '') {
            return '';
        }

        $decoded = json_decode($normalizedDeviceId, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $fingerprint = substr(hash('sha256', json_encode(self::sanitizePayload($decoded))), 0, 16);

            if (isset($decoded['user_id'])) {
                return 'user:'.$decoded['user_id'].'|fingerprint:'.$fingerprint;
            }

            return 'fingerprint:'.$fingerprint;
        }

        if (strlen($normalizedDeviceId) > 80) {
            return 'fingerprint:'.substr(hash('sha256', $normalizedDeviceId), 0, 16);
        }

        return $normalizedDeviceId;
    }

    private static function resolveUserAgent(?Request $request): ?string
    {
        return $request?->userAgent();
    }

    private static function normalizeStatus(string $status): string
    {
        return match ($status) {
            'success', 'error', 'warning' => $status,
            default => 'success',
        };
    }
}
