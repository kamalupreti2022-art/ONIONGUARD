import {
  BoundingBox,
  DefectCounts,
  DefectPercentages,
  ImageAnalysisItem,
  OnionDefectType,
} from '../types';

const API_URL = '/api/analyze-onion';

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

async function analyseSingleImage(
  imageSrc: string,
  imageIndex: number
): Promise<{
  item: ImageAnalysisItem;
  boxes: BoundingBox[];
}> {
  const formData = new FormData();

  const blob = await fetch(imageSrc).then((response) => {
    if (!response.ok) {
      throw new Error('Could not prepare image for analysis.');
    }
    return response.blob();
  });

  formData.append(
    'image',
    blob,
    `onion-${imageIndex}.jpg`
  );

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  let data: RoboflowResponse | { error?: string; details?: unknown };

  try {
    data = await response.json();
  } catch {
    throw new Error('The analysis server returned an invalid response.');
  }

  if (!response.ok) {
    const errorMessage =
      'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Roboflow analysis failed.';

    throw new Error(errorMessage);
  }

  const predictions = Array.isArray((data as RoboflowResponse).predictions)
    ? (data as RoboflowResponse).predictions!
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
