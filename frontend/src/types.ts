export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
  testCaseType?: string[] // Change to array
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

export interface TestDataField {
  fieldName: string
  type: string
  options?: {
    blank?: number
    // Add other options as needed
  }
}

export interface TestDataRequest {
  fields: TestDataField[]
}