def sleight_hand(k, table):
    data = dict()
    max_el = 0
    for line in table:
        for el in line:
            if el.isdigit():
                el = int(el)
                if el not in data:
                    data[el] = 0
                data[el] += 1
                if el > max_el:
                    max_el = el
    res = 0
    for t in range(1, max_el + 1):
        if t in data and data[t] <= k:
            res += 1
    return res


if __name__ == "__main__":
    k = int(input()) * 2
    table = [input() for x in range(4)]
    res = sleight_hand(k, table)
    print(res)
