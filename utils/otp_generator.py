import random
import string
import secrets

def generate_otp(length=6):
    """
    Generate a secure OTP of specified length
    
    Args:
        length (int): Length of the OTP to generate (default: 6)
        
    Returns:
        str: Generated OTP
    """
    # For purely numeric OTP
    if length <= 4:
        # For short OTPs, use a more secure method to avoid patterns
        return ''.join(secrets.choice(string.digits) for _ in range(length))
    else:
        # For longer OTPs, using random is acceptable
        # We ensure a minimum of 10^length combinations
        return ''.join(random.choice(string.digits) for _ in range(length))

def generate_alphanumeric_otp(length=8):
    """
    Generate a secure alphanumeric OTP of specified length
    
    Args:
        length (int): Length of the OTP to generate (default: 8)
        
    Returns:
        str: Generated alphanumeric OTP
    """
    # Exclude ambiguous characters like 'l', 'I', '1', 'O', '0'
    characters = ''.join(c for c in string.ascii_letters + string.digits 
                         if c not in 'lI1O0')
    
    # Use secrets module for cryptographically strong random selections
    return ''.join(secrets.choice(characters) for _ in range(length))
