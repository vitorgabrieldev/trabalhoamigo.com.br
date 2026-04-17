-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 25/10/2024 às 14:43
-- Versão do servidor: 10.11.9-MariaDB
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u858577505_trabalhoamigo`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `avaliacao_servico`
--

CREATE TABLE `avaliacao_servico` (
  `id_avaliacao` int(11) NOT NULL,
  `id_usuario_fk` int(11) NOT NULL,
  `id_servico_fk` int(11) NOT NULL,
  `estrelas` int(1) NOT NULL CHECK (`estrelas` between 0 and 5),
  `comentario` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_publicacao` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `avaliacao_servico`
--

INSERT INTO `avaliacao_servico` (`id_avaliacao`, `id_usuario_fk`, `id_servico_fk`, `estrelas`, `comentario`, `ativo`, `data_publicacao`) VALUES
(3, 66, 47, 3, 'sadsadsad', 1, '2024-10-22 23:51:39'),
(4, 66, 46, 5, '', 1, '2024-10-22 23:52:51'),
(5, 66, 47, 5, 'Ruimmmmmm de bom de mais\n', 1, '2024-10-23 10:21:22'),
(6, 66, 47, 3, '', 1, '2024-10-23 10:22:59');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` text NOT NULL,
  `ordenacao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nome`, `descricao`, `ordenacao`) VALUES
(1, 'Elétrica', 'Teste de elétrica', 1),
(2, 'Jardinagem', 'Serviços relacionados ao cuidado de jardins e paisagismo.', 1),
(3, 'Construção', 'Serviços relacionados à construção civil e reformas.', 2),
(4, 'Limpeza', 'Serviços de limpeza residencial, comercial e pós-obra.', 3),
(5, 'Tecnologia', 'Serviços de TI como suporte, desenvolvimento e consultoria.', 4),
(6, 'Transporte', 'Serviços de transporte, como frete e mudanças.', 5),
(7, 'Pintura', 'Serviços de pintura residencial, comercial e industrial.', 6),
(8, 'Manutenção', 'Serviços de manutenção preventiva e corretiva.', 7),
(9, 'Marcenaria', 'Serviços de marcenaria, móveis planejados e restauração.', 8),
(10, 'Climatização', 'Serviços de instalação e manutenção de ar-condicionado.', 9),
(11, 'Segurança', 'Serviços de instalação e monitoramento de sistemas de segurança.', 10),
(12, 'Gastronomia', 'Serviços de chef particular e catering.', 11),
(13, 'Educação', 'Aulas particulares e consultoria educacional.', 12),
(14, 'Automotivo', 'Serviços de manutenção automotiva e reparos.', 13),
(15, 'Beleza', 'Serviços de estética, salão de beleza e spa.', 14),
(16, 'Eventos', 'Serviços de organização e planejamento de eventos.', 15),
(17, 'Mecânica', 'Serviços de manutenção e reparo de máquinas.', 16),
(18, 'Marketing', 'Consultoria e serviços de marketing digital e tradicional.', 17),
(19, 'Administração', 'Serviços de consultoria em gestão empresarial.', 18),
(20, 'Auditoria', 'Serviços de auditoria contábil e fiscal.', 19),
(21, 'Consultoria Financeira', 'Serviços de planejamento e consultoria financeira.', 20),
(22, 'Seguros', 'Serviços de corretagem e consultoria de seguros.', 21),
(23, 'Fotografia', 'Serviços de fotografia e vídeo profissional.', 22),
(24, 'Design', 'Serviços de design gráfico e web design.', 23),
(25, 'Arquitetura', 'Serviços de arquitetura e design de interiores.', 24),
(26, 'Logística', 'Serviços de gerenciamento de transporte e distribuição.', 25),
(27, 'Recursos Humanos', 'Consultoria em gestão de pessoas e recrutamento.', 26),
(28, 'Agricultura', 'Serviços relacionados à agricultura e manejo sustentável.', 27),
(29, 'Veterinária', 'Serviços de atendimento e cuidado para animais.', 28),
(30, 'Consultoria Jurídica', 'Serviços de assessoria e consultoria jurídica.', 29),
(31, 'Turismo', 'Serviços de planejamento e consultoria em viagens.', 30),
(32, 'Tradução', 'Serviços de tradução e interpretação.', 31),
(33, 'Psicologia', 'Serviços de atendimento psicológico e terapias.', 32),
(34, 'Fisioterapia', 'Serviços de fisioterapia e reabilitação.', 33),
(35, 'Consultoria Ambiental', 'Serviços de consultoria em sustentabilidade e meio ambiente.', 34),
(36, 'Desenvolvimento Pessoal', 'Serviços de coaching e desenvolvimento pessoal.', 35),
(37, 'Engenharia', 'Serviços de engenharia civil, elétrica e mecânica.', 36),
(38, 'Moda', 'Serviços de consultoria de moda e personal stylist.', 37),
(39, 'Nutrição', 'Serviços de consultoria nutricional e planejamento alimentar.', 38),
(40, 'Treinamento Físico', 'Serviços de personal trainer e atividades físicas.', 39);

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

CREATE TABLE `contratos` (
  `id_servico_fk` int(11) NOT NULL,
  `id_contrato_fk` int(11) NOT NULL,
  `qtd_servico` int(11) NOT NULL,
  `valor_final` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `enderecos`
--

CREATE TABLE `enderecos` (
  `id_endereco` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `cep` varchar(20) NOT NULL,
  `rua` varchar(120) DEFAULT NULL,
  `bairro` varchar(70) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `enderecos`
--

INSERT INTO `enderecos` (`id_endereco`, `id_usuario`, `cep`, `rua`, `bairro`, `numero`, `complemento`) VALUES
(19, 65, '86086-340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'Portão do meio'),
(20, 66, '86086340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'Portão do me'),
(21, 67, '86086-340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'sadsa'),
(22, 68, '86086340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'Portão do meio'),
(23, 69, '86086-340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'kjashdksa'),
(24, 70, '86086340', 'Rua Doutor Eduardo Apparecido Turetta', 'Jardim Ltaparica', 225, 'Portão do meio');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE `messages` (
  `msg_id` int(11) NOT NULL,
  `incoming_msg_id` int(255) NOT NULL,
  `outgoing_msg_id` int(255) NOT NULL,
  `msg` varchar(1000) NOT NULL,
  `servico_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`msg_id`, `incoming_msg_id`, `outgoing_msg_id`, `msg`, `servico_id`) VALUES
