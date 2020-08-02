# Migration `20200709142015-created-at`

This migration has been generated at 7/9/2020, 2:20:15 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Test" ADD COLUMN "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."TestRun" ADD COLUMN "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200707175248-test-run..20200709142015-created-at
--- datamodel.dml
+++ datamodel.dml
@@ -3,25 +3,27 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
-  id     Int    @default(autoincrement()) @id
-  test   Test   @relation(fields: [testId], references: [id])
-  testId Int
-  result String
+  id        Int      @default(autoincrement()) @id
+  test      Test     @relation(fields: [testId], references: [id])
+  testId    Int
+  result    String
+  createdAt DateTime @default(now())
 }
 model Test {
-  id       Int       @default(autoincrement()) @id
-  title    String
-  author   User?     @relation(fields: [authorId], references: [id])
-  authorId String?
-  code     String
-  runs     TestRun[]
+  id        Int       @default(autoincrement()) @id
+  title     String
+  author    User?     @relation(fields: [authorId], references: [id])
+  authorId  String?
+  code      String
+  runs      TestRun[]
+  createdAt DateTime  @default(now())
 }
 model User {
   id    String  @id
```


