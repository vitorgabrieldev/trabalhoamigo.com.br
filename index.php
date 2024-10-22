<?php
/*
|--------------------------------------------------------------------------
| Corrige URL de redirecionamento
|--------------------------------------------------------------------------
|
| Isso remove a referência "index.php" da URL para evitar que apareça na 
| navegação e garanta que as URLs não fiquem com "/index.php".
|
*/
$_SERVER["REQUEST_URI"] = str_replace('index.php', '', $_SERVER["REQUEST_URI"]);

/*
|--------------------------------------------------------------------------
| Configuração de Localização e Fuso Horário
|--------------------------------------------------------------------------
|
| Define as configurações regionais para datas e formatação de caracteres,
| além de configurar o fuso horário correto.
|
*/
setlocale(LC_TIME, 'ptb', 'pt_BR', 'portuguese-brazil', 'bra', 'brazil', 'pt_BR.utf-8', 'pt_BR.iso-8859-1', 'br');
setlocale(LC_CTYPE, 'pt_BR');
date_default_timezone_set('America/Sao_Paulo');

/*
|--------------------------------------------------------------------------
| Configurações de Cabeçalhos e Sessões
|--------------------------------------------------------------------------
|
| Define o tipo de conteúdo como UTF-8 e ajusta a duração das sessões
| para 10 horas (36000 segundos), garantindo maior longevidade da sessão.
|
*/
header("Content-Type: text/html; charset=utf-8");
ini_set('session.gc_maxlifetime', 36000);
session_set_cookie_params(36000);

/*
|--------------------------------------------------------------------------
| Configuração de Exibição de Erros
|--------------------------------------------------------------------------
|
| Configura os tipos de erros a serem exibidos, removendo avisos e notificações
| que podem atrapalhar a exibição no ambiente de produção.
|
*/
// error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE & ~E_STRICT);

/*
|--------------------------------------------------------------------------
| Carregamento da Aplicação
|--------------------------------------------------------------------------
|
| Ponto de carregamento das bibliotecas principais e helpers (funções auxiliares),
| que são necessárias para o funcionamento da aplicação.
|
*/
require_once 'src/Bootstrap.php';

/*
|--------------------------------------------------------------------------
| Inicialização da Aplicação
|--------------------------------------------------------------------------
|
| Cria uma nova instância da aplicação e chama os métodos de bootstrap
| e execução. O arquivo de configuração (application.ini) é lido e as
| configurações são aplicadas.
|
*/
Init();
