import requests
import logging
import json
import os
from datetime import datetime

# SheetDB API URL from environment variable with fallback
SHEETDB_API_URL = os.environ.get("SHEETDB_API_URL", "https://sheetdb.io/api/v1/vu2ewxcds5ot1")

logger = logging.getLogger(__name__)

def save_user_data_to_sheets(action, user_data):
    """
    Save user data to Google Sheets via SheetDB API
    
    Args:
        action (str): The action being performed (login/register)
        user_data (dict): User data to save
    
    Returns:
        bool: True if data was saved successfully, False otherwise
    """
    try:
        # Add timestamp and action type
        data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "action": action,
            "username": user_data.get("username", ""),
            "email": user_data.get("email", ""),
            "phone_number": user_data.get("phone_number", ""),
            "ip_address": user_data.get("ip_address", ""),
            "user_agent": user_data.get("user_agent", "")
        }
        
        # Make API request to SheetDB
        response = requests.post(
            f"{SHEETDB_API_URL}",
            json={"data": data}
        )
        
        if response.status_code == 201 or response.status_code == 200:
            logger.info(f"User data saved to Sheets: {action} - {user_data.get('username')}")
            return True
        else:
            logger.error(f"Failed to save data to Sheets. Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Error saving data to Google Sheets: {str(e)}")
        return False