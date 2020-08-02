# Migration `20200714192817-log`

This migration has been generated at 7/14/2020, 7:28:17 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Log" (
"hostname" text  NOT NULL ,"id" SERIAL,"level" integer  NOT NULL ,"msg" text  NOT NULL ,"pid" integer  NOT NULL ,"testRunId" integer  NOT NULL ,"time" timestamp(3)  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Log" ADD FOREIGN KEY ("testRunId")REFERENCES "public"."TestRun"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200712081652-logs..20200714192817-log
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
@@ -13,8 +13,9 @@
   testId    Int
   result    String
   createdAt DateTime @default(now())
   logs      String[]
+  Log       Log[]
 }
 model Test {
   id        Int       @default(autoincrement()) @id
@@ -32,4 +33,15 @@
   email String  @unique
   name  String?
   tests Test[]
 }
+
+model Log {
+  id        Int      @default(autoincrement()) @id
+  testRun   TestRun  @relation(fields: [testRunId], references: [id])
+  testRunId Int
+  level     Int
+  time      DateTime
+  pid       Int
+  hostname  String
+  msg       String
+}
```


