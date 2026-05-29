import re
import codecs

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
    
    # This regex looks for 1 to 3 digits repeated 3 times with whitespace/non-breaking spaces between them
    # Example: 71 71 71
    # We will just replace it globally across the content because there shouldn't be any other legitimate triplicated numbers
    new_content = re.sub(r'(\d+)[\s\xa0]+\1[\s\xa0]+\1', r'\1', content)
    
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(new_content)
    print("Done.")

fix_file('questions.js')
fix_file('questions38pm.js')
