# Migration `20200709142620-updated-at`

This migration has been generated at 7/9/2020, 2:26:20 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Test" ADD COLUMN "updatedAt" timestamp(3)  NOT NULL ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200709142015-created-at..20200709142620-updated-at
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
@@ -22,8 +22,9 @@
   authorId  String?
   code      String
   runs      TestRun[]
   createdAt DateTime  @default(now())
+  updatedAt DateTime
 }
 model User {
   id    String  @id
```


