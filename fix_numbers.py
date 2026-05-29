import re
import codecs

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
    
    # The regex targets: "1 1 1 text" or "2 2 2 text" (using \s or \xa0)
    # Replaces it with just "1 text"
    new_content = re.sub(r'"(\d+)[\s\xa0]+\1[\s\xa0]+\1', r'"\1 ', content)
    
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(new_content)
    print("Done.")

fix_file('questions.js')
fix_file('questions38pm.js')
