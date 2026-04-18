<?php

namespace App\Models;

use App\Services\EncryptedStateService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        'oauth_client_secret',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'oauth_client_secret' => 'encrypted',
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

    public function getRouteKey(): mixed
    {
        return app(EncryptedStateService::class)->encryptString((string) $this->getKey());
    }

    public function resolveRouteBinding($value, $field = null): ?Model
    {
        $resolvedField = $field ?? $this->getRouteKeyName();
        $decrypted = app(EncryptedStateService::class)->decryptString((string) $value);

        if (! is_string($decrypted) || $decrypted === '') {
            throw (new ModelNotFoundException)->setModel(self::class, [$value]);
        }

        return $this->newQuery()->where($resolvedField, $decrypted)->firstOrFail();
    }
}
