<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SecurePassword implements ValidationRule
{
    public function __construct(
        private readonly ?string $name = null,
        private readonly ?string $username = null,
        private readonly ?string $email = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = (string) $value;

        if (strlen($password) < 8) {
            $fail('Password minimal harus 8 karakter.');

            return;
        }

        if (! preg_match('/[A-Z]/', $password)) {
            $fail('Password wajib mengandung minimal 1 huruf besar (A-Z).');

            return;
        }

        if (! preg_match('/\d/', $password)) {
            $fail('Password wajib mengandung minimal 1 angka (0-9).');

            return;
        }

        if (! preg_match('/[!@#$%^&*]/', $password)) {
            $fail('Password wajib mengandung minimal 1 simbol dari !@#$%^&*.');

            return;
        }

        foreach ($this->disallowedTerms() as $term) {
            if ($this->containsTerm($password, $term)) {
                $fail('Password tidak boleh mengandung nama, username, atau bagian depan email Anda.');

                return;
            }
        }
    }

    /**
     * @return array<int, string>
     */
    private function disallowedTerms(): array
    {
        $emailLocalPart = '';

        if (is_string($this->email) && str_contains($this->email, '@')) {
            $emailLocalPart = explode('@', strtolower($this->email))[0] ?? '';
        }

        return collect([
            $this->name,
            $this->username,
            $emailLocalPart,
        ])
            ->filter(fn (mixed $term) => is_string($term) && trim($term) !== '')
            ->map(fn (string $term) => trim($term))
            ->unique()
            ->values()
            ->all();
    }

    private function containsTerm(string $password, string $term): bool
    {
        if (stripos($password, $term) !== false) {
            return true;
        }

        $normalizedPassword = $this->normalize($password);
        $normalizedTerm = $this->normalize($term);

        return $normalizedTerm !== '' && str_contains($normalizedPassword, $normalizedTerm);
    }

    private function normalize(string $value): string
    {
        return preg_replace('/[^a-z0-9]/i', '', strtolower($value)) ?? '';
    }
}
