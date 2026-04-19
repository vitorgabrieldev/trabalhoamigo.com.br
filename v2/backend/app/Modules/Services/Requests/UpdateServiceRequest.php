<?php

namespace App\Modules\Services\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isProvider();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'category_uuid' => ['sometimes', 'string', 'exists:categories,uuid'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'accepts_offer' => ['boolean'],
            'is_community' => ['boolean'],
            'image_url' => ['nullable', 'url'],
            'images' => ['sometimes', 'array', 'max:10'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
