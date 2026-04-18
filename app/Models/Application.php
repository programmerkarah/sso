<?php

namespace App\Models;

use App\Services\EncryptedStateService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;
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
        'allowed_organization_types',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'oauth_client_secret' => 'encrypted',
            'allowed_organization_types' => 'array',
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

    public function hasOrganizationRestrictions(): bool
    {
        return is_array($this->allowed_organization_types)
            && $this->allowed_organization_types !== [];
    }

    public function allowsOrganizationType(?string $organizationType): bool
    {
        if (! $this->hasOrganizationRestrictions()) {
            return true;
        }

        if (! is_string($organizationType) || $organizationType === '') {
            return false;
        }

        return in_array($organizationType, $this->allowed_organization_types, true);
    }

    public function scopeEligibleForOrganizationType(Builder $query, ?string $organizationType): Builder
    {
        return $query->where(function (Builder $builder) use ($organizationType) {
            $builder
                ->whereNull('allowed_organization_types')
                ->orWhereJsonLength('allowed_organization_types', 0);

            if (is_string($organizationType) && $organizationType !== '') {
                $builder->orWhereJsonContains('allowed_organization_types', $organizationType);
            }
        });
    }

    public function landingUrl(): string
    {
        if (str_starts_with($this->domain, 'http://') || str_starts_with($this->domain, 'https://')) {
            return $this->domain;
        }

        return 'https://'.$this->domain;
    }

    public function launchUrl(): string
    {
        $parsedCallbackUrl = parse_url($this->callback_url);

        if (! is_array($parsedCallbackUrl) || ! isset($parsedCallbackUrl['scheme'], $parsedCallbackUrl['host'])) {
            return $this->landingUrl();
        }

        $origin = $parsedCallbackUrl['scheme'].'://'.$parsedCallbackUrl['host'];

        if (Arr::has($parsedCallbackUrl, 'port')) {
            $origin .= ':'.$parsedCallbackUrl['port'];
        }

        return $origin.'/auth/sso/redirect';
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
