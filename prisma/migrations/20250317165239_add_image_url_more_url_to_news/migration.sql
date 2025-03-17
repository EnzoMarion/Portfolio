/*
  Warnings:

  - Added the required column `imageUrl` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "moreUrl" TEXT;
