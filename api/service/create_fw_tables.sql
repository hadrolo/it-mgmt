/* Users ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `users` (
                         `UID` INT(11) NOT NULL AUTO_INCREMENT,
                         `public_id` VARCHAR(50) NOT NULL,
                         `CID` VARCHAR(5) NULL DEFAULT NULL,
                         `language` ENUM('de','en') NULL DEFAULT NULL,
                         `usertype` ENUM('SYSADMIN','ADMIN','USER') NOT NULL DEFAULT 'USER',
                         `username` VARCHAR(20) NOT NULL,
                         `password` VARCHAR(255) NOT NULL DEFAULT 'noDefaultPasswordLoginDoesNotWork',
                         `firstname` VARCHAR(50) NULL DEFAULT NULL,
                         `lastname` VARCHAR(50) NULL DEFAULT NULL,
                         `email` VARCHAR(50) NULL DEFAULT NULL,
                         `postcode` VARCHAR(10) NULL DEFAULT NULL,
                         `info` TEXT NULL DEFAULT NULL,
                         `last_login` DATETIME NULL DEFAULT NULL,
                         `last_ip` VARCHAR(15) NULL DEFAULT NULL,
                         `realname_visible` ENUM('all','registered','nobody') NOT NULL DEFAULT 'nobody',
                         `address_visible` ENUM('all','registered','nobody') NOT NULL DEFAULT 'nobody',
                         `email_visible` ENUM('all','registered','nobody') NOT NULL DEFAULT 'nobody',
                         `active` TINYINT(4) NOT NULL DEFAULT '0',
                         `reset_hash` VARCHAR(255) NULL DEFAULT NULL,
                         `reset_date` DATETIME NULL DEFAULT NULL,
                         PRIMARY KEY (`UID`) USING BTREE,
                         UNIQUE INDEX `username` (`username`) USING BTREE,
                         UNIQUE INDEX `email` (`email`) USING BTREE,
                         INDEX `language` (`language`) USING BTREE
);


/* History -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `history` (
   `HID` INT(11) NOT NULL AUTO_INCREMENT,
   `UID` INT(11) NOT NULL,
   `FK_ID` VARCHAR(45) NOT NULL,
   `FK_name` VARCHAR(45) NOT NULL,
   `FK_table` VARCHAR(45) NOT NULL,
   `created` DATETIME NOT NULL,
   `type` ENUM('insert','update','delete') NOT NULL,
   `data` MEDIUMTEXT NULL DEFAULT NULL,
   PRIMARY KEY (`HID`) USING BTREE,
   INDEX `FK_sys_history_UID` (`UID`) USING BTREE,
   CONSTRAINT `FK_history_users` FOREIGN KEY (`UID`) REFERENCES `users` (`UID`) ON UPDATE RESTRICT ON DELETE RESTRICT
);


/* Files ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `files` (
                         `FID` INT(11) NOT NULL AUTO_INCREMENT,
                         `FK_ID` VARCHAR(10) NOT NULL,
                         `FK_name` VARCHAR(10) NOT NULL,
                         `FK_table` VARCHAR(10) NOT NULL,
                         `doctype` VARCHAR(100) NOT NULL,
                         `deleted` TINYINT(1) NULL DEFAULT '0',
                         `create_date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                         `path` VARCHAR(100) NOT NULL,
                         `fullname` VARCHAR(100) NOT NULL,
                         `name` VARCHAR(100) NOT NULL,
                         `extension` VARCHAR(10) NOT NULL,
                         `mimetype` VARCHAR(50) NOT NULL,
                         `size` MEDIUMINT(9) NOT NULL,
                         `width` INT(11) NULL DEFAULT NULL,
                         `height` INT(11) NULL DEFAULT NULL,
                         `display_name` VARCHAR(80) NULL DEFAULT NULL,
                         `encrypted` TINYINT(1) NULL DEFAULT NULL,
                         `lat` DECIMAL(11,8) NULL DEFAULT NULL,
                         `lng` DECIMAL(11,8) NULL DEFAULT NULL,
                         `create_UID` VARCHAR(80) NULL DEFAULT NULL,
                         PRIMARY KEY (`FID`) USING BTREE,
                         INDEX `file_ibfk_1` (`FK_ID`) USING BTREE
);


/* Favoriten -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `favorite` (
                            `FAVID` INT(11) NOT NULL AUTO_INCREMENT,
                            `UID` INT(11) NOT NULL,
                            `name` VARCHAR(50) NOT NULL,
                            `path` VARCHAR(100) NOT NULL,
                            PRIMARY KEY (`FAVID`) USING BTREE,
                            INDEX `UID` (`UID`) USING BTREE,
                            CONSTRAINT `FK_favorite_UID` FOREIGN KEY (`UID`) REFERENCES `users` (`UID`) ON UPDATE RESTRICT ON DELETE RESTRICT
);


/* Log -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `log` (
                       `ULID` INT(11) NOT NULL AUTO_INCREMENT,
                       `UID` INT(11) NULL DEFAULT NULL,
                       `APPID` VARCHAR(10) NULL DEFAULT NULL,
                       `environment` VARCHAR(100) NULL DEFAULT NULL,
                       `type` ENUM('login','logout','login-error','info','error','error-file','insert','insert-file','update','delete','delete-file','exception','access-violation','registration-error') NULL DEFAULT NULL,
                       `c_component` VARCHAR(80) NULL DEFAULT NULL,
                       `c_method` VARCHAR(80) NULL DEFAULT NULL,
                       `s_controller` VARCHAR(80) NULL DEFAULT NULL,
                       `s_action` VARCHAR(80) NULL DEFAULT NULL,
                       `text` TEXT NULL DEFAULT NULL,
                       `ip` VARCHAR(15) NULL DEFAULT NULL,
                       `browser` VARCHAR(255) NULL DEFAULT NULL,
                       `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (`ULID`) USING BTREE,
                       INDEX `UID` (`UID`) USING BTREE
);


/* Mail Log ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE `mail_log` (
                            `MLID` INT(11) NOT NULL AUTO_INCREMENT,
                            `UID` INT(11) NULL DEFAULT NULL,
                            `from_name` VARCHAR(50) NOT NULL,
                            `from_mail` VARCHAR(50) NOT NULL,
                            `recipients` TINYTEXT NOT NULL,
                            `subject` VARCHAR(100) NOT NULL,
                            `message` TEXT NOT NULL,
                            `type` VARCHAR(20) NOT NULL,
                            `ical_data` TEXT NULL DEFAULT NULL,
                            `cc` TINYTEXT NULL DEFAULT NULL,
                            `bcc` TINYTEXT NULL DEFAULT NULL,
                            `attachments` INT(11) NOT NULL,
                            `embedded_images` INT(11) NOT NULL,
                            `priority` INT(11) NOT NULL,
                            `result` TINYINT(1) NOT NULL,
                            `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (`MLID`) USING BTREE,
                            INDEX `I_sys_mail_log` (`UID`) USING BTREE
);


/* Storage ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */
CREATE TABLE `storage` (
                           `STID` INT(11) NOT NULL AUTO_INCREMENT,
                           `UID` INT(11) NOT NULL,
                           `s_key` VARCHAR(50) NOT NULL,
                           `s_type` VARCHAR(50) NOT NULL,
                           `s_value` VARCHAR(255) NULL DEFAULT NULL,
                           PRIMARY KEY (`STID`) USING BTREE,
                           UNIQUE INDEX `UID_s_key_s_type` (`UID`, `s_key`, `s_type`) USING BTREE
);


