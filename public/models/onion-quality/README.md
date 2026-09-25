# Onion Quality Assessment Model Setup Guide

This directory hosts the client-side TensorFlow.js model for **OnionGuard AI** (Smart India Hackathon 2026 Problem Statement SIH26031).

---

## Required Files

Place your trained TensorFlow.js model files in this exact folder:

```
public/
└── models/
    └── onion-quality/
        ├── model.json            <-- Model architecture and topology definition
        ├── group1-shard1of1.bin   <-- Model weights (one or more .bin files)
        └── labels.json           <-- Class labels list
```

---

## 1. Class Labels (`labels.json`)

The model must classify onion images into exactly these **5 classes**:

```json
{
  "labels": [
    "healthy",
    "damaged",
    "rotten",
    "sprouted",
    "other"
  ]
}
```

The order of labels in `labels.json` must correspond directly to the model's output neurons index:
- Index `0`: `healthy`
- Index `1`: `damaged`
- Index `2`: `rotten`
- Index `3`: `sprouted`
- Index `4`: `other`

---

## 2. Model Training & Export

The model must be trained on **REAL labelled onion images** (e.g. using TensorFlow, Keras, or PyTorch) and then converted to TensorFlow.js format.

### Example Conversion using `tensorflowjs_converter`:

If you trained your model in Keras (`.h5` or SavedModel):

```bash
pip install tensorflowjs

# Convert Keras H5 model:
tensorflowjs_converter --input_format=keras path/to/onion_model.h5 public/models/onion-quality/

# Or convert TensorFlow SavedModel:
tensorflowjs_converter --input_format=tf_saved_model path/to/saved_model public/models/onion-quality/
```

This will generate:
- `model.json`
- `group1-shard1of1.bin` (or multiple shard `.bin` files)

---

## 3. Input Shape & Normalization

- **Input Shape**: The app dynamically inspects `model.inputs[0].shape` (typically `[null, 224, 224, 3]`).
- **Normalization**: Pixel values are normalized by dividing by 255.0 (`image / 255.0`), yielding values in range `[0.0, 1.0]`.
- **Output**: 5 probabilities (Softmax activation).

---

## 4. Behavior when Model is Missing

If `model.json` or its `.bin` files are not placed in this directory:
- The website displays:  
  **"AI model is not available. Please add the trained model files."**
- In accordance with SIH prototype honesty guidelines, **no fake, random, or hardcoded predictions are generated**.
