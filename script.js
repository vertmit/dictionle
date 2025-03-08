const guessRows = document.getElementsByClassName("wordRow");
const notificationHolder = document.getElementById("notificationHolder");
const wordHolder = document.getElementById("wordHolder");

let currentGuessAmount = 0;
let usersCurrentGuess = "";

// pickes a random word from the list of words found in the words.js file to be used as the correct word
const correctWord = words[Math.floor(Math.random() * words.length)]; 

// Sets a time in MS for how long the notification will be displayed for
const notificationTimeOutMS = 1000;

// Sets a time in MS between each letter whist getting checked
const wordCheckAnimationIntervalMS = 100;

// Sets the amount of letters in the correct word and the amount of guesses allowed
const correctWordLength = correctWord.length;
const guessesAllowed = 6;

// Sets the colours for the different types of guesses
const correctGuessColour = "rgb(83, 141, 78)";
const wrongSpotGuessColour = "rgb(181, 159, 59)";
const incorrectGuessColour = "rgb(58, 58, 60)";

// Adds logic to the keys so they can be clicked
for (key of document.getElementsByClassName("key")) {
    const keyId = key.id
    key.addEventListener("click", () => {
        keyDownProsses(keyId);
    });
}

// Initialises the possible letters that can be used in the guess
const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

// Creates the grid for the word to be guessed in
for (let rowOfLetterIndex = 0; rowOfLetterIndex < guessesAllowed; rowOfLetterIndex ++) {
    const wordRow = document.createElement("div");
    wordRow.classList.add("wordRow");
    for (let letter = 0; letter < correctWordLength; letter ++) {
        const letterSpot = document.createElement("div");
        letterSpot.classList.add("letter");
        wordRow.appendChild(letterSpot);
    }
    wordHolder.appendChild(wordRow);
}

function loadStats() {

}

// checks if the word is valid
// 0: valid
// 1: not enough letters
// 2: not in word list
function isValidWord(word) {
    if (word.length !== correctWordLength) {
        return 1;
    }
    if (words.includes(word)) {
        return 0;
    }
    return 2;
}

// displays a notification with the message argument attached
function addNotification(message, timeOutMS) {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    notificationHolder.appendChild(notification);

    if (timeOutMS < 0) return;

    // waits until notificationTimeOut time has passed so the notification can be removed
    setTimeout(() => {

        // fades out the notification before deletion
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.remove();
        }, 250);
    }, timeOutMS);
}

