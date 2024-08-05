-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: trabalhoamigo.com.br
-- ------------------------------------------------------
-- Server version       10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_categorias`
--

DROP TABLE IF EXISTS `admin_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_categorias` (
  `idcategoria` int(11) NOT NULL AUTO_INCREMENT COMMENT '\n',
  `icone` varchar(255) NOT NULL,
  `descricao` varchar(50) NOT NULL,
  `ordenacao` int(11) NOT NULL,
  PRIMARY KEY (`idcategoria`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_categorias`
--

LOCK TABLES `admin_categorias` WRITE;
/*!40000 ALTER TABLE `admin_categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_erros`
--

DROP TABLE IF EXISTS `admin_erros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_erros` (
  `iderro` int(11) NOT NULL AUTO_INCREMENT,
  `data` datetime NOT NULL,
  `mensagem` text NOT NULL,
  `browser` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`iderro`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_erros`
--

LOCK TABLES `admin_erros` WRITE;
/*!40000 ALTER TABLE `admin_erros` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_erros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_itens`
--

DROP TABLE IF EXISTS `admin_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_itens` (
  `iditem` int(11) NOT NULL AUTO_INCREMENT,
  `idperfil` int(11) NOT NULL,
  `idcategoria` int(11) NOT NULL,
  `descricao` varchar(50) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `controlador` varchar(50) NOT NULL,
  `acao` varchar(50) NOT NULL,
  `parametros` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`iditem`) USING BTREE,
  KEY `fk_menu_itens_menu_categorias1` (`idcategoria`) USING BTREE,
  KEY `fk_menu_itens_perfis1` (`idperfil`) USING BTREE,
  CONSTRAINT `fk_menu_itens_menu_categorias1` FOREIGN KEY (`idcategoria`) REFERENCES `admin_categorias` (`idcategoria`),
  CONSTRAINT `fk_menu_itens_perfis1` FOREIGN KEY (`idperfil`) REFERENCES `admin_perfis` (`idperfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_itens`
--

LOCK TABLES `admin_itens` WRITE;
/*!40000 ALTER TABLE `admin_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_logs` (
  `idlog` int(11) NOT NULL AUTO_INCREMENT,
  `nomeusuario` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `modulo` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `acao_executada` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `browser_sistema` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `data_execucao` datetime NOT NULL,
  `ip` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`idlog`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_perfis`
--

DROP TABLE IF EXISTS `admin_perfis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_perfis` (
  `idperfil` int(11) NOT NULL,
  `descricao` varchar(80) NOT NULL,
  PRIMARY KEY (`idperfil`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_perfis`
--

LOCK TABLES `admin_perfis` WRITE;
/*!40000 ALTER TABLE `admin_perfis` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_perfis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_categoria`
--

DROP TABLE IF EXISTS `default_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_categoria` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) DEFAULT NULL,
  `descricao` varchar(120) DEFAULT NULL,
  `ordem` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_categoria`
--

LOCK TABLES `default_categoria` WRITE;
/*!40000 ALTER TABLE `default_categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_contrato`
--

DROP TABLE IF EXISTS `default_contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_contrato` (
  `id_contrato` int(11) NOT NULL AUTO_INCREMENT,
  `id_servico_fk` int(11) DEFAULT NULL,
  `id_usuario_contrante_fk` int(11) DEFAULT NULL,
  `id_usuario_prestador_fk` int(11) DEFAULT NULL,
  `data_contrato` datetime DEFAULT NULL,
  `prazo_estimado` datetime DEFAULT NULL,
  `valor_total` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_contrato`),
  KEY `fk_contrato_usuario_contrante` (`id_usuario_contrante_fk`),
  KEY `fk_contrato_usuario_prestador` (`id_usuario_prestador_fk`),
  CONSTRAINT `fk_contrato_usuario_contrante` FOREIGN KEY (`id_usuario_contrante_fk`) REFERENCES `default_usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_contrato_usuario_prestador` FOREIGN KEY (`id_usuario_prestador_fk`) REFERENCES `default_usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_contrato`
--

LOCK TABLES `default_contrato` WRITE;
/*!40000 ALTER TABLE `default_contrato` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_contrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_servico`
--

DROP TABLE IF EXISTS `default_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_servico` (
  `id_servico` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_fk` int(11) DEFAULT NULL,
  `id_categoria_fk` int(11) DEFAULT NULL,
  `titulo` varchar(120) DEFAULT NULL,
  `descricao` varchar(500) DEFAULT NULL,
  `preco` varchar(30) DEFAULT NULL,
  `aceita_oferta` int(11) DEFAULT NULL,
  `comunitario` int(11) DEFAULT NULL,
  `ativo` int(11) DEFAULT NULL,
  `data_Criacao` datetime DEFAULT NULL,
  PRIMARY KEY (`id_servico`),
  KEY `fk_servico_usuario` (`id_usuario_fk`),
  KEY `fk_servico_categoria` (`id_categoria_fk`),
  CONSTRAINT `fk_servico_categoria` FOREIGN KEY (`id_categoria_fk`) REFERENCES `default_categoria` (`id_categoria`) ON DELETE CASCADE,
  CONSTRAINT `fk_servico_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `default_usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_servico`
--

LOCK TABLES `default_servico` WRITE;
/*!40000 ALTER TABLE `default_servico` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_servico_contrato`
--

DROP TABLE IF EXISTS `default_servico_contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_servico_contrato` (
  `id_servico_fk` int(11) DEFAULT NULL,
  `id_contrato_fk` int(11) DEFAULT NULL,
  `qtd_servico` int(11) DEFAULT NULL,
  `valor_final` varchar(30) DEFAULT NULL,
  KEY `fk_servico_contrato_servico` (`id_servico_fk`),
  KEY `fk_servico_contrato_contrato` (`id_contrato_fk`),
  CONSTRAINT `fk_servico_contrato_contrato` FOREIGN KEY (`id_contrato_fk`) REFERENCES `default_contrato` (`id_contrato`) ON DELETE CASCADE,
  CONSTRAINT `fk_servico_contrato_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `default_servico` (`id_servico`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_servico_contrato`
--

LOCK TABLES `default_servico_contrato` WRITE;
/*!40000 ALTER TABLE `default_servico_contrato` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_servico_contrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_usuarios`
--

DROP TABLE IF EXISTS `default_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `primeiro_nome` varchar(60) DEFAULT NULL,
  `ultimo_nome` varchar(80) DEFAULT NULL,
  `celular` varchar(45) DEFAULT NULL,
  `whatsapp` varchar(45) DEFAULT NULL,
  `telefone` varchar(45) DEFAULT NULL,
  `email` varchar(66) DEFAULT NULL,
  `email_recuperacao` varchar(66) DEFAULT NULL,
  `senha` varchar(512) DEFAULT NULL,
  `cpf` varchar(25) DEFAULT NULL,
  `cnpj` varchar(40) DEFAULT NULL,
  `endereco` varchar(120) DEFAULT NULL,
  `cep` varchar(20) DEFAULT NULL,
  `rua` varchar(120) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `data_Criacao` datetime DEFAULT NULL,
  `tipo_usuario` varchar(20) DEFAULT NULL,
  `idPerfil` int(1) NOT NULL,
  `ativo` int(11) DEFAULT NULL,
  `bairro` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `fk_usuario_perfil` (`idPerfil`) USING BTREE,
  CONSTRAINT `fk_usuario_perfil` FOREIGN KEY (`idPerfil`) REFERENCES `admin_perfis` (`idperfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_usuarios`
--

LOCK TABLES `default_usuarios` WRITE;
/*!40000 ALTER TABLE `default_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;