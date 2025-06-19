document.addEventListener('DOMContentLoaded', () => {
    const listenButton = document.getElementById('listenButton');
    const transcript = document.getElementById('transcript');
    const responseDiv = document.getElementById('response');
    const status = document.getElementById('status');
    
    let recognition;
    let isListening = false;
    
    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        status.textContent = 'Speech recognition not supported in this browser. Try Chrome or Edge.';
        listenButton.disabled = true;
        return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    // Event handlers
    recognition.onstart = () => {
        isListening = true;
        listenButton.classList.add('listening');
        listenButton.textContent = 'Listening...';
        status.textContent = 'Listening... Speak now.';
        transcript.textContent = '';
        responseDiv.textContent = '';
    };
    
    recognition.onend = () => {
        isListening = false;
        listenButton.classList.remove('listening');
        listenButton.textContent = 'Start Listening';
    };
    
    recognition.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        transcript.textContent = speechResult;
        status.textContent = 'Processing with Ollama...';
        
        try {
            const ollamaUrl = document.getElementById('ollamaUrl').value;
            const model = document.getElementById('modelSelect').value;
            const devField = document.getElementById('devField').value;
            const workExp = document.getElementById('workExp').value;
            
            const response = await fetchOllamaResponse(
                ollamaUrl, 
                model, 
                generatePrompt(speechResult, devField, workExp)
            );
            
            responseDiv.textContent = response;
            status.textContent = 'Done. Press button to speak again.';
        } catch (error) {
            responseDiv.textContent = 'Error: ' + error.message;
            status.textContent = 'Error occurred.';
            console.error('Error:', error);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        status.textContent = 'Error: ' + event.error;
        isListening = false;
        listenButton.classList.remove('listening');
        listenButton.textContent = 'Start Listening';
    };
    
    // Button click handler
    listenButton.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    // Generate context-aware prompt
    function generatePrompt(question, devField, workExp) {
        const fieldMap = {
            'web': 'web development',
            'mobile': 'mobile app development',
            'ai': 'artificial intelligence and machine learning',
            'data': 'data science and analytics',
            'devops': 'DevOps and cloud infrastructure'
        };
        
        const expMap = {
            'entry': 'entry-level (0-2 years experience)',
            'mid': 'mid-level (3-5 years experience)',
            'senior': 'senior-level (5+ years experience)'
        };
        
        return `You are a technical expert in ${fieldMap[devField]} with ${expMap[workExp]} experience. 
        Provide a detailed, professional answer to the following question:
        
        Question: ${question}
        
        Answer:`;
    }
    
    // Fetch response from Ollama
    async function fetchOllamaResponse(url, model, prompt) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Ollama request failed:', error);
            throw new Error(`Failed to connect to Ollama. Make sure:
            1. Ollama is running at ${url}
            2. CORS is enabled (OLLAMA_ORIGINS="*")
            3. The model is downloaded (ollama pull ${model})`);
        }
    }
});
