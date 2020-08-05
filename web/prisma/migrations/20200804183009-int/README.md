# Migration `20200804183009-int`

This migration has been generated at 8/4/2020, 6:30:09 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Log" ALTER COLUMN "level" SET DATA TYPE text ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200803195539-log-cleanup..20200804183009-int
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
@@ -56,8 +56,8 @@
 model Log {
   id    Int     @default(autoincrement()) @id
   run   FlowRun @relation(fields: [runId], references: [id])
   runId Int
-  level Int
+  level String
   msg   String
   stack String?
 }
```


