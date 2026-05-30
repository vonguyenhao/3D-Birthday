import { get } from '@vercel/blob';
import {
  getMemoryImagesPrefix,
  isAllowedImagePathname,
  validateMemoryImageAccess,
  validateUnlockOnly,
} from './memory-images.js';

const streamToResponse = async (stream, response) => {
  if (!stream) {
    response.end();
    return;
  }

  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      response.write(Buffer.from(value));
    }
  } finally {
    response.end();
  }
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({
      success: false,
      message: 'Please request memory images after unlocking the book.',
    });
  }

  const unlockAccess = validateUnlockOnly(request);

  if (!unlockAccess.ok) {
    return response.status(unlockAccess.status).json(unlockAccess.payload);
  }

  const prefix = getMemoryImagesPrefix();
  const pathname = String(request.query?.pathname || '');

  if (!isAllowedImagePathname(pathname, prefix)) {
    return response.status(400).json({
      success: false,
      message: 'That memory image path is not allowed.',
    });
  }

  const access = validateMemoryImageAccess(request);

  if (!access.ok) {
    return response.status(access.status).json(access.payload);
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      useCache: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return response.status(404).json({
        success: false,
        message: 'That memory image was not found.',
      });
    }

    response.status(200);
    response.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream');
    response.setHeader('Content-Length', String(result.blob.size));
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');

    return streamToResponse(result.stream, response);
  } catch {
    return response.status(500).json({
      success: false,
      message: 'That memory image could not be loaded right now.',
    });
  }
}
