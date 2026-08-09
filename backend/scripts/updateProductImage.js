/**
 * 특정 상품(들)의 image 필드만 안전하게 업데이트한다.
 * seedProducts.js(전체 deleteMany + insertMany)는 기존 문서의 _id를 모두
 * 새로 발급해서 장바구니/주문/찜에 저장된 productId 참조가 깨질 수 있어
 * 프로덕션에서는 위험하다. 이 스크립트는 UPDATES에 지정한 상품만 findOneAndUpdate로
 * 건드린다.
 *
 * 사용법: node backend/scripts/updateProductImage.js
 * 새 상품을 고칠 때는 UPDATES 배열에 { id, image, note } 항목을 추가하면 된다.
 */
const path = require("node:path");
const dns = require("node:dns");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Product = require("../src/models/Product");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// danawa 원본 이미지가 만료되어(HTTP 503) danawa 상품 페이지에서 확인한
// 최신 img.danuri.io 주소로 교체.
const UPDATES = [
  {
    id: 3,
    note: "삼성전자 갤럭시북6 프로 NT940XJG-K51A",
    image:
      "https://img.danuri.io/catalog-image/318/721/106/e4afe6caa99248d8b6d592ce2f4c9394.jpeg?_v=20260809100842",
  },
  {
    id: 208,
    note: "AMD 라이젠7-6세대 9800X3D",
    image:
      "https://img.danuri.io/catalog-image/547/531/070/749fd202aa5d4ebaac1438998c3addd2.jpeg?_v=20260809091027",
  },
  {
    id: 324,
    note: "MSI 지포스 RTX 5060 벤투스 2X OC D7 8GB",
    image:
      "https://img.danuri.io/catalog-image/033/956/090/163a5e86e0d24d61b934320367a8f85a.jpeg?_v=20260809185538",
  },
];

const updateProductImages = async () => {
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

  for (const { id, note, image } of UPDATES) {
    const before = await Product.findOne({ id }).lean();
    if (!before) {
      console.warn(`id ${id} (${note}) 상품을 찾지 못했습니다. 건너뜁니다.`);
      continue;
    }

    if (before.image === image) {
      console.log(`id ${id} (${note}) 이미 최신 이미지입니다. 건너뜁니다.`);
      continue;
    }

    console.log(`id ${id} (${note}) 변경 전 image:`, before.image);

    const result = await Product.updateOne({ id }, { $set: { image } });
    console.log(
      `id ${id} matched ${result.matchedCount}, modified ${result.modifiedCount}`,
    );
    console.log(`id ${id} 변경 후 image:`, image);
  }
};

updateProductImages()
  .catch((error) => {
    console.error("이미지 업데이트 실패:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
