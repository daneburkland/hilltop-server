# Migration `20200809005154-default-user-id`

This migration has been generated at 8/8/2020, 5:51:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200809003103-external-id..20200809005154-default-user-id
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
@@ -22,25 +22,24 @@
 model Flow {
   id        Int       @default(autoincrement()) @id
   title     String
   author    User      @relation(fields: [authorId], references: [id])
-  authorId  Int
+  authorId  String
   code      String
   runs      FlowRun[]
   createdAt DateTime  @default(now())
   updatedAt DateTime  @default(now())
 }
 model User {
-  id         Int       @default(autoincrement()) @id
-  externalId String    @unique
-  email      String    @unique
-  name       String
-  flow       Flow[]
-  apiKey     ApiKey?
-  team       Team      @relation(fields: [teamId], references: [id])
-  teamId     Int
-  webhook    Webhook[]
+  id      String    @default(uuid()) @id
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
@@ -51,9 +50,9 @@
 model ApiKey {
   hashed String @unique
   prefix String
   user   User   @relation(fields: [userId], references: [id])
-  userId Int    @unique
+  userId String @unique
 }
 model Log {
   id    Int     @default(autoincrement()) @id
@@ -69,7 +68,7 @@
   resource  String
   onCreate  Boolean
   onExecute Boolean
   owner     User    @relation(fields: [userId], references: [id])
-  userId    Int
+  userId    String
   url       String
 }
```


