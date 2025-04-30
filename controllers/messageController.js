const Message = require('../models/Message');
const Session = require('../models/Session');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const axios = require('axios'); // add this at the top if not already

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, content } = req.body;

    // 1. Check session exists and belongs to user
    const session = await Session.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Set title if not already set
    if (!session.title) {
      await session.update({ title: content.slice(0, 50) });
    }

    // 3. Save user message
    await Message.create({
      sessionId,
      userId,
      role: 'user',
      content,
    });

    // 4. Fetch previous messages for context
    const previousMessages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
    });

    const context = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 5. Add current message to context
    context.push({ role: 'user', content });

    // 6. Send to OpenAI
    const modelToUse = session?.model || 'gpt-3.5-turbo';

  

    const response = await axios.post('http://localhost:8000/chat', {
      model: modelToUse,
      messages: context, // your chat history + user input
    });

    console.log('LLM Response from Python API:', response.data);
    
    const botReply = response.data.reply;
    

    // 7. Save assistant message
    await Message.create({
      sessionId,
      userId,
      role: 'assistant',
      content: botReply,
    });

    // 8. Return reply
    res.json({ reply: botReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    // 1. Check session exists and belongs to user
    const session = await Session.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Fetch messages
    const messages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
