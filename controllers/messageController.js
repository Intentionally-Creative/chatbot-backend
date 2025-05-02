const Message = require('../models/Message');
const Session = require('../models/Session');
const { default: axios } = require('axios');

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, content } = req.body;

    // 1. Check session exists and belongs to user
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Set title if not already set
    if (!session.title) {
      session.title = content.slice(0, 50);
      await session.save();
    }

    // 3. Save user message
    await Message.create({
      sessionId,
      userId,
      role: 'user',
      content,
    });

    // 4. Fetch previous messages
    const previousMessages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    const context = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 5. Add current user message to context
    context.push({ role: 'user', content });

    // 6. Send to Python LLM API
    const modelToUse = session.model || 'gpt-3.5-turbo';
    const response = await axios.post('http://localhost:8000/chat', {
      model: modelToUse,
      messages: context,
    });

    console.log('LLM Response from Python API:', response.data);

    const botReply = response.data.reply;

    // 7. Save assistant response
    await Message.create({
      sessionId,
      userId,
      role: 'assistant',
      content: botReply,
    });

    // 8. Return reply
    res.json({ reply: botReply });

  } catch (err) {
    console.error('Message send error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    // 1. Check session exists and belongs to user
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Fetch messages
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.error('Message fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
