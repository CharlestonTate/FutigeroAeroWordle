var height = 6; //number of guesses
var width = 5; //length of the word

var row = 0; //current guess (attempt #)
var col = 0; //current letter for that attempt

var gameOver = false;
guessList = guessList.concat(wordList);

var word = wordList[Math.floor(Math.random()*wordList.length)].toUpperCase();

window.onload = function(){
    loadSettings();
    // Start menu music on page load
    setTimeout(() => {
        startMenuMusic();
    }, 1000); // Delay to let page load
}

function initialize() {
    // Clear any existing board
    const board = document.getElementById("board");
    board.innerHTML = '';
    
    // Clear any existing keyboard
    const existingKeyboards = document.querySelectorAll('.keyboard-row');
    existingKeyboards.forEach(kb => kb.remove());

    // Create the game board
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            // <span id="0-0" class="tile">P</span>
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            board.appendChild(tile);
        }
    }

    // Create the keyboard and add it to the game page
    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", " "],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫" ]
    ]

    const gamePage = document.getElementById("gamePage");
    
    for (let i = 0; i < keyboard.length; i++) {
        let currRow = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < currRow.length; j++) {
            let keyTile = document.createElement("div");

            let key = currRow[j];
            keyTile.innerText = key;
            if (key == "Enter") {
                keyTile.id = "Enter";
            }
            else if (key == "⌫") {
                keyTile.id = "Backspace";
            }
            else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key; // "Key" + "A";
            } 

            keyTile.addEventListener("click", processKey);

            if (key == "Enter") {
                keyTile.classList.add("enter-key-tile");
            } else {
                keyTile.classList.add("key-tile");
            }
            keyboardRow.appendChild(keyTile);
        }
        gamePage.appendChild(keyboardRow);
    }
}

function processKey() {
    e = { "code" : this.id };
    processInput(e);
}

function processInput(e) {
    if (gameOver) return; 

    // alert(e.code);
    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (col < width) {
            let currTile = document.getElementById(row.toString() + '-' + col.toString());
            if (currTile.innerText == "") {
                currTile.innerText = e.code[3];
                col += 1;
            }
        }
    }
    else if (e.code == "Backspace") {
        if (0 < col && col <= width) {
            col -=1;
        }
        let currTile = document.getElementById(row.toString() + '-' + col.toString());
        currTile.innerText = "";
    }

    else if (e.code == "Enter") {
        update();
    }

}

function update() {
    let guess = "";
    document.getElementById("answer").innerText = "";

    //string up the guesses into the word
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
        guess += letter;
    }

    guess = guess.toLowerCase(); //case sensitive
    console.log(guess);

    if (!guessList.includes(guess)) {
        document.getElementById("answer").innerText = "Not in word list";
        return;
    }
    
    //start processing guess
    let correct = 0;

    let letterCount = {}; //keep track of letter frequency, ex) KENNY -> {K:1, E:1, N:2, Y: 1}
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];

        if (letterCount[letter]) {
           letterCount[letter] += 1;
        } 
        else {
           letterCount[letter] = 1;
        }
    }

    console.log(letterCount);

    //first iteration, check all the correct ones first
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        // Add flip animation
        setTimeout(() => {
            currTile.classList.add("flip");
            // Remove flip class after animation
            setTimeout(() => {
                currTile.classList.remove("flip");
            }, 600);
        }, c * 100);

        // Add color classification after animation delay
        setTimeout(() => {
            //Is it in the correct position?
            if (word[c] == letter) {
                currTile.classList.add("correct");

                let keyTile = document.getElementById("Key" + letter);
                keyTile.classList.remove("present");
                keyTile.classList.add("correct");

                correct += 1;
                letterCount[letter] -= 1; //deduct the letter count
            }

            if (correct == width) {
                gameOver = true;
                setTimeout(() => {
                    triggerConfetti();
                    showResultsModal(true, word);
                }, 500);
            }
        }, c * 100 + 300);
    }

    console.log(letterCount);
    //go again and mark which ones are present but in wrong position
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        // Add color classification with animation delay
        setTimeout(() => {
            // skip the letter if it has been marked correct
            if (!currTile.classList.contains("correct")) {
                //Is it in the word?         //make sure we don't double count
                if (word.includes(letter) && letterCount[letter] > 0) {
                    currTile.classList.add("present");
                    
                    let keyTile = document.getElementById("Key" + letter);
                    if (!keyTile.classList.contains("correct")) {
                        keyTile.classList.add("present");
                    }
                    letterCount[letter] -= 1;
                } // Not in the word or (was in word but letters all used up to avoid overcount)
                else {
                    currTile.classList.add("absent");
                    let keyTile = document.getElementById("Key" + letter);
                    keyTile.classList.add("absent")
                }
            }
        }, c * 100 + 300);
    }

    row += 1; //start new row
    col = 0; //start at 0 for new row
    
    // Check for game over after all animations
    setTimeout(() => {
        if (row == height && !gameOver) {
            gameOver = true;
            showResultsModal(false, word);
        }
    }, (width - 1) * 100 + 600);
}

