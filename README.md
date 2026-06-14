# Kaigofukushishi Quiz Game

An interactive browser-based quiz game for practicing Japanese care worker (介護福祉士) national exam questions.

## Features

✅ **Multiple Quiz Exams**
- Exam 36 (125 questions)
- Exam 37 (125 questions)  
- Exam 38 (125 questions - split into AM/PM sessions)

✅ **Interactive Interface**
- Real-time score tracking
- Elapsed time counter with personal best/average times
- Immediate feedback (correct/wrong answer highlighting)
- Resume incomplete quizzes

✅ **Review & Summary** ⭐
- Visual summary of all answered questions with color-coded results
- Click any question number to review and re-read it
- Navigate between review questions with Previous/Next buttons

✅ **State Persistence**
- Saves quiz progress in browser storage
- Tracks exam completion times for personal records

## Usage

1. **Open in Browser**: Simply open `index.html` in any modern web browser
2. **Select Exam**: Choose from Exam 36, 37, 38 (AM/PM)
3. **Answer Questions**: Click choice buttons to answer each question
4. **View Results**: See final score, time, and interactive summary
5. **Review**: Click any question number in the summary to review answers

## Project Structure

```
index.html              # Main application
script.js              # Core quiz logic
styles.css             # Styling
questions.js           # Exam data (36, 37, 38)
questions38pm.js       # Exam 38 PM questions (61-125)
verify_all_comprehensive.py  # Data validation script
```

## Data Verification

Run the verification script to ensure all exam data is valid:

```bash
python verify_all_comprehensive.py
```

This checks for:
- Correct number of choices (5 per question)
- Valid answer indices (0-4)
- Complete question structure

## Notes

- **Data Source**: Real exam questions from 介護福祉士国家試験
- **Browser Compatible**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **No Backend**: Fully client-side application
- **Storage**: Uses browser localStorage for progress tracking

## Recent Updates

- ✅ Added interactive answer summary with color-coded results
- ✅ Added question review feature (click to jump to any question)
- ✅ Fixed Exam 36 Q46 answer validation
- ✅ Added .gitignore for clean repository
