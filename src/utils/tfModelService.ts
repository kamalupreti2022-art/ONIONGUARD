/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';

export type OnionModelClass = 'healthy' | 'damaged' | 'rotten' | 'sprouted' | 'other';

export interface ClassProbability {
  className: OnionModelClass;
  displayName: string;
  probability: number; // 0 to 1
  percentage: number;  // 0 to 100 (e.g. 94.2)
}

export interface TfPredictionResult {
  predictedClass: OnionModelClass;
  displayName: string;
  confidencePercentage: number;
  qualityText: string;
  recommendationText: string;
  allProbabilities: ClassProbability[];
  isLowConfidence: boolean;
  lowConfidenceWarning?: string;
  modelInputShape: number[];
  modelOutputShape: number[];
  rawProbabilities: number[];
  executionTimeMs: number;
}

export interface ModelLoadStatus {
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  errorMessage?: string;
  modelInputShape?: number[];
  labelsCount?: number;
  isAvailable: boolean;
}

export const EXPECTED_MODEL_URL = '/models/onion-quality/model.json';
export const EXPECTED_LABELS_URL = '/models/onion-quality/labels.json';

export const QUALITY_INTERPRETATIONS: Record<OnionModelClass, { quality: string; recommendation: string; displayName: string }> = {
  healthy: {
    displayName: 'Healthy',
    quality: 'Good quality onion',
    recommendation: 'Suitable for normal storage/sale.',
  },
  rotten: {
    displayName: 'Rotten',
    quality: 'Possible spoilage detected.',
    recommendation: 'Separate this onion from healthy produce and inspect the batch.',
  },
  sprouted: {
    displayName: 'Sprouted',
    quality: 'Sprouting detected.',
    recommendation: 'Consider separate grading or earlier sale.',
  },
  damaged: {
    displayName: 'Damaged',
    quality: 'Visible damage pattern detected.',
    recommendation: 'Inspect before storage or sale.',
  },
  other: {
    displayName: 'Other',
    quality: 'The image does not confidently match the trained onion-quality classes.',
    recommendation: 'Capture a clearer image of a single onion.',
  },
};

// Internal model & labels cache
let cachedModel: tf.LayersModel | null = null;
let cachedLabels: string[] = ['healthy', 'damaged', 'rotten', 'sprouted', 'other'];
let loadPromise: Promise<tf.LayersModel> | null = null;
let lastLoadStatus: ModelLoadStatus = {
  status: 'unloaded',
  isAvailable: false,
};

/**
 * Checks whether the model files exist on the server without throwing raw errors
 */
export async function checkModelFilesAvailability(): Promise<boolean> {
  try {
    const res = await fetch(EXPECTED_MODEL_URL, { method: 'HEAD' });
    if (res.ok) {
      return true;
    }
    // Some static dev servers may not support HEAD, try GET
    const getRes = await fetch(EXPECTED_MODEL_URL, { method: 'GET', headers: { Range: 'bytes=0-100' } });
    return getRes.ok;
  } catch (err) {
    console.warn('[TensorFlow.js] Model files check returned error:', err);
    return false;
  }
}

/**
 * Fetches the labels.json file
 */
export async function loadLabels(): Promise<string[]> {
  try {
    const res = await fetch(EXPECTED_LABELS_URL);
    if (!res.ok) {
      console.warn('[TensorFlow.js] labels.json not found at', EXPECTED_LABELS_URL, 'using default class mapping.');
      cachedLabels = ['healthy', 'damaged', 'rotten', 'sprouted', 'other'];
      return cachedLabels;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      cachedLabels = data.map(String);
    } else if (data && Array.isArray(data.labels)) {
      cachedLabels = data.labels.map(String);
    } else {
      console.warn('[TensorFlow.js] Unexpected labels.json structure, falling back to 5 default classes:', data);
      cachedLabels = ['healthy', 'damaged', 'rotten', 'sprouted', 'other'];
    }
    console.info('[TensorFlow.js] Loaded labels successfully:', cachedLabels);
    return cachedLabels;
  } catch (err) {
    console.error('[TensorFlow.js] Error loading labels.json:', err);
    cachedLabels = ['healthy', 'damaged', 'rotten', 'sprouted', 'other'];
    return cachedLabels;
  }
}


