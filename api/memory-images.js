import { verifyUnlockToken } from './_unlockToken.js';

const readBearerToken = (request) => {
  const authorization = request.headers?.authorization || request.headers?.Authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return request.headers?.['x-unlock-token'] || request.query?.unlockToken || '';
};

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({
      success: false,
      message: 'Please request memory images after unlocking the book.',
    });
  }

  const verification = verifyUnlockToken(readBearerToken(request), process.env.UNLOCK_TOKEN_SECRET);

  if (!verification.valid) {
    return response.status(401).json({
      success: false,
      message: 'Memory images are locked.',
    });
  }

  if (process.env.PRIVATE_MEMORY_IMAGES_ENABLED !== 'true') {
    return response.status(200).json({
      success: true,
      configured: false,
      images: [],
      message: 'Private memory images are not configured yet.',
    });
  }

  return response.status(200).json({
    success: true,
    configured: true,
    images: [],
    message: 'Private image storage provider is not connected yet.',
  });
}
