const express = require("express");
const cors = require("cors");
const app = express();
const { prisma } = require("./config/db");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// on server close
process.on("SIGINT", async () => {
  console.log("Closing server");

  // terminate db
  await prisma.$disconnect();

  // redis
  await redisClient.client.quit();

  process.exit(0);
});
