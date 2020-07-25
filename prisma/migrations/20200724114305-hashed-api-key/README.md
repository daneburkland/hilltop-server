# Migration `20200724114305-hashed-api-key`

This migration has been generated at 7/24/2020, 11:43:05 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "hashedApiKey" text   ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200722171335-screenshots..20200724114305-hashed-api-key
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
@@ -29,12 +29,13 @@
   updatedAt DateTime  @default(now())
 }
 model User {
-  id    String  @id
-  email String  @unique
-  name  String?
-  tests Test[]
+  id           String  @id
+  email        String  @unique
+  name         String?
+  tests        Test[]
+  hashedApiKey String?
 }
 model Log {
   id        Int      @default(autoincrement()) @id
```


