# Migration `20200818220722-string-error`

This migration has been generated at 8/18/2020, 3:07:22 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."FlowRun" DROP COLUMN "error",
ADD COLUMN "error" text   ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200818213128-initial..20200818220722-string-error
--- datamodel.dml
+++ datamodel.dml
@@ -4,9 +4,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model FlowRun {
   id             Int      @default(autoincrement()) @id
@@ -16,9 +16,9 @@
   code           String
   createdAt      DateTime @default(now())
   logs           Log[]
   screenshotUrls String[]
-  error          Json?
+  error          String?
 }
 model Flow {
   id        Int       @default(autoincrement()) @id
```


