-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 20, 2026 at 01:32 PM
-- Server version: 5.7.44
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mdelamaz_streaming_income`
--

-- --------------------------------------------------------

--
-- Table structure for table `cost_of_living_csv`
--

CREATE TABLE `cost_of_living_csv` (
  `State` varchar(20) DEFAULT NULL,
  `MetroArea` varchar(16) DEFAULT NULL,
  `MinimumWage` varchar(6) DEFAULT NULL,
  `LivingWage` varchar(6) DEFAULT NULL,
  `Food` varchar(9) DEFAULT NULL,
  `Medical` varchar(9) DEFAULT NULL,
  `Housing` varchar(10) DEFAULT NULL,
  `Transportation` varchar(9) DEFAULT NULL,
  `Civic` varchar(9) DEFAULT NULL,
  `Internet&Mobile` varchar(9) DEFAULT NULL,
  `Other` varchar(9) DEFAULT NULL,
  `State&Federal Taxes` varchar(10) DEFAULT NULL,
  `Pre-taxIncomemin` varchar(10) DEFAULT NULL,
  `Post-taxIncomeMin` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cost_of_living_csv`
--

INSERT INTO `cost_of_living_csv` (`State`, `MetroArea`, `MinimumWage`, `LivingWage`, `Food`, `Medical`, `Housing`, `Transportation`, `Civic`, `Internet&Mobile`, `Other`, `State&Federal Taxes`, `Pre-taxIncomemin`, `Post-taxIncomeMin`) VALUES
('AZ', 'Phoenix', '15', '25', '4167', '3008', '17574', '8633', '3876', '1817', '4992', '8907', '52974', '44067'),
('CA', 'Los Angeles', '17', '31', '4503', '3251', '24894', '8809', '3876', '1513', '4992', '12202', '64041', '51839'),
('CA', 'San Francisco', '17', '34', '5313', '3798', '27462', '8939', '3876', '1947', '4992', '13789', '70117', '56328'),
('CA', 'San Diego', '17', '33', '4487', '3243', '27597', '9308', '3876', '1536', '4992', '13349', '68389', '55040'),
('CO', 'Denver', '15', '27', '4666', '3199', '19817', '8188', '3876', '2032', '4992', '10243', '57013', '46770'),
('District of Columbia', 'Washington, D.C.', '18', '29', '4998', '3500', '23266', '8201', '2583', '1934', '4067', '11798', '60347', '48549'),
('FL', 'Miami', '14', '26', '4832', '2770', '21584', '7706', '2583', '2068', '4067', '8184', '53793', '45610'),
('FL', 'Orlando', '14', '25', '4511', '2977', '19902', '8841', '2583', '1597', '4067', '7856', '52333', '44477'),
('FL', 'Tampa', '14', '24', '4565', '2995', '19214', '8076', '2583', '1597', '4067', '7514', '50611', '43097'),
('GA', 'Atlanta', '7', '26', '4581', '3104', '18958', '9350', '2583', '1686', '4067', '10499', '54827', '44328'),
('IL', 'Chicago', '15', '26', '4627', '3595', '17251', '8162', '3347', '1747', '4549', '10390', '53667', '43277'),
('LA', 'New Orleans', '7', '20', '4448', '3218', '11564', '8348', '2583', '1638', '4067', '6750', '42615', '35864'),
('MA', 'Boston', '15', '32', '5016', '4125', '26094', '8165', '3456', '2199', '4715', '13743', '67513', '53771'),
('MI', 'Detroit', '14', '22', '4276', '3338', '12168', '8560', '3347', '1640', '4549', '8242', '46122', '37880'),
('MN', 'Minneapolis', '11', '24', '4913', '3468', '14906', '8763', '3347', '1592', '4549', '9355', '50893', '41538'),
('NC', 'Charlotte', '7', '24', '4478', '3465', '16473', '8895', '2583', '1514', '4067', '8848', '50323', '41475'),
('NV', 'Las Vegas', '12', '24', '4241', '2715', '16078', '9103', '3876', '1806', '4992', '7525', '50337', '42812'),
('NY', 'New York', '17', '32', '4965', '4375', '26341', '7254', '3456', '1510', '4715', '12893', '65510', '52616'),
('OH', 'Columbus', '11', '22', '4293', '3658', '13283', '8577', '3347', '1494', '4549', '7431', '46632', '39202'),
('OR', 'Portland', '15', '28', '4959', '2767', '18937', '8632', '3876', '2258', '4992', '12174', '58596', '46422'),
('PA', 'Philadelphia', '7', '25', '4713', '3962', '16850', '7989', '3361', '1898', '4644', '9376', '52792', '43416'),
('PA', 'Pittsburgh', '7', '22', '4565', '3691', '11852', '8308', '3456', '1718', '4715', '7970', '46276', '38305'),
('SC', 'Raleigh', '7', '26', '4636', '3354', '18382', '9304', '2583', '1637', '4067', '9701', '53663', '43962'),
('TN', 'Nashville', '7', '25', '4682', '3240', '17656', '9452', '2583', '1855', '4067', '7561', '51095', '43534'),
('TX', 'Austin', '7', '24', '4047', '3075', '17779', '9016', '2583', '1509', '4067', '7245', '49322', '42077'),
('TX', 'Dallas', '7', '24', '4131', '3038', '18416', '9103', '2583', '1442', '4067', '7426', '50205', '42779'),
('TX', 'Houston', '7', '22', '3895', '3240', '15276', '8856', '2583', '1652', '4067', '6592', '46160', '39568'),
('UT', 'Salt Lake City', '7', '25', '4305', '2924', '14906', '9288', '3876', '1581', '4992', '9370', '51242', '41872'),
('VA', 'Richmond', '13', '25', '4560', '3476', '17372', '8596', '2583', '1569', '4067', '9743', '51967', '42223'),
('WA', 'Seattle', '17', '29', '5012', '3049', '23247', '8850', '3876', '2225', '4992', '9508', '60758', '51251');

