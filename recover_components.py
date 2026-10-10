import json
import os

transcript_path = '/home/amar/.gemini/antigravity-ide/brain/9242eb8f-2dc3-46da-8f20-6b272f539b5c/.system_generated/logs/transcript_full.jsonl'
file_contents = {}

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        target = call['args'].get('TargetFile')
                        content = call['args'].get('CodeContent')
                        if target and content and 'components' in target:
                            file_contents[target] = content
        except:
            pass

for path, content in file_contents.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Recovered {path}")
