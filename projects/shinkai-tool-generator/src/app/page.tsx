/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, Loader2, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ToolType = "shinkai" | "mcp"
type Language = "typescript" | "python"
type StreamEvent = {
  type: "message" | "feedback" | "code" | "metadata" | "test" | "debug"
  content: any
}

// Default API URL
// const DEFAULT_CODE_GENERATOR_URL = 'https://api.shinaki.com/prompt-service'
const DEFAULT_CODE_GENERATOR_URL = 'http://localhost:8080'

export default function Home() {
  // const [prompt, setPrompt] = useState("generate a tool that downloads the transcript from a youtube url. it shouldnt require any api keys")
  const [prompt, setPrompt] = useState("generate a tool that searches for the most recent papers online about a supplement. input egs: curcumin, ashwagandha and summarizes the information. it shouldnt require any api keys")
  const [language, setLanguage] = useState<Language>("typescript")
  const [toolType, setToolType] = useState<ToolType>("shinkai")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [code, setCode] = useState("")
  const [metadata, setMetadata] = useState("")
  const [tests, setTests] = useState<any[]>([])
  const [editedTests, setEditedTests] = useState<Record<number, { input: any, config: any }>>({})
  const [requestUuid, setRequestUuid] = useState("")
  const [apiUrl, setApiUrl] = useState(DEFAULT_CODE_GENERATOR_URL)
  const [showConfig, setShowConfig] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [fileUrl, setFileUrl] = useState("")
  const [showTestResult, setShowTestResult] = useState(false)
  const [testResult, setTestResult] = useState<{ actual: any; expected: any } | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Load API URL from localStorage on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('CODE_GENERATOR_URL')
      if (savedUrl) {
        setApiUrl(savedUrl)
      }
    }
  }, [])

  // Add useEffect to scroll to bottom when events change
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [events]);

  // Debug useEffect to log state changes
  useEffect(() => {
    console.log(`State changed - isGenerating: ${isGenerating}, generationComplete: ${generationComplete}`);
  }, [isGenerating, generationComplete]);

  // Debug useEffect to log code changes
  useEffect(() => {
    console.log('<<code>>', code);

    async function generateMetadata() {
      if (code) {
        try {
          const metadataResponse = await fetch(
            `${DEFAULT_CODE_GENERATOR_URL}/metadata?language=${encodeURIComponent(language)}&code=${encodeURIComponent(code)}&x_shinkai_request_uuid=m${encodeURIComponent(requestUuid)}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'text/event-stream'
              }
            }
          )

          if (!metadataResponse.ok) {
            throw new Error(`HTTP error! status: ${metadataResponse.status}`)
          }

          if (!metadataResponse.body) {
            throw new Error('ReadableStream not supported or response body is null')
          }

          // Process metadata stream
          const metadataReader = metadataResponse.body.getReader()
          const metadataDecoder = new TextDecoder()

          while (true) {
            const { done, value } = await metadataReader.read()

            if (done) {
              break
            }

            // Decode the chunk
            const chunk = metadataDecoder.decode(value, { stream: true })
            
            // Process the SSE events
            processEvents(chunk)
          }
        } catch (error) {
          console.error('Metadata generation error:', error)
          setEvents(prev => [...prev, { type: 'message', content: `Metadata generation error: ${error instanceof Error ? error.message : 'Unknown error'}` }])
        }
      }
    }
    if (!metadata) {
      generateMetadata()
    } else {
      console.log('metadata already exists, skipping metadata generation')
    }
  }, [code]);

  // Function to get the current API URL
  const getApiUrl = () => {
    return apiUrl
  }

  const handleGenerate = async () => {
    console.log('Starting generation, setting isGenerating=true, generationComplete=false')
    setIsGenerating(true)
    setShowForm(false)
    setEvents([])
    setShowFeedback(false)
    setCode("")
    setMetadata("")
    setTests([])
    setRequestUuid("")
    setGenerationComplete(false)

    // Add the initial prompt to the events
    setEvents([{ 
      type: 'message', 
      content: `[Initial Prompt]\n${prompt}` 
    }])

    try {
      // Get the current tool type
      const toolTypeValue = toolType
      
      // Get the API URL
      const CODE_GENERATOR_URL = getApiUrl()
      
      // Make the API call
      const response = await fetch(
        `${CODE_GENERATOR_URL}/generate?skipfeedback=false&language=${encodeURIComponent(language)}&prompt=${encodeURIComponent(prompt)}&tool_type=${encodeURIComponent(toolTypeValue)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream'
          }
        }
      )

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60'
        const retrySeconds = parseInt(retryAfter, 10)
        
        setEvents([
          { 
            type: 'message', 
            content: `Rate limit exceeded. Too many requests. Please wait ${retrySeconds} seconds before trying again.` 
          }
        ])
        
        setIsGenerating(false)
        return
      }

      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = `Service ${CODE_GENERATOR_URL}/generate failed with status: ${response.status}`;
        try {
          const errorData = await response.text();
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported or response body is null')
      }

      // Get the request UUID for feedback
      const requestUuid = response.headers.get('x-shinkai-request-uuid')
      if (requestUuid) {
        setRequestUuid(requestUuid)
      }
      
      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })
        
        // Process the SSE events
        processEvents(chunk)
      }
      // Generate metadata after code is generated and if code exists in state
      

    } catch (error) {
      console.error('Error:', error)
      setEvents(prev => [...prev, { type: 'message', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }])
    } finally {
      console.log('Generation finished, setting isGenerating=false')
      setIsGenerating(false)
    }
  }

  const processEvents = (chunk: string) => {
    // Split the chunk by double newlines (SSE event delimiter)
    const events = chunk.split('\n\n')
    
    for (const event of events) {
      if (!event.trim()) continue

      // Parse the event
      const lines = event.split('\n')
      const eventLine = lines.find(line => line.startsWith('event:'))
      const dataLine = lines.find(line => line.startsWith('data:'))
      
      if (!eventLine || !dataLine) continue
      
      const eventType = eventLine.substring(7).trim() // Remove "event: "
      let data: any = {}

      try {
        data = JSON.parse(dataLine.substring(6)) // Remove "data: "
      } catch (e) {
        console.warn('Failed to parse event data:', dataLine)
        data = { message: dataLine.substring(6) }
      }

      // Handle different event types
      switch (eventType) {
        case 'debug':
          console.log('Event: debug', data)
          // data: [DEBUG] Saved File ::: /Users/edwardalvarado/shinkai-prompt-test/cache/.execution/1742520218317-b209c28c-7be1-4c6b-bf61-6e104635220c/step_1000.2025-03-21T01:23:38.403Z-1116.json	
            const parts = data.message.split(' ::: ')
            if (parts.length === 2) {
              setEvents(prev => [...prev, { 
                type: 'debug', 
                content: {
                  text: parts[0].replace('DEBUG ', ''), 
                  filePath: parts[1].trim()
                }
              }])
            }
          
          break

        case 'start':
          console.log('Event: start', data)
          // setEvents(prev => [...prev, { type: 'message', content: 'Starting code generation...' }])
          break

        case 'progress':
          console.log('Event: progress', data)
          if (data.message) {
            try {
              // Check if the message is a JSON string with a markdown key
              const jsonObj = JSON.parse(data.message)
              if (jsonObj.markdown) {
                setEvents(prev => [...prev, { type: 'message', content: '```markdown\n' + jsonObj.markdown + '\n```' }])
              } else {
                setEvents(prev => [...prev, { type: 'message', content: data.message }])
              }
            } catch (e) {
              // Not a valid JSON or doesn't have markdown key, display as is
              setEvents(prev => [...prev, { type: 'message', content: data.message }])
            }
          }
          break

        case 'request-feedback':
          console.log('Event: request-feedback', data)
          setEvents(prev => [...prev, { type: 'feedback', content: data.message || 'Feedback requested. Please provide your thoughts.' }])
          setShowFeedback(true)
          break

        case 'code':
          console.log('Event: code', data)
          if (data.code) {
            setCode(data.code)
            setEvents(prev => [...prev, { type: 'code', content: data.code }])
          }
          break

        case 'metadata':
          console.log('Event: metadata', data)
          if (data.metadata) {
            setMetadata(data.metadata)
            setEvents(prev => [...prev, { type: 'metadata', content: data.metadata }])
          }
          break

        case 'tests':
          console.log('Event: tests', data)
          if (data.tests) {
            try {
              console.log('testsArray', data)
              setTests(data.tests)
              setEvents(prev => [...prev, { type: 'test', content: data.tests }])
            } catch (e) {
              console.warn('Failed to parse tests array:', e)
            }
          }
          break

        case 'error':
          console.log('Event: error', data)
          setEvents(prev => [...prev, { type: 'message', content: `Error: ${data.message || 'Unknown error'}` }])
          break

        case 'complete':
          console.log('Event: complete', data)
          console.log('Setting generationComplete=true')
          // setEvents(prev => [...prev, { type: 'message', content: 'Code generation completed.' }])
          setGenerationComplete(true)
          break
      }
    }
  }

  const handleFeedbackSubmit = async () => {
    setShowFeedback(false)
    console.log('Submitting feedback, setting isGenerating=true')
    setIsGenerating(true)
    setGenerationComplete(false)
    
    // Add feedback to events
    setEvents(prev => [...prev, { type: 'feedback', content: feedback }])
    
    try {
      // Get the API URL
      const CODE_GENERATOR_URL = getApiUrl()
      
      // Make the API call with feedback
      const response = await fetch(
        `${CODE_GENERATOR_URL}/generate?skipfeedback=false&language=${encodeURIComponent(language)}&prompt=${encodeURIComponent(feedback)}&feedback=${encodeURIComponent(feedback)}&x_shinkai_request_uuid=${requestUuid}&tool_type=${encodeURIComponent(toolType)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported or response body is null')
      }
      
      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })
        
        // Process the SSE events
        processEvents(chunk)
      }
    } catch (error) {
      console.error('Error:', error)
      setEvents(prev => [...prev, { type: 'message', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }])
    } finally {
      console.log('Feedback submission finished, setting isGenerating=false')
      setIsGenerating(false)
      setFeedback("")
    }
  }

  const handleContinue = async () => {
    setShowFeedback(false)
    console.log('Continuing without feedback, setting isGenerating=true')
    setIsGenerating(true)
    setGenerationComplete(false)
    
    try {
      // Get the API URL
      const CODE_GENERATOR_URL = getApiUrl()
      
      // Make the API call to continue without feedback
      const response = await fetch(
        `${CODE_GENERATOR_URL}/generate?skipfeedback=true&language=${encodeURIComponent(language)}&prompt=${encodeURIComponent(prompt)}&x_shinkai_request_uuid=${requestUuid}&tool_type=${encodeURIComponent(toolType)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported or response body is null')
      }
      
      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })
        
        // Process the SSE events
        processEvents(chunk)
      }
    } catch (error) {
      console.error('Error:', error)
      setEvents(prev => [...prev, { type: 'message', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }])
    } finally {
      console.log('Continue operation finished, setting isGenerating=false')
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setShowForm(true)
    setEvents([])
    setIsGenerating(false)
    setShowFeedback(false)
    setCode("")
    setMetadata("")
    setTests([])
    setGenerationComplete(false)
  }

  const handleTestSend = async (test: any) => {
    try {
      let tools: string[] = [];
      try {
        const metadataObj = JSON.parse(metadata);
        tools = metadataObj.tools || [];
      } catch (e) {
        console.warn('Failed to parse metadata for tools:', e);
      }

      const payload = {
        code: code,
        tools: tools,
        parameters: test.input,
        extra_config: test.config
      };

      const response = await fetch(
        `${getApiUrl()}/code_execution?payload=${encodeURIComponent(JSON.stringify(payload))}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult({
        actual: result,
        expected: test.output
      });
      setShowTestResult(true);
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResult({
        actual: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: test.output
      });
      setShowTestResult(true);
    }
  }

  // Function to save configuration
  const saveConfiguration = () => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('CODE_GENERATOR_URL', apiUrl)
    }
    
    // Show confirmation message
    setEvents(prev => [...prev, { 
      type: 'message', 
      content: 'Configuration updated successfully.' 
    }])
    
    // Hide config
    setShowConfig(false)
  }

  // Function to reset configuration to defaults
  const resetConfiguration = () => {
    setApiUrl(DEFAULT_CODE_GENERATOR_URL)
  }

  return (
    <main className="container mx-auto p-4 min-h-screen">
      {showForm ? (
        <div className="max-w-3xl mx-auto mt-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Create Any Tool for your Agents & AIs</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowConfig(!showConfig)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure API settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {showConfig && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-url">Code Generator URL</Label>
                  <div className="flex gap-2">
                    <Textarea 
                      id="api-url" 
                      value={apiUrl} 
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetConfiguration}>Reset to Default</Button>
                  <Button onClick={saveConfiguration}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <Textarea
              placeholder="Describe the tool you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />

            <div className="flex items-center justify-between gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Label>Language:</Label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="border rounded p-2"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                      </select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the programming language for your tool</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <RadioGroup
                value={toolType}
                onValueChange={(value) => setToolType(value as ToolType)}
                className="flex space-x-4"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shinkai" id="shinkai" />
                        <Label htmlFor="shinkai">Shinkai Tool</Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a Shinkai-compatible tool</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mcp" id="mcp" />
                        <Label htmlFor="mcp">MCP</Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create an MCP-compatible tool</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </RadioGroup>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleGenerate} disabled={!prompt}>
                      Generate Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start generating your tool code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleReset} className="cursor-pointer">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    {toolType === "shinkai" ? "Shinkai Tool" : "MCP"} ({language})
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowConfig(!showConfig)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure API settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {showConfig && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-url-2">Code Generator URL</Label>
                  <div className="flex gap-2">
                    <Textarea 
                      id="api-url-2" 
                      value={apiUrl} 
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetConfiguration}>Reset to Default</Button>
                  <Button onClick={saveConfiguration}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Output */}
            <div className="space-y-4 flex flex-col h-[calc(100vh-150px)]">
              <h2 className="text-xl font-semibold flex items-center">
                Output
                {isGenerating && !generationComplete && (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />
                    <span className="ml-2 text-xs text-primary">(Loading...)</span>
                  </>
                )}
              </h2>

              <div 
                ref={outputRef}
                className="space-y-3 overflow-y-auto flex-grow pr-2"
              >
                {events.map(
                  (event, index) => {
                    if (event.type === "message") {
                      const isMarkdown = event.content.startsWith('```markdown');
                      
                      // Check for title in square brackets at the beginning
                      let title = null;
                      let content = event.content;
                      
                      if (!isMarkdown) {
                        const titleMatch = content.match(/^\[(.*?)\]/);
                        if (titleMatch) {
                          title = titleMatch[1];
                          content = content.substring(titleMatch[0].length).trim();
                        }
                      }
                      
                      return (
                        <Card 
                          key={index} 
                          className={isMarkdown ? "border-2 border-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/20" : ""}
                        >
                          
                          <CardContent className={"px-2 py-0"}>
                            {isMarkdown ? (
                              <div className="markdown-content p-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {content.replace(/```markdown\n([\s\S]*?)\n```/g, '$1')}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="p-3">{title ? (<span className="font-bold">{title} </span>) : ''}{content}</div> 
                            )}
                          </CardContent>
                        </Card>
                      );
                    } else if (event.type === "debug") {
                      const fileName = event.content.filePath.split('/').pop() // Get the last part of the path
                      return (
                        <Card 
                          key={index} 
                          className="border-2 border-red-500 shadow-md bg-red-50 dark:bg-red-900/20"
                        >
                          <CardContent className="px-2 py-0">
                            <div className="p-3 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span>{event.content.text}</span>
                                <Button
                                  variant="link"
                                  className="text-blue-600 hover:text-blue-800 underline ml-4"
                                  onClick={() => {
                                    setFileUrl(`http://localhost:8080/cache/${event.content.filePath.split('cache/')[1]}`)
                                    setShowFileDialog(true)
                                  }}
                                >
                                  Open File
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                File: {fileName}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } else if (event.type === "feedback") {
                      return (
                        <Card key={index} className="border-2 border-green-500 shadow-md bg-green-50 dark:bg-green-900/20">
                          <CardHeader className="py-0 px-3">
                            <CardTitle className="text-sm font-medium font-bold">User Feedback</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-2 py-0">
                            <div className="p-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {event.content}
                              </ReactMarkdown>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              {showFeedback && (
                <Card className="border-2 border-primary py-5 px-3">
                  <CardHeader>
                    <CardTitle>Feedback Requested</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{events.find((e) => e.type === "feedback")?.content}</p>
                    <Textarea
                      placeholder="Your feedback..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleFeedbackSubmit}>Send Feedback</Button>
                      {/* <Button variant="outline" onClick={handleContinue}>
                        Continue
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Generated Content */}
            <div className="space-y-4">
              {(code || metadata || tests.length > 0) && (
                <Tabs defaultValue="code">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Code className="mr-2" /> Code
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="font-mono min-h-[300px]"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={metadata}
                          onChange={(e) => setMetadata(e.target.value)}
                          className="font-mono min-h-[300px]"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tests" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {tests.map((test, index) => (
                            <Card key={index} className="border">
                              <CardHeader className="py-3">
                                <CardTitle className="text-base">{test.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="py-2">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h4 className="font-medium mb-1">Input</h4>
                                    <Textarea
                                      className="font-mono text-sm"
                                      value={editedTests[index]?.input ? JSON.stringify(editedTests[index].input, null, 2) : JSON.stringify(test.input, null, 2)}
                                      onChange={(e) => {
                                        try {
                                          const newInput = JSON.parse(e.target.value)
                                          setEditedTests(prev => ({
                                            ...prev,
                                            [index]: { ...prev[index], input: newInput }
                                          }))
                                        } catch (error) {
                                          // Invalid JSON, ignore the change
                                          console.warn('Invalid JSON input:', error)
                                        }
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Config</h4>
                                    <Textarea
                                      className="font-mono text-sm"
                                      value={editedTests[index]?.config ? JSON.stringify(editedTests[index].config, null, 2) : JSON.stringify(test.config, null, 2)}
                                      onChange={(e) => {
                                        try {
                                          const newConfig = JSON.parse(e.target.value)
                                          setEditedTests(prev => ({
                                            ...prev,
                                            [index]: { ...prev[index], config: newConfig }
                                          }))
                                        } catch (error) {
                                          // Invalid JSON, ignore the change
                                          console.warn('Invalid JSON config:', error)
                                        }
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Expected</h4>
                                    <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                                      {JSON.stringify(test.output, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                <Button onClick={() => handleTestSend({
                                  ...test,
                                  input: editedTests[index]?.input || test.input,
                                  config: editedTests[index]?.config || test.config
                                })} size="sm">
                                  Run Test
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      )}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle>File Content</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe 
              src={fileUrl} 
              className="w-full h-full border-0" 
              title="File Content"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTestResult} onOpenChange={setShowTestResult}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Actual Result</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                {testResult ? JSON.stringify(testResult.actual, null, 2) : ''}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Expected Result</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                {testResult ? JSON.stringify(testResult.expected, null, 2) : ''}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

