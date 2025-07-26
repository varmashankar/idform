// =========================
// Section: Firebase Setup (Compat)
// =========================
const firebaseConfig = {
    apiKey: "AIzaSyCXtLxW6LEOo4OxCDBfuIlZIT7BFNtTKHM",
    authDomain: "idform-chat.firebaseapp.com",
    projectId: "idform-chat",
    storageBucket: "idform-chat.appspot.com",
    messagingSenderId: "378363039414",
    appId: "1:378363039414:web:66adab2ba8c3af9a24e017",
    measurementId: "G-3YWEBZH9T3"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =========================
// Utility Functions
// =========================
const sanitizeInput = str => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};
const truncateText = (text, maxLength) => text.length <= maxLength ? text : text.slice(0, maxLength) + '...';

// =========================
// Feedback Table Logic
// =========================
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const feedbackList = document.getElementById('feedback-list');
    const loadMoreBtn = document.getElementById('load-more-feedback');
    const spinner = document.getElementById('feedback-loading-spinner');
    const paginationInfo = document.getElementById('pagination-info');
    const FEEDBACKS_PER_PAGE = 6;
    let feedbackDocs = [];
    let currentPage = 0;
    let isLoading = false;
    let feedbackGroups = {};
    let groupNames = [];

    // Fetch and deduplicate feedbacks
    async function fetchFeedbacks() {
        spinner.style.display = '';
        try {
            const snapshot = await db.collection('feedback').orderBy('timestamp', 'desc').get();
            let docs = [];
            snapshot.forEach(doc => docs.push(doc));
            // Deduplicate by name, message, timestamp
            const seen = new Set();
            feedbackDocs = docs.filter(doc => {
                const d = doc.data();
                const key = d.name + '|' + d.message + '|' + (d.timestamp?.toDate?.().toISOString?.() || '');
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            // Group by name
            feedbackGroups = {};
            feedbackDocs.forEach(doc => {
                const d = doc.data();
                const name = d.name || 'Unknown';
                if (!feedbackGroups[name]) feedbackGroups[name] = [];
                feedbackGroups[name].push(doc);
            });
            groupNames = Object.keys(feedbackGroups);
            currentPage = 0;
            renderFeedbackPage();
        } catch (error) {
            feedbackList.innerHTML = '<div class="text-danger text-center">Error loading feedback.</div>';
            spinner.style.display = 'none';
            isLoading = false;
            console.error('Error fetching feedback:', error);
        }
    }

    // Render feedbacks for current page
    function renderFeedbackPage() {
        if (currentPage === 0) feedbackList.innerHTML = '';
        isLoading = true;
        spinner.style.display = '';
        loadMoreBtn.disabled = true;
        const start = currentPage * FEEDBACKS_PER_PAGE;
        const end = start + FEEDBACKS_PER_PAGE;
        const pageGroups = groupNames.slice(start, end);
        feedbackList.innerHTML = '';
        pageGroups.forEach((name, idx) => {
            const group = feedbackGroups[name];
            // Accordion card
            const groupCard = document.createElement('div');
            groupCard.className = 'user-group-card';
            groupCard.setAttribute('aria-expanded', 'false');
            // Header
            const header = document.createElement('div');
            header.className = 'user-group-header';
            header.tabIndex = 0;
            header.setAttribute('role', 'button');
            header.setAttribute('aria-controls', `group-list-${start+idx}`);
            header.setAttribute('aria-expanded', 'false');
            header.innerHTML = `
                <div class="user-avatar-lg">${getInitials(name)}</div>
                <div class="user-group-name">${sanitizeInput(name)}</div>
                <div class="user-feedback-count">${group.length} Feedback${group.length>1?'s':''}</div>
                <span class="accordion-arrow"><i class="fas fa-chevron-right"></i></span>
            `;
            // Feedback list (timeline)
            const feedbackListDiv = document.createElement('div');
            feedbackListDiv.className = 'user-feedback-list';
            feedbackListDiv.id = `group-list-${start+idx}`;
            feedbackListDiv.style.display = 'none';
            // Render all feedbacks for this user
            group.forEach(async feedbackDoc => {
                const data = feedbackDoc.data();
                const feedbackId = feedbackDoc.id;
                // Fetch responses for this feedback
                let hasResponses = false;
                let responsesArr = [];
                try {
                    const respSnap = await db.collection('responses').where('feedbackId', '==', feedbackId).get();
                    respSnap.forEach(responseDoc => {
                        hasResponses = true;
                        const r = responseDoc.data();
                        responsesArr.push(
                            `<div class='admin-response-card'><span class='admin-badge'><i class='fas fa-user-shield'></i> Admin</span> <span title='${sanitizeInput(r.responseMessage)}'>${truncateText(sanitizeInput(r.responseMessage), 180)}</span><div class='feedback-timestamp'>${r.timestamp?.toDate?.().toLocaleString?.() || ''}</div></div>`
                        );
                    });
                } catch (error) {
                    responsesArr.push('<div class="text-danger">Error loading responses.</div>');
                }
                // Feedback timeline item
                const item = document.createElement('div');
                item.className = 'user-feedback-item';
                item.innerHTML = `
                    <div class="user-feedback-message">${sanitizeInput(data.message)}</div>
                    <div class="user-feedback-timestamp">${data.timestamp?.toDate?.().toLocaleString?.() || ''}</div>
                `;
                if (hasResponses) {
                    responsesArr.forEach(html => item.insertAdjacentHTML('beforeend', html));
                } else {
                    item.insertAdjacentHTML('beforeend', `<div class="feedback-no-response">No response yet</div>`);
                    item.appendChild(createAddResponseBtn(feedbackId));
                }
                feedbackListDiv.appendChild(item);
            });
            // Accordion logic
            header.addEventListener('click', () => {
                const expanded = groupCard.getAttribute('aria-expanded') === 'true';
                // Close all others
                document.querySelectorAll('.user-group-card[aria-expanded="true"]').forEach(card => {
                    card.setAttribute('aria-expanded', 'false');
                    card.querySelector('.user-group-header').setAttribute('aria-expanded', 'false');
                    card.querySelector('.user-feedback-list').style.display = 'none';
                });
                if (!expanded) {
                    groupCard.setAttribute('aria-expanded', 'true');
                    header.setAttribute('aria-expanded', 'true');
                    feedbackListDiv.style.display = '';
                } else {
                    groupCard.setAttribute('aria-expanded', 'false');
                    header.setAttribute('aria-expanded', 'false');
                    feedbackListDiv.style.display = 'none';
                }
            });
            header.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') header.click();
            });
            groupCard.appendChild(header);
            groupCard.appendChild(feedbackListDiv);
            feedbackList.appendChild(groupCard);
        });
        spinner.style.display = 'none';
        isLoading = false;
        // Pagination info
        const total = groupNames.length;
        const page = currentPage + 1;
        const totalPages = Math.ceil(total / FEEDBACKS_PER_PAGE);
        paginationInfo.textContent = `Page ${page} of ${totalPages} (${total} user${total !== 1 ? 's' : ''})`;
        // Show or hide the Load More button
        if (end < groupNames.length) {
            loadMoreBtn.style.display = '';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Create a table cell with truncation and show more/less
    function createCell(text, maxLength) {
        const cell = document.createElement('td');
        if (text.length <= maxLength) {
            cell.textContent = text;
        } else {
            const shortText = text.slice(0, maxLength) + '...';
            const span = document.createElement('span');
            span.textContent = shortText;
            span.setAttribute('title', text);
            const toggle = document.createElement('button');
            toggle.className = 'show-more-toggle';
            toggle.type = 'button';
            toggle.setAttribute('aria-label', 'Show more');
            toggle.textContent = 'Show More';
            let expanded = false;
            toggle.onclick = () => {
                expanded = !expanded;
                span.textContent = expanded ? text : shortText;
                toggle.textContent = expanded ? 'Show Less' : 'Show More';
            };
            cell.appendChild(span);
            cell.appendChild(document.createTextNode(' '));
            cell.appendChild(toggle);
        }
        return cell;
    }

    // Create Add Response button
    function createAddResponseBtn(feedbackId) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-success add-response-btn';
        btn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Response';
        btn.type = 'button';
        btn.onclick = () => {
            document.getElementById('response-feedback-id').value = feedbackId;
            document.getElementById('response-message').value = '';
            document.getElementById('response-success-msg').style.display = 'none';
            const modal = new bootstrap.Modal(document.getElementById('addResponseModal'));
            modal.show();
            setTimeout(() => document.getElementById('response-message').focus(), 350);
        };
        return btn;
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    }

    // Pagination
    loadMoreBtn.addEventListener('click', () => {
        if (isLoading) return;
        currentPage++;
        renderFeedbackPage();
        loadMoreBtn.focus();
    });

    // Add Response Form Submission
    const addResponseForm = document.getElementById('add-response-form');
    if (addResponseForm) {
        addResponseForm.addEventListener('submit', async e => {
            e.preventDefault();
            const feedbackId = document.getElementById('response-feedback-id').value;
            const responseMessage = document.getElementById('response-message').value.trim();
            if (!feedbackId || !responseMessage) return;
            
            try {
                // Get feedback details for notification
                const feedbackDoc = await db.collection('feedback').doc(feedbackId).get();
                if (!feedbackDoc.exists) {
                    throw new Error('Feedback not found');
                }
                
                const feedbackData = feedbackDoc.data();
                
                // Add response to database
                const responseRef = await db.collection('responses').add({
                    feedbackId,
                    responseMessage,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    adminName: 'Admin', // You can customize this
                    feedbackUserName: feedbackData.name // Store user name for reference
                });
                
                // Show success message
                document.getElementById('response-success-msg').textContent = 'Response added successfully! User will be notified.';
                document.getElementById('response-success-msg').style.display = '';
                
                // Close modal and refresh
                setTimeout(() => {
                    const modalEl = document.getElementById('addResponseModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    fetchFeedbacks();
                }, 1500);
                
                // Optional: Send email notification (if you have email service)
                // await sendEmailNotification(feedbackData.name, feedbackData.message, responseMessage);
                
            } catch (err) {
                console.error('Error adding response:', err);
                document.getElementById('response-success-msg').textContent = 'Error adding response: ' + err.message;
                document.getElementById('response-success-msg').style.display = '';
            }
        });
    }

    // Initial fetch
    fetchFeedbacks();
});

