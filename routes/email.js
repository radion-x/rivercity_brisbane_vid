const express = require('express');
const router = express.Router();
const mailgun = require('mailgun-js');
const pool = require('../db/pool');
const axios = require('axios');

// Initialize Mailgun
let mg;
if (process.env.MAILGUN_API_KEY) {
    mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
        host: process.env.MAILGUN_REGION === 'eu' ? 'api.eu.mailgun.net' : 'api.mailgun.net'
    });
}

/**
 * POST /api/send-email
 */
router.post('/send-email', async (req, res) => {
    try {
        const { businessName, name, email, phone, address, service, message, source } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Name, email, and message are required'
            });
        }

        // 1. Send via Mailgun directly to the ServiceM8 Inbox Email Address!
        // This is the officially supported way to create drops in the ServiceM8 Dispatch Board effortlessly
        // without fighting IP blocks and CORS from their internal proxy endpoint.
        const actualSource = source || 'contact_form';
        let savedId = null;

        try {
            const query = `
                INSERT INTO callback_requests (
                    name, 
                    phone, 
                    email, 
                    message, 
                    service,
                    source,
                    preferred_contact_method
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id;
            `;
            const values = [name, phone || '', email, `${businessName ? 'Business: ' + businessName + '\n' : ''}${address ? 'Address: ' + address + '\n\n' : ''}${message}`, service || null, actualSource, 'any'];
            const result = await pool.query(query, values);
            savedId = result.rows[0].id;
        } catch (dbError) {
            console.error('Database save error:', dbError);
        }

        if (mg) {
            const emailContent = `
                New Quote Request via Website
                =============================
                Business Name: ${businessName || '-'}
                Name: ${name}
                Email: ${email}
                Phone: ${phone || '-'}
                Address: ${address || '-'}
                
                Message/Job Description:
                ${message}
                
                Database ID: ${savedId}
            `;

            // Always send to ServiceM8 Inbox
            const serviceM8Inbox = process.env.SERVICEM8_EMAIL || '49e89f@inbox.servicem8.com';
            
            // If the user configures a normal RECIPIENT_EMAIL, we CC them so they get a copy too.
            let toList = serviceM8Inbox;
            if (process.env.RECIPIENT_EMAIL && process.env.RECIPIENT_EMAIL !== serviceM8Inbox) {
                toList += `, ${process.env.RECIPIENT_EMAIL}`;
            }

            // CRITICAL: Must send FROM the verified Mailgun domain, NOT a random external domain!
            // Otherwise Mailgun silently fails or ServiceM8 spam-filters it.
            const verifiedFrom = `Website Leads <noreply@${process.env.MAILGUN_DOMAIN}>`;
            
            const adminEmail = {
                from: verifiedFrom,
                to: toList,
                'h:Reply-To': email, // Ensures hitting "Reply" in ServiceM8 goes to the client!
                subject: `New Lead: ${name}`,
                text: emailContent // Sending plain text is best for CRM ingestion
            };
            
            console.log("FROM address:", verifiedFrom);
            console.log("TO address:", toList);
            
            console.log("Sending email direct to ServiceM8 Inbox:", serviceM8Inbox);
            await mg.messages().send(adminEmail);
            console.log("Email sent successfully!");
        }

        res.status(200).json({ success: true, message: "Thank you! Your quote request has been received. We usually reply within a few hours." });

    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ error: 'Server configuration error' });
    }
});

module.exports = router;