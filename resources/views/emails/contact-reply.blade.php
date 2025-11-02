<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply to Your Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-top: 0;">Reply to Your Inquiry</h1>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <p>Dear @if($contact->name){{ $contact->name }}@else{{ 'Valued Customer' }}@endif,</p>
        
        <p>Thank you for contacting us. We have received your inquiry and here is our response:</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">{{ $replyMessage }}</p>
        </div>
        
        @if($contact->subject)
        <p><strong>Original Subject:</strong> {{ $contact->subject }}</p>
        @endif
        
        @if($contact->courses)
        <p><strong>Related Courses:</strong> {{ $contact->courses }}</p>
        @endif
        
        <p style="margin-top: 30px;">If you have any further questions or concerns, please don't hesitate to reach out to us.</p>
        
        <p>Best regards,<br>
        <strong>Abhidh Team</strong></p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">
        <p style="margin: 0;">This is an automated email in response to your inquiry submitted on {{ $contact->created_at->format('F d, Y') }}.</p>
    </div>
</body>
</html>

