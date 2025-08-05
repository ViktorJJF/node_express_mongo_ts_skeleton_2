import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Dynamically load routes from the current directory
fs.readdirSync(__dirname)
    .filter(
        (file) =>
            file.indexOf('.') !== 0 &&
            file !== path.basename(__filename) &&
            file.slice(-3) === '.ts'
    )
    .forEach((file) => {
        const route = require(path.join(__dirname, file)).default;
        router.use('/', route);
    });

export default router; 