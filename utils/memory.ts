// Memory System for Kookie AI
// Stores and retrieves user preferences, facts, and conversation context

export interface MemoryData {
  [key: string]: string;
}

const MEMORY_KEY = 'kookie_memories';

/**
 * Save a memory to localStorage
 */
export function saveMemory(key: string, value: string): void {
  try {
    const memories = getMemories();
    memories[key] = value;
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
    console.log(`Memory saved: ${key} = ${value}`);
  } catch (err) {
    console.error('Failed to save memory:', err);
  }
}

/**
 * Get a specific memory by key
 */
export function getMemory(key: string): string | null {
  try {
    const memories = getMemories();
    return memories[key] || null;
  } catch (err) {
    console.error('Failed to get memory:', err);
    return null;
  }
}

/**
 * Get all memories
 */
export function getMemories(): MemoryData {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('Failed to load memories:', err);
    return {};
  }
}

/**
 * Delete a specific memory
 */
export function deleteMemory(key: string): void {
  try {
    const memories = getMemories();
    delete memories[key];
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
    console.log(`Memory deleted: ${key}`);
  } catch (err) {
    console.error('Failed to delete memory:', err);
  }
}

/**
 * Clear all memories
 */
export function clearAllMemories(): void {
  try {
    localStorage.removeItem(MEMORY_KEY);
    console.log('All memories cleared');
  } catch (err) {
    console.error('Failed to clear memories:', err);
  }
}

/**
 * Search memories by keyword
 */
export function searchMemories(keyword: string): MemoryData {
  try {
    const memories = getMemories();
    const result: MemoryData = {};
    const lowerKeyword = keyword.toLowerCase();
    
    for (const [key, value] of Object.entries(memories)) {
      if (key.toLowerCase().includes(lowerKeyword) || 
          value.toLowerCase().includes(lowerKeyword)) {
        result[key] = value;
      }
    }
    
    return result;
  } catch (err) {
    console.error('Failed to search memories:', err);
    return {};
  }
}
