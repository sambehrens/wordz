import json
from pprint import pprint, pformat

def main():
    with open("frequency_map.json") as f:
        data = json.load(f)

    in_order = sorted(data.items(), key=lambda item: item[1])
    in_order = [tup[0] for tup in in_order]

    with open("output.txt") as f:
        try:
            last_word = f.readlines()[-1].split(",")[0]
            print(f'last word rated: {last_word}')

            if last_word:
                in_order = in_order[in_order.index(last_word) + 1:]

            print(in_order[:5])
        except:
            print("No entries yet")


    with open("output.txt", "a") as f:
        last_input = ""
        for word in in_order:
            accepted = False
            while not accepted:
                last = lambda x: f'[{x}]' if x == last_input else x
                rating = input(f'{word} ({last(1)}: good, {last(2)}: eh, {last(3)}: bad): ')
                try:
                    if rating.strip() == "" and last_input:
                        rating = last_input
                    else:
                        rating = int(rating)
                    last_input = rating
                    f.writelines(f'{word},{rating}\n')
                    accepted = True
                except:
                    print("Input not accepted, retry")
        #  f.write(pformat(in_order))


if __name__ == "__main__":
    main()
