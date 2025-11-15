<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-top: 0;">New Contact Form Submission</h1>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <p>You have received a new contact form submission. Details below:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            @if($contact->name)
            <p><strong>Name:</strong> {{ $contact->name }}</p>
            @endif
            
            <p><strong>Email:</strong> <a href="mailto:{{ $contact->email }}">{{ $contact->email }}</a></p>
            
            @if($contact->phone)
            <p><strong>Phone:</strong> <a href="tel:{{ $contact->phone }}">{{ $contact->phone }}</a></p>
            @endif
            
            @if($contact->subject)
            <p><strong>Subject:</strong> {{ $contact->subject }}</p>
            @endif

            @if($contact->source)
            <p><strong>Source:</strong> {{ ucfirst($contact->source) }}</p>
            @endif
            
            @if($contact->courses)
            <p><strong>Related Courses:</strong> {{ $contact->courses }}</p>
            @endif
            
            <p><strong>Submitted:</strong> {{ $contact->created_at->format('F d, Y \a\t h:i A') }}</p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">{{ $contact->message }}</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 4px; border-left: 4px solid #3498db;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Action Required:</strong> Please review this submission and reply if necessary through the admin dashboard.
            </p>
        </div>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">
        <p style="margin: 0;">This is an automated notification from your contact form system.</p>
    </div>
</body>
</html>

