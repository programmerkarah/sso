<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BatchUpdateUserAccessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', Rule::exists('users', 'id')],
            'organization_id' => [
                'nullable',
                Rule::exists('organizations', 'id')->where('is_active', true),
                'required_without:role_ids',
            ],
            'role_ids' => ['nullable', 'array', 'min:1', 'required_without:organization_id'],
            'role_ids.*' => ['integer', Rule::exists('roles', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'user_ids.required' => 'Pilih minimal satu pengguna.',
            'user_ids.min' => 'Pilih minimal satu pengguna.',
            'organization_id.required_without' => 'Pilih organisasi atau role untuk update batch.',
            'role_ids.required_without' => 'Pilih organisasi atau role untuk update batch.',
            'organization_id.exists' => 'Organisasi tidak valid atau tidak aktif.',
            'role_ids.min' => 'Jika role diisi, minimal satu role wajib dipilih.',
        ];
    }
}
