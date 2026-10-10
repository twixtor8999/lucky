import json

transcript_path = '/home/amar/.gemini/antigravity-ide/brain/9242eb8f-2dc3-46da-8f20-6b272f539b5c/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'replace_file_content' or call['name'] == 'multi_replace_file_content':
                        target = call['args'].get('TargetFile')
                        content = call['args'].get('ReplacementContent')
                        if target and target.endswith('/apps/web/src/app/page.tsx'):
                            if "Under Construction" not in content:
                                print(f"Found replacement in page.tsx: {content[:100]}")
        except Exception as e:
            pass
