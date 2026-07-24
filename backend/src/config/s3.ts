import { env } from './env';

export const s3Config = {
  region: process.env.AWS_REGION || 'ap-south-1',
  bucketName: process.env.AWS_S3_BUCKET || 'smartgov-media-storage',
  cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN || 'https://media.smartgov.ai',
};

// Generates S3 Key for complaint media
export const generateS3Key = (category: string, filename: string): string => {
  const timestamp = Date.now();
  const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const extension = filename.split('.').pop() || 'jpg';
  return `complaints/${sanitizedCategory}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
};
