-- AlterTable
ALTER TABLE "users" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "token_type" TEXT;