function triggerConfetti() {
    // Using confetti.js library
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7']
    });
    
    // Additional burst for more celebration
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#6AAA64', '#C9B458', '#787C7E']
        });
    }, 200);
    
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#6AAA64', '#C9B458', '#787C7E']
        });
    }, 400);
}

function showResultsModal(isWin, word) {
    const modal = document.getElementById('resultsModal');
    const content = document.querySelector('.results-content');
    const title = document.getElementById('resultsTitle');
    const message = document.getElementById('resultsMessage');
    const buttons = document.querySelector('.results-buttons');
    
    // Set content first (before showing anything)
    if (isWin) {
        title.textContent = 'Congratulations!';
        title.style.color = '#6AAA64';
        message.textContent = `You guessed "${word.toUpperCase()}" correctly!`;
    } else {
        title.textContent = 'Game Over';
        title.style.color = '#787C7E';
        message.textContent = `The word was "${word.toUpperCase()}". Better luck next time!`;
    }
    
    // Reset all styles to initial hidden state
    modal.style.background = 'rgba(0, 0, 0, 0)';
    modal.style.transition = 'none';
    content.style.opacity = '0';
    content.style.transform = 'translateY(-50px)';
    content.style.transition = 'none';
    buttons.style.opacity = '0';
    buttons.style.transform = 'translateY(20px)';
    buttons.style.transition = 'none';
    
    // Show modal (but everything is hidden)
    modal.style.display = 'flex';
    
    // Force reflow to ensure styles are applied
    modal.offsetHeight;
    
    // Phase 1: Fade in backdrop
    setTimeout(() => {
        modal.style.transition = 'background 0.5s ease';
        modal.style.background = 'rgba(0, 0, 0, 0.7)';
    }, 50);
    
    // Phase 2: Slide in content container
    setTimeout(() => {
        content.style.transition = 'all 0.6s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        
        // Play result sound
        if (isWin) {
            playSound('finish');
        } else {
            playSound('toobad');
        }
    }, 600);
    
    // Phase 3: Show buttons after sound finishes
    const soundDelay = isWin ? 2000 : 3500; // toobad is longer
    setTimeout(() => {
        playSound('chimes');
        buttons.style.transition = 'all 0.5s ease';
        buttons.style.opacity = '1';
        buttons.style.transform = 'translateY(0)';
    }, soundDelay);
}

function resetGame() {
    gameOver = false;
    row = 0;
    col = 0;
    
    word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    
    // Clear board tiles
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.innerText = '';
        tile.classList.remove('correct', 'present', 'absent', 'flip');
    });
    
    // Reset keyboard colors
    const keys = document.querySelectorAll('.key-tile, .enter-key-tile');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    
    document.getElementById('answer').innerText = '';
    document.getElementById('resultsModal').style.display = 'none';
}

document.getElementById('playAgainBtn').addEventListener('click', function() {
    playSound('click');
    resetGame();
});

document.getElementById('homeBtn').addEventListener('click', function() {
    playSound('click');
    document.getElementById('resultsModal').style.display = 'none';
    navigateToPage('subMenuPage');
});

