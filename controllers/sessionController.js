const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  try {
    const { model } = req.body;
    const userId = req.user.id;

    console.log('Creating session with model:', model);

    const session = await Session.create({
      userId,
      model: model || 'gpt-3.5-turbo',
    });

    res.json(session);
  } catch (err) {
    console.error('Session creation error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error('Fetching sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.pin = !session.pin;
    await session.save();

    res.json({ success: true, pin: session.pin });
  } catch (err) {
    console.error('Toggle pin error:', err);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
};
