# Migration `20200724123101-unique-hashed-api-key`

This migration has been generated at 7/24/2020, 12:31:01 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "User.hashedApiKey" ON "public"."User"("hashedApiKey")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200724114305-hashed-api-key..20200724123101-unique-hashed-api-key
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
@@ -33,9 +33,9 @@
   id           String  @id
   email        String  @unique
   name         String?
   tests        Test[]
-  hashedApiKey String?
+  hashedApiKey String? @unique
 }
 model Log {
   id        Int      @default(autoincrement()) @id
```


