'use client'

import { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, TextField } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1'
};

export default function VoiceChatAssistant() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const responseCache = useRef<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setTranscript('');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech Recognition API not supported');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        const transcript = Array.from(results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
      setListening(true);
      recognitionRef.current = recognition;
    }
  };

  const sendToAssistant = async () => {
    if (!transcript.trim() || loading) return;

    const cacheKey = transcript;
    if (responseCache.current[cacheKey]) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseCache.current[cacheKey]
      }]);
      return;
    }

    setLoading(true);
    const userMessage: Message = { role: 'user', content: transcript };
    setMessages(prev => [...prev, userMessage]);
    setTranscript('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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
          stream: true,
          prompt: "You are a helpful and concise assistant. Only respond with your final message. No inner thoughts."
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.substring(5));
                if (data.choices?.[0]?.delta?.content) {
                  assistantMessage += data.choices[0].delta.content;
                  setPartialResponse(assistantMessage);
                }
              } catch (e) {
                console.error('Error parsing stream data', e);
              }
            }
          }
        }

        const assistantResponse: Message = {
          role: 'assistant',
          content: assistantMessage
        };
        setMessages(prev => [...prev, assistantResponse]);
        responseCache.current[cacheKey] = assistantMessage;
        setPartialResponse('');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Voice Chat Assistant
      </Typography>

      <Box sx={{ mb: 3, height: '400px', overflowY: 'auto', border: '1px solid #ddd', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: message.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                bgcolor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '80%'
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          </Box>
        ))}
        {partialResponse && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '18px 18px 18px 0',
                bgcolor: '#f5f5f5',
                maxWidth: '80%'
              }}
            >
              <Typography variant="body1">{partialResponse}</Typography>
              <CircularProgress size={16} sx={{ ml: 1 }} />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={transcript}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTranscript(e.target.value)}
          placeholder="Type or speak your message..."
          sx={{ bgcolor: '#f5f5f5' }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
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
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