-- --------------------------------------------------------

--
-- Table structure for table `merch_pricing`
--

CREATE TABLE `merch_pricing` (
  `item_key` varchar(6) DEFAULT NULL,
  `item_name` varchar(8) DEFAULT NULL,
  `production_cost` decimal(4,2) DEFAULT NULL,
  `retail_price` decimal(4,2) DEFAULT NULL,
  `margin_pct` decimal(5,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `merch_pricing`
--

INSERT INTO `merch_pricing` (`item_key`, `item_name`, `production_cost`, `retail_price`, `margin_pct`) VALUES
('tshirt', 'T-Shirt', 9.05, 30.00, 0.6817),
('hoodie', 'Hoodie', 23.60, 60.00, 0.5733),
('vinyl', 'Vinyl LP', 14.25, 31.00, 0.4597);

-- --------------------------------------------------------

--
-- Table structure for table `performance_tiers`
--

CREATE TABLE `performance_tiers` (
  `tier_key` varchar(11) DEFAULT NULL,
  `tier_name` varchar(16) DEFAULT NULL,
  `avg_ticket_price` decimal(5,2) DEFAULT NULL,
  `capacity_hint` varchar(9) DEFAULT NULL,
  `price_range_low` decimal(5,2) DEFAULT NULL,
  `price_range_high` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `performance_tiers`
--

INSERT INTO `performance_tiers` (`tier_key`, `tier_name`, `avg_ticket_price`, `capacity_hint`, `price_range_low`, `price_range_high`) VALUES
('local', 'Local / Open Mic', 12.00, '50-150', 1.00, 20.00),
('emerging', 'Emerging', 30.00, '200-500', 20.00, 60.00),
('developing', 'Developing', 80.00, '500-1500', 60.00, 120.00),
('established', 'Established', 180.00, '2000-8000', 120.00, 300.00),
('headline', 'Headline', 500.00, '10000+', 300.00, 1600.00);

-- --------------------------------------------------------

--
-- Table structure for table `streaming_revenue_benchmarks`
--

CREATE TABLE `streaming_revenue_benchmarks` (
  `Tier` varchar(5) DEFAULT NULL,
  `platform` varchar(9) DEFAULT NULL,
  `views_low` int(7) DEFAULT NULL,
  `cpm_low` varchar(3) DEFAULT NULL,
  `views_high` int(7) DEFAULT NULL,
  `cpm_high` varchar(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `streaming_revenue_benchmarks`
--

INSERT INTO `streaming_revenue_benchmarks` (`Tier`, `platform`, `views_low`, `cpm_low`, `views_high`, `cpm_high`) VALUES
('Nano', 'spotify', 5000, '2.5', 20000, '3.5'),
('Nano', 'youtube', 5000, '5', 20000, '200'),
('Nano', 'instagram', 5000, '10', 20000, '200'),
('Nano', 'tiktok', 5000, '10', 20000, '200'),
('Micro', 'spotify', 20000, '3', 200000, '4'),
('Micro', 'youtube', 20000, '2', 200000, '150'),
('Micro', 'instagram', 20000, '5', 200000, '500'),
('Micro', 'tiktok', 20000, '5', 200000, '250'),
('Mid', 'spotify', 200000, '3.5', 1000000, '4.5'),
('Mid', 'youtube', 200000, '5', 1000000, '250'),
('Mid', 'instagram', 200000, '5', 1000000, '125'),
('Mid', 'tiktok', 200000, '', 1000000, ''),
('Macro', 'spotify', 1000000, '4', 5000000, '5.5'),
('Macro', 'youtube', 1000000, '5', 5000000, '500'),
('Macro', 'instagram', 1000000, '2', 5000000, '100'),
('Macro', 'tiktok', 1000000, '1', 5000000, '25');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_city_monthly`
-- (See below for the actual view)
--
CREATE TABLE `v_city_monthly` (
`State` varchar(20)
,`MetroArea` varchar(16)
,`food_monthly` double(19,2)
,`medical_monthly` double(19,2)
,`housing_monthly` double(19,2)
,`transport_monthly` double(19,2)
,`civic_monthly` double(19,2)
,`internet_monthly` double(19,2)
,`other_monthly` double(19,2)
,`living_wage_monthly` double(19,2)
,`posttax_min_monthly` double(19,2)
,`basket_total_monthly` double(19,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_city_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_city_summary` (
`State` varchar(20)
,`MetroArea` varchar(16)
,`LivingWage` varchar(6)
,`Food` varchar(9)
,`Medical` varchar(9)
,`Housing` varchar(10)
,`Transportation` varchar(9)
,`Civic` varchar(9)
,`Internet&Mobile` varchar(9)
,`Other` varchar(9)
,`Pre-taxIncomemin` varchar(10)
,`Post-taxIncomeMin` varchar(10)
,`basket_total_annual` double(19,2)
,`basket_total_monthly` double(19,2)
,`living_wage_monthly` double(19,2)
,`pretax_min_monthly` double(19,2)
,`posttax_min_monthly` double(19,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_city_tiers`
-- (See below for the actual view)
--
CREATE TABLE `v_city_tiers` (
`State` varchar(20)
,`MetroArea` varchar(16)
,`tier_survival` double(19,2)
,`tier_comfortable` double(19,2)
,`tier_thriving` double(19,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_cpm_by_tier`
-- (See below for the actual view)
--
CREATE TABLE `v_cpm_by_tier` (
`Tier` varchar(5)
,`spotify_cpm_mid` double(19,2)
,`youtube_cpm_mid` double(19,2)
,`instagram_cpm_mid` double(19,2)
,`tiktok_cpm_mid` double(19,2)
,`spotify_cpm_low` varchar(3)
,`spotify_cpm_high` varchar(4)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_cpm_with_mid`
-- (See below for the actual view)
--
CREATE TABLE `v_cpm_with_mid` (
`Tier` varchar(5)
,`platform` varchar(9)
,`views_low` int(7)
,`cpm_low` varchar(3)
,`views_high` int(7)
,`cpm_high` varchar(4)
,`cpm_mid` double(19,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_merch_pricing`
-- (See below for the actual view)
--
CREATE TABLE `v_merch_pricing` (
`item_key` varchar(6)
,`item_name` varchar(8)
,`production_cost` decimal(4,2)
,`retail_price` decimal(4,2)
,`margin_pct` decimal(5,4)
,`profit_per_unit` decimal(6,2)
,`gross_profit_per_unit` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_performance_tiers`
-- (See below for the actual view)
--
CREATE TABLE `v_performance_tiers` (
`tier_key` varchar(11)
,`tier_name` varchar(16)
,`avg_ticket_price` decimal(5,2)
,`capacity_hint` varchar(9)
,`price_range_low` decimal(5,2)
,`price_range_high` decimal(6,2)
,`estimated_revenue_100cap` decimal(10,2)
,`estimated_revenue_500cap` decimal(10,2)
,`estimated_revenue_1000cap` decimal(11,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_city_monthly`
--
DROP TABLE IF EXISTS `v_city_monthly`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_city_monthly`  AS SELECT `cost_of_living_csv`.`State` AS `State`, `cost_of_living_csv`.`MetroArea` AS `MetroArea`, round((`cost_of_living_csv`.`Food` / 12),2) AS `food_monthly`, round((`cost_of_living_csv`.`Medical` / 12),2) AS `medical_monthly`, round((`cost_of_living_csv`.`Housing` / 12),2) AS `housing_monthly`, round((`cost_of_living_csv`.`Transportation` / 12),2) AS `transport_monthly`, round((`cost_of_living_csv`.`Civic` / 12),2) AS `civic_monthly`, round((`cost_of_living_csv`.`Internet&Mobile` / 12),2) AS `internet_monthly`, round((`cost_of_living_csv`.`Other` / 12),2) AS `other_monthly`, round((`cost_of_living_csv`.`LivingWage` / 12),2) AS `living_wage_monthly`, round((`cost_of_living_csv`.`Post-taxIncomeMin` / 12),2) AS `posttax_min_monthly`, round((((((((`cost_of_living_csv`.`Food` + `cost_of_living_csv`.`Medical`) + `cost_of_living_csv`.`Housing`) + `cost_of_living_csv`.`Transportation`) + `cost_of_living_csv`.`Civic`) + `cost_of_living_csv`.`Internet&Mobile`) + `cost_of_living_csv`.`Other`) / 12),2) AS `basket_total_monthly` FROM `cost_of_living_csv` ;

-- --------------------------------------------------------

--
-- Structure for view `v_city_summary`
--
DROP TABLE IF EXISTS `v_city_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_city_summary`  AS SELECT `cost_of_living_csv`.`State` AS `State`, `cost_of_living_csv`.`MetroArea` AS `MetroArea`, `cost_of_living_csv`.`LivingWage` AS `LivingWage`, `cost_of_living_csv`.`Food` AS `Food`, `cost_of_living_csv`.`Medical` AS `Medical`, `cost_of_living_csv`.`Housing` AS `Housing`, `cost_of_living_csv`.`Transportation` AS `Transportation`, `cost_of_living_csv`.`Civic` AS `Civic`, `cost_of_living_csv`.`Internet&Mobile` AS `Internet&Mobile`, `cost_of_living_csv`.`Other` AS `Other`, `cost_of_living_csv`.`Pre-taxIncomemin` AS `Pre-taxIncomemin`, `cost_of_living_csv`.`Post-taxIncomeMin` AS `Post-taxIncomeMin`, round(((((((`cost_of_living_csv`.`Food` + `cost_of_living_csv`.`Medical`) + `cost_of_living_csv`.`Housing`) + `cost_of_living_csv`.`Transportation`) + `cost_of_living_csv`.`Civic`) + `cost_of_living_csv`.`Internet&Mobile`) + `cost_of_living_csv`.`Other`),2) AS `basket_total_annual`, round((((((((`cost_of_living_csv`.`Food` + `cost_of_living_csv`.`Medical`) + `cost_of_living_csv`.`Housing`) + `cost_of_living_csv`.`Transportation`) + `cost_of_living_csv`.`Civic`) + `cost_of_living_csv`.`Internet&Mobile`) + `cost_of_living_csv`.`Other`) / 12),2) AS `basket_total_monthly`, round((`cost_of_living_csv`.`LivingWage` / 12),2) AS `living_wage_monthly`, round((`cost_of_living_csv`.`Pre-taxIncomemin` / 12),2) AS `pretax_min_monthly`, round((`cost_of_living_csv`.`Post-taxIncomeMin` / 12),2) AS `posttax_min_monthly` FROM `cost_of_living_csv` ;

-- --------------------------------------------------------

--
-- Structure for view `v_city_tiers`
--
DROP TABLE IF EXISTS `v_city_tiers`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_city_tiers`  AS SELECT `cost_of_living_csv`.`State` AS `State`, `cost_of_living_csv`.`MetroArea` AS `MetroArea`, round((`cost_of_living_csv`.`Post-taxIncomeMin` / 12),2) AS `tier_survival`, round((`cost_of_living_csv`.`LivingWage` / 12),2) AS `tier_comfortable`, round(((`cost_of_living_csv`.`LivingWage` / 12) * 1.5),2) AS `tier_thriving` FROM `cost_of_living_csv` ;

-- --------------------------------------------------------

--
-- Structure for view `v_cpm_by_tier`
--
DROP TABLE IF EXISTS `v_cpm_by_tier`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_cpm_by_tier`  AS SELECT `streaming_revenue_benchmarks`.`Tier` AS `Tier`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'spotify') then round(((`streaming_revenue_benchmarks`.`cpm_low` + `streaming_revenue_benchmarks`.`cpm_high`) / 2),2) end)) AS `spotify_cpm_mid`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'youtube') then round(((`streaming_revenue_benchmarks`.`cpm_low` + `streaming_revenue_benchmarks`.`cpm_high`) / 2),2) end)) AS `youtube_cpm_mid`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'instagram') then round(((`streaming_revenue_benchmarks`.`cpm_low` + `streaming_revenue_benchmarks`.`cpm_high`) / 2),2) end)) AS `instagram_cpm_mid`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'tiktok') then round(((`streaming_revenue_benchmarks`.`cpm_low` + `streaming_revenue_benchmarks`.`cpm_high`) / 2),2) end)) AS `tiktok_cpm_mid`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'spotify') then `streaming_revenue_benchmarks`.`cpm_low` end)) AS `spotify_cpm_low`, max((case when (`streaming_revenue_benchmarks`.`platform` = 'spotify') then `streaming_revenue_benchmarks`.`cpm_high` end)) AS `spotify_cpm_high` FROM `streaming_revenue_benchmarks` GROUP BY `streaming_revenue_benchmarks`.`Tier` ;

-- --------------------------------------------------------

--
-- Structure for view `v_cpm_with_mid`
--
DROP TABLE IF EXISTS `v_cpm_with_mid`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_cpm_with_mid`  AS SELECT `streaming_revenue_benchmarks`.`Tier` AS `Tier`, `streaming_revenue_benchmarks`.`platform` AS `platform`, `streaming_revenue_benchmarks`.`views_low` AS `views_low`, `streaming_revenue_benchmarks`.`cpm_low` AS `cpm_low`, `streaming_revenue_benchmarks`.`views_high` AS `views_high`, `streaming_revenue_benchmarks`.`cpm_high` AS `cpm_high`, round(((`streaming_revenue_benchmarks`.`cpm_low` + `streaming_revenue_benchmarks`.`cpm_high`) / 2),2) AS `cpm_mid` FROM `streaming_revenue_benchmarks` WHERE (`streaming_revenue_benchmarks`.`cpm_low` is not null) ;

-- --------------------------------------------------------

--
-- Structure for view `v_merch_pricing`
--
DROP TABLE IF EXISTS `v_merch_pricing`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_merch_pricing`  AS SELECT `merch_pricing`.`item_key` AS `item_key`, `merch_pricing`.`item_name` AS `item_name`, `merch_pricing`.`production_cost` AS `production_cost`, `merch_pricing`.`retail_price` AS `retail_price`, `merch_pricing`.`margin_pct` AS `margin_pct`, round((`merch_pricing`.`retail_price` * `merch_pricing`.`margin_pct`),2) AS `profit_per_unit`, round((`merch_pricing`.`retail_price` - `merch_pricing`.`production_cost`),2) AS `gross_profit_per_unit` FROM `merch_pricing` ;

-- --------------------------------------------------------

--
-- Structure for view `v_performance_tiers`
--
DROP TABLE IF EXISTS `v_performance_tiers`;

CREATE ALGORITHM=UNDEFINED DEFINER=`mdelamaz`@`localhost` SQL SECURITY DEFINER VIEW `v_performance_tiers`  AS SELECT `performance_tiers`.`tier_key` AS `tier_key`, `performance_tiers`.`tier_name` AS `tier_name`, `performance_tiers`.`avg_ticket_price` AS `avg_ticket_price`, `performance_tiers`.`capacity_hint` AS `capacity_hint`, `performance_tiers`.`price_range_low` AS `price_range_low`, `performance_tiers`.`price_range_high` AS `price_range_high`, round(((`performance_tiers`.`avg_ticket_price` * 100) * 0.70),2) AS `estimated_revenue_100cap`, round(((`performance_tiers`.`avg_ticket_price` * 500) * 0.70),2) AS `estimated_revenue_500cap`, round(((`performance_tiers`.`avg_ticket_price` * 1000) * 0.70),2) AS `estimated_revenue_1000cap` FROM `performance_tiers` ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
