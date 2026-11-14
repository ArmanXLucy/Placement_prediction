const pool = require('../config/database');
const {
  trainLogistic,
  saveModel,
  loadModel,
  MODEL_PATH
} = require('./logisticRegression');

async function fetchTrainingRows() {
  const [rows] = await pool.query(
    `SELECT cgpa, skills_count, projects_count, internships_count,
            certifications_count, backlogs, is_placed
       FROM placement_history
      WHERE is_placed IS NOT NULL`
  );
  return rows;
}

/** Load the saved model, or train and save one on first use. */
async function ensureModel() {
  const saved = loadModel();
  if (saved) return saved;
  const rows = await fetchTrainingRows();
  const model = trainLogistic(rows);
  saveModel(model);
  return model;
}

async function main() {
  const rows = await fetchTrainingRows();
  if (!rows.length) {
    console.error(
      '[train] placement_history is empty. Run `npm run seed` first.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`[train] Training on ${rows.length} placement_history rows...`);
  const model = trainLogistic(rows);
  saveModel(model);

  console.log(`[train] Model saved to ${MODEL_PATH}`);
  console.log('[train] Test metrics:', model.metrics.test);
  console.log('[train] Weights:', model.weights);
  console.log('[train] Bias:', model.bias);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('[train] Failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { ensureModel, fetchTrainingRows, main };
