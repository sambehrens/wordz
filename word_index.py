import json

if __name__ == '__main__':
    file = open('five_letter_words.txt')
    words = file.read().strip().split('\n')
    file.close()

    word_indices = {0: words, 1: {}, 2: {}, 3: {}}
    for word in words:
        for i in range(1, 4):
            word_slice = word[1:i + 1]
            if word_slice not in word_indices[i]:
                word_indices[i][word_slice] = []
            word_indices[i][word_slice].append(word)

    json_string = json.dumps(word_indices, sort_keys=True, indent=4)

    with open('word_indices.js', 'w') as out_file:
        out_file.write('word_indices = ' + json_string)
    out_file.close()

    # for word1 in words:
    #     for word2 in words:
    #         for word3 in words:
    #             if word1 == word2 or word1 == word3 or word2 == word3:
    #                 continue
    #             print(word1, word2, word3)
    #             word_slices = [word1[i] + word2[i] + word3[i] for i in range(1, 4)]
    #             all_slices = True
    #             for slice in word_slices:
    #                 if slice not in word_indexes[3]:
    #                     all_slices = False
    #                     continue
    #             for sli
    #
    #             print(word_slices)