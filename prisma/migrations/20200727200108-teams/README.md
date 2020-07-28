# Migration `20200727200108-teams`

This migration has been generated at 7/27/2020, 8:01:08 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP TABLE "public"."Team";

DROP TABLE "public"."Test";

DROP TABLE "public"."TestRun";

DROP TABLE "public"."User";

CREATE TABLE "public"."TestRun" (
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"result" text  NOT NULL ,"screenshotUrls" text []  ,"testId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Test" (
"authorId" text   ,"code" text  NOT NULL ,"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"title" text  NOT NULL ,"updatedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."User" (
"email" text  NOT NULL ,"id" text  NOT NULL ,"name" text   ,"teamId" integer   ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Team" (
"id" integer  NOT NULL ,"name" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."ApiKey" (
"hashed" text  NOT NULL ,"prefix" text  NOT NULL ,"userId" text  NOT NULL )

CREATE TABLE "public"."Log" (
"hostname" text  NOT NULL ,"id" SERIAL,"level" integer  NOT NULL ,"msg" text  NOT NULL ,"pid" integer  NOT NULL ,"stack" text   ,"testRunId" integer  NOT NULL ,"time" timestamp(3)  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")

CREATE UNIQUE INDEX "ApiKey.hashed" ON "public"."ApiKey"("hashed")

CREATE UNIQUE INDEX "ApiKey.userId" ON "public"."ApiKey"("userId")

ALTER TABLE "public"."TestRun" ADD FOREIGN KEY ("testId")REFERENCES "public"."Test"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Test" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."User" ADD FOREIGN KEY ("teamId")REFERENCES "public"."Team"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."ApiKey" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Log" ADD FOREIGN KEY ("testRunId")REFERENCES "public"."TestRun"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200724134204-unique-user-id..20200727200108-teams
--- datamodel.dml
+++ datamodel.dml
@@ -4,9 +4,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
   id             Int      @default(autoincrement()) @id
@@ -34,10 +34,18 @@
   email  String  @unique
   name   String?
   tests  Test[]
   apiKey ApiKey?
+  team   Team?   @relation(fields: [teamId], references: [id])
+  teamId Int?
 }
+model Team {
+  id      Int    @id
+  name    String
+  members User[]
+}
+
 model ApiKey {
   hashed String @unique
   prefix String
   user   User   @relation(fields: [userId], references: [id])
```


