CREATE TABLE "ORGANIZATION_MEMBERS" (
  "ORGANIZATION_UUID" VARCHAR(40) NOT NULL,
  "USER_ID" INTEGER NOT NULL
);
CREATE PRIMARY KEY ON "ORGANIZATION_MEMBERS" ("ORGANIZATION_UUID", "USER_ID");

CREATE TABLE "ORGANIZATIONS" (
  "UUID" VARCHAR(40) NOT NULL PRIMARY KEY,
  "KEE" VARCHAR(32) NOT NULL,
  "NAME" VARCHAR(64) NOT NULL,
  "DESCRIPTION" VARCHAR(256),
  "URL" VARCHAR(256),
  "AVATAR_URL" VARCHAR(256),
  "GUARDED" BOOLEAN NOT NULL,
  "USER_ID" INTEGER,
  "DEFAULT_PERM_TEMPLATE_PROJECT" VARCHAR(40),
  "DEFAULT_PERM_TEMPLATE_VIEW" VARCHAR(40),
  "CREATED_AT" BIGINT NOT NULL,
  "UPDATED_AT" BIGINT NOT NULL
);
CREATE UNIQUE INDEX "PK_ORGANIZATIONS" ON "ORGANIZATIONS" ("UUID");
CREATE UNIQUE INDEX "ORGANIZATION_KEY" ON "ORGANIZATIONS" ("KEE");

CREATE TABLE "INTERNAL_PROPERTIES" (
  "KEE" VARCHAR(50) NOT NULL PRIMARY KEY,
  "IS_EMPTY" BOOLEAN NOT NULL,
  "TEXT_VALUE" VARCHAR(4000),
  "CLOB_VALUE" CLOB,
  "CREATED_AT" BIGINT
);
CREATE UNIQUE INDEX "UNIQ_INTERNAL_PROPERTIES" ON "INTERNAL_PROPERTIES" ("KEE");

CREATE TABLE "USERS" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "LOGIN" VARCHAR(255),
  "NAME" VARCHAR(200),
  "EMAIL" VARCHAR(100),
  "CRYPTED_PASSWORD" VARCHAR(40),
  "SALT" VARCHAR(40),
  "ACTIVE" BOOLEAN DEFAULT TRUE,
  "SCM_ACCOUNTS" VARCHAR(4000),
  "EXTERNAL_IDENTITY" VARCHAR(255),
  "EXTERNAL_IDENTITY_PROVIDER" VARCHAR(100),
  "IS_ROOT" BOOLEAN NOT NULL,
  "USER_LOCAL" BOOLEAN,
  "CREATED_AT" BIGINT,
  "UPDATED_AT" BIGINT
);
CREATE UNIQUE INDEX "USERS_LOGIN" ON "USERS" ("LOGIN");
CREATE INDEX "USERS_UPDATED_AT" ON "USERS" ("UPDATED_AT");

CREATE TABLE "GROUPS_USERS" (
  "USER_ID" INTEGER,
  "GROUP_ID" INTEGER
);
CREATE INDEX "INDEX_GROUPS_USERS_ON_GROUP_ID" ON "GROUPS_USERS" ("GROUP_ID");
CREATE INDEX "INDEX_GROUPS_USERS_ON_USER_ID" ON "GROUPS_USERS" ("USER_ID");
CREATE UNIQUE INDEX "GROUPS_USERS_UNIQUE" ON "GROUPS_USERS" ("GROUP_ID", "USER_ID");

CREATE TABLE "USER_ROLES" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "ORGANIZATION_UUID" VARCHAR(40) NOT NULL,
  "USER_ID" INTEGER,
  "RESOURCE_ID" INTEGER,
  "ROLE" VARCHAR(64) NOT NULL
);
CREATE INDEX "USER_ROLES_RESOURCE" ON "USER_ROLES" ("RESOURCE_ID");
CREATE INDEX "USER_ROLES_USER" ON "USER_ROLES" ("USER_ID");

CREATE TABLE "GROUPS" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "ORGANIZATION_UUID" VARCHAR(40) NOT NULL,
  "NAME" VARCHAR(500),
  "DESCRIPTION" VARCHAR(200),
  "CREATED_AT" TIMESTAMP,
  "UPDATED_AT" TIMESTAMP
);
