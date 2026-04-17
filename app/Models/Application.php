<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Laravel\Passport\Client;

class Application extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'domain',
        'callback_url',
        'logo_url',
        'is_active',
        'oauth_client_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($application) {
            if (! $application->slug) {
                $application->slug = Str::slug($application->name);
            }
        });
    }

    public function oauthClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'oauth_client_id');
    }
}
