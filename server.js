const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');

require('./models/User');
require('./models/Session');
require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json()); // Important!

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Chatbot API is running!');
});

sequelize.sync({ alter: true }).then(() => {
  console.log('Database connected and models synced!');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to connect to DB:', err);
});

const sessionRoutes = require('./routes/sessionRoutes');

// After other app.use()
app.use('/api/sessions', sessionRoutes);

const messageRoutes = require('./routes/messageRoutes');

// After other app.use()
app.use('/api/messages', messageRoutes);
