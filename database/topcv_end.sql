-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: topcv_be
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `job_id` int NOT NULL,
  `cv_file` varchar(255) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` int NOT NULL DEFAULT '0',
  `reject_reason` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (8,17,6,'17_6_638805228323831157.pdf','2025-04-17 14:40:32',1,''),(9,14,9,'14_9_638805228848281108.pdf','2025-04-17 14:41:25',1,NULL),(10,17,9,'17_9_638805402025196013.pdf','2025-04-17 19:30:03',1,NULL),(12,17,11,'17_11_638805649265360621.pdf','2025-04-18 02:22:07',0,NULL),(13,17,4,'17_4_638805664947596551.pdf','2025-04-18 02:48:15',0,NULL),(14,18,4,'18_4_638810689263898337.pdf','2025-04-23 22:22:06',0,''),(15,18,11,'18_11_638812268448502939.docx','2025-04-25 18:14:05',0,NULL),(16,14,12,'14_12_638841224551343842.pdf','2025-05-29 06:34:15',0,NULL),(17,14,8,'14_8_638843091693852817.docx','2025-05-31 10:26:09',1,NULL),(18,25,7,'15c8c901-6b3c-48a6-be7e-f1fc7b523728.docx','2025-06-15 03:24:44',2,'<p>vdvdbsbs</p><p>b</p><p>sb</p><p>s</p><p>bs</p><p><br></p><p>s</p>'),(19,14,7,'14_7_638855802570081398.pdf','2025-06-15 03:30:57',1,NULL);
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_profiles`
--

DROP TABLE IF EXISTS `candidate_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text,
  `date_of_birth` date DEFAULT NULL,
  `cv_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `candidate_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_profiles`
--

