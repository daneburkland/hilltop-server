# Migration `20200730182753-flow`

This migration has been generated at 7/30/2020, 6:27:53 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."FlowRun" (
"code" text  NOT NULL ,"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"flowId" integer  NOT NULL ,"id" SERIAL,"result" text  NOT NULL ,"screenshotUrls" text []  ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Flow" (
"authorId" text  NOT NULL ,"code" text  NOT NULL ,"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"title" text  NOT NULL ,"updatedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Log" DROP CONSTRAINT IF EXiSTS "Log_runId_fkey";

ALTER TABLE "public"."User" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "public"."Run" DROP CONSTRAINT IF EXiSTS "Run_testId_fkey";

ALTER TABLE "public"."Test" DROP CONSTRAINT IF EXiSTS "Test_authorId_fkey";

ALTER TABLE "public"."FlowRun" ADD FOREIGN KEY ("flowId")REFERENCES "public"."Flow"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Flow" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Log" ADD FOREIGN KEY ("runId")REFERENCES "public"."FlowRun"("id") ON DELETE CASCADE  ON UPDATE CASCADE

DROP TABLE "public"."Run";

DROP TABLE "public"."Test";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200730144523-run..20200730182753-flow
--- datamodel.dml
+++ datamodel.dml
@@ -4,37 +4,38 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
-model Run {
+model FlowRun {
   id             Int      @default(autoincrement()) @id
-  test           Test     @relation(fields: [testId], references: [id])
-  testId         Int
+  flow           Flow     @relation(fields: [flowId], references: [id])
+  flowId         Int
   result         String
+  code           String
   createdAt      DateTime @default(now())
   logs           Log[]
   screenshotUrls String[]
 }
-model Test {
-  id        Int      @default(autoincrement()) @id
+model Flow {
+  id        Int       @default(autoincrement()) @id
   title     String
-  author    User?    @relation(fields: [authorId], references: [id])
-  authorId  String?
+  author    User      @relation(fields: [authorId], references: [id])
+  authorId  String
   code      String
-  runs      Run[]
-  createdAt DateTime @default(now())
-  updatedAt DateTime @default(now())
+  runs      FlowRun[]
+  createdAt DateTime  @default(now())
+  updatedAt DateTime  @default(now())
 }
 model User {
   id     String  @id
   email  String  @unique
-  name   String?
-  tests  Test[]
+  name   String
+  flow   Flow[]
   apiKey ApiKey?
   team   Team    @relation(fields: [teamId], references: [id])
   teamId Int
 }
@@ -53,9 +54,9 @@
 }
 model Log {
   id       Int      @default(autoincrement()) @id
-  run      Run      @relation(fields: [runId], references: [id])
+  run      FlowRun  @relation(fields: [runId], references: [id])
   runId    Int
   level    Int
   time     DateTime
   pid      Int
```


