<?php
    // Remove qualquer saída antes da execução do código PHP
    ob_start(); // Inicia o buffer de saída

    /**
     * Função para carregar variáveis de ambiente a partir de um arquivo .env
     *
     * @param string $file Caminho para o arquivo .env
     */
    function loadEnv($file)
    {
        if (file_exists($file)) {
            $lines = file($file);
            foreach ($lines as $line) {
                // Remove espaços em branco e caracteres de nova linha
                $line = trim($line);
                // Ignora linhas vazias e comentários
                if (empty($line) || $line[0] === '#') {
                    continue;
                }
                // Divide a linha em chave e valor
                list($key, $value) = explode('=', $line, 2) + [NULL, NULL];
                if ($key) {
                    putenv(trim($key) . '=' . trim($value));
                }
            }
        }
    }

    // Carregue as variáveis de ambiente do arquivo .env
    loadEnv(__DIR__ . '/.env');

    // Conecte-se ao banco de dados usando mysqli
    $mysqli = new mysqli(getenv('DB_HOST'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'), getenv('DB_DATABASE'), getenv('DB_PORT'));

    // Verifique a conexão
    if ($mysqli->connect_error) {
        die('Erro na conexão com o banco de dados: ' . $mysqli->connect_error);
    }

    // Defina o modo de desenvolvimento baseado na variável de ambiente
    $EnvDeveloper = getenv('DEV_MODE') === 'true';

    // Se estiver no modo de desenvolvimento, redireciona para a página de entrada
    if ($EnvDeveloper) {
        header('location: ' . getenv('REDIRECT_URL'));
        exit(); // Usa exit() para garantir que o script pare após o redirecionamento
    }

    // Configura o fuso horário
    date_default_timezone_set(getenv('TIMEZONE'));

    // Inicie a sessão se ainda não estiver iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Verifique se o usuário está logado e exiba o tipo de usuário
    if (isset($_SESSION['IsLogged'])) {
        if ($_SESSION['TypeUser'] == 'contrante') {
            header('location: ' . getenv('REDIRECT_URL_logged_contratante'));
            exit();
        } else {
            header('location: ' . getenv('REDIRECT_URL_logged_anunciante'));
            exit();
        }
    } else {
        header('location: ' . getenv('REDIRECT_URL'));
        exit(); // Usa exit() para garantir que o script pare após o redirecionamento
    }

    ob_end_flush(); // Envia o conteúdo do buffer para o navegador
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <!--
    ---------------------------------------------------------------------------
    * Define o título da página.
    * Utilizado para mostrar "Redirecionando..." na aba do navegador.
    ---------------------------------------------------------------------------
    -->
    <title>Redirecionando...</title>

    <!--
    ---------------------------------------------------------------------------
    * Define a codificação de caracteres como UTF-8.
    * Garante que todos os caracteres especiais sejam exibidos corretamente.
    ---------------------------------------------------------------------------
    -->
    <meta charset="UTF-8">

    <!--
    ---------------------------------------------------------------------------
    * Configura o navegador para usar o modo de compatibilidade mais recente.
    * Ajuda a garantir que a página seja exibida corretamente em diferentes versões do Internet Explorer.
    ---------------------------------------------------------------------------
    -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!--
    ---------------------------------------------------------------------------
    * Define o viewport para dispositivos móveis.
    * Permite que a página se ajuste ao tamanho da tela do dispositivo.
    ---------------------------------------------------------------------------
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!--
    ---------------------------------------------------------------------------
    * Link para o arquivo de estilos CSS externo.
    * Permite a personalização do design da página.
    ---------------------------------------------------------------------------
    -->
    <link rel="stylesheet" href="./app.css">

    <style>
        /*
        ---------------------------------------------------------------------------
        * Estiliza o corpo e o HTML para centralizar o conteúdo da página.
        * Define a altura da página para 100vh e o fundo com uma cor clara.
        ---------------------------------------------------------------------------
        */
        body,
        html {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f0f0f0;
        }

        /*
        ---------------------------------------------------------------------------
        * Define o estilo do loader (indicador de carregamento).
        * Utiliza gradientes radiais e lineares para criar um efeito visual.
        ---------------------------------------------------------------------------
        */
        .loader {
            width: 108px;
            height: 60px;
            color: #269af2;

            /* ==================================================================== */
            --style-current: radial-gradient(farthest-side,currentColor 96%,#0000);
            /* ==================================================================== */

            background:  
            var(--style-current) 100% 100% /30% 60%,
            var(--style-current) 70%  0    /50% 100%,
            var(--style-current) 0    100% /36% 68%,
            var(--style-current) 27%  18%  /26% 40%,
            linear-gradient(currentColor 0 0) bottom/67% 58%;
            background-repeat: no-repeat;
            position: relative;
        }

        /*
        ---------------------------------------------------------------------------
        * Adiciona uma animação ao loader.
        * Faz com que o loader se expanda e se torne transparente ao longo do tempo.
        ---------------------------------------------------------------------------
        */
        .loader:after {
            content: "";
            position: absolute;
            inset: 0;
            background: inherit;
            opacity: 0.4;
            animation: AFTER_ANIMATION 1s infinite;
        }
        @keyframes AFTER_ANIMATION {
            to {transform:scale(1.8);opacity:0}
        }

        /*
        ---------------------------------------------------------------------------
        * Estiliza o contêiner da seção principal.
        * Centraliza os itens e os organiza verticalmente.
        ---------------------------------------------------------------------------
        */
        section {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /*
        ---------------------------------------------------------------------------
        * Estiliza a descrição principal.
        * Define a cor e o peso da fonte.
        ---------------------------------------------------------------------------
        */
        .descricao {
            font-weight: 500;
            color: #3b3939;
            margin: 40px 0 0 0;
        }

        /*
        ---------------------------------------------------------------------------
        * Estiliza a subdescrição.
        * Ajusta o tamanho e a cor da fonte.
        ---------------------------------------------------------------------------
        */
        .subDescricao {
            font-weight: 600;
            font-size: 16px;
            color: #686868;
        }
    </style>
</head>
<body>
    <section>
        <!--
        ---------------------------------------------------------------------------
        * Exibe o loader de carregamento.
        * Um indicador visual para o usuário aguardar.
        ---------------------------------------------------------------------------
        -->
        <div class="loader"></div>
        
        <!--
        ---------------------------------------------------------------------------
        * Exibe a mensagem de status para o usuário.
        * Indica que o servidor está sendo acessado e solicita que o usuário aguarde.
        ---------------------------------------------------------------------------
        -->
        <h3 class="descricao">ACESSANDO O SERVIDOR</h3>
        <p class="subDescricao">AGUARDE...</p>
    </section>    
</body>
</html>
