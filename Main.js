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
    NAME: { type: String, required: true },
    COUNTRY: { type: String, required: true },
    DEBUT: { type: Number, required: true },
    GENDER: { type: String, required: true },
    MEMBERS: { type: String, required: true },
    POPULARITY: { type: Number, required: true }
});

const genreSchema = new mongoose.Schema({
    GENRE: { type: String, required: true },
    ARTISTS: { type: [artistSchema], default: [] },
}, { collection: 'ArtistData' });

const Genre = mongoose.model('Genre', genreSchema);

app.get('/', (req, res) => {
    res.send('API running!');
});

app.get('/:genreName', async (req, res) => {
    const { genreName } = req.params;

    try {
        const genre = await Genre.findOne({ GENRE: genreName });

        if (!genre) {
            return res.status(404).json({ message: 'Genre not found' });
        }
        
        res.json(genre.ARTISTS);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching artists', error });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 at PORT:${PORT}`)
});