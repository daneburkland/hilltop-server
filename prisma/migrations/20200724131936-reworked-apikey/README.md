# Migration `20200724131936-reworked-apikey`

This migration has been generated at 7/24/2020, 1:19:36 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX "public"."User.hashedApiKey"

CREATE TABLE "public"."ApiKey" (
"hashed" text  NOT NULL ,"prefix" text  NOT NULL )

ALTER TABLE "public"."User" DROP COLUMN "hashedApiKey",
ADD COLUMN "apiKeyHashed" text   ;

CREATE UNIQUE INDEX "ApiKey.hashed" ON "public"."ApiKey"("hashed")

CREATE UNIQUE INDEX "User_apiKeyHashed" ON "public"."User"("apiKeyHashed")

ALTER TABLE "public"."User" ADD FOREIGN KEY ("apiKeyHashed")REFERENCES "public"."ApiKey"("hashed") ON DELETE SET NULL  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200724123101-unique-hashed-api-key..20200724131936-reworked-apikey
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
@@ -33,11 +33,18 @@
   id           String  @id
   email        String  @unique
   name         String?
   tests        Test[]
-  hashedApiKey String? @unique
+  apiKey       ApiKey? @relation(fields: [apiKeyHashed], references: [hashed])
+  apiKeyHashed String?
 }
+model ApiKey {
+  hashed String @unique
+  prefix String
+  user   User
+}
+
 model Log {
   id        Int      @default(autoincrement()) @id
   testRun   TestRun  @relation(fields: [testRunId], references: [id])
   testRunId Int
```


