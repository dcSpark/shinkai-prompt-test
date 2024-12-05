
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00011-benchmark-impossible/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00011-benchmark-impossible/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00011-benchmark-impossible/qwen2-5-coder-32b/editor/assets"

from typing import Dict, Any, Optional, List
import requests

class CONFIG:
    facebook_token: str
    twitter_token: str
    instagram_token: str
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str
    reddit_username: str
    reddit_password: str

class INPUTS:
    title: str
    content: str

class OUTPUT:
    results: Dict[str, Any]

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    output = OUTPUT()
    output.results = {}

    # Facebook Post
    try:
        facebook_response = requests.post(
            "https://graph.facebook.com/me/feed",
            params={
                'access_token': config.facebook_token,
                'message': f"{inputs.title}\n{inputs.content}"
            }
        )
        output.results['facebook'] = facebook_response.json()
    except Exception as e:
        output.results['facebook'] = str(e)

    # Twitter Post
    try:
        twitter_headers = {
            "Authorization": f"Bearer {config.twitter_token}",
            "Content-Type": "application/json"
        }
        twitter_data = {
            "text": f"{inputs.title}\n{inputs.content}"
        }
        twitter_response = requests.post(
            "https://api.twitter.com/2/tweets",
            headers=twitter_headers,
            json=twitter_data
        )
        output.results['twitter'] = twitter_response.json()
    except Exception as e:
        output.results['twitter'] = str(e)

    # Instagram Post (Note: Instagram Graph API does not support text-only posts)
    try:
        instagram_response = requests.post(
            "https://graph.instagram.com/me/media",
            params={
                'access_token': config.instagram_token,
                'image_url': '',  # Add image URL if needed
                'caption': f"{inputs.title}\n{inputs.content}"
            }
        )
        output.results['instagram'] = instagram_response.json()
    except Exception as e:
        output.results['instagram'] = str(e)

    # Reddit Post
    try:
        reddit_auth = requests.auth.HTTPBasicAuth(config.reddit_client_id, config.reddit_client_secret)
        reddit_data = {
            'grant_type': 'password',
            'username': config.reddit_username,
            'password': config.reddit_password
        }
        reddit_headers = {'User-Agent': config.reddit_user_agent}
        reddit_token_response = requests.post(
            "https://www.reddit.com/api/v1/access_token",
            headers=reddit_headers,
            data=reddit_data,
            auth=reddit_auth
        )
        token = reddit_token_response.json().get('access_token')
        reddit_headers['Authorization'] = f'bearer {token}'

        reddit_post_data = {
            'title': inputs.title,
            'selftext': inputs.content,
            'sr': 'your_subreddit'  # Replace with your subreddit
        }
        reddit_post_response = requests.post(
            "https://oauth.reddit.com/api/submit",
            headers=reddit_headers,
            data=reddit_post_data
        )
        output.results['reddit'] = reddit_post_response.json()
    except Exception as e:
        output.results['reddit'] = str(e)

    return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.title="Test"
    inputs.content="Test"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
