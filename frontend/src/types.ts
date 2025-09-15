export interface GenerateRequest {
  jiraId?: string
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
  checkbox?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
}