-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "kakao_id" TEXT NOT NULL,
    "email" TEXT,
    "nickname" TEXT,
    "profile_image" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'kakao',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_kakao_id_key" ON "users"("kakao_id");

-- CreateIndex
CREATE INDEX "users_kakao_id_idx" ON "users"("kakao_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
