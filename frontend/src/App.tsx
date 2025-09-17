import { useState } from 'react'
import { generateTests, fetchJiraIssue, generateTestData } from './api'
import { GenerateRequest, GenerateResponse, TestCase, TestDataField } from './types'


function App() {
  const [testDataResult, setTestDataResult] = useState<any>(null);
  const [testDataLoading, setTestDataLoading] = useState(false);
  const [testDataError, setTestDataError] = useState<string | null>(null);

  const handleGenerateTestData = async () => {
    setTestDataLoading(true);
    setTestDataError(null);
    try {
      const result = await generateTestData({ fields: testDataFields });
      setTestDataResult(result);
    } catch (err) {
      setTestDataError(err instanceof Error ? err.message : 'Failed to generate test data');
    } finally {
      setTestDataLoading(false);
    }
  } 
  

  const [activeTab, setActiveTab] = useState<'testCases' | 'testData'>('testCases')
  const [testDataFields, setTestDataFields] = useState<TestDataField[]>([
    { fieldName: '', type: '', options: { blank: 0 } }
  ])

  const [formData, setFormData] = useState<GenerateRequest>({
    storyTitle: '',
    acceptanceCriteria: '',
    description: '',
    additionalInfo: '',
    testCaseType: []

  })
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())
  const [jiraId, setJiraId] = useState('')
  const [jiraLoading, setJiraLoading] = useState(false)

  const handleFetchJiraIssue = async () => {
    if (!jiraId.trim()) return
    setJiraLoading(true)
    try {
      const { summary, description } = await fetchJiraIssue(jiraId)
      setFormData(prev => ({
        ...prev,
        storyTitle: summary,
        description
      }))
    } catch (err) {
      alert('Error fetching JIRA issue')
    } finally {
      setJiraLoading(false)
    }
  }

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim()) {
      setError('Story Title and Acceptance Criteria are required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await generateTests(formData)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1800px;
            padding: 50px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        .results-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }
        
        .results-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .results-meta {
          color: #666;
          font-size: 14px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .results-table tr:hover {
          background: #f8f9fa;
        }
        
        .category-positive { color: #27ae60; font-weight: 600; }
        .category-negative { color: #e74c3c; font-weight: 600; }
        .category-edge { color: #f39c12; font-weight: 600; }
        .category-authorization { color: #9b59b6; font-weight: 600; }
        .category-non-functional { color: #34495e; font-weight: 600; }
        
        .test-case-id {
          cursor: pointer;
          color: #3498db;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .test-case-id:hover {
          background: #f8f9fa;
        }
        
        .test-case-id.expanded {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .expand-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }
        
        .expand-icon.expanded {
          transform: rotate(90deg);
        }
        
        .expanded-details {
          margin-top: 15px;
          background: #fafbfc;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
        }
        
        .step-item {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .step-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }
        
        .step-id {
          font-weight: 600;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }
        
        .step-description {
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .step-test-data {
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .step-expected {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-labels {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>


      <div style={{ marginBottom: '1em' }}>
        <button onClick={() => setActiveTab('testCases')} style={{ marginRight: '1em' }}>Test Cases</button>
        <button onClick={() => setActiveTab('testData')}>Test Data Creation</button>
      </div>

      {activeTab === 'testData' && (
        <div className="container">
          <h2 style={{ marginBottom: '20px' }}>Test Data Creation</h2>
          <div style={{ background: '#222', color: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', gap: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
              <div>Field Name</div>
              <div>Type</div>
              <div>Options</div>
              <div></div>
              <div></div>
            </div>
            {testDataFields.map((field, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <input value={field.fieldName} onChange={e => {
                  const newFields = [...testDataFields]
                  newFields[idx].fieldName = e.target.value
                  setTestDataFields(newFields)
                }} placeholder="Field Name" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input value={field.type} onChange={e => {
                  const newFields = [...testDataFields]
                  newFields[idx].type = e.target.value
                  setTestDataFields(newFields)
                }} placeholder="Type" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <div>
                  blank: <input type="number" min={0} max={100} value={field.options?.blank || 0} onChange={e => {
                    const newFields = [...testDataFields]
                    newFields[idx].options = { ...newFields[idx].options, blank: Number(e.target.value) }
                    setTestDataFields(newFields)
                  }} style={{ width: '60px', marginLeft: '4px' }} /> %
                </div>
                <button onClick={() => setTestDataFields(fields => [...fields, { fieldName: '', type: '', options: { blank: 0 } }])} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px' }}>+</button>
                {testDataFields.length > 1 && <button onClick={() => setTestDataFields(fields => fields.filter((_, i) => i !== idx))} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px' }}>×</button>}
              </div>
            ))}
          </div>
          <button onClick={handleGenerateTestData} disabled={testDataLoading} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' }}>
            {testDataLoading ? 'Generating...' : 'Generate Fields Using AI'}
          </button>
          {testDataError && <div style={{ color: '#e74c3c', marginBottom: '16px' }}>{testDataError}</div>}
          {/* {testDataResult && (
            <div style={{ marginBottom: '16px', background: '#f8f8f8', color: '#333', padding: '12px', borderRadius: '6px' }}>
              <strong>Debug Raw Response:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>{JSON.stringify(testDataResult, null, 2)}</pre>
            </div>
          )} */}
          {testDataResult && testDataResult.data && Array.isArray(testDataResult.data) && (
            <div style={{ background: '#fff', color: '#222', borderRadius: '8px', padding: '24px', marginTop: '24px' }}>
              <h3>Generated Test Data</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr>
                    {Object.entries(testDataResult.data[0])
                      .map(([key]) => (
                        <th key={key} style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {testDataResult.data.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {Object.entries(row)
                        .map(([_, val], i) => (
                          <td key={i} style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{Array.isArray(val) ? val.join(', ') : String(val)}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '1em' }}>
        <input
          type="text"
          placeholder="Enter JIRA ID (e.g. TES-2)"
          value={jiraId}
          onChange={e => setJiraId(e.target.value)}
          style={{ marginRight: '0.5em' }}
        />
  <button onClick={handleFetchJiraIssue} disabled={jiraLoading}>
          {jiraLoading ? 'Fetching...' : 'Fetch'}
        </button>
      </div>
      
      <div className="container">
        <div className="header">
          <h1 className="title">User Story to Tests</h1>
          <p className="subtitle">Generate comprehensive test cases from your user stories</p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="storyTitle" className="form-label">
              Story Title *
            </label>
            <input
              type="text"
              id="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="Enter the user story title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional description (optional)..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="acceptanceCriteria" className="form-label">
              Acceptance Criteria *
            </label>
            <textarea
              id="acceptanceCriteria"
              className="form-textarea"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              placeholder="Enter the acceptance criteria..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Info
            </label>
            <textarea
              id="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information (optional)..."
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.testCaseType?.includes('positive')}
                onChange={() => {
                  setFormData(prev => ({
                    ...prev,
                    testCaseType: prev.testCaseType?.includes('positive')
                      ? prev.testCaseType.filter(t => t !== 'positive')
                      : [...(prev.testCaseType || []), 'positive']
                  }))
                }}
              />
              Positive
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="checkbox"
                checked={formData.testCaseType?.includes('negative')}
                onChange={() => {
                  setFormData(prev => ({
                    ...prev,
                    testCaseType: prev.testCaseType?.includes('negative')
                      ? prev.testCaseType.filter(t => t !== 'negative')
                      : [...(prev.testCaseType || []), 'negative']
                  }))
                }}
              />
              Negative
            </label>
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            Generating test cases...
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Generated Test Cases</h2>
              <div className="results-meta">
                {results.cases.length} test case(s) generated
                {results.model && ` • Model: ${results.model}`}
                {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
              </div>
            </div>
            
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test Case ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.cases.map((testCase: TestCase) => (
                    <>
                      <tr key={testCase.id}>
                        <td>
                          <div 
                            className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                            onClick={() => toggleTestCaseExpansion(testCase.id)}
                          >
                            <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                              ▶
                            </span>
                            {testCase.id}
                          </div>
                        </td>
                        <td>{testCase.title}</td>
                        <td>
                          <span className={`category-${testCase.category.toLowerCase()}`}>
                            {testCase.category}
                          </span>
                        </td>
                        <td>{testCase.expectedResult}</td>
                      </tr>
                      {expandedTestCases.has(testCase.id) && (
                        <tr key={`${testCase.id}-details`}>
                          <td colSpan={4}>
                            <div className="expanded-details">
                              <h4 style={{marginBottom: '15px', color: '#2c3e50'}}>Test Steps for {testCase.id}</h4>
                              <div className="step-labels">
                                <div>Step ID</div>
                                <div>Step Description</div>
                                <div>Test Data</div>
                                <div>Expected Result</div>
                              </div>
                              {testCase.steps.map((step, index) => (
                                <div key={index} className="step-item">
                                  <div className="step-header">
                                    <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                    <div className="step-description">{step}</div>
                                    <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                    <div className="step-expected">
                                      {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
  
}


export default App