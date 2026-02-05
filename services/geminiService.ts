// Mock service since @google/genai dependency has been removed to fix loading issues.

/**
 * Summarizes a long message for the user.
 * (Mock implementation)
 */
export const summarizeMessage = async (content: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return `[System Summary] This message is about: ${content.substring(0, 50)}... (AI summarization is currently disabled).`;
};

/**
 * Drafts a formal announcement based on a short topic/intent.
 * (Mock implementation)
 */
export const draftAnnouncement = async (topic: string, tone: 'formal' | 'friendly' | 'urgent'): Promise<{ subject: string; content: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const tones = {
    formal: "Please be informed that",
    friendly: "We are excited to share that",
    urgent: "URGENT ATTENTION REQUIRED:"
  };

  return {
    subject: `[Draft] Announcement: ${topic}`,
    content: `**${tone.toUpperCase()} UPDATE**\n\n${tones[tone]} ${topic}.\n\nThis is a template draft generated without AI connectivity. Please edit this text to add specific details, dates, and requirements before sending.\n\nBest regards,\nManagement Team`
  };
};