// 
function keyDownProsses(letter) {
    // keeps track of the current guess status so the sleep block aren't affected
    const currentGuessAmountAsOfFunctionCalled = currentGuessAmount;
    const currentGuessAsOfFunctionCalled = usersCurrentGuess;

    // gets all the letter spots so they can be updated
    const letterPlacesInsideGride = document.getElementsByClassName("letter");

    if (letter === "Backspace") {

        // removes the last letter from the guess
        usersCurrentGuess = usersCurrentGuess.slice(0, -1);
    }

    else if (letter === "Enter") {
        const wordStatus = isValidWord(usersCurrentGuess);

        // Sees if the word is valid
        if (!wordStatus) {

            // Splits the guesses from strings to lists so the specific letters can be changed
            let processingGuess = usersCurrentGuess.split('');
            let processingWord = correctWord.split('');

            // Checks if the guess is correct
            for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {

                // removes the popinout class so the animation can be played again
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.remove("popinout");
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.remove("invalid");

                if (usersCurrentGuess[letterIndexOfGuess] === correctWord[letterIndexOfGuess]) {

                    // marks the letter as correct
                    processingGuess[letterIndexOfGuess] = "correct";

                    // marks the letter as used so there aren't any unwanted orange letters
                    processingWord[letterIndexOfGuess] = "used";

                    // waits for the previous letters to animate before animating this letter
                    setTimeout(() => {

                        // adds the correct class to the letter spot so it turns green
                        letterPlacesInsideGride[currentGuessAmountAsOfFunctionCalled * correctWordLength + letterIndexOfGuess].classList.add("correct");

                        // adds the popinout class to the letter spot so the animation plays
                        letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmountAsOfFunctionCalled * correctWordLength].classList.add("popinout");
                    }, wordCheckAnimationIntervalMS * letterIndexOfGuess);
                }
            }

            // Checks if the guess is wrong spot or not in the word
            for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {

                if (processingWord.includes(processingGuess[letterIndexOfGuess])) {
                    let index = processingWord.indexOf(processingGuess[letterIndexOfGuess]);

                    // marks the letter as in the wrong spot
                    processingGuess[letterIndexOfGuess] = "wrong spot";

                    // marks the letter as used so there aren't any unwanted duplicate orange letters
                    processingWord[index] = "used";
                    
                    // waits for the previous letters to animate before animating this letter
                    setTimeout(() => {

                        // adds the wrong class to the letter spot so it turns orange
                        letterPlacesInsideGride[currentGuessAmountAsOfFunctionCalled * correctWordLength + letterIndexOfGuess].classList.add("wrong");

                        // adds the popinout class to the letter spot so the animation plays
                        letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmountAsOfFunctionCalled * correctWordLength].classList.add("popinout");
                    }, wordCheckAnimationIntervalMS * letterIndexOfGuess);
                }
                else {
                    // marks the letter as not in the word
                    processingGuess[letterIndexOfGuess] = "incorrect";

                    // waits for the previous letters to animate before animating this letter
                    setTimeout(() => {

                        // adds the wrong class to the letter spot so it turns grey
                        letterPlacesInsideGride[currentGuessAmountAsOfFunctionCalled * correctWordLength + letterIndexOfGuess].classList.add("incorrect");

                        // adds the popinout class to the letter spot so the animation plays
                        letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmountAsOfFunctionCalled * correctWordLength].classList.add("popinout");
                    }, wordCheckAnimationIntervalMS * letterIndexOfGuess);
                }
                
            }

            // waits for the last letter to animate before changing the colours of the keys
            setTimeout(() => {

                // changes all the colours of the keys to match the inputted guess
                for (let letter = 0; letter < correctWordLength; letter ++) {
                    let key = document.getElementById(currentGuessAsOfFunctionCalled[letter].toUpperCase())

                    // changes the key to green if the letter is maked as correct
                    if (processingGuess[letter] === "correct") {
                        key.style.backgroundColor = correctGuessColour;
                    }

                    // changes the key to orange if the letter is maked as in the wrong spot
                    else if (processingGuess[letter] === "wrong spot") {

                        // sees if the key is already green so it doesn't change it
                        if ( key.style.backgroundColor !== correctGuessColour) key.style.backgroundColor = wrongSpotGuessColour;
                    } 

                    // changes the key to grey if the letter is maked as in the incorrect
                    else {
                        if ( key.style.backgroundColor !== correctGuessColour && key.style.backgroundColor !== wrongSpotGuessColour)key.style.backgroundColor = incorrectGuessColour;
                    }
                }
            }, 100 * correctWordLength);
            
            

            if (correctWord === usersCurrentGuess) {

            }
            else {
                // Increments the current guess amount so the next row can be used
                currentGuessAmount ++;

                // Resets the users guess so the user doesn't have to manualy clear the row
                usersCurrentGuess = "";
                if (currentGuessAmount > guessesAllowed - 1) {
                    addNotification(`${correctWord.toUpperCase()}`, -1);
                }
            }
            
        }
        else {
            for (let letterOfWordIndex = 0; letterOfWordIndex < correctWordLength; letterOfWordIndex ++) {

                // removes the popinout class so the animation can be played again
                letterPlacesInsideGride[letterOfWordIndex + currentGuessAmount * correctWordLength].classList.remove("invalid");
                letterPlacesInsideGride[letterOfWordIndex + currentGuessAmount * correctWordLength].classList.remove("popinout");

                // Waits a bit so the browser can remove the class before adding it again
                setTimeout(() => {
                    letterPlacesInsideGride[letterOfWordIndex + currentGuessAmount * correctWordLength].classList.add("invalid");
                }, 1);
            }

            // Notifies the user why their guess was invalid
            if (wordStatus === 1) {
                addNotification(`Not enough letters`, notificationTimeOutMS);
            }
            else {
                addNotification("Not in word list", notificationTimeOutMS);
            }
        }
    }

    // Add the letter to the guess if the user types a letter
    else if (letters.includes(letter.toLowerCase()) && usersCurrentGuess.length < correctWordLength) {
        usersCurrentGuess += letter.toLowerCase();
    }

    // Checks if the guess has changed so the grid can be updated
    if (currentGuessAsOfFunctionCalled !== usersCurrentGuess) {

        // repeats throught the length of the correct word so all of the gird is updated
        for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {

            // Resets the text of the current letter spot to nothing in case of a backspace
            letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].textContent = "";

            // removes the popinout class so the animation can be played again
            letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.remove("letterplaced");

            if (letterIndexOfGuess < usersCurrentGuess.length) {
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.add("letterplaced");
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].textContent = usersCurrentGuess[letterIndexOfGuess].toUpperCase();
            }
            
            // adds and animation to the letter the was changed
            if (letterIndexOfGuess === usersCurrentGuess.length - ((letter !== "Backspace")? 1: 0)) {

                // removes the popinout class so the animation can be played again
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.remove("invalid");
                letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.remove("popinout");

                // Waits a bit so the browser can remove the class before adding it again
                setTimeout(() => {
                    letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmount * correctWordLength].classList.add("popinout");
                }, 1);
            }
        }
    }
}


// checks for key presses to add or subtract from the guess
window.addEventListener("keydown", (event) => {
    keyDownProsses(event.key);
});