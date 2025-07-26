// =========================
// Section: Firebase Configuration with Environment Variables
// =========================

// Function to get Firebase configuration from environment variables or fallback
function getFirebaseConfig() {
    // Check for environment variables first (for production)
    if (typeof process !== 'undefined' && process.env) {
        return {
            apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCXtLxW6LEOo4OxCDBfuIlZIT7BFNtTKHM",
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || "idform-chat.firebaseapp.com",
            projectId: process.env.FIREBASE_PROJECT_ID || "idform-chat",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "idform-chat.appspot.com",
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "378363039414",
            appId: process.env.FIREBASE_APP_ID || "1:378363039414:web:66adab2ba8c3af9a24e017",
            measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-3YWEBZH9T3"
        };
    }
    
    // Fallback configuration for development
    return {
        apiKey: "AIzaSyCXtLxW6LEOo4OxCDBfuIlZIT7BFNtTKHM",
        authDomain: "idform-chat.firebaseapp.com",
        projectId: "idform-chat",
        storageBucket: "idform-chat.appspot.com",
        messagingSenderId: "378363039414",
        appId: "1:378363039414:web:66adab2ba8c3af9a24e017",
        measurementId: "G-3YWEBZH9T3"
    };
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase immediately
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// =========================
// Section: User Fingerprinting System
// =========================

// Generate a unique browser fingerprint
function generateBrowserFingerprint() {
    try {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.languages?.join(','),
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            navigator.platform,
            navigator.cookieEnabled,
            navigator.doNotTrack,
            navigator.maxTouchPoints,
            'ontouchstart' in window,
            'ondeviceorientation' in window,
            'ondevicemotion' in window
        ];
        
        // Create a hash from the components
        const fingerprint = components.join('|');
        const hash = simpleHash(fingerprint);
        
        console.log('Generated browser fingerprint:', hash);
        return hash;
    } catch (error) {
        console.error('Error generating fingerprint:', error);
        return 'unknown-' + Date.now();
    }
}

// Simple hash function
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

// Get or create user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
        userId = generateBrowserFingerprint();
        localStorage.setItem('userId', userId);
        console.log('Created new user ID:', userId);
    }
    
    return userId;
}

// Get user identifier (combination of username and fingerprint)
function getUserIdentifier() {
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    const username = localStorage.getItem('username') || userName; // Use set username or fallback to name
    const userId = getUserId();
    
    if (username) {
        return `${username}_${userId}`;
    }
    
    return userId;
}

// Get display name (username or name from feedback)
function getDisplayName() {
    const username = localStorage.getItem('username');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    
    return username || userName || null;
}

// =========================
// Section: Global Test Functions
// =========================

// Store user name when feedback is submitted
function storeUserName(name) {
    localStorage.setItem('userName', name);
    sessionStorage.setItem('userName', name);
    
    // Also store the user identifier
    const userIdentifier = getUserIdentifier();
    localStorage.setItem('userIdentifier', userIdentifier);
    
    console.log('Stored user name and identifier:', name, userIdentifier);
}

// Set username for fingerprinting system
function setUsername(username) {
    if (username && username.trim()) {
        localStorage.setItem('username', username.trim());
        
        // Update user identifier
        const userIdentifier = getUserIdentifier();
        localStorage.setItem('userIdentifier', userIdentifier);
        
        // Update button text
        updateUsernameButton();
        
        console.log('Username set:', username.trim());
        console.log('New user identifier:', userIdentifier);
        
        return true;
    }
    return false;
}

// Clear username
function clearUsername() {
    localStorage.removeItem('username');
    
    // Update user identifier
    const userIdentifier = getUserIdentifier();
    localStorage.setItem('userIdentifier', userIdentifier);
    
    // Update button text
    updateUsernameButton();
    
    console.log('Username cleared');
    console.log('New user identifier:', userIdentifier);
}

// Update username button text
function updateUsernameButton() {
    const usernameBtn = document.getElementById('open-username-modal-btn');
    const usernameBtnText = document.getElementById('username-btn-text');
    const currentUsername = localStorage.getItem('username');
    if (usernameBtn && usernameBtnText) {
        if (currentUsername) {
            usernameBtnText.innerHTML = `<i class='fas fa-user-check me-2'></i> @${currentUsername}`;
            usernameBtn.title = `Current username: ${currentUsername}`;
            usernameBtn.setAttribute('aria-label', `Change username (current: ${currentUsername})`);
            usernameBtn.classList.add('username-set');
        } else {
            usernameBtnText.innerHTML = `<i class='fas fa-user-circle me-2'></i> Set Username`;
            usernameBtn.title = 'Set a username for better identification';
            usernameBtn.setAttribute('aria-label', 'Set username');
            usernameBtn.classList.remove('username-set');
        }
    }
}

// Test notification function (for development/testing)
function testNotification() {
    console.log('Testing notification system...');
    
    if (!window.notificationSystem) {
        console.error('Notification system not created yet');
        return;
    }
    
    if (!window.notificationSystem.isInitialized) {
        console.error('Notification system not initialized yet');
        return;
    }
    
    const testNotification = {
        id: 'test-' + Date.now(),
        type: 'response',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        responseMessage: 'Test response message',
        feedbackMessage: 'Test feedback message',
        timestamp: new Date(),
        read: false,
        feedbackId: 'test-feedback-id'
    };
    
    window.notificationSystem.addNotification(testNotification);
    console.log('Test notification added successfully');
}

// Test Firebase connection
function testFirebaseConnection() {
    console.log('Testing Firebase connection...');
    if (typeof db !== 'undefined') {
        console.log('Firebase db object found:', db);
        // Try a simple query
        db.collection('feedback').limit(1).get()
            .then(snapshot => {
                console.log('Firebase connection successful, found', snapshot.size, 'feedback documents');
            })
            .catch(error => {
                console.error('Firebase connection failed:', error);
            });
    } else {
        console.error('Firebase db object not found');
    }
}

// Manual notification trigger for testing
function triggerNotificationForUser(userName, feedbackId, responseMessage) {
    console.log('Manually triggering notification for user:', userName);
    
    if (!window.notificationSystem || !window.notificationSystem.isInitialized) {
        console.error('Notification system not ready');
        return;
    }
    
    const notification = {
        id: 'manual-' + Date.now(),
        type: 'response',
        title: 'Admin Response Received',
        message: `Admin has responded to your feedback`,
        responseMessage: responseMessage,
        feedbackMessage: 'Your feedback message',
        timestamp: new Date(),
        read: false,
        feedbackId: feedbackId
    };
    
    window.notificationSystem.addNotification(notification);
    console.log('Manual notification triggered successfully');
}

// Debug function to show user-specific storage info
function debugUserStorage() {
    const currentUserName = window.notificationSystem?.getCurrentUserName();
    const userIdentifier = window.notificationSystem?.getCurrentUserIdentifier();
    const userId = window.notificationSystem?.getCurrentUserId();
    
    console.log('=== User Storage Debug ===');
    console.log('Current user name:', currentUserName);
    console.log('User ID (fingerprint):', userId);
    console.log('User identifier:', userIdentifier);
    
    if (userIdentifier) {
        const userKey = `readNotifications_${userIdentifier}`;
        const userData = localStorage.getItem(userKey);
        console.log('User-specific key:', userKey);
        console.log('User-specific data:', userData ? JSON.parse(userData) : 'null');
    }
    
    const lastKnownUserName = localStorage.getItem('lastKnownUserName');
    console.log('Last known user name:', lastKnownUserName);
    
    // Show all localStorage keys related to notifications
    const allKeys = Object.keys(localStorage);
    const notificationKeys = allKeys.filter(key => 
        key.includes('readNotifications') || 
        key.includes('userName') || 
        key.includes('userId') ||
        key.includes('userIdentifier')
    );
    console.log('All notification-related keys:', notificationKeys);
    
    notificationKeys.forEach(key => {
        console.log(`${key}:`, localStorage.getItem(key));
    });
    
    // Show fingerprint components
    console.log('=== Fingerprint Components ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Language:', navigator.language);
    console.log('Screen:', screen.width + 'x' + screen.height);
    console.log('Platform:', navigator.platform);
    console.log('Hardware Concurrency:', navigator.hardwareConcurrency);
}

// Function to clear all user-specific data
function clearAllUserData() {
    const userIdentifier = window.notificationSystem?.getCurrentUserIdentifier();
    const currentUserName = window.notificationSystem?.getCurrentUserName();
    
    if (userIdentifier) {
        const userKey = `readNotifications_${userIdentifier}`;
        localStorage.removeItem(userKey);
        console.log(`Cleared read notifications for user identifier: ${userIdentifier}`);
    }
    
    if (currentUserName) {
        const oldKey = `readNotifications_${currentUserName.toLowerCase().trim()}`;
        localStorage.removeItem(oldKey);
        console.log(`Cleared old format data for user: ${currentUserName}`);
    }
    
    localStorage.removeItem('lastKnownUserName');
    localStorage.removeItem('userIdentifier');
    console.log('Cleared all user-specific data');
}

