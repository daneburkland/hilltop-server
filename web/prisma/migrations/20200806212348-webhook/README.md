# Migration `20200806212348-webhook`

This migration has been generated at 8/6/2020, 9:23:48 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Webhook" (
"id" SERIAL,"onCreate" boolean  NOT NULL ,"onExecute" boolean  NOT NULL ,"resource" text  NOT NULL ,"url" text  NOT NULL ,"userId" text  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Webhook" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200804183009-int..20200806212348-webhook
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
@@ -30,15 +30,16 @@
   updatedAt DateTime  @default(now())
 }
 model User {
-  id     String  @id
-  email  String  @unique
-  name   String
-  flow   Flow[]
-  apiKey ApiKey?
-  team   Team    @relation(fields: [teamId], references: [id])
-  teamId Int
+  id      String    @id
+  email   String    @unique
+  name    String
+  flow    Flow[]
+  apiKey  ApiKey?
+  team    Team      @relation(fields: [teamId], references: [id])
+  teamId  Int
+  webhook Webhook[]
 }
 model Team {
   id      Int    @default(autoincrement()) @id
@@ -60,4 +61,14 @@
   level String
   msg   String
   stack String?
 }
+
+model Webhook {
+  id        Int     @default(autoincrement()) @id
+  resource  String
+  onCreate  Boolean
+  onExecute Boolean
+  owner     User    @relation(fields: [userId], references: [id])
+  userId    String
+  url       String
+}
```


