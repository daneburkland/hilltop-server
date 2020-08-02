# Migration `20200730144523-run`

This migration has been generated at 7/30/2020, 2:45:23 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Run" (
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"result" text  NOT NULL ,"screenshotUrls" text []  ,"testId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Log" DROP CONSTRAINT IF EXiSTS "Log_testRunId_fkey",
DROP COLUMN "testRunId",
ADD COLUMN "runId" integer  NOT NULL ;

ALTER TABLE "public"."TestRun" DROP CONSTRAINT IF EXiSTS "TestRun_testId_fkey";

ALTER TABLE "public"."Run" ADD FOREIGN KEY ("testId")REFERENCES "public"."Test"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Log" ADD FOREIGN KEY ("runId")REFERENCES "public"."Run"("id") ON DELETE CASCADE  ON UPDATE CASCADE

DROP TABLE "public"."TestRun";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200729175259-required-team..20200730144523-run
--- datamodel.dml
+++ datamodel.dml
@@ -4,12 +4,12 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
-model TestRun {
+model Run {
   id             Int      @default(autoincrement()) @id
   test           Test     @relation(fields: [testId], references: [id])
   testId         Int
   result         String
@@ -18,16 +18,16 @@
   screenshotUrls String[]
 }
 model Test {
-  id        Int       @default(autoincrement()) @id
+  id        Int      @default(autoincrement()) @id
   title     String
-  author    User?     @relation(fields: [authorId], references: [id])
+  author    User?    @relation(fields: [authorId], references: [id])
   authorId  String?
   code      String
-  runs      TestRun[]
-  createdAt DateTime  @default(now())
-  updatedAt DateTime  @default(now())
+  runs      Run[]
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
 }
 model User {
   id     String  @id
@@ -52,14 +52,14 @@
   userId String @unique
 }
 model Log {
-  id        Int      @default(autoincrement()) @id
-  testRun   TestRun  @relation(fields: [testRunId], references: [id])
-  testRunId Int
-  level     Int
-  time      DateTime
-  pid       Int
-  hostname  String
-  msg       String
-  stack     String?
+  id       Int      @default(autoincrement()) @id
+  run      Run      @relation(fields: [runId], references: [id])
+  runId    Int
+  level    Int
+  time     DateTime
+  pid      Int
+  hostname String
+  msg      String
+  stack    String?
 }
```


