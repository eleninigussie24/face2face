const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP)
  // For production, use Gmail or SendGrid
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App-specific password
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development mode - log to console instead of sending real emails
    return {
      sendMail: async (mailOptions) => {
        console.log('\n===== EMAIL (Development Mode) =====');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML:', mailOptions.html);
        console.log('=====================================\n');
        return { messageId: 'dev-mode-' + Date.now() };
      }
    };
  }
};

// Send verification email
const sendVerificationEmail = async (userEmail, userName, verificationCode) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Face2Face <noreply@faceface.app>',
    to: userEmail,
    subject: 'Bestätige deine Email-Adresse - Face2Face',
    html: `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
            color: #333;
            text-align: center;
          }
          .content h2 {
            color: #333;
            font-size: 22px;
            margin-top: 0;
          }
          .content p {
            line-height: 1.6;
            color: #666;
            font-size: 16px;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .code {
            font-size: 48px;
            font-weight: 700;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
          }
          .code-label {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.9;
            margin-bottom: 10px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #999;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            text-align: left;
          }
          .warning p {
            color: #856404;
            margin: 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Face2Face</h1>
          </div>
          <div class="content">
            <h2>Hallo ${userName}!</h2>
            <p>Willkommen bei Face2Face! Um deinen Account zu aktivieren, gib bitte diesen Code ein:</p>
            
            <div class="code-box">
              <div class="code-label">Dein Verifizierungs-Code</div>
              <div class="code">${verificationCode}</div>
            </div>
            
            <p>Dieser Code ist gültig für 24 Stunden.</p>
            
            <div class="warning">
              <p><strong>Wichtig:</strong> Teile diesen Code mit niemandem. Face2Face wird dich niemals nach diesem Code fragen.</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #999;">
              Wenn du dich nicht bei Face2Face registriert hast, ignoriere diese Email einfach.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Face2Face. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send welcome email (after verification)
const sendWelcomeEmail = async (userEmail, userName) => {
  const transporter = createTransporter();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Face2Face <noreply@faceface.app>',
    to: userEmail,
    subject: 'Willkommen bei Face2Face!',
    html: `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background-color: #28a745;
            color: white;
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
            color: #333;
          }
          .content h2 {
            color: #333;
            font-size: 22px;
            margin-top: 0;
          }
          .content p {
            line-height: 1.6;
            color: #666;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #999;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Willkommen bei Face2Face!</h1>
          </div>
          <div class="content">
            <h2>Hallo ${userName}!</h2>
            <p>Deine Email-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt anmelden und loslegen!</p>
            <p>Was du jetzt machen kannst:</p>
            <ul>
              <li>Dein Profil vervollständigen (Studiengang, Semester, Module)</li>
              <li>Gruppen durchsuchen und beitreten</li>
              <li>Eigene Studiengruppen erstellen</li>
              <li>Mit anderen Studierenden kommunizieren</li>
            </ul>
            <center>
              <a href="${baseUrl}/login.html" class="button">Jetzt anmelden</a>
            </center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Face2Face. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - welcome email is not critical
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};