(78, 954817919, 798147133, 'teste', 36),
(79, 954817919, 798147133, 'asd', 38),
(80, 954817919, 798147133, 'sad', 38),
(81, 954817919, 798147133, 'sd', 38),
(82, 954817919, 798147133, 'asdasd', 38),
(83, 954817919, 798147133, 'sdasdas', 38),
(84, 798147133, 954817919, 'Este é o chat com o id 38', 38),
(85, 798147133, 954817919, 'Este é o chat com o id 36', 36),
(86, 954817919, 798147133, 'Serviço 36', 36),
(87, 954817919, 798147133, 'Serviço 38', 38),
(88, 954817919, 798147133, 'asdas', 38);

-- --------------------------------------------------------

--
-- Estrutura para tabela `proposta`
--

CREATE TABLE `proposta` (
  `id_contrato` int(11) NOT NULL,
  `id_servico_fk` int(11) NOT NULL,
  `id_usuario_contrante_fk` int(11) NOT NULL,
  `id_usuario_prestador_fk` int(11) NOT NULL,
  `data_contrato` datetime NOT NULL,
  `data_Esperada` date NOT NULL,
  `prazo_estimado` int(11) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `descricao` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `proposta`
--

INSERT INTO `proposta` (`id_contrato`, `id_servico_fk`, `id_usuario_contrante_fk`, `id_usuario_prestador_fk`, `data_contrato`, `data_Esperada`, `prazo_estimado`, `valor_total`, `status`, `descricao`) VALUES
(38, 47, 66, 65, '2024-10-23 01:58:44', '2222-02-22', 2, 222.00, 2, 'sadsad asdas dsa dsadsads'),
(39, 57, 68, 69, '2024-10-23 15:01:32', '2008-09-20', 200, 2000.00, 2, 'teste de proposta'),
(40, 57, 68, 69, '2024-10-23 15:02:22', '1232-09-02', 283, 200.00, 1, 'dskhfbsdk hfdsgfk dhsfdsgjkfsdhkf');

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id_servico` int(11) NOT NULL,
  `id_usuario_fk` int(11) NOT NULL,
  `id_categoria_fk` int(11) NOT NULL,
  `titulo` varchar(120) NOT NULL,
  `descricao` varchar(500) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `imagem` varchar(255) NOT NULL,
  `aceita_oferta` tinyint(1) NOT NULL DEFAULT 1,
  `comunitario` tinyint(1) NOT NULL DEFAULT 1,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_Criacao` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id_servico`, `id_usuario_fk`, `id_categoria_fk`, `titulo`, `descricao`, `preco`, `imagem`, `aceita_oferta`, `comunitario`, `ativo`, `data_Criacao`) VALUES
(45, 65, 2, 'asdasdas', 'sadsadasdasda', 2.00, 'servico_67179793168218.85851718.png', 1, 0, 1, '2024-10-22 12:16:19'),
(46, 65, 3, 'Título da Notícia', 'asdasdasdasdasdas', 0.00, 'null', 1, 1, 1, '2024-10-22 12:17:36'),
(47, 65, 1, 'Título da Notícia', 'adsadsadasdasdasdas', 0.00, 'servico_67179a20848232.14780325.png', 1, 1, 1, '2024-10-22 12:27:12'),
(48, 65, 4, 'asdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsg', 96778.00, 'null', 1, 0, 1, '2024-10-23 11:02:04'),
(49, 65, 2, 'asdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsg', 32432423.00, 'null', 1, 0, 1, '2024-10-23 11:02:20'),
(50, 65, 5, 'asdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsg', 43543534.00, 'null', 1, 0, 1, '2024-10-23 11:02:33'),
(51, 65, 4, 'adsfadsfasfsadfdsafsda', 'asdfsdafasdhjgsfhdsg', 23423.00, 'null', 1, 0, 1, '2024-10-23 11:02:46'),
(52, 65, 3, 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 23432423.00, 'null', 1, 0, 1, '2024-10-23 11:03:06'),
(53, 65, 6, 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 42523.00, 'null', 1, 0, 1, '2024-10-23 11:03:20'),
(54, 65, 5, 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 'asdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsgasdfsdafasdhjgsfhdsg', 3224.00, 'null', 1, 0, 1, '2024-10-23 11:03:37'),
(55, 69, 1, 'Lindo serviço', 'efh ksehfkjshdkfjsh fgsdkfhkdjshfskjh', 0.00, 'null', 1, 1, 1, '2024-10-23 12:55:52'),
(56, 69, 1, 'sdfsfdsfdsffdsfsdfsd', 'sdfsfdsfdsffdsfsdfsdsdfsfdsfdsffdsfsdfsdsdfsfdsfdsffdsfsdfsd', 80789.00, 'null', 1, 0, 1, '2024-10-23 12:56:08'),
(57, 69, 5, 'asfsdafdsafsdafsda', 'sadfdsafsdafsdaf', 23423.00, 'servico_6718f282cdbe52.44409441.jpg', 1, 0, 1, '2024-10-23 12:56:35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `primeiro_nome` varchar(60) NOT NULL,
  `ultimo_nome` varchar(80) DEFAULT NULL,
  `celular` varchar(25) DEFAULT NULL,
  `whatsapp` varchar(25) DEFAULT NULL,
  `telefone` varchar(25) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `senha` varchar(105) NOT NULL,
  `totp_secret` varchar(50) NOT NULL,
  `totp_enabled` int(1) NOT NULL DEFAULT 0,
  `cpf` varchar(18) DEFAULT NULL,
  `data_Criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_usuario` varchar(20) NOT NULL,
  `unique_id` varchar(45) NOT NULL,
  `img` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `delete_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `primeiro_nome`, `ultimo_nome`, `celular`, `whatsapp`, `telefone`, `email`, `senha`, `totp_secret`, `totp_enabled`, `cpf`, `data_Criacao`, `tipo_usuario`, `unique_id`, `img`, `ativo`, `delete_at`) VALUES
