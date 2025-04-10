import OpenAI from 'openai';
import { rateLimit } from './rateLimit';
import { PracticePlanRequest } from '../types/assistant';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key is not set. AI features will be disabled.');
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
}) : null;

// Rate limiter: 3 requests per minute
const rateLimiter = rateLimit(3, 60000);

export class OpenAIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

const handleOpenAIError = (error: any): never => {
  console.error('OpenAI API error:', error);

  if (error instanceof OpenAIError) {
    throw error;
  }

  if (!apiKey) {
    throw new OpenAIError(
      'OpenAI API key not configured. Please check your settings.',
      'API_KEY_MISSING'
    );
  }

  if (error.error?.type === 'insufficient_quota') {
    throw new OpenAIError(
      'API quota exceeded. Please try again later.',
      'QUOTA_EXCEEDED'
    );
  }

  if (error.error?.type === 'rate_limit_exceeded') {
    throw new OpenAIError(
      'Too many requests. Please wait a moment and try again.',
      'RATE_LIMIT'
    );
  }

  if (error.error?.type === 'invalid_request_error') {
    throw new OpenAIError(
      'Invalid request. Please try again with different input.',
      'INVALID_REQUEST'
    );
  }

  if (error.error?.message) {
    throw new OpenAIError(error.error.message, 'API_ERROR');
  }

  throw new OpenAIError(
    'An unexpected error occurred. Please try again.',
    'UNKNOWN'
  );
};

export const generateChatResponse = async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
  if (!openai) {
    throw new OpenAIError(
      'OpenAI client not initialized. Please check your API key configuration.',
      'NOT_INITIALIZED'
    );
  }

  try {
    await rateLimiter();
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert softball coach with years of experience. You provide detailed, accurate, and helpful advice about softball coaching, techniques, strategies, and practice planning."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new OpenAIError('No response received from assistant', 'NO_RESPONSE');
    }

    return content;
  } catch (error) {
    handleOpenAIError(error);
  }
};

export const generatePracticePlan = async (request: PracticePlanRequest) => {
  if (!openai) {
    throw new OpenAIError(
      'OpenAI client not initialized. Please check your API key configuration.',
      'NOT_INITIALIZED'
    );
  }

  try {
    await rateLimiter();

    const prompt = `Create a detailed softball practice plan with the following requirements:
      Focus Area: ${request.focus}
      Duration: ${request.duration} minutes
      Skill Level: ${request.skillLevel}
      ${request.playerCount ? `Number of Players: ${request.playerCount}` : ''}
      ${request.equipment ? `Available Equipment: ${request.equipment.join(', ')}` : ''}

      Please provide a structured practice plan that includes:
      1. Warm-up activities
      2. Main drills and exercises
      3. Cool-down activities
      4. Coaching points and key observations
      5. Time allocation for each activity

      Format the response in a clear, easy-to-follow structure.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert softball coach specializing in practice planning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new OpenAIError('No response received from assistant', 'NO_RESPONSE');
    }

    return content;
  } catch (error) {
    handleOpenAIError(error);
  }
};

export const generateDrillImage = async (drill: {
  name: string;
  description: string;
  category: string;
}) => {
  if (!openai) {
    throw new OpenAIError(
      'OpenAI client not initialized. Please check your API key configuration.',
      'NOT_INITIALIZED'
    );
  }

  try {
    await rateLimiter();

    const prompt = `Create a realistic photo of a softball player or coach demonstrating a ${drill.category.toLowerCase()} drill: ${drill.name}. ${drill.description}. The image should be clear, well-lit, and show proper form. Style: sports photography, action shot, professional quality.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const url = response.data[0].url;
    if (!url) {
      throw new OpenAIError('No image generated', 'NO_RESPONSE');
    }

    return url;
  } catch (error) {
    handleOpenAIError(error);
  }
};