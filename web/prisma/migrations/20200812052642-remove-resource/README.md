# Migration `20200812052642-remove-resource`

This migration has been generated at 8/11/2020, 10:26:42 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "Noun" AS ENUM ('Flow');

CREATE TYPE "Verb" AS ENUM ('created', 'updated', 'executed', 'errored');

CREATE TABLE "public"."FlowRun" (
"id" SERIAL,
"flowId" integer  NOT NULL ,
"result" text  NOT NULL ,
"code" text  NOT NULL ,
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
"screenshotUrls" text []  ,
PRIMARY KEY ("id"))

CREATE TABLE "public"."Flow" (
"id" SERIAL,
"title" text  NOT NULL ,
"authorId" text  NOT NULL ,
"code" text  NOT NULL ,
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY ("id"))

CREATE TABLE "public"."User" (
"id" text  NOT NULL ,
"email" text  NOT NULL ,
"name" text  NOT NULL ,
"teamId" integer  NOT NULL ,
PRIMARY KEY ("id"))

CREATE TABLE "public"."Team" (
"id" SERIAL,
"name" text  NOT NULL ,
PRIMARY KEY ("id"))

CREATE TABLE "public"."ApiKey" (
"hashed" text  NOT NULL ,
"prefix" text  NOT NULL ,
"userId" text  NOT NULL )

CREATE TABLE "public"."Log" (
"id" SERIAL,
"runId" integer  NOT NULL ,
"level" text  NOT NULL ,
"msg" text  NOT NULL ,
"stack" text   ,
PRIMARY KEY ("id"))

CREATE TABLE "public"."Webhook" (
"id" SERIAL,
"ownerId" text  NOT NULL ,
"url" text  NOT NULL ,
"eventNoun" "Noun" NOT NULL ,
"eventVerb" "Verb" NOT NULL ,
PRIMARY KEY ("id"))

CREATE TABLE "public"."Event" (
"noun" "Noun" NOT NULL DEFAULT E'Flow',
"verb" "Verb" NOT NULL ,
PRIMARY KEY ("noun","verb"))

CREATE UNIQUE INDEX "User.email_unique" ON "public"."User"("email")

CREATE UNIQUE INDEX "ApiKey.hashed_unique" ON "public"."ApiKey"("hashed")

CREATE UNIQUE INDEX "ApiKey.userId_unique" ON "public"."ApiKey"("userId")

ALTER TABLE "public"."FlowRun" ADD FOREIGN KEY ("flowId")REFERENCES "public"."Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Flow" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."User" ADD FOREIGN KEY ("teamId")REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."ApiKey" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Log" ADD FOREIGN KEY ("runId")REFERENCES "public"."FlowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Webhook" ADD FOREIGN KEY ("ownerId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Webhook" ADD FOREIGN KEY ("eventNoun", "eventVerb")REFERENCES "public"."Event"("noun","verb") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200812051832-events..20200812052642-remove-resource
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
@@ -64,9 +64,8 @@
 }
 model Webhook {
   id        Int    @default(autoincrement()) @id
-  resource  String
   owner     User   @relation(fields: [ownerId], references: [id])
   event     Event  @relation(fields: [eventNoun, eventVerb], references: [noun, verb])
   ownerId   String
   url       String
```


