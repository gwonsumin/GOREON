/**
 * 상품 하나의 image 필드만 안전하게 업데이트한다.
 * seedProducts.js(전체 deleteMany + insertMany)는 기존 문서의 _id를 모두
 * 새로 발급해서 장바구니/주문/찜에 저장된 productId 참조가 깨질 수 있어
 * 프로덕션에서는 위험하다. 이 스크립트는 해당 상품 한 건만 findOneAndUpdate로
 * 건드린다.
 *
 * 사용법: node backend/scripts/updateProductImage.js
 */
const path = require("node:path");
const dns = require("node:dns");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Product = require("../src/models/Product");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// 삼성전자 갤럭시북6 프로 NT940XJG-K51A (id: 3)
// danawa 원본 이미지가 만료되어(HTTP 503) danawa 상품 페이지에서 확인한
// 최신 img.danuri.io 주소로 교체.
const TARGET_ID = 3;
const NEW_IMAGE =
  "https://img.danuri.io/catalog-image/318/721/106/e4afe6caa99248d8b6d592ce2f4c9394.jpeg?_v=20260809100842";

const updateProductImage = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  dns.setServers(
    (process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean),
  );

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME,
  });

  const before = await Product.findOne({ id: TARGET_ID }).lean();
  if (!before) {
    throw new Error(`id ${TARGET_ID} 상품을 찾지 못했습니다.`);
  }
  console.log("변경 전 image:", before.image);

  const result = await Product.updateOne(
    { id: TARGET_ID },
    { $set: { image: NEW_IMAGE } },
  );
  console.log(`matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  console.log("변경 후 image:", NEW_IMAGE);
};

updateProductImage()
  .catch((error) => {
    console.error("이미지 업데이트 실패:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
