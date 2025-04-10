export const rateLimit = (maxRequests: number, timeWindow: number) => {
  const requests: number[] = [];
  
  return async () => {
    const now = Date.now();
    
    // Remove expired timestamps
    while (requests.length > 0 && requests[0] <= now - timeWindow) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      const oldestRequest = requests[0];
      const waitTime = oldestRequest + timeWindow - now;
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    requests.push(now);
  };
};