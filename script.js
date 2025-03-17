// expected output of "getDefinitionOfWord" function
// -1: No definition found
// success: {
//      definition
//      source
// }
async function getDefinitionOfWord(word) {

    // sees if it is possible for the word to be stored localy (max length 21 letters)
    if (word.length <= 21) {
        try {

            // Each file is named with how many letters each word contains
            // This is done to save memory whilst also having fast defining speeds
            const fileLocationOfLocalDefinition = `./definitions/${word.length}.js`
            const gatheredDefinitionsFromLocalFile = await import(fileLocationOfLocalDefinition);

            // Sees if the word does have a definition 
            if (gatheredDefinitionsFromLocalFile.definitions[word]) {
                return {
                    definition: gatheredDefinitionsFromLocalFile.definitions[word],
                    source: "Oxford English Dictionary"
                };
            }
        } catch {}
    }

    try {
        // Define the API URL with parameters
        const url = `https://en.wiktionary.org/w/api.php?action=query&titles=${word}&prop=revisions&rvprop=content&format=json&origin=*`;

        // Fetch the data from the Wiktionary API
        const response = await fetch(url);
        const data = await response.json();

        // Gets the page of the definition
        const page = data.query.pages;
        const pageId = Object.keys(page)[0];

        // Sees if the page exists
        if (pageId !== "-1") {

            // Gets the content of the page
            const content = page[pageId].revisions[0]["*"];

            // Removes wiki formatting
            const gatheredDefinition = content.split("#")[1].split("\n")[0] .replace(/\[\[([^\|\]]+\|)?([^\]]+)\]\]/g, '$2').replace(/\{\{[^}]+\}\}/g, '').replace(/<!--[^>]+-->/g, '').replace(/<[^>]+>/g, '').replace(/'{2,}/g, '').trim().replace(word, "*Dictionle Answer*");
            
            if (gatheredDefinition) {
                return {
                    definition: gatheredDefinition,
                    source: "Wiktionary"
                };
                
            }
        }
    } catch {}

    // No definitions found
    return -1;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const asearch = urlParams.get('a');

