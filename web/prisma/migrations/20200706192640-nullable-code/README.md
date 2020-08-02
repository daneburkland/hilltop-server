# Migration `20200706192640-nullable-code`

This migration has been generated at 7/6/2020, 7:26:40 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Test" ALTER COLUMN "code" SET NOT NULL;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200706190442-optional-code..20200706192640-nullable-code
--- datamodel.dml
+++ datamodel.dml
@@ -3,17 +3,17 @@
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
-  code     String?
+  code     String
 }
 model User {
   id    String  @id
```


