<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserAccessRequest extends FormRequest
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
            'organization_id' => [
                'nullable',
                Rule::exists('organizations', 'id')->where('is_active', true),
            ],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => [
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'organization_id.exists' => 'Organisasi tidak valid atau tidak aktif.',
            'role_ids.required' => 'Minimal satu role wajib dipilih.',
            'role_ids.array' => 'Format role tidak valid.',
            'role_ids.min' => 'Minimal satu role wajib dipilih.',
            'role_ids.*.exists' => 'Role yang dipilih tidak valid.',
        ];
    }
}
