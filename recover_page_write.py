import json

transcript_path = '/home/amar/.gemini/antigravity-ide/brain/9242eb8f-2dc3-46da-8f20-6b272f539b5c/.system_generated/logs/transcript_full.jsonl'
best_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        target = call['args'].get('TargetFile', '')
                        content = call['args'].get('CodeContent', '')
                        if 'page.tsx' in target and 'app/page.tsx' in target:
                            if "Under Construction" not in content:
                                best_content = content
                                print("Found write_to_file for page.tsx!")
        except Exception as e:
            pass

if best_content:
    with open('/home/amar/Desktop/Lucky777/apps/web/src/app/page.tsx', 'w') as f:
        f.write(best_content)
    print("Recovered page.tsx from write_to_file")
