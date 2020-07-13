# Migration `20200706185355-test-code`

This migration has been generated at 7/6/2020, 6:53:55 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Test" ADD COLUMN "code" text  NOT NULL ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200705190056-init..20200706185355-test-code
--- datamodel.dml
+++ datamodel.dml
@@ -3,16 +3,17 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Test {
   id       Int     @default(autoincrement()) @id
   title    String
   author   User?   @relation(fields: [authorId], references: [id])
   authorId String?
+  code     String
 }
 model User {
   id    String  @id
```


