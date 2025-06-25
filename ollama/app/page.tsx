'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1',
};

export default function VoiceChatAssistant() {
  /* ---------- state & refs ---------- */
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const responseCache = useRef<Record<string, string>>({});

  /* ---------- clean-up ---------- */
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  /* ---------- microphone ---------- */
  const toggleListening = () => { /* … unchanged … */ };

  /* ---------- chat request ---------- */
  const sendToAssistant = async () => { /* … unchanged … */ };

  /* ---------- ui ---------- */
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Voice Chat Assistant
      </Typography>

      {/* chat history */}
      <Box
        sx={{
          mb: 3,
          height: 400,
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
          p: 2,
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius:
                  msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '80%',
                width: '100%',
              }}
            >
              <MarkdownRenderer content={msg.content} />
            </Box>
          </Box>
        ))}

        {/* streaming partial response */}
        {partialResponse && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '18px 18px 18px 0',
                bgcolor: '#f5f5f5',
                maxWidth: '80%',
              }}
            >
              <Typography variant="body1">{partialResponse}</Typography>
              <CircularProgress size={16} sx={{ ml: 1 }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* text input */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type or speak your message..."
          sx={{ bgcolor: '#f5f5f5' }}
        />
      </Box>

      {/* action buttons */}
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