function navigateToPage(targetPageId) {
    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(targetPageId);
    
    // Handle music based on page transitions
    if (targetPageId === 'gamePage' || targetPageId === 'tutorialPage') {
        fadeOutMenuMusic();
    } else if ((targetPageId === 'mainMenuPage' || targetPageId === 'subMenuPage') && 
               (currentPage && (currentPage.id === 'gamePage' || currentPage.id === 'tutorialPage'))) {
        fadeInMenuMusic();
    }
    
    if (currentPage) {
        currentPage.classList.add('fade-out');
        setTimeout(() => {
            currentPage.classList.remove('active', 'fade-out');
        }, 400);
    }
    
    setTimeout(() => {
        targetPage.classList.add('active', 'fade-in');
        setTimeout(() => {
            targetPage.classList.remove('fade-in');
        }, 600);
    }, 200);
}

document.getElementById('mainStartBtn').addEventListener('click', function() {
    playSound('click');
    navigateToPage('subMenuPage');
});

document.getElementById('playBtn').addEventListener('click', function() {
    playSound('click');
    navigateToPage('gamePage');
    initializeGame();
});

document.getElementById('tutorialBtn').addEventListener('click', function() {
    playSound('duh');
    navigateToPage('tutorialPage');
    startTutorial();
});

document.getElementById('settingsBtn').addEventListener('click', function() {
    playSound('duh');
    navigateToPage('settingsPage');
});

document.getElementById('quitBtn').addEventListener('click', function() {
    playSound('duh');
    navigateToPage('mainMenuPage');
});

document.getElementById('backToMenuBtn').addEventListener('click', function() {
    playSound('back');
    navigateToPage('subMenuPage');
});

document.getElementById('backFromSettingsBtn').addEventListener('click', function() {
    playSound('back');
    navigateToPage('subMenuPage');
});

document.getElementById('backFromTutorialBtn').addEventListener('click', function() {
    playSound('back');
    navigateToPage('subMenuPage');
});

function initializeGame() {
    initialize();
    resetGame();
    
    // Add keyboard event listener only when game is active
    document.addEventListener("keyup", handleKeyPress);
}

function handleKeyPress(e) {
    // Only process input if we're on the game page
    const gamePage = document.getElementById('gamePage');
    if (gamePage.classList.contains('active')) {
        processInput(e);
    }
}

let gameSettings = {
    difficulty: 'normal',
    soundEffects: true
};

const sounds = {
    click: new Audio('music/click.mp3'),
    finish: new Audio('music/finish.mp3'),
    toobad: new Audio('music/toobad.mp3'),
    chimes: new Audio('music/chimes.mp3'),
    back: new Audio('music/back.mp3'),
    duh: new Audio('music/duh.mp3')
};

const menuMusic = new Audio('music/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.15;

// Set volume levels for all sounds
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3; // Much quieter
});

// Special volume for toobad (extra quiet)
sounds.toobad.volume = 0.2;

function playSound(soundName) {
    if (gameSettings.soundEffects && sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Sound play failed:', e));
    }
}

function startMenuMusic() {
    if (gameSettings.soundEffects) {
        menuMusic.play().catch(e => console.log('Music play failed:', e));
    }
}

function stopMenuMusic() {
    menuMusic.pause();
}

function fadeOutMenuMusic() {
    const originalVolume = menuMusic.volume;
    const fadeInterval = setInterval(() => {
        if (menuMusic.volume > 0.01) {
            menuMusic.volume -= 0.01;
        } else {
            menuMusic.pause();
            menuMusic.volume = originalVolume;
            clearInterval(fadeInterval);
        }
    }, 50);
}

