

import express from 'express'
import { GroqClient } from '../llm/groqClient'
import { GenerateRequestSchema, GenerateResponseSchema, GenerateResponse } from '../schemas'
import { SYSTEM_PROMPT, buildPrompt } from '../prompt'
import { buildTestDataPrompt } from '../prompt'

export const generateRouter = express.Router()

generateRouter.post('/testdata', async (req, res) => {
  const { fields } = req.body;
  try {
    const prompt = buildTestDataPrompt(fields);
    const groqClient = new GroqClient();
    const llmResponse = await groqClient.generateTests("", prompt);
    let testData;
    try {
      testData = JSON.parse(llmResponse.content);
    } catch (err) {
      return res.status(502).json({ error: 'LLM returned invalid JSON format' });
    }
    res.json({ data: testData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate test data' });
  }
});



// Proxy JIRA issue fetch to avoid CORS
import fetch from 'node-fetch'
generateRouter.get('/jira/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  console.log('Fetching JIRA issue for ID:', req.params.id) // Debug log
  const jiraId = req.params.id
  const url = `https://msankrish92.atlassian.net/rest/api/2/issue/${jiraId}`
  try {
    const jiraRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic bXNhbmtyaXNoOTJAZ21haWwuY29tOkFUQVRUM3hGZkdGMDQ5SU9meDF0UGRwUjZFcE1CRGdhZEt6X190T3poazN1MGZ6TGFsZTVJQnRpQ3hZTG9Sdnc1MW1YS3pTeU9DMk9iRVlHM3RjMmZsVFRmTVdFcGdlTXIxaFBfRUprUjdtY2l4S3h0WTJZd1EzbkZoaE15MlF1M2s3OVByTlZGTG1OajNlaUh2YWdveGJQOFREaTR3QzBsT3lOTjdUVHRuTC1CYjRpU3EyOVZDMD00ODA5RkNBMQ==',
        'Accept': 'application/json'
      }
    })
    if (!jiraRes.ok) {
      res.status(jiraRes.status).json({ error: 'Failed to fetch JIRA issue' })
      return
    }
    const data = await jiraRes.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

generateRouter.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = GenerateRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const request = validationResult.data

    // Build prompts
    const userPrompt = buildPrompt(request)

    // Create GroqClient instance here to ensure env vars are loaded
    const groqClient = new GroqClient()

    // Generate tests using Groq
    try {
      const groqResponse = await groqClient.generateTests(SYSTEM_PROMPT, userPrompt)
      
      // Parse the JSON content
      let parsedResponse: GenerateResponse
      try {
        parsedResponse = JSON.parse(groqResponse.content)
      } catch (parseError) {
        res.status(502).json({
          error: 'LLM returned invalid JSON format'
        })
        return
      }

      // Validate the response schema
      const responseValidation = GenerateResponseSchema.safeParse(parsedResponse)
      if (!responseValidation.success) {
        res.status(502).json({
          error: 'LLM response does not match expected schema'
        })
        return
      }

      // Add token usage info if available
      const finalResponse = {
        ...responseValidation.data,
        model: groqResponse.model,
        promptTokens: groqResponse.promptTokens,
        completionTokens: groqResponse.completionTokens
      }

      res.json(finalResponse)
    } catch (llmError) {
      console.error('LLM error:', llmError)
      res.status(502).json({
        error: 'Failed to generate tests from LLM service'
      })
      return
    }
  } catch (error) {
    console.error('Error in generate route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})