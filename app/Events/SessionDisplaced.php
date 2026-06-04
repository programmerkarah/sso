<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Dipicu ketika sesi aktif pengguna digusur oleh login baru dari perangkat lain.
 * Dikirim ke private channel user sehingga hanya sesi yang bersangkutan yang menerimanya.
 */
class SessionDisplaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly int $userId) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('session.'.$this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.displaced';
    }
}
