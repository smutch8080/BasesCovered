// This file is only used for server-side scripts
import { config } from 'dotenv';

export function loadEnv() {
  try {
    // Load .env file
    const result = config();
    
    if (result.error) {
      console.warn('Error loading .env file:', result.error);
      return process.env;
    }

    return {
      ...process.env,
      ...result.parsed
    };
  } catch (error) {
    console.warn('Error loading environment variables:', error);
    return process.env;
  }
}