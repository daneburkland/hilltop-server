# Migration `20200705114620-init`

This migration has been generated at 7/5/2020, 11:46:20 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Post" (
"authorId" text   ,"content" text   ,"id" SERIAL,"published" boolean  NOT NULL DEFAULT false,"title" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Test" (
"authorId" text   ,"id" SERIAL,"title" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."User" (
"email" text  NOT NULL ,"id" text  NOT NULL ,"name" text   ,"password" text  NOT NULL DEFAULT E'',
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")

ALTER TABLE "public"."Post" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."Test" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200705114620-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,33 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+model Post {
+  id        Int     @default(autoincrement()) @id
+  title     String
+  content   String?
+  published Boolean @default(false)
+  author    User?   @relation(fields: [authorId], references: [id])
+  authorId  String?
+}
+
+model Test {
+  id       Int     @default(autoincrement()) @id
+  title    String
+  author   User?   @relation(fields: [authorId], references: [id])
+  authorId String?
+}
+
+model User {
+  id       String  @id
+  email    String  @unique
+  password String  @default("")
+  name     String?
+  posts    Post[]
+  Test     Test[]
+}
```