/**
 * Loads the real TensorFlow.js model from /models/onion-quality/model.json
 */
export async function loadOnionModel(): Promise<tf.LayersModel> {
  if (cachedModel) {
    return cachedModel;
  }

  if (loadPromise) {
    return loadPromise;
  }

  lastLoadStatus = {
    status: 'loading',
    isAvailable: false,
  };

  loadPromise = (async () => {
    try {
      console.info('[TensorFlow.js] Loading layers model from:', EXPECTED_MODEL_URL);
      
      // Load labels concurrently
      await loadLabels();

      // Load model
      const model = await tf.loadLayersModel(EXPECTED_MODEL_URL);
      cachedModel = model;

      // Extract input shape
      let inputShape: number[] = [224, 224, 3];
      if (model.inputs && model.inputs.length > 0 && model.inputs[0].shape) {
        inputShape = model.inputs[0].shape.filter((d): d is number => typeof d === 'number' && d > 0);
        console.info('[TensorFlow.js] Model loaded successfully. Input shape:', model.inputs[0].shape);
      }
      if (model.outputs && model.outputs.length > 0 && model.outputs[0].shape) {
        console.info('[TensorFlow.js] Model output shape:', model.outputs[0].shape);
      }

      lastLoadStatus = {
        status: 'loaded',
        isAvailable: true,
        modelInputShape: inputShape,
        labelsCount: cachedLabels?.length || 5,
      };

      return model;
    } catch (err) {
      console.error('[TensorFlow.js] Failed to load model from /models/onion-quality/model.json:', err);
      cachedModel = null;
      lastLoadStatus = {
        status: 'error',
        isAvailable: false,
        errorMessage: 'AI model is not available. Please add the trained model files.',
      };
      throw new Error('AI model is not available. Please add the trained model files.');
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Returns current model status
 */
export function getModelStatus(): ModelLoadStatus {
  return lastLoadStatus;
}

/**
 * Preprocesses an image and runs model.predict() using TensorFlow.js
 * Disposes all allocated tensors immediately to avoid browser memory leaks.
 */
export async function predictWithTfModel(
  imageSource: HTMLImageElement | string,
  minConfidenceThreshold = 0.60
): Promise<TfPredictionResult> {
  const startTime = performance.now();

  // 1. Ensure real model is loaded
  const model = await loadOnionModel();
  const labels = await loadLabels();

  // 2. Load image element
  let imgElement: HTMLImageElement;
  if (typeof imageSource === 'string') {
    imgElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for AI inference.'));
      img.src = imageSource;
    });
  } else {
    imgElement = imageSource;
  }

  // 3. Inspect expected input dimensions from model.inputs[0].shape
  // e.g. [null, 224, 224, 3] or [null, 150, 150, 3]
  let targetWidth = 224;
  let targetHeight = 224;

  if (model.inputs && model.inputs[0] && model.inputs[0].shape) {
    const shape = model.inputs[0].shape;
    // Typical shape: [batch, height, width, channels]
    if (shape.length === 4) {
      if (typeof shape[1] === 'number' && shape[1] > 0) targetHeight = shape[1];
      if (typeof shape[2] === 'number' && shape[2] > 0) targetWidth = shape[2];
    }
  }

  console.info(`[TensorFlow.js] Preprocessing input image to size: ${targetWidth}x${targetHeight}`);

  // 4. Preprocess on an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for image preprocessing.');
  }

  ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);

  // 5. Convert to tensor, normalize (image / 255.0), and expand dims: [1, H, W, 3]
  let rawProbs: number[] = [];
  const modelInputShape: number[] = [1, targetHeight, targetWidth, 3];
  let modelOutputShape: number[] = [];

  tf.tidy(() => {
    // Read pixels into tensor3d
    const imgTensor = tf.browser.fromPixels(canvas);
    // Convert to float and normalize: image / 255.0
    const normalized = imgTensor.toFloat().div(tf.scalar(255.0));
    // Expand to batch dimension: [1, targetHeight, targetWidth, 3]
    const batched = normalized.expandDims(0);

    // Run real inference
    const outputTensor = model.predict(batched) as tf.Tensor;
    modelOutputShape = outputTensor.shape;

    // Check if softmax needs to be applied (if output values don't sum close to 1)
    let probsTensor = outputTensor;
    const squeezed = outputTensor.squeeze();
    
    // Read values
    const data = Array.from(squeezed.dataSync());
    const sum = data.reduce((a, b) => a + b, 0);

    if (Math.abs(sum - 1.0) > 0.05) {
      // Apply softmax if logits were returned
      const softmaxed = tf.softmax(squeezed);
      rawProbs = Array.from(softmaxed.dataSync());
    } else {
      rawProbs = data;
    }
  });

  const executionTimeMs = Math.round(performance.now() - startTime);
  console.info('[TensorFlow.js] Inference completed in', executionTimeMs, 'ms. Raw probabilities:', rawProbs);

  // 6. Map predictions to labels
  const classProbabilities: ClassProbability[] = labels.map((rawLabel, idx) => {
    const normalizedLabel = rawLabel.toLowerCase().trim() as OnionModelClass;
    const validClass: OnionModelClass = 
      ['healthy', 'damaged', 'rotten', 'sprouted', 'other'].includes(normalizedLabel)
        ? (normalizedLabel as OnionModelClass)
        : 'other';

    const prob = rawProbs[idx] !== undefined ? rawProbs[idx] : 0;
    const percentage = parseFloat((prob * 100).toFixed(1));

    return {
      className: validClass,
      displayName: QUALITY_INTERPRETATIONS[validClass]?.displayName || rawLabel,
      probability: prob,
      percentage,
    };
  });

  // Ensure all 5 standard classes exist in the output display
  const standardClasses: OnionModelClass[] = ['healthy', 'damaged', 'rotten', 'sprouted', 'other'];
  for (const std of standardClasses) {
    if (!classProbabilities.some(cp => cp.className === std)) {
      classProbabilities.push({
        className: std,
        displayName: QUALITY_INTERPRETATIONS[std].displayName,
        probability: 0,
        percentage: 0,
      });
    }
  }

  // 7. Find highest-confidence class
  let highestIndex = 0;
  let maxProbability = -1;

  for (let i = 0; i < rawProbs.length; i++) {
    if (rawProbs[i] > maxProbability) {
      maxProbability = rawProbs[i];
      highestIndex = i;
    }
  }

  const rawWinningLabel = labels[highestIndex] ? labels[highestIndex].toLowerCase().trim() : 'other';
  const predictedClass: OnionModelClass = 
    ['healthy', 'damaged', 'rotten', 'sprouted', 'other'].includes(rawWinningLabel)
      ? (rawWinningLabel as OnionModelClass)
      : 'other';

  const confidencePercentage = parseFloat((maxProbability * 100).toFixed(1));

  // 8. Confidence threshold rule (< 60%)
  const isLowConfidence = maxProbability < minConfidenceThreshold;
  const lowConfidenceWarning = isLowConfidence
    ? 'Low confidence — please capture a clearer image of a single onion.'
    : undefined;

  const info = QUALITY_INTERPRETATIONS[predictedClass];

  return {
    predictedClass,
    displayName: info.displayName,
    confidencePercentage,
    qualityText: info.quality,
    recommendationText: info.recommendation,
    allProbabilities: classProbabilities,
    isLowConfidence,
    lowConfidenceWarning,
    modelInputShape,
    modelOutputShape,
    rawProbabilities: rawProbs,
    executionTimeMs,
  };

}

/**
 * Clears cached model to free memory
 */
export function disposeCachedModel(): void {
  if (cachedModel) {
    try {
      cachedModel.dispose();
      console.info('[TensorFlow.js] Disposed cached model from memory.');
    } catch (err) {
      console.warn('[TensorFlow.js] Error disposing model:', err);
    }
    cachedModel = null;
  }
  loadPromise = null;
  lastLoadStatus = {
    status: 'unloaded',
    isAvailable: false,
  };
}
