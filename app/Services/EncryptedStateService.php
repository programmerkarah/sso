<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class EncryptedStateService
{
    public function encryptString(string $value): string
    {
        $encrypted = Crypt::encryptString($value);

        return rtrim(strtr(base64_encode($encrypted), '+/', '-_'), '=');
    }

    public function decryptString(?string $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        $decoded = base64_decode(
            strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4),
            true,
        );

        if ($decoded === false) {
            return null;
        }

        return Crypt::decryptString($decoded);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function encryptArray(array $payload): string
    {
        return $this->encryptString(json_encode($payload, JSON_THROW_ON_ERROR));
    }

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public function decryptArray(?string $payload, array $default = []): array
    {
        try {
            $decrypted = $this->decryptString($payload);

            if (! is_string($decrypted) || $decrypted === '') {
                return $default;
            }

            $decoded = json_decode($decrypted, true, 512, JSON_THROW_ON_ERROR);

            return is_array($decoded) ? $decoded : $default;
        } catch (\Throwable) {
            return $default;
        }
    }
}
