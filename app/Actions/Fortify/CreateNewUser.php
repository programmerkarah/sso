<?php

namespace App\Actions\Fortify;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Notifications\NewUserPendingVerificationNotification;
use App\Support\ActivityLogger;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     *
     * @throws ValidationException
     */
    public function create(array $input): User
    {
        $activeOrganizations = Organization::where('is_active', true)->get();
        $hasMultipleOrganizations = $activeOrganizations->count() > 1;

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_.]+$/',
                Rule::unique(User::class),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ];

        if ($hasMultipleOrganizations) {
            $rules['organization_id'] = [
                'required',
                Rule::exists('organizations', 'id')->where('is_active', true),
            ];
        }

        Validator::make($input, $rules)->validate();

        // If only one active organization, auto-assign it
        $organizationId = $hasMultipleOrganizations
            ? $input['organization_id']
            : $activeOrganizations->first()?->id;

        $user = User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'organization_id' => $organizationId,
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ]);

        // Assign default "user" role to new registrations
        $userRole = Role::where('name', 'user')->first();
        if ($userRole) {
            $user->roles()->attach($userRole->id);
        }

        ActivityLogger::log(
            event: 'auth.register',
            category: 'authentication',
            description: "Berhasil melakukan pendaftaran akun untuk pengguna {$user->name}.",
            user: $user,
            metadata: [
                'username' => $user->username,
                'email' => $user->email,
                'organization_id' => $organizationId,
            ],
        );

        User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'admin'))
            ->whereNotNull('admin_verified_at')
            ->get()
            ->each(fn (User $adminUser) => $adminUser->notify(new NewUserPendingVerificationNotification($user)));

        return $user;
    }
}
