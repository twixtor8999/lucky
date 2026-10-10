import json

transcript_path = '/home/amar/.gemini/antigravity-ide/brain/9242eb8f-2dc3-46da-8f20-6b272f539b5c/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Check tool responses for view_file or run_command
            if 'tool_calls' not in data and 'content' in data:
                content = data.get('content', '')
                if 'export default function HomePage' in content or 'export default function Page' in content:
                    if 'Under Construction' not in content:
                        print("Found possible full file content in response! Length:", len(content))
                        with open('possible_page.txt', 'a') as out:
                            out.write(content + "\n\n---\n\n")
        except:
            pass
