import json
from pprint import pprint, pformat
from string import ascii_lowercase

def filter_word(word: str) -> bool:
    if len(word) != 5:
        return False
    for char in word.lower():
        if char not in ascii_lowercase:
            return False
    return True

def main():
    with open("3esl.txt") as f:
        words = f.read().strip().split("\n")

    words = list(map(str.lower, filter(filter_word, words)))

    print(len(words))

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
