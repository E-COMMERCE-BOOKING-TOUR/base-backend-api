import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766662747551 implements MigrationInterface {
    name = 'Migration1766662747551';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`static_pages\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`content\` longtext NULL, \`meta_title\` varchar(255) NULL, \`meta_description\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_06c8eb8d7d6b0f9cff8dd135a8\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`site_settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`site_title\` varchar(255) NOT NULL DEFAULT 'TripConnect', \`meta_description\` text NULL, \`meta_keywords\` text NULL, \`logo_url\` varchar(500) NULL, \`favicon_url\` varchar(500) NULL, \`banners_square\` text NULL, \`banners_rectangle\` text NULL, \`company_name\` varchar(255) NULL, \`address\` text NULL, \`phone\` varchar(50) NULL, \`email\` varchar(255) NULL, \`facebook_url\` varchar(500) NULL, \`instagram_url\` varchar(500) NULL, \`twitter_url\` varchar(500) NULL, \`youtube_url\` varchar(500) NULL, \`footer_description\` text NULL, \`copyright_text\` varchar(100) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_auth_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_uid\` varchar(255) NOT NULL, \`access_token\` text NOT NULL, \`refresh_token\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`idx_created_at\` (\`created_at\`), INDEX \`idx_user_uid\` (\`user_uid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`permissions\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`permission_name\` varchar(50) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`roles\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`desciption\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`booking_payments\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`payment_method_name\` varchar(255) NOT NULL, \`rule_min\` decimal(12,2) NOT NULL DEFAULT '0.00', \`rule_max\` decimal(12,2) NOT NULL DEFAULT '0.00', \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`currency_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`review_images\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`image_url\` varchar(255) NOT NULL, \`sort_no\` tinyint NULL, \`is_visible\` tinyint NOT NULL DEFAULT 0, \`review_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`review_helpful\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`review_id\` int NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`reviews\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`rating\` tinyint NOT NULL DEFAULT '0', \`content\` text NOT NULL, \`sort_no\` tinyint NULL, \`status\` enum ('pending', 'approved', 'rejected') NOT NULL, \`helpful_count\` int NOT NULL DEFAULT '0', \`is_reported\` tinyint NOT NULL DEFAULT 0, \`user_id\` int NOT NULL, \`tour_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_categories\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sort_no\` tinyint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_policy_rules\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`before_hours\` int NOT NULL, \`fee_pct\` tinyint NOT NULL, \`sort_no\` smallint NOT NULL, \`tour_policy_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_policies\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`supplier_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`suppliers\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(100) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'inactive', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_images\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`image_url\` varchar(255) NOT NULL, \`sort_no\` tinyint NULL, \`is_cover\` tinyint NOT NULL DEFAULT 0, \`tour_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_inventory_holds\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`expires_at\` datetime NULL, \`tour_session_id\` int NOT NULL, \`booking_id\` int NULL, UNIQUE INDEX \`REL_03062ea3bba64608d2f74ca8d6\` (\`booking_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_variant_pax_type_prices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` float NOT NULL, \`tour_variant_id\` int NOT NULL, \`pax_type_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`booking_passengers\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`birthdate\` date NULL, \`phone_number\` varchar(32) NULL, \`booking_item_id\` int NOT NULL, \`pax_type_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_pax_types\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`min_age\` tinyint NOT NULL, \`max_age\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`booking_items\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`total_amount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`unit_price\` decimal(12,2) NOT NULL DEFAULT '0.00', \`quantity\` int NOT NULL DEFAULT '0', \`booking_id\` int NOT NULL, \`variant_id\` int NOT NULL, \`pax_type_id\` int NOT NULL, \`tour_session_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_sessions\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`session_date\` date NOT NULL, \`start_time\` time NULL DEFAULT '00:00:00', \`end_time\` time NULL, \`capacity\` int NULL, \`status\` enum ('open', 'closed', 'full', 'cancelled') NOT NULL DEFAULT 'open', \`tour_variant_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_rule_pax_type_prices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` float NOT NULL, \`tour_price_rule_id\` int NOT NULL, \`pax_type_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_price_rules\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, \`weekday_mask\` tinyint NOT NULL, \`price_type\` enum ('absolute', 'delta') NOT NULL DEFAULT 'absolute', \`priority\` int NOT NULL, \`tour_variant_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_variants\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sort_no\` tinyint NULL, \`min_pax_per_booking\` smallint NOT NULL DEFAULT '1', \`capacity_per_slot\` int NULL, \`tax_included\` tinyint NOT NULL DEFAULT 0, \`cutoff_hours\` int NOT NULL DEFAULT '24', \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`tour_id\` int NOT NULL, \`currency_id\` int NOT NULL, \`tour_policy_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tours\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` mediumtext NOT NULL, \`summary\` text NOT NULL, \`map_url\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`score_rating\` float NULL, \`tax\` float NOT NULL DEFAULT '0', \`is_visible\` tinyint NOT NULL DEFAULT 0, \`published_at\` datetime NULL, \`status\` enum ('draft', 'active', 'inactive') NOT NULL DEFAULT 'inactive', \`duration_hours\` smallint NULL, \`duration_days\` smallint NULL, \`min_pax\` smallint NOT NULL DEFAULT '1', \`max_pax\` smallint NULL, \`meeting_point\` varchar(1000) NULL, \`included\` text NULL, \`not_included\` text NULL, \`highlights\` text NULL, \`languages\` text NULL, \`staff_score\` float NULL DEFAULT '0', \`testimonial\` text NULL, \`map_preview\` varchar(255) NULL, \`cached_min_price\` decimal(15,2) NULL, \`cached_max_price\` decimal(15,2) NULL, \`price_cached_at\` datetime NULL, \`country_id\` int NULL, \`division_id\` int NULL, \`currency_id\` int NULL, \`supplier_id\` int NOT NULL, INDEX \`IDX_b0d61c620db1f027c3adf5afd4\` (\`title\`), INDEX \`IDX_e4527be88f7324dad8411d203f\` (\`address\`), INDEX \`IDX_94932dcb699cd60baed3b20d50\` (\`is_visible\`), INDEX \`IDX_61fdfd09819530dfca44d51820\` (\`status\`), INDEX \`IDX_38877256df5b52735e07edf193\` (\`country_id\`), INDEX \`IDX_9b7d5f67ce15ba17156e634079\` (\`division_id\`), INDEX \`IDX_ad12c44463ed21bba46ef154de\` (\`supplier_id\`), INDEX \`IDX_03e8079cc136d07958cffea4ec\` (\`cached_min_price\`), INDEX \`IDX_682d7e994f5a56740e5eefec09\` (\`cached_max_price\`), UNIQUE INDEX \`IDX_233c6bf8b7c2c897c6eed5373a\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`master_currencies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`symbol\` varchar(5) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`bookings\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`contact_name\` varchar(255) NOT NULL, \`contact_email\` varchar(255) NOT NULL, \`contact_phone\` varchar(32) NOT NULL, \`total_amount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`status\` enum ('pending_info', 'pending_payment', 'pending_confirm', 'pending', 'confirmed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending', \`payment_status\` enum ('unpaid', 'paid', 'refunded', 'partial') NOT NULL DEFAULT 'unpaid', \`user_id\` int NOT NULL, \`currency_id\` int NOT NULL, \`payment_information_id\` int NULL, \`tour_inventory_hold_id\` int NOT NULL, \`booking_payment_id\` int NULL, UNIQUE INDEX \`REL_0f7ee588b034d2c48784d170f8\` (\`tour_inventory_hold_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`payment_infomations\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`brand\` varchar(50) NULL, \`funding\` varchar(50) NULL, \`country\` varchar(10) NULL, \`account_holder\` varchar(255) NULL, \`cvc_check\` varchar(20) NULL, \`customer_id\` varchar(255) NULL, \`fingerprint\` varchar(255) NULL, \`expiry_date\` varchar(10) NULL, \`last4\` varchar(20) NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`users\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`status\` smallint NOT NULL COMMENT '0: unactive, 1: active' DEFAULT '1', \`login_type\` smallint NOT NULL COMMENT '0: account, 1: facebook, 2: google', \`role_id\` int NULL, \`country_id\` int NULL, \`supplier_id\` int NULL, INDEX \`IDX_8340d110121f637ff3ad670729\` (\`uuid\`, \`username\`), UNIQUE INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` (\`uuid\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`master_countries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`iso3\` varchar(10) NOT NULL, \`local_name\` varchar(255) NULL, \`phone_code\` varchar(10) NULL, UNIQUE INDEX \`IDX_cb52ce973e6207645ddf2f75d5\` (\`iso3\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`master_divisions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`level\` mediumint NOT NULL DEFAULT '1', \`name_local\` varchar(255) NOT NULL, \`code\` varchar(100) NULL, \`image_url\` varchar(500) NULL, \`view_count\` int NOT NULL DEFAULT '0', \`parent_id\` int NULL, \`country_id\` int NOT NULL, INDEX \`IDX_89885fe518637b89f5e7041996\` (\`parent_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`notifications\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`type\` varchar(20) NOT NULL, \`is_error\` tinyint NOT NULL DEFAULT 0, \`is_user\` tinyint NOT NULL DEFAULT 0, \`target_group\` enum ('all', 'admin', 'supplier', 'specific') NOT NULL DEFAULT 'specific', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`role_permissions\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`), INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_users_favorites\` (\`tour_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_773f1fbde5c400be3ce142b4e6\` (\`tour_id\`), INDEX \`IDX_066958c513b988c8b8bb3c1d14\` (\`user_id\`), PRIMARY KEY (\`tour_id\`, \`user_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tour_tour_categories\` (\`tour_id\` int NOT NULL, \`tour_category_id\` int NOT NULL, INDEX \`IDX_aee0df7287382906e4c7d2520d\` (\`tour_id\`), INDEX \`IDX_95e0c64360e21335888b116858\` (\`tour_category_id\`), PRIMARY KEY (\`tour_id\`, \`tour_category_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`notification_users\` (\`notification_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_76de091ca3bc0d093cd648a057\` (\`notification_id\`), INDEX \`IDX_e73f283b2e2b842b231ede5e4a\` (\`user_id\`), PRIMARY KEY (\`notification_id\`, \`user_id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_auth_sessions\` ADD CONSTRAINT \`FK_7c3f3708d98d51a64afe91cad1e\` FOREIGN KEY (\`user_uid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_payments\` ADD CONSTRAINT \`FK_ed7bac501329c7f3c00722c988b\` FOREIGN KEY (\`currency_id\`) REFERENCES \`master_currencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_images\` ADD CONSTRAINT \`FK_45b8671ec9f03b6682a52adb120\` FOREIGN KEY (\`review_id\`) REFERENCES \`reviews\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_helpful\` ADD CONSTRAINT \`FK_c20fcbb92d3d3f328bf22bac4cc\` FOREIGN KEY (\`review_id\`) REFERENCES \`reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_helpful\` ADD CONSTRAINT \`FK_5c3d532ea4e3a5015a2cfe5c74e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_728447781a30bc3fcfe5c2f1cdf\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_ad8f030e70663afeb8b9e3c325f\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_policy_rules\` ADD CONSTRAINT \`FK_f1ecd97dc1ecffc0a3c7bbe31fd\` FOREIGN KEY (\`tour_policy_id\`) REFERENCES \`tour_policies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_policies\` ADD CONSTRAINT \`FK_83889ef83952b130653539320ed\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_images\` ADD CONSTRAINT \`FK_1a71ebe72121098dfcc2188ce4e\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_inventory_holds\` ADD CONSTRAINT \`FK_2d8c13b1b4842e11d45cd1168cb\` FOREIGN KEY (\`tour_session_id\`) REFERENCES \`tour_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_inventory_holds\` ADD CONSTRAINT \`FK_03062ea3bba64608d2f74ca8d61\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variant_pax_type_prices\` ADD CONSTRAINT \`FK_699eb23ffa6c130e3e6cac83c90\` FOREIGN KEY (\`tour_variant_id\`) REFERENCES \`tour_variants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variant_pax_type_prices\` ADD CONSTRAINT \`FK_b1a064fe0c5ed291a8846857f7c\` FOREIGN KEY (\`pax_type_id\`) REFERENCES \`tour_pax_types\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_passengers\` ADD CONSTRAINT \`FK_2172299f404dd3844caa449b14a\` FOREIGN KEY (\`booking_item_id\`) REFERENCES \`booking_items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_passengers\` ADD CONSTRAINT \`FK_a3d2b405d49078a15dd29fc23ba\` FOREIGN KEY (\`pax_type_id\`) REFERENCES \`tour_pax_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` ADD CONSTRAINT \`FK_ef31cb9266b7deb19ad60847479\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` ADD CONSTRAINT \`FK_dffd96f5f5d4afcb7a96f9a7205\` FOREIGN KEY (\`variant_id\`) REFERENCES \`tour_variants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` ADD CONSTRAINT \`FK_8a658fe7db96907158e2ed4d2a0\` FOREIGN KEY (\`pax_type_id\`) REFERENCES \`tour_pax_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` ADD CONSTRAINT \`FK_d03c91454e0a7b76c354f85ae5c\` FOREIGN KEY (\`tour_session_id\`) REFERENCES \`tour_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_sessions\` ADD CONSTRAINT \`FK_b041260e7c82ebf51fe3d374f3a\` FOREIGN KEY (\`tour_variant_id\`) REFERENCES \`tour_variants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_rule_pax_type_prices\` ADD CONSTRAINT \`FK_84caeea51602db7f2061ed52ac0\` FOREIGN KEY (\`tour_price_rule_id\`) REFERENCES \`tour_price_rules\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_rule_pax_type_prices\` ADD CONSTRAINT \`FK_f217a2ff363f5206840fbf727eb\` FOREIGN KEY (\`pax_type_id\`) REFERENCES \`tour_pax_types\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_price_rules\` ADD CONSTRAINT \`FK_462221878626187c7e90458ca74\` FOREIGN KEY (\`tour_variant_id\`) REFERENCES \`tour_variants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` ADD CONSTRAINT \`FK_bd64e5768c0a7591272c29e8421\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` ADD CONSTRAINT \`FK_be790b5e6059bcf18c1306a44bf\` FOREIGN KEY (\`currency_id\`) REFERENCES \`master_currencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` ADD CONSTRAINT \`FK_9179b68c06427d9e2c299e4254d\` FOREIGN KEY (\`tour_policy_id\`) REFERENCES \`tour_policies\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD CONSTRAINT \`FK_38877256df5b52735e07edf1938\` FOREIGN KEY (\`country_id\`) REFERENCES \`master_countries\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD CONSTRAINT \`FK_9b7d5f67ce15ba17156e634079e\` FOREIGN KEY (\`division_id\`) REFERENCES \`master_divisions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD CONSTRAINT \`FK_9d8f974e162169c6a690cc50316\` FOREIGN KEY (\`currency_id\`) REFERENCES \`master_currencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD CONSTRAINT \`FK_ad12c44463ed21bba46ef154ded\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_64cd97487c5c42806458ab5520c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_f960015e875a65b06cd17d6f791\` FOREIGN KEY (\`currency_id\`) REFERENCES \`master_currencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_5787fcec0cba8f788bcb6e1c8b1\` FOREIGN KEY (\`payment_information_id\`) REFERENCES \`payment_infomations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_0f7ee588b034d2c48784d170f8b\` FOREIGN KEY (\`tour_inventory_hold_id\`) REFERENCES \`tour_inventory_holds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_975adf37e446d503e54006ceab4\` FOREIGN KEY (\`booking_payment_id\`) REFERENCES \`booking_payments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`payment_infomations\` ADD CONSTRAINT \`FK_d23068fec5b1f6acbda48354e94\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_ae78dc6cb10aa14cfef96b2dd90\` FOREIGN KEY (\`country_id\`) REFERENCES \`master_countries\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a38e4f519c71f366972166ec4cc\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`master_divisions\` ADD CONSTRAINT \`FK_f2c9d97bef781e2e7b7b1b5ee3e\` FOREIGN KEY (\`country_id\`) REFERENCES \`master_countries\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`master_divisions\` ADD CONSTRAINT \`FK_89885fe518637b89f5e70419964\` FOREIGN KEY (\`parent_id\`) REFERENCES \`master_divisions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_users_favorites\` ADD CONSTRAINT \`FK_773f1fbde5c400be3ce142b4e61\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_users_favorites\` ADD CONSTRAINT \`FK_066958c513b988c8b8bb3c1d143\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_tour_categories\` ADD CONSTRAINT \`FK_aee0df7287382906e4c7d2520d2\` FOREIGN KEY (\`tour_id\`) REFERENCES \`tours\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_tour_categories\` ADD CONSTRAINT \`FK_95e0c64360e21335888b1168580\` FOREIGN KEY (\`tour_category_id\`) REFERENCES \`tour_categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification_users\` ADD CONSTRAINT \`FK_76de091ca3bc0d093cd648a0570\` FOREIGN KEY (\`notification_id\`) REFERENCES \`notifications\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification_users\` ADD CONSTRAINT \`FK_e73f283b2e2b842b231ede5e4af\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`notification_users\` DROP FOREIGN KEY \`FK_e73f283b2e2b842b231ede5e4af\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification_users\` DROP FOREIGN KEY \`FK_76de091ca3bc0d093cd648a0570\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_tour_categories\` DROP FOREIGN KEY \`FK_95e0c64360e21335888b1168580\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_tour_categories\` DROP FOREIGN KEY \`FK_aee0df7287382906e4c7d2520d2\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_users_favorites\` DROP FOREIGN KEY \`FK_066958c513b988c8b8bb3c1d143\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_users_favorites\` DROP FOREIGN KEY \`FK_773f1fbde5c400be3ce142b4e61\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`master_divisions\` DROP FOREIGN KEY \`FK_89885fe518637b89f5e70419964\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`master_divisions\` DROP FOREIGN KEY \`FK_f2c9d97bef781e2e7b7b1b5ee3e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a38e4f519c71f366972166ec4cc\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_ae78dc6cb10aa14cfef96b2dd90\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`payment_infomations\` DROP FOREIGN KEY \`FK_d23068fec5b1f6acbda48354e94\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_975adf37e446d503e54006ceab4\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_0f7ee588b034d2c48784d170f8b\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_5787fcec0cba8f788bcb6e1c8b1\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_f960015e875a65b06cd17d6f791\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_64cd97487c5c42806458ab5520c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` DROP FOREIGN KEY \`FK_ad12c44463ed21bba46ef154ded\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` DROP FOREIGN KEY \`FK_9d8f974e162169c6a690cc50316\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` DROP FOREIGN KEY \`FK_9b7d5f67ce15ba17156e634079e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` DROP FOREIGN KEY \`FK_38877256df5b52735e07edf1938\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` DROP FOREIGN KEY \`FK_9179b68c06427d9e2c299e4254d\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` DROP FOREIGN KEY \`FK_be790b5e6059bcf18c1306a44bf\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variants\` DROP FOREIGN KEY \`FK_bd64e5768c0a7591272c29e8421\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_price_rules\` DROP FOREIGN KEY \`FK_462221878626187c7e90458ca74\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_rule_pax_type_prices\` DROP FOREIGN KEY \`FK_f217a2ff363f5206840fbf727eb\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_rule_pax_type_prices\` DROP FOREIGN KEY \`FK_84caeea51602db7f2061ed52ac0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_sessions\` DROP FOREIGN KEY \`FK_b041260e7c82ebf51fe3d374f3a\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` DROP FOREIGN KEY \`FK_d03c91454e0a7b76c354f85ae5c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` DROP FOREIGN KEY \`FK_8a658fe7db96907158e2ed4d2a0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` DROP FOREIGN KEY \`FK_dffd96f5f5d4afcb7a96f9a7205\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_items\` DROP FOREIGN KEY \`FK_ef31cb9266b7deb19ad60847479\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_passengers\` DROP FOREIGN KEY \`FK_a3d2b405d49078a15dd29fc23ba\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_passengers\` DROP FOREIGN KEY \`FK_2172299f404dd3844caa449b14a\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variant_pax_type_prices\` DROP FOREIGN KEY \`FK_b1a064fe0c5ed291a8846857f7c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_variant_pax_type_prices\` DROP FOREIGN KEY \`FK_699eb23ffa6c130e3e6cac83c90\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_inventory_holds\` DROP FOREIGN KEY \`FK_03062ea3bba64608d2f74ca8d61\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_inventory_holds\` DROP FOREIGN KEY \`FK_2d8c13b1b4842e11d45cd1168cb\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_images\` DROP FOREIGN KEY \`FK_1a71ebe72121098dfcc2188ce4e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_policies\` DROP FOREIGN KEY \`FK_83889ef83952b130653539320ed\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_policy_rules\` DROP FOREIGN KEY \`FK_f1ecd97dc1ecffc0a3c7bbe31fd\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_ad8f030e70663afeb8b9e3c325f\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_728447781a30bc3fcfe5c2f1cdf\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_helpful\` DROP FOREIGN KEY \`FK_5c3d532ea4e3a5015a2cfe5c74e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_helpful\` DROP FOREIGN KEY \`FK_c20fcbb92d3d3f328bf22bac4cc\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`review_images\` DROP FOREIGN KEY \`FK_45b8671ec9f03b6682a52adb120\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking_payments\` DROP FOREIGN KEY \`FK_ed7bac501329c7f3c00722c988b\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_auth_sessions\` DROP FOREIGN KEY \`FK_7c3f3708d98d51a64afe91cad1e\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_e73f283b2e2b842b231ede5e4a\` ON \`notification_users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_76de091ca3bc0d093cd648a057\` ON \`notification_users\``,
        );
        await queryRunner.query(`DROP TABLE \`notification_users\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_95e0c64360e21335888b116858\` ON \`tour_tour_categories\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_aee0df7287382906e4c7d2520d\` ON \`tour_tour_categories\``,
        );
        await queryRunner.query(`DROP TABLE \`tour_tour_categories\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_066958c513b988c8b8bb3c1d14\` ON \`tour_users_favorites\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_773f1fbde5c400be3ce142b4e6\` ON \`tour_users_favorites\``,
        );
        await queryRunner.query(`DROP TABLE \`tour_users_favorites\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``,
        );
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_89885fe518637b89f5e7041996\` ON \`master_divisions\``,
        );
        await queryRunner.query(`DROP TABLE \`master_divisions\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_cb52ce973e6207645ddf2f75d5\` ON \`master_countries\``,
        );
        await queryRunner.query(`DROP TABLE \`master_countries\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` ON \`users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_8340d110121f637ff3ad670729\` ON \`users\``,
        );
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`payment_infomations\``);
        await queryRunner.query(
            `DROP INDEX \`REL_0f7ee588b034d2c48784d170f8\` ON \`bookings\``,
        );
        await queryRunner.query(`DROP TABLE \`bookings\``);
        await queryRunner.query(`DROP TABLE \`master_currencies\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_233c6bf8b7c2c897c6eed5373a\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_682d7e994f5a56740e5eefec09\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_03e8079cc136d07958cffea4ec\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_ad12c44463ed21bba46ef154de\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_9b7d5f67ce15ba17156e634079\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_38877256df5b52735e07edf193\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_61fdfd09819530dfca44d51820\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_94932dcb699cd60baed3b20d50\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_e4527be88f7324dad8411d203f\` ON \`tours\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_b0d61c620db1f027c3adf5afd4\` ON \`tours\``,
        );
        await queryRunner.query(`DROP TABLE \`tours\``);
        await queryRunner.query(`DROP TABLE \`tour_variants\``);
        await queryRunner.query(`DROP TABLE \`tour_price_rules\``);
        await queryRunner.query(`DROP TABLE \`tour_rule_pax_type_prices\``);
        await queryRunner.query(`DROP TABLE \`tour_sessions\``);
        await queryRunner.query(`DROP TABLE \`booking_items\``);
        await queryRunner.query(`DROP TABLE \`tour_pax_types\``);
        await queryRunner.query(`DROP TABLE \`booking_passengers\``);
        await queryRunner.query(`DROP TABLE \`tour_variant_pax_type_prices\``);
        await queryRunner.query(
            `DROP INDEX \`REL_03062ea3bba64608d2f74ca8d6\` ON \`tour_inventory_holds\``,
        );
        await queryRunner.query(`DROP TABLE \`tour_inventory_holds\``);
        await queryRunner.query(`DROP TABLE \`tour_images\``);
        await queryRunner.query(`DROP TABLE \`suppliers\``);
        await queryRunner.query(`DROP TABLE \`tour_policies\``);
        await queryRunner.query(`DROP TABLE \`tour_policy_rules\``);
        await queryRunner.query(`DROP TABLE \`tour_categories\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP TABLE \`review_helpful\``);
        await queryRunner.query(`DROP TABLE \`review_images\``);
        await queryRunner.query(`DROP TABLE \`booking_payments\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(
            `DROP INDEX \`idx_user_uid\` ON \`user_auth_sessions\``,
        );
        await queryRunner.query(
            `DROP INDEX \`idx_created_at\` ON \`user_auth_sessions\``,
        );
        await queryRunner.query(`DROP TABLE \`user_auth_sessions\``);
        await queryRunner.query(`DROP TABLE \`site_settings\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_06c8eb8d7d6b0f9cff8dd135a8\` ON \`static_pages\``,
        );
        await queryRunner.query(`DROP TABLE \`static_pages\``);
    }
}
