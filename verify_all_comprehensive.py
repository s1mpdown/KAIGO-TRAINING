#!/usr/bin/env python3
"""Comprehensive exam data verification script for all exams."""
import json
import re
import sys

def load_questions_js():
    """Load and parse questions.js (Exams 36, 37, 38)."""
    with open('questions.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    start = content.find('const examSets = ')
    end = content.find('const examLabels', start)
    json_str = content[start + len('const examSets = '):end].strip().rstrip(';').strip()
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    
    return json.loads(json_str)

def load_38pm_js():
    """Load and parse questions38pm.js (Exam 38 PM)."""
    with open('questions38pm.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_idx = content.find('= [')
    start_idx = content.find('[', start_idx)
    examlabels_idx = content.find('examLabels', start_idx)
    search_area = content[start_idx:examlabels_idx]
    end_idx = start_idx + search_area.rfind(']')
    
    json_str = content[start_idx:end_idx+1]
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    
    return json.loads(json_str)

def validate_question(q, exam_num=None, q_num=None):
    """Check if a question has valid structure and fields."""
    issues = []
    
    if 'question' not in q:
        issues.append("Missing 'question' field")
    if 'choices' not in q:
        issues.append("Missing 'choices' field")
    elif not isinstance(q['choices'], list) or len(q['choices']) != 5:
        count = len(q['choices']) if isinstance(q['choices'], list) else 'not list'
        issues.append(f"'choices' has {count} items (should be 5)")
    
    if 'answer' not in q:
        issues.append("Missing 'answer' field")
    else:
        answer = q['answer']
        if not isinstance(answer, int):
            issues.append(f"'answer' is {type(answer).__name__} not int")
        elif not (0 <= answer <= 4):
            issues.append(f"'answer' = {answer} (should be 0-4)")
    
    return issues

def main():
    print("=" * 80)
    print("COMPREHENSIVE EXAM DATA VERIFICATION")
    print("=" * 80)
    
    all_issues = []
    
    # Load and verify questions.js
    try:
        data = load_questions_js()
    except Exception as e:
        print(f"❌ Error loading questions.js: {e}")
        return 1
    
    for exam in ['36', '37', '38']:
        print(f"\nEXAM {exam}:")
        if exam not in data:
            print(f"  ❌ NOT FOUND")
            continue
        
        exam_data = data[exam]
        exam_issues = []
        
        for idx, q in enumerate(exam_data, 1):
            issues = validate_question(q, exam, idx)
            if issues:
                exam_issues.append((idx, issues))
                all_issues.append((exam, idx, issues))
        
        if exam_issues:
            print(f"  ❌ {len(exam_issues)} anomalies")
            for q_num, issues in exam_issues:
                print(f"    Q{q_num}: {', '.join(issues)}")
        else:
            print(f"  ✅ All {len(exam_data)} questions valid")
    
    # Load and verify questions38pm.js
    try:
        pm_data = load_38pm_js()
        print(f"\nEXAM 38 PM (Q61-Q125):")
        pm_issues = []
        
        for idx, q in enumerate(pm_data, 1):
            issues = validate_question(q, "38pm", idx + 60)
            if issues:
                pm_issues.append((idx + 60, issues))
                all_issues.append(("38pm", idx + 60, issues))
        
        if pm_issues:
            print(f"  ❌ {len(pm_issues)} anomalies")
            for q_num, issues in pm_issues:
                print(f"    Q{q_num}: {', '.join(issues)}")
        else:
            print(f"  ✅ All {len(pm_data)} questions valid")
    except Exception as e:
        print(f"  ❌ Error loading questions38pm.js: {e}")
        return 1
    
    # Summary
    print("\n" + "=" * 80)
    if all_issues:
        print(f"❌ TOTAL ISSUES: {len(all_issues)}")
        for exam, q_num, issues in all_issues:
            print(f"  Exam {exam}, Q{q_num}: {issues[0]}")
        return 1
    else:
        print("✅ ALL EXAMS VALID - No data integrity issues")
        return 0

if __name__ == '__main__':
    sys.exit(main())
