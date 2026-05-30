import { list } from '@vercel/blob';
import { verifyUnlockToken } from './_unlockToken.js';

export const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const getMemoryImagesPrefix = () => {
  const prefix = process.env.MEMORY_IMAGES_PREFIX || 'memories/';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
};

export const isAllowedImagePathname = (pathname, prefix = getMemoryImagesPrefix()) => {
  const normalizedPathname = String(pathname || '');
  const lowerPathname = normalizedPathname.toLowerCase();
  const extension = lowerPathname.slice(lowerPathname.lastIndexOf('.'));

  return (
    normalizedPathname.startsWith(prefix) &&
    !normalizedPathname.includes('..') &&
    !normalizedPathname.includes('\\') &&
    ALLOWED_IMAGE_EXTENSIONS.has(extension)
  );
};

export const readUnlockToken = (request) => {
  const authorization = request.headers?.authorization || request.headers?.Authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return request.headers?.['x-unlock-token'] || request.query?.token || request.query?.unlockToken || '';
};

export const validateMemoryImageAccess = (request) => {
  const verification = verifyUnlockToken(readUnlockToken(request), process.env.UNLOCK_TOKEN_SECRET);

  if (!verification.valid) {
    return {
      ok: false,
      status: 401,
      payload: {
        success: false,
        message: 'Memory images are locked.',
      },
    };
  }

  if (process.env.PRIVATE_MEMORY_IMAGES_ENABLED !== 'true') {
    return {
      ok: false,
      status: 200,
      payload: {
        success: true,
        configured: false,
        images: [],
        message: 'Private memory images are not configured yet.',
      },
    };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      status: 500,
      payload: {
        success: false,
        message: 'Private memory images are enabled but storage is not configured yet.',
      },
    };
  }

  return {
    ok: true,
  };
};

export const validateUnlockOnly = (request) => {
  const verification = verifyUnlockToken(readUnlockToken(request), process.env.UNLOCK_TOKEN_SECRET);

  if (!verification.valid) {
    return {
      ok: false,
      status: 401,
      payload: {
        success: false,
        message: 'Memory images are locked.',
      },
    };
  }

  return {
    ok: true,
  };
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({
      success: false,
      message: 'Please request memory images after unlocking the book.',
    });
  }

  const access = validateMemoryImageAccess(request);

  if (!access.ok) {
    return response.status(access.status).json(access.payload);
  }

  try {
    const prefix = getMemoryImagesPrefix();
    const result = await list({
      prefix,
      limit: 100,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const images = result.blobs
      .filter((blob) => isAllowedImagePathname(blob.pathname, prefix))
      .map((blob) => ({
        id: blob.pathname,
        pathname: blob.pathname,
        filename: blob.pathname.slice(prefix.length),
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }));

    return response.status(200).json({
      success: true,
      configured: true,
      images,
      hasMore: result.hasMore,
    });
  } catch {
    return response.status(500).json({
      success: false,
      message: 'Private memory images could not be loaded right now.',
    });
  }
}
