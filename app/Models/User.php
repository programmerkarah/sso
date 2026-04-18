<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use App\Services\EncryptedStateService;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'password_change_required',
        'previous_password',
        'organization_id',
        'admin_verified_at',
        'admin_verified_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'previous_password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'admin_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'password_change_required' => 'boolean',
        ];
    }

    /**
     * Check whether user access has been verified by an SSO admin.
     */
    public function isAdminVerified(): bool
    {
        return ! is_null($this->admin_verified_at);
    }

    /**
     * Check if the user must change their password before proceeding.
     */
    public function mustChangePassword(): bool
    {
        return (bool) $this->password_change_required;
    }

    /**
     * Get the trusted devices for the user.
     */
    public function trustedDevices(): HasMany
    {
        return $this->hasMany(TrustedDevice::class);
    }

    /**
     * Get the organization that the user belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the admin user that verified this account.
     */
    public function verifiedByAdmin(): BelongsTo
    {
        return $this->belongsTo(self::class, 'admin_verified_by');
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function getRouteKey(): mixed
    {
        return app(EncryptedStateService::class)->encryptString((string) $this->getKey());
    }

    public function resolveRouteBinding($value, $field = null): ?self
    {
        $decrypted = app(EncryptedStateService::class)->decryptString((string) $value);

        if (! is_string($decrypted) || $decrypted === '') {
            throw (new ModelNotFoundException)->setModel(self::class, [$value]);
        }

        return $this->newQuery()->where($this->getRouteKeyName(), $decrypted)->firstOrFail();
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification((string) $token));
    }
}
