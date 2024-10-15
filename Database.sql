-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 185.173.111.184    Database: u858577505_trabalhoamigo
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.9-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avaliacao_servico`
--

DROP TABLE IF EXISTS `avaliacao_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacao_servico` (
  `id_avaliacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_fk` int(11) NOT NULL,
  `id_servico_fk` int(11) NOT NULL,
  `estrelas` int(1) NOT NULL CHECK (`estrelas` between 0 and 5),
  `comentario` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_publicacao` datetime NOT NULL,
  PRIMARY KEY (`id_avaliacao`),
  KEY `fk_avaliacao_usuario` (`id_usuario_fk`),
  KEY `fk_avaliacao_servico` (`id_servico_fk`),
  CONSTRAINT `fk_avaliacao_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE,
  CONSTRAINT `fk_avaliacao_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacao_servico`
--

LOCK TABLES `avaliacao_servico` WRITE;
/*!40000 ALTER TABLE `avaliacao_servico` DISABLE KEYS */;
/*!40000 ALTER TABLE `avaliacao_servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `descricao` text NOT NULL,
  `ordenacao` int(11) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Elétrica','Teste de elétrica',1),(2,'Jardinagem','Serviços relacionados ao cuidado de jardins e paisagismo.',1),(3,'Construção','Serviços relacionados à construção civil e reformas.',2),(4,'Limpeza','Serviços de limpeza residencial, comercial e pós-obra.',3),(5,'Tecnologia','Serviços de TI como suporte, desenvolvimento e consultoria.',4),(6,'Transporte','Serviços de transporte, como frete e mudanças.',5);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id_servico_fk` int(11) NOT NULL,
  `id_contrato_fk` int(11) NOT NULL,
  `qtd_servico` int(11) NOT NULL,
  `valor_final` varchar(30) NOT NULL,
  KEY `fk_servico_contrato_servico` (`id_servico_fk`),
  KEY `fk_servico_contrato_contrato` (`id_contrato_fk`),
  CONSTRAINT `fk_servico_contrato_contrato` FOREIGN KEY (`id_contrato_fk`) REFERENCES `proposta` (`id_contrato`) ON DELETE CASCADE,
  CONSTRAINT `fk_servico_contrato_servico` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id_servico`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contratos`
--

