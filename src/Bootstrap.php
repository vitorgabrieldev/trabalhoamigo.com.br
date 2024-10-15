<?php

class UserRedirector
{
    /*
    |--------------------------------------------------------------------------
    | URLs de redirecionamento
    |--------------------------------------------------------------------------
    |
    | Estas variáveis armazenam as URLs de redirecionamento para diferentes
    | tipos de usuários. Elas são definidas como propriedades da classe.
    |
    */
    private $redirectLogin = 'src/views/contratante/EntrarConta/';
    private $redirectContratante = 'src/views/contratante/PaginaInicial';
    private $redirectAnunciante = 'src/views/anunciante/PaginaInicial';

    /*
    |--------------------------------------------------------------------------
    | Método principal da classe
    |--------------------------------------------------------------------------
    |
    | O método `run()` é responsável por executar toda a lógica de
    | redirecionamento. Ele será chamado na inicialização da aplicação.
    |
    */
    public function run()
    {
        // Inicia o buffer de saída
        ob_start();

        // Verifica e inicia a sessão, se necessário
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Verifica se o usuário está logado
        if (isset($_SESSION['logado'])) {
            // Redireciona baseado no tipo de usuário
            if ($_SESSION['tipo_usuario'] == 'contratante') {
                $this->redirectTo($this->redirectContratante);
            } else {
                $this->redirectTo($this->redirectAnunciante);
            }
        } else {
            // Se não estiver logado, redireciona para a página de login
            $this->redirectTo($this->redirectLogin);
        }

        // Finaliza o buffer de saída
        ob_end_flush();
    }

    /*
    |--------------------------------------------------------------------------
    | Método auxiliar de redirecionamento
    |--------------------------------------------------------------------------
    |
    | O método `redirectTo()` é responsável por enviar o cabeçalho de 
    | redirecionamento e finalizar o script.
    |
    */
    private function redirectTo($url)
    {
        header('location: ' . $url);
        exit();
    }
}

/*
|--------------------------------------------------------------------------
| Inicialização da aplicação
|--------------------------------------------------------------------------
|
| Aqui você cria uma instância da classe `UserRedirector` e executa o método
| `run()`, que será responsável por gerenciar a lógica de redirecionamento.
|
*/
function Init()
{
    $redirector = new UserRedirector();
    $redirector->run();
}