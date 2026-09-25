import express from "express";
import multer from "multer";
import serverless from "serverless-http";

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const MODEL_ID =
  "chandrajith-j/onions-quality-analysis-1-yolo11n-t1";

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "OnionGuard Netlify backend is running"
  });
});

app.post("/analyze-onion", upload.single("image"), async (req, res) => {
  try {
    console.log("=== ONION ANALYSIS START ===");

const apiKey = process.env.ROBOFLOW_API_KEY?.trim();

console.log("API key exists:", Boolean(apiKey));
console.log("Image received:", Boolean(req.file));
console.log("Image size:", req.file?.size || 0);
console.log("Model ID:", MODEL_ID);
    const apiKey = process.env.ROBOFLOW_API_KEY?.trim();

    console.log("API key available:", Boolean(apiKey));
    console.log("Uploaded file:", req.file?.originalname);
    console.log("File size:", req.file?.size);

    if (!apiKey) {
      return res.status(500).json({
        error: "ROBOFLOW_API_KEY is missing in Netlify environment variables"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded"
      });
    }

    const base64Image = req.file.buffer.toString("base64");

    const url =
      `https://serverless.roboflow.com/${MODEL_ID}` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    console.log("Sending image to Roboflow...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: base64Image
    });
    console.log("Roboflow HTTP status:", response.status);

    const responseText = await response.text();
    console.log("Roboflow response:", responseText);
    console.log("=== ONION ANALYSIS END ===");

    console.log("Roboflow status:", response.status);
    console.log("Roboflow response:", responseText.slice(0, 1000));

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        rawResponse: responseText
      };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Roboflow inference failed",
        roboflowStatus: response.status,
        details: data
      });
    }

    return res.json(data);

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: "Failed to analyze onion image",
      details: error instanceof Error
        ? error.message
        : String(error)
    });
  }
});

export const handler = serverless(app);
