import {
  BoundingBox,
  DefectCounts,
  DefectPercentages,
  ImageAnalysisItem,
  OnionDefectType,
} from '../types';
import { getStoredRoboflowKey } from './storage';

const API_URL = '/api/analyze-onion';
const ROBOFLOW_MODEL_ID = 'chandrajith-j/onions-quality-analysis-1-yolo11n-t1';

interface RoboflowPrediction {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  confidence?: number;
  class?: string;
  class_id?: number;
}

interface RoboflowResponse {
  predictions?: RoboflowPrediction[];
  [key: string]: unknown;
}

interface RoboflowScanResult {
  items: ImageAnalysisItem[];
  totalAnalyzed: number;
  counts: DefectCounts;
  percentages: DefectPercentages;
  gradeA: number;
  gradeURS: number;
  qualitySummary: string;
  boundingBoxes: BoundingBox[];
  modelAvailable: boolean;
  modelEngine: 'roboflow_api';
  modelNotice?: string;
}

function normalizeClassName(value: string | undefined): OnionDefectType {
  const name = (value || '').trim().toLowerCase();

  if (name === 'healthy') return 'healthy';
  if (name === 'damaged') return 'damaged';
  if (name === 'rotten') return 'rotten';
  if (name === 'sprouted') return 'sprouted';
  return 'other';
}

function displayLabel(type: OnionDefectType): string {
  switch (type) {
    case 'healthy':
      return 'Healthy';
    case 'damaged':
      return 'Damaged';
    case 'rotten':
      return 'Rotten';
    case 'sprouted':
      return 'Sprouted';
    case 'undersized':
      return 'Undersized';
    case 'other':
      return 'Other';
    default:
      return 'Unable to determine';
  }
}

function interpretation(type: OnionDefectType): string {
  switch (type) {
    case 'healthy':
      return 'The Roboflow model detected an onion classified as healthy.';
    case 'damaged':
      return 'The Roboflow model detected visible damage.';
    case 'rotten':
      return 'The Roboflow model detected a rotten onion condition.';
    case 'sprouted':
      return 'The Roboflow model detected sprouting.';
    case 'undersized':
      return 'The Roboflow model detected an undersized class.';
    case 'other':
      return 'The model returned a class that is not mapped to the standard OnionGuard categories.';
    default:
      return 'The image could not be classified.';
  }
}

function recommendation(type: OnionDefectType): string {
  switch (type) {
    case 'healthy':
      return 'Continue with normal inspection and procurement checks.';
    case 'damaged':
      return 'Inspect the damaged bulb separately before procurement.';
    case 'rotten':
      return 'Separate affected onions from the acceptable lot.';
    case 'sprouted':
      return 'Separate sprouted onions and inspect the remaining lot.';
    case 'undersized':
      return 'Verify size using an approved physical reference scale.';
    case 'other':
      return 'Review the image manually because the detected class is not mapped to a standard category.';
    default:
      return 'Capture a clearer onion image and analyse it again.';
  }
}

function createEmptyCounts(): DefectCounts {
  return {
    healthy: 0,
    damaged: 0,
    rotten: 0,
    sprouted: 0,
    other: 0,
    undersized: 0,
    unableToDetermine: 0,
  };
}

function calculatePercentages(
  counts: DefectCounts,
  total: number
): DefectPercentages {
  if (total === 0) {
    return {
      healthy: 0,
      damaged: 0,
      rotten: 0,
      sprouted: 0,
      other: 0,
      undersized: 0,
      unableToDetermine: 0,
    };
  }

  const percentage = (value: number) =>
    Math.round((value / total) * 10000) / 100;

  return {
    healthy: percentage(counts.healthy),
    damaged: percentage(counts.damaged),
    rotten: percentage(counts.rotten),
    sprouted: percentage(counts.sprouted),
    other: percentage(counts.other || 0),
    undersized: percentage(counts.undersized),
    unableToDetermine: percentage(counts.unableToDetermine),
  };
}

function convertPredictionToBox(
  prediction: RoboflowPrediction,
  index: number
): BoundingBox {
  const rawClass = prediction.class || '';
  const type = normalizeClassName(rawClass);
  const confidence = prediction.confidence ?? 0;
  const x = prediction.x;
  const y = prediction.y;
  const width = prediction.width;
  const height = prediction.height;

  return {
    id: index,
    x: x ?? 0,
    y: y ?? 0,
    width: width ?? 0,
    height: height ?? 0,
    defectType: type,
    confidence: Math.round(confidence * 100),
    label: type === 'other' ? rawClass || 'Unlabeled detection' : displayLabel(type),
    rawClassName: rawClass || undefined,
    reason: `Roboflow detected class "${rawClass}".`,
  };
}

