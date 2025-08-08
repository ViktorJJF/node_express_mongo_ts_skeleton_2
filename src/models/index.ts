// Models are no longer needed - use database schemas directly with db.ts helpers
// This file is kept for compatibility but exports nothing

export default () => {
  console.log(
    '✅ Database schemas loaded (models are now handled by schemas + db.ts helpers)',
  );
};
