# Migration `20200809003103-external-id`

This migration has been generated at 8/8/2020, 5:31:03 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey"

ALTER TABLE "public"."Flow" DROP CONSTRAINT "Flow_authorId_fkey"

ALTER TABLE "public"."Webhook" DROP CONSTRAINT "Webhook_userId_fkey"

ALTER TABLE "public"."ApiKey" DROP COLUMN "userId",
ADD COLUMN "userId" integer  NOT NULL ;

ALTER TABLE "public"."Flow" DROP COLUMN "authorId",
ADD COLUMN "authorId" integer  NOT NULL ;

ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ADD COLUMN "externalId" text  NOT NULL ,
DROP COLUMN "id",
ADD COLUMN "id" SERIAL,
ADD PRIMARY KEY ("id");

ALTER TABLE "public"."Webhook" DROP COLUMN "userId",
ADD COLUMN "userId" integer  NOT NULL ;

CREATE UNIQUE INDEX "User.externalId_unique" ON "public"."User"("externalId")

ALTER TABLE "public"."ApiKey" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Flow" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Webhook" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200809002959..20200809003103-external-id
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
@@ -22,17 +22,17 @@
 model Flow {
   id        Int       @default(autoincrement()) @id
   title     String
   author    User      @relation(fields: [authorId], references: [id])
-  authorId  String
+  authorId  Int
   code      String
   runs      FlowRun[]
   createdAt DateTime  @default(now())
   updatedAt DateTime  @default(now())
 }
 model User {
-  id         String    @id
+  id         Int       @default(autoincrement()) @id
   externalId String    @unique
   email      String    @unique
   name       String
   flow       Flow[]
@@ -51,9 +51,9 @@
 model ApiKey {
   hashed String @unique
   prefix String
   user   User   @relation(fields: [userId], references: [id])
-  userId String @unique
+  userId Int    @unique
 }
 model Log {
   id    Int     @default(autoincrement()) @id
@@ -69,7 +69,7 @@
   resource  String
   onCreate  Boolean
   onExecute Boolean
   owner     User    @relation(fields: [userId], references: [id])
-  userId    String
+  userId    Int
   url       String
 }
```


