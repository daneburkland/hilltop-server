# Migration `20200818213128-initial`

This migration has been generated at 8/18/2020, 2:31:28 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "Noun" AS ENUM ('Flow');

CREATE TYPE "Verb" AS ENUM ('executed', 'errored');

CREATE TABLE "public"."FlowRun" (
"id" SERIAL,
"flowId" integer  NOT NULL ,
"result" text  NOT NULL ,
"code" text  NOT NULL ,
"createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
"screenshotUrls" text []  ,
"error" jsonb   ,
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
migration ..20200818213128-initial
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,91 @@
+generator client {
+  provider      = "prisma-client-js"
+  binaryTargets = ["native", "debian-openssl-1.1.x"]
+}
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+model FlowRun {
+  id             Int      @default(autoincrement()) @id
+  flow           Flow     @relation(fields: [flowId], references: [id])
+  flowId         Int
+  result         String
+  code           String
+  createdAt      DateTime @default(now())
+  logs           Log[]
+  screenshotUrls String[]
+  error          Json?
+}
+
+model Flow {
+  id        Int       @default(autoincrement()) @id
+  title     String
+  author    User      @relation(fields: [authorId], references: [id])
+  authorId  String
+  code      String
+  runs      FlowRun[]
+  createdAt DateTime  @default(now())
+  updatedAt DateTime  @default(now())
+}
+
+model User {
+  id       String    @id
+  email    String    @unique
+  name     String
+  flow     Flow[]
+  apiKey   ApiKey?
+  team     Team      @relation(fields: [teamId], references: [id])
+  teamId   Int
+  webhooks Webhook[]
+}
+
+model Team {
+  id      Int    @default(autoincrement()) @id
+  name    String
+  members User[]
+}
+
+model ApiKey {
+  hashed String @unique
+  prefix String
+  user   User   @relation(fields: [userId], references: [id])
+  userId String @unique
+}
+
+model Log {
+  id    Int     @default(autoincrement()) @id
+  run   FlowRun @relation(fields: [runId], references: [id])
+  runId Int
+  level String
+  msg   String
+  stack String?
+}
+
+model Webhook {
+  id        Int    @default(autoincrement()) @id
+  owner     User   @relation(fields: [ownerId], references: [id])
+  event     Event  @relation(fields: [eventNoun, eventVerb], references: [noun, verb])
+  ownerId   String
+  url       String
+  eventNoun Noun
+  eventVerb Verb
+}
+
+enum Noun {
+  Flow
+}
+
+enum Verb {
+  executed
+  errored
+}
+
+model Event {
+  noun     Noun      @default(Flow)
+  verb     Verb
+  webhooks Webhook[]
+  @@id([noun, verb])
+}
```


