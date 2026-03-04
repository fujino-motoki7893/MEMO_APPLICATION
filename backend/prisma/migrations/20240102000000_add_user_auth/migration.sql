-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AlterTable
ALTER TABLE "memos" ADD COLUMN "user_id" INTEGER;

-- Migrate existing memos: create a default user and assign all existing memos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "memos" LIMIT 1) THEN
        INSERT INTO "users" ("email", "password", "created_at")
        VALUES ('legacy@example.com', '$2b$10$1uD.N6DY28PQ.8Gnx5Tyg.NsPUUiUE1wZGvm7pAOWDWfnCfxRhtBO', CURRENT_TIMESTAMP);

        UPDATE "memos" SET "user_id" = (SELECT "id" FROM "users" WHERE "email" = 'legacy@example.com');
    END IF;
END $$;

-- Make user_id NOT NULL after migration
ALTER TABLE "memos" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
