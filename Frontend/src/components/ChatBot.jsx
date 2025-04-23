import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaRegClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const initialMessages = [
    { text: "Hello! I'm your Cater House assistant. How can I help you today?", isBot: true },
    { text: "You can ask me about our menu, delivery options, payment methods, or catering services!", isBot: true }
  ];
  
  // Get stored messages from localStorage or use initial messages
  const getStoredMessages = () => {
    const stored = localStorage.getItem('caterHouseChatHistory');
    return stored ? JSON.parse(stored) : initialMessages;
  };
  
  const [messages, setMessages] = useState(getStoredMessages);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Store messages in localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('caterHouseChatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { text: inputMessage, isBot: false }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
    
    setInputMessage('');
  };

  // Clear chat history
  const handleClearChat = () => {
    Swal.fire({
      title: 'Clear chat history?',
      text: "This will remove all your previous conversations.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setMessages(initialMessages);
        localStorage.removeItem('caterHouseChatHistory');
      }
    });
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses with dynamic follow-up
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const time = new Date().getHours();
      let greeting = "Good morning";
      if (time >= 12 && time < 17) greeting = "Good afternoon";
      else if (time >= 17) greeting = "Good evening";
      
      return `${greeting}! I'm your Cater House assistant. How can I help you today? You can ask me about:\n\n` +
             "1. Our menu and specials\n" +
             "2. Event catering services\n" +
             "3. Package options\n" +
             "4. Pricing and offers\n" +
             "5. Delivery information\n" +
             "6. Payment methods\n" +
             "7. Special dietary requirements\n\n" +
             "What interests you the most?";
    }
    
    // Menu-related responses with dynamic data and follow-up questions
    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('dish')) {
      if (loading) {
        return "Please wait while I fetch our menu items...";
      }
      
      if (menuItems.length === 0) {
        return "I'm having trouble accessing our menu right now. Please try again later.";
      }
      
      const vegItems = menuItems.filter(item => item.category === 'Veg');
      const nonVegItems = menuItems.filter(item => item.category === 'Non-Veg');
      const corporateItems = menuItems.filter(item => item.category === 'CorporateGenie');
      const familyItems = menuItems.filter(item => item.category === 'FamilyFiesta');
      
      return `Here's our current menu:

Corporate Packages:
${corporateItems.map(item => `- ${item.name} (₹${item.price})`).join('\n')}

Family Packages:
${familyItems.map(item => `- ${item.name} (₹${item.price})`).join('\n')}

Vegetarian Options:
${vegItems.map(item => `- ${item.name} (₹${item.price})`).join('\n')}

Non-Vegetarian Options:
${nonVegItems.map(item => `- ${item.name} (₹${item.price})`).join('\n')}

Would you like to:
1. Know more about any specific item?
2. Get recommendations based on your preferences?
3. See today's specials?
4. Check seasonal offers?
5. Get a custom menu quote?`;
    }
    
    // Special offers and packages with dynamic pricing
    else if (lowerMessage.includes('offer') || lowerMessage.includes('discount') || lowerMessage.includes('package')) {
      const today = new Date();
      const isWeekend = today.getDay() === 0 || today.getDay() === 6;
      const isHoliday = false; // You can add holiday check logic here
      
      let specialOffer = "";
      if (isWeekend) {
        specialOffer = "\nWeekend Special: 15% off on all family packages!";
      }
      if (isHoliday) {
        specialOffer += "\nHoliday Special: 20% off on all orders!";
      }
      
      return `We have several special packages and offers:${specialOffer}

1. Corporate Packages:
   - Gold Vegetarian Box (₹599)
   - Gold Non-Vegetarian Box (₹699)
   - Custom corporate menus available
   - Bulk order discounts
   - Regular delivery schedules

2. Family Packages:
   - Regular Vegetarian Box (₹399)
   - Regular Non-Vegetarian Box (₹499)
   - Family meal combos
   - Special family discounts
   - Custom family menus

3. Special Offers:
   - 20% off on first order
   - Free delivery for orders above ₹1000
   - Group discounts available
   - Special rates for bulk orders
   - Loyalty program benefits

4. Seasonal Offers:
   - Festival special discounts
   - Holiday season packages
   - Summer special menus
   - Winter comfort food deals

Would you like to:
1. Get a personalized quote?
2. Know more about any specific package?
3. Check current availability?
4. Book a package?
5. See more seasonal offers?`;
    }
    
    // Event catering with dynamic availability
    else if (lowerMessage.includes('event') || lowerMessage.includes('catering') || lowerMessage.includes('party')) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const formattedDate = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      return `We offer comprehensive catering services for various events:

1. Corporate Events:
   - Business meetings
   - Office parties
   - Corporate lunches
   - Conferences
   - Team building events
   - Product launches
   - Custom corporate menus

2. Wedding Catering:
   - Pre-wedding functions
   - Wedding reception
   - Post-wedding celebrations
   - Custom wedding menus
   - Special wedding packages
   - Traditional cuisine options
   - International cuisine options

3. Special Events:
   - Birthday parties
   - Anniversary celebrations
   - Family gatherings
   - Social functions
   - Custom event packages
   - Theme-based catering
   - Special occasion menus

4. Educational Events:
   - School functions
   - College events
   - Educational seminars
   - Student gatherings
   - Custom student packages

Current Availability:
- Next month (${formattedDate}) is filling up fast!
- Weekend slots are limited
- Weekday slots are available
- Special rates for weekday events

Would you like to:
1. Check availability for a specific date?
2. Get a quote for your event?
3. Know more about any specific event type?
4. Book a consultation?
5. See sample menus?`;
    }
    
    // Delivery information
    else if (lowerMessage.includes('delivery') || lowerMessage.includes('time') || lowerMessage.includes('location')) {
      return `Our delivery information:

🚚 Delivery Details:
- Free delivery for orders above ₹1000
- Delivery time: 45-60 minutes
- Delivery radius: Within city limits
- COD available for all orders
- Real-time order tracking
- Scheduled delivery options

📍 Service Areas:
- All major areas in the city
- Corporate zones
- Residential areas
- Special event venues
- Educational institutions
- Industrial areas

📦 Packaging:
- Eco-friendly packaging
- Temperature-controlled delivery
- Special event packaging
- Custom packaging options

Would you like to check if we deliver to your location or know more about our delivery services?`;
    }
    
    // Payment methods
    else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cod')) {
      return `We accept multiple payment methods:

💳 Payment Options:
- Online payment (cards, UPI)
- Cash on Delivery (COD)
- Net banking
- Mobile wallets
- Corporate billing
- EMI options
- Digital payment apps

🔒 Security:
- All online transactions are secure
- SSL encrypted payments
- Secure payment gateway
- Payment confirmation via SMS/Email
- PCI DSS compliance
- Fraud protection

💰 Payment Plans:
- One-time payment
- Installment options
- Corporate credit terms
- Advance booking options
- Bulk order payment plans

Would you like to know more about any specific payment method or payment plan?`;
    }
    
    // Dietary requirements
    else if (lowerMessage.includes('vegetarian') || lowerMessage.includes('veg') || 
             lowerMessage.includes('non-veg') || lowerMessage.includes('diet')) {
      return `We cater to various dietary preferences:

1. Vegetarian Options:
   - Pure vegetarian dishes
   - Jain food available
   - Vegan options
   - Custom vegetarian menus
   - Organic vegetarian options
   - Regional vegetarian specialties

2. Non-Vegetarian Options:
   - Chicken specialties
   - Mutton dishes
   - Seafood options
   - Custom non-veg menus
   - Regional non-veg specialties
   - International non-veg dishes

3. Special Dietary Needs:
   - Gluten-free options
   - Low-calorie meals
   - Diabetic-friendly food
   - Custom dietary requirements
   - Keto-friendly options
   - Low-sodium meals
   - High-protein meals
   - Weight management meals

Would you like to know more about any specific dietary option or get a custom menu?`;
    }
    
    // Operating hours
    else if (lowerMessage.includes('time') || lowerMessage.includes('hours') || lowerMessage.includes('open')) {
      return `Our operating hours:

⏰ Service Timings:
- Daily: 10:00 AM - 10:00 PM
- Advance orders: 2-3 days for large events
- Same-day delivery: Order 3 hours in advance
- 24/7 customer support
- Emergency catering services
- Special event timings

📅 Special Events:
- Early morning delivery available
- Late-night service for events
- Custom timing arrangements
- Weekend special services
- Holiday special timings
- Corporate event timings

Would you like to know more about our timing policies or schedule a special event?`;
    }
    
    // Contact information
    else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return `You can reach us through:

📞 Contact Details:
- Phone: +91-XXXXXXXXXX
- Email: info@caterhouse.com
- WhatsApp: +91-XXXXXXXXXX
- Visit our outlets during business hours
- Social media handles
- Live chat support

📍 Office Address:
Cater House
123 Food Street
City, State - PIN
India

📱 Social Media:
- Facebook: @CaterHouse
- Instagram: @CaterHouse
- Twitter: @CaterHouse
- LinkedIn: Cater House

Would you like the address of our nearest outlet or connect with us on social media?`;
    }
    
    // Help or general information
    else if (lowerMessage.includes('help') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
      return `I can help you with:

1. Menu Information
   - Current menu items
   - Special dishes
   - Pricing details
   - Dietary options
   - Seasonal specials
   - Custom menu creation

2. Ordering Process
   - How to place an order
   - Payment methods
   - Delivery options
   - Tracking orders
   - Bulk ordering
   - Special requests

3. Catering Services
   - Event packages
   - Custom menus
   - Bulk orders
   - Special requirements
   - Event planning
   - Venue coordination

4. General Information
   - Operating hours
   - Contact details
   - Location information
   - Special offers
   - Customer support
   - Feedback process

What would you like to know more about?`;
    }
    
    // Thank you responses
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with? Feel free to ask about:\n\n" +
             "1. Our menu and specials\n" +
             "2. Event catering services\n" +
             "3. Package options\n" +
             "4. Pricing and offers\n" +
             "5. Delivery information\n" +
             "6. Payment methods\n" +
             "7. Special dietary requirements";
    }
    
    // Order tracking responses
    if (lowerMessage.includes('track') || lowerMessage.includes('order') || lowerMessage.includes('status')) {
      return `I can help you track your order. Please provide your order ID or email address to check the status.

Current Order Status Options:
1. Pending - Order received and being processed
2. Confirmed - Order confirmed and being prepared
3. Preparing - Food is being prepared
4. Out for Delivery - Order is on its way
5. Delivered - Order has been delivered
6. Cancelled - Order has been cancelled

Would you like to:
1. Track an existing order?
2. Check order history?
3. Get delivery updates?
4. Know about order cancellation policy?
5. Contact support for order issues?

Please provide your order ID or email address to proceed.`;
    }
    
    // Order cancellation responses
    else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return `Here's our order cancellation policy:

🕒 Cancellation Timeframes:
- Before preparation: Full refund
- During preparation: Partial refund
- Out for delivery: No refund

📝 Cancellation Process:
1. Contact us within 30 minutes of order placement
2. Provide order ID and reason
3. Receive confirmation
4. Refund processed within 3-5 business days

💰 Refund Methods:
- Original payment method
- Wallet credit
- Bank transfer
- Store credit

Would you like to:
1. Cancel an existing order?
2. Check refund status?
3. Know more about cancellation policy?
4. Contact support for cancellation?`;
    }
    
    // Order history responses
    else if (lowerMessage.includes('history') || lowerMessage.includes('past') || lowerMessage.includes('previous')) {
      return `I can help you with your order history:

📋 Order History Features:
- View past orders
- Check order details
- Track delivery status
- View payment history
- Download invoices
- Rate past orders

📊 Order Statistics:
- Total orders placed
- Favorite items
- Regular delivery times
- Preferred payment methods
- Average order value

Would you like to:
1. View your order history?
2. Check specific order details?
3. Download order invoices?
4. Rate a past order?
5. Get order statistics?`;
    }
    
    // Default response
    else {
      return "I'm not sure I understand. Could you please rephrase your question? You can ask about:\n\n" +
             "1. Our menu and specials\n" +
             "2. Event catering services\n" +
             "3. Package options\n" +
             "4. Pricing and offers\n" +
             "5. Delivery information\n" +
             "6. Payment methods\n" +
             "7. Special dietary requirements\n" +
             "8. Operating hours\n" +
             "9. Contact information\n" +
             "10. Help with ordering";
    }
  };

  // Update suggestion buttons to include more dynamic options
  const SuggestionButtons = () => {
    const time = new Date().getHours();
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    
    const baseSuggestions = [
      "Show menu",
      "Event catering",
      "Packages",
      "Today's special",
      "Corporate services",
      "Wedding catering",
      "Delivery info",
      "Payment methods",
      "Dietary options",
      "Contact info",
      "Operating hours",
      "Track order",
      "Order history",
      "Help"
    ];
    
    const timeBasedSuggestions = time >= 11 && time <= 14 ? ["Lunch specials", "Corporate lunch"] : 
                                time >= 18 && time <= 21 ? ["Dinner specials", "Family dinner"] : [];
    
    const weekendSuggestions = isWeekend ? ["Weekend offers", "Party packages"] : [];
    
    const suggestions = [...baseSuggestions, ...timeBasedSuggestions, ...weekendSuggestions];
    
    const handleSuggestionClick = (suggestion) => {
      setMessages([...messages, { text: suggestion, isBot: false }]);
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse = getBotResponse(suggestion);
        setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
        setIsTyping(false);
      }, 800 + Math.random() * 800);
    };
    
    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-white">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="bg-white text-green text-xs py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-green text-white rounded-full p-4 shadow-lg hover:bg-green/80 transition-all ${isOpen ? 'hidden' : 'block'}`}
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="bg-green rounded-lg shadow-xl w-80 md:w-96 h-96 flex flex-col">
          {/* Chat header */}
          <div className="bg-green text-black p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2" />
              <h3 className="font-semibold">Cater House Assistant</h3>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleClearChat} 
                className="hover:text-gray-300 mr-3 text-sm"
                title="Clear chat history"
              >
                Clear
              </button>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <FaTimes />
            </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${message.isBot ? 'text-left' : 'text-right'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    message.isBot 
                      ? 'bg-white text-black' 
                      : 'bg-white text-black'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-3 text-left">
                <div className="inline-block p-3 bg-white text-black rounded-lg flex items-center">
                  <FaRegClock className="mr-2 animate-pulse" />
                  <div className="dot-flashing"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion buttons */}
          <SuggestionButtons />

          {/* Chat input */}
          <div className="border-t border-white p-3">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white text-white bg-green placeholder-white"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-white text-green px-4 rounded-r-lg hover:bg-gray-200"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for the typing indicator */}
      <style>{`
        .dot-flashing {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #444;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #444;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #444;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% {
            background-color: #444;
          }
          50%, 100% {
            background-color: #ccc;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 