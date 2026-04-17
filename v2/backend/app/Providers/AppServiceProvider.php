<?php

namespace App\Providers;

use App\Modules\Auth\Services\AuthService;
use App\Modules\Contracts\Services\ContractService;
use App\Modules\Payments\Services\FeeCalculator;
use App\Modules\Payments\Services\StripeService;
use App\Modules\Proposals\Services\ProposalService;
use App\Modules\Schedule\Services\ScheduleService;
use App\Modules\Services\Services\ServiceManager;
use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;
use PragmaRX\Google2FA\Google2FA;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Google2FA::class, fn () => new Google2FA());
        $this->app->singleton(FeeCalculator::class);
        $this->app->singleton(StripeService::class);
        $this->app->singleton(ScheduleService::class);
        $this->app->singleton(ServiceManager::class);

        $this->app->singleton(ContractService::class, fn ($app) => new ContractService(
            $app->make(StripeService::class),
            $app->make(ScheduleService::class),
        ));

        $this->app->singleton(ProposalService::class, fn ($app) => new ProposalService(
            $app->make(FeeCalculator::class),
            $app->make(StripeService::class),
            $app->make(ScheduleService::class),
            $app->make(ContractService::class),
        ));

        $this->app->singleton(AuthService::class, fn ($app) => new AuthService(
            $app->make(Google2FA::class),
        ));
    }

    public function boot(): void
    {
        Carbon::setLocale('pt_BR');
    }
}
