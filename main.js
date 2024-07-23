window.addEventListener('load', function () {
    // Check if there is a stored active section ID in localStorage
    const activeSectionId = localStorage.getItem('activeSectionId');

    // If there is a stored active section ID, load that section
    if (activeSectionId) {
        loadSection(activeSectionId);
    } else {
        // If no active section is stored, load the calculator by default
        loadCalculator();
    }
});

// Function to load a specific section by its ID
function loadSection(sectionId) {
    // Hide all content sections
    const sections = ['all-calculators', 'page1-content', 'page2-content', 'page3-content'];
    sections.forEach(function (section) {
        document.getElementById(section).style.display = 'none';
    });

    // Show the specified section
    const currentSection = document.getElementById(sectionId);
    if (currentSection) {
        currentSection.style.display = 'block';
        console.log('Displaying section:', sectionId); // Debugging line

        // Focus on the first input with the class 'autofocusFirst'
        const autofocusElement = currentSection.querySelector('.autofocusFirst');
        if (autofocusElement) {
            autofocusElement.focus();
        }

        // Store the active section ID in localStorage
        localStorage.setItem('activeSectionId', sectionId);
        console.log('Section ID stored:', sectionId); // Debugging line
    } else {
        // Fallback to default section if the provided ID is invalid
        loadCalculator();
    }
}

// Function to load the calculator content
function loadCalculator() {
    loadSection('all-calculators');
}

// Function to load Page 1 content
function loadPage1() {
    loadSection('page1-content');
}

// Function to load Page 2 content
function loadPage2() {
    loadSection('page2-content');
}

// Function to load Page 3 content
function loadPage3() {
    loadSection('page3-content');
}

//loading content ends here


//alpha calculator

document.getElementById("pricingCalculator").addEventListener("submit", function (event) {
    event.preventDefault();

    const unitPrice = parseFloat(document.getElementById("unitPriceAlpha").value);
    const codeInput = document.getElementById("codeAlpha").value;
    const codeToPercentage = {
        'p': 50,
        'q': 55,
        'r': 60,
        's': 65,
        't': 70,
        'u': 75,
        'v': 80,
        'w': 85,
        'x': 90,
        'y': 95,
        'z': 100,
        'P': 50,
        'Q': 55,
        'R': 60,
        'S': 65,
        'T': 70,
        'U': 75,
        'V': 80,
        'W': 85,
        'X': 90,
        'Y': 95,
        'Z': 100,
    };

    if (codeInput in codeToPercentage) {
        const percentage = codeToPercentage[codeInput];
        const pricing = (percentage / 100) * unitPrice;
        const resultElement = document.getElementById("resultAlpha");
        resultElement.textContent = `$ ${pricing.toFixed(3)}`;
        resultElement.style.display = "block"; // Show the result
    } else {
        const resultElement = document.getElementById("resultAlpha");
        resultElement.textContent = "Invalid code. Please enter a valid code (p, q, r, s, t, u, v, w, x, y, z or P, Q, R, S, T, U, V, W, X, Y, Z).";
        resultElement.style.display = "none"; // Hide the result
    }
});

// Function to clear the form fields for the Alpha Calculator
function clearFormAlpha() {
    document.getElementById("unitPriceAlpha").value = "";
    document.getElementById("codeAlpha").value = "";
    document.getElementById("resultAlpha").style.display = "none";
}

//alpha calculator

//belpromo calculator
document.getElementById("belpricingCalculator").addEventListener("submit", function (event) {
    event.preventDefault();

    const unitPriceBel = parseFloat(document.getElementById("unitPriceBel").value);

    // Calculate the result using the formula: (60% of unitPrice) - (10% of (60% of unitPrice))
    const resultBel = (0.60 * unitPriceBel) - (0.10 * (0.60 * unitPriceBel));

    const resultElementBel = document.getElementById("resultBel");
    resultElementBel.textContent = `Result: $${resultBel.toFixed(4)}`;
    resultElementBel.style.display = "block"; // Show the result
});

