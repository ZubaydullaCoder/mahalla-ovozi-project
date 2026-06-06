-- DropForeignKey
ALTER TABLE "raw_messages" DROP CONSTRAINT "raw_messages_district_id_fkey";

-- DropForeignKey
ALTER TABLE "raw_messages" DROP CONSTRAINT "raw_messages_mahalla_id_fkey";

-- DropForeignKey
ALTER TABLE "signal_messages" DROP CONSTRAINT "signal_messages_district_id_fkey";

-- DropForeignKey
ALTER TABLE "signal_messages" DROP CONSTRAINT "signal_messages_mahalla_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "mahallas_id_district_id_key" ON "mahallas"("id", "district_id");

-- AddForeignKey
ALTER TABLE "raw_messages" ADD CONSTRAINT "raw_messages_mahalla_id_district_id_fkey" FOREIGN KEY ("mahalla_id", "district_id") REFERENCES "mahallas"("id", "district_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_messages" ADD CONSTRAINT "signal_messages_mahalla_id_district_id_fkey" FOREIGN KEY ("mahalla_id", "district_id") REFERENCES "mahallas"("id", "district_id") ON DELETE RESTRICT ON UPDATE CASCADE;
