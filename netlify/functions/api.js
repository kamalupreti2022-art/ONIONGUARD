import express from "express";
import multer from "multer";
import serverless from "serverless-http";

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
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
    const apiKey = process.env.ROBOFLOW_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "ROBOFLOW_API_KEY is missing"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded"
      });
    }

    const base64Image = req.file.buffer.toString("base64");

    const roboflowUrl =
      `https://serverless.roboflow.com/${MODEL_ID}` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(roboflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: base64Image
    });

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        rawResponse: responseText
      };
    }

    if (!response.ok) {
      console.error("Roboflow error:", data);

      return res.status(response.status).json({
        error: "Roboflow inference failed",
        details: data
      });
    }

    res.json(data);

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Failed to analyze onion image",
      details: error instanceof Error
        ? error.message
        : String(error)
    });
  }
});

export const handler = serverless(app);