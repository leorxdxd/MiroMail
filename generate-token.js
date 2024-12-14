const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
    '949697805368-tnjr8n7o0t81e3jvm47duu7r79lsftki.apps.googleusercontent.com',
    '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',
    'http://localhost:3002/auth/google/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const generateAuthUrl = () => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this URL:', authUrl);
};

generateAuthUrl();
