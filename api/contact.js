export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            message: 'Server error: Resend API Key is missing. Please configure RESEND_API_KEY in Vercel environment variables.'
        });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: 'Portfolio Contact Form <onboarding@resend.dev>', // Resend's default testing email
                to: 'hello@example.com', // TODO: User needs to change this to their actual email address
                subject: `New Freelance Inquiry from ${name}`,
                reply_to: email, // This allows the user to just hit "Reply" in their email client
                html: `
          <h2>New message from your portfolio website!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API Error:', data);
            throw new Error(data.message || 'Failed to send email via Resend');
        }

        return res.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({ message: 'Failed to process contact request' });
    }
}
