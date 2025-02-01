'use strict';


// document.addEventListener('DOMContentLoaded', () => {});
// * CRUCIAL INFORMATION - WE WOULD USE THE QUERY ABOVE IF:
// *    The <script> tag is placed in the head of our HTML, but it isn't, so it's not necessary here


// !DECLARATIONS
// * Declaration of HTML Elements
const operationContainer = document.querySelector('.operation-container');
const optionContainer = document.querySelector('.option-container');
const starterContainer = document.querySelector('.starter-container');
const nextButtonContainer = document.querySelector('.next-button-container');
const newRandomizeContainer = document.querySelector('.new-randomize-container');

const optionOneButton = document.querySelector('.option-one');
const optionTwoButton = document.querySelector('.option-two');
const starterButton = document.querySelector('.starter-button');
const relationshipButtons = document.querySelector('.relationship-button');
const newRandomizeButton = document.querySelector('.new-randomize-button');

const hoverEffectSection = document.querySelectorAll('.chaotic-hover-effect');

// * Declaration of toggle variables
let optionOneToggle, optionTwoToggle, noneButtonToggle, pairsButtonToggle, chainButtonToggle;
let randomizeCounter;

// * Declaration for storage objects
const input = {
    firstObject: [],
    secondObject: []
};

const randomizedInput = {
    firstRandomizedObject: [],
    secondRandomizedObject: []
};

// * Defining alert state (NECESSARY BC WE WANT THE ALERT TO APPEAR ONLY ONCE PER MISTAKE)
// ! Doesn't work. Leaving it here for when it wants to be addressed again
let alertState = {
    shown: false,
    lastLengths: { first: 0, second: 0 }
};

// * Declaring and initializing a variable for an animation effect
let chaosCharacters = ['x', '$', 'Y', '#', '0', '?', '1', '+', '%'];
// !-----------------------------------------------------------------------------------------------------------------------------------




// !FUNCTIONS
// TODO Create an initialization function to return the program to its initial stage
function init() {
    // * Reset state variables
    optionOneToggle = optionTwoToggle = pairsButtonToggle = chainButtonToggle = 0;
    noneButtonToggle = 1;
    randomizeCounter = 4;

    // * Clear input data
    input.firstObject = [];
    input.secondObject = [];
    randomizedInput.firstRandomizedObject = [];
    randomizedInput.secondRandomizedObject = [];

    // * Reset alert state
    alertState = { shown: false, lastLengths: { first: 0, second:0 } };

    // * Clear relationship input
    const relationshipInput = document.querySelector('.relationship-accepter');
    if (relationshipInput) {
        relationshipInput.value = '';
        relationshipInput.classList.add('disabled');
    }

    // * Clean up DOM
    const elementsToRemove = [
        '.randomize-container', '.randomize-container-two', '.display-randomization'
    ];
    elementsToRemove.forEach(cssClass => {
        const el = document.querySelector(cssClass);
        if (el) el.remove();
    });

    // * Reset UI components
    operationContainer.classList.remove('expanded');
    setTimeout(() => {
        starterContainer.style.display = 'flex'
        starterContainer.classList.remove('hidden');
    }, 600);
    optionContainer.classList.remove('activated');
    newRandomizeContainer.classList.remove('activated');

    // * Reset button states
    document.querySelectorAll('.relationship-button').forEach(btn => {
        btn.classList.remove('toggled');
        if (btn.classList.contains('none-button')) {
            btn.classList.add('toggled');
        }
    });
}
// * Calling the function before first proceeding into the code
init();



