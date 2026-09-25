import express from "express";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 5000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const MODEL_ID =
  "chandrajith-j/onions-quality-analysis-1-yolo11n-t1";

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "OnionGuard AI backend is running"
  });
});

app.post("/api/analyze-onion", upload.single("image"), async (req, res) => {
  try {
    // Check API key
    const apiKey = process.env.ROBOFLOW_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "ROBOFLOW_API_KEY is missing from .env"
      });
    }

    // Check uploaded image
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded"
      });
    }

    // Convert uploaded image bytes to base64
    const base64Image = req.file.buffer.toString("base64");

    console.log(
      `Analyzing image: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`
    );

    // Roboflow hosted object-detection endpoint
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

    console.log("Roboflow analysis successful");

    // Return ONLY the real Roboflow response
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

app.listen(PORT, () => {
  console.log(
    `OnionGuard backend running at http://localhost:${PORT}`
  );
});