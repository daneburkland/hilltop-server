# Migration `20200724132538-move-relation-api-key`

This migration has been generated at 7/24/2020, 1:25:38 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX "public"."User_apiKeyHashed"

ALTER TABLE "public"."ApiKey" ADD COLUMN "userId" text  NOT NULL ;

ALTER TABLE "public"."User" DROP CONSTRAINT IF EXiSTS "User_apiKeyHashed_fkey",
DROP COLUMN "apiKeyHashed";

CREATE UNIQUE INDEX "ApiKey_userId" ON "public"."ApiKey"("userId")

ALTER TABLE "public"."ApiKey" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200724131936-reworked-apikey..20200724132538-move-relation-api-key
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
@@ -29,20 +29,20 @@
   updatedAt DateTime  @default(now())
 }
 model User {
-  id           String  @id
-  email        String  @unique
-  name         String?
-  tests        Test[]
-  apiKey       ApiKey? @relation(fields: [apiKeyHashed], references: [hashed])
-  apiKeyHashed String?
+  id     String  @id
+  email  String  @unique
+  name   String?
+  tests  Test[]
+  apiKey ApiKey?
 }
 model ApiKey {
   hashed String @unique
   prefix String
-  user   User
+  user   User   @relation(fields: [userId], references: [id])
+  userId String
 }
 model Log {
   id        Int      @default(autoincrement()) @id
```


