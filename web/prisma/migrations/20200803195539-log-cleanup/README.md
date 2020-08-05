# Migration `20200803195539-log-cleanup`

This migration has been generated at 8/3/2020, 7:55:39 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Log" DROP COLUMN "hostname",
DROP COLUMN "pid",
DROP COLUMN "time";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200731143829-default-id-team..20200803195539-log-cleanup
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
@@ -53,14 +53,11 @@
   userId String @unique
 }
 model Log {
-  id       Int      @default(autoincrement()) @id
-  run      FlowRun  @relation(fields: [runId], references: [id])
-  runId    Int
-  level    Int
-  time     DateTime
-  pid      Int
-  hostname String
-  msg      String
-  stack    String?
+  id    Int     @default(autoincrement()) @id
+  run   FlowRun @relation(fields: [runId], references: [id])
+  runId Int
+  level Int
+  msg   String
+  stack String?
 }
```


