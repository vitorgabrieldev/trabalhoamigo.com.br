<?php

namespace App\Modules\Proposals\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isContractor();
    }

    public function rules(): array
    {
        return [
            'offered_price' => ['required', 'numeric', 'min:1'],
            'description' => ['nullable', 'string', 'max:1000'],

            // Schedule
            'schedule_type' => ['required', 'in:specific_slots,any_time_on_day,to_be_arranged'],

            // When schedule_type = any_time_on_day (accepts single date or array)
            'any_time_date' => ['nullable', 'date', 'after:today'],
            'any_time_dates' => ['required_if:schedule_type,any_time_on_day', 'nullable', 'array', 'min:1'],
            'any_time_dates.*' => ['required', 'date', 'after:today'],

            // When schedule_type = specific_slots
            'slots' => ['required_if:schedule_type,specific_slots', 'nullable', 'array', 'min:1'],
            'slots.*.date' => ['required', 'date', 'after:today'],
            'slots.*.time_type' => ['required', 'in:specific_time,all_day'],
            'slots.*.start_time' => ['required_if:slots.*.time_type,specific_time', 'nullable', 'date_format:H:i'],
            'slots.*.end_time' => ['required_if:slots.*.time_type,specific_time', 'nullable', 'date_format:H:i', 'after:slots.*.start_time'],
        ];
    }

    public function messages(): array
    {
        return [
            'slots.*.end_time.after' => 'O horário de término deve ser após o horário de início.',
            'schedule_type.in' => 'Tipo de agendamento inválido.',
        ];
    }
}
