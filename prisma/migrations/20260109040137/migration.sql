/*
  Warnings:

  - A unique constraint covering the columns `[naver_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "naver_id" TEXT,
ALTER COLUMN "kakao_id" DROP NOT NULL,
ALTER COLUMN "provider" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "users_naver_id_key" ON "users"("naver_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_naver_id_idx" ON "users"("naver_id");
