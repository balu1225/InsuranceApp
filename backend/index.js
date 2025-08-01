const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('✅ API is working');
});

// Routes
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/groups', require('./routes/memberRoutes'));
app.use('/api/ichra-classes', require('./routes/ichraClassRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));  
app.use('/api/affordability', require('./routes/affordabilityRoutes'));
app.use('/api/comparison', require('./routes/comparisonRoutes')); // ✅ mount

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});