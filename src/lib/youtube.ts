import { generateChatResponse } from './openai';
import { Resource } from '../types';

export async function searchYouTubeVideos(drill: {
  name: string;
  category: string;
  description: string;
}): Promise<Resource[]> {
  try {
    const prompt = `Given this softball drill:
      Name: ${drill.name}
      Category: ${drill.category}
      Description: ${drill.description}

      Generate 3 different YouTube search queries that would find relevant instructional videos for this drill. Return ONLY a valid JSON array of strings, with each string being a search query. Example: ["query 1", "query 2", "query 3"]`;

    const response = await generateChatResponse([{ role: 'user', content: prompt }]);
    
    if (!response) {
      return [];
    }

    try {
      // Parse the response into search queries
      const searchQueries = JSON.parse(response.trim()) as string[];

      if (!Array.isArray(searchQueries)) {
        throw new Error('Invalid response format');
      }

      // Generate results for each query
      const results: Resource[] = searchQueries.map((query) => ({
        type: 'video',
        title: `${drill.name} - ${query} Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      }));

      // Return unique results
      return Array.from(
        new Set(results.map(r => r.url))
      ).map(url => results.find(r => r.url === url)!);

    } catch (error) {
      console.error('Error parsing search queries:', error);
      return [];
    }
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
}