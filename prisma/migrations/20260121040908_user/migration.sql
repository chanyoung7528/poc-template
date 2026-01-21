-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "kakao_id" TEXT,
    "naver_id" TEXT,
    "wellness_id" TEXT,
    "email" TEXT,
    "nickname" TEXT,
    "profile_image" TEXT,
    "provider" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "birth" TEXT,
    "gender" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_kakao_id_key" ON "users"("kakao_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_naver_id_key" ON "users"("naver_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_wellness_id_key" ON "users"("wellness_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_kakao_id_idx" ON "users"("kakao_id");

-- CreateIndex
CREATE INDEX "users_naver_id_idx" ON "users"("naver_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_wellness_id_idx" ON "users"("wellness_id");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");
