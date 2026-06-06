-- CreateTable
CREATE TABLE "districts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahallas" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "telegram_chat_id" BIGINT NOT NULL,
    "bot_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "bot_last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mahallas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_messages" (
    "id" SERIAL NOT NULL,
    "telegram_update_id" INTEGER NOT NULL,
    "telegram_message_id" INTEGER NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "district_id" INTEGER NOT NULL,
    "mahalla_id" INTEGER NOT NULL,
    "sender_is_bot" BOOLEAN NOT NULL DEFAULT false,
    "sender_display_name" VARCHAR(300),
    "sender_username" VARCHAR(100),
    "text" TEXT NOT NULL,
    "text_source" VARCHAR(10) NOT NULL,
    "telegram_timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_messages" (
    "id" SERIAL NOT NULL,
    "telegram_update_id" INTEGER NOT NULL,
    "telegram_message_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "mahalla_id" INTEGER NOT NULL,
    "sender_display_name" VARCHAR(300),
    "sender_username" VARCHAR(100),
    "telegram_timestamp" TIMESTAMP(3) NOT NULL,
    "raw_text" TEXT NOT NULL,
    "text_source" VARCHAR(10) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "hokim_related" BOOLEAN NOT NULL DEFAULT false,
    "keyword_matched" BOOLEAN NOT NULL DEFAULT false,
    "matched_keyword" VARCHAR(120),
    "short_label" VARCHAR(100),
    "classified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "phrase" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_health" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "intake_window_from" TIMESTAMP(3),
    "intake_window_to" TIMESTAMP(3),
    "messages_fetched" INTEGER NOT NULL DEFAULT 0,
    "signals_written" INTEGER NOT NULL DEFAULT 0,
    "ignored_count" INTEGER NOT NULL DEFAULT 0,
    "pre_filter_discards" INTEGER NOT NULL DEFAULT 0,
    "filter_mode" VARCHAR(20) NOT NULL,
    "keyword_matched_count" INTEGER NOT NULL DEFAULT 0,
    "keyword_skipped_count" INTEGER NOT NULL DEFAULT 0,
    "keyword_ai_signal_count" INTEGER NOT NULL DEFAULT 0,
    "keyword_ai_ignore_count" INTEGER NOT NULL DEFAULT 0,
    "no_keyword_ai_signal_count" INTEGER NOT NULL DEFAULT 0,
    "no_keyword_ai_ignore_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "batch_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_events" (
    "id" SERIAL NOT NULL,
    "event_type" VARCHAR(30) NOT NULL,
    "district_id" INTEGER NOT NULL,
    "mahalla_id" INTEGER,
    "telegram_update_id" INTEGER,
    "raw_message_id" INTEGER,
    "signal_id" INTEGER,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mahallas_telegram_chat_id_key" ON "mahallas"("telegram_chat_id");

-- CreateIndex
CREATE INDEX "mahallas_district_id_idx" ON "mahallas"("district_id");

-- CreateIndex
CREATE INDEX "mahallas_telegram_chat_id_idx" ON "mahallas"("telegram_chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_district_id_idx" ON "users"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "raw_messages_telegram_update_id_key" ON "raw_messages"("telegram_update_id");

-- CreateIndex
CREATE INDEX "raw_messages_district_id_idx" ON "raw_messages"("district_id");

-- CreateIndex
CREATE INDEX "raw_messages_mahalla_id_idx" ON "raw_messages"("mahalla_id");

-- CreateIndex
CREATE INDEX "raw_messages_created_at_idx" ON "raw_messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "signal_messages_telegram_update_id_key" ON "signal_messages"("telegram_update_id");

-- CreateIndex
CREATE INDEX "signal_messages_mahalla_id_idx" ON "signal_messages"("mahalla_id");

-- CreateIndex
CREATE INDEX "signal_messages_district_id_idx" ON "signal_messages"("district_id");

-- CreateIndex
CREATE INDEX "signal_messages_category_idx" ON "signal_messages"("category");

-- CreateIndex
CREATE INDEX "signal_messages_telegram_timestamp_idx" ON "signal_messages"("telegram_timestamp");

-- CreateIndex
CREATE INDEX "signal_messages_hokim_related_idx" ON "signal_messages"("hokim_related");

-- CreateIndex
CREATE INDEX "signal_messages_keyword_matched_idx" ON "signal_messages"("keyword_matched");

-- CreateIndex
CREATE INDEX "keywords_district_id_is_active_idx" ON "keywords"("district_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_district_id_phrase_key" ON "keywords"("district_id", "phrase");

-- CreateIndex
CREATE INDEX "batch_health_district_id_idx" ON "batch_health"("district_id");

-- CreateIndex
CREATE INDEX "batch_health_started_at_idx" ON "batch_health"("started_at");

-- CreateIndex
CREATE INDEX "pipeline_events_district_id_created_at_idx" ON "pipeline_events"("district_id", "created_at");

-- AddForeignKey
ALTER TABLE "mahallas" ADD CONSTRAINT "mahallas_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_messages" ADD CONSTRAINT "raw_messages_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_messages" ADD CONSTRAINT "raw_messages_mahalla_id_fkey" FOREIGN KEY ("mahalla_id") REFERENCES "mahallas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_messages" ADD CONSTRAINT "signal_messages_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_messages" ADD CONSTRAINT "signal_messages_mahalla_id_fkey" FOREIGN KEY ("mahalla_id") REFERENCES "mahallas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_health" ADD CONSTRAINT "batch_health_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
