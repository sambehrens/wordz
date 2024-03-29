import json
from pprint import pprint, pformat
from string import ascii_lowercase
from functools import partial


def filter_word(length: int, word: str) -> bool:
        if len(word) != length:
            return False
        for char in word.lower():
            if char not in ascii_lowercase:
                return False
        return True

def main():
    word_length = 7

    with open("3esl.txt") as f:
        words = f.read().strip().split("\n")

    words = list(map(str.lower, filter(partial(filter_word, word_length), words)))

    print(len(words))

    sorted_words = sorted(words, key=lambda x: x[1:-1])

    letter_indices = { 'a': 0 }

    current_index = 0
    for l, letter in enumerate(ascii_lowercase[1:]):
        for i in range(current_index, len(sorted_words)):
            if letter == sorted_words[i][1]:
                letter_indices[letter] = i
                current_index = i
                break

    output = {
        'indices': letter_indices,
        'words': sorted_words,
    }
    json_string = json.dumps(output)

    pprint(letter_indices)

    #  with open("3esl_5.txt", "w") as f:
    #      f.write("\n".join(sorted_words))

    # Uncomment to generate the word index
    with open(f'word_input_{word_length}.js', "w") as f:
        f.write(f'word_input_{word_length} = {json_string}')


if __name__ == "__main__":
    main()
