<?php

namespace Tests\Unit;

use App\Models\ActivityLog;
use App\Support\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ActivityLoggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_log_by_request_stores_method_path_url_and_payload(): void
    {
        $request = Request::create('/admin/system/restore?source=test', 'POST', [
            'backup_file' => 'sample.sql',
            'note' => 'manual restore',
            'password' => 'super-secret',
        ]);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'test.activity',
            category: 'testing',
            description: 'Pengujian metadata request',
            metadata: ['custom_key' => 'custom_value'],
            status: 'warning',
        );

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'test.activity',
            'category' => 'testing',
            'status' => 'warning',
        ]);

        $log = ActivityLog::query()->where('event', 'test.activity')->firstOrFail();

        $this->assertSame('POST', $log->metadata['request_method']);
        $this->assertSame('/admin/system/restore', $log->metadata['request_path']);
        $this->assertSame('http://localhost/admin/system/restore?source=test', $log->metadata['request_url']);
        $this->assertSame('sample.sql', $log->metadata['request_payload']['backup_file']);
        $this->assertSame('manual restore', $log->metadata['request_payload']['note']);
        $this->assertSame('***', $log->metadata['request_payload']['password']);
        $this->assertSame('custom_value', $log->metadata['custom_key']);
        $this->assertSame('Pengujian metadata request', $log->metadata['msg']);
    }

    public function test_log_by_request_masks_sensitive_device_identifier_token(): void
    {
        $rawDeviceId = '{"user_id":2,"token":"super-sensitive-device-token"}';

        $request = Request::create('/admin/users/any/reset-password', 'POST');
        $request->headers->set('X-Device-Id', $rawDeviceId);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'test.activity.device-id',
            category: 'testing',
            description: 'Pengujian sanitasi device id',
            status: 'error',
        );

        $log = ActivityLog::query()->where('event', 'test.activity.device-id')->firstOrFail();

        $this->assertNotSame($rawDeviceId, $log->device_id);
        $this->assertStringContainsString('user:2|fingerprint:', (string) $log->device_id);
        $this->assertStringNotContainsString('super-sensitive-device-token', (string) $log->device_id);
    }

    public function test_error_status_log_contains_default_errors_detail(): void
    {
        $request = Request::create('/admin/users/example/reset-password', 'POST');

        ActivityLogger::logByRequest(
            request: $request,
            event: 'test.activity.error',
            category: 'testing',
            description: 'Gagal melakukan pengiriman email reset password pengguna B',
            status: 'error',
        );

        $log = ActivityLog::query()->where('event', 'test.activity.error')->firstOrFail();

        $this->assertSame('Gagal melakukan pengiriman email reset password pengguna B', $log->metadata['msg']);
        $this->assertArrayHasKey('errors', $log->metadata);
        $this->assertArrayHasKey('detail', $log->metadata['errors']);
    }
}
