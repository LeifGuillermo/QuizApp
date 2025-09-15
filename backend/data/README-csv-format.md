# CSV Data Format for Quiz Questions

This document describes the required CSV schema for quiz data files.

## Schema

| Column            | Description                                                                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `question`        | The text of the question.                                                                                                                        |
| `type`            | The question type code:<br>- `mc`: Multiple Choice<br>- `tf`: True/False<br>- `ma`: Multiple Answer<br>- `te`: Text Entry                        |
| `answers`         | Pipe-separated (`&#124;`) list of possible answers.<br>- For `mc`/`ma`/`tf`: options.<br>- For `te`: keywords or exact answers.                  |
| `correct_answers` | Pipe-separated list of correct answers.<br>- For `mc`/`tf`: single value.<br>- For `ma`/`te`: one or more values.                                |
| `categories`      | Pipe-separated list of categories (e.g., `History&#124;Europe&#124;World War II`).                                                               |

## Example

```csv
question,type,answers,correct_answers,categories
What is the capital of France?,mc,Paris|London|Berlin|Rome,Paris,Geography|Europe
The sky is blue.,tf,True|False,True,Science|Nature
Select the prime numbers.,ma,2|3|4|6,2|3,Math|Numbers
Name a programming language that starts with "P".,te,Python|Perl|PHP,Python|Perl|PHP,Technology|Programming
```

## Notes

- Use `|` (pipe) to separate multiple values within a cell.
- All columns are required for each row.
- Avoid extra spaces around pipe separators.
