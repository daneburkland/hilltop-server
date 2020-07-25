# Migration `20200724134204-unique-user-id`

This migration has been generated at 7/24/2020, 1:42:04 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER INDEX "public"."ApiKey_userId" RENAME TO "ApiKey.userId"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200724132538-move-relation-api-key..20200724134204-unique-user-id
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
@@ -40,9 +40,9 @@
 model ApiKey {
   hashed String @unique
   prefix String
   user   User   @relation(fields: [userId], references: [id])
-  userId String
+  userId String @unique
 }
 model Log {
   id        Int      @default(autoincrement()) @id
```


