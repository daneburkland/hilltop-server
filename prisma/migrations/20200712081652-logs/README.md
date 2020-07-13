# Migration `20200712081652-logs`

This migration has been generated at 7/12/2020, 8:16:52 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."TestRun" ADD COLUMN "logs" text []  ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200709142746-updated-at..20200712081652-logs
--- datamodel.dml
+++ datamodel.dml
@@ -3,17 +3,18 @@
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
+  logs      String[]
 }
 model Test {
   id        Int       @default(autoincrement()) @id
```


