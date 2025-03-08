with open('words.txt') as file:
    words = file.read().splitlines()

js_file = "let words = " + str(words) + ";"
with open('words.js', 'w') as file:
    file.write(js_file)