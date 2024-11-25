$(document).ready(function() {
    // Array to store chat history
    let chatHistory = [];

    // Function to render chat history
    function renderChatHistory() {
        $('.chat-box-body').empty(); // Clear current chat body
        chatHistory.forEach((message, index) => {
            let messageElement;
            if (message.sender === 'user') {
                messageElement = $('<div class="chat-box-body-send"></div>').text(message.text);
            } else {
                messageElement = $('<div class="chat-box-body-receive"></div>').append(
                    $('<div>' + message.text + '</div>') // Wrap the message text in a div
                );

                // Add 'latest' class to the latest message
                if (index === chatHistory.length - 1) {
                    messageElement.addClass('latest');
                }
            }

            // Append message element
            $('.chat-box-body').append(messageElement);
            
            // Animate message appearance
            messageElement.css({ opacity: 0, transform: 'translateY(10px)' });
            setTimeout(() => {
                messageElement.css({ opacity: 1, transform: 'translateY(0)' });
            }, 50);
        });

        // Append the bot profile picture below the latest message
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'bot') {
            const profilePic = $('<img class="bot-profile-pic" src="images/bot.png" alt="Bot Profile Picture">');
            $('.chat-box-body').append(profilePic);
            // Animate the profile picture
            profilePic.css({ opacity: 0 });
            setTimeout(() => {
                profilePic.css({ opacity: 1 });
            }, 50);
        }

        // Scroll to bottom
        $('.chat-box-body').scrollTop($('.chat-box-body')[0].scrollHeight);
    }

    // Function to show welcome message and bot profile picture
    function showWelcomeMessage() {
        const welcomeMessage = `
            <div class="welcome-message">
                <img class="big-bot-profile-pic" src="images/bot-large.png" alt="Bot Profile Picture">
                <div class="welcome-text">
                    <p>Haii👋 <strong>Laras</strong> disini untuk bantu kamu</p>
                    <p><em><strong># S e l a 2 a s k a n L a n g k a h</strong></em></p>
                    <hr>
                    <p class="small-text">Yuk! tanya-tanya Laras biar kamu lebih tau seputar El\ndan apa yang ia impikan demi menuju IMA yang</p>
                    <p class="small-text"><strong>Inklusif<strong> | <strong>Setara<strong> | <strong>Berkelanjutan<strong></p>
                </div>
            </div>
        `;
        $('.chat-box-body').append(welcomeMessage);
    }

    // Show chat box when chat button is clicked
    $('.chat-button').on('click', function() {
            $(this).animate({
                'border-bottom-right-radius': '25px'
            }, 150); // Duration of 300ms, adjust as needed

            // Fade out the chat button over 300ms
            $(this).fadeOut(300);

            // Show the chat box and add the show class
            $('.chat-box').addClass('show-chat'); // Add the show class to chat box
        
            // Render existing chat history
            renderChatHistory();
        
            // Show the welcome message if no messages have been sent
            if (chatHistory.length === 0) {
                showWelcomeMessage();
            }
        
            if ($(window).width() <= 450) {
                $('.chat-box').css({ height: '100%', width: '100%', borderRadius: '0' }); // Fullscreen on mobile
            }
    });

    // Close chat box when close button is clicked
    $('.chat-box-header .close-button').on('click', function() {
        // Start closing the chat box with animation
        $('.chat-box').removeClass('show-chat'); // Remove the show class to hide chat box
    
        // Show the chat button immediately
        $('.chat-button').show(0, function() {
            // Remove previous glow classes to reset the effect
            $(this).removeClass('initial-glow buttonglow'); // Ensure both classes are removed
    
            // Add the initial glow class to the chat button
            $(this).addClass('initial-glow');
    
            // Remove the initial glow class after a delay
            setTimeout(() => {
                $(this).removeClass('initial-glow');
                $(this).addClass('buttonglow'); // Add the looping glow animation
            }, 1286); // Duration of the initial glow animation
        });    
    
        // Animate chat button's border radius at the same time
        $('.chat-button').animate({
            'border-bottom-right-radius': '0'
        }, 300); // Adjust as needed
    });

    // Send message functionality
    function sendMessage() {
        let messageInput = $('.chat-box-footer input');
        let messageText = messageInput.val().trim(); // Get the message text

        if (messageText) {
            // Check if it's the first message
            if (chatHistory.length === 0) {
                $('.welcome-message').remove(); // Remove the welcome message if it exists
            }

            // Add user message to chat history
            chatHistory.push({ sender: 'user', text: messageText });

            // Clear the input field
            messageInput.val('');

            // Render updated chat history
            renderChatHistory();

            // Show typing indicator before sending the message
            let typingIndicator = $('<div class="typing-indicator"></div>');
            typingIndicator.append('<div class="dot"></div><div class="dot"></div><div class="dot"></div>');
            $('.chat-box-body').append(typingIndicator);

            // Simulate a delay for the bot response
            setTimeout(async () => {
                typingIndicator.remove(); // Remove typing indicator

                // Send the message to the Rasa server
                try {
                    const botResponses = await sendMessageToRasa(messageText);
                    
                    // Add bot responses to chat history
                    botResponses.forEach(response => {
                        chatHistory.push({ sender: 'bot', text: response.text });
                    });

                    // Render updated chat history
                    renderChatHistory();
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }, 1000);
        }

        // Reset the send button color after sending the message
        $('#sendButton').css('background-color', ''); // Reset button color
    }

    // Send button click event
    $('.send-button').on('click', sendMessage);

    // Enter key press event
    $('.chat-box-footer input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            sendMessage();
        }
    });

    // Function to send message to Rasa server
    async function sendMessageToRasa(message) {
        try {
            const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sender: 'user', message: message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message to Rasa:', error);
            return [{ text: 'Sorry, there was an error communicating with the bot.' }];
        }
    }

    // Change send button color based on input
    $('.chat-box-footer input').on('input', function() {
        if ($(this).val().trim() !== '') {
            $('#sendButton').css('background-color', '#ff5a8d'); // Change button color
        } else {
            $('#sendButton').css('background-color', ''); // Reset button color
        }
    });

    // Variable to track the state of the welcome message
    let isWelcomeMessageVisible = true;

    // Event listener for input field focus
    $('.chat-box-footer input').on('focus', function() {
        // Set the placeholder to the initial message if the welcome message is visible
        if (isWelcomeMessageVisible) {
            $(this).attr('placeholder', 'Apa saja yang bisa saya tanyakan?');
        }
    });

    // Event listener for input field blur
    $('.chat-box-footer input').on('blur', function() {
        // If the input is empty and the welcome message is still visible
        if ($(this).val().length === 0 && isWelcomeMessageVisible) {
            // Change the placeholder to "Type your message..." when the input is empty
            $(this).attr('placeholder', 'Type your message...');
        }
    });

    // Set the flag to false when the user sends the first message
    $('.send-button').on('click', function() {
        if (chatHistory.length === 0) {
            $('.welcome-message').remove(); // Hide the welcome message when the first message is sent
            isWelcomeMessageVisible = false; // Update the state to indicate that the welcome message is no longer visible
            
            // Set the placeholder to "Type your message..." after the welcome message is hidden
            $('.chat-box-footer input').attr('placeholder', 'Type your message...');
        }
    });

    // Prevent any placeholder change on input event after the welcome message is hidden
    $('.chat-box-footer input').on('input', function() {
        // If the welcome message is no longer visible, ensure the placeholder remains "Type your message..."
        if (!isWelcomeMessageVisible) {
            $(this).attr('placeholder', 'Type your message...');
        }
    });

});