LOCK TABLES `contratos` WRITE;
/*!40000 ALTER TABLE `contratos` DISABLE KEYS */;
/*!40000 ALTER TABLE `contratos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enderecos`
--

DROP TABLE IF EXISTS `enderecos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos` (
  `id_endereco` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `cep` varchar(20) NOT NULL,
  `rua` varchar(120) DEFAULT NULL,
  `bairro` varchar(70) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_endereco`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos`
--

LOCK TABLES `enderecos` WRITE;
/*!40000 ALTER TABLE `enderecos` DISABLE KEYS */;
/*!40000 ALTER TABLE `enderecos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proposta`
--

DROP TABLE IF EXISTS `proposta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proposta` (
  `id_contrato` int(11) NOT NULL AUTO_INCREMENT,
  `id_servico_fk` int(11) NOT NULL,
  `id_usuario_contrante_fk` int(11) NOT NULL,
  `id_usuario_prestador_fk` int(11) NOT NULL,
  `data_contrato` datetime NOT NULL,
  `data_Esperada` date NOT NULL,
  `prazo_estimado` int(11) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `descricao` varchar(500) NOT NULL,
  PRIMARY KEY (`id_contrato`),
  KEY `fk_contrato_usuario_contrante` (`id_usuario_contrante_fk`),
  KEY `fk_contrato_usuario_prestador` (`id_usuario_prestador_fk`),
  CONSTRAINT `fk_contrato_usuario_contrante` FOREIGN KEY (`id_usuario_contrante_fk`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_contrato_usuario_prestador` FOREIGN KEY (`id_usuario_prestador_fk`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proposta`
--

LOCK TABLES `proposta` WRITE;
/*!40000 ALTER TABLE `proposta` DISABLE KEYS */;
INSERT INTO `proposta` VALUES (10,11,37,45,'2024-10-14 15:33:11','2002-09-20',20,5555.00,2,'sdfsdfsdfsdfsdfsfsfsfsdfsd'),(11,12,37,45,'2024-10-14 15:45:58','0000-00-00',8974,200.00,4,'sdfjhsdfhsdkj'),(12,13,37,45,'2024-10-14 15:46:08','0092-07-24',479,4.00,4,'sdkjfhkjsdhfkjsdh'),(13,14,37,45,'2024-10-14 15:46:19','0000-00-00',989,7465465.00,4,'jfdshgjdhgkjfhdkjhf'),(14,20,37,45,'2024-10-14 16:20:49','0000-00-00',98908,2000.00,2,'fjghfdkjhgfdkjghd'),(15,20,37,45,'2024-10-14 16:23:39','2002-09-20',2222,22222.00,2,'csdfsdfsdfssdfd'),(16,20,37,45,'2024-10-14 16:26:32','2002-09-20',65,5456.00,4,'jkjhjhkjhkjhj');
/*!40000 ALTER TABLE `proposta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicos`
--

DROP TABLE IF EXISTS `servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicos` (
  `id_servico` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_fk` int(11) NOT NULL,
  `id_categoria_fk` int(11) NOT NULL,
  `titulo` varchar(120) NOT NULL,
  `descricao` varchar(500) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `aceita_oferta` tinyint(1) NOT NULL DEFAULT 1,
  `comunitario` tinyint(1) NOT NULL DEFAULT 1,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_Criacao` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_servico`),
  KEY `fk_servico_usuario` (`id_usuario_fk`),
  KEY `fk_servico_categoria` (`id_categoria_fk`),
  CONSTRAINT `fk_servico_categoria` FOREIGN KEY (`id_categoria_fk`) REFERENCES `categorias` (`id_categoria`) ON DELETE CASCADE,
  CONSTRAINT `fk_servico_usuario` FOREIGN KEY (`id_usuario_fk`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicos`
--

LOCK TABLES `servicos` WRITE;
/*!40000 ALTER TABLE `servicos` DISABLE KEYS */;
INSERT INTO `servicos` VALUES (10,37,1,'Manutenção de Jardim','Cuido de jardins, faço podas e tratamento de plantas.',150.00,1,1,1,'2024-10-09 11:04:14'),(11,38,2,'Construção de Muros','Construo muros de alvenaria com acabamento.',3000.00,0,1,1,'2024-10-09 11:04:14'),(12,39,3,'Limpeza Residencial','Faço limpeza detalhada de casas e apartamentos.',200.00,1,1,1,'2024-10-09 11:04:14'),(13,40,4,'Suporte Técnico','Ofereço suporte técnico remoto para empresas.',120.00,1,0,1,'2024-10-09 11:04:14'),(14,41,5,'Serviço de Mudança','Realizo transporte de móveis e mudanças em geral.',500.00,1,1,1,'2024-10-09 11:04:14'),(17,45,4,'Projeto de Rede Industrial','asdasdasdasda',12.00,1,0,1,'2024-10-14 14:17:40'),(18,45,5,'sadasdas','asdasdasdas',0.00,1,1,1,'2024-10-14 14:19:31'),(19,45,5,'sadasdas','asdasdasdas',0.00,1,1,1,'2024-10-14 14:20:01'),(20,45,6,'Projeto de Rede Industrial','asdsadsadsa',54.00,0,0,1,'2024-10-14 14:20:13');
/*!40000 ALTER TABLE `servicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `primeiro_nome` varchar(60) NOT NULL,
  `ultimo_nome` varchar(80) DEFAULT NULL,
  `celular` varchar(25) DEFAULT NULL,
  `whatsapp` varchar(25) DEFAULT NULL,
  `telefone` varchar(25) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `senha` varchar(105) NOT NULL,
  `cpf` varchar(18) DEFAULT NULL,
  `cnpj` varchar(26) DEFAULT NULL,
  `data_Criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_usuario` varchar(20) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`),
  UNIQUE KEY `cnpj_UNIQUE` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (37,'Vitor Gabriel','de Oliveira','','','1111111111','contratante@gmail.com','$2y$10$DyGMZsr4yeSI6UWP.q0af.vkf/gzcSHHFvs9p48qg.VUml1o3ubwO','13770078981',NULL,'2024-10-09 10:53:40','contratante',1),(38,'João','Silva','(11) 91234-5678','(11) 91234-5678',NULL,'joao.silva@email.com','senhaSegura123','123.456.789-00',NULL,'2024-10-09 11:03:52','cliente',1),(39,'Maria','Oliveira','(21) 98765-4321','','(21) 2345-6789','maria.oliveira@email.com','senhaForte456','987.654.321-00',NULL,'2024-10-09 11:03:52','cliente',1),(40,'Carlos','Pereira','(31) 91234-5678',NULL,NULL,'carlos.pereira@email.com','senhaSuper789','123.321.456-99',NULL,'2024-10-09 11:03:52','cliente',1),(41,'Ana','Souza','(41) 99876-5432','(41) 99876-5432',NULL,'ana.souza@email.com','senhaSecreta101','321.654.987-00',NULL,'2024-10-09 11:03:52','admin',1),(42,'Lucas','Martins','(61) 91234-8765',NULL,NULL,'lucas.martins@email.com','senhaIncrivel202','654.987.123-00',NULL,'2024-10-09 11:03:52','gestor',1),(43,'Vitor Gabriel','de Oliveira','','','66666666666','vitor@gmail.com','$2y$10$F3mVDscAmz2H7gXBQPU4rugKQChWnJar515A9TlRCkGRhw95oLVZK','13770078983',NULL,'2024-10-09 14:18:16','anunciante',1),(44,'Tetseeee','khsdfgsj','','','5555555555','contratante2@gmail.com','$2y$10$bhbjFlXJWD47cUNfAS0xO.UKOVv/zMvk8gaH6NAhz2wEAeJAh4XNi','5555555555',NULL,'2024-10-09 14:21:17','contratante',1),(45,'Anunciante','Teste','43998055722','','43998055722','anunciante@gmail.com','$2y$10$Iw0/L586T5jJQ9Z8EfrtSe8K4qxXpnRbjoiJI35tBDdrEqTtT6L2W','16160696947',NULL,'2024-10-09 14:27:02','anunciante',1),(46,'Vitor Gabriel de Oliveira','sdadasd','','','77777777777','nahrung@nahrung.com.br','$2y$10$TEySoyWc1ZuxG4hqRZCH9.sC87U2ueg5vc.klb.Ki4YweLkmHlNFO','1344456884',NULL,'2024-10-14 11:20:33','contratante',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-14 19:52:10
