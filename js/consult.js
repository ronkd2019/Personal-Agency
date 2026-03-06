const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const submitBtn = chatForm.querySelector('.chat-submit');

// Chat history to maintain context
let messageHistory = [];

// Scroll configuration
function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Typing indicator HTML
const typingHtml = `
  <div class="message ai-message" id="typingIndicator">
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  </div>
`;

function addMessage(content, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (role === 'ai') {
        // Parse markdown for AI responses if marked is available
        if (typeof marked !== 'undefined') {
            contentDiv.innerHTML = marked.parse(content);
        } else {
            contentDiv.textContent = content;
        }
    } else {
        contentDiv.textContent = content;
    }

    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    chatMessages.insertAdjacentHTML('beforeend', typingHtml);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userText = chatInput.value.trim();
    if (!userText) return;

    // Disable input while generating
    chatInput.value = '';
    chatInput.disabled = true;
    submitBtn.disabled = true;

    // Show user message immediately
    addMessage(userText, 'user');
    messageHistory.push({ role: 'user', content: userText });

    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messageHistory })
        });

        removeTypingIndicator();

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.message;

        addMessage(aiResponse, 'ai');
        messageHistory.push({ role: 'assistant', content: aiResponse });

    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addMessage("I'm sorry, I'm having trouble connecting to my database right now. Please try again later or contact Daniil directly via the Contact page.", 'ai');
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        submitBtn.disabled = false;
        chatInput.focus();
    }
});
