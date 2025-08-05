import express, { Router } from 'express';

const router: Router = express.Router();

/* #swagger.tags = ['v2']
   #swagger.summary = 'Example endpoint for API v2'
   #swagger.responses[200] = {
       description: 'Success response from v2 API',
       content: {
           'application/json': {
               schema: {
                   type: 'object',
                   properties: {
                       message: { type: 'string' },
                       version: { type: 'string' },
                       timestamp: { type: 'string' }
                   }
               }
           }
       }
   } */
router.get('/example', (req, res) => {
    res.json({
        message: 'Hello from API v2!',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

export default router;
