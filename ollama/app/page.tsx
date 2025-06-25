'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1'
}

export default function OptimizedVoiceChat() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [partialResponse, setPartialResponse] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const responseCache = useRef<Record<string, string>>({})

  // Properly typed debounce hook
  const useDebounce = <T extends (...args: any[]) => void>(
    callback: T,
    delay: number
  ) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }, [])
    
    return useCallback((...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => callback(...args), delay)
    }, [callback, delay])
  }

  const debouncedToggleListening = useDebounce(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      setTranscript('')
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        setTranscript(transcript)
      }
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error)
        setListening(false)
      }
      
      recognition.onend = () => setListening(false)
      
      recognition.start()
      setListening(true)
      recognitionRef.current = recognition
    }
  }, 300)

  const sendToAssistant = async () => {
    if (!transcript.trim() || loading) return
    
    const cacheKey = transcript
    if (responseCache.current[cacheKey]) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseCache.current[cacheKey]
      }])
      return
    }
    
    setLoading(true)
    const userMessage: Message = { role: 'user', content: transcript }
    setMessages(prev => [...prev, userMessage])
    setTranscript('')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      const res = await fetch(`${models.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${models.api_key}`
        },
        body: JSON.stringify({
          model: models.model,
          messages: [{ role: 'user', content: transcript }],
          temperature: 0.1,
          top_p: 0.1,
          stream: true
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value)
          const lines = text.split('\n')
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.substring(5))
                if (data.choices?.[0]?.delta?.content) {
                  assistantMessage += data.choices[0].delta.content
                  setPartialResponse(assistantMessage)
                }
              } catch (e) {
                console.error('Error parsing stream data', e)
              }
            }
          }
        }
        
        const assistantResponse: Message = { 
          role: 'assistant', 
          content: assistantMessage 
        }
        setMessages(prev => [...prev, assistantResponse])
        responseCache.current[cacheKey] = assistantMessage
        setPartialResponse('')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      {/* Your UI components */}
      <Button
        variant={listening ? 'contained' : 'outlined'}
        color={listening ? 'error' : 'primary'}
        onClick={debouncedToggleListening}
        startIcon={listening ? <MicOffIcon /> : <MicIcon />}
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </Button>
    </Box>
  )
}
