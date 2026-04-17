<?php

use App\Modules\Payments\Services\FeeCalculator;

beforeEach(function () {
    $this->calculator = new FeeCalculator();
});

it('applies 30% fee for amounts below R$100', function () {
    $result = $this->calculator->calculate(50.00);

    expect($result['fee_rate'])->toBe(0.30)
        ->and($result['fee_amount'])->toBe(15.00)
        ->and($result['provider_amount'])->toBe(35.00)
        ->and($result['is_community'])->toBeFalse();
});

it('applies 15% fee for amounts between R$100 and R$1000', function () {
    $result = $this->calculator->calculate(100.00);

    expect($result['fee_rate'])->toBe(0.15)
        ->and($result['fee_amount'])->toBe(15.00)
        ->and($result['provider_amount'])->toBe(85.00);
});

it('applies 15% fee for R$500', function () {
    $result = $this->calculator->calculate(500.00);

    expect($result['fee_rate'])->toBe(0.15)
        ->and($result['fee_amount'])->toBe(75.00)
        ->and($result['provider_amount'])->toBe(425.00);
});

it('applies 10% fee for amounts above R$1000', function () {
    $result = $this->calculator->calculate(1000.00);

    expect($result['fee_rate'])->toBe(0.10)
        ->and($result['fee_amount'])->toBe(100.00)
        ->and($result['provider_amount'])->toBe(900.00);
});

it('applies 10% fee for R$5000', function () {
    $result = $this->calculator->calculate(5000.00);

    expect($result['fee_rate'])->toBe(0.10)
        ->and($result['fee_amount'])->toBe(500.00)
        ->and($result['provider_amount'])->toBe(4500.00);
});

it('applies zero fee for community services', function () {
    $result = $this->calculator->calculate(200.00, true);

    expect($result['fee_rate'])->toBe(0.0)
        ->and($result['fee_amount'])->toBe(0.0)
        ->and($result['provider_amount'])->toBe(200.00)
        ->and($result['is_community'])->toBeTrue();
});

it('converts BRL to cents correctly', function () {
    expect($this->calculator->toCents(10.00))->toBe(1000)
        ->and($this->calculator->toCents(99.99))->toBe(9999)
        ->and($this->calculator->toCents(0.01))->toBe(1);
});

it('fee_amount + provider_amount always equals offered_price', function () {
    foreach ([49.99, 100.00, 250.00, 1000.00, 1500.00] as $amount) {
        $result = $this->calculator->calculate($amount);
        expect($result['fee_amount'] + $result['provider_amount'])->toBe($amount);
    }
});
