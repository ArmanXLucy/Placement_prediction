const fs = require('fs');
const path = require('path');

const FEATURES = [
  'cgpa',
  'skills_count',
  'projects_count',
  'internships_count',
  'certifications_count',
  'backlogs'
];

const MODEL_PATH = path.join(__dirname, 'model.json');

function sigmoid(z) {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values, avg) {
  return Math.sqrt(
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length
  ) || 1;
}

/** Convert a student-like object into the numeric feature vector. */
function toFeatureVector(student, skillsCount) {
  return [
    Number(student.cgpa) || 0,
    Number(skillsCount ?? student.skills_count) || 0,
    Number(student.projects_count) || 0,
    Number(student.internships_count) || 0,
    Number(student.certifications_count) || 0,
    Number(student.backlogs) || 0
  ];
}

function normalize(vector, model) {
  return vector.map((v, i) => (v - model.means[i]) / model.stds[i]);
}

/** Returns a probability between 0 and 1. */
function predictProbability(model, vector) {
  const z = normalize(vector, model);
  let logit = model.bias;
  for (let i = 0; i < model.weights.length; i += 1) {
    logit += model.weights[i] * z[i];
  }
  return sigmoid(logit);
}

function shuffle(items, seed = 42) {
  const arr = [...items];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function computeMetrics(yTrue, yPred, probabilities) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  yTrue.forEach((actual, i) => {
    const predicted = yPred[i];
    if (actual === 1 && predicted === 1) tp += 1;
    else if (actual === 0 && predicted === 0) tn += 1;
    else if (actual === 0 && predicted === 1) fp += 1;
    else fn += 1;
  });

  const total = yTrue.length || 1;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  // AUC via pairwise ranking (probabilities vs. labels).
  const positives = [];
  const negatives = [];
  probabilities.forEach((p, i) => (yTrue[i] === 1 ? positives : negatives).push(p));
  let auc = 0.5;
  if (positives.length && negatives.length) {
    let wins = 0;
    positives.forEach((p) => {
      negatives.forEach((n) => {
        if (p > n) wins += 1;
        else if (p === n) wins += 0.5;
      });
    });
    auc = wins / (positives.length * negatives.length);
  }

  return {
    accuracy: Number(((tp + tn) / total).toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
    auc: Number(auc.toFixed(4)),
    samples: total,
    confusion: { tp, tn, fp, fn }
  };
}

/**
 * Train a logistic regression model on placement_history rows.
 * Features are standardized; labels are 0/1.
 */
function trainLogistic(rawRows, { epochs = 4000, learningRate = 0.35, l2 = 0.001 } = {}) {
  const rows = rawRows.filter(
    (r) => r.is_placed !== null && r.is_placed !== undefined
  );
  if (rows.length < 20) {
    throw new Error('Not enough placement_history rows to train (need at least 20)');
  }

  const X = rows.map((r) => FEATURES.map((f) => Number(r[f]) || 0));
  const y = rows.map((r) => Number(r.is_placed) || 0);

  const means = FEATURES.map((_, i) => mean(X.map((row) => row[i])));
  const stds = FEATURES.map((_, i) => stddev(X.map((row) => row[i]), means[i]));

  const normalized = X.map((row) => row.map((v, i) => (v - means[i]) / stds[i]));

  const shuffled = shuffle(rows.map((_, i) => i), 2024);
  const splitIndex = Math.floor(shuffled.length * 0.8);
  const trainIdx = shuffled.slice(0, splitIndex);
  const testIdx = shuffled.slice(splitIndex);

  const weights = new Array(FEATURES.length).fill(0);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const gradW = new Array(FEATURES.length).fill(0);
    let gradB = 0;

    trainIdx.forEach((idx) => {
      const row = normalized[idx];
      let logit = bias;
      for (let i = 0; i < row.length; i += 1) logit += weights[i] * row[i];
      const p = sigmoid(logit);
      const error = p - y[idx];
      for (let i = 0; i < row.length; i += 1) gradW[i] += error * row[i];
      gradB += error;
    });

    const m = trainIdx.length;
    for (let i = 0; i < weights.length; i += 1) {
      weights[i] -= learningRate * (gradW[i] / m + l2 * weights[i]);
    }
    bias -= learningRate * (gradB / m);
  }

  const model = {
    version: 1,
    algorithm: 'logistic_regression',
    features: FEATURES,
    means,
    stds,
    weights: weights.map((w) => Number(w.toFixed(6))),
    bias: Number(bias.toFixed(6)),
    trained_at: new Date().toISOString()
  };

  const trainProb = trainIdx.map((idx) =>
    predictProbability(model, X[idx])
  );
  const testProb = testIdx.map((idx) => predictProbability(model, X[idx]));
  const threshold = 0.5;

  model.metrics = {
    train: computeMetrics(
      trainIdx.map((i) => y[i]),
      trainProb.map((p) => (p >= threshold ? 1 : 0)),
      trainProb
    ),
    test: computeMetrics(
      testIdx.map((i) => y[i]),
      testProb.map((p) => (p >= threshold ? 1 : 0)),
      testProb
    )
  };

  return model;
}

function saveModel(model) {
  fs.writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2));
  return MODEL_PATH;
}

function loadModel() {
  // Prefer require() so bundlers (e.g. Vercel/@vercel/nft) include model.json
  // in the serverless function automatically.
  try {
    return require(MODEL_PATH);
  } catch {
    // Fall back to the filesystem for freshly trained models.
  }
  try {
    if (!fs.existsSync(MODEL_PATH)) return null;
    return JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = {
  FEATURES,
  MODEL_PATH,
  sigmoid,
  toFeatureVector,
  predictProbability,
  trainLogistic,
  saveModel,
  loadModel
};
