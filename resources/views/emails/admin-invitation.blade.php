<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Administrator Invitation</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f8fb; margin: 0; padding: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 43, 102, 0.08);">
                    <tr>
                        <td style="padding: 32px 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 22px; color: #102a43;">Welcome to Abhidh Academy Admin</h1>
                            <p style="margin: 0 0 12px; font-size: 15px; color: #243b53;">Hi {{ $user->name }},</p>
                            <p style="margin: 0 0 12px; font-size: 15px; color: #243b53;">
                                You have been added as an administrator for Abhidh Academy. Use the credentials below to sign in and manage the academy portal.
                            </p>

                            <div style="margin: 24px 0; padding: 16px 20px; background-color: #e0ebff; border-radius: 10px; border: 1px solid #c3dafe;">
                                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1a202c;">Your credentials</p>
                                <p style="margin: 0; font-size: 14px; color: #1a202c;">
                                    <strong>Email:</strong> {{ $user->email }}<br>
                                    <strong>Temporary password:</strong> {{ $temporaryPassword }}
                                </p>
                            </div>

                            <p style="margin: 0 0 20px; font-size: 15px; color: #243b53;">
                                For security, please log in and change your password after your first sign-in.
                            </p>

                            <p style="margin: 0 0 32px; text-align: center;">
                                <a href="{{ $loginUrl }}" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 9999px;">Go to admin login</a>
                            </p>

                            <p style="margin: 0; font-size: 13px; color: #3a506b;">
                                If you did not expect this email, please contact the academy support team immediately.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

