import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app import app

logger = logging.getLogger(__name__)

def send_email_otp(to_email, otp_code, purpose="Verification"):
    """
    Send OTP via email
    
    Args:
        to_email (str): Recipient email address
        otp_code (str): OTP code to send
        purpose (str): Purpose of the OTP (default: Verification)
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Get email configuration from environment variables with fallbacks
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_username = os.environ.get('SMTP_USERNAME', '')
        smtp_password = os.environ.get('SMTP_PASSWORD', '')
        sender_email = os.environ.get('EMAIL_SENDER', 'noreply@otpservice.com')
        
        # Check if credentials are available
        if not smtp_username or not smtp_password:
            logger.error("SMTP credentials not configured")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = f"Your {purpose} OTP Code"
        
        # Create email body
        body = f"""
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #333;">Your OTP Code for {purpose}</h2>
                <p>Your One-Time Password (OTP) for {purpose.lower()} is:</p>
                <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    {otp_code}
                </div>
                <p>This OTP is valid for 5 minutes and can be used only once.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #777;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"OTP email sent to {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False
