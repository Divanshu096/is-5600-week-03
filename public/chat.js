// Listen for messages from the server
const eventSource = new EventSource("/sse");
eventSource.onmessage = function(event) {
  console.log(`Received message from server: ${event.data}`);
  window.messages.innerHTML += `<p>${event.data}</p>`;
};

eventSource.onerror = function(error) {
  console.error('SSE connection error:', error);
};

// Handle form submission to send chat messages when Enter is pressed
window.form.addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent the form from refreshing the page

  const message = window.input.value.trim();
  if (message) {
    console.log(`Attempting to send message: ${message}`);

    try {
      // Send the message to the server
      const response = await fetch(`/chat?message=${encodeURIComponent(message)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`Message successfully sent: ${message}`);
      } else {
        console.error('Server error:', await response.text());
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }

    // Clear the input field after sending the message
    window.input.value = '';
  } else {
    console.log('No message to send');
  }
});

// Focus on the input field automatically when the page loads
window.onload = function() {
  window.input.focus();
};

// Handle "Enter" key to send message
window.input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent newline insertion
    window.form.dispatchEvent(new Event('submit'));
  }
});
