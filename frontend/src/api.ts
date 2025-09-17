
import { GenerateRequest, GenerateResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'


// Generate test data from fields
export async function generateTestData(request: { fields: any[] }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/generate/testdata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error('Failed to generate test data');
  return await response.json();
}


// Fetch JIRA issue by ID via backend proxy
export async function fetchJiraIssue(jiraId: string): Promise<{ summary: string, description: string }> {
  if (!jiraId.trim()) throw new Error('JIRA ID is required')
  const response = await fetch(`${API_BASE_URL}/generate/jira/${jiraId}`)
  if (!response.ok) throw new Error('Failed to fetch JIRA issue')
  const data = await response.json()
  const summary = data.fields?.summary || ''
  const description = data.fields?.description || ''
  return {
    summary,
    description: typeof description === 'string' ? description : (description?.content?.map((c: any) => c.content?.map((cc: any) => cc.text).join('')).join('\n') || '')
  }
}

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  console.log('Sending request to API:', request) // Debug log
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}