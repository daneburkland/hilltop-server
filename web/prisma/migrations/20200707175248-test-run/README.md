# Migration `20200707175248-test-run`

This migration has been generated at 7/7/2020, 5:52:48 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."TestRun" (
"id" SERIAL,"result" text  NOT NULL ,"testId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."TestRun" ADD FOREIGN KEY ("testId")REFERENCES "public"."Test"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200706192640-nullable-code..20200707175248-test-run
--- datamodel.dml
+++ datamodel.dml
@@ -3,17 +3,25 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
+model TestRun {
+  id     Int    @default(autoincrement()) @id
+  test   Test   @relation(fields: [testId], references: [id])
+  testId Int
+  result String
+}
+
 model Test {
-  id       Int     @default(autoincrement()) @id
+  id       Int       @default(autoincrement()) @id
   title    String
-  author   User?   @relation(fields: [authorId], references: [id])
+  author   User?     @relation(fields: [authorId], references: [id])
   authorId String?
   code     String
+  runs     TestRun[]
 }
 model User {
   id    String  @id
```


