# Migration `20200809010400-reset-user`

This migration has been generated at 8/8/2020, 6:04:00 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200809005154-default-user-id..20200809010400-reset-user
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
@@ -30,9 +30,9 @@
   updatedAt DateTime  @default(now())
 }
 model User {
-  id      String    @default(uuid()) @id
+  id      String    @id
   email   String    @unique
   name    String
   flow    Flow[]
   apiKey  ApiKey?
```


