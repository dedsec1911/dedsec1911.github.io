'use client'

import { useEffect, useRef, useState } from 'react'

const models = {
  model: 'DeepSeek-R1-0528',
  api_key: 'eb4b1055-8e86-4286-8767-2ebdd6590df5',
  base_url: 'https://api.sambanova.ai/v1'
}

const experienceOptions = ['0', '1', '2', '3', '5', '10', '15+']
const fieldOptions = ['Frontend', 'Backend', 'Fullstack', 'Data Science', 'Mobile', 'DevOps']

export default function Home() {
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

  const handleStart = () => {
    setTranscript('')
    setListening(true)
    recognitionRef.current?.start()
  }

  const handleStop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const sendToAssistant = async () => {
    const userMessage = { role: 'user', content: transcript }
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for a developer with ${experience} years of experience in ${field}.`
    }

    const chatHistory = [systemMessage, ...messages.filter((m) => m.role !== 'system'), userMessage]
    setMessages([...messages, userMessage])

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
  }

  return (
    <main className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Voice Chat Assistant</h1>

      <div className="flex gap-4 mb-4">
        <select
          className="border rounded p-2 w-1/2"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">Experience in years</option>
          {experienceOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          className="border rounded p-2 w-1/2"
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          <option value="">Technology/Field</option>
          {fieldOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={handleStart} className="bg-gray-200 px-4 py-2 rounded">Start Listening</button>
        <button onClick={handleStop} className="bg-gray-200 px-4 py-2 rounded">Stop Listening</button>
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        className="w-full p-3 border rounded mb-4"
        rows={3}
        placeholder="Speak or type your message..."
      />

      <button
        onClick={sendToAssistant}
        className="bg-black text-white px-4 py-2 rounded mb-4"
        disabled={!transcript || !experience || !field}
      >
        Send
      </button>

      <div className="mt-4">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <strong>{m.role === 'user' ? 'You' : 'Assistant'}:</strong> {m.content}
          </div>
        ))}
      </div>
    </main>
  )
}
