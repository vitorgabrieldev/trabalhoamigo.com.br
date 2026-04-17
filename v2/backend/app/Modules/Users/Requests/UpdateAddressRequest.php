<?php

namespace App\Modules\Users\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zip_code' => ['required', 'string', 'max:10'],
            'street' => ['required', 'string', 'max:150'],
            'neighborhood' => ['required', 'string', 'max:100'],
            'number' => ['required', 'string', 'max:15'],
            'complement' => ['nullable', 'string', 'max:150'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
        ];
    }
}
