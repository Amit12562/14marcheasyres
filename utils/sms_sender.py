import os
import logging
from twilio.rest import Client

logger = logging.getLogger(__name__)

def send_sms_otp(to_phone_number, otp_code, purpose="Verification"):
    """
    Send OTP via SMS using Twilio
    
    Args:
        to_phone_number (str): Recipient phone number (E.164 format)
        otp_code (str): OTP code to send
        purpose (str): Purpose of the OTP (default: Verification)
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    try:
        # Get Twilio configuration from environment variables
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_phone = os.environ.get("TWILIO_PHONE_NUMBER")
        
        # Check if credentials are available
        if not account_sid or not auth_token or not from_phone:
            logger.error("Twilio credentials not configured")
            return False
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Message content
        message_body = f"Your {purpose} OTP is: {otp_code}. This code is valid for 5 minutes and can be used only once."
        
        # Sending the SMS
        message = client.messages.create(
            body=message_body,
            from_=from_phone,
            to=to_phone_number
        )
        
        logger.info(f"SMS sent with SID: {message.sid}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send SMS: {str(e)}")
        return False