// TODO Create an optimized function that creates a different UI based on the choice selected for Randomizing
const randomizeOption = function() {

    newRandomizeContainer.classList.add('activated');
    // * Declaring variables for HTML Template that'll be dynamically added
    const baseHTML = `
        <div class="randomize-object-container">
            <p class="direction">insert your items separated by space</p>
            <p class="example">
                If items are: <strong>John Doe</strong>, <strong>Jane Doe</strong> and <strong>Mark</strong><br>
                Input should be: <strong>JohnDoe</strong> <strong>JaneDoe</strong> <strong>Mark</strong>
            </p>`;

    const inputSection = objectNumber => `
        <label for="object-${objectNumber}" class="item-input-description">
            //object ${objectNumber}
        </label>
        <textarea class="object-${objectNumber} item-accepter" placeholder="Insert items here"></textarea>`;

    const nextButtonHTML = `
        <div class="next-button-container operation-button-container">        
            <button class="next-button operation-button">
                Next
            </button>
            <p class="next-error"> 
                insert the necessary amount of items
            </p>
        </div>
    `;


    // * Creating parent container
    const randomizeContainer = document.createElement('div');
    randomizeContainer.classList.add('randomize-container');


    // * Dynamically populate parent container based on toggle state
    let contentHTML = baseHTML;
    contentHTML += inputSection(1);

    if(optionTwoToggle) {
        contentHTML += inputSection(2);
    }

    contentHTML += nextButtonHTML + '</div>';
    randomizeContainer.innerHTML = contentHTML;


    // * Adding to DOM
    operationContainer.appendChild(randomizeContainer);
    setTimeout(() => {
        randomizeContainer.classList.add('activated');
    }, 15);


    // * Event delegation to check whether the Next button exists or not
    randomizeContainer.addEventListener('click', event => {
        if (!event.target.closest('.next-button')) return;

        // * Capture and store input values
        const firstObjectTextarea = randomizeContainer.querySelector('.object-1');
        const firstObjectText = firstObjectTextarea.value.trim();
        input.firstObject = firstObjectText ? firstObjectText.split(/\s+/) : [];
        input.firstObject = input.firstObject.map(item => item.replace(/([a-z])([A-Z])/g, '$1 $2'));
        
        let secondObjectText = null;
        
        if (optionTwoToggle) {
            const secondObjectTextarea = randomizeContainer.querySelector('.object-2');
            secondObjectText = secondObjectTextarea.value.trim();
            input.secondObject = secondObjectText ? secondObjectText.split(/\s+/) : [];
            input.secondObject = input.secondObject.map(item => item.replace(/([a-z])([A-Z])/g, '$1 $2'));
        }

        // ! Randomization TESTER
        // console.log(input);
        randomizingInput();
        // console.log(randomizedInput);

        const isValid = optionTwoToggle ? firstObjectText && secondObjectText : firstObjectText;

        const nextErrorParagraph = document.querySelector('.next-error');
        const nextButton = document.querySelector('.next-button');

        if (isValid) {
            // * Remove the error message for no inputs
            nextErrorParagraph.classList.remove('error');

            // * Expand the operation container to allow more space for the new elements to be added
            operationContainer.classList.add('expanded');
            createRelationshipSection(randomizeContainer);
            
            // * Remove pointer events from the Next-button
            nextButton.classList.add('disabled');

            // * Remove the randomization display if it exists
            const existingDisplay = document.querySelector('.display-randomization');
            if (existingDisplay) existingDisplay.remove();

        } else {
            nextErrorParagraph.classList.add('error');
        }

        createInputListeners();
    });
};



// TODO Copy the original array into a new randomized one
const randomizingInput = function () {
    let rand = input.firstObject.map(item => item);
    
    // * If negative, swap. If positive, keep
    // rand.sort(() => Math.random() - 0.5);

    // * Better sorting than swapping neighboring elements
    for (let c = 1; c < randomizeCounter; c++) {
        for (let i = rand.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
    
            const temp = rand[i];
            rand[i] = rand[j];
            rand[j] = temp;
        }
    }
    randomizedInput.firstRandomizedObject = rand.map(r => r);
    
    if (optionTwoToggle) {
        rand = input.secondObject.map(item => item);
    
        for (let c = 1; c < randomizeCounter; c++) {
            for (let i = rand.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                const temp = rand[i];
                rand[i] = rand[j];
                rand[j] = temp;
            }
        }
        randomizedInput.secondRandomizedObject = rand.map(r => r);
    }
};



