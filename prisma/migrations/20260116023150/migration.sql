/*
  Warnings:

  - A unique constraint covering the columns `[wellness_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birth" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "wellness_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_wellness_id_key" ON "users"("wellness_id");

-- CreateIndex
CREATE INDEX "users_wellness_id_idx" ON "users"("wellness_id");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");
