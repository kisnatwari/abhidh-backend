<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Course access unlocked</title>
</head>
<body style="margin:0;background-color:#f5f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background-color:#f5f7fb;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 22px 48px rgba(22,45,90,0.12);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1d4ed8,#1f3c88);padding:30px 40px;color:#ffffff;">
                            <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:0.03em;">Abhidh Academy</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;">Great news, {{ $user->name }}!</h2>
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4b5563;">
                                Your payment for <strong>{{ $course->title }}</strong> has been verified. You now have full access to the course inside your student dashboard.
                            </p>
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4b5563;">
                                Dive straight into your learning plan, track your modules, and pick up exactly where you left off.
                            </p>
                            <div style="text-align:center;margin:28px 0;">
                                <a href="{{ url('/academy/dashboard') }}" style="display:inline-block;padding:14px 30px;border-radius:9999px;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;letter-spacing:0.02em;box-shadow:0 12px 26px rgba(29,78,216,0.28);">
                                    Go to my dashboard
                                </a>
                            </div>
                            <div style="margin:28px 0;padding:18px 20px;border-radius:14px;background-color:#ecfeff;border:1px solid rgba(13,148,136,0.2);">
                                <p style="margin:0 0 8px;font-size:14px;color:#0f766e;font-weight:600;">Helpful tips</p>
                                <ul style="margin:0;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.5;">
                                    <li>Find your course under <strong>My Enrollments</strong>.</li>
                                    <li>Self-paced content is now unlocked for your account.</li>
                                    <li>Need assistance? Reach out to your mentor or reply to this email.</li>
                                </ul>
                            </div>
                            <p style="margin:0;font-size:15px;color:#1f2937;">
                                Happy learning,<br>
                                <strong>Abhidh Academy</strong>
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

