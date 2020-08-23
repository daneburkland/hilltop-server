# Migration `20200820140806-repeat-options`

This migration has been generated at 8/20/2020, 7:08:06 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."RepeatOptions" (
"id" SERIAL,
"jobId" integer  NOT NULL ,
"cron" text   ,
"tz" text   ,
"limit" integer   ,
"every" integer   ,
PRIMARY KEY ("id"))

ALTER TABLE "public"."Flow" ADD COLUMN "repeatOptionsId" integer   ;

CREATE UNIQUE INDEX "RepeatOptions.jobId_unique" ON "public"."RepeatOptions"("jobId")

CREATE UNIQUE INDEX "Flow_repeatOptionsId" ON "public"."Flow"("repeatOptionsId")

ALTER TABLE "public"."Flow" ADD FOREIGN KEY ("repeatOptionsId")REFERENCES "public"."RepeatOptions"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200818220722-string-error..20200820140806-repeat-options
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
@@ -19,17 +19,29 @@
   screenshotUrls String[]
   error          String?
 }
+model RepeatOptions {
+  id    Int     @default(autoincrement()) @id
+  jobId Int     @unique
+  cron  String?
+  tz    String?
+  limit Int?
+  every Int?
+  flow  Flow
+}
+
 model Flow {
-  id        Int       @default(autoincrement()) @id
-  title     String
-  author    User      @relation(fields: [authorId], references: [id])
-  authorId  String
-  code      String
-  runs      FlowRun[]
-  createdAt DateTime  @default(now())
-  updatedAt DateTime  @default(now())
+  id              Int            @default(autoincrement()) @id
+  title           String
+  author          User           @relation(fields: [authorId], references: [id])
+  authorId        String
+  code            String
+  runs            FlowRun[]
+  createdAt       DateTime       @default(now())
+  updatedAt       DateTime       @default(now())
+  repeatOptions   RepeatOptions? @relation(fields: [repeatOptionsId], references: [id])
+  repeatOptionsId Int?
 }
 model User {
   id       String    @id
```


