const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  const { model } = req.body;
  const userId = req.user.id;

  console.log('Creating session with model:', model); // <--- Add this line

  const session = await Session.create({
    userId,
    model: model || 'gpt-3.5-turbo',
  });

  res.json(session);
};



exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await Session.findOne({ where: { id: sessionId, userId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const newValue = !session.pin;
    await session.update({ pin: newValue });

    res.json({ success: true, pin: newValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
};

