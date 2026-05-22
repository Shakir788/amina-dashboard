const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const webhookRoutes =
    require('./controllers/webhook');

const generateAIResponse =
    require('./services/ai');

app.use('/webhook', webhookRoutes);


// HOME ROUTE
app.get('/', (req, res) => {

    res.send('Amina AI Server Running 🚀');
});


// AI TEST ROUTE
app.get('/test-ai', async (req, res) => {

    const reply =
        await generateAIResponse(
            "Do you have oversized hoodies?"
        );

    res.send(reply);
});


app.listen(PORT, () => {

    console.log(
        `🚀 Server is successfully running on port ${PORT}`
    );
});