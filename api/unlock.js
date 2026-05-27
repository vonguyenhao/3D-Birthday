const normalizeAnswer = (value) => String(value ?? '').trim().toLocaleLowerCase();

const timingSafeEqual = (left, right) => {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
};

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({
      success: false,
      message: 'Please submit the birthday questions to unlock the message.',
    });
  }

  const expectedAnswer1 = process.env.SECRET_ANSWER_1;
  const expectedAnswer2 = process.env.SECRET_ANSWER_2;
  const secretMessage = process.env.SECRET_MESSAGE;

  if (!expectedAnswer1 || !expectedAnswer2 || !secretMessage) {
    return response.status(500).json({
      success: false,
      message: 'The secret message is not configured yet.',
    });
  }

  try {
    const answer1 = normalizeAnswer(request.body?.answer1);
    const answer2 = normalizeAnswer(request.body?.answer2);
    const correctAnswer1 = normalizeAnswer(expectedAnswer1);
    const correctAnswer2 = normalizeAnswer(expectedAnswer2);

    const answersMatch =
      timingSafeEqual(answer1, correctAnswer1) && timingSafeEqual(answer2, correctAnswer2);

    if (!answersMatch) {
      return response.status(200).json({
        success: false,
        message: 'Câu trả lời xém đúng ròi, thử lại lần nữa nha em :)))',
      });
    }

    return response.status(200).json({
      success: true,
      message: secretMessage,
    });
  } catch {
    return response.status(400).json({
      success: false,
      message: 'Có cái gì đó lag nhẹ, thử lại lần nữa xem nha',
    });
  }
}
