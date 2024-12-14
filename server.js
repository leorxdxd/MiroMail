require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        httpOnly: true,
        sameSite: 'strict', // Adjust based on your requirements
    },
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`)
);

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        res.json({
            user: {
                name: user.displayName,
                email: user.emails[0].value,
                profilePic: user.photos[0].value,
            },
        });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// Email API
app.post('/api/send-email', async (req, res) => {
    const { toEmail, subject, body } = req.body;

    if (!toEmail || !subject || !body) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.REDIRECT_URI
        );
        oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `Miro <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject,
            text: body,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully!');
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).send('Failed to send email.');
    }
});

// WebSocket Chat Functionality
let connectedUsers = {};

wss.on('connection', (ws, req) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'register':
                connectedUsers[parsedMessage.userId] = ws;
                break;

            case 'chat':
                const { recipientId, text, senderId } = parsedMessage;
                const recipientSocket = connectedUsers[recipientId];

                if (recipientSocket) {
                    recipientSocket.send(JSON.stringify({
                        type: 'chat',
                        text,
                        senderId,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;

            default:
                console.error('Unknown message type:', parsedMessage.type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        Object.keys(connectedUsers).forEach((key) => {
            if (connectedUsers[key] === ws) {
                delete connectedUsers[key];
            }
        });
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'canva-like-app-frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'canva-like-app-frontend/build', 'index.html'));
    });
}

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`));
