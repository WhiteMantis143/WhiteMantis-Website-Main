// lib/email-templates.ts

export function getOTPEmailTemplate(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .greeting {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 12px;
      line-height: 1;
    }
    .welcome-text {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 8px;
      line-height: 0.5;
      padding-bottom: 10px;
    }
    .instruction-text {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .code-label {
      font-size: 16px;
      color: #4B3827;
      font-weight: 500;
      margin-bottom: 16px;
      text-decoration: none;
    }
    .otp-container {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;
      justify-content: center;
    }
    .otp-digit {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      color: #4B3827;
      text-align: center;
      line-height: 48px;
    }
    .validity-text {
      font-size: 14px;
      color: #8C8C8C;
      font-style: italic;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .help-text {
      font-size: 16px;
      color: #6C7A5F;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    .support-email {
      font-size: 16px;
      color: #6C7A5F !important;
      text-decoration: underline;
      margin-bottom: 32px;
      display: inline-block;
    }
    .closing {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 0px;
      line-height: 0.5;
    }
    .signature {
      font-size: 16px;
      color: #4B3827;
      font-weight: 500;
      line-height: 0.5;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 20px;
        padding: 24px;
      }
      .otp-digit {
        width: 40px;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
        font-weight: 1000;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <p class="greeting">Hi there,</p>
    
    <p class="welcome-text">Welcome to White Mantis</p>
    <p class="instruction-text">To complete your sign-in, please use the verification code below:</p>
    
    <p class="code-label">Your verification code</p>
    
    <div class="otp-container">
      ${otp.split('').map(digit => `<div class="otp-digit">${digit}</div>`).join('')}
    </div>
    
    <p class="validity-text">This code is valid for the next 5 minutes.</p>
    
    <p class="help-text">Need help? Reach us at</p>
    <a href="mailto:support@whitemantis.com" class="support-email">support@whitemantis.com</a>
    
    <p class="closing">Happy brewing,</p>
    <p class="signature">Team White Mantis</p>
  </div>
</body>
</html>
  `.trim();
}

export function OTPForUpdateEmail(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to White Mantis</title>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .greeting {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 12px;
      line-height: 1;
    }
    .welcome-text {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 8px;
      line-height: 0.5;
      padding-bottom: 10px;
    }
    .instruction-text {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .code-label {
      font-size: 16px;
      color: #4B3827;
      font-weight: 500;
      margin-bottom: 16px;
      text-decoration: none;
    }
    .otp-container {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;
      justify-content: center;
    }
    .otp-digit {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      color: #4B3827;
      text-align: center;
      line-height: 48px;
    }
    .validity-text {
      font-size: 14px;
      color: #8C8C8C;
      font-style: italic;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .help-text {
      font-size: 16px;
      color: #6C7A5F;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    .support-email {
      font-size: 16px;
      color: #6C7A5F !important;
      text-decoration: underline;
      margin-bottom: 32px;
      display: inline-block;
    }
    .closing {
      font-size: 16px;
      color: #4B3827;
      margin-bottom: 0px;
      line-height: 0.5;
    }
    .signature {
      font-size: 16px;
      color: #4B3827;
      font-weight: 500;
      line-height: 0.5;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 20px;
        padding: 24px;
      }
      .otp-digit {
        width: 40px;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
        font-weight: 1000;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <p class="greeting">Hi there,</p>
    
    <p class="welcome-text">Email Change Request</p>
    <p class="instruction-text">We received a request to change the email address linked to your White Mantis account.
      To confirm this change, please use the verification code below:</p>
    
    <p class="code-label">Your verification code</p>
    
    <div class="otp-container">
      ${otp.split('').map(digit => `<div class="otp-digit">${digit}</div>`).join('')}
    </div>
    
    <p class="validity-text">This code is valid for the next 5 minutes.</p>
    
    <p class="help-text">Need help?If you didn’t request this change, you can safely ignore this email or contact us immediately at</p>
    <a href="mailto:support@whitemantis.com" class="support-email">support@whitemantis.com</a>
    
    <p class="closing">Happy brewing,</p>
    <p class="signature">Team White Mantis</p>
  </div>
</body>
</html>
  `.trim();
}
