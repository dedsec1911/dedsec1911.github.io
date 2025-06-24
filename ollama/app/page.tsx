'use client'

import { useEffect, useRef, useState } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import SendIcon from '@mui/icons-material/Send'
import { styled } from '@mui/material/styles'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Avatar
} from '@mui/material'

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1'
}

const experienceOptions = ['0', '1', '2', '3', '5', '10', '15+']
const fieldOptions = ['Frontend', 'Backend', 'Fullstack', 'Data Science', 'Mobile', 'DevOps']

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '28px',
    backgroundColor: '#f5f5f5',
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  }
})

const StyledButton = styled(Button)({
  borderRadius: '28px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none'
  }
})

const AssistantAvatar = styled(Avatar)({
  backgroundColor: '#1976d2',
  width: 32,
  height: 32
})

const UserAvatar = styled(Avatar)({
  backgroundColor: '#4caf50',
  width: 32,
  height: 32
})

export default function VoiceChatAssistant() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [experience, setExperience] = useState('')
  const [field, setField] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (e: any) => {
          setTranscript(e.results[0][0].transcript)
          setListening(false)
        }
        recognition.onerror = () => setListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      setTranscript('')
      recognitionRef.current?.start()
      setListening(true)
    }
  }

  const sendToAssistant = async () => {
    if (!transcript.trim()) return
    
    const userMessage = { role: 'user', content: transcript }
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for a developer with ${experience} years of experience in ${field}. Provide detailed, professional responses.`
    }

    const chatHistory = [systemMessage, ...messages.filter((m) => m.role !== 'system'), userMessage]
    setMessages([...messages, userMessage])
    setTranscript('')

    try {
      const res = await fetch(`${models.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${models.api_key}`
        },
        body: JSON.stringify({
          model: models.model,
          messages: chatHistory,
          temperature: 0.1,
          top_p: 0.1
        })
      })

      const data = await res.json()
      const assistantMessage = data.choices?.[0]?.message
      if (assistantMessage) {
        setMessages([...chatHistory, assistantMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendToAssistant()
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              AI Developer Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get expert help based on your experience level
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experience}
                  label="Experience"
                  onChange={(e: SelectChangeEvent) => setExperience(e.target.value)}
                  sx={{ borderRadius: '28px' }}
                >
                  <MenuItem value="">
                    <em>Select years</em>
                  </MenuItem>
                  {experienceOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt} {opt === '15+' ? 'years' : opt === '0' ? 'years (Student)' : 'years'}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Field</InputLabel>
                <Select
                  value={field}
                  label="Field"
                  onChange={(e: SelectChangeEvent) => setField(e.target.value)}
                  sx={{ borderRadius: '28px' }}
                >
                  <MenuItem value="">
                    <em>Select field</em>
                  </MenuItem>
                  {fieldOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3, maxHeight: '400px', overflowY: 'auto', p: 1 }}>
              {messages.map((m, i) => (
                <Box key={i} sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 2,
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  {m.role === 'assistant' ? (
                    <AssistantAvatar>A</AssistantAvatar>
                  ) : (
                    <UserAvatar>U</UserAvatar>
                  )}
                  <Box sx={{ 
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: m.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                    bgcolor: m.role === 'user' ? '#e3f2fd' : '#f5f5f5'
                  }}>
                    <Typography variant="body1">{m.content}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <StyledTextField
                fullWidth
                multiline
                maxRows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type or speak your message..."
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StyledButton
                        variant={listening ? 'contained' : 'outlined'}
                        color={listening ? 'error' : 'primary'}
                        onClick={toggleListening}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {listening ? <MicOffIcon /> : <MicIcon />}
                      </StyledButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <StyledButton
                        variant="contained"
                        color="primary"
                        onClick={sendToAssistant}
                        disabled={!transcript.trim() || !experience || !field}
                        endIcon={<SendIcon />}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        Send
                      </StyledButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip 
                label={listening ? "Listening..." : "Press mic to speak"} 
                size="small" 
                color={listening ? 'error' : 'default'}
                icon={listening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              />
              {experience && field && (
                <Chip 
                  label={`${experience} years in ${field}`} 
                  size="small" 
                  color="info"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
