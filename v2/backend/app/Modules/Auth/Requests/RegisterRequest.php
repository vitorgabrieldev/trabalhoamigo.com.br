<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:60'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'cpf' => ['nullable', 'string', 'size:14', 'unique:users,cpf'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:provider,contractor'],

            // Address (optional on register, can be added later)
            'address' => ['nullable', 'array'],
            'address.zip_code' => ['required_with:address', 'string', 'max:10'],
            'address.street' => ['required_with:address', 'string', 'max:150'],
            'address.neighborhood' => ['required_with:address', 'string', 'max:100'],
            'address.number' => ['required_with:address', 'string', 'max:15'],
            'address.complement' => ['nullable', 'string', 'max:150'],
            'address.city' => ['required_with:address', 'string', 'max:100'],
            'address.state' => ['required_with:address', 'string', 'size:2'],
        ];
    }
}
