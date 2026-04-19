<?php

namespace App\Modules\Users\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePayoutDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_holder_name' => ['required', 'string', 'min:3', 'max:120', 'regex:/^[\pL\s\'-]+$/u'],
            'bank_holder_document' => ['required', 'string', 'regex:/^\d{11}$|^\d{14}$/'],
            'bank_name' => ['required', 'string', 'min:2', 'max:120', 'regex:/^[\pL0-9\s\.\'&-]+$/u'],
            'bank_code' => ['required', 'string', 'regex:/^\d{3}$/'],
            'bank_agency' => ['required', 'string', 'regex:/^\d{1,10}$/'],
            'bank_agency_digit' => ['nullable', 'string', 'regex:/^[0-9Xx]{1,4}$/'],
            'bank_account_number' => ['required', 'string', 'regex:/^\d{1,20}$/'],
            'bank_account_digit' => ['nullable', 'string', 'regex:/^[0-9Xx]{1,4}$/'],
            'bank_account_type' => ['required', 'in:checking,savings'],
            'bank_pix_key' => ['nullable', 'string', 'max:120'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'bank_holder_document' => preg_replace('/\D+/', '', (string) $this->input('bank_holder_document')),
            'bank_code' => preg_replace('/\D+/', '', (string) $this->input('bank_code')),
            'bank_agency' => preg_replace('/\D+/', '', (string) $this->input('bank_agency')),
            'bank_account_number' => preg_replace('/\D+/', '', (string) $this->input('bank_account_number')),
            'bank_holder_name' => trim((string) $this->input('bank_holder_name')),
            'bank_name' => trim((string) $this->input('bank_name')),
            'bank_pix_key' => $this->filled('bank_pix_key')
                ? trim((string) $this->input('bank_pix_key'))
                : null,
            'bank_agency_digit' => $this->filled('bank_agency_digit')
                ? strtoupper((string) $this->input('bank_agency_digit'))
                : null,
            'bank_account_digit' => $this->filled('bank_account_digit')
                ? strtoupper((string) $this->input('bank_account_digit'))
                : null,
        ]);
    }

    public function messages(): array
    {
        return [
            'bank_holder_document.regex' => 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.',
            'bank_holder_name.regex' => 'Nome do titular inválido. Use apenas letras e espaços.',
            'bank_name.regex' => 'Nome do banco inválido.',
            'bank_code.regex' => 'Código do banco inválido. Use 3 dígitos.',
            'bank_agency.regex' => 'Agência inválida.',
            'bank_account_number.regex' => 'Número da conta inválido.',
            'bank_agency_digit.regex' => 'Dígito da agência inválido.',
            'bank_account_digit.regex' => 'Dígito da conta inválido.',
            'bank_account_type.in' => 'Tipo de conta inválido.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $pix = (string) $this->input('bank_pix_key', '');
            if ($pix === '') {
                return;
            }

            $digits = preg_replace('/\D+/', '', $pix);
            $isCpfOrCnpj = in_array(strlen($digits), [11, 14], true);
            $isPhone = strlen($digits) >= 10 && strlen($digits) <= 13;
            $isEmail = filter_var($pix, FILTER_VALIDATE_EMAIL) !== false;
            $isUuid = preg_match(
                '/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/',
                $pix
            ) === 1;

            if (! $isCpfOrCnpj && ! $isPhone && ! $isEmail && ! $isUuid) {
                $validator->errors()->add(
                    'bank_pix_key',
                    'Chave PIX inválida. Use CPF, CNPJ, telefone, e-mail ou chave aleatória.'
                );
            }
        });
    }
}