/* Rechte 01 - Berechtigungsgruppen - Basis aller Rechte -------------------------------------------------------------------------------------------------------------------------------------------- */
CREATE TABLE `rights_groups`
(
    `RGID`        VARCHAR(20) NOT NULL,
    `description` VARCHAR(100) NULL DEFAULT NULL,
    PRIMARY KEY (`RGID`) USING BTREE
);


/* Rechte 02 - verknüpfte Rechte -------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
CREATE TABLE `rights_alias`
(
    `RID_alias`  INT(11) NULL DEFAULT NULL,
    `RID_client` INT(11) NULL DEFAULT NULL,
    INDEX        `FK_RID_alias_M_rights_alias` (`RID_alias`) USING BTREE,
    INDEX        `FK_RID_client_M_rights_alias` (`RID_client`) USING BTREE,
    CONSTRAINT `FK_RID_alias_M_rights_alias` FOREIGN KEY (`RID_alias`) REFERENCES `rights` (`RID`) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT `FK_RID_client_M_rights_alias` FOREIGN KEY (`RID_client`) REFERENCES `rights` (`RID`) ON UPDATE RESTRICT ON DELETE RESTRICT
);

INSERT INTO `rights_alias` (`RID_alias`, `RID_client`) VALUES
                                                           (82, 77),
                                                           (82, 57),
                                                           (82, 47),
                                                           (82, 49),
                                                           (82, 50),
                                                           (82, 61),
                                                           (82, 51),
                                                           (82, 59),
                                                           (82, 45),
                                                           (82, 44),
                                                           (82, 46),
                                                           (82, 52),
                                                           (82, 62),
                                                           (82, 53),
                                                           (82, 55),
                                                           (82, 56),
                                                           (82, 54),
                                                           (82, 58),
                                                           (82, 48),
                                                           (82, 60),
                                                           (82, 63);


/* Rechte 03 - Rechte die nur auf Benutzerebene angewendet werden (noch nicht fertig) --------------------------------------------------------------------------------------------------------------- */
CREATE TABLE `rights_users`
(
    `RUID` INT(11) NOT NULL AUTO_INCREMENT,
    `RID`  INT(11) NOT NULL DEFAULT '0',
    `UID`  INT(11) NOT NULL DEFAULT '0',
    PRIMARY KEY (`RUID`) USING BTREE
);


