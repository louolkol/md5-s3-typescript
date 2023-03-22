import Koa from "koa";
import Router from "koa-router";
import AWS from "aws-sdk";
import * as crypto from "crypto";

const app = new Koa();
const router = new Router();

// MD5 helper function
const md5 = (contents: Buffer) => crypto.createHash("md5").update(contents).digest("hex");

// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: "InputAccessKeyId",
    secretAccessKey: "InputSecretAccessKey",
    region: "InputRegion",
});

// Route handler for /md5
router.get("/md5", async (ctx) => {
  const key = ctx.query.key;

  // Check if key is provided
  if (!key) {
    ctx.status = 400;
    ctx.body = "Missing key";
    return;
  }
  // Get object from S3
  try {
    const s3Object = await s3
      .getObject({
        Bucket: "InputBucket",
        Key: key.toString(),
      })
      .promise();

    // Calculate MD5 hash of the object
    const hash = md5(s3Object.Body as Buffer);

    ctx.body = hash;
  } catch (err) {
    ctx.status = 500;
    ctx.body = `Error getting S3 object: ${err}`;
  }
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
