<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RestoreDatabaseRequest extends FormRequest
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
            'backup_file' => ['nullable', 'file', 'mimes:sql,txt', 'max:51200', 'required_without:backup_name'],
            'backup_name' => ['nullable', 'string', 'max:255', 'required_without:backup_file'],
        ];
    }

    public function messages(): array
    {
        return [
            'backup_file.required_without' => 'Pilih file upload atau backup tersimpan untuk restore.',
            'backup_file.file' => 'Data backup harus berupa file valid.',
            'backup_file.mimes' => 'Format backup harus berupa file .sql atau .txt.',
            'backup_file.max' => 'Ukuran file backup maksimal 50MB.',
            'backup_name.required_without' => 'Pilih backup tersimpan atau upload file backup.',
        ];
    }
}
