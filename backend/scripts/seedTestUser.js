const path = require("node:path");
const dns = require("node:dns");

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const User = require("../src/models/User");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "123123123";
const TEST_NAME = "테스트";

async function seedTestUser() {
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

  const normalizedEmail = TEST_EMAIL.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.name = TEST_NAME;
    user.password = hashedPassword;
    user.provider = "local";
    user.providerId = "";
    await user.save();
  } else {
    user = await User.create({
      name: TEST_NAME,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local",
      phone: "",
    });
  }

  console.log("테스트 계정 준비 완료:", user.email);
}

seedTestUser()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