// Put everything into a function to stop console injecting
function runGame() {

    // decrypts the encryped text
    function decyptText(text) {
        if (text.length % 3 !== 0) {
            return 0;
        }
        Math.seedrandom(text.length/3);

        let decrypedString = ""
        for (let char = 0; char < text.length; char += 3) {
            decrypedString = `${decrypedString}${String.fromCharCode(Number(`${text[char]}${text[char+1]}${text[char+2]}`)/Math.round(Math.random()*38)+96)}`
        }
        Math.seedrandom(Date.now())
        return decrypedString 
    }

    // Encrypes text in to 3 digit numbers per letter
    function encyptText(text) {

        // Sets the random see to length so that it's harder to decryped without the decypt function
        Math.seedrandom(text.length);
        text = text.toLowerCase()
        let encrypedString = ""
        for (let char of text) {
            encrypedString = `${encrypedString}${String((char.charCodeAt(0)-96)*Math.round(Math.random()*38)).padStart(3, "0")}`
        }
        Math.seedrandom(Date.now())
        return encrypedString
    }

    function saveSettings() {
        
        localStorage.setItem("settings", JSON.stringify({
            "contrast":document.body.classList.contains("contrast"),
            "onScreenKeysOnly": onScreenKeyInputsOnly,
            "showAnimations": showAnimations,
            "difficulty": selectedDifficulty,
        }))
    }


    let showAnimations = 1;
    let onScreenKeyInputsOnly = false;

    function loadSettings() {
        const settingsToLoad = JSON.parse(localStorage.getItem("settings"))

        if (settingsToLoad) {
            if (settingsToLoad.contrast) {
                document.body.classList.add("contrast")
                document.getElementById("contrast").classList.add("active")
            }
            if (settingsToLoad.onScreenKeysOnly) {
                onScreenKeyInputsOnly = true
                document.getElementById("keyoption").classList.add("active")
            }

            if (!settingsToLoad.showAnimations) {
                showAnimations = false
                document.body.classList.add("hideAnimations")
                document.getElementById("showAnimations").classList.remove("active")
            }
            selectedDifficulty = settingsToLoad.difficulty
            document.getElementById(`normalMode`).classList.remove("active")
            document.getElementById(`${selectedDifficulty}Mode`).classList.add("active")
        }
    }

    let selectedDifficulty = "normal"

    loadSettings()

    // pickes a random word from the list of words found in the words.js file to be used as the correct word
    let correctWord = (asearch && words.includes(decyptText(asearch).slice(0, -1)))? decyptText(asearch).slice(0, -1): words[Math.floor(Math.random() * words.length)]; 
    const isCustomWord = (asearch && words.includes(decyptText(asearch).slice(0, -1)))? true: false;

    const playingDifficulty = (isCustomWord)? "normal": selectedDifficulty

    let selectStatsTab = playingDifficulty

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

    // Store if hint has been revield so the hint button doesn't dissapear when you get a hint
    let hasHintRevealed = false;

    

    // Getting Navbar buttons
    const statisticsNavigationBarBTN = document.getElementById("statisticsBTN");
    const howToPlayNavigationBarBTN = document.getElementById("howToPlayBTN");
    const hintNavigationBarBTN = document.getElementById("hintBTN");
    const settingsNavigationBarBTN = document.getElementById("settingsBTN");

    let currentGuessAmount = 0;
    let usersCurrentGuess = "";

    // Tells the system to stop acting on events from key presses
    let gameEnded = false;

    // Disables the game, use cases like opening menu so background presses
    let disableGamePlay = false;

    let areHintsAllowed = 1;
    if (asearch && words.includes(decyptText(asearch).slice(0, -1))) {
        areHintsAllowed = 0;
        if (decyptText(asearch).charAt(decyptText(asearch).length - 1) == "a"){
            areHintsAllowed = 1
        }
    }

    // Get the definition of the selected word
    let correctWordDefinitions = -1;
    if (areHintsAllowed && playingDifficulty != "impossible"){
        getDefinitionOfWord(correctWord).then(definitions => {
            correctWordDefinitions = definitions;

            // Show the hint button if there's an avalible definition
            if (correctWordDefinitions !== -1) {
                hintNavigationBarBTN.style.display = "flex"
                hintNavigationBarBTN.classList.add("showNavOption")
            }
        })
    }

    for (const radioButton of document.getElementsByClassName("radio")) {
        radioButton.addEventListener("click", ()=>{
            const radiosInSameGroup = document.getElementsByClassName(String(radioButton.classList).replace("radio", ""))
            for (const radioInGroup of radiosInSameGroup) {
                radioInGroup.classList.remove("active")
            }
            radioButton.classList.add("active")
            if (radioButton.classList.contains("difficultyRadioGroup")) {
                const previousDifficulty = selectedDifficulty
                selectedDifficulty = radioButton.id.replace("Mode", "")
                if (previousDifficulty != selectedDifficulty) addNotification(`The difficulty will change to ${selectedDifficulty} when you refresh`, notificationTimeOutMS)
            }
            saveSettings()
        })
    }

    // adds functionality to toggle buttons
    for (const toggleButton of document.getElementsByClassName("slider")) {
        toggleButton.addEventListener("click", ()=>{
            if (toggleButton.classList.contains("active")) {
                toggleButton.classList.remove("active")
            } else {
                toggleButton.classList.add("active")
            }
            const active = toggleButton.classList.contains("active")

            if (toggleButton.id === "contrast") {
                if (active) document.body.classList.add("contrast") 
                else document.body.classList.remove("contrast")
            }
            else if (toggleButton.id === "keyoption") {
                if (active) onScreenKeyInputsOnly = true
                else onScreenKeyInputsOnly = false
            }
            else if (toggleButton.id === "showAnimations") {
                if (active) {
                    document.body.classList.remove("hideAnimations")
                    showAnimations = true
                }
                else {
                    document.body.classList.add("hideAnimations")
                    showAnimations = false
                }
            }
            saveSettings()
        })
    }


    let impossibleModeCharateristics = {
        "incorrect":[],
        "wrongSpot":{},
        "correct":{}
    }

    // Sets a time in MS for how long the notification will be displayed for
    const notificationTimeOutMS = 1000;

    // Sets a time in MS between each letter whist getting checked
    const wordCheckAnimationIntervalMS = 250;

    // Sets the amount of letters in the correct word and the amount of guesses allowed
    const correctWordLength = correctWord.length;
    const guessesAllowed = 6;

    // What guess will get skiped to when getting a hint
    const hintRevealingSkipToGuessCost = guessesAllowed - 1;

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

    for (const tabSelect of document.getElementsByClassName("tabSelect")) {
        tabSelect.addEventListener("click", ()=>{
            selectStatsTab = tabSelect.textContent.toLowerCase()
            updateStatistics()
        })
    }
    // Opens the settings popup when ran
    function openSettingsPopup() {
        disableGamePlay = true;
        settingsPopup.style.display = "block";
        settingsPopup.offsetWidth
        settingsPopup.style.opacity = 1;
        settingsPopup.style.transform = "translate(-50%, -50%)";
        settingsBackground.style.display = "block";
    }

    // Closes the settings popup when ran
    function closeSettingsPopup() {
        disableGamePlay = false;
        settingsPopup.style.transform = "translate(-50%, -45%)";
        settingsPopup.style.opacity = 0;
        setTimeout(() => {
            settingsPopup.style.display = "none";
            settingsBackground.style.display = "none";
        }, 200 * showAnimations)
    }

    // Opens the hint popup when ran
    function openHintPopup() {
        disableGamePlay = true;
        hintPopup.style.display = "block";
        hintPopup.offsetWidth
        hintPopup.style.opacity = 1;
        hintPopup.style.transform = "translate(-50%, -50%)";
        hintBackground.style.display = "block";
    }

    // Closes the hint popup when ran
    function closeHintPopup() {
        disableGamePlay = false;
        hintPopup.style.transform = "translate(-50%, -45%)";
        hintPopup.style.opacity = 0;
        setTimeout(() => {
            hintPopup.style.display = "none";
            hintBackground.style.display = "none";
        }, 200 * showAnimations)
    }

    // Opens the how to play popup when ran
    function openHowToPlayPopup() {
        disableGamePlay = true;
        howToPlayPopup.style.display = "block";
        howToPlayPopup.offsetWidth
        howToPlayPopup.style.opacity = 1;
        howToPlayPopup.style.transform = "translate(-50%, -50%)";
        howToPlayBackground.style.display = "block";

        // Animates the tiles in the help menu to gradully reviel like the accual game
        let helpExampleTilePassedAmount = 0;
        for (let helpExampleTile of document.getElementsByClassName("helpTile")) {

            // Removes the classes that change the colour so it cna be animated
            helpExampleTile.classList.remove("incorrect")
            helpExampleTile.classList.remove("wrong")
            helpExampleTile.classList.remove("correct")
            helpExampleTile.classList.remove("popinout")

            // Add the propaties of a revieled tile after the previous tiles have revieled
            setTimeout(() => {
                helpExampleTile.classList.add("popinout")
                if (helpExampleTile.classList.contains("correctHelp")) helpExampleTile.classList.add("correct");
                if (helpExampleTile.classList.contains("wrongHelp")) helpExampleTile.classList.add("wrong");
                if (helpExampleTile.classList.contains("incorrectHelp")) helpExampleTile.classList.add("incorrect");
            }, ((helpExampleTilePassedAmount*wordCheckAnimationIntervalMS)/4 + 125) * showAnimations)
            helpExampleTilePassedAmount ++;
        }
    }

    // Closes the how to play popup when ran
    function closeHowToPlayPopup() {
        disableGamePlay = false;
        howToPlayPopup.style.transform = "translate(-50%, -45%)";
        howToPlayPopup.style.opacity = 0;
        setTimeout(() => {
            howToPlayPopup.style.display = "none";
            howToPlayBackground.style.display = "none";
        }, 200 * showAnimations)
    }

    // Opens the statistics popup when ran
    function openStatisticsMenu() {
        disableGamePlay = true;
        statisticsMenu.style.display = "flex";
        statisticsMenu.offsetWidth
        statisticsMenu.style.opacity = 1;
        statisticsMenu.style.transform = "translateY(0%)";
        
    }

    // Closes the statistics popup when ran
    function closeStatisticsMenu() {
        disableGamePlay = false;
        statisticsMenu.style.transform = "translateY(5%)";
        statisticsMenu.style.opacity = 0;
        setTimeout(() => {
            statisticsMenu.style.display = "none";
        }, 200 * showAnimations)
    }

    function copyCustomWordLink(word) {
        word = word.toLowerCase()
        const allowHindTurnedOn = document.getElementById("enableHints").classList.contains("active")

        if (words.includes(word)) {
            navigator.clipboard.writeText(`vertmit.github.io/dictionle?a=${encyptText(`${word}${(allowHindTurnedOn)? "a": "b"}`)}`)
            addNotification("Copied!", notificationTimeOutMS)
        } else {
            customGameInput.classList.remove("invalid")

            // forces a reflow to replay the animation
            customGameInput.offsetWidth

            customGameInput.classList.add("invalid")
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

    settingsNavigationBarBTN.addEventListener("click", ()=>{
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


    hintNavigationBarBTN.addEventListener("click", ()=>{
        openHintPopup();
    })

    getHintBTN.addEventListener("click", ()=>{
        getHintBTN.remove();
        if (correctWordDefinitions !== -1) {
            hintNavigationBarBTN.style.animation = ""
            const hintBox = document.createElement("div");
            hintBox.classList.add("hintBox")

            const hintTitle = document.createElement("h2");
            hintTitle.textContent = "Hint"

            const hintText = document.createElement("p");
            hintText.textContent = correctWordDefinitions.definition;

            const sourceText = document.createElement("p");
            sourceText.classList.add("hintSource")
            sourceText.textContent = correctWordDefinitions.source;


            hintBox.appendChild(sourceText)
            hintBox.appendChild(hintTitle)
            hintBox.appendChild(hintText)
            hintPopup.appendChild(hintBox)

            hasHintRevealed = true;
            
            for (let i = 0; i < hintRevealingSkipToGuessCost - currentGuessAmount; i++) {
                for (let e = 0; e < correctWordLength; e ++) {
                    const currentLetterToBeChanged = letterPlacesInsideGride[(currentGuessAmount + i) * correctWordLength + e]
                    
                    currentLetterToBeChanged.classList.remove("popinout")
                    setTimeout(()=>{
                        currentLetterToBeChanged.textContent = ""
                        currentLetterToBeChanged.classList.add("popinout")
                        currentLetterToBeChanged.classList.add("hinted")
                    }, (i + e)*100 * showAnimations)
                    
                }
            }
            keyDownProsses("")
            currentGuessAmount += hintRevealingSkipToGuessCost

        } else {
            const hintText = document.createElement("p");
            hintText.textContent = "No Definition Found";
            hintPopup.appendChild(hintText)
        }
    })

    howToPlayNavigationBarBTN.addEventListener("click", ()=>{
        openHowToPlayPopup();
    })

    howToPlayBackground.addEventListener("click", ()=>{
        closeHowToPlayPopup();
    })

    howToPlayClosePopupBTN.addEventListener("click", ()=>{
        closeHowToPlayPopup();
    })

    const stats = JSON.parse(localStorage.getItem("statistics"))
    let guessdistribution = {"normal":{}, "hard":{}, "impossible":{}};
    let statisticNumbers = {"normal":{"played": 0, "wins":0, "streak":0, "maxStreak":0},
                            "hard":{"played": 0, "wins":0, "streak":0, "maxStreak":0},
                            "impossible":{"played": 0, "wins":0, "streak":0, "maxStreak":0}
                        };
    if (stats) {
        guessdistribution = stats.distribution;
        statisticNumbers = stats.numbers;
    }

    const statisticsCloseButton = document.getElementById("statsClose");

    statisticsNavigationBarBTN.addEventListener("click", ()=>{
        openStatisticsMenu();
    })

    
    statisticsCloseButton.addEventListener("click", ()=>{
        closeStatisticsMenu();
    }) 

    function updateStatistics() {
        localStorage.setItem("statistics", JSON.stringify({"distribution": guessdistribution, "numbers": statisticNumbers}))

        document.getElementById("statsMarker").textContent = `${selectStatsTab} mode statistics`.toUpperCase()

        let guessDistributionNumbers = [];

        while (guessDistributionHolder.firstChild) {
            guessDistributionHolder.firstChild.remove();
        }

        const maxGuess = (Object.keys(guessdistribution[selectStatsTab]).length > 0)? (Object.keys(guessdistribution[selectStatsTab]).slice(-1) == "hinted")? Object.keys(guessdistribution[selectStatsTab]).slice(-2)[0]: Object.keys(guessdistribution[selectStatsTab]).slice(-1): 0;

        for (let i = 1; i < Math.max(maxGuess, guessesAllowed)+1 + (selectStatsTab == "normal")? 1: 0; i++ ) {
            if (i === guessesAllowed + 1 && selectStatsTab == "normal") i = "hinted"
            if (i in guessdistribution[selectStatsTab]) {
                
                guessDistributionNumbers.push(guessdistribution[selectStatsTab][i]);
            } else {
                guessDistributionNumbers.push(0)
            }
        }

        
        const maxiumGuessDistribution = Math.max(...guessDistributionNumbers);

        statisticsNumberGamesPlayed.textContent = statisticNumbers[selectStatsTab].played;
        statisticsNumberWinPercent.textContent = (statisticNumbers[selectStatsTab].played !== 0)? Math.round(statisticNumbers[selectStatsTab].wins / statisticNumbers[selectStatsTab].played * 100): 0;
        statisticsNumberCurrentStreak.textContent = statisticNumbers[selectStatsTab].streak;
        
        statisticsNumberMaxStreak.textContent = statisticNumbers[selectStatsTab].maxStreak;

        for (let i = 0; i < guessDistributionNumbers.length; i ++) {

            const guessDistributionBox = document.createElement("div");
            guessDistributionBox.className = "guessDistributionBox";

            const indexNumberOfGuess = document.createElement("div");
            
            if (i == guessDistributionNumbers.length -1 && selectStatsTab == "normal") {
                
                const hintedBarIndicator = document.createElement("img")
                hintedBarIndicator.src = "images/lightbulb.png"
                indexNumberOfGuess.appendChild(hintedBarIndicator)
            }
            else indexNumberOfGuess.textContent = i + 1;
            indexNumberOfGuess.className = "guessDistributionIndex";
            guessDistributionBox.appendChild(indexNumberOfGuess)

            const distributionBar = document.createElement("div");
            distributionBar.className = "guessDistributionBar";
            distributionBar.style.width = `calc(${guessDistributionNumbers[i] / maxiumGuessDistribution * 100}% + 8px)`;
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
                    if (playingDifficulty == "impossible") {
                        let furtherestWords = []
                        let furtherestDistance = -1
                        
                        for (const word of words) {

                            let wordVaild = true
                            let index = 0;
                            for (let letter of word) {
                                if (impossibleModeCharateristics.incorrect.includes(letter)) {
                                    wordVaild = false
                                    break
                                }
                                if (Object.keys(impossibleModeCharateristics.wrongSpot).includes(letter)) {
                                    if (impossibleModeCharateristics.wrongSpot[letter].includes(index)) {
                                        wordVaild = false
                                        break
                                    }
                                }
                                if (Object.keys(impossibleModeCharateristics.correct).includes(index)) {
                                    if (impossibleModeCharateristics.correct[index] != letter) {
                                        wordVaild = false
                                        break
                                    }
                                }
                                index++
                            }

                            if (word.length == correctWordLength && wordVaild) {
                                let wordDistance = 0;
                                let processingGuess = usersCurrentGuess.split('');
                                let processingWord = word.split('');
                                for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {
                                    if (processingGuess[letterIndexOfGuess] == processingWord[letterIndexOfGuess]) {
                                        processingGuess[letterIndexOfGuess] = "="
                                        processingWord[letterIndexOfGuess] = "+"
                                        wordDistance += 2;
                                    }
                                }

                                for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {
                                    if (processingWord.includes(processingGuess[letterIndexOfGuess])) {
                                        let index = processingWord.indexOf(processingGuess[letterIndexOfGuess]);
                                        processingGuess[index] = "="
                                        processingWord[letterIndexOfGuess] = "+"
                                        wordDistance += 1;
                                    }
                                }
                                if (furtherestDistance === -1 || wordDistance < furtherestDistance) {
                                    furtherestWords = [word]
                                    furtherestDistance = wordDistance
                                } else if (wordDistance == furtherestDistance) {
                                    furtherestWords.push(word)
                                }
                            }
                        }

                        correctWord = furtherestWords[Math.floor(Math.random()*furtherestWords.length)];

                        let processingGuess = usersCurrentGuess.split('');
                        let processingWord = correctWord.split('');

                        for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {
                            if (processingGuess[letterIndexOfGuess] == processingWord[letterIndexOfGuess]) {
                                impossibleModeCharateristics.correct[letterIndexOfGuess] = processingGuess[letterIndexOfGuess]
                                processingGuess[letterIndexOfGuess] = "+"
                                processingWord[letterIndexOfGuess] = "="
                            }
                        }
                        for (let letterIndexOfGuess = 0; letterIndexOfGuess < correctWordLength; letterIndexOfGuess ++) {
                            if (processingWord.includes(processingGuess[letterIndexOfGuess])) {
                                let index = processingWord.indexOf(processingGuess[letterIndexOfGuess]);
                                if (!impossibleModeCharateristics.wrongSpot[letterIndexOfGuess]) impossibleModeCharateristics.wrongSpot[letterIndexOfGuess] = []
                                impossibleModeCharateristics.wrongSpot[letterIndexOfGuess].push(index)
                                processingGuess[letterIndexOfGuess] = "+"
                                processingWord[index] = "="
                            } else {
                                if (!Object.keys(impossibleModeCharateristics.wrongSpot).includes(processingGuess[letterIndexOfGuess])) {
                                    impossibleModeCharateristics.incorrect.push(processingGuess[letterIndexOfGuess])
                                }
                            }
                        }
                    }
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
                            }, wordCheckAnimationIntervalMS * letterIndexOfGuess * showAnimations);
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
                                }, wordCheckAnimationIntervalMS * letterIndexOfGuess * showAnimations);
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
                                }, wordCheckAnimationIntervalMS * letterIndexOfGuess * showAnimations);
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
                                key.classList.add("correct");
                            }

                            // changes the key to orange if the letter is maked as in the wrong spot
                            else if (processingGuess[letter] === "wrong spot") {

                                // sees if the key is already green so it doesn't change it
                                if (!key.classList.contains("correct")) key.classList.add("wrong");
                            } 

                            // changes the key to grey if the letter is maked as in the incorrect
                            else {
                                if ( !key.classList.contains("correct") && !key.classList.contains("wrong")) key.classList.add("incorrect");
                            }
                        }
                    }, wordCheckAnimationIntervalMS * correctWordLength * showAnimations);
                    
                    

                    if (correctWord === usersCurrentGuess) {
                        gameEnded = true;
                        if (!asearch) {
                            const guessIndexInStatistics = (!hasHintRevealed)? currentGuessAmount+1: "hinted";
                            if (!(guessIndexInStatistics in guessdistribution[playingDifficulty])) guessdistribution[playingDifficulty][guessIndexInStatistics] = 0;
                            guessdistribution[playingDifficulty][guessIndexInStatistics] ++;
                            statisticNumbers[playingDifficulty].played ++;
                            statisticNumbers[playingDifficulty].wins ++;
                            statisticNumbers[playingDifficulty].streak ++;
                            if (statisticNumbers[playingDifficulty].streak > statisticNumbers[playingDifficulty].maxStreak) statisticNumbers[playingDifficulty].maxStreak = statisticNumbers[playingDifficulty].streak
                        }
                        updateStatistics()
                        setTimeout(() => {

                            // Gives the user a comment when they beat the game to show how well they did
                            if (currentGuessAmount === 0) addNotification("Genius!", notificationTimeOutMS);
                            if (currentGuessAmount === 1) addNotification("Magnificent!", notificationTimeOutMS);
                            if (currentGuessAmount === 2) addNotification("Impressive!", notificationTimeOutMS);
                            if (currentGuessAmount === 3) addNotification("Splendid!", notificationTimeOutMS);
                            if (currentGuessAmount === 4) addNotification("Great!", notificationTimeOutMS);
                            if (currentGuessAmount === 5) addNotification("Phew!", notificationTimeOutMS);


                            setTimeout(() => {
                                openStatisticsMenu()
                            }, 2000)
                        }, wordCheckAnimationIntervalMS * correctWordLength * showAnimations);
                    }
                    else {

                        // Increments the current guess amount so the next row can be used
                        currentGuessAmount ++;

                        if (currentGuessAmount > hintRevealingSkipToGuessCost - 1 && !hasHintRevealed) {
                            hintNavigationBarBTN.style.animation = "bouncingNavButton 2s infinite"
                        }
                        
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
                                    openStatisticsMenu()
                                }, 2000)
                            }, wordCheckAnimationIntervalMS * correctWordLength * showAnimations)
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
        if (!onScreenKeyInputsOnly) keyDownProsses(event.key);
    });
}

runGame()