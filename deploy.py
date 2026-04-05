import json
import urllib.request
import sys
import os

try:
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()

    payload = {
        "files": {
            "index.html": {
                "content": html_content
            },
            "package.json": {
                "content": json.dumps({
                    "name": "attractai-stylist",
                    "main": "index.html",
                    "dependencies": {}
                })
            }
        }
    }

    req = urllib.request.Request(
        'https://codesandbox.io/api/v1/sandboxes/define?json=1',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
    )

    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    sandbox_id = result.get("sandbox_id")
    
    print(f"LIVE_URL: https://{sandbox_id}.csb.app")
    print(f"CSB_URL: https://codesandbox.io/s/{sandbox_id}")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