// =========================
// Optional: Email Notification System
// =========================
// This is an optional feature that you can implement if you want to send email notifications
// You'll need to set up an email service (like SendGrid, Mailgun, or Firebase Functions)

async function sendEmailNotification(userName, feedbackMessage, responseMessage) {
    try {
        // This is a placeholder for email notification
        // You can implement this using:
        // 1. Firebase Functions with SendGrid
        // 2. Firebase Functions with Mailgun
        // 3. Direct API calls to email services
        
        console.log('Email notification would be sent to:', {
            userName,
            feedbackMessage: feedbackMessage.substring(0, 100) + '...',
            responseMessage: responseMessage.substring(0, 100) + '...'
        });
        
        // Example implementation with Firebase Functions:
        /*
        const functions = firebase.functions();
        const sendEmail = functions.httpsCallable('sendEmailNotification');
        
        await sendEmail({
            to: userEmail, // You'd need to collect user email
            subject: 'Admin Response to Your Feedback',
            userName: userName,
            feedbackMessage: feedbackMessage,
            responseMessage: responseMessage
        });
        */
        
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

// =========================
// Optional: Push Notification System
// =========================
// This is for implementing push notifications using Firebase Cloud Messaging (FCM)
// You'll need to set up FCM in your Firebase project

async function sendPushNotification(userToken, notificationData) {
    try {
        // This is a placeholder for push notifications
        // You can implement this using Firebase Cloud Messaging (FCM)
        
        console.log('Push notification would be sent to:', {
            userToken: userToken ? 'Token available' : 'No token',
            notificationData
        });
        
        // Example implementation with Firebase Functions:
        /*
        const functions = firebase.functions();
        const sendPushNotification = functions.httpsCallable('sendPushNotification');
        
        await sendPushNotification({
            token: userToken,
            title: 'Admin Response Received',
            body: `Admin has responded to your feedback: "${notificationData.feedbackMessage.substring(0, 50)}..."`,
            data: {
                feedbackId: notificationData.feedbackId,
                responseId: notificationData.responseId
            }
        });
        */
        
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
