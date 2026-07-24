import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { s3Config, generateS3Key } from '../config/s3';

export const presignedUrlSchema = z.object({
  body: z.object({
    filename: z.string().min(1, 'Filename required'),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
      errorMap: () => ({ message: 'Only JPEG, PNG, and WEBP image formats are supported' }),
    }),
    category: z.string().default('UNCATEGORIZED'),
  }),
});

export const getPresignedUploadUrl = async (req: AuthenticatedRequest, res: Response) => {
  const { filename, mimeType, category } = req.body;
  const s3Key = generateS3Key(category, filename);

  // Simulated S3 Presigned URL for development/staging deployment
  const mockPresignedUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${s3Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK_CREDENTIALS`;
  const publicUrl = `${s3Config.cdnDomain}/${s3Key}`;

  return res.status(200).json({
    success: true,
    message: 'Presigned upload URL generated successfully.',
    data: {
      uploadUrl: mockPresignedUrl,
      s3Key,
      publicUrl,
      expiresInSeconds: 900, // 15 minutes
    },
  });
};
