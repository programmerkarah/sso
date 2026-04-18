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
    }
}
