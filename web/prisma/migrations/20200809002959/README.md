# Migration `20200809002959`

This migration has been generated at 8/8/2020, 5:29:59 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "externalId" text  NOT NULL ;

CREATE UNIQUE INDEX "User.externalId_unique" ON "public"."User"("externalId")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200806212348-webhook..20200809002959
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
@@ -30,16 +30,17 @@
   updatedAt DateTime  @default(now())
 }
 model User {
-  id      String    @id
-  email   String    @unique
-  name    String
-  flow    Flow[]
-  apiKey  ApiKey?
-  team    Team      @relation(fields: [teamId], references: [id])
-  teamId  Int
-  webhook Webhook[]
+  id         String    @id
+  externalId String    @unique
+  email      String    @unique
+  name       String
+  flow       Flow[]
+  apiKey     ApiKey?
+  team       Team      @relation(fields: [teamId], references: [id])
+  teamId     Int
+  webhook    Webhook[]
 }
 model Team {
   id      Int    @default(autoincrement()) @id
```


