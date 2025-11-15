<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Verify your email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            margin: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f4f7fb;
            color: #1f2937;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f7fb;
            padding: 32px 0;
        }
        .email-container {
            max-width: 640px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(15, 30, 61, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1f3c88, #274690);
            padding: 32px 40px;
            text-align: left;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.04em;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .content h2 {
            margin: 0 0 16px;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
        }
        .content p {
            margin: 0 0 18px;
            line-height: 1.6;
            font-size: 15px;
            color: #4b5563;
        }
        .cta-button {
            display: inline-block;
            margin: 8px 0 32px;
            padding: 14px 28px;
            border-radius: 9999px;
            background: #1f3c88;
            color: #ffffff !important;
            font-weight: 600;
            text-decoration: none;
            letter-spacing: 0.02em;
            box-shadow: 0 10px 25px rgba(31, 60, 136, 0.28);
        }
        .cta-button:hover {
            background: #173069;
        }
        .divider {
            border: 0;
            height: 1px;
            background: #e5e7eb;
            margin: 32px 0;
        }
        .footer {
            padding: 20px 40px 32px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
        }
        .footer a {
            color: #1f3c88;
        }
        .fallback {
            margin-top: 18px;
            padding: 16px 18px;
            background-color: #f1f5f9;
            border-radius: 12px;
            font-size: 13px;
            color: #334155;
            word-break: break-word;
        }
    </style>
</head>
<body>
    <table role="presentation" class="email-wrapper" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table role="presentation" class="email-container" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="header">
                            <h1>Abhidh Academy</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h2>Hello {{ $user->name ?? 'there' }},</h2>
                            <p>
                                Welcome to Abhidh Academy! We're glad to have you on board.
                                To keep your account secure and unlock full access, please confirm your email address.
                            </p>
                            <p style="text-align: center;">
                                <a href="{{ $verificationUrl }}" class="cta-button">Verify Email Address</a>
                            </p>
                            <p>
                                This link will expire in 60 minutes. If it expires, you can always request
                                a fresh confirmation link from the sign-in screen.
                            </p>
                            <p class="fallback">
                                If the button above is not working, copy and paste the link below into your browser:<br>
                                <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
                            </p>
                            <p>
                                Didn’t create an account? You can safely ignore this email and your address will remain untouched.
                            </p>
                            <hr class="divider">
                            <p>
                                Warm regards,<br>
                                The Abhidh Academy Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            © {{ date('Y') }} Abhidh Academy. All rights reserved.<br>
                            Need help? Reply to this email or visit <a href="mailto:support@abhidh.com">support@abhidh.com</a>.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

