'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1'
}

export default function OptimizedVoiceChat() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [partialResponse, setPartialResponse] = useState('')
  const recognitionRef = useRef<any>(null)
  const responseCache = useRef<Record<string, string>>({})

  // Debounce function
  const useDebounce = (callback: Function, delay: number) => {
    const timerRef = useRef<NodeJS.Timeout>()
    return useCallback((...args: any[]) => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => callback(...args), delay)
    }, [callback, delay])
  }

  const toggleListening = useDebounce(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      setTranscript('')
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        setTranscript(transcript)
      }
      
      recognition.onerror = (event: any) => {
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
    
    const cacheKey = `${transcript}`
    if (responseCache.current[cacheKey]) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseCache.current[cacheKey]
      }])
      return
    }
    
    setLoading(true)
    const userMessage = { role: 'user', content: transcript }
    setMessages(prev => [...prev, userMessage])
    setTranscript('')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
      
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
          stream: true // Enable streaming if supported by API
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
          // Simple parsing - adjust based on your API's streaming format
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
        
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
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
      {/* ... existing UI ... */}
      
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant={listening ? 'contained' : 'outlined'}
          color={listening ? 'error' : 'primary'}
          onClick={toggleListening}
          startIcon={listening ? <MicOffIcon /> : <MicIcon />}
        >
          {listening ? 'Stop Listening' : 'Start Listening'}
        </Button>
        
        <Button
          variant="contained"
          onClick={sendToAssistant}
          disabled={!transcript || loading}
          endIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Send
        </Button>
      </Box>
      
      {partialResponse && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography>{partialResponse}</Typography>
          <Box sx={{ 
            display: 'inline-block',
            width: 8,
            height: 8,
            bgcolor: 'text.primary',
            borderRadius: '50%',
            animation: 'blink 1s infinite',
            '@keyframes blink': {
              '0%': { opacity: 0.2 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.2 }
            }
          }} />
        </Box>
      )}
    </Box>
  )
}
