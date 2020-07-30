# Migration `20200729175259-required-team`

This migration has been generated at 7/29/2020, 5:52:59 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP CONSTRAINT IF EXiSTS "User_teamId_fkey",
ALTER COLUMN "teamId" SET NOT NULL;

ALTER TABLE "public"."User" ADD FOREIGN KEY ("teamId")REFERENCES "public"."Team"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200727200108-teams..20200729175259-required-team
--- datamodel.dml
+++ datamodel.dml
@@ -4,9 +4,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model TestRun {
   id             Int      @default(autoincrement()) @id
@@ -34,10 +34,10 @@
   email  String  @unique
   name   String?
   tests  Test[]
   apiKey ApiKey?
-  team   Team?   @relation(fields: [teamId], references: [id])
-  teamId Int?
+  team   Team    @relation(fields: [teamId], references: [id])
+  teamId Int
 }
 model Team {
   id      Int    @id
```


