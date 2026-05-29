import re
import pykakasi
import codecs
import json

kks = pykakasi.kakasi()

def add_ruby(text):
    if not text:
        return text
    if "<ruby>" in text:
        return text
        
    result = []
    for item in kks.convert(text):
        orig = item['orig']
        hira = item['hira']
        
        if re.search(r'[一-龥]', orig):
            suffix = ""
            while orig and hira and orig[-1] == hira[-1]:
                suffix = orig[-1] + suffix
                orig = orig[:-1]
                hira = hira[:-1]
            
            if orig:
                result.append(f"<ruby>{orig}<rt>{hira}</rt></ruby>")
            result.append(suffix)
        else:
            result.append(orig)
            
    return "".join(result)

def process_file(filepath):
    print(f"Processing {filepath}...")
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()

    # Find all string literals in the JS file
    # We will replace them using a function
    
    def replacer(match):
        full_string = match.group(0)
        inner_text = match.group(1)
        
        # Check if the string is followed by a colon (meaning it's a JSON key)
        # We look ahead in the content to see if the next non-whitespace is ':'
        end_pos = match.end()
        # Find next non-whitespace character
        m = re.search(r'\S', content[end_pos:])
        if m and m.group(0) == ':':
            return full_string # It's a key, don't modify
            
        # Only add ruby if it contains Kanji
        if re.search(r'[一-龥]', inner_text):
            rubied = add_ruby(inner_text)
            # Re-escape the string
            return f'"{rubied}"'
            
        return full_string

    # Regex to match double-quoted strings
    # "..." ignoring escaped quotes
    new_content = re.sub(r'"([^"\\]*(?:\\.[^"\\]*)*)"', replacer, content)

    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(new_content)
    print(f"Done processing {filepath}")

process_file('questions.js')
process_file('questions38pm.js')
