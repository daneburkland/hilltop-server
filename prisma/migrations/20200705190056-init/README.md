# Migration `20200705190056-init`

This migration has been generated at 7/5/2020, 7:00:56 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "password";

ALTER TABLE "public"."Post" DROP CONSTRAINT IF EXiSTS "Post_authorId_fkey";

DROP TABLE "public"."Post";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200705114620-init..20200705190056-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,31 +3,20 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
-model Post {
-  id        Int     @default(autoincrement()) @id
-  title     String
-  content   String?
-  published Boolean @default(false)
-  author    User?   @relation(fields: [authorId], references: [id])
-  authorId  String?
-}
-
 model Test {
   id       Int     @default(autoincrement()) @id
   title    String
   author   User?   @relation(fields: [authorId], references: [id])
   authorId String?
 }
 model User {
-  id       String  @id
-  email    String  @unique
-  password String  @default("")
-  name     String?
-  posts    Post[]
-  Test     Test[]
+  id    String  @id
+  email String  @unique
+  name  String?
+  tests Test[]
 }
```