// TODO Segregated function for the Next Button event for better code readability
const createRelationshipSection = function (parentContainer) {
    // * Declaring variables for HTML Template that'll be dynamically added
    const relationshipHTML = `
        <div class="randomize-container-two">
            <div class="relationship-option-container">
                <p class="relationship-prompt">
                    What kind of relationship would you like to create between the items? (It's <strong>None</strong> by default)
                </p>
                <div class="relationship-button-container">
                    ${['None', 'Pairs', 'Chain'].map(btn => ` 
                        <button class="${btn.toLowerCase()}-button operation-button relationship-button ${btn === 'None' ? 'toggled' : ''}">
                            ${btn}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="relationship-type-container">
                <input type="text" class="relationship-accepter disabled" placeholder=" ">
                <label class="floating-label">Relationship Type</label>
                <p class="input-description">
                    i.e. insert a present-tense verb like <strong>manages</strong> or <strong>gifts</strong>
                </p>
            </div>

            <div class="randomize-button-container operation-button-container">        
                <button class="randomize-button operation-button">
                    Randomize
                </button>
            </div>
        </div>`;

        // * Dynamically populate parent container
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = relationshipHTML;
        const relationshipSection = tempDiv.firstElementChild;

        // * Remove a previous instance if there is one
        const existingDisplay = document.querySelector('.randomize-container-two');
        if (existingDisplay) existingDisplay.remove();

        noneButtonToggle = 1;
        pairsButtonToggle = chainButtonToggle = 0;
        // * Adding to DOM
        setTimeout(() => {
            parentContainer.appendChild(relationshipSection);
            displayRandomizedItems();
        }, 50);

        
        setTimeout(() => {
            const chainButton = document.querySelector('.chain-button');
            // console.log(chainButton); // TESTER
            chainButton.classList.remove('disabled');
            if (optionTwoToggle) {
                chainButton.classList.add('disabled');
            }
        }, 50);
};



// TODO Control the style of the relationship type buttons with a toggle counter
const relationshipButtonsStyle = function (button) {
    const buttons = document.querySelectorAll('.none-button, .pairs-button, .chain-button');
    buttons.forEach(btn => btn.classList.remove('toggled'));
    button.classList.add('toggled');
};



// TODO Create a function that displays the randomized items based on the selected relationship
const displayRandomizedItems = function () {
    // * Creating a dedicate display handler function to segregate it from event handling at the end of the parent function
    const handleRandomizationDisplay = () => {
        const relationshipType = document.querySelector('.relationship-accepter').value.trim().toUpperCase();
        const outputContainer = document.createElement('div');
        outputContainer.classList.add('display-randomization');

        // * An item formatter function with optional indexes
        const createItemElement = (item, index, isSecondSet = false) => {
            const elem = document.createElement('p');
            elem.classList.add(`item-${index}`, 'randomized-item');

            // * Display randomized items as they are when there is no relationship 
            if (noneButtonToggle) {
                elem.textContent = item;

            // * Create logic to handle pairing
            } else if (pairsButtonToggle) {

                // * Error checking for an equal amount of items
                if (optionTwoToggle && 
                    randomizedInput.firstRandomizedObject.length !== 
                    randomizedInput.secondRandomizedObject.length) {

                    // * Removing randomizing option to encourage the user to mitigate their input
                    const relationshipSection = document.querySelector('.randomize-container-two');
                    if (relationshipSection) {
                        relationshipSection.classList.add('hidden');
                    }

                    // * Alert logic
                    const currentFirst = randomizedInput.firstRandomizedObject.length;
                    const currentSecond = randomizedInput.secondRandomizedObject.length;

                    if (!alertState.shown || 
                        currentFirst !== alertState.lastLengths.first || 
                        currentSecond !== alertState.lastLengths.second) {

                        alert('You need to have an equal amount of items for pairing. Please try again.');
                        alertState = {
                            shown: true,
                            lastLengths: { first: currentFirst, second: currentSecond }
                        };
                    }
                    return;
                }

                // * Error checking for an even amount of items                
                if (!optionTwoToggle && randomizedInput.firstRandomizedObject.length % 2 !== 0) {
                    const relationshipSection = document.querySelector('.randomize-container-two');
                    if (relationshipSection) {
                        relationshipSection.classList.add('hidden');
                    }
                    alert('You need to have an even amount of items for pairing. Please try again.');
                    return;
                }


                if (index % 2 === 0 || optionTwoToggle) {
                    const nextPairedItem = optionTwoToggle ? 
                        randomizedInput.secondRandomizedObject[index] :
                        randomizedInput.firstRandomizedObject[(index + 1)];
    
                    const relationshipSymbol = relationshipType === '' ? '↔' : relationshipType;
                    elem.textContent = `${item}   ${relationshipSymbol}   ${nextPairedItem}`;
                }
            } else if (chainButtonToggle) {
                const nextChainedItem = optionTwoToggle ? 
                    randomizedInput.secondRandomizedObject[index] :
                    randomizedInput.firstRandomizedObject[(index + 1) % randomizedInput.firstRandomizedObject.length];

                const relationshipSymbol = relationshipType === '' ? '⇎' : relationshipType;
                elem.textContent = `${item}   ${relationshipSymbol}   ${nextChainedItem}`;
            }

            // * Apply different colors per two lines
            elem.style.color = index % 2 === 0 ? '#E1E1E1' : '#8E8E8E';

            // * Adding dataset attributes for potential future manipulation (NOT NECESSARY FOR NOW)
            elem.dataset.itemSet = isSecondSet ? 'secondary' : 'primary';
            elem.dataset.originalIndex = index;

            return elem;
        };

        // * Creating a fragment to make DOM manipulation less painful
        const fragment = document.createDocumentFragment();

        // * Creating a header for better readability
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('randomized-header-container');
        const header = document.createElement('h2');
        header.textContent = 'Randomized Objects';
        headerDiv.appendChild(header);
        fragment.appendChild(headerDiv);


        // * Creating a general div for the two randomized objects
        const mainObjectContainer = document.createElement('div');
        mainObjectContainer.classList.add('main-object-container');

        // * Displaying First Object
        const firstObjectContainer = document.createElement('div');
        firstObjectContainer.classList.add('display-objects', 'primary-objects');
        randomizedInput.firstRandomizedObject.forEach((item, index) => {
            firstObjectContainer.appendChild(createItemElement(item, index));
        });
        mainObjectContainer.appendChild(firstObjectContainer);

        // * Displaying Second Object (IF IT EXISTS)
        if (optionTwoToggle && randomizedInput.secondRandomizedObject.length) {
            const secondObjectContainer = document.createElement('div');
            secondObjectContainer.classList.add('display-objects', 'secondary-objects');
            randomizedInput.secondRandomizedObject.forEach((item, index) => {
                secondObjectContainer.appendChild(createItemElement(item, index, true));
            });
            mainObjectContainer.appendChild(secondObjectContainer);
        }

        fragment.appendChild(mainObjectContainer);


        // * Add a final message that will direct the user
        const randMessageHTML = `
            <div class="randomize-message-container">
                <p class="randomize-message">
                If you would like to randomize again click on the <strong>Next</strong> button. 
                <br>
                You can store new items again if necessary.
                <br><br>
                <strong>NOTE:</strong> Make sure to screenshot this result before randomizing again because it won't be saved.
                </p>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = randMessageHTML;
        const messageDiv = tempDiv.firstElementChild;

        fragment.appendChild(messageDiv);

        // * Store everything created in the fragment in the parent container
        outputContainer.appendChild(fragment);


        // * Remove the relationship section from the UI
        const relationshipSection = document.querySelector('.randomize-container-two');
        if (relationshipSection) {
            relationshipSection.classList.add('hidden');
        }

        // * Insert the randomization display in the UI
        const existingDisplay = document.querySelector('.display-randomization');
        const randomizeContainer = document.querySelector('.randomize-container');
        if (existingDisplay) existingDisplay.remove();
        randomizeContainer.appendChild(outputContainer);


        // * Remove second container for the specific condition of...
        const secondaryObject = document.querySelector('.secondary-objects');
        if(secondaryObject) secondaryObject.classList.remove('disabled');
        if(pairsButtonToggle && optionTwoToggle) {
            secondaryObject.classList.add('disabled');
        }
    };


    // * Accessing the randomize button through event delegation
    const nextButton = document.querySelector('.next-button');
    document.addEventListener('click', (event) => {
        if (event.target.closest('.randomize-button')) {
            event.preventDefault();

            nextButton.classList.remove('disabled');
            handleRandomizationDisplay();
        }
    });
};



