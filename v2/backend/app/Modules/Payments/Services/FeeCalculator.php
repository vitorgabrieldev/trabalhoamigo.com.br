<?php

namespace App\Modules\Payments\Services;

class FeeCalculator
{
    // Fee tiers in BRL
    private const TIERS = [
        ['limit' => 100.00, 'rate' => 0.30],
        ['limit' => 1000.00, 'rate' => 0.15],
        ['limit' => PHP_INT_MAX, 'rate' => 0.10],
    ];

    public function calculate(float $amount, bool $isCommunity = false): array
    {
        if ($isCommunity) {
            return [
                'fee_rate' => 0.0,
                'fee_amount' => 0.0,
                'provider_amount' => $amount,
                'is_community' => true,
            ];
        }

        $rate = $this->resolveRate($amount);
        $feeAmount = round($amount * $rate, 2);
        $providerAmount = round($amount - $feeAmount, 2);

        return [
            'fee_rate' => $rate,
            'fee_amount' => $feeAmount,
            'provider_amount' => $providerAmount,
            'is_community' => false,
        ];
    }

    // Convert BRL to cents for Stripe
    public function toCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function resolveRate(float $amount): float
    {
        foreach (self::TIERS as $tier) {
            if ($amount < $tier['limit']) {
                return $tier['rate'];
            }
        }

        return 0.10; // Fallback to lowest rate
    }
}
