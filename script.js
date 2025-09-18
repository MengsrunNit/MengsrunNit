let apiKey = '';
const apiKeyInput = document.getElementById('OpenAIKey');
const chatDiv = document.getElementById('chat');
const inputField = document.getElementById('input');
const sendButton = document.getElementById('send');
const chatUI = document.getElementById('chat-ui');

const messages = [{ role: 'system', content: 'You are a helpful assistant.' }];

// Hide chat input until API key is entered and validated
chatUI.style.display = 'none';

inputField.disabled = true;
sendButton.disabled = true;

const enterKeyBtn = document.getElementById('enter-key-btn');

enterKeyBtn.addEventListener('click', async function () {
    const e = { key: 'Enter' };
    // Reuse the same logic as pressing Enter in the input
    apiKeyInput.dispatchEvent(new KeyboardEvent('keypress', e));
});


apiKeyInput.addEventListener('keypress', async function (e) {
    if (e.key === 'Enter') {
        apiKey = apiKeyInput.value.trim();
        if (apiKey.length > 0) {
            // Try a minimal API call to validate the key
            try {
                const testMessages = [{ role: 'user', content: 'Hello' }];
                await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: 'gpt-4.1-mini',
                    messages: testMessages,
                    max_tokens: 1
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
                // If successful, show chat UI
                chatUI.style.display = '';
                inputField.disabled = false;
                sendButton.disabled = false;
                apiKeyInput.disabled = true;
                inputField.focus();
            } catch (error) {
                alert('Invalid API key. Please try again.');
                apiKeyInput.value = '';
                apiKeyInput.focus();
            }
        }
    }
});

async function sendMessage() {
    const userInput = inputField.value;
    if (!userInput || !apiKey) return;

    chatDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    messages.push({ role: 'user', content: userInput });
    inputField.value = '';

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4.1-mini',
            messages: messages,
            max_tokens: 200
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const reply = response.data.choices[0].message.content.trim();
        chatDiv.innerHTML += `<p><strong>Assistant:</strong> ${reply}</p>`;
        messages.push({ role: 'assistant', content: reply });
        chatDiv.scrollTop = chatDiv.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        chatDiv.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
    }
}

sendButton.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});