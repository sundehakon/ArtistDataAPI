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

app.get('/ArtistData', async (req, res) => {
    const { genres, gender, country, members, minPopularity, maxPopularity, minDebut, maxDebut } = req.query;
    const genreList = genres ? genres.split(',') : [];

    try {
        const genresData = await Genre.find({ GENRE: { $in: genreList } });

        if (!genresData || genresData.length === 0) {
            return res.status(404).json({ message: 'Genres not found' });
        }

        let filteredArtists = [];
        genresData.forEach((genre) => {
            filteredArtists = [...filteredArtists, ...genre.ARTISTS];
        });

        if (gender) {
            filteredArtists = filteredArtists.filter(artist => artist.GENDER.toLowerCase() === gender.toLowerCase());
        }
        if (country) {
            filteredArtists = filteredArtists.filter(artist => artist.COUNTRY.toLowerCase() === country.toLowerCase());
        }
        if (members) {
            filteredArtists = filteredArtists.filter(artist => artist.MEMBERS.toLowerCase() === members.toLowerCase());
        }
        if (minPopularity) {
            filteredArtists = filteredArtists.filter(artist => artist.POPULARITY < parseInt(minPopularity));
        }
        if (maxPopularity) {
            filteredArtists = filteredArtists.filter(artist => artist.POPULARITY > parseInt(maxPopularity));
        }
        if (minDebut) {
            filteredArtists = filteredArtists.filter(artist => artist.DEBUT > parseInt(minDebut));
        }
        if (maxDebut) {
            filteredArtists = filteredArtists.filter(artist => artist.DEBUT < parseInt(maxDebut));
        }

        res.json(filteredArtists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching artists', error });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 at PORT:${PORT}`)
});
