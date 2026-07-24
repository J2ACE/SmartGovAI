import { Router } from 'express';
import { getHeatmapGeoJson } from '../controllers/spatialController';

const router = Router();

router.get('/heatmap', getHeatmapGeoJson);

export default router;