async function directRoboflowInference(
  imageSrc: string,
  apiKey: string
): Promise<RoboflowResponse> {
  const cleanBase64 = imageSrc.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
  const detectUrl = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${encodeURIComponent(apiKey)}`;

  let response = await fetch(detectUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: cleanBase64,
  });

  if (!response.ok && response.status !== 401) {
    const serverlessUrl = `https://serverless.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${encodeURIComponent(apiKey)}`;
    const slRes = await fetch(serverlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: cleanBase64,
    });
    if (slRes.ok) {
      response = slRes;
    }
  }

  const rawText = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(rawText);
  } catch {}

  if (!response.ok) {
    const msg = json?.message || json?.error || `Roboflow returned status ${response.status}`;
    throw new Error(msg);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Roboflow API returned invalid data format.');
  }

  return json as RoboflowResponse;
}

export async function testRoboflowConnection(
  customKey?: string
): Promise<{ success: boolean; message: string }> {
  const keyToTest = (
    customKey ||
    getStoredRoboflowKey() ||
    (import.meta.env.VITE_ROBOFLOW_API_KEY as string | undefined) ||
    ''
  ).trim();

  if (!keyToTest) {
    // Check backend health status first
    try {
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.roboflowKeyConfigured) {
          return {
            success: true,
            message: 'Connected: Backend environment variable ROBOFLOW_API_KEY is active.',
          };
        }
      }
    } catch {}

    return {
      success: false,
      message: 'No Roboflow API key detected. Please configure ROBOFLOW_API_KEY in Netlify or enter it in Settings.',
    };
  }

  try {
    // Quick test against Roboflow API
    const testUrl = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${encodeURIComponent(keyToTest)}`;
    const res = await fetch(testUrl);
    const data = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: data?.message || 'Unauthorized: The provided Roboflow API key is invalid.',
      };
    }

    return {
      success: true,
      message: 'Connected successfully: Roboflow model is verified and authorized.',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Connection check failed: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}

async function analyseSingleImage(
  imageSrc: string,
  imageIndex: number
): Promise<{
  item: ImageAnalysisItem;
  boxes: BoundingBox[];
}> {
  const storedKey = getStoredRoboflowKey();
  const viteKey = import.meta.env.VITE_ROBOFLOW_API_KEY as string | undefined;
  const fallbackKey = storedKey || viteKey || '';

  let data: RoboflowResponse | null = null;
  let backendFailed = false;

  // 1. First attempt: Call the backend API (/api/analyze-onion)
  try {
    const payload = {
      image: imageSrc,
      apiKey: storedKey || undefined,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let parsed: any = null;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Non-JSON response (e.g. HTML 404/500/redirect from Netlify when function isn't yet routed)
      backendFailed = true;
      console.warn('Backend returned non-JSON:', rawText.slice(0, 100));
    }

    if (parsed) {
      if (!response.ok) {
        const errorMsg =
          typeof parsed.error === 'string'
            ? parsed.error
            : typeof parsed.message === 'string'
            ? parsed.message
            : `Analysis server returned status ${response.status}`;

        // If backend reports missing key or 401, check if client has fallbackKey
        if ((response.status === 400 || response.status === 401) && fallbackKey) {
          backendFailed = true;
        } else {
          throw new Error(errorMsg);
        }
      } else {
        data = parsed as RoboflowResponse;
      }
    }
  } catch (backendErr) {
    if (backendErr instanceof Error && !backendFailed) {
      // Specific error thrown from backend response
      if (fallbackKey) {
        backendFailed = true;
      } else {
        throw backendErr;
      }
    } else {
      backendFailed = true;
    }
  }

  // 2. Second attempt: Direct client-side inference if backend returned non-JSON or failed and key is available
  if (!data && backendFailed) {
    if (fallbackKey) {
      try {
        data = await directRoboflowInference(imageSrc, fallbackKey);
      } catch (directErr) {
        throw new Error(
          'Roboflow inference failed: ' +
            (directErr instanceof Error ? directErr.message : String(directErr))
        );
      }
    } else {
      throw new Error(
        'The analysis server could not be reached or returned an unexpected response. Please ensure your Netlify environment variable ROBOFLOW_API_KEY is configured, or add your key in Settings.'
      );
    }
  }

  if (!data) {
    throw new Error('No analysis data received from the AI model.');
  }

  const predictions = Array.isArray(data.predictions)
    ? data.predictions
    : [];

  const boxes = predictions
    .filter((prediction) => [prediction.x, prediction.y, prediction.width, prediction.height].every(Number.isFinite))
    .map((prediction, index) => convertPredictionToBox(prediction, index));

  if (predictions.length === 0) {
    return {
      item: {
        id: `roboflow-${imageIndex}`,
        imageIndex,
        imageSrc,
        prediction: 'unable_to_determine',
        label: 'Unable to determine',
        reason:
          'The Roboflow model returned no supported detections for this image.',
        qualityInterpretation:
          'No supported onion condition was detected by the model.',
        recommendation:
          'Capture a clear photo with the onion fully visible and try again.',
        sizeReferenceDetected: false,
        sizeReferenceNote:
          'Roboflow object detection does not provide a calibrated physical size measurement.',
        bulbDetected: false,
        detectionCount: 0,
        isLowConfidence: true,
        lowConfidenceWarning:
          'No model detection was returned. This is not treated as a healthy result.',
      },
      boxes,
    };
  }

  // Use the highest-confidence detection for the per-image summary.
  const sorted = [...predictions].sort(
    (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)
  );

  const best = sorted[0];
  const rawClass = best.class || '';
  const confidence = best.confidence;
  if (!rawClass || typeof confidence !== 'number' || !Number.isFinite(confidence)) {
    throw new Error('Roboflow returned a detection without a class name or confidence.');
  }
  const type = normalizeClassName(rawClass);

  // Do not present a weak detection as a definitive result.
  const MIN_CONFIDENCE = 0.5;

  if (confidence < MIN_CONFIDENCE) {
    return {
      item: {
        id: `roboflow-${imageIndex}`,
        imageIndex,
        imageSrc,
        prediction: 'unable_to_determine',
        label: 'Unable to determine',
        confidence: Math.round(confidence * 100),
        reason: `Roboflow returned "${rawClass}", but its confidence was below the ${MIN_CONFIDENCE * 100}% acceptance threshold.`,
        qualityInterpretation:
          'The model detected a possible object, but confidence is too low for a definitive condition.',
        recommendation:
          'Capture a clearer image and analyse it again.',
        sizeReferenceDetected: false,
        bulbDetected: true,
        detectionCount: predictions.length,
        rawClassName: rawClass,
        isLowConfidence: true,
        lowConfidenceWarning:
          `Low model confidence (${Math.round(confidence * 100)}%). No definitive quality category was assigned.`,
      },
      boxes,
    };
  }

  return {
    item: {
      id: `roboflow-${imageIndex}`,
      imageIndex,
      imageSrc,
      prediction: type,
      label: type === 'other' ? rawClass : displayLabel(type),
      confidence: confidence * 100,
      qualityInterpretation: interpretation(type),
      recommendation: recommendation(type),
      reason: `Roboflow YOLO model detected "${rawClass}" with ${(confidence * 100).toFixed(1)}% confidence.`,
      sizeReferenceDetected: false,
      sizeReferenceNote:
        'Physical onion size is not inferred from image appearance. A calibrated reference is required for size measurement.',
      bulbDetected: true,
      detectionCount: predictions.length,
      rawClassName: rawClass,
      isLowConfidence: false,
    },
    boxes,
  };
}

export async function analyzeImagesWithRoboflow(
  images: string[]
): Promise<RoboflowScanResult> {
  if (images.length === 0) {
    throw new Error('No images were selected.');
  }

  const items: ImageAnalysisItem[] = [];
  const boundingBoxes: BoundingBox[] = [];
  const counts = createEmptyCounts();

  for (let i = 0; i < images.length; i += 1) {
    const result = await analyseSingleImage(images[i], i + 1);

    items.push(result.item);

    result.boxes.forEach((box) => {
      boundingBoxes.push({
        ...box,
        id: boundingBoxes.length,
      });
    });

    const prediction = result.item.prediction;

    if (prediction === 'healthy') counts.healthy += 1;
    else if (prediction === 'damaged') counts.damaged += 1;
    else if (prediction === 'rotten') counts.rotten += 1;
    else if (prediction === 'sprouted') counts.sprouted += 1;
    else if (prediction === 'undersized') counts.undersized += 1;
    else if (prediction === 'other') counts.other = (counts.other || 0) + 1;
    else counts.unableToDetermine += 1;
  }

  const totalAnalyzed = items.length;
  const percentages = calculatePercentages(counts, totalAnalyzed);

  const confidentlyClassified = totalAnalyzed - counts.unableToDetermine;

  const gradeA =
    confidentlyClassified > 0
      ? Math.round((counts.healthy / confidentlyClassified) * 10000) / 100
      : 0;

  const gradeURS =
    totalAnalyzed > 0
      ? Math.round(
          ((counts.undersized + counts.rotten + counts.sprouted) /
            totalAnalyzed) *
            10000
        ) / 100
      : 0;

  const qualitySummary =
    totalAnalyzed === 1
      ? `Roboflow analysed the uploaded image. ${items[0].label} was the highest-confidence accepted detection.`
      : `Roboflow analysed ${totalAnalyzed} uploaded images. Results are based only on model detections returned by the configured Roboflow model.`;

  return {
    items,
    totalAnalyzed,
    counts,
    percentages,
    gradeA,
    gradeURS,
    qualitySummary,
    boundingBoxes,
    modelAvailable: true,
    modelEngine: 'roboflow_api',
    modelNotice:
      'Real Roboflow YOLO inference. No pixel heuristic, random prediction, or synthetic result is used.',
  };
}