(65, 'José Oswaldo', 'TESTE TESTE', '57565657657', '67567567596', '76567565765', 'delete_anunciante@gmail.com_6718eb134b8b8', '$2y$10$UhQ9ZbVTNqxDW5Qb04fH7Ob4aLka1IN7PoIOKd/RKck7S2HUQ8n8W', '', 0, '65575765675', '2024-10-22 11:03:41', 'anunciante', '954817919', 'usuario_6718e71c642623.46048307.png', 0, '2024-10-23'),
(66, 'Vitor Gabriel', 'de Oliveira', '(43) 98487-3804', '(23) 97648-7236', '(43) 98487-3806', 'delete_contratante@gmail.com_6718f0253af2e', '$2y$10$7CZ4zjYC59OItMqnieNBXeDpx1Z15wQSZC5GojiTIPxxTWVRWSToG', '', 0, '76567576567', '2024-10-22 12:19:04', 'contratante', '798147133', 'usuario_6718f01d57b915.87654716.jpg', 0, '2024-10-23'),
(67, 'sadhasbhd', 'khsdbfkhsdfksdh', '89786574896', '65878974576', '12345678765', 'delete_anunciante@gmail.com_6718edb6ce2eb', '$2y$10$/D.MUgzF14QwhZYKU4Jk4.qCqba6VhzYYntd.hGZrf6e0hzVWeyla', '', 0, '87536478975', '2024-10-23 12:26:04', 'anunciante', '1498948920', 'usuario_6718ed9c1ceac4.66228675.jpg', 0, '2024-10-23'),
(68, 'Contratante Júnior', 'dsfdsf', '', '', '43984873806', 'contratante@gmail.com', '$2y$10$amrlNuLCIHF8T4SFhgEgsuqD43wVWb9iv.14hjmlibmVfbyRdA98.', 'HMKEJUS4HAUMIMWY', 1, '76567576567', '2024-10-23 12:49:32', 'contratante', '108810215', 'usuario_671910605dc228.30428026.jpg', 1, '0000-00-00'),
(69, 'Usuário Anunciante', 'Desenvolvimento', '(43) 8487-3807', '(43) 98487-3807', '89765865677', 'anunciante@gmail.com', '$2y$10$e0SXM/vJXROP1.zyfixa5.ncCxg5xffJ1I.S.nOgd0eEbWlqv7lSO', '', 0, '85895768557', '2024-10-23 12:52:50', 'anunciante', '206630839', 'usuario_671906b6c64a96.36096538.jpg', 1, '2024-10-23'),
(70, 'Vitor Gabriel', 'de Oliveira', '', '43984873807', '43984873807', 'contratante@gmail.com', '$2y$10$cAzZv45j1lc/p5ng4u5/Nu/DUPzL.2RKJtQ.JnzFth7p6En5tB0B2', '', 0, '13770078985', '2024-10-25 12:39:28', 'contratante', '121166580', 'usuario_671b918a738919.62834377.png', 1, '0000-00-00');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  ADD PRIMARY KEY (`id_avaliacao`),
  ADD KEY `fk_avaliacao_usuario` (`id_usuario_fk`),
  ADD KEY `fk_avaliacao_servico` (`id_servico_fk`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices de tabela `contratos`
--
ALTER TABLE `contratos`
  ADD KEY `fk_servico_contrato_servico` (`id_servico_fk`),
  ADD KEY `fk_servico_contrato_contrato` (`id_contrato_fk`);

--
-- Índices de tabela `enderecos`
--
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`id_endereco`),
  ADD KEY `enderecos_ibfk_1` (`id_usuario`);

