<?php

namespace App\Modules\Contracts\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OpenDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['contractor', 'provider']);
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:20', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.min' => 'Por favor, descreva o motivo da disputa com pelo menos 20 caracteres.',
        ];
    }
}
