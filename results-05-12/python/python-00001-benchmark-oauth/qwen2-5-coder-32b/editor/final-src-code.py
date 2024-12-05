
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00001-benchmark-oauth/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00001-benchmark-oauth/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00001-benchmark-oauth/qwen2-5-coder-32b/editor/assets"

from typing import Dict, Any, Optional, List
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os

class CONFIG:
    client_secret_file: str
    token_file: str
    scopes: List[str]

class INPUTS:
    event: str
    description: str
    start_iso: str
    end_iso: str

class OUTPUT:
    event_id: Optional[str]
    error_message: Optional[str]

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    creds = None
    if os.path.exists(config.token_file):
        creds = Credentials.from_authorized_user_file(config.token_file, config.scopes)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                config.client_secret_file, config.scopes)
            creds = flow.run_local_server(port=0)
        
        with open(config.token_file, 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)

        event = {
            'summary': inputs.event,
            'description': inputs.description,
            'start': {
                'dateTime': inputs.start_iso,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': inputs.end_iso,
                'timeZone': 'UTC',
            },
        }

        event = service.events().insert(calendarId='primary', body=event).execute()
        return OUTPUT(event_id=event['id'], error_message=None)
    except Exception as e:
        return OUTPUT(event_id=None, error_message=str(e))

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.event="Test Event"
    inputs.description="Test Description"
    inputs.start_iso="2024-12-05T10:00:00"
    inputs.end_iso="2024-12-05T11:00:00"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