/* Rechte 04 - Usertypen Rechte - Hier werden alle den Usertypen zugewiesenen Rechte gespeichert */
CREATE TABLE `rights_usertypes`
(
    `RTID`     INT(11) NOT NULL AUTO_INCREMENT,
    `RID`      INT(11) NOT NULL DEFAULT '0',
    `usertype` VARCHAR(200) NOT NULL,
    PRIMARY KEY (`RTID`) USING BTREE,
    INDEX      `FK_rights_usertypes_RID` (`RID`) USING BTREE,
    CONSTRAINT `FK_rights_usertypes_RID` FOREIGN KEY (`RID`) REFERENCES `rights` (`RID`) ON UPDATE RESTRICT ON DELETE RESTRICT
);

/* Rechte 05 - Framework Berechtigungsgruppen - Diese Rechte müssen immer importiert werden --------------------------------------------------------------------------------------------------------- */
INSERT INTO rights_groups (RGID, description) VALUES('Authentication', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Email', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Favorite', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('File', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Form', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('History', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Layout', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Logfile', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Lookupform', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Map', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Right', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Storage', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Table', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Tag', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Token', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('User', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Widget', NULL);
INSERT INTO rights_groups (RGID, description) VALUES('Dashboard', NULL);

/* Rechte 06 - Rechte ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
CREATE TABLE `rights` (
                          `RID` INT(11) NOT NULL AUTO_INCREMENT,
                          `RGID` VARCHAR(20) NULL DEFAULT NULL,
                          `type` ENUM('API','CLIENT','ALIAS') NULL DEFAULT NULL,
                          `name` VARCHAR(50) NOT NULL,
                          `module` VARCHAR(50) NULL DEFAULT NULL,
                          `class` VARCHAR(50) NULL DEFAULT NULL,
                          `method` VARCHAR(50) NULL DEFAULT NULL,
                          `i18n` VARCHAR(100) NULL DEFAULT NULL,
                          `description` VARCHAR(100) NULL DEFAULT NULL,
                          PRIMARY KEY (`RID`) USING BTREE,
                          UNIQUE INDEX `RGID_type_name_module_class_method` (`RGID`, `type`, `name`, `module`, `class`, `method`) USING BTREE,
                          CONSTRAINT `FK_rights_RGID` FOREIGN KEY (`RGID`) REFERENCES `rights_groups` (`RGID`) ON UPDATE RESTRICT ON DELETE RESTRICT
);


/* Rechte 06 - Framework API-Rechte - Diese Rechte müssen immer importiert werden ------------------------------------------------------------------------------------------------------------------- */
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (1, 'Authentication', 'API', 'login', 'Framework', 'Auth', 'login', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (2, 'Authentication', 'API', 'logout', 'Framework', 'Auth', 'logout', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (3, 'Authentication', 'API', 'isLoggedIn', 'Framework', 'Auth', 'isLoggedIn', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (4, 'Authentication', 'API', 'resetPassword', 'Framework', 'Auth', 'resetPassword', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (5, 'Authentication', 'API', 'updatePassword', 'Framework', 'Auth', 'updatePassword', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (6, 'Authentication', 'API', 'checkHash', 'Framework', 'Auth', 'checkHash', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (7, 'Authentication', 'API', 'registerLookup', 'Framework', 'Auth', 'registerLookup', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (8, 'Authentication', 'API', 'register', 'Framework', 'Auth', 'register', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (9, 'Authentication', 'API', 'checkValueExists', 'Framework', 'Auth', 'checkValueExists', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (10, 'Authentication', 'API', 'checkRegistrationHash', 'Framework', 'Auth', 'checkRegistrationHash', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (11, 'Email', 'API', 'send', 'Framework', 'Email', 'send', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (12, 'Favorite', 'API', 'get', 'Framework', 'Favorite', 'get', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (13, 'Favorite', 'API', 'listAll', 'Framework', 'Favorite', 'listAll', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (14, 'Favorite', 'API', 'save', 'Framework', 'Favorite', 'save', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (15, 'Favorite', 'API', 'update', 'Framework', 'Favorite', 'update', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (16, 'Favorite', 'API', 'delete', 'Framework', 'Favorite', 'delete', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (17, 'File', 'API', 'update', 'Framework', 'File', 'update', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (18, 'File', 'API', 'getUploadMaxFilesize', 'Framework', 'File', 'getUploadMaxFilesize', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (19, 'File', 'API', 'checkPicExist', 'Framework', 'File', 'checkPicExist', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (20, 'File', 'API', 'countAlreadyUploaded', 'Framework', 'File', 'countAlreadyUploaded', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (21, 'File', 'API', 'getFile', 'Framework', 'File', 'getFile', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (22, 'File', 'API', 'listUploadedFiles', 'Framework', 'File', 'listUploadedFiles', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (23, 'File', 'API', 'deleteFile', 'Framework', 'File', 'deleteFile', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (24, 'File', 'API', 'deleteFileUid', 'Framework', 'File', 'deleteFileUid', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (25, 'File', 'API', 'deleteFiles', 'Framework', 'File', 'deleteFiles', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (26, 'File', 'API', 'upload', 'Framework', 'File', 'upload', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (27, 'File', 'API', 'rotateImageSet', 'Framework', 'File', 'rotateImageSet', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (28, 'File', 'API', 'encrypt', 'Framework', 'File', 'encrypt', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (29, 'File', 'API', 'decrypt', 'Framework', 'File', 'decrypt', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (30, 'Form', 'API', 'getFormInfo', 'Framework', 'Form', 'getFormInfo', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (31, 'Form', 'API', 'getData', 'Framework', 'Form', 'getData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (32, 'Form', 'API', 'insertData', 'Framework', 'Form', 'insertData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (33, 'Form', 'API', 'updateData', 'Framework', 'Form', 'updateData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (34, 'Form', 'API', 'deleteData', 'Framework', 'Form', 'deleteData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (35, 'History', 'API', 'getData', 'Framework', 'History', 'getData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (36, 'Logfile', 'API', 'write', 'Framework', 'Logfile', 'write', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (37, 'Logfile', 'API', 'getEntry', 'Framework', 'Logfile', 'getEntry', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (38, 'Lookupform', 'API', 'getParentData', 'Framework', 'Lookupform', 'getParentData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (39, 'Lookupform', 'API', 'ListAll', 'Framework', 'Lookupform', 'ListAll', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (40, 'Lookupform', 'API', 'insertData', 'Framework', 'Lookupform', 'insertData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (41, 'Lookupform', 'API', 'setData', 'Framework', 'Lookupform', 'setData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (42, 'Lookupform', 'API', 'deleteData', 'Framework', 'Lookupform', 'deleteData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (43, 'Right', 'API', 'loadCurrentRights', 'Framework', 'Right', 'loadCurrentRights', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (44, 'Right', 'API', 'listRightsAssigned', 'Framework', 'Right', 'listRightsAssigned', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (45, 'Right', 'API', 'listRightGroupsUnassigned', 'Framework', 'Right', 'listRightGroupsUnassigned', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (46, 'Right', 'API', 'listRightsUnassigned', 'Framework', 'Right', 'listRightsUnassigned', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (47, 'Right', 'API', 'assignUsertypeRight', 'Framework', 'Right', 'assignUsertypeRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (48, 'Right', 'API', 'unassignUsertypeRight', 'Framework', 'Right', 'unassignUsertypeRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (49, 'Right', 'API', 'copyUsertypeRight', 'Framework', 'Right', 'copyUsertypeRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (50, 'Right', 'API', 'deleteAllUsertypeRights', 'Framework', 'Right', 'deleteAllUsertypeRights', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (51, 'Right', 'API', 'insertAllUsertypeRights', 'Framework', 'Right', 'insertAllUsertypeRights', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (52, 'Right', 'API', 'listUsers', 'Framework', 'Right', 'listUsers', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (53, 'Right', 'API', 'loadRight', 'Framework', 'Right', 'loadRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (54, 'Right', 'API', 'loadRightList', 'Framework', 'Right', 'loadRightList', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (55, 'Right', 'API', 'loadRightAliases', 'Framework', 'Right', 'loadRightAliases', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (56, 'Right', 'API', 'loadRightGroupList', 'Framework', 'Right', 'loadRightGroupList', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (57, 'Right', 'API', 'assignRightAlias', 'Framework', 'Right', 'assignRightAlias', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (58, 'Right', 'API', 'unassignRightAlias', 'Framework', 'Right', 'unassignRightAlias', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (59, 'Right', 'API', 'insertRight', 'Framework', 'Right', 'insertRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (60, 'Right', 'API', 'updateRight', 'Framework', 'Right', 'updateRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (61, 'Right', 'API', 'deleteRight', 'Framework', 'Right', 'deleteRight', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (62, 'Right', 'API', 'loadAllUsertypeRights', 'Framework', 'Right', 'loadAllUsertypeRights', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (63, 'Right', 'API', 'updateUsertypeRights', 'Framework', 'Right', 'updateUsertypeRights', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (64, 'Table', 'API', 'groupAlpha', 'Framework', 'Table', 'groupAlpha', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (65, 'Table', 'API', 'listAll', 'Framework', 'Table', 'listAll', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (66, 'Table', 'API', 'getTableInfo', 'Framework', 'Table', 'getTableInfo', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (67, 'Table', 'API', 'exportXLS', 'Framework', 'Table', 'exportXLS', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (68, 'Tag', 'API', 'listAll', 'Framework', 'Tag', 'listAll', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (69, 'Tag', 'API', 'save', 'Framework', 'Tag', 'save', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (70, 'Tag', 'API', 'delete', 'Framework', 'Tag', 'delete', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (71, 'Token', 'API', 'newAnonymous', 'Framework', 'Token', 'newAnonymous', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (72, 'Token', 'API', 'refreshToken', 'Framework', 'Token', 'refreshToken', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (73, 'User', 'API', 'writeLanguage', 'Framework', 'User', 'writeLanguage', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (74, 'Storage', 'API', 'setData', 'Framework', 'Storage', 'setData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (75, 'Storage', 'API', 'getData', 'Framework', 'Storage', 'getData', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (76, 'Storage', 'API', 'getAuto', 'Framework', 'Storage', 'getAuto', NULL, NULL);
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (77, 'Layout', 'CLIENT', 'openRights', '', '', '', NULL, 'Sidebar - Open Right Mgmt');
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (78, 'Dashboard', 'CLIENT', 'openSettings', '', '', '', NULL, 'Sidebar - Open Right Mgmt');
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (80, 'Dashboard', 'CLIENT', 'openSettings', 'FRAMEWORK', NULL, NULL, NULL, 'Toolbar - openSettings');
INSERT INTO rights (RID, RGID, `type`, name, module, class, `method`, i18n, description)
VALUES (81, 'User', 'CLIENT', 'openUserList', 'FRAMEWORK', NULL, '', NULL, 'Sidebar - Open Userlist');
INSERT INTO `rights` (`RID`, `RGID`, `type`, `name`, `module`, `class`, `method`, `i18n`, `description`)
VALUES (82, 'Right', 'ALIAS', 'rwRights', 'FRAMEWORK', NULL, NULL, NULL, 'rechte erstellen/bearbeiten ');
