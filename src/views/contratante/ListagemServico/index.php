<!DOCTYPE html>
<html lang="pt-br">
<head>

    <!-- Tituloda Página - SEO -->
    <title>Listagem Serviços | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Crie sua Conta">

    <!-- Metas tags de configurações das páginas -->
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    
    <!-- Importação do Icone do Projeto -->
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">

    <!-- Tags Globais do projeto -->
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">

    <!-- Tags Especificas de cada página-->
    <link rel="stylesheet" href="../../../../public/css/anunciante/ListagemPropostas.css">

    <script src="../../../../public/js/contratante/Listagem.js" defer></script>

    <!-- Importação da bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


    <body>

        <script>
            $.ajax({
                url: `../../../controllers/contratante/Security.php`,
                method: 'GET',
                success: function (data) {
                    if (data == 'true') {
                    } else if (data == 'false') {
                        window.location.href = "../CriarConta/";
                    }
                },
                error: function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro na Autenticação.'
                    });
                }
            });
        </script>

        <?php include '../layouts/Header.php'; ?>
        
        <!-- ================================================================================== -->
        <main id="content">
            <section id="bloco-servico">
                <div id="filterContainer" class="filtros-box hidden">
                    <h3 class="titulo-box">FILTROS:</h3>
                    <div class="filtro-item">
                        <h1 class="titulo">Saúde</h1>
                    </div>
                </div>
                <div id="listServicos" class="servicos">
                    <?php
                        define('DB_SERVER', '185.173.111.184');
                        define('DB_USERNAME', 'u858577505_trabalhoamigo');
                        define('DB_PASSWORD', '@#Trabalhoamigo023@_');
                        define('DB_NAME', 'u858577505_trabalhoamigo');

                        // Função para criar a conexão com o banco de dados
                        function getDatabaseConnection() {
                            $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                            
                            if ($conexao->connect_error) {
                                throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
                            }
                            
                            return $conexao;
                        }

                        // Função para buscar os serviços e categorias
                        function getServicos($conexao) {
                            // Consulta SQL para buscar serviços e suas respectivas categorias
                            $sql = "
                                SELECT 
                                    s.id_servico, 
                                    s.titulo, 
                                    s.descricao, 
                                    s.preco, 
                                    s.aceita_oferta, 
                                    s.comunitario, 
                                    c.nome AS categoria_nome,
                                    s.data_Criacao
                                FROM 
                                    servicos s
                                INNER JOIN 
                                    categorias c ON s.id_categoria_fk = c.id_categoria
                                WHERE 
                                    s.ativo = 1
                                ORDER BY 
                                    s.data_Criacao DESC
                            ";
                            
                            $result = $conexao->query($sql);
                            
                            if ($result->num_rows > 0) {
                                return $result->fetch_all(MYSQLI_ASSOC);
                            } else {
                                return [];
                            }
                        }

                        function renderServicos($servicos) {
                            if (empty($servicos)) {
                                echo "<p>Nenhum serviço encontrado.</p>";
                                return;
                            }
                            
                            echo '<ul class="listagem-servico">';
                            foreach ($servicos as $servico) {
                                echo '<li class="listagem-item">';
                                echo '<h2 class="listagem-titulo">' . htmlspecialchars($servico['titulo']) . '</h2>';
                                echo '<p class="listagem-descricao">Descrição: ' . htmlspecialchars($servico['descricao']) . '</p>';
                                echo '<p class="listagem-preco">Preço: R$ ' . number_format($servico['preco'], 2, ',', '.') . '</p>';
                                echo '<p class="listagem-categoria">Categoria: ' . htmlspecialchars($servico['categoria_nome']) . '</p>';
                                echo '<p class="listagem-data">Data de Criação: ' . date('d/m/Y H:i:s', strtotime($servico['data_Criacao'])) . '</p>';
                                echo '<p class="listagem-oferta">Aceita Oferta: ' . ($servico['aceita_oferta'] ? 'Sim' : 'Não') . '</p>';
                                echo '<p class="listagem-comunitario">Comunitário: ' . ($servico['comunitario'] ? 'Sim' : 'Não') . '</p>';
                                echo '<button class="btn-modal" onclick="openModal(' . $servico['id_servico'] . ', \'' . addslashes(htmlspecialchars($servico['titulo'])) . '\', \'' . addslashes(htmlspecialchars($servico['descricao'])) . '\', ' . $servico['preco'] . ')">Ver Mais</button>';
                                echo '</li>';
                            }
                            echo '</ul>';

                            echo '
                            <div id="modal" class="modal" style="display:none;">
                                <div class="modal-content">
                                    <span class="close" onclick="closeModal()">&times;</span>
                                    <div class="content-container">
                                        <h2 id="modal-titulo"></h2>
                                        <p id="modal-descricao"></p>
                                        <p id="modal-preco"></p>
                                    </div>
                                    <a id="contratar-btn" class="btn-contratar" href="#" onclick="contratarServico()">Contratar Serviço</a>
                                </div>
                            </div>';
                        };

                        function processListServicos() {
                            try {
                                $conexao = getDatabaseConnection();
                                $servicos = getServicos($conexao);
                                renderServicos($servicos);
                                $conexao->close();
                            } catch (Exception $e) {
                                echo "<p>Erro: " . $e->getMessage() . "</p>";
                            }
                        }

                        processListServicos();

                    ?>


                </div>
            </section>
    
            <section id="bloco-chamada">
                <div class="item">
                    <a href="#">
                        <img src="../../../../public/img/Bloco-chamada-listagem-1.png" alt="Imagem de Chamada">
                    </a>
                </div>
                <div class="item">
                    <a href="#">
                        <img src="../../../../public/img/Bloco-chamada-listagem-2.png" alt="Imagem de Chamada">
                    </a>
                </div>
            </section>
    
        </main>
        
        <?php include '../layouts/Footer.php'; ?>

        </section>
    </body>
</html>