function fadeInMenuMusic() {
    if (gameSettings.soundEffects) {
        menuMusic.volume = 0;
        menuMusic.play().catch(e => console.log('Music play failed:', e));
        const targetVolume = 0.15;
        const fadeInterval = setInterval(() => {
            if (menuMusic.volume < targetVolume - 0.01) {
                menuMusic.volume += 0.01;
            } else {
                menuMusic.volume = targetVolume;
                clearInterval(fadeInterval);
            }
        }, 50);
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('wordleSettings');
    if (savedSettings) {
        gameSettings = { ...gameSettings, ...JSON.parse(savedSettings) };
    }
    
    document.getElementById('difficultySelect').value = gameSettings.difficulty;
    document.getElementById('soundToggle').checked = gameSettings.soundEffects;
}

function saveSettings() {
    gameSettings.difficulty = document.getElementById('difficultySelect').value;
    gameSettings.soundEffects = document.getElementById('soundToggle').checked;
    
    localStorage.setItem('wordleSettings', JSON.stringify(gameSettings));
}

document.getElementById('difficultySelect').addEventListener('change', saveSettings);
document.getElementById('soundToggle').addEventListener('change', saveSettings);

function createMenuButton(text, className = 'secondary-btn', onClick = null) {
    const button = document.createElement('button');
    button.className = `menu-btn ${className}`;
    button.textContent = text.toUpperCase();
    
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

function addButtonToGrid(container, buttonText, className = 'secondary-btn', onClick = null) {
    const button = createMenuButton(buttonText, className, onClick);
    container.appendChild(button);
    
    const buttons = container.querySelectorAll('.menu-btn');
    buttons.forEach((btn, index) => {
        btn.style.animationDelay = `${(index + 1) * 0.2}s`;
    });
    
    return button;
}

// haven't made a visual novel in a long time.
const tutorialDialogue = [
    {
        text: "Hey! I'm Wordante, your friendly neighborhood word wizard!",
        image: "wordante_art/querty_happy.png",
        bounce: true,
        sound: "click"
    },
    {
        text: "So you want to learn Wordle, eh? Well, you've come to the right place! It's quite simple, really...",
        image: "wordante_art/querty_smirk.png",
        wiggle: true,
        sound: "chimes"
    },
    {
        text: "You get exactly 6 chances to guess a mysterious 5-letter word. No more, no less!",
        image: "wordante_art/idle.png",
        bounce: false,
        sound: "back"
    },
    {
        text: "But here's where it gets interesting... After each guess, I'll give you magical color clues!",
        image: "wordante_art/querty_happy.png",
        bounce: true,
        sound: "chimes"
    },
    {
        text: "GREEN tiles mean 'Perfect! That letter belongs right there!' - like finding treasure!",
        image: "wordante_art/querty_happy.png",
        bounce: true,
        sound: "chimes"
    },
    {
        text: "YELLOW tiles mean 'Close, but not quite!' - the letter exists, just in the wrong spot.",
        image: "wordante_art/word_surprised.png",
        wiggle: true,
        sound: "click"
    },
    {
        text: "And GRAY tiles? Well... those letters aren't invited to this word party at all.",
        image: "wordante_art/word_frown.png",
        bounce: false,
        sound: "duh"
    },
    {
        text: "Use these clues wisely! Each guess should get you closer to the answer. Think like a detective!",
        image: "wordante_art/querty_happy.png",
        wiggle: true,
        sound: "click"
    },
    {
        text: "Remember, you only have 6 tries! Don't waste them on random guesses - strategy is key!",
        image: "wordante_art/word_angry.png",
        bounce: false,
        sound: "chimes"
    },
    {
        text: "But hey, if you don't get it... there's always another word waiting! Keep trying, champion!",
        image: "wordante_art/querty_happy.png",
        bounce: true,
        sound: "chimes"
    },
    {
        text: "Now go forth and conquer those words! I believe in you! Good luck, word warrior!",
        image: "wordante_art/querty_happy.png",
        bounce: true,
        sound: "finish"
    }
];

let currentDialogueIndex = 0;

function startTutorial() {
    currentDialogueIndex = 0;
    showDialogue();
}

function showDialogue() {
    const dialogue = tutorialDialogue[currentDialogueIndex];
    const characterImg = document.getElementById('characterImage');
    const dialogueText = document.getElementById('dialogueText');
    
    // Remove any existing animation classes
    characterImg.classList.remove('bounce', 'wiggle');
    
    // Change character image
    characterImg.src = dialogue.image;
    
    // Add animation based on dialogue properties
    if (dialogue.bounce) {
        characterImg.classList.add('bounce');
    } else if (dialogue.wiggle) {
        characterImg.classList.add('wiggle');
    }
    
    // Update text
    dialogueText.textContent = dialogue.text;
}

function nextDialogue() {
    // Play sound based on current dialogue or default to click
    const currentDialogue = tutorialDialogue[currentDialogueIndex];
    const soundToPlay = currentDialogue.sound || 'click';
    playSound(soundToPlay);
    
    if (currentDialogueIndex === tutorialDialogue.length - 1) {
        navigateToPage('subMenuPage');
        return;
    }
    
    currentDialogueIndex++;
    showDialogue();
}

// Click anywhere on dialogue box to continue
document.getElementById('dialogueBox').addEventListener('click', nextDialogue);
