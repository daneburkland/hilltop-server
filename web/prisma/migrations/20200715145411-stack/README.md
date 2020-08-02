# Migration `20200715145411-stack`

This migration has been generated at 7/15/2020, 2:54:11 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Log" ADD COLUMN "stack" text   ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200715135518-log-relation-change..20200715145411-stack
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
@@ -42,5 +42,6 @@
   time      DateTime
   pid       Int
   hostname  String
   msg       String
+  stack     String?
 }
```