// TODO Initialize alert state each time a new input is provided
// ! Doesn't work. Left here for a future fix
const createInputListeners = function() {
    const inputListener = document.querySelectorAll('.item-accepter');
    inputListener.forEach(input => {
        input.addEventListener('input', () => {
            alertState.shown = false;
            alertState.lastLengths = { first: 0, second: 0 };
        });
    });
};



// TODO Chaos animation implementation
const createEventHandler = function() {
    let isInProgress = false;

    return function handleHoverEvent (e) {
        if (isInProgress) {
            return;
        }

        const text = e.target.innerHTML;
        const chaoticText = text.split('').map(getRandomCharacters).join('');

        for (let i = 0; i < text.length; i++) {
            isInProgress = true;

            setTimeout(()=> {
                const nextIndex = i + 1;
                e.target.innerHTML = `${text.substring(0, nextIndex)}${chaoticText.substring(nextIndex)}`;

                if (nextIndex === text.length) {
                    isInProgress = false;
                }
            }, i * 70);
        }
    };
};



// TODO Randomize the chaos animation text 
const getRandomCharacters = function() {
    const randomIndex = Math.floor(Math.random() * chaosCharacters.length);
    return chaosCharacters[randomIndex];
};
// !-----------------------------------------------------------------------------------------------------------------------------------


