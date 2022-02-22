import json
from pprint import pprint, pformat
from string import ascii_lowercase

def main():
    with open("common_words.txt") as f:
        words = f.read().strip().split("\n")

    sorted_words = sorted(words, key=lambda x: x[1:-1])

    letter_indices = { 'a': 0 }

    current_index = 0
    for l, letter in enumerate(ascii_lowercase):
        for i in range(current_index, len(sorted_words)):
            if letter != sorted_words[i][1]:
                letter_indices[ascii_lowercase[l + 1]] = i
                current_index = i
                break

    output = {
        'indices': letter_indices,
        'words': sorted_words,
    }
    json_string = json.dumps(output)

    pprint(letter_indices)

    with open("word_input.js", "w") as f:
        f.write(f'word_input = {json_string}')


if __name__ == "__main__":
    main()
