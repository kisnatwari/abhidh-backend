<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Enrollment received</title>
</head>
<body style="margin:0;background-color:#f5f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background-color:#f5f7fb;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 45px rgba(22,45,90,0.12);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1f3c88,#274690);padding:28px 40px;color:#ffffff;">
                            <h1 style="margin:0;font-size:22px;letter-spacing:0.04em;">Abhidh Academy</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;">Hi {{ $user->name }},</h2>
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4b5563;">
                                Thanks for enrolling in <strong>{{ $course->title }}</strong>! We’ve received your payment reference and our team will verify it shortly.
                            </p>
                            <div style="margin:24px 0;padding:18px 20px;border-radius:14px;background-color:#eef2ff;border:1px solid rgba(39,70,144,0.18);">
                                <p style="margin:0;font-size:14px;color:#1f3c88;font-weight:600;">What happens next?</p>
                                <ul style="margin:12px 0 0;padding-left:20px;color:#42526e;font-size:14px;line-height:1.5;">
                                    <li>We’ll review the payment screenshot you uploaded.</li>
                                    <li>You’ll receive an email as soon as the payment is verified.</li>
                                    <li>Once verified, you’ll have full access to your course materials.</li>
                                </ul>
                            </div>
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4b5563;">
                                Need any help in the meantime? Just reply to this email and our support team will assist you.
                            </p>
                            <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#4b5563;">
                                Until then, feel free to explore your dashboard to review your enrollment details.
                            </p>
                            <p style="margin:0;font-size:15px;color:#1f2937;">
                                Warm regards,<br>
                                <strong>The Abhidh Academy Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 28px;text-align:center;font-size:13px;color:#6b7280;background-color:#f8fafc;">
                            © {{ date('Y') }} Abhidh Academy. All rights reserved.<br>
                            Questions? Email <a href="mailto:support@abhidh.com" style="color:#1f3c88;text-decoration:none;">support@abhidh.com</a>.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

