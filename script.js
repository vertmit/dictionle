async function getDefinitionOfWord(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        const definitions = data[0].meanings[0].definitions;
        return definitions;
    } catch (error) {
        console.clear();
        return -1;
    }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const asearch = urlParams.get('a');

function runGame() {

    function decyptText(text) {
        console.log(text)
        let decrypedString = ""
        for (let char = 0; char < text.length; char += 3) {
            decrypedString = `${decrypedString}${String.fromCharCode(Number(`${text[char]}${text[char+1]}${text[char+2]}`)/7+96)}`
        }
        return decrypedString 
    }

    function encyptText(text) {
        text = text.toLowerCase()
        let encrypedString = ""
        for (let char of text) {
            encrypedString = `${encrypedString}${String((char.charCodeAt(0)-96)*7).padStart(3, "0")}`
            
        }
        return encrypedString
    }

    const notificationHolder = document.getElementById("notificationHolder");
    const wordHolder = document.getElementById("wordHolder");

    // gets all the letter spots so they can be updated
    const letterPlacesInsideGride = document.getElementsByClassName("letter");

    // Getting the statistic elements
    const guessDistributionHolder = document.getElementById("guessDistrobutionHolder");
    const statisticsMenu = document.getElementById("stats");

    const statisticsNumberGamesPlayed = document.getElementById("gamesPlayed")
    const statisticsNumberWinPercent = document.getElementById("winPercent")
    const statisticsNumberCurrentStreak = document.getElementById("currentStreak")
    const statisticsNumberMaxStreak = document.getElementById("maxStreak")

    // Getting how to play popup elements
    const howToPlayPopup = document.getElementById("howToPlay")
    const howToPlayBackground = document.getElementById("howToPlayCloseBg")
    const howToPlayClosePopupBTN = document.getElementById("howToPlayCloseBTN")

    // Getting hint popup elements
    const hintPopup = document.getElementById("hintPopup")
    const hintBackground = document.getElementById("hintCloseBg")
    const hintClosePopupBTN = document.getElementById("hintCloseBTN")
    const getHintBTN = document.getElementById("getHintBTN");

    // Getting settings popup elements
    const settingsPopup = document.getElementById("settingsPopup")
    const settingsBackground = document.getElementById("settingsCloseBg")
    const settingsClosePopupBTN = document.getElementById("settingsCloseBTN")

    const customGameCopyBTN = document.getElementById("customGameCopy")
    const customGameInput = document.getElementById("customGameInput")

    let hasHintRevealed = false;

    const hintRevealingGuessCost = 4;

    // Getting Navbar buttons
    const statisticsBTN = document.getElementById("statisticsBTN");
    const howToPlayBTN = document.getElementById("howToPlayBTN");
    const hintBTN = document.getElementById("hintBTN");
    const settingsBTN = document.getElementById("settingsBTN");

    let currentGuessAmount = 0;
    let usersCurrentGuess = "";

    let gameEnded = false;

    let disableGamePlay = false;

    // pickes a random word from the list of words found in the words.js file to be used as the correct word
    const correctWord = (asearch)? decyptText(asearch): words[Math.floor(Math.random() * words.length)]; 

    let correctWordDefinitions = "";
    getDefinitionOfWord(correctWord).then(definitions => {
        correctWordDefinitions = definitions;
            if (correctWordDefinitions !== -1) {
                hintBTN.style.display = "flex"
                hintBTN.classList.add("showNavOption")
            }
    })

    for (let slider of document.getElementsByClassName("slider")) {
        slider.addEventListener("click", ()=>{
            if (slider.classList.contains("active")) {
                slider.classList.remove("active")
            } else {
                slider.classList.add("active")
            }
        })
    }

    // Sets a time in MS for how long the notification will be displayed for
    const notificationTimeOutMS = 1000;

    // Sets a time in MS between each letter whist getting checked
    const wordCheckAnimationIntervalMS = 250;

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
    const guessableSymbols = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

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

    function openSettingsPopup() {
        disableGamePlay = true;
        settingsPopup.style.display = "block";
        setTimeout(() => {
            settingsPopup.style.opacity = 1;
            settingsPopup.style.transform = "translate(-50%, -50%)";
            settingsBackground.style.display = "block";
        }, 10)
    }

    function closeSettingsPopup() {
        disableGamePlay = false;
        settingsPopup.style.transform = "translate(-50%, -45%)";
        settingsPopup.style.opacity = 0;
        setTimeout(() => {
            settingsPopup.style.display = "none";
            settingsBackground.style.display = "none";
        }, 200)
    }

    function openHintPopup() {
        disableGamePlay = true;
        hintPopup.style.display = "block";
        setTimeout(() => {
            hintPopup.style.opacity = 1;
            hintPopup.style.transform = "translate(-50%, -50%)";
            hintBackground.style.display = "block";
        }, 10)
    }

    function closeHintPopup() {
        disableGamePlay = false;
        hintPopup.style.transform = "translate(-50%, -45%)";
        hintPopup.style.opacity = 0;
        setTimeout(() => {
            hintPopup.style.display = "none";
            hintBackground.style.display = "none";
        }, 200)
    }

    function openHowToPlayPopup() {
        disableGamePlay = true;
        howToPlayPopup.style.display = "block";
        setTimeout(() => {
            howToPlayPopup.style.opacity = 1;
            howToPlayPopup.style.transform = "translate(-50%, -50%)";
            howToPlayBackground.style.display = "block";
        }, 10)


        let helpExampleTilePassedAmount = 0;
        for (let helpExampleTile of document.getElementsByClassName("helpTile")) {
            helpExampleTile.classList.remove("incorrect")
            helpExampleTile.classList.remove("wrong")
            helpExampleTile.classList.remove("correct")
            helpExampleTile.classList.remove("popinout")
            setTimeout(() => {
                helpExampleTile.classList.add("popinout")
                if (helpExampleTile.classList.contains("correctHelp")) helpExampleTile.classList.add("correct");
                if (helpExampleTile.classList.contains("wrongHelp")) helpExampleTile.classList.add("wrong");
                if (helpExampleTile.classList.contains("incorrectHelp")) helpExampleTile.classList.add("incorrect");
            }, helpExampleTilePassedAmount*wordCheckAnimationIntervalMS + 250)
            helpExampleTilePassedAmount ++;
        }
    }

    function openStatisicsMenu() {
        disableGamePlay = true;
        statisticsMenu.style.display = "flex";
        setTimeout(() => {
            statisticsMenu.style.opacity = 1;
            statisticsMenu.style.transform = "translateY(0%)";
        }, 10)
        
    }

    function closeStatisicsMenu() {
        disableGamePlay = false;
        statisticsMenu.style.transform = "translateY(5%)";
        statisticsMenu.style.opacity = 0;
        setTimeout(() => {
            statisticsMenu.style.display = "none";
        }, 200)
    }


    function closeHowToPlayPopup() {
        disableGamePlay = false;
        howToPlayPopup.style.transform = "translate(-50%, -45%)";
        howToPlayPopup.style.opacity = 0;
        setTimeout(() => {
            howToPlayPopup.style.display = "none";
            howToPlayBackground.style.display = "none";
        }, 200)
    }

    function copyCustomWordLink(word) {
        word = word.toLowerCase()
        if (words.includes(word)) {
            navigator.clipboard.writeText(`vertmit.github.io/dictionle?a=${encyptText(word)}`)
            addNotification("Copied!", notificationTimeOutMS)
        } else {
            customGameInput.classList.remove("invalid")
            setTimeout(()=>{
                customGameInput.classList.add("invalid")
            }, 10)
            customGameInput.style.border = "2px solid rgb(155, 40, 40)"
            addNotification("Word Not Vaild", notificationTimeOutMS)
        }
    }

    customGameCopyBTN.addEventListener("click", ()=>{
        copyCustomWordLink(customGameInput.textContent)
    })

    customGameInput.addEventListener("keydown", (event)=>{
        if (guessableSymbols.includes(event.key.toLowerCase())) {
            customGameInput.style.border = ""
        } 
        else if (event.key === "Backspace") {
            customGameInput.style.border = ""
        } else if (event.key === "Enter") {
            event.preventDefault()
            copyCustomWordLink(customGameInput.textContent)
        } 
        else {
            event.preventDefault()
        }
    })

    settingsBTN.addEventListener("click", ()=>{
        openSettingsPopup()
    })

    settingsBackground.addEventListener("click", ()=> {
        closeSettingsPopup()
    })

    settingsClosePopupBTN.addEventListener("click", ()=> {
        closeSettingsPopup()
    })

    hintBackground.addEventListener("click", ()=>{
        closeHintPopup();
    })

    hintClosePopupBTN.addEventListener("click", ()=>{
        closeHintPopup();
    })


    hintBTN.addEventListener("click", ()=>{
        openHintPopup();
    })

    getHintBTN.addEventListener("click", ()=>{
        getHintBTN.remove();
        if (correctWordDefinitions !== -1) {
            if (guessesAllowed - currentGuessAmount - hintRevealingGuessCost - 1 > 0) {
                const hintBox = document.createElement("div");
                hintBox.classList.add("hintBox")

                const hintTitle = document.createElement("h2");
                hintTitle.textContent = "Hint"

                const hintText = document.createElement("p");
                hintText.textContent = correctWordDefinitions[0].definition;

                hintBox.appendChild(hintTitle)
                hintBox.appendChild(hintText)
                hintPopup.appendChild(hintBox)

                hasHintRevealed = true;
                
                for (let i = 0; i < hintRevealingGuessCost; i++) {
                    for (let e = 0; e < correctWordLength; e ++) {
                        const currentLetterToBeChanged = letterPlacesInsideGride[(currentGuessAmount + i) * correctWordLength + e]
                        
                        currentLetterToBeChanged.classList.remove("popinout")
                        setTimeout(()=>{
                            currentLetterToBeChanged.textContent = ""
                            currentLetterToBeChanged.classList.add("popinout")
                            currentLetterToBeChanged.classList.add("hinted")
                        }, (i + e)*100)
                        
                    }
                }
                keyDownProsses("")
                currentGuessAmount += hintRevealingGuessCost
            } else {
                const hintText = document.createElement("p");
                hintText.textContent = `You don't have enough guesses left to reveal the hint (Cost ${hintRevealingGuessCost} guesses)`;
                hintPopup.appendChild(hintText)
            }
        } else {
            const hintText = document.createElement("p");
            hintText.textContent = "No Definition Found";
            hintPopup.appendChild(hintText)
        }
    })

    

    howToPlayBTN.addEventListener("click", ()=>{
        openHowToPlayPopup();
    })

    howToPlayBackground.addEventListener("click", ()=>{
        closeHowToPlayPopup();
    })

    howToPlayClosePopupBTN.addEventListener("click", ()=>{
        closeHowToPlayPopup();
    })

    const stats = JSON.parse(localStorage.getItem("statistics"))
    let guessdistribution = {};
    let statisticNumbers = {"played": 0, "wins":0, "streak":0, "maxStreak":0};
    if (stats) {
        guessdistribution = stats.distribution;
        statisticNumbers = stats.numbers;
    }

    const statisticsCloseButton = document.getElementById("statsClose");

    statisticsBTN.addEventListener("click", ()=>{
        openStatisicsMenu();
    })

    
    statisticsCloseButton.addEventListener("click", ()=>{
        closeStatisicsMenu();
    }) 

    function updateStatistics() {
        localStorage.setItem("statistics", JSON.stringify({"distribution": guessdistribution, "numbers": statisticNumbers}))

        let guessDistributionNumbers = [];

        while (guessDistributionHolder.firstChild) {
            guessDistributionHolder.firstChild.remove();
        }

        const maxGuess = (Object.keys(guessdistribution).length > 0)? Object.keys(guessdistribution).slice(-1): 0;

        for (let i = 1; i < Math.max(maxGuess, guessesAllowed)+1; i++ ) {
            if (i in guessdistribution) {
                guessDistributionNumbers.push(guessdistribution[i]);
            } else {
                guessDistributionNumbers.push(0)
            }
        }

        const maxiumGuessDistribution = Math.max(...guessDistributionNumbers);

        statisticsNumberGamesPlayed.textContent = statisticNumbers.played;
        statisticsNumberWinPercent.textContent = (statisticNumbers.played !== 0)? Math.round(statisticNumbers.wins / statisticNumbers.played * 100): 0;
        statisticsNumberCurrentStreak.textContent = statisticNumbers.streak;
        statisticsNumberMaxStreak.textContent = statisticNumbers.maxStreak;

        for (let i = 0; i < guessDistributionNumbers.length; i ++) {
            const guessDistributionBox = document.createElement("div");
            guessDistributionBox.className = "guessDistributionBox";

            const indexNumberOfGuess = document.createElement("div");
            indexNumberOfGuess.textContent = i + 1;
            indexNumberOfGuess.className = "guessDistributionIndex";
            guessDistributionBox.appendChild(indexNumberOfGuess)

            const distributionBar = document.createElement("div");
            distributionBar.className = "guessDistributionBar";
            distributionBar.style.width = `calc(10px + ${guessDistributionNumbers[i] / maxiumGuessDistribution * 100}%)`;
            distributionBar.textContent = guessDistributionNumbers[i];
            
            guessDistributionBox.appendChild(distributionBar);
            guessDistributionHolder.appendChild(guessDistributionBox);
        }
    }

    updateStatistics();

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

    // Events that happen when a button is pressed
    function keyDownProsses(letter) {
        if (!gameEnded && !disableGamePlay) {
            // keeps track of the current guess status so the sleep block aren't affected
            const currentGuessAmountAsOfFunctionCalled = currentGuessAmount;
            const currentGuessAsOfFunctionCalled = usersCurrentGuess;

            

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
                        if (processingGuess[letterIndexOfGuess] !== "correct") {
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
                            else if (processingWord[letterIndexOfGuess] !== "correct") {
                                // marks the letter as not in the word
                                processingGuess[letterIndexOfGuess] = "incorrect";
                    
                                // marks the letter as used so there aren't any unwanted duplicate orange letters
                    
                                // waits for the previous letters to animate before animating this letter
                                setTimeout(() => {
                    
                                    // adds the wrong class to the letter spot so it turns grey
                                    letterPlacesInsideGride[currentGuessAmountAsOfFunctionCalled * correctWordLength + letterIndexOfGuess].classList.add("incorrect");
                    
                                    // adds the popinout class to the letter spot so the animation plays
                                    letterPlacesInsideGride[letterIndexOfGuess + currentGuessAmountAsOfFunctionCalled * correctWordLength].classList.add("popinout");
                                }, wordCheckAnimationIntervalMS * letterIndexOfGuess);
                            }
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
                    }, wordCheckAnimationIntervalMS * correctWordLength);
                    
                    if (currentGuessAmount > guessesAllowed - hintRevealingGuessCost - 1 && !hasHintRevealed) {
                        hintBTN.classList.remove("showNavOption")
                        hintBTN.classList.add("hideNavOption")
                    }

                    if (correctWord === usersCurrentGuess) {
                        gameEnded = true;
                        if (!asearch) {
                            if (!(currentGuessAmount+1 in guessdistribution)) guessdistribution[currentGuessAmount+1] = 0;
                            guessdistribution[currentGuessAmount+1] ++;
                            statisticNumbers.played ++;
                            statisticNumbers.wins ++;
                            statisticNumbers.streak ++;
                            if (statisticNumbers.streak > statisticNumbers.maxStreak) statisticNumbers.maxStreak = statisticNumbers.streak
                        }
                        updateStatistics()
                        setTimeout(() => {
                            if (currentGuessAmount === 0) addNotification("Genius!", notificationTimeOutMS);
                            if (currentGuessAmount === 1) addNotification("Magnificent!", notificationTimeOutMS);
                            if (currentGuessAmount === 2) addNotification("Impressive!", notificationTimeOutMS);
                            if (currentGuessAmount === 3) addNotification("Splendid!", notificationTimeOutMS);
                            if (currentGuessAmount === 4) addNotification("Great!", notificationTimeOutMS);
                            if (currentGuessAmount === 5) addNotification("Phew!", notificationTimeOutMS);
                            setTimeout(() => {
                                openStatisicsMenu()
                            }, 2000)
                        }, wordCheckAnimationIntervalMS * correctWordLength);
                    }
                    else {

                        // Increments the current guess amount so the next row can be used
                        currentGuessAmount ++;
                        
                        // Resets the users guess so the user doesn't have to manualy clear the row
                        usersCurrentGuess = "";

                        // User loses condition
                        if (currentGuessAmount > guessesAllowed - 1) {
                            if (!asearch) {
                                statisticNumbers.played ++;
                                statisticNumbers.streak = 0;
                                gameEnded = 1;
                            }

                            updateStatistics()
                            setTimeout(() => {
                                addNotification(correctWord.toUpperCase(), -1);
                                setTimeout(() => {
                                    openStatisicsMenu()
                                }, 2000)
                            }, wordCheckAnimationIntervalMS * correctWordLength)
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
            else if (guessableSymbols.includes(letter.toLowerCase()) && usersCurrentGuess.length < correctWordLength) {
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
    }

    // checks for key presses to add or subtract from the guess
    window.addEventListener("keydown", (event) => {
        keyDownProsses(event.key);
    });
}

runGame()