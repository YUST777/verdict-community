// popup.js - Verdict Helper Extension Popup

document.addEventListener('DOMContentLoaded', () => {
    const accountCard = document.getElementById('account-card');
    const avatar = document.getElementById('avatar');
    const handle = document.getElementById('handle');
    const statusText = document.getElementById('status-text');

    // Check Codeforces login status
    async function checkStatus() {
        // Set checking state
        accountCard.className = 'account-card checking';
        avatar.textContent = '?';
        handle.textContent = 'Checking...';
        statusText.textContent = 'Connecting';

        try {
            const response = await chrome.runtime.sendMessage({ action: 'checkLoginStatus' });

            if (response && response.loggedIn && response.handle) {
                // Connected
                accountCard.className = 'account-card connected';
                avatar.textContent = response.handle.charAt(0).toUpperCase();
                handle.textContent = response.handle;
                statusText.textContent = 'Ready to submit';
            } else {
                // Not logged in
                accountCard.className = 'account-card error';
                avatar.textContent = '!';
                handle.textContent = 'Not logged in';
                statusText.textContent = 'Login to Codeforces first';
            }
        } catch (error) {
            console.error('Status check failed:', error);
            accountCard.className = 'account-card error';
            avatar.textContent = '!';
            handle.textContent = 'Error';
            statusText.textContent = 'Could not connect';
        }
    }

    // Initial check
    checkStatus();
});