// !EVENT LISTENERS
// TODO Create ease animation when the option for Randomizing occurs when the 'Get Started' button is clicked
starterButton.addEventListener('click', () => {
    console.log('Starter button is clicked');
    optionContainer.classList.add('activated');

    starterContainer.classList.add('hidden');
    setTimeout(() => {
        starterContainer.style.display = 'none';
    }, 500);
});


// TODO Create the operation interface for randomizing one object
optionOneButton.addEventListener('click', function () {
    optionOneToggle = 1;
    randomizeOption();
});


// TODO Create the operation interface for randomizing two objects
optionTwoButton.addEventListener('click', function () {
    optionTwoToggle = 1;
    randomizeOption();
});


// TODO Control button styles for relationship type buttons using toggles and the relationshipButtonStyle function
operationContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('none-button')) {
        const relationshipAccepter = document.querySelector('.relationship-accepter');
        relationshipAccepter.classList.add('disabled');

        noneButtonToggle= 1;
        pairsButtonToggle = chainButtonToggle = 0;
        relationshipButtonsStyle(event.target);
    }

    if (event.target.classList.contains('pairs-button')) {
        const relationshipAccepter = document.querySelector('.relationship-accepter');
        relationshipAccepter.classList.remove('disabled');

        pairsButtonToggle = 1;
        noneButtonToggle = chainButtonToggle = 0;
        relationshipButtonsStyle(event.target);
    }

    if (event.target.classList.contains('chain-button')) {
        const relationshipAccepter = document.querySelector('.relationship-accepter');
        relationshipAccepter.classList.remove('disabled');

        chainButtonToggle = 1;
        noneButtonToggle = pairsButtonToggle = 0;
        relationshipButtonsStyle(event.target);
    }
});


// TODO Reset the page when New Randomization is clicked
newRandomizeButton.addEventListener('click', function () {
    console.log('New Randomization button is clicked.');
    init();
});


// TODO Initiate animation on mouse hover
hoverEffectSection.forEach(element => {
    const eventHandler = createEventHandler();
    element.addEventListener('mouseover', eventHandler);
});