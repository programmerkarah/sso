<?php

namespace App\Actions\Fortify;

use App\Rules\SecurePassword;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, Rule|array<mixed>|string>
     */
    protected function passwordRules(?string $name = null, ?string $username = null, ?string $email = null): array
    {
        return [
            'required',
            'string',
            Password::default(),
            'confirmed',
            new SecurePassword($name, $username, $email),
        ];
    }
}
