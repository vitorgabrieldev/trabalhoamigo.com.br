-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 23, 2024 at 05:57 PM
-- Server version: 10.11.9-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u858577505_trabalhoamigo`
--

-- --------------------------------------------------------

--
-- Table structure for table `avaliacao_servico`
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

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` text NOT NULL,
  `ordenacao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categorias`
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
-- Table structure for table `contratos`
--

CREATE TABLE `contratos` (
  `id_servico_fk` int(11) NOT NULL,
  `id_contrato_fk` int(11) NOT NULL,
  `qtd_servico` int(11) NOT NULL,
  `valor_final` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enderecos`
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

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `msg_id` int(11) NOT NULL,
  `incoming_msg_id` int(255) NOT NULL,
  `outgoing_msg_id` int(255) NOT NULL,
  `msg` varchar(1000) NOT NULL,
  `servico_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposta`
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

-- --------------------------------------------------------

--
-- Table structure for table `servicos`
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

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
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
  `cpf` varchar(18) DEFAULT NULL,
  `data_Criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_usuario` varchar(20) NOT NULL,
  `unique_id` varchar(45) NOT NULL,
  `img` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `delete_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  ADD PRIMARY KEY (`id_avaliacao`),
  ADD KEY `fk_avaliacao_usuario` (`id_usuario_fk`),
  ADD KEY `fk_avaliacao_servico` (`id_servico_fk`);

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indexes for table `contratos`
--
ALTER TABLE `contratos`
  ADD KEY `fk_servico_contrato_servico` (`id_servico_fk`),
  ADD KEY `fk_servico_contrato_contrato` (`id_contrato_fk`);

--
-- Indexes for table `enderecos`
--
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`id_endereco`),
  ADD KEY `enderecos_ibfk_1` (`id_usuario`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`msg_id`);

--
-- Indexes for table `proposta`
--
ALTER TABLE `proposta`
  ADD PRIMARY KEY (`id_contrato`),
  ADD KEY `fk_contrato_usuario_contrante` (`id_usuario_contrante_fk`),
  ADD KEY `fk_contrato_usuario_prestador` (`id_usuario_prestador_fk`);

--
-- Indexes for table `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id_servico`),
  ADD KEY `fk_servico_usuario` (`id_usuario_fk`),
  ADD KEY `fk_servico_categoria` (`id_categoria_fk`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  MODIFY `id_avaliacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id_endereco` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `msg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `proposta`
--
ALTER TABLE `proposta`
  MODIFY `id_contrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `avaliacao_servico`
--
ALTER TABLE `avaliacao_servico`
  ADD CONSTRAINT `fk_avaliacao_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avaliacao_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`);

--
-- Constraints for table `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `fk_servico_contrato_contrato` FOREIGN KEY (`id_contrato_fk`) REFERENCES `proposta` (`id_contrato`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_servico_contrato_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE;

--
-- Constraints for table `enderecos`
--
ALTER TABLE `enderecos`
  ADD CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Constraints for table `proposta`
--
ALTER TABLE `proposta`
  ADD CONSTRAINT `fk_contrato_usuario_contrante` FOREIGN KEY (`id_usuario_contrante_fk`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_contrato_usuario_prestador` FOREIGN KEY (`id_usuario_prestador_fk`) REFERENCES `usuarios` (`id_usuario`);

--
-- Constraints for table `servicos`
--
ALTER TABLE `servicos`
  ADD CONSTRAINT `fk_servico_categoria` FOREIGN KEY (`id_categoria_fk`) REFERENCES `categorias` (`id_categoria`) ON DELETE NO ACTION,
  ADD CONSTRAINT `fk_servico_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
