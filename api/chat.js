// Vercel Serverless Function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'Invalid messages format' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            message: 'Server error: OpenAI API Key is missing. Please configure OPENAI_API_KEY in Vercel environment variables.'
        });
    }

    try {
        const formattedMessages = [
            {
                role: "system",
                content: `You are the AI Sales Assistant for Daniil Kaidalov's Premium Web Studio. Your goal is to represent Daniil professionally and sell his web development services and templates to visitors.
                  
Daniil runs a boutique web studio building high-converting, stunning websites. 
Key Offerings:
1. Premium Templates (Starting at $49): Beautiful, ready-to-use codebase. Example: The Wedding Template.
2. Template Customization (Starting at $299): Daniil will customize a template with the client's text/images/colors.
3. Custom Web Applications (Starting at $1,500): Fully bespoke sites with complex animations (GSAP, Three.js) and custom backends.

Contact info: Guide visitors to use the Contact form or email hello@example.com to start a project.
                  
Keep your responses helpful, persuasive, and professional. Actively try to figure out what the visitor needs (a quick template vs a custom build) and recommend the right service. Use markdown for emphasis. Don't invent facts.`
            },
            ...messages
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // or another suitable model
                messages: formattedMessages,
                max_tokens: 300,
                temperature: 0.7,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI Error:', data);
            throw new Error(data.error?.message || 'Failed to fetch from OpenAI');
        }

        const aiMessage = data.choices[0].message.content;

        return res.status(200).json({ message: aiMessage });

    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({ message: 'Failed to process chat request' });
    }
}
