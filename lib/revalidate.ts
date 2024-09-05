/* eslint-disable no-console */
// app/lib/revalidate.ts

export async function callRevalidationWebhook(path?: string, tag?: string) {
    const secret = process.env.REVALIDATION_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    let webhookUrl = `${baseUrl}/api/revalidate?secret=${secret}`
    if (path) webhookUrl += `&path=${encodeURIComponent(path)}`
    if (tag) webhookUrl += `&tag=${encodeURIComponent(tag)}`
    
    try {
      const response = await fetch(webhookUrl, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to revalidate')
      console.log('Revalidation triggered successfully')
    } catch (error) {
      console.error('Error triggering revalidation:', error)
    }
  }