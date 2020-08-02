# Migration `20200714200906-log-time-to-int`

This migration has been generated at 7/14/2020, 8:09:06 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Log" DROP COLUMN "time",
ADD COLUMN "time" integer  NOT NULL ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200714192817-log..20200714200906-log-time-to-int
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
   id        Int      @default(autoincrement()) @id
@@ -35,13 +35,13 @@
   tests Test[]
 }
 model Log {
-  id        Int      @default(autoincrement()) @id
-  testRun   TestRun  @relation(fields: [testRunId], references: [id])
+  id        Int     @default(autoincrement()) @id
+  testRun   TestRun @relation(fields: [testRunId], references: [id])
   testRunId Int
   level     Int
-  time      DateTime
+  time      Int
   pid       Int
   hostname  String
   msg       String
 }
```


