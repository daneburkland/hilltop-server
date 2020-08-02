# Migration `20200722171335-screenshots`

This migration has been generated at 7/22/2020, 5:13:35 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."TestRun" ADD COLUMN "screenshotUrls" text []  ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200715145411-stack..20200722171335-screenshots
--- datamodel.dml
+++ datamodel.dml
@@ -1,20 +1,22 @@
 generator client {
-  provider = "prisma-client-js"
+  provider      = "prisma-client-js"
+  binaryTargets = ["native", "debian-openssl-1.1.x"]
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
-  id        Int      @default(autoincrement()) @id
-  test      Test     @relation(fields: [testId], references: [id])
-  testId    Int
-  result    String
-  createdAt DateTime @default(now())
-  logs      Log[]
+  id             Int      @default(autoincrement()) @id
+  test           Test     @relation(fields: [testId], references: [id])
+  testId         Int
+  result         String
+  createdAt      DateTime @default(now())
+  logs           Log[]
+  screenshotUrls String[]
 }
 model Test {
   id        Int       @default(autoincrement()) @id
```