// Function to regenerate user fingerprint
function regenerateUserFingerprint() {
    localStorage.removeItem('userId');
    const newUserId = getUserId();
    console.log('Regenerated user fingerprint:', newUserId);
    return newUserId;
}

// Function to show fingerprint similarity between browsers
function compareFingerprints() {
    const currentFingerprint = generateBrowserFingerprint();
    console.log('Current browser fingerprint:', currentFingerprint);
    console.log('Stored user ID:', getUserId());
    console.log('User identifier:', getUserIdentifier());
}

// Function to manually migrate all existing feedbacks (admin function)
async function migrateAllExistingFeedbacks() {
    try {
        console.log('Starting migration of all existing feedbacks...');
        
        // Get all feedbacks without userIdentifier
        const feedbackSnapshot = await db.collection('feedback')
            .where('userIdentifier', '==', null)
            .get();
        
        if (feedbackSnapshot.empty) {
            console.log('No feedbacks found that need migration');
            return;
        }
        
        console.log(`Found ${feedbackSnapshot.docs.length} feedbacks to migrate`);
        
        // Group feedbacks by name for batch processing
        const feedbacksByUser = {};
        
        feedbackSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const userName = data.name;
            
            if (!feedbacksByUser[userName]) {
                feedbacksByUser[userName] = [];
            }
            
            feedbacksByUser[userName].push({
                docId: doc.id,
                data: data
            });
        });
        
        console.log('Feedbacks grouped by user:', Object.keys(feedbacksByUser));
        
        // Process each user's feedbacks
        let totalMigrated = 0;
        
        for (const [userName, feedbacks] of Object.entries(feedbacksByUser)) {
            console.log(`Processing ${feedbacks.length} feedbacks for user: ${userName}`);
            
            // Create a user identifier for this user
            const userIdentifier = `${userName}_${generateBrowserFingerprint()}`;
            
            // Update all feedbacks for this user
            const batch = db.batch();
            
            feedbacks.forEach(({ docId, data }) => {
                const feedbackRef = db.collection('feedback').doc(docId);
                batch.update(feedbackRef, {
                    userIdentifier: userIdentifier,
                    migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            totalMigrated += feedbacks.length;
            console.log(`Migrated ${feedbacks.length} feedbacks for ${userName}`);
        }
        
        console.log(`Migration completed! Total feedbacks migrated: ${totalMigrated}`);
        
    } catch (error) {
        console.error('Error migrating all feedbacks:', error);
    }
}

// Function to check migration status
async function checkMigrationStatus() {
    try {
        console.log('Checking migration status...');
        
        // Get total feedbacks
        const totalSnapshot = await db.collection('feedback').get();
        const totalFeedbacks = totalSnapshot.size;
        
        // Get feedbacks with userIdentifier
        const migratedSnapshot = await db.collection('feedback')
            .where('userIdentifier', '!=', null)
            .get();
        const migratedFeedbacks = migratedSnapshot.size;
        
        // Get feedbacks without userIdentifier
        const unmigratedSnapshot = await db.collection('feedback')
            .where('userIdentifier', '==', null)
            .get();
        const unmigratedFeedbacks = unmigratedSnapshot.size;
        
        console.log('=== Migration Status ===');
        console.log(`Total feedbacks: ${totalFeedbacks}`);
        console.log(`Migrated feedbacks: ${migratedFeedbacks}`);
        console.log(`Unmigrated feedbacks: ${unmigratedFeedbacks}`);
        console.log(`Migration progress: ${((migratedFeedbacks / totalFeedbacks) * 100).toFixed(1)}%`);
        
        if (unmigratedFeedbacks > 0) {
            console.log('Some feedbacks still need migration. Run migrateAllExistingFeedbacks() to migrate them.');
        } else {
            console.log('All feedbacks have been migrated!');
        }
        
    } catch (error) {
        console.error('Error checking migration status:', error);
    }
}

// Add test functions to console for easy testing
console.log('To test notifications, run: testNotification()');
console.log('To test Firebase connection, run: testFirebaseConnection()');
console.log('To manually trigger notification, run: triggerNotificationForUser("userName", "feedbackId", "responseMessage")');

document.addEventListener('DOMContentLoaded', function () {

// =========================
// Section: Notification System
// =========================
class NotificationSystem {
    constructor() {
        this.notificationCenter = null;
        this.notifications = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('Initializing notification system...');
            
            // Check for user name changes and migrate data
            this.checkForUserNameChange();
            
            // Request notification permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            } else {
                console.log('Notifications not supported in this browser');
            }

            // Create notification center
            console.log('Creating notification center...');
            this.createNotificationCenter();
            
            // Listen for new responses
            console.log('Setting up response listener...');
            this.listenForResponses();
            
            // Check for existing responses on page load
            console.log('Checking existing responses...');
            this.checkExistingResponses();
            
            this.isInitialized = true;
            console.log('Notification system initialized successfully');
        } catch (error) {
            console.error('Error initializing notification system:', error);
        }
    }

    createNotificationCenter() {
        // Check if notification center already exists
        if (document.getElementById('notification-center')) {
            console.log('Notification center already exists');
            this.notificationCenter = document.getElementById('notification-center');
            return;
        }
        
        // Create notification center container
        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'notification-center';
        notificationCenter.className = 'notification-center';
        notificationCenter.innerHTML = `
            <div class="notification-header">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                <button class="notification-close" aria-label="Close notifications">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-list" id="notification-list">
                <div class="no-notifications">No new notifications</div>
            </div>
            <div class="notification-footer">
                <button class="mark-all-read" id="mark-all-read">Mark all as read</button>
                <button class="clear-all" id="clear-all">Clear all</button>
            </div>
        `;
        
        document.body.appendChild(notificationCenter);
        this.notificationCenter = notificationCenter;
        
        // Add notification bell to sidebar
        this.addNotificationBell();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    addNotificationBell() {
        // Check if notification bell already exists
        if (document.getElementById('notification-bell')) {
            console.log('Notification bell already exists');
            return;
        }
        
        // Create floating notification bell
        const notificationBell = document.createElement('div');
        notificationBell.className = 'notification-bell-container';
        notificationBell.innerHTML = `
            <button class="notification-bell" id="notification-bell" aria-label="Open notifications">
                <i class="fas fa-bell"></i>
                <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
            </button>
        `;
        
        // Add to body for floating position
        document.body.appendChild(notificationBell);
        
        // Add click event
        const bell = notificationBell.querySelector('#notification-bell');
        bell.addEventListener('click', () => this.toggleNotificationCenter());
    }

    setupEventListeners() {
        // Close button
        const closeBtn = this.notificationCenter.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hideNotificationCenter());

        // Mark all as read
        const markAllRead = document.getElementById('mark-all-read');
        markAllRead.addEventListener('click', () => this.markAllAsRead());

        // Clear all
        const clearAll = document.getElementById('clear-all');
        clearAll.addEventListener('click', () => this.clearAllNotifications());

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.notificationCenter.contains(e.target) && 
                !e.target.closest('#notification-bell')) {
                this.hideNotificationCenter();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNotificationCenter();
            }
        });
    }

    async listenForResponses() {
        try {
            console.log('Setting up Firebase response listener...');
            
            // Listen for new responses in real-time
            db.collection('responses')
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('Firebase snapshot received:', snapshot.docChanges().length, 'changes');
                    
                    snapshot.docChanges().forEach((change) => {
                        console.log('Document change:', change.type, change.doc.id);
                        
                        if (change.type === 'added') {
                            console.log('New response detected, handling...');
                            this.handleNewResponse(change.doc);
                        }
                    });
                }, (error) => {
                    console.error('Firebase listener error:', error);
                });
                
            console.log('Firebase response listener set up successfully');
        } catch (error) {
            console.error('Error setting up response listener:', error);
        }
    }

    async handleNewResponse(responseDoc) {
        try {
            console.log('Handling new response:', responseDoc.id);
            const responseData = responseDoc.data();
            console.log('Response data:', responseData);
            
            // Get the feedback details
            const feedbackDoc = await db.collection('feedback').doc(responseData.feedbackId).get();
            if (!feedbackDoc.exists) {
                console.log('Feedback document not found for ID:', responseData.feedbackId);
                return;
            }
            
            const feedbackData = feedbackDoc.data();
            console.log('Feedback data:', feedbackData);
            
            // Check if this is the current user's feedback
            const currentUserName = this.getCurrentUserName();
            const currentUserIdentifier = this.getCurrentUserIdentifier();
            
            console.log('Current user name:', currentUserName);
            console.log('Current user identifier:', currentUserIdentifier);
            console.log('Feedback user name:', feedbackData.name);
            console.log('Feedback user identifier:', feedbackData.userIdentifier);
            
            // Check if this feedback belongs to current user (by name or identifier)
            const isCurrentUserFeedback = feedbackData.name === currentUserName || 
                                        feedbackData.userIdentifier === currentUserIdentifier;
            
            console.log('Is current user feedback:', isCurrentUserFeedback);
            
            if (isCurrentUserFeedback) {
                console.log('Creating notification for user:', currentUserName);
                
                // Check if this notification is already read
                const readNotifications = this.getReadNotifications();
                const isRead = readNotifications.includes(responseDoc.id);
                
                // Create notification
                const notification = {
                    id: responseDoc.id,
                    type: 'response',
                    title: 'Admin Response Received',
                    message: `Admin has responded to your feedback: "${this.truncateText(feedbackData.message, 50)}"`,
                    responseMessage: responseData.responseMessage,
                    feedbackMessage: feedbackData.message,
                    timestamp: responseData.timestamp?.toDate?.() || new Date(),
                    read: isRead,
                    feedbackId: responseData.feedbackId
                };
                
                console.log('Notification object:', notification);
                this.addNotification(notification);
                
                // Show browser notification only if not read
                if (!isRead) {
                    this.showBrowserNotification(notification);
                }
            } else {
                console.log('Response is not for current user. Skipping notification.');
            }
        } catch (error) {
            console.error('Error handling new response:', error);
        }
    }

    async checkExistingResponses() {
        try {
            const currentUserName = this.getCurrentUserName();
            const currentUserIdentifier = this.getCurrentUserIdentifier();
            
            if (!currentUserName) {
                console.log('No current user name found, skipping existing responses check');
                return;
            }
            
            console.log('Checking existing responses for user:', currentUserName);
            console.log('Current user identifier:', currentUserIdentifier);
            
            // Get all feedback from current user (by name)
            const feedbackSnapshot = await db.collection('feedback')
                .where('name', '==', currentUserName)
                .get();
            
            const feedbackIds = feedbackSnapshot.docs.map(doc => doc.id);
            console.log('Found feedback IDs:', feedbackIds);
            
            if (feedbackIds.length === 0) {
                console.log('No feedback found for user');
                return;
            }
            
            // Check if we need to migrate existing feedbacks to new identifier system
            await this.migrateExistingFeedbacks(feedbackSnapshot.docs);
            
            // Firebase 'in' query has a limit of 10 items, so we need to batch them
            const batchSize = 10;
            const responsePromises = [];
            
            for (let i = 0; i < feedbackIds.length; i += batchSize) {
                const batch = feedbackIds.slice(i, i + batchSize);
                const promise = db.collection('responses')
                    .where('feedbackId', 'in', batch)
                    .get(); // Removed orderBy to avoid index requirement
                responsePromises.push(promise);
            }
            
            let responseSnapshots;
            try {
                responseSnapshots = await Promise.all(responsePromises);
            } catch (firebaseError) {
                console.warn('Firebase query failed, this might be due to missing index:', firebaseError);
                console.log('To fix this, create a composite index for: feedbackId (Ascending) + timestamp (Descending)');
                console.log('Or visit the link in the error message to create the index automatically');
                return; // Exit gracefully instead of crashing
            }
            
            // Sort responses by timestamp manually after fetching
            const allResponses = [];
            responseSnapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    allResponses.push(doc);
                });
            });
            
            // Sort by timestamp descending
            allResponses.sort((a, b) => {
                const timestampA = a.data().timestamp?.toDate?.() || new Date(0);
                const timestampB = b.data().timestamp?.toDate?.() || new Date(0);
                return timestampB - timestampA;
            });
            
            // Get read status from localStorage
            const readNotifications = this.getReadNotifications();
            
            // Check if localStorage was cleared (no read notifications but we have responses)
            const hasLocalStorageData = readNotifications.length > 0;
            const hasResponses = allResponses.length > 0;
            
            if (!hasLocalStorageData && hasResponses) {
                console.log('localStorage appears to be cleared, applying smart read detection');
                this.handleLocalStorageCleared(allResponses, feedbackSnapshot);
                return;
            }
            
            // Process all responses
            allResponses.forEach(responseDoc => {
                const responseData = responseDoc.data();
                const feedbackDoc = feedbackSnapshot.docs.find(doc => doc.id === responseData.feedbackId);
                
                if (feedbackDoc) {
                    const feedbackData = feedbackDoc.data();
                    const notificationId = responseDoc.id;
                    const isRead = readNotifications.includes(notificationId);
                    
                    const notification = {
                        id: notificationId,
                        type: 'response',
                        title: 'Admin Response Received',
                        message: `Admin has responded to your feedback: "${this.truncateText(feedbackData.message, 50)}"`,
                        responseMessage: responseData.responseMessage,
                        feedbackMessage: feedbackData.message,
                        timestamp: responseData.timestamp?.toDate?.() || new Date(),
                        read: isRead,
                        feedbackId: responseData.feedbackId
                    };
                    
                    this.addNotification(notification, false); // Don't show browser notification for existing
                }
            });
            
            console.log('Existing responses check completed');
            
            // Clean up old read notifications
            this.cleanupReadNotifications();
        } catch (error) {
            console.error('Error checking existing responses:', error);
        }
    }

    getCurrentUserName() {
        // Try to get user name from various sources
        return localStorage.getItem('userName') || 
               document.getElementById('name')?.value || 
               sessionStorage.getItem('userName') || 
               null;
    }
    
    getCurrentUserIdentifier() {
        return getUserIdentifier();
    }
    
    getCurrentUserId() {
        return getUserId();
    }
    
    migrateUserNotifications(oldUserName, newUserName) {
        try {
            if (!oldUserName || !newUserName || oldUserName === newUserName) {
                return;
            }
            
            console.log(`Migrating notifications from ${oldUserName} to ${newUserName}`);
            
            // Get old user's read notifications (old format)
            const oldKey = `readNotifications_${oldUserName.toLowerCase().trim()}`;
            const oldReadNotifications = localStorage.getItem(oldKey);
            
            if (oldReadNotifications) {
                // Copy to new user identifier format
                const newUserIdentifier = `${newUserName}_${this.getCurrentUserId()}`;
                const newKey = `readNotifications_${newUserIdentifier}`;
                localStorage.setItem(newKey, oldReadNotifications);
                
                // Remove old key
                localStorage.removeItem(oldKey);
                
                console.log(`Successfully migrated ${JSON.parse(oldReadNotifications).length} read notifications to new format`);
            }
        } catch (error) {
            console.error('Error migrating user notifications:', error);
        }
    }
    
    checkForUserNameChange() {
        try {
            const currentUserName = this.getCurrentUserName();
            const lastKnownUserName = localStorage.getItem('lastKnownUserName');
            
            if (currentUserName && lastKnownUserName && currentUserName !== lastKnownUserName) {
                console.log(`User name changed from "${lastKnownUserName}" to "${currentUserName}"`);
                this.migrateUserNotifications(lastKnownUserName, currentUserName);
            }
            
            // Update the last known user name
            if (currentUserName) {
                localStorage.setItem('lastKnownUserName', currentUserName);
            }
        } catch (error) {
            console.error('Error checking for user name change:', error);
        }
    }
    
    async migrateExistingFeedbacks(feedbackDocs) {
        try {
            const currentUserName = this.getCurrentUserName();
            const currentUserIdentifier = this.getCurrentUserIdentifier();
            
            if (!currentUserName || !currentUserIdentifier) {
                return;
            }
            
            console.log('Checking for existing feedbacks that need migration...');
            
            const feedbacksToMigrate = [];
            
            feedbackDocs.forEach(feedbackDoc => {
                const feedbackData = feedbackDoc.data();
                
                // Check if feedback has the new userIdentifier field
                if (!feedbackData.userIdentifier) {
                    feedbacksToMigrate.push({
                        docId: feedbackDoc.id,
                        feedbackData: feedbackData
                    });
                }
            });
            
            if (feedbacksToMigrate.length === 0) {
                console.log('All feedbacks already have userIdentifier field');
                return;
            }
            
            console.log(`Found ${feedbacksToMigrate.length} feedbacks to migrate`);
            
            // Update feedbacks with userIdentifier field
            const batch = db.batch();
            
            feedbacksToMigrate.forEach(({ docId, feedbackData }) => {
                const feedbackRef = db.collection('feedback').doc(docId);
                batch.update(feedbackRef, {
                    userIdentifier: currentUserIdentifier,
                    migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            console.log(`Successfully migrated ${feedbacksToMigrate.length} feedbacks`);
            
            // Show user a notification about the migration
            this.showToast(`Migrated ${feedbacksToMigrate.length} existing feedbacks to new system`, 'info');
            
        } catch (error) {
            console.error('Error migrating existing feedbacks:', error);
        }
    }
    
    getReadNotifications() {
        try {
            const userIdentifier = this.getCurrentUserIdentifier();
            const userSpecificKey = `readNotifications_${userIdentifier}`;
            const readNotifications = localStorage.getItem(userSpecificKey);
            
            if (readNotifications) {
                return JSON.parse(readNotifications);
            }
            
            // Fallback to old format for backward compatibility
            const currentUserName = this.getCurrentUserName();
            if (currentUserName) {
                const oldKey = `readNotifications_${currentUserName.toLowerCase().trim()}`;
                const oldReadNotifications = localStorage.getItem(oldKey);
                if (oldReadNotifications) {
                    // Migrate to new format
                    localStorage.setItem(userSpecificKey, oldReadNotifications);
                    localStorage.removeItem(oldKey);
                    console.log('Migrated read notifications to new format');
                    return JSON.parse(oldReadNotifications);
                }
            }
            
            return [];
        } catch (error) {
            console.error('Error getting read notifications:', error);
            return [];
        }
    }
    
    saveReadNotifications() {
        try {
            const userIdentifier = this.getCurrentUserIdentifier();
            const readNotificationIds = this.notifications
                .filter(n => n.read)
                .map(n => n.id);
            
            const userSpecificKey = `readNotifications_${userIdentifier}`;
            localStorage.setItem(userSpecificKey, JSON.stringify(readNotificationIds));
            console.log(`Saved read notifications for user identifier: ${userIdentifier}`);
        } catch (error) {
            console.error('Error saving read notifications:', error);
        }
    }
    
    markNotificationAsRead(notificationId) {
        const userIdentifier = this.getCurrentUserIdentifier();
        const readNotifications = this.getReadNotifications();
        
        if (!readNotifications.includes(notificationId)) {
            readNotifications.push(notificationId);
            
            // Keep only the last 100 read notifications to prevent localStorage from growing too large
            if (readNotifications.length > 100) {
                readNotifications.splice(0, readNotifications.length - 100);
            }
            
            const userSpecificKey = `readNotifications_${userIdentifier}`;
            localStorage.setItem(userSpecificKey, JSON.stringify(readNotifications));
        }
    }

    addNotification(notification, showBrowserNotification = true) {
        console.log('Adding notification:', notification.id);
        
        // Check if notification already exists
        const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
        if (existingIndex !== -1) {
            console.log('Notification already exists, skipping');
            return;
        }
        
        console.log('Adding new notification to list');
        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        this.renderNotifications();
        
        if (showBrowserNotification) {
            console.log('Showing browser notification');
            this.showBrowserNotification(notification);
        }
        
        console.log('Total notifications:', this.notifications.length);
    }

    showBrowserNotification(notification) {
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                const browserNotification = new Notification(notification.title, {
                    body: notification.message,
                    icon: '/favicon_io/favicon-32x32.png',
                    badge: '/favicon_io/favicon-32x32.png',
                    tag: notification.id,
                    requireInteraction: false,
                    silent: false
                });
                
                browserNotification.onclick = () => {
                    this.showNotificationCenter();
                    this.markAsRead(notification.id);
                    browserNotification.close();
                };
                
                // Auto close after 5 seconds
                setTimeout(() => {
                    try {
                        browserNotification.close();
                    } catch (error) {
                        console.log('Error closing browser notification:', error);
                    }
                }, 5000);
            } else if ('Notification' in window && Notification.permission === 'default') {
                console.log('Notification permission not granted, requesting...');
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showBrowserNotification(notification);
                    }
                });
            }
        } catch (error) {
            console.error('Error showing browser notification:', error);
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;
        
        if (this.notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
            return;
        }
        
        notificationList.innerHTML = this.notifications.map(notification => {
            // Sanitize data to prevent XSS
            const sanitizedTitle = this.sanitizeText(notification.title);
            const sanitizedMessage = this.sanitizeText(notification.message);
            const sanitizedId = this.sanitizeText(notification.id);
            const sanitizedFeedbackId = this.sanitizeText(notification.feedbackId);
            
            return `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${sanitizedId}">
                    <div class="notification-icon">
                        <i class="fas fa-comment-dots"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${sanitizedTitle}</div>
                        <div class="notification-message">${sanitizedMessage}</div>
                        <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                    </div>
                    <div class="notification-actions">
                        <button class="notification-action-btn" onclick="notificationSystem.viewResponse('${sanitizedFeedbackId}')" title="View Response">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="notification-action-btn" onclick="notificationSystem.markAsRead('${sanitizedId}')" title="Mark as Read">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            console.log('Marking notification as read:', notificationId);
            notification.read = true;
            
            // Save to localStorage
            this.markNotificationAsRead(notificationId);
            
            // Add visual feedback
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.add('marking-read');
                setTimeout(() => {
                    notificationElement.classList.remove('marking-read');
                }, 500);
            }
            
            // Show a small toast notification
            this.showToast('Notification marked as read', 'success');
            
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        const unreadNotifications = this.notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) {
            console.log('No unread notifications to mark');
            return;
        }
        
        console.log('Marking all notifications as read:', unreadNotifications.length);
        
        // Add visual feedback for each unread notification
        unreadNotifications.forEach((notification, index) => {
            const notificationElement = document.querySelector(`[data-id="${notification.id}"]`);
            if (notificationElement) {
                setTimeout(() => {
                    notificationElement.classList.add('marking-read');
                    setTimeout(() => {
                        notificationElement.classList.remove('marking-read');
                    }, 500);
                }, index * 100); // Stagger the animations
            }
        });
        
        // Mark all as read
        this.notifications.forEach(notification => {
            notification.read = true;
            // Save to localStorage
            this.markNotificationAsRead(notification.id);
        });
        
        this.updateNotificationBadge();
        this.renderNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.updateNotificationBadge();
        this.renderNotifications();
    }
    
    cleanupReadNotifications() {
        try {
            const userIdentifier = this.getCurrentUserIdentifier();
            const readNotifications = this.getReadNotifications();
            const currentNotificationIds = this.notifications.map(n => n.id);
            
            // Remove read notifications that are no longer in the current list
            const validReadNotifications = readNotifications.filter(id => 
                currentNotificationIds.includes(id)
            );
            
            if (validReadNotifications.length !== readNotifications.length) {
                const userSpecificKey = `readNotifications_${userIdentifier}`;
                localStorage.setItem(userSpecificKey, JSON.stringify(validReadNotifications));
                console.log('Cleaned up read notifications:', readNotifications.length - validReadNotifications.length, 'removed');
            }
        } catch (error) {
            console.error('Error cleaning up read notifications:', error);
        }
    }
    
    handleLocalStorageCleared(responseSnapshots, feedbackSnapshot) {
        try {
            console.log('Applying smart read detection for cleared localStorage');
            
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
            const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week ago
            const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 month ago
            
            // Check if this is a returning user (has feedback history)
            const isReturningUser = feedbackSnapshot.docs.length > 1;
            const totalResponses = responseSnapshots.reduce((total, snapshot) => total + snapshot.docs.length, 0);
            
            console.log(`User has ${feedbackSnapshot.docs.length} feedback entries and ${totalResponses} responses`);
            
            const readNotificationIds = [];
            
            // Process all responses with smart detection
            responseSnapshots.forEach(responsesSnapshot => {
                responsesSnapshot.docs.forEach(responseDoc => {
                    const responseData = responseDoc.data();
                    const feedbackDoc = feedbackSnapshot.docs.find(doc => doc.id === responseData.feedbackId);
                    
                    if (feedbackDoc) {
                        const feedbackData = feedbackDoc.data();
                        const notificationId = responseDoc.id;
                        const responseTime = responseData.timestamp?.toDate?.() || new Date();
                        
                        // Smart read detection based on time and user behavior
                        let isRead = false;
                        let reason = '';
                        
                        if (isReturningUser) {
                            // For returning users, be more aggressive about marking as read
                            if (responseTime < oneWeekAgo) {
                                isRead = true;
                                reason = 'returning user, older than 1 week';
                            } else if (responseTime < oneDayAgo) {
                                isRead = true;
                                reason = 'returning user, older than 1 day';
                            } else {
                                isRead = false;
                                reason = 'returning user, recent response';
                            }
                        } else {
                            // For new users, be more conservative
                            if (responseTime < oneMonthAgo) {
                                isRead = true;
                                reason = 'new user, older than 1 month';
                            } else if (responseTime < oneWeekAgo) {
                                isRead = true;
                                reason = 'new user, older than 1 week';
                            } else {
                                isRead = false;
                                reason = 'new user, recent response';
                            }
                        }
                        
                        if (isRead) {
                            readNotificationIds.push(notificationId);
                        }
                        
                        const notification = {
                            id: notificationId,
                            type: 'response',
                            title: 'Admin Response Received',
                            message: `Admin has responded to your feedback: "${this.truncateText(feedbackData.message, 50)}"`,
                            responseMessage: responseData.responseMessage,
                            feedbackMessage: feedbackData.message,
                            timestamp: responseTime,
                            read: isRead,
                            feedbackId: responseData.feedbackId
                        };
                        
                        console.log(`Notification ${notificationId}: ${reason} -> ${isRead ? 'READ' : 'UNREAD'}`);
                        this.addNotification(notification, false);
                    }
                });
            });
            
            // Save the smart-detected read status to localStorage
            if (readNotificationIds.length > 0) {
                localStorage.setItem('readNotifications', JSON.stringify(readNotificationIds));
                console.log(`Smart detection completed: ${readNotificationIds.length} notifications marked as read`);
                
                // Show a helpful message to the user with option to reset
                this.showToast(
                    `Smart detection applied: ${readNotificationIds.length} older notifications marked as read`, 
                    'info',
                    'Show All as Unread',
                    'window.notificationSystem.resetAllNotificationsToUnread'
                );
            }
            
        } catch (error) {
            console.error('Error handling localStorage cleared:', error);
        }
    }

    viewResponse(feedbackId) {
        // Find the notification for this feedback and mark it as read
        const notification = this.notifications.find(n => n.feedbackId === feedbackId);
        if (notification && !notification.read) {
            console.log('Auto-marking notification as read:', notification.id);
            this.markAsRead(notification.id);
        }
        
        // Open user-friendly feedback page
        window.open(`feedback.html?feedback=${feedbackId}`, '_blank');
    }

    showNotificationCenter() {
        this.notificationCenter.classList.add('show');
        
        // Auto-mark all notifications as read when opening the center
        const hasUnreadNotifications = this.notifications.some(n => !n.read);
        if (hasUnreadNotifications) {
            console.log('Auto-marking all notifications as read when opening center');
            this.markAllAsRead();
        }
    }

    hideNotificationCenter() {
        this.notificationCenter.classList.remove('show');
    }

    toggleNotificationCenter() {
        if (this.notificationCenter.classList.contains('show')) {
            this.hideNotificationCenter();
        } else {
            this.showNotificationCenter();
        }
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return timestamp.toLocaleDateString();
    }

    truncateText(text, maxLength) {
        return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
    }
    
    sanitizeText(text) {
        if (!text) return '';
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    }
    
    showToast(message, type = 'info', actionText = null, actionCallback = null) {
        // Remove existing toast
        const existingToast = document.querySelector('.notification-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-toast-${type}`;
        
        let actionButton = '';
        if (actionText && actionCallback) {
            actionButton = `<button class="toast-action-btn" onclick="this.parentElement.parentElement.remove(); ${actionCallback}()">${actionText}</button>`;
        }
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${this.sanitizeText(message)}</span>
            </div>
            ${actionButton}
        `;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto hide after 5 seconds (longer if there's an action button)
        const hideDelay = actionText ? 8000 : 3000;
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, hideDelay);
    }
    
    resetAllNotificationsToUnread() {
        try {
            const userIdentifier = this.getCurrentUserIdentifier();
            
            // Clear user-specific localStorage
            const userSpecificKey = `readNotifications_${userIdentifier}`;
            localStorage.removeItem(userSpecificKey);
            console.log(`Cleared read notifications for user identifier: ${userIdentifier}`);
            
            // Mark all notifications as unread
            this.notifications.forEach(notification => {
                notification.read = false;
            });
            
            // Update UI
            this.updateNotificationBadge();
            this.renderNotifications();
            
            console.log('All notifications reset to unread');
            this.showToast('All notifications marked as unread', 'success');
        } catch (error) {
            console.error('Error resetting notifications:', error);
        }
    }
}

// Initialize notification system
let notificationSystem;

// Initialize notification system after DOM is loaded
function initializeNotificationSystem() {
    try {
        console.log('Initializing notification system...');
        
        // Check if Firebase is ready
        if (typeof db === 'undefined') {
            console.error('Firebase not initialized, retrying in 1 second...');
            setTimeout(initializeNotificationSystem, 1000);
            return;
        }
        
        notificationSystem = new NotificationSystem();
        // Make it globally accessible
        window.notificationSystem = notificationSystem;
        
        console.log('Notification system initialized successfully');
    } catch (error) {
        console.error('Error initializing notification system:', error);
        // Retry after a delay
        setTimeout(initializeNotificationSystem, 2000);
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotificationSystem);
} else {
    initializeNotificationSystem();
}

// =========================
// Section: Error Boundaries and Enhanced Error Handling
// =========================

// Global error handler for unhandled errors
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // Show user-friendly error message
    if (window.notificationSystem) {
        window.notificationSystem.showToast(
            'An unexpected error occurred. Please refresh the page.',
            'error'
        );
    }
    
    // Log error details for debugging
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    if (window.notificationSystem) {
        window.notificationSystem.showToast(
            'A network error occurred. Please check your connection.',
            'error'
        );
    }
    
    // Prevent the default browser error
    event.preventDefault();
});

// Enhanced error handling utility
function handleError(error, context = 'Unknown operation') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    if (window.notificationSystem) {
        let userMessage = 'An error occurred. Please try again.';
        
        if (error.code === 'permission-denied') {
            userMessage = 'Permission denied. Please check your settings.';
        } else if (error.code === 'unavailable') {
            userMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (error.message && error.message.includes('network')) {
            userMessage = 'Network error. Please check your connection.';
        }
        
        window.notificationSystem.showToast(userMessage, 'error');
    }
    
    return false;
}

// Safe async operation wrapper
async function safeAsyncOperation(operation, context = 'Unknown operation') {
    try {
        return await operation();
    } catch (error) {
        handleError(error, context);
        throw error;
    }
}

// =========================
// Section: UI State & Navigation
// =========================

// =========================
// Section: UI State & Navigation
// =========================
window.addEventListener('load', function () {
    // Restore last active section from localStorage
    const activeSectionId = localStorage.getItem('activeSectionId');
    if (activeSectionId) {
        loadSection(activeSectionId);
    } else {
        loadCalculator();
    }
    highlightActiveMenu();
});

// Cache section IDs for navigation
const sectionIds = ['all-calculators', 'page1-content', 'page2-content', 'page3-content'];
const menuMap = {
    'all-calculators': 'menu-calculator',
    'page1-content': 'menu-page1',
    'page2-content': 'menu-page2',
    'page3-content': 'menu-page3',
};

function highlightActiveMenu() {
    Object.values(menuMap).forEach(id => {
        const li = document.getElementById(id);
        if (li) li.classList.remove('active');
    });
    const activeSectionId = localStorage.getItem('activeSectionId') || 'all-calculators';
    const activeMenuId = menuMap[activeSectionId];
    if (activeMenuId) {
        const li = document.getElementById(activeMenuId);
        if (li) li.classList.add('active');
    }
}

function loadSection(sectionId) {
    // Hide all content sections
    sectionIds.forEach(section => {
        const el = document.getElementById(section);
        if (el) el.style.display = 'none';
    });
    // Show the specified section
    const currentSection = document.getElementById(sectionId);
    if (currentSection) {
        currentSection.style.display = 'block';
        // Focus on the first input with the class 'autofocusFirst'
        const autofocusElement = currentSection.querySelector('.autofocusFirst');
        if (autofocusElement) autofocusElement.focus();
        // Store the active section ID in localStorage
        localStorage.setItem('activeSectionId', sectionId);
        highlightActiveMenu();
    } else {
        loadCalculator();
    }
}
function loadCalculator() { loadSection('all-calculators'); }
function loadPage1() { loadSection('page1-content'); }
function loadPage2() { loadSection('page2-content'); }
function loadPage3() { loadSection('page3-content'); }

// =========================
// Section: Side Menu Mobile UX
// =========================
let hamburger, sideMenu, menuOpen = false;

function initializeMobileMenu() {
    console.log('Initializing mobile menu...');
    console.log('Document ready state:', document.readyState);
    console.log('Window width:', window.innerWidth);
    
    hamburger = document.getElementById('hamburger-menu');
    sideMenu = document.getElementById('side-menu');
    
    console.log('Found elements:', { 
        hamburger: !!hamburger, 
        sideMenu: !!sideMenu,
        hamburgerElement: hamburger,
        sideMenuElement: sideMenu
    });
    
    if (!hamburger || !sideMenu) {
        console.warn('Mobile menu elements not found:', { hamburger: !!hamburger, sideMenu: !!sideMenu });
        return;
    }
    
    // Check computed styles
    const hamburgerStyles = window.getComputedStyle(hamburger);
    console.log('Hamburger computed styles:', {
        display: hamburgerStyles.display,
        visibility: hamburgerStyles.visibility,
        opacity: hamburgerStyles.opacity,
        position: hamburgerStyles.position,
        zIndex: hamburgerStyles.zIndex
    });
    
    menuOpen = false;
    
    function openMenu() {
        console.log('Opening menu...');
        sideMenu.classList.add('open');
        menuOpen = true;
        hamburger.setAttribute('aria-label', 'Close menu');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.focus();
    }
    
    function closeMenu() {
        console.log('Closing menu...');
        sideMenu.classList.remove('open');
        menuOpen = false;
        hamburger.setAttribute('aria-label', 'Open menu');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    
    function toggleMenu() {
        console.log('Toggling menu, current state:', menuOpen);
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Ensure sidebar is closed initially on mobile/tablet
    if (window.innerWidth <= 992) {
        sideMenu.classList.remove('open');
    }
    
    // Add event listeners
    hamburger.addEventListener('click', function(e) {
        console.log('Hamburger clicked!');
        e.stopPropagation(); // Prevent event from bubbling to document click
        toggleMenu();
    });
    hamburger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Close menu on Escape
    window.addEventListener('keydown', function(e) {
        if (menuOpen && e.key === 'Escape') {
            closeMenu();
            hamburger && hamburger.focus();
        }
    });
    
    // Close menu when clicking outside (mobile)
    document.addEventListener('click', function(e) {
        if (menuOpen && !sideMenu.contains(e.target) && e.target !== hamburger && !hamburger.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Close menu when a menu link is clicked (mobile)
    sideMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
            if (window.innerWidth <= 900) closeMenu();
        }
    });
    
    console.log('Mobile menu initialized successfully');
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded - initializing mobile menu');
        initializeMobileMenu();
    });
} else {
    console.log('DOM already loaded - initializing mobile menu immediately');
    initializeMobileMenu();
}

// =========================
// Section: Alpha Calculator
// =========================
const pricingCalculator = document.getElementById("pricingCalculator");
const unitPriceAlpha = document.getElementById("unitPriceAlpha");
const codeAlpha = document.getElementById("codeAlpha");
const resultAlpha = document.getElementById("resultAlpha");

if (pricingCalculator) {
    pricingCalculator.addEventListener("submit", function (event) {
        event.preventDefault();
        
        PerformanceMonitor.trackInteraction('calculator_submit', {
            calculator: 'alpha',
            formData: {
                quantity: document.getElementById('quantity').value,
                unitPrice: document.getElementById('unitPrice').value
            }
        });
        
        const quantity = parseFloat(document.getElementById('quantity').value);
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        
        if (isNaN(quantity) || isNaN(unitPrice)) {
            PerformanceMonitor.trackError(new Error('Invalid input values'), 'alpha_calculator');
            alert('Please enter valid numbers');
            return;
        }
        
        const totalPrice = quantity * unitPrice;
        document.getElementById('result').value = totalPrice.toFixed(2);
        
        PerformanceMonitor.trackFeatureUsage('alpha_calculator', true);
        showCopyBtnIfResult();
    });
}
function clearFormAlpha() {
    unitPriceAlpha.value = "";
    codeAlpha.value = "";
    resultAlpha.style.display = "none";
}

// =========================
// Section: BelPromo Calculator
// =========================
const belpricingCalculator = document.getElementById("belpricingCalculator");
const unitPriceBel = document.getElementById("unitPriceBel");
const resultBel = document.getElementById("resultBel");

if (belpricingCalculator) {
    belpricingCalculator.addEventListener("submit", function (event) {
        event.preventDefault();
        
        PerformanceMonitor.trackInteraction('calculator_submit', {
            calculator: 'beta',
            formData: {
                quantity: document.getElementById('belQuantity').value,
                unitPrice: document.getElementById('belUnitPrice').value
            }
        });
        
        const quantity = parseFloat(document.getElementById('belQuantity').value);
        const unitPrice = parseFloat(document.getElementById('belUnitPrice').value);
        
        if (isNaN(quantity) || isNaN(unitPrice)) {
            PerformanceMonitor.trackError(new Error('Invalid input values'), 'beta_calculator');
            alert('Please enter valid numbers');
            return;
        }
        
        const totalPrice = quantity * unitPrice;
        document.getElementById('belResult').value = totalPrice.toFixed(2);
        
        PerformanceMonitor.trackFeatureUsage('beta_calculator', true);
        showCopyBtnIfResult();
    });
}
function clearFormBel() {
    unitPriceBel.value = "";
    resultBel.style.display = "none";
}

// =========================
// Section: Goldstar Calculator
// =========================
const goldpricingCalculator = document.getElementById("goldpricingCalculator");
const unitPriceGol = document.getElementById("unitPriceGol");
const resultGol = document.getElementById("resultGol");

if (goldpricingCalculator) {
    goldpricingCalculator.addEventListener("submit", function (event) {
        event.preventDefault();
        
        PerformanceMonitor.trackInteraction('calculator_submit', {
            calculator: 'gamma',
            formData: {
                quantity: document.getElementById('goldQuantity').value,
                unitPrice: document.getElementById('goldUnitPrice').value
            }
        });
        
        const quantity = parseFloat(document.getElementById('goldQuantity').value);
        const unitPrice = parseFloat(document.getElementById('goldUnitPrice').value);
        
        if (isNaN(quantity) || isNaN(unitPrice)) {
            PerformanceMonitor.trackError(new Error('Invalid input values'), 'gamma_calculator');
            alert('Please enter valid numbers');
            return;
        }
        
        const totalPrice = quantity * unitPrice;
        document.getElementById('goldResult').value = totalPrice.toFixed(2);
        
        PerformanceMonitor.trackFeatureUsage('gamma_calculator', true);
        showCopyBtnIfResult();
    });
}
function clearFormGol() {
    unitPriceGol.value = "";
    resultGol.style.display = "none";
}

// =========================
// Section: Description Generator
// =========================
const descGenerator = document.getElementById('descGenerator');
const itemCode = document.getElementById('itemCode');
const materialColor = document.getElementById('materialColor');
const imprintColor = document.getElementById('imprintColor');
const generateDesc = document.getElementById('generateDesc');
const copyDescBtn = document.getElementById('copyDesc');
const copiedDescMsg = document.getElementById('copiedDesc');

if (descGenerator) {
    descGenerator.addEventListener('submit', function (e) {
        e.preventDefault();
        generateDescription();
    });
    descGenerator.addEventListener('reset', function () {
        clearForm();
    });
}

if (generateDesc) {
    generateDesc.style.cursor = 'pointer';
    generateDesc.title = 'Click to copy';
    generateDesc.addEventListener('click', function () {
        // Copy the value to clipboard
        const text = generateDesc.value;
        if (text && text.trim() !== '') {
            generateDesc.select();
            generateDesc.setSelectionRange(0, 99999); // For mobile
            document.execCommand('copy');
            // Show feedback
            if (copiedDescMsg) {
                copiedDescMsg.innerHTML = '<i class="fas fa-check-circle"></i> Copied!';
                copiedDescMsg.classList.add('show');
                copiedDescMsg.style.display = '';
                setTimeout(() => {
                    copiedDescMsg.classList.remove('show');
                    copiedDescMsg.style.display = 'none';
                }, 1200);
            }
        }
    });
}

function generateDescription() {
    // Get user input and split by pipe
    const userInput = itemCode.value;
    const parts = userInput.split('|');
    if (parts.length === 2) {
        const code = parts[1].trim();
        const smallDesc = parts[0].trim();
        const matColor = materialColor.value;
        const impColor = imprintColor.value;
        const optionalItem = document.querySelector('input[name="optionalItems"]:checked');
        const optionalItemValue = optionalItem ? optionalItem.value : '';
        const description = `${code}, ${smallDesc}, Material Color: ${matColor}, Imprint Color: ${impColor}, ${optionalItemValue}, art per client file.`;
        generateDesc.value = description;
        generateDesc.focus();
        generateDesc.select();
    } else {
        generateDesc.value = 'Invalid input format. Please use "Small Description | Item Code" format.';
    }
}
function clearForm() {
    itemCode.value = '';
    materialColor.value = '';
    imprintColor.value = '';
    generateDesc.value = '';
}

// =========================
// Section: Visitor Count
// =========================
// const scriptURL = 'https://script.google.com/macros/s/AKfycbxPi4cnkcZkwIr-UgoAPkg8akySSb7efwWuzrgt7RgqCk4guafYg1vulQ97JZAOyfn44Q/exec';
// const visitCount = document.getElementById('visitCount');
// // Fetch and increment visitor count
// fetch(scriptURL + '?action=getCount')
//     .then(response => response.text())
//     .then(count => { visitCount.textContent = count; })
//     .catch(() => { visitCount.textContent = 'N/A'; });
// fetch(scriptURL)
//     .then(response => response.text())
//     .then(count => { visitCount.textContent = count; })
//     .catch(() => { visitCount.textContent = 'N/A'; });

// =========================
// Section: Feedback Modal & Firebase
// =========================

// =========================
// Section: Feedback Modal & Firebase
// =========================
// Utility function to sanitize user input (basic XSS prevention)
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

const feedbackForm = document.getElementById('feedback-form');
const responseMessage = document.getElementById('response-message');
const openModalBtn = document.getElementById('open-modal-btn');
const feedbackModal = document.getElementById('feedback-modal');
const closeBtn = document.getElementsByClassName('close-btn')[0];
let lastFocusedElement;

// Modal open/close logic with accessibility
if (openModalBtn) {
    openModalBtn.addEventListener('click', function () {
        lastFocusedElement = document.activeElement;
        
        // Auto-fill name with saved username if available
        const nameInput = document.getElementById('name');
        const savedUsername = localStorage.getItem('username');
        const savedUserName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
        
        if (nameInput) {
            // Use username if set, otherwise use the name from previous feedback
            if (savedUsername) {
                nameInput.value = savedUsername;
            } else if (savedUserName) {
                nameInput.value = savedUserName;
            } else {
                nameInput.value = ''; // Clear if no saved name
            }
        }
        
        feedbackModal.style.display = 'block';
        feedbackModal.setAttribute('tabindex', '-1');
        feedbackModal.focus();
    });
}
if (closeBtn) {
    closeBtn.addEventListener('click', function () {
        feedbackModal.style.display = 'none';
        if (lastFocusedElement) lastFocusedElement.focus();
    });
}
window.addEventListener('keydown', function (event) {
    if (feedbackModal && feedbackModal.style.display === 'block' && event.key === 'Escape') {
        feedbackModal.style.display = 'none';
        if (lastFocusedElement) lastFocusedElement.focus();
    }
});
window.addEventListener('click', function (event) {
    if (feedbackModal && event.target == feedbackModal) {
        feedbackModal.style.display = 'none';
        if (lastFocusedElement) lastFocusedElement.focus();
    }
});

// Feedback form submission with loading indicator and error handling
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');
        const name = sanitizeInput(document.getElementById('name').value);
        const message = sanitizeInput(document.getElementById('message').value);
        
        // Show loading state
        LoadingManager.showForm(feedbackForm);
        LoadingManager.showElement(submitBtn, 'Submitting...');
        responseMessage.innerText = 'Submitting your feedback...';
        
        try {
            // Get user identifier for the new feedback
            const userIdentifier = getUserIdentifier();
            
            await safeAsyncOperation(async () => {
                await db.collection('feedback').add({
                    name: name,
                    message: message,
                    userIdentifier: userIdentifier,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }, 'feedback submission');
            
            // Store user name for notifications
            storeUserName(name);
            
            responseMessage.innerText = 'Thank you for your feedback!';
            responseMessage.className = 'response-message success';
            feedbackForm.reset();
            
            setTimeout(() => {
                feedbackModal.style.display = 'none';
                responseMessage.innerText = '';
                responseMessage.className = 'response-message';
            }, 2000);
            
        } catch (error) {
            responseMessage.innerText = 'Error: ' + error.message;
            responseMessage.className = 'response-message error';
            console.error('Feedback submission error:', error);
        } finally {
            // Hide loading state
            LoadingManager.hideForm(feedbackForm);
            LoadingManager.hideElement(submitBtn);
        }
    });
}

// =========================
// Section: Copy to Clipboard Feature for Results
// =========================
function setupCopyFeature(resultId, copyBtnId, copiedMsgId) {
    const resultEl = document.getElementById(resultId);
    const copyBtn = document.getElementById(copyBtnId);
    const copiedMsg = document.getElementById(copiedMsgId);
    function showCopyBtnIfResult() {
        if (resultEl && resultEl.textContent && resultEl.textContent.trim() !== "") {
            copyBtn.style.display = '';
        } else {
            copyBtn.style.display = 'none';
            copiedMsg.style.display = 'none';
        }
    }
    if (resultEl) {
        // Observe changes to result text
        const observer = new MutationObserver(showCopyBtnIfResult);
        observer.observe(resultEl, { childList: true, subtree: true, characterData: true });
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (resultEl && resultEl.textContent) {
                // Copy to clipboard
                const temp = document.createElement('textarea');
                temp.value = resultEl.textContent.trim();
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
                // Show feedback
                if (copiedMsg) {
                    copiedMsg.innerHTML = '<i class="fas fa-check-circle"></i> Copied!';
                    copiedMsg.classList.add('show');
                    copiedMsg.style.display = '';
                    setTimeout(() => {
                        copiedMsg.classList.remove('show');
                        copiedMsg.style.display = 'none';
                    }, 1200);
                }
            }
        });
    }
    copyBtn && copyBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copyBtn.click();
        }
    });
    showCopyBtnIfResult();
}
// For description generator, copy from input value
function setupCopyFeatureForInput(inputId, copyBtnId, copiedMsgId) {
    const inputEl = document.getElementById(inputId);
    const copyBtn = document.getElementById(copyBtnId);
    const copiedMsg = document.getElementById(copiedMsgId);
    function showCopyBtnIfResult() {
        if (inputEl && inputEl.value && inputEl.value.trim() !== "") {
            copyBtn.style.display = '';
        } else {
            copyBtn.style.display = 'none';
            copiedMsg.style.display = 'none';
        }
    }
    if (inputEl) {
        inputEl.addEventListener('input', showCopyBtnIfResult);
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (inputEl && inputEl.value) {
                navigator.clipboard.writeText(inputEl.value.trim());
                copiedMsg.style.display = '';
                copyBtn.setAttribute('aria-label', 'Copied!');
                setTimeout(() => {
                    copiedMsg.style.display = 'none';
                    copyBtn.setAttribute('aria-label', 'Copy description');
                }, 1200);
            }
        });
        copyBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyBtn.click();
            }
        });
    }
    showCopyBtnIfResult();
}

// After DOMContentLoaded or at the end of the file:
setupCopyFeature('resultAlpha', 'copyAlpha', 'copiedAlpha');
setupCopyFeature('resultBel', 'copyBel', 'copiedBel');
setupCopyFeature('resultGol', 'copyGol', 'copiedGol');
setupCopyFeatureForInput('generateDesc', 'copyDesc', 'copiedDesc');
// =========================
// Section: One-time Greeting Modal
// =========================
function showGreetingModalIfFirstVisit() {
    if (!localStorage.getItem('greetingModalShown')) {
        const modal = document.getElementById('greeting-modal');
        const closeBtn = document.getElementById('greeting-close-btn');
        const closeX = document.getElementById('greeting-close-x');
        const feedbackBtn = document.getElementById('greeting-feedback-btn');
        if (!modal || !closeBtn) return;
        modal.style.display = 'flex';
        modal.focus();
        // Trap focus in modal
        function trapFocus(e) {
            if (modal.style.display === 'flex') {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    closeBtn.focus();
                }
                if (e.key === 'Escape') {
                    closeModal();
                }
            }
        }
        function closeModal() {
            modal.style.display = 'none';
            localStorage.setItem('greetingModalShown', 'true');
            document.removeEventListener('keydown', trapFocus);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeModal();
                // Open username modal after closing greeting modal
                setTimeout(() => {
                    const usernameModal = document.getElementById('username-modal');
                    const usernameInput = document.getElementById('username-input');
                    const currentUsernameInfo = document.getElementById('current-username-info');
                    
                    if (usernameModal && usernameInput) {
                        // Check if user already has a username
                        const currentUsername = localStorage.getItem('username');
                        
                        if (currentUsername) {
                            // User already has username, don't show the modal
                            return;
                        }
                        
                        // Show current username if exists
                        if (currentUsernameInfo) {
                            currentUsernameInfo.style.display = 'none';
                        }
                        
                        usernameInput.value = '';
                        usernameModal.style.display = 'block';
                        usernameInput.focus();
                    }
                }, 300); // Small delay to ensure greeting modal is fully closed
            });
        }
        if (closeX) closeX.addEventListener('click', closeModal);
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', function() {
                closeModal();
                // Open feedback modal
                const feedbackModal = document.getElementById('feedback-modal');
                if (feedbackModal) {
                    feedbackModal.style.display = 'block';
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }
            });
        }
        const learnMoreBtn = document.getElementById('greeting-learn-more-btn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', function() {
                // No-op, handled by link
            });
        }
        document.addEventListener('keydown', trapFocus);
        // Also close if user clicks outside modal-content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        closeBtn.focus();
    }
}
// Call after DOMContentLoaded
showGreetingModalIfFirstVisit();
// =========================
// Section: Feedback Modal Modern UX
// =========================
function setupFeedbackModalUX() {
    const feedbackModal = document.getElementById('feedback-modal');
    const closeBtn = feedbackModal ? feedbackModal.querySelector('.feedback-close-btn') : null;
    const form = document.getElementById('feedback-form');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('feedback-char-count');
    const responseMsg = document.getElementById('response-message');
    if (!feedbackModal || !form || !messageInput || !charCount) return;
    // Character count
    function updateCharCount() {
        charCount.textContent = `${messageInput.value.length} / 500`;
    }
    messageInput.addEventListener('input', updateCharCount);
    updateCharCount();
    // Close modal on Escape or close button
    function closeModal() {
        feedbackModal.style.display = 'none';
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('keydown', function(e) {
        if (feedbackModal.style.display === 'block' && e.key === 'Escape') closeModal();
    });
    // Show success message on submit
    form.addEventListener('submit', function(e) {
        setTimeout(() => {
            responseMsg.innerHTML = '<span style="color:#28a745;font-size:1.2em;">✔️</span> <span class="ms-2">Thank you for your feedback!</span>';
        }, 100);
    });
}
// Call after DOMContentLoaded
setupFeedbackModalUX();
// Sidebar menu link event listeners
const menuCalculatorLink = document.getElementById('menu-calculator-link');
const menuPage1Link = document.getElementById('menu-page1-link');
const menuPage2Link = document.getElementById('menu-page2-link');
const menuPage3Link = document.getElementById('menu-page3-link');
if (menuCalculatorLink) menuCalculatorLink.addEventListener('click', function(e) { e.preventDefault(); loadSection('all-calculators'); });
if (menuPage1Link) menuPage1Link.addEventListener('click', function(e) { e.preventDefault(); loadSection('page1-content'); });
if (menuPage2Link) menuPage2Link.addEventListener('click', function(e) { e.preventDefault(); loadSection('page2-content'); });
if (menuPage3Link) menuPage3Link.addEventListener('click', function(e) { e.preventDefault(); loadSection('page3-content'); });
// =========================
// Section: Username Modal Functionality
// =========================

// Initialize username modal functionality
function setupUsernameModal() {
    const usernameModal = document.getElementById('username-modal');
    const openUsernameBtn = document.getElementById('open-username-modal-btn');
    const closeUsernameBtn = document.getElementsByClassName('close-btn')[1]; // Get the second close-btn (username modal)
    const saveUsernameBtn = document.getElementById('username-save-btn');
    const clearUsernameBtn = document.getElementById('username-clear-btn');
    const usernameInput = document.getElementById('username-input');
    const currentUsernameInfo = document.getElementById('current-username-info');
    const currentUsernameDisplay = document.getElementById('current-username-display');
    
    if (!usernameModal || !openUsernameBtn) return;
    
    // Open modal
    openUsernameBtn.addEventListener('click', () => {
        const currentUsername = localStorage.getItem('username');
        
        // Show current username if exists
        if (currentUsername) {
            currentUsernameInfo.style.display = 'block';
            currentUsernameDisplay.textContent = currentUsername;
            usernameInput.value = currentUsername;
        } else {
            currentUsernameInfo.style.display = 'none';
            usernameInput.value = '';
        }
        
        usernameModal.style.display = 'block'; // Use block instead of flex
        usernameInput.focus();
    });
    
    // Close modal
    function closeUsernameModal() {
        usernameModal.style.display = 'none';
        usernameInput.value = '';
        currentUsernameInfo.style.display = 'none';
    }
    
    if (closeUsernameBtn) {
        closeUsernameBtn.addEventListener('click', closeUsernameModal);
    }
    
    // Close on outside click (like feedback modal)
    window.addEventListener('click', function(event) {
        if (usernameModal && event.target === usernameModal) {
            closeUsernameModal();
        }
    });
    
    // Close on Escape key (like feedback modal)
    window.addEventListener('keydown', function(event) {
        if (usernameModal && usernameModal.style.display === 'block' && event.key === 'Escape') {
            closeUsernameModal();
        }
    });
    
    // Save username
    saveUsernameBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        
        if (username) {
            if (setUsername(username)) {
                // Show success message
                if (window.notificationSystem) {
                    window.notificationSystem.showToast(`Username set to: ${username}`, 'success');
                }
                closeUsernameModal();
            } else {
                alert('Please enter a valid username');
            }
        } else {
            alert('Please enter a username');
        }
    });
    
    // Clear username
    clearUsernameBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your username?')) {
            clearUsername();
            if (window.notificationSystem) {
                window.notificationSystem.showToast('Username cleared', 'info');
            }
            closeUsernameModal();
        }
    });
    
    // Handle Enter key in input
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveUsernameBtn.click();
        }
    });
    
    // Initialize button text
    updateUsernameButton();
}

// Initialize username modal when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUsernameModal);
} else {
    setupUsernameModal();
}

// =========================
// Section: Loading State Management
// =========================

// Loading state management
const LoadingManager = {
    overlay: null,
    activeOperations: 0,
    
    init() {
        this.overlay = document.getElementById('loading-overlay');
    },
    
    show(message = 'Loading...') {
        this.activeOperations++;
        if (this.overlay) {
            this.overlay.classList.add('show');
        }
        console.log(`Loading started: ${message}`);
    },
    
    hide() {
        this.activeOperations = Math.max(0, this.activeOperations - 1);
        if (this.activeOperations === 0 && this.overlay) {
            this.overlay.classList.remove('show');
        }
        console.log(`Loading ended. Active operations: ${this.activeOperations}`);
    },
    
    // Show loading for a specific element
    showElement(element, message = 'Loading...') {
        if (element) {
            element.classList.add('btn-loading');
            element.setAttribute('data-loading-text', element.textContent);
            element.textContent = message;
        }
    },
    
    // Hide loading for a specific element
    hideElement(element) {
        if (element) {
            element.classList.remove('btn-loading');
            const originalText = element.getAttribute('data-loading-text');
            if (originalText) {
                element.textContent = originalText;
                element.removeAttribute('data-loading-text');
            }
        }
    },
    
    // Show form loading
    showForm(form) {
        if (form) {
            form.classList.add('form-loading');
        }
    },
    
    // Hide form loading
    hideForm(form) {
        if (form) {
            form.classList.remove('form-loading');
        }
    },
    
    // Show modal loading
    showModal(modal) {
        if (modal) {
            modal.classList.add('modal-loading');
        }
    },
    
    // Hide modal loading
    hideModal(modal) {
        if (modal) {
            modal.classList.remove('modal-loading');
        }
    }
};

// Initialize loading manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LoadingManager.init();
});

// =========================
// End of main.js
// =========================

// =========================
// Section: Performance Monitoring and Analytics
// =========================

// Performance monitoring utility
const PerformanceMonitor = {
    metrics: {},
    
    // Track page load performance
    trackPageLoad() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            };
            console.log('Page Load Performance:', this.metrics.pageLoad);
        }
    },
    
    // Track user interactions
    trackInteraction(action, details = {}) {
        const interaction = {
            action,
            timestamp: Date.now(),
            details,
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`
        };
        
        if (!this.metrics.interactions) {
            this.metrics.interactions = [];
        }
        this.metrics.interactions.push(interaction);
        
        console.log('User Interaction:', interaction);
        
        // Store in localStorage for analytics
        this.saveMetrics();
    },
    
    // Track feature usage
    trackFeatureUsage(feature, success = true) {
        if (!this.metrics.features) {
            this.metrics.features = {};
        }
        
        if (!this.metrics.features[feature]) {
            this.metrics.features[feature] = { uses: 0, successes: 0, failures: 0 };
        }
        
        this.metrics.features[feature].uses++;
        if (success) {
            this.metrics.features[feature].successes++;
        } else {
            this.metrics.features[feature].failures++;
        }
        
        console.log(`Feature Usage: ${feature}`, this.metrics.features[feature]);
    },
    
    // Track errors
    trackError(error, context = '') {
        if (!this.metrics.errors) {
            this.metrics.errors = [];
        }
        
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        this.metrics.errors.push(errorData);
        console.error('Error Tracked:', errorData);
    },
    
    // Save metrics to localStorage
    saveMetrics() {
        try {
            localStorage.setItem('idform_analytics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('Failed to save analytics:', error);
        }
    },
    
    // Load metrics from localStorage
    loadMetrics() {
        try {
            const saved = localStorage.getItem('idform_analytics');
            if (saved) {
                this.metrics = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    },
    
    // Get analytics summary
    getSummary() {
        return {
            totalInteractions: this.metrics.interactions?.length || 0,
            totalErrors: this.metrics.errors?.length || 0,
            features: this.metrics.features || {},
            pageLoad: this.metrics.pageLoad || {}
        };
    },
    
    // Clear old data (keep last 30 days)
    cleanup() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        if (this.metrics.interactions) {
            this.metrics.interactions = this.metrics.interactions.filter(
                interaction => interaction.timestamp > thirtyDaysAgo
            );
        }
        
        if (this.metrics.errors) {
            this.metrics.errors = this.metrics.errors.filter(
                error => error.timestamp > thirtyDaysAgo
            );
        }
        
        this.saveMetrics();
    }
};

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.loadMetrics();
    PerformanceMonitor.trackPageLoad();
    
    // Cleanup old data
    PerformanceMonitor.cleanup();
});

// Track window unload
window.addEventListener('beforeunload', () => {
    PerformanceMonitor.saveMetrics();
});
});