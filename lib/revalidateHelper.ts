/* eslint-disable no-console */
// app/lib/revalidateHelper.ts

export async function revalidateData(path: string) {
    const secret = process.env.REVALIDATION_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const webhookUrl = `${baseUrl}/api/revalidate?secret=${secret}&path=${encodeURIComponent(path)}`;
    
    try {
      const response = await fetch(webhookUrl, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to revalidate');
      console.log('Revalidation triggered successfully');
    } catch (error) {
      console.error('Error triggering revalidation:', error);
    }
  }