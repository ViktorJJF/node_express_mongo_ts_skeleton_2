import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Load versioned routes
const versions = ['v1', 'v2'];

versions.forEach((version) => {
  const versionPath = path.join(__dirname, version);

  // Check if version directory exists
  if (fs.existsSync(versionPath)) {
    const versionRouter = require(path.join(versionPath, 'index')).default;

    // Mount versioned routes
    if (version === 'v1') {
      // v1 is the default version, mount at root
      console.log('mounting v1 routes: ', versionPath);
      router.use('/', versionRouter);
    }

    // Mount versioned routes at /api/v{version}
    router.use(`/${version}`, versionRouter);
  }
});

export default router;
