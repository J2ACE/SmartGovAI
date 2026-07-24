import { Request, Response } from 'express';

export const getHeatmapGeoJson = async (req: Request, res: Response) => {
  const { divisionId, category } = req.query;

  // PostGIS GeoJSON Spatial Heatmap Format
  const mockGeoJsonPoints = [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8777, 19.076] }, properties: { weight: 0.9, category: 'POTHOLE' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8820, 19.081] }, properties: { weight: 0.7, category: 'GARBAGE_DUMP' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8650, 19.065] }, properties: { weight: 0.85, category: 'WATER_LEAKAGE' } },
  ];

  return res.status(200).json({
    type: 'FeatureCollection',
    features: mockGeoJsonPoints,
  });
};