LOCK TABLES `candidate_profiles` WRITE;
/*!40000 ALTER TABLE `candidate_profiles` DISABLE KEYS */;
INSERT INTO `candidate_profiles` VALUES (1,8,NULL,'0987654321','Hanoi, Vietnam','1995-06-15','/uploads/alice_cv.pdf','2024-03-01 05:00:00'),(3,10,'Thề Em','0967543210','Da Nang, Vietnam','1997-05-10','/uploads/carol_cv.pdf','2024-03-03 03:30:00'),(5,18,'Huỳnh Nguyễn Xuân',NULL,NULL,NULL,NULL,'2025-04-24 05:21:00'),(6,22,'trường an võ',NULL,NULL,NULL,NULL,'2025-05-09 08:02:17'),(7,17,'Thầy truyền','0899909888','182 Lê Duẩn, Bến Thủy, Vinh, Nghệ An','2000-10-10','f3eb0e9c-4018-4c5d-82d4-22774eae4171.pdf','2025-05-09 08:02:17'),(8,25,'Nguyễn Trọng Truyền','null','null',NULL,'15c8c901-6b3c-48a6-be7e-f1fc7b523728.docx','2025-06-15 08:50:28');
/*!40000 ALTER TABLE `candidate_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `website` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `company_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profiles`
--

LOCK TABLES `company_profiles` WRITE;
/*!40000 ALTER TABLE `company_profiles` DISABLE KEYS */;
INSERT INTO `company_profiles` VALUES (1,4,'TechCorp','techcorp','A leading software company','https://techcorp.com','New York, USA'),(2,5,'MarketingPro','marketingpro','Top marketing solutions provider','https://marketingpro.com','Los Angeles, USA'),(6,15,'Công ty Thầy Truyền','công-ty-trọng-truyền','Nhìn cái gì','https://marketingprocom','182 Lê Duẩn, Bến Thủy, Vinh, Nghệ An'),(7,16,'Công ty Một Thành Viên','công-ty-một-thành-viên','Top marketing solutions provider','https://marketingpro.com','Los Angeles, USA'),(8,21,'nguyen trong truyen','nguyen-trong-truyen',NULL,NULL,NULL),(9,24,'Lua chua Vinh','lua-chua-vinh',NULL,NULL,NULL),(10,26,'Công ty một thành viên Nguyễn Trọng Truyền','công-ty-một-thành-viên-nguyễn-trọng-truyền',NULL,NULL,NULL);
/*!40000 ALTER TABLE `company_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employment_types`
--

DROP TABLE IF EXISTS `employment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employment_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employment_types`
--

LOCK TABLES `employment_types` WRITE;
/*!40000 ALTER TABLE `employment_types` DISABLE KEYS */;
INSERT INTO `employment_types` VALUES (1,'Full-time'),(2,'Part-time'),(3,'Internship'),(4,'Freelance'),(5,'Remote');
/*!40000 ALTER TABLE `employment_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('pending','accepted','declined') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `message` text NOT NULL,
  `secure_token` varchar(255) DEFAULT NULL,
  `application_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `interviews_applications_FK` (`application_id`),
  CONSTRAINT `interviews_applications_FK` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
INSERT INTO `interviews` VALUES (30,'accepted','2025-05-10 17:31:35','<p>sdgsdgvsdg</p><p>sdfg</p><p>sdg</p><p>fsd</p><p>g</p><p>dfhg</p><p>fd</p>',NULL,9),(31,'accepted','2025-05-29 12:16:58','<p>dsvvsdvdv</p><p>gsđsđgdgd</p><p>dsdsgdsdgsdsg</p>',NULL,8),(32,'accepted','2025-06-05 20:19:39','<p>rhđfbfdbfbfdf</p><p><br></p><p>f</p><p>df</p><p><br></p><p>fd</p><p>fd</p><p>fd</p><p>fd</p><p>fd</p>',NULL,10),(33,'accepted','2025-06-15 10:28:24','<p>triuisnvkjsdnkjsdnkjvnsdvnsdvnlsdkvnsdlkvnsdlkvndslkvndsvlksdnvlksdvnslkdvnsldkvnsdv</p><p>vsvsvnlsdvnlsvnlskvnlsdkvnsdl</p>',NULL,17),(38,'pending','2025-06-16 02:37:13','<p>bbbdsbdbdvdv</p>','566697d7a7f64617b465aca926191485',19),(39,'accepted','2025-06-16 02:38:33','<p>sfhakjvakjvnadv</p><p>avsdjvksdnvldsvdsnvldvn</p><p>dsdbbsbsb</p>',NULL,17);
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_fields`
--

DROP TABLE IF EXISTS `job_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_fields`
--

LOCK TABLES `job_fields` WRITE;
/*!40000 ALTER TABLE `job_fields` DISABLE KEYS */;
INSERT INTO `job_fields` VALUES (1,'IT'),(2,'Marketing'),(3,'Finance'),(4,'Education'),(5,'Healthcare');
/*!40000 ALTER TABLE `job_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_post_employment_types`
--

DROP TABLE IF EXISTS `job_post_employment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_post_employment_types` (
  `job_post_id` int NOT NULL,
  `employment_type_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_post_id`,`employment_type_id`),
  KEY `employment_type_id` (`employment_type_id`),
  CONSTRAINT `job_post_employment_types_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_employment_types_ibfk_2` FOREIGN KEY (`employment_type_id`) REFERENCES `employment_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_post_employment_types`
--

LOCK TABLES `job_post_employment_types` WRITE;
/*!40000 ALTER TABLE `job_post_employment_types` DISABLE KEYS */;
INSERT INTO `job_post_employment_types` VALUES (4,1,'2025-04-10 19:34:22'),(5,1,'2025-04-10 19:33:45'),(12,1,'2025-04-17 18:26:43'),(13,1,'2025-04-24 16:38:23');
/*!40000 ALTER TABLE `job_post_employment_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_post_fields`
--

DROP TABLE IF EXISTS `job_post_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_post_fields` (
  `job_post_id` int NOT NULL,
  `field_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_post_id`,`field_id`),
  KEY `field_id` (`field_id`),
  CONSTRAINT `job_post_fields_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_fields_ibfk_2` FOREIGN KEY (`field_id`) REFERENCES `job_fields` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_post_fields`
--

LOCK TABLES `job_post_fields` WRITE;
/*!40000 ALTER TABLE `job_post_fields` DISABLE KEYS */;
INSERT INTO `job_post_fields` VALUES (4,1,'2025-04-10 19:33:16'),(4,4,'2025-04-10 19:33:16'),(5,1,'2025-04-10 19:35:05'),(5,2,'2025-04-10 19:35:05'),(12,2,'2025-04-17 18:26:43'),(13,2,'2025-04-24 16:38:23');
/*!40000 ALTER TABLE `job_post_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_post_promotions`
--

DROP TABLE IF EXISTS `job_post_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_post_promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `package_id` int NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_post_id` (`job_post_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `job_post_promotions_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_promotions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_post_promotions`
--

LOCK TABLES `job_post_promotions` WRITE;
/*!40000 ALTER TABLE `job_post_promotions` DISABLE KEYS */;
INSERT INTO `job_post_promotions` VALUES (10,11,1,'2025-03-14 17:00:00','2025-04-29 17:00:00','2025-03-15 04:20:00'),(11,13,3,'2025-04-24 12:28:55','2025-06-23 12:28:55','2025-04-24 19:28:55'),(12,6,3,'2025-04-24 13:09:05','2025-05-24 13:09:05','2025-04-24 20:09:05'),(13,12,2,'2025-04-24 14:54:51','2025-07-23 14:54:51','2025-04-24 21:54:51'),(14,9,3,'2025-04-25 17:19:44','2025-05-25 17:19:44','2025-04-26 00:19:44'),(15,8,2,'2025-04-25 18:01:51','2025-06-24 18:01:51','2025-04-26 01:01:50'),(16,9,2,'2025-04-27 20:28:33','2025-05-27 20:28:33','2025-04-28 03:28:33'),(17,7,2,'2025-04-27 20:41:51','2025-05-27 20:41:51','2025-04-28 03:41:50'),(19,4,2,'2025-04-28 19:42:25','2025-05-28 19:42:25','2025-04-29 02:42:24');
/*!40000 ALTER TABLE `job_post_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_post_reports`
--

DROP TABLE IF EXISTS `job_post_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_post_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `reported_by` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `job_post_id` (`job_post_id`),
  KEY `reported_by` (`reported_by`),
  CONSTRAINT `job_post_reports_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_post_reports`
--

LOCK TABLES `job_post_reports` WRITE;
/*!40000 ALTER TABLE `job_post_reports` DISABLE KEYS */;
INSERT INTO `job_post_reports` VALUES (2,12,11,'Spam','reviewed','2025-04-25 18:07:10','dfghvbjnm,');
/*!40000 ALTER TABLE `job_post_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_post_reviews`
--

DROP TABLE IF EXISTS `job_post_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_post_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_post_id` (`job_post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `job_post_reviews_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_post_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_post_reviews`
--

LOCK TABLES `job_post_reviews` WRITE;
/*!40000 ALTER TABLE `job_post_reviews` DISABLE KEYS */;
INSERT INTO `job_post_reviews` VALUES (1,12,14,5,'','2025-05-31 11:28:08'),(2,12,17,4,'công việc nhàn, cty thân thiện','2025-05-31 11:29:02');
/*!40000 ALTER TABLE `job_post_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_posts`
--

DROP TABLE IF EXISTS `job_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `requirements` text NOT NULL,
  `interest` text NOT NULL,
  `salary_range` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `post_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('open','closed','pending','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'open',
  `employer_id` int NOT NULL,
  `view_count` int DEFAULT '0',
  `job_opening_count` int DEFAULT '1',
  `apply_deadline` datetime DEFAULT NULL,
  `HighlightType` varchar(50) DEFAULT NULL,
  `PriorityLevel` int DEFAULT '0',
  `IsAutoBoost` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `job_posts_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_posts`
--

LOCK TABLES `job_posts` WRITE;
/*!40000 ALTER TABLE `job_posts` DISABLE KEYS */;
INSERT INTO `job_posts` VALUES (4,'HR Manager','Manage recruitment and employee relations','5+ years in HR management','Great company culture','10-20 triệu','Ho Chi Minh City','2025-03-11 09:55:30','open',4,0,1,'2025-06-19 16:55:30',NULL,0,0),(5,'Marketing Specialist','Plan and execute marketing campaigns','Experience in digital marketing','Exciting marketing projects','20-25 triệu','Hanoi','2025-03-11 09:55:30','open',5,0,1,'2025-06-19 16:55:30',NULL,0,0),(6,'Backend Developer','Xây dựng API và xử lý logic nghiệp vụ.','Có kinh nghiệm với .NET hoặc NodeJS.','Làm việc cùng team giỏi, có mentor.','30-35 triệu','Ho Chi Minh City','2025-04-11 06:12:44','open',16,0,1,'2025-06-19 16:55:30',NULL,0,0),(7,'Chuyên viên Marketing','Lên kế hoạch và triển khai các chiến dịch marketing.','Thành thạo Facebook Ads, Google Ads.','Thưởng theo hiệu quả chiến dịch.','40-45 triệu','Hải Phòng','2025-04-11 06:13:26','closed',15,0,3,'2025-06-19 16:55:30',NULL,0,0),(8,'Nhân viên chăm sóc khách hàng','Tiếp nhận và giải quyết thắc mắc khách hàng.','Kỹ năng giao tiếp tốt, kiên nhẫn.','Môi trường thân thiện, được đào tạo.','10-20 triệu','Đà Nẵng','2025-04-11 06:13:43','open',15,0,5,'2025-06-19 16:55:30',NULL,0,0),(9,'Thiết kế đồ họa','Thiết kế banner, poster, nội dung truyền thông.','Sử dụng tốt Photoshop, Illustrator.','Được làm việc với team sáng tạo.','10-15 triệu','Ho Chi Minh City','2025-04-11 06:14:07','open',16,0,1,'2025-06-19 16:55:30',NULL,0,0),(11,'Frontend Developer','Phát triển giao diện người dùng cho các ứng dụng web.','Thành thạo ReactJS, HTML, CSS.','Tham gia các dự án lớn, hưởng đầy đủ chế độ.','10-18 triệu','Hà Nội','2025-04-11 06:16:11','open',4,0,2,'2025-06-19 16:55:30',NULL,0,0),(12,'Chuyên Viên Kinh Doanh/ Tư Vấn Bảo Hiểm/ Phân Tích Tài Chính','<ul><li>Tìm kiếm, mở rộng và xây dựng nguồn khách hàng tiềm năng</li><li>Hỗ trợ khách hàng làm dịch vụ tại văn phòng, mang đến cho khách hàng sự thuận tiện và trải nghiệm cao cấp nhất</li><li>Hoàn thành chỉ tiêu kinh doanh đặt ra</li><li>Chăm sóc khách hàng sau bán</li></ul><p><strong><em>Nguồn khách hàng công ty hỗ trợ:</em></strong></p><ul><li>Khách hàng tham dự hội thảo/ workshop định kì của công ty</li><li>Khách hàng do quản lý hỗ trợ tùy thời điểm và cam kết cá nhân/team</li></ul><p><br></p>','<ul><li><strong>Độ tuổi: 22 tuổi trở lên (từ 1990 - 2002) - yêu cầu bắt buộc</strong></li><li><strong>Tốt nghiệp CĐ/ĐH</strong>&nbsp;(ưu tiên UV học các chuyên ngành tài chính - ngân hàng, quản trị kinh doanh, kinh tế, quản trị khách sạn, marketing,...)</li><li><strong>Có kỹ năng giao tiếp tốt</strong></li><li>Có kinh nghiệm sales và mở rộng tệp khách hàng là một lợi thế</li><li>Ưu tiên các ứng viên có kinh nghiệm trong ngành bảo hiểm, tài chính, ngân hàng...</li><li>Ứng viên không có kinh nghiệm sẽ được đào tạo</li></ul><p><br></p>','<ul><li><strong>Lương cố định: 16.800.000 VND + Phụ cấp xăng xe/điện thoại 1.800.000 VND + Hoa hồng hấp dẫn</strong></li><li><strong>Thưởng Tháng/Quý/Năm</strong></li><li><strong>Hỗ trợ đào tạo: 3.000.000 VND/tháng</strong></li><li><strong>Cung cấp IPAD để phục vụ công việc</strong></li><li>Được<strong>&nbsp;cung cấp thẻ chăm sóc sức khỏe hằng năm</strong>&nbsp;(quyền lợi khám chữa bệnh, nằm viện tại tất cả các bệnh viện trên toàn quốc)</li><li>Có cơ hội thăng tiến lên cấp quản lý sau 1 năm làm việc</li><li>Được làm việc tại môi trường văn phòng hiện đại, sáng tạo, khơi gợi nguồn cảm hứng</li><li>Được tham gia các khóa đào tạo chuyên nghiệp và bài bản từ các quản lý cấp cao</li></ul><p><br></p>','30-40 triệu','Hà Nội','2025-04-17 11:26:44','closed',15,0,10,'2025-06-19 16:55:30',NULL,0,0),(13,'Chuyên Viên Hoạch Định Tài Chính','<ul><li>Thiết kế và tư vấn các kế hoạch tài chính bảo hiểm tối ưu</li><li>Tìm kiếm cơ hội bán hàng, bán hàng chéo từ các khách hàng hiện có dựa trên nhu cầu của khách hàng</li><li>Xây dựng và duy trì mối quan hệ vững chắc với khách hàng và nhân viên nội bộ</li><li>Tiếp nhận ý kiến và hỗ trợ khách hàng làm dịch vụ tại văn phòng</li><li>Hỗ trợ các event tại văn phòng cũng như các khách hàng tham dự Event (đây là cơ hội để các bạn có thêm khách hàng)</li><li>Xây dựng và mở rộng các mối quan hệ, tư vấn/ hỗ trợ làm hợp đồng cho các khách hàng có cùng nhu cầu</li><li>Chú trọng xây dựng thương hiệu công ty, đem đến những trải nghiệm dịch vụ cao cấp cho khách hàng</li></ul><p><br></p>','<ul><li>Tốt nghiệp đại học/ cao đẳng</li><li>Độ tuổi từ 24-45 tuổi</li><li>Ưu tiên có kinh nghiệm ngành Sales, Tài chính, Ngân hàng, Bảo hiểm, Thẩm mỹ, Du lịch, chứng khoán....</li><li>Đam mê công việc, cầu tiến và mong muốn phát triển dài hạn cùng tổ chức.</li><li>Có tinh thần trách nhiệm với công việc, kiên định và luôn hướng tới hoàn thành chỉ tiêu sớm.</li><li>Luôn đặt chất lượng dịch vụ cho khách hàng lên trên hết và tập trung vào chất lượng tư vấn, rõ ràng, chính xác.</li><li>Ưu tiên các ứng viên có thành tích trong công việc, học tập, tích cực tham gia các hoạt động...</li></ul><p><br></p>','<ul><li>Thu nhập hấp dẫn, không giới hạn, mức thu nhập cố định 12 - 18 - 24 triệu/tháng chưa bao gồm thưởng tháng/quý/năm.</li><li>Thưởng kinh doanh cạnh tranh trên thị trường, trung bình mỗi tháng nhận thêm từ 30 triệu trở lên thưởng tháng.</li><li>Liên tục có các khoản thưởng thúc đẩy kinh doanh trong tháng/quý/năm.</li><li>Có cơ hội trở thành cấp quản lý nếu vượt qua kỳ đánh giá năng lực sau 6 tháng. Xét thăng tiến 6 tháng/ lần</li><li>Hỗ trợ chi phí F&amp;B tiếp khách tại văn phòng với chuyên viên ngoại hạng, được cung cấp nhiều quà tặng cho khách hàng</li><li>Được học hỏi kiến thức về ngành tài chính, bảo hiểm, kỹ năng tư vấn và chăm sóc khách hàng</li><li>Văn phòng làm việc năng động, trẻ trung, hiện đại, không gian mở - khơi gợi nguồn cảm hứng.</li><li>Thường xuyên được tham gia các khóa đào tạo tại AIA, huấn luyện về kỹ năng quản lý cấp cao, nghiệp vụ chuyên sâu từ các chuyên gia hàng đầu và chuyên gia quốc tế.</li><li>Được tham gia các hoạt động công ty: du lịch nước ngoài, outing trip, sự kiện, workshop,...</li><li>Thời gian linh hoạt, phù hợp cho các ứng viên chủ động sắp xếp công việc.</li></ul><p><br></p>','10-15 triệu','Hà Nội','2025-04-24 09:38:24','open',16,0,10,'2025-06-19 16:55:30',NULL,0,0);
/*!40000 ALTER TABLE `job_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `recipient_type` enum('candidate','employer','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sender_id` int DEFAULT NULL,
  `sender_type` enum('candidate','employer','admin','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'system',
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_id`,`recipient_type`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_unread_recipient` (`recipient_id`,`recipient_type`,`is_read`),
  KEY `fk_notifications_sender` (`sender_id`),
  CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (17,15,'employer',14,'candidate','NEW_APPLICATION','Đơn ứng tuyển mới','Bạn có đơn ứng tuyển mới từ Trọng Truyền Nguyễn cho vị trí \"Nhân viên chăm sóc khách hàng\"','{\"job_id\": 8, \"job_title\": \"Nhân viên chăm sóc khách hàng\", \"candidate_id\": 14, \"candidate_name\": \"Trọng Truyền Nguyễn\"}',1,'2025-05-31 17:26:24','2025-05-31 17:26:10','2025-05-31 17:26:24'),(18,15,'employer',NULL,'admin','JOB_REPORTED','Thông báo về bài đăng của bạn','Bài đăng \"Chuyên Viên Kinh Doanh/ Tư Vấn Bảo Hiểm/ Phân Tích Tài Chính\" của bạn đã bị báo cáo với lý do: Spam. Vui lòng kiểm tra và cập nhật nội dung nếu cần thiết.','{\"reason\": \"Spam\", \"job_title\": \"Chuyên Viên Kinh Doanh/ Tư Vấn Bảo Hiểm/ Phân Tích Tài Chính\", \"report_id\": 2, \"reason_text\": \"Spam\"}',1,'2025-05-31 17:50:33','2025-05-31 17:50:21','2025-05-31 17:50:33'),(19,15,'employer',17,'candidate','NEW_FOLLOWER','Người theo dõi mới','Thề Em đã bắt đầu theo dõi công ty Công ty Trọng Truyền','{\"company_id\": 15, \"follower_id\": 17, \"company_name\": \"Công ty Trọng Truyền\", \"follower_name\": \"Thề Em\"}',1,'2025-05-31 17:54:17','2025-05-31 17:54:09','2025-05-31 17:54:16'),(20,17,'candidate',16,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Thiết kế đồ họa\" tại Công ty Một Thành Viên','{\"job_id\": 9, \"job_title\": \"Thiết kế đồ họa\", \"company_name\": \"Công ty Một Thành Viên\", \"interview_id\": 32, \"application_id\": 10, \"interview_date\": \"2025-06-06T03:19:38.7698058+07:00\"}',0,NULL,'2025-06-05 20:19:39','2025-06-05 20:19:39'),(21,15,'employer',25,'candidate','NEW_FOLLOWER','Người theo dõi mới','truyennopro đã bắt đầu theo dõi công ty Công ty Thầy Truyền','{\"company_id\": 15, \"follower_id\": 25, \"company_name\": \"Công ty Thầy Truyền\", \"follower_name\": \"truyennopro\"}',1,'2025-06-15 12:22:36','2025-06-15 08:56:22','2025-06-15 12:22:35'),(22,15,'employer',25,'candidate','NEW_APPLICATION','Đơn ứng tuyển mới','Bạn có đơn ứng tuyển mới từ truyennopro cho vị trí \"Chuyên viên Marketing\"','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"candidate_id\": 25, \"candidate_name\": \"truyennopro\"}',1,'2025-06-15 12:22:36','2025-06-15 10:24:44','2025-06-15 12:22:35'),(23,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Nhân viên chăm sóc khách hàng\" tại Công ty Thầy Truyền','{\"job_id\": 8, \"job_title\": \"Nhân viên chăm sóc khách hàng\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 33, \"application_id\": 17, \"interview_date\": \"2025-06-15T17:28:23.606728+07:00\"}',0,NULL,'2025-06-15 10:28:24','2025-06-15 10:28:23'),(24,15,'employer',14,'candidate','NEW_APPLICATION','Đơn ứng tuyển mới','Bạn có đơn ứng tuyển mới từ Trọng Truyền Nguyễn cho vị trí \"Chuyên viên Marketing\"','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"candidate_id\": 14, \"candidate_name\": \"Trọng Truyền Nguyễn\"}',1,'2025-06-15 12:22:36','2025-06-15 10:30:57','2025-06-15 12:22:35'),(25,15,'employer',15,'candidate','NEW_FOLLOWER','Người theo dõi mới','theemxin đã bắt đầu theo dõi công ty Công ty Thầy Truyền','{\"company_id\": 15, \"follower_id\": 15, \"company_name\": \"Công ty Thầy Truyền\", \"follower_name\": \"theemxin\"}',1,'2025-06-15 12:22:36','2025-06-15 11:47:04','2025-06-15 12:22:35'),(26,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Chuyên viên Marketing\" tại Công ty Thầy Truyền','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 34, \"application_id\": 19, \"interview_date\": \"2025-06-16T09:25:56.8955533+07:00\"}',0,NULL,'2025-06-16 02:25:57','2025-06-16 02:25:57'),(27,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Chuyên viên Marketing\" tại Công ty Thầy Truyền','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 35, \"application_id\": 19, \"interview_date\": \"2025-06-16T09:26:06.0148413+07:00\"}',0,NULL,'2025-06-16 02:26:06','2025-06-16 02:26:06'),(28,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Chuyên viên Marketing\" tại Công ty Thầy Truyền','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 36, \"application_id\": 19, \"interview_date\": \"2025-06-16T09:26:26.1467706+07:00\"}',0,NULL,'2025-06-16 02:26:26','2025-06-16 02:26:26'),(29,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Chuyên Viên Kinh Doanh/ Tư Vấn Bảo Hiểm/ Phân Tích Tài Chính\" tại Công ty Thầy Truyền','{\"job_id\": 12, \"job_title\": \"Chuyên Viên Kinh Doanh/ Tư Vấn Bảo Hiểm/ Phân Tích Tài Chính\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 37, \"application_id\": 16, \"interview_date\": \"2025-06-16T09:30:36.5122785+07:00\"}',0,NULL,'2025-06-16 02:30:37','2025-06-16 02:30:37'),(30,25,'candidate',15,'employer','APPLICATION_STATUS_UPDATE','Cập nhật trạng thái ứng tuyển','Đơn ứng tuyển cho vị trí \"Chuyên viên Marketing\" đã bị từ chối','{\"job_id\": 7, \"status\": \"Rejected\", \"job_title\": \"Chuyên viên Marketing\", \"application_id\": 18}',0,NULL,'2025-06-16 02:32:14','2025-06-16 02:32:14'),(31,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Chuyên viên Marketing\" tại Công ty Thầy Truyền','{\"job_id\": 7, \"job_title\": \"Chuyên viên Marketing\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 38, \"application_id\": 19, \"interview_date\": \"2025-06-16T09:37:12.6855331+07:00\"}',0,NULL,'2025-06-16 02:37:14','2025-06-16 02:37:13'),(32,14,'candidate',15,'employer','INTERVIEW_INVITATION','Lời mời phỏng vấn','Bạn được mời phỏng vấn cho vị trí \"Nhân viên chăm sóc khách hàng\" tại Công ty Thầy Truyền','{\"job_id\": 8, \"job_title\": \"Nhân viên chăm sóc khách hàng\", \"company_name\": \"Công ty Thầy Truyền\", \"interview_id\": 39, \"application_id\": 17, \"interview_date\": \"2025-06-16T09:38:32.5638827+07:00\"}',0,NULL,'2025-06-16 02:38:33','2025-06-16 02:38:32');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetails`
--

DROP TABLE IF EXISTS `orderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetails` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `PackageId` int NOT NULL,
  `JobPostId` int NOT NULL,
  `StartDate` timestamp NOT NULL,
  `EndDate` timestamp NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `OrderId` (`OrderId`),
  KEY `PackageId` (`PackageId`),
  KEY `orderdetails_ibfk_3` (`JobPostId`),
  CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`),
  CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`PackageId`) REFERENCES `packages` (`id`),
  CONSTRAINT `orderdetails_ibfk_3` FOREIGN KEY (`JobPostId`) REFERENCES `job_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetails`
--

LOCK TABLES `orderdetails` WRITE;
/*!40000 ALTER TABLE `orderdetails` DISABLE KEYS */;
INSERT INTO `orderdetails` VALUES (13,15,3,13,'2025-04-24 12:28:55','2025-05-24 12:28:55'),(14,16,3,6,'2025-04-24 13:09:05','2025-05-24 13:09:05'),(15,17,2,12,'2025-04-24 14:54:51','2025-05-24 14:54:51'),(16,18,2,12,'2025-04-24 15:09:55','2025-05-24 15:09:55'),(17,19,1,7,'2025-04-24 15:10:10','2025-05-24 15:10:10'),(43,45,3,9,'2025-04-25 17:19:01','2025-05-25 17:19:01'),(44,46,2,8,'2025-04-25 17:59:50','2025-05-25 17:59:50'),(48,50,2,9,'2025-04-27 20:27:45','2025-05-27 20:27:45'),(49,51,2,7,'2025-04-27 20:40:09','2025-05-27 20:40:09'),(51,56,2,4,'2025-04-28 19:38:08','2025-05-28 19:38:08'),(52,59,3,13,'2025-05-29 05:43:43','2025-06-28 05:43:43'),(59,82,2,8,'2025-06-15 12:47:58','2025-07-15 12:47:58'),(60,85,2,12,'2025-06-15 19:40:12','2025-07-15 19:40:12');
/*!40000 ALTER TABLE `orderdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('pending','paid','failed') DEFAULT 'pending',
  `PackageId` int DEFAULT NULL,
  `PaymentGateway` varchar(20) DEFAULT 'vnpay',
  `TransactionId` bigint DEFAULT NULL,
  `PaymentOrderId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `fk_orders_package` (`PackageId`),
  CONSTRAINT `fk_orders_package` FOREIGN KEY (`PackageId`) REFERENCES `pro_packages` (`id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (15,16,590000.00,'2025-04-24 12:28:55','paid',NULL,'momo',94047119,NULL),(16,16,590000.00,'2025-04-24 13:09:05','paid',NULL,'momo',86394131,NULL),(17,15,290000.00,'2025-04-24 14:54:51','paid',NULL,'momo',30034356,NULL),(18,15,290000.00,'2025-04-24 15:09:55','paid',NULL,'momo',32646575,NULL),(19,15,1000.00,'2025-04-24 15:10:10','paid',NULL,'momo',64921030,NULL),(45,16,590000.00,'2025-04-25 17:19:01','paid',NULL,'vnpay',1745626740643,NULL),(46,15,290000.00,'2025-04-25 17:59:50','paid',NULL,'vnpay',1745629189823,NULL),(50,16,290000.00,'2025-04-27 20:27:45','paid',NULL,'vnpay',1745810864501,NULL),(51,15,290000.00,'2025-04-27 20:40:09','paid',NULL,'vnpay',1745811609020,NULL),(52,15,500000.00,'2025-04-27 23:18:49','pending',1,'vnpay',1745821128676,NULL),(53,15,500000.00,'2025-04-27 23:19:47','paid',1,'vnpay',1745821187186,NULL),(55,4,1200000.00,'2025-04-28 02:35:31','paid',2,'vnpay',1745832930971,NULL),(56,4,290000.00,'2025-04-28 19:38:08','paid',NULL,'vnpay',1745894288058,NULL),(57,16,500000.00,'2025-05-10 12:19:29','pending',1,'vnpay',1746904769369,NULL),(58,15,500000.00,'2025-05-28 10:39:03','paid',1,'vnpay',1748453942768,NULL),(59,16,590000.00,'2025-05-29 05:43:43','paid',NULL,'vnpay',1748522623157,NULL),(80,15,500000.00,'2025-06-15 12:42:01','paid',1,'paypal',1750016520936,'0TS42806AC606074E'),(82,15,290000.00,'2025-06-15 12:47:58','paid',NULL,'paypal',1750016878351,'4646597727946072W'),(83,16,500000.00,'2025-06-15 12:55:29','paid',1,'paypal',1750017328962,'1PD3540013493784Y'),(84,26,500000.00,'2025-06-15 13:16:14','pending',1,'paypal',1750018573563,'9G753125GD8116340'),(85,15,290000.00,'2025-06-15 19:40:12','paid',NULL,'paypal',1750041611749,'00N24594X3219164T');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration_days` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `HighlightType` varchar(50) DEFAULT NULL,
  `PriorityLevel` int DEFAULT '0',
  `AutoBoostDaily` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Miễn phí','Đăng tin tuyển dụng cơ bản, không có ưu tiên hiển thị',0.00,30,'2024-03-01 01:00:00','0',0,0),(2,'Top Pro','Hiển thị nổi bật trong danh sách, gắn nhãn HOT',290000.00,30,'2025-04-23 00:13:33','hot',1,0),(3,'Top Max','Hiển thị đầu danh sách, tự động đẩy tin mỗi ngày, huy hiệu tia sét',590000.00,30,'2024-03-01 01:00:00','gap',2,1);
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pro_packages`
--

DROP TABLE IF EXISTS `pro_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration_days` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pro_packages`
--

LOCK TABLES `pro_packages` WRITE;
/*!40000 ALTER TABLE `pro_packages` DISABLE KEYS */;
INSERT INTO `pro_packages` VALUES (1,'Gói Pro 30 ngày','Đăng 20 bài miễn phí trong 30 ngày, ưu tiên hiển thị bài viết.',500000.00,30,'2025-04-28 13:18:32'),(2,'Gói Pro 90 ngày','Đăng 20 bài miễn phí mỗi tháng trong 90 ngày, ưu tiên cao hơn.',1200000.00,90,'2025-04-28 13:18:32');
/*!40000 ALTER TABLE `pro_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pro_subscriptions`
--

DROP TABLE IF EXISTS `pro_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `package_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `PostsLeftThisPeriod` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `pro_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pro_subscriptions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `pro_packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pro_subscriptions`
--

LOCK TABLES `pro_subscriptions` WRITE;
/*!40000 ALTER TABLE `pro_subscriptions` DISABLE KEYS */;
INSERT INTO `pro_subscriptions` VALUES (1,15,1,'2025-05-28 17:39:38','2025-07-27 17:39:38','2025-04-28 13:20:11',20),(2,16,1,'2025-06-15 19:55:41','2025-07-15 19:55:41','2025-06-16 02:55:40',20);
/*!40000 ALTER TABLE `pro_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `job_post_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_job` (`user_id`,`job_post_id`),
  KEY `job_post_id` (`job_post_id`),
  CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
INSERT INTO `saved_jobs` VALUES (14,25,8,'2025-06-15 08:56:25'),(16,25,12,'2025-06-15 10:25:10');
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_follows`
--

DROP TABLE IF EXISTS `user_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_follows` (
  `user_id` int NOT NULL,
  `employer_id` int NOT NULL,
  `followed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`employer_id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `user_follows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_follows_ibfk_2` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_follows`
--

LOCK TABLES `user_follows` WRITE;
/*!40000 ALTER TABLE `user_follows` DISABLE KEYS */;
INSERT INTO `user_follows` VALUES (15,15,'2025-06-15 11:47:03'),(17,15,'2025-05-31 17:54:09'),(25,15,'2025-06-15 08:56:22');
/*!40000 ALTER TABLE `user_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,'admin'),(3,'candidate'),(1,'employer');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar` text,
  `google_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'User Four','user4@example.com','$2a$11$OrgGzcRaJ/URFu9EoBlLjOpNnzI1ppip0Gqv/Ai3qWi3qWYozxQCK',NULL,NULL,'2025-03-11 09:39:06',1),(5,'User Five','user5@example.com','$2a$11$vSqJdo1Mn0twKBOQAP.u6.Ad/4TvlKyeWCj2rtk9Wsq4a28WqcUYq',NULL,NULL,'2025-03-11 09:39:06',1),(7,'Bob Lee','bob@email.com','$2a$11$.zI1b2hsNGvg9G5PW2utae18oaEonEfEM3iLq5CmKJ2Imz.zSIqUC',NULL,'google_01','2025-03-12 19:50:57',2),(8,'Carol Kim','carol@email.com','$2a$11$ziRoH7aaOqjRzByPyY351.lnwiJv.3Uv7qI9wFFLoOxVjrnC5biLu',NULL,NULL,'2025-03-12 19:50:57',3),(10,'Emma Vu','emma@email.com','$2a$11$0t2y/OWE/DO6TloAQjrtSeTph9D6ucFyBXvz0RlEhTFMwsdyaJEmC',NULL,NULL,'2025-03-12 19:50:57',3),(11,'admin','admin@gmail.com','$2a$11$3qyuJywajdT/.3Qemhf.8.kT0nZwKq4tIpeEwx6R2r06NAoEIlhEa',NULL,NULL,'2025-03-12 13:28:20',2),(14,'Trọng Truyền Nguyễn','trongtruyen04@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocLpLnDat2hH7wyt0XVqgIu4TwZd8emtfr37HINPkTQl9wSaShiv=s96-c','116801440268217281541','2025-03-13 04:28:02',3),(15,'theemxin','theemxin@gmail.com','$2a$11$nqanMDaO6N3dpkVQTuePN.sH8LTVWDAZs1vt6kKC4nCuKczjRMp.G','61fea96c-1388-43fe-b3bd-9c831f42ace4.jpg',NULL,'2025-03-13 06:08:41',1),(16,'Top Trùm','toptrum89@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocJWFKXLeGPlBbe1_takXv9RZ6dwXaboYAVakbNRvP6GT4Z51w=s96-c',NULL,'2025-03-20 20:18:32',1),(17,'Thề Em','emthe87@gmail.com',NULL,'90a50b4b-db02-4c72-a612-47b59cf9d5e6.jpg',NULL,'2025-04-15 10:15:40',3),(18,'Huỳnh Nguyễn Xuân','nguyenhuynhdt37@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocItmXJHZYMmhbJqMyWqrRxq_qt1QSJwzHGyQecDIeU70ndIRYY=s96-c',NULL,'2025-04-23 22:21:00',3),(21,'aaaduoc','truyen@gmail.com','$2a$11$GtAkb5iTPefkIxsssoYyJeqh0sCThxwOlvmNlu2FAJ4UOekitErfe',NULL,NULL,'2025-05-09 00:48:45',1),(22,'trường an võ','gaming13102004@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocKdpGrzYMsuiLQ4VSIHFAjYDV-o4Zg9qkTzyvU83jODAJYsiQ=s96-c',NULL,'2025-05-09 01:02:18',3),(23,'aaaduoc','aaaduoc@gmail.com','$2a$11$RR6C1DgEZZeXBrReo9JcHemqu3ndpE0CMKtxt7zX9R6G2N8gXlJcO',NULL,NULL,'2025-05-28 14:04:51',2),(24,'Lua chua Vinh','luachuavinh@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocJUXjt6MIG7lDklDwM_L9Vr_YpQOTd8IcCl8tl29DPZKryf8Q=s96-c',NULL,'2025-06-05 16:50:21',1),(25,'truyennopro','truyen2903@gmail.com','$2a$11$d7asTzUjCjK0uFxersAJCe7T1nu3vDgfkqgsC5K27xoDNJWM7xzhi','35b65282-b417-4fda-abc2-0faf9eb98456.jpg',NULL,'2025-06-15 01:50:29',3),(26,'truyenemployer','thaytruyen@gmail.com','$2a$11$WZb.179G0reAZ.jX8G2VNOhSARJtHlyBg3wi06a.KOR37N6gjo2km',NULL,NULL,'2025-06-15 12:57:53',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-17 13:16:11
