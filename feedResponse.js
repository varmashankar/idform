import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCXtLxW6LEOo4OxCDBfuIlZIT7BFNtTKHM",
    authDomain: "idform-chat.firebaseapp.com",
    projectId: "idform-chat",
    storageBucket: "idform-chat.appspot.com",
    messagingSenderId: "378363039414",
    appId: "1:378363039414:web:66adab2ba8c3af9a24e017",
    measurementId: "G-3YWEBZH9T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', function () {
    // Function to display feedback and responses
    async function displayFeedback() {
        const feedbackContainer = document.getElementById('feedback-list');
        feedbackContainer.innerHTML = ''; // Clear existing content
    
        try {
            // Query to get feedback documents, ordered by timestamp
            const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
            const feedbackQuerySnapshot = await getDocs(feedbackQuery);
    
            // Loop through the sorted feedback documents
            feedbackQuerySnapshot.forEach((feedbackDoc) => {
                const feedbackData = feedbackDoc.data();
                const feedbackId = feedbackDoc.id;
    
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('col');
    
                feedbackItem.innerHTML = `
                    <div class="h-100 d-flex flex-column">
                        <div class="card-body d-flex flex-column">
                            <div class="feedback-data">    
                                <div class="d-flex align-items-center mb-3">
                                    <img src="img/profile-pic.jpg" class="rounded-circle me-3" alt="Profile Picture" style="width: 50px; height: 50px;">
                                    <div>
                                        <h5 class="card-title mb-1">${feedbackData.name}</h5>
                                        <small class="text-muted">${feedbackData.timestamp.toDate().toLocaleString()}</small>
                                    </div>
                                </div>
                                <hr/>
                                <p class="card-text feed-data">${feedbackData.message}</p>
                            </div>
                            <div id="responses-${feedbackId}" class="response-data flex-grow-1">
                                <em>Loading responses...</em>
                            </div>
                        </div>
                    </div>
                `;
    
                feedbackContainer.appendChild(feedbackItem);
    
                // Fetch and display responses for this feedback
                displayResponses(feedbackId);
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    }
    

    window.displayResponses = async function (feedbackId) {
        const responsesContainer = document.getElementById(`responses-${feedbackId}`);
        responsesContainer.innerHTML = ''; // Clear existing content

        try {
            const responsesQuery = query(collection(db, 'responses'), where('feedbackId', '==', feedbackId));
            const responsesQuerySnapshot = await getDocs(responsesQuery);

            let hasResponses = false;

            responsesQuerySnapshot.forEach((responseDoc) => {
                hasResponses = true;
                const responseData = responseDoc.data();

                const responseElement = document.createElement('div');
                responseElement.classList.add('card', 'h-100', 'd-flex', 'flex-column', 'mb-3', 'border-0', 'response-data');

                responseElement.innerHTML = `
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex align-items-start mb-3">
                                <img src="img/shankar.jpg" class="rounded-circle me-3" alt="Admin Profile Picture" style="width: 50px; height: 50px;">
                                <div>
                                    <h5 class="card-title mb-1">Shankar Varma</h5>
                                    <small class="text-muted">${responseData.timestamp.toDate().toLocaleString()}</small>
                                </div>
                            </div>
                            <hr/>
                            <p class="card-text text-dark feed-data"><em>${responseData.responseMessage}</em></p>
                        </div>
                    `;

                responsesContainer.appendChild(responseElement);
            });

            // Display "No responses yet" if no responses are found
            if (!hasResponses) {
                const noResponsesMessage = document.createElement('div');
                noResponsesMessage.classList.add('card', 'h-100', 'd-flex', 'flex-column', 'mb-3', 'border-0', 'response-data');
                noResponsesMessage.innerHTML = `
                        <div class="card-body d-flex flex-column align-items-center justify-content-center">
                            <p class="text-muted mb-0">No response yet.</p>
                        </div>
                    `;
                responsesContainer.appendChild(noResponsesMessage);
            }


        } catch (error) {
            console.error('Error fetching responses:', error);
        }
    }


    // Initial call to display feedback
    displayFeedback();
});
