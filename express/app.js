require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9800;

app.use(express.json());
app.use(cors());

app.post('/api/openai/chat', async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'OpenAI API key is not configured on the server' });
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            req.body,
            { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        );

        res.json(response.data);
    } catch (error) {
        console.error('OpenAI proxy error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from OpenAI',
            message: error.message
        });
    }
});

app.post('/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const results = [];
        
        const answerMap = new Map();
        $('.alert-message.answer').each((index, elem) => {
            const bElement = $(elem).find('b');
            const answerText = bElement.contents().filter(function() {
                return this.nodeType === 3;
            }).first().text().trim();
            
            const answers = answerText.split(',').map(answer => answer.trim());
            answerMap.set(index, answers);
        });

        let questionIndex = 0;
        $('.entry-content.clearfix').each((_, entryDiv) => {
            $(entryDiv).find('h6').each((index, h6Element) => {

                let question = $(h6Element).text().trim();
                question = question.replace(/^\d+\.\s*/, '');
                question = question.replace(/\?$/, '');
                
                const choices = [];
                const correctAnswers = answerMap.get(questionIndex) || [];
                console.log(`Question ${questionIndex + 1} answers:`, correctAnswers);
                
                let currentElement = $(h6Element);
                
                while (true) {
                    currentElement = currentElement.next();
                    
                    if (currentElement.length === 0) break;
                    
                    if (currentElement.is('h6') || currentElement.hasClass('alert-message')) break;
                    
                    if (currentElement.is('p')) {
                        const labelSpan = currentElement.find('span.label.label-info');
                        if (labelSpan.length > 0) {
                            const label = labelSpan.text().trim();
                            labelSpan.remove();
                            const choiceText = currentElement.text().trim();
                            
                            console.log('Choice label:', label);
                            console.log('Comparing with correct answers:', correctAnswers);
                            
                            const isCorrect = correctAnswers.includes(label);
                            console.log('Is correct:', isCorrect);
                            
                            choices.push({
                                label,
                                text: choiceText,
                                correct: isCorrect
                            });
                        }
                    }
                }
                
                results.push({
                    question,
                    choices,
                    correctAnswers,
                    correctAnswer: correctAnswers.join(', ')
                });
                
                questionIndex++;
            });
        });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ 
            error: 'Failed to scrape the webpage',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});