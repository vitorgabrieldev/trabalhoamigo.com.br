<?php

require '../vendor/autoload.php';

use Symfony\Component\Translation\Loader\ArrayLoader;
use Symfony\Component\Translation\Translator;

$translator = new Translator('en');
$translator->addLoader('array', new ArrayLoader());

$translator->addResource('array', [
    'Olá, mundo!' => 'Hello, world!',
    'Como você está?' => 'How are you?',
    'Obrigado!' => 'Thank you!',
], 'pt');

echo $translator->trans('Olá, mundo!', [], null, 'pt');

?>
