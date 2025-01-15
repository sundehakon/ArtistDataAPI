require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const apiKey = req.query.api_key;
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
});

mongoose.connect(process.env.MONGODB_URI, {});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB: ✅');
});

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    debut: { type: Number, required: true },
    gender: { type: String, required: true },
    members: { type: String, required: true },
    popularity: { type: Number, required: true }
});

const genreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artists: { type: [artistSchema], default: [] },
});

const Genre = mongoose.model('Genre', genreSchema)