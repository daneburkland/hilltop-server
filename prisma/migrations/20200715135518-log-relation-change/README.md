# Migration `20200715135518-log-relation-change`

This migration has been generated at 7/15/2020, 1:55:18 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."TestRun" DROP COLUMN "logs";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200714201731-datetime..20200715135518-log-relation-change
--- datamodel.dml
+++ datamodel.dml
@@ -3,19 +3,18 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
   id        Int      @default(autoincrement()) @id
   test      Test     @relation(fields: [testId], references: [id])
   testId    Int
   result    String
   createdAt DateTime @default(now())
-  logs      String[]
-  Log       Log[]
+  logs      Log[]
 }
 model Test {
   id        Int       @default(autoincrement()) @id
```


