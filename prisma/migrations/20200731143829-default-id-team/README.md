# Migration `20200731143829-default-id-team`

This migration has been generated at 7/31/2020, 2:38:29 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200730182753-flow..20200731143829-default-id-team
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
@@ -40,9 +40,9 @@
   teamId Int
 }
 model Team {
-  id      Int    @id
+  id      Int    @default(autoincrement()) @id
   name    String
   members User[]
 }
```


