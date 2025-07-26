// User-facing feedback.js: Show feedbacks and admin responses, but no admin controls
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

const sanitizeInput = str => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};
const truncateText = (text, maxLength) => text.length <= maxLength ? text : text.slice(0, maxLength) + '...';

document.addEventListener('DOMContentLoaded', () => {
    const feedbackList = document.getElementById('feedback-list');
    const loadMoreBtn = document.getElementById('load-more-feedback');
    const spinner = document.getElementById('feedback-loading-spinner');
    const paginationInfo = document.getElementById('pagination-info');
    const FEEDBACKS_PER_PAGE = 6;
    let feedbackDocs = [];
    let currentPage = 0;
    let isLoading = false;
    
    // Get feedback ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const targetFeedbackId = urlParams.get('feedback');

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

    function renderFeedbackPage() {
        if (currentPage === 0) feedbackList.innerHTML = '';
        isLoading = true;
        spinner.style.display = '';
        loadMoreBtn.disabled = true;
        const start = currentPage * FEEDBACKS_PER_PAGE;
        const end = start + FEEDBACKS_PER_PAGE;
        const pageGroups = groupNames.slice(start, end);
        let openGroup = null;
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
                
                // Check if this is the target feedback
                const isTargetFeedback = targetFeedbackId && feedbackId === targetFeedbackId;
                
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
                if (isTargetFeedback) {
                    item.classList.add('target-feedback');
                    item.style.border = '2px solid #4361ee';
                    item.style.boxShadow = '0 4px 20px rgba(67, 97, 238, 0.3)';
                }
                item.innerHTML = `
                    <div class="user-feedback-message">${sanitizeInput(data.message)}</div>
                    <div class="user-feedback-timestamp">${data.timestamp?.toDate?.().toLocaleString?.() || ''}</div>
                `;
                if (hasResponses) {
                    responsesArr.forEach(html => item.insertAdjacentHTML('beforeend', html));
                } else {
                    item.insertAdjacentHTML('beforeend', `<div class="feedback-no-response">No response yet</div>`);
                }
                feedbackListDiv.appendChild(item);
                
                            // If this is the target feedback, expand the accordion and scroll to it
            if (isTargetFeedback) {
                console.log('Target feedback found, expanding and scrolling...');
                // Expand the accordion
                groupCard.setAttribute('aria-expanded', 'true');
                header.setAttribute('aria-expanded', 'true');
                feedbackListDiv.style.display = '';
                
                // Scroll to the feedback item after a short delay
                setTimeout(() => {
                    try {
                        item.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        
                        // Add a highlight animation
                        item.style.animation = 'highlightFeedback 2s ease-in-out';
                        
                        console.log('Successfully scrolled to target feedback');
                    } catch (error) {
                        console.error('Error scrolling to target feedback:', error);
                    }
                }, 500);
            }
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
        
        // Check if target feedback was found
        if (targetFeedbackId) {
            const targetFound = document.querySelector('.target-feedback');
            if (!targetFound) {
                console.log('Target feedback not found on current page, checking if it exists...');
                // Could implement pagination to find the target feedback
                // For now, just log that it wasn't found
            }
        }
        
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

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    }

    loadMoreBtn.addEventListener('click', () => {
        if (isLoading) return;
        currentPage++;
        renderFeedbackPage();
        loadMoreBtn.focus();
    });

    // Grouping state
    let feedbackGroups = {};
    let groupNames = [];

    fetchFeedbacks();
}); 