// Function to clear the form fields for the BelPromo Calculator
function clearFormBel() {
    document.getElementById("unitPriceBel").value = "";
    document.getElementById("resultBel").style.display = "none";
}
//belpromo calculator


//goldstar calculator
document.getElementById("goldpricingCalculator").addEventListener("submit", function (event) {
    event.preventDefault();

    const unitPriceGol = parseFloat(document.getElementById("unitPriceGol").value);

    // Calculate the result for Goldstar Pricing (using 5% instead of 10%)
    const resultGol = (0.60 * unitPriceGol) - (0.05 * (unitPriceGol * 0.6)); // 5% of the unit price

    const resultElementGol = document.getElementById("resultGol");
    resultElementGol.textContent = `Result: $${resultGol.toFixed(4)}`;
    resultElementGol.style.display = "block"; // Show the result
});

// Function to clear the form fields for the Goldstar Calculator
function clearFormGol() {
    document.getElementById("unitPriceGol").value = "";
    document.getElementById("resultGol").style.display = "none";
}
//goldstar calculator


//description generator
// Function to generate the description
function generateDescription() {
    // Get user input
    const userInput = document.getElementById('itemCode').value;

    // Split the user input using the pipe character (|) as the separator
    const parts = userInput.split('|');

    if (parts.length === 2) {
        // Extract the item code and small description
        const itemCode = parts[1].trim();
        const smallDescription = parts[0].trim();

        // Get other user inputs
        const materialColor = document.getElementById('materialColor').value;
        const imprintColor = document.getElementById('imprintColor').value;

        // Get the selected radio button value
        const optionalItem = document.querySelector('input[name="optionalItems"]:checked');
        const optionalItemValue = optionalItem ? optionalItem.value : '';

        // Generate the description based on user inputs and the selected radio button value
        const description = `${itemCode}, ${smallDescription}, Material Color: ${materialColor}, Imprint Color: ${imprintColor}, ${optionalItemValue}, art per client file.`;

        // Load the generated description into the input field
        const generateDescField = document.getElementById('generateDesc');
        generateDescField.value = description;

        // Auto-focus on the generated description input field
        generateDescField.focus();
        generateDescField.select();
    } else {
        // Invalid input format
        document.getElementById('generateDesc').value = 'Invalid input format. Please use "Small Description | Item Code" format.';
    }
}

// Function to clear the form
function clearForm() {
    document.getElementById('itemCode').value = '';
    document.getElementById('materialColor').value = '';
    document.getElementById('imprintColor').value = '';
    document.getElementById('generateDesc').value = '';
}

// Add event listeners to the form
document.getElementById('descGenerator').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting
    generateDescription(); // Call the generateDescription function
});

document.getElementById('descGenerator').addEventListener('reset', function () {
    clearForm(); // Call the clearForm function when the form is reset
});

//description generator

// URL of your deployed Google Apps Script web app
const scriptURL = 'https://script.google.com/macros/s/AKfycbxPi4cnkcZkwIr-UgoAPkg8akySSb7efwWuzrgt7RgqCk4guafYg1vulQ97JZAOyfn44Q/exec';

// Fetch the current visitor count
fetch(scriptURL + '?action=getCount')
    .then(response => response.text())
    .then(count => {
        document.getElementById('visitCount').textContent = count;
    });

// Increment the visitor count
fetch(scriptURL)
    .then(response => response.text())
    .then(count => {
        document.getElementById('visitCount').textContent = count;
    });


document.getElementById('open-modal-btn').addEventListener('click', function () {
    document.getElementById('feedback-modal').style.display = 'block';
});

document.getElementsByClassName('close-btn')[0].addEventListener('click', function () {
    document.getElementById('feedback-modal').style.display = 'none';
});

window.addEventListener('click', function (event) {
    if (event.target == document.getElementById('feedback-modal')) {
        document.getElementById('feedback-modal').style.display = 'none';
    }
});