--
-- Índices de tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`msg_id`);

--
-- Índices de tabela `proposta`
--
ALTER TABLE `proposta`
  ADD PRIMARY KEY (`id_contrato`),
  ADD KEY `fk_contrato_usuario_contrante` (`id_usuario_contrante_fk`),
  ADD KEY `fk_contrato_usuario_prestador` (`id_usuario_prestador_fk`);

--
-- Índices de tabela `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id_servico`),
  ADD KEY `fk_servico_usuario` (`id_usuario_fk`),
  ADD KEY `fk_servico_categoria` (`id_categoria_fk`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  MODIFY `id_avaliacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id_endereco` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `msg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de tabela `proposta`
--
ALTER TABLE `proposta`
  MODIFY `id_contrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  ADD CONSTRAINT `fk_avaliacao_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avaliacao_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `fk_servico_contrato_contrato` FOREIGN KEY (`id_contrato_fk`) REFERENCES `proposta` (`id_contrato`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_servico_contrato_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE;

--
-- Restrições para tabelas `enderecos`
--
ALTER TABLE `enderecos`
  ADD CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `proposta`
--
ALTER TABLE `proposta`
  ADD CONSTRAINT `fk_contrato_usuario_contrante` FOREIGN KEY (`id_usuario_contrante_fk`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_contrato_usuario_prestador` FOREIGN KEY (`id_usuario_prestador_fk`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `servicos`
--
ALTER TABLE `servicos`
  ADD CONSTRAINT `fk_servico_categoria` FOREIGN KEY (`id_categoria_fk`) REFERENCES `categorias` (`id_categoria`) ON DELETE NO ACTION,
  ADD CONSTRAINT `fk_servico_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
