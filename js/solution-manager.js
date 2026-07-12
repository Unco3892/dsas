// Solution Manager - Centralized JavaScript for Lab Exercise Solution Unlocking
// Author: AI Assistant for Data Science Course
// Description: Manages time-based solution unlocking across all lab exercises

class SolutionManager {
    constructor() {
        this.hintsVisible = false;
        this.solutionsVisible = false;
        this.updateInterval = null;
        this.unlockTimeout = null;
        
        // Lab unlock schedule - maps exercise set to unlock date/time
        // Based on your timetable: lectures unlock solutions at midnight
        this.unlockSchedule = {
            'exercise_set_1': new Date('2025-09-24T00:00:00'), // Sep 23 at 23h59 (Tue lecture)
            'exercise_set_2': new Date('2025-10-01T00:00:00'), // Sep 30 at 23h59 (Tue lecture) 
            'exercise_set_3': new Date('2025-10-08T00:00:00'), // Oct 7 at 23h59 (Tue lecture)
            'exercise_set_4': new Date('2025-10-15T00:00:00'), // Oct 14 at 23h59 (Tue lecture)
            'exercise_set_5': new Date('2025-10-22T00:00:00'), // Oct 21 at 23h59 (Tue lecture)
            'exercise_set_6': new Date('2025-10-22T00:00:00')  // Oct 21 at 23h59 (same as lab 5)
        };
        
        this.currentExerciseSet = this.detectExerciseSet();
        this.unlockTime = this.unlockSchedule[this.currentExerciseSet] || new Date('2099-12-31T23:59:59');
    }
    
    detectExerciseSet() {
        // Try to detect which exercise set we're on based on URL or page title
        const url = window.location.pathname;
        const title = document.title;
        
        // Check URL first
        for (const exerciseSet in this.unlockSchedule) {
            if (url.includes(exerciseSet)) {
                return exerciseSet;
            }
        }
        
        // Check title as fallback
        const match = title.match(/Exercise Set ([IVX\d]+)/i);
        if (match) {
            const setNumber = match[1];
            const romanToNumber = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6};
            const num = romanToNumber[setNumber] || parseInt(setNumber);
            return `exercise_set_${num}`;
        }
        
        // Default fallback
        return 'exercise_set_1';
    }
    
    toggleAllHints() {
        const hintCallouts = document.querySelectorAll('.callout-tip');
        const hintsBtn = document.getElementById('hints-btn-text');
        
        if (!hintsBtn) return;
        
        hintCallouts.forEach(callout => {
            const collapseDiv = callout.querySelector('.callout-collapse');
            if (collapseDiv) {
                if (this.hintsVisible) {
                    collapseDiv.classList.remove('show');
                    collapseDiv.setAttribute('aria-expanded', 'false');
                } else {
                    collapseDiv.classList.add('show');
                    collapseDiv.setAttribute('aria-expanded', 'true');
                }
            }
        });
        
        this.hintsVisible = !this.hintsVisible;
        hintsBtn.textContent = `💡 ${this.hintsVisible ? 'Hide Hints' : 'Show Hints'}`;
    }
    
    toggleAllSolutions() {
        const now = new Date();
        
        // Check if solutions are unlocked
        if (now < this.unlockTime) {
            const timeLeft = this.getTimeUntilUnlock('text');
            const unlockDate = this.unlockTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            alert(`🔒 Solutions will be available in ${timeLeft}.\nUnlock time: ${unlockDate}`);
            return;
        }
        
        // Solutions are unlocked, proceed with normal toggle
        const solutionCallouts = document.querySelectorAll('.callout-note');
        const solutionsBtn = document.getElementById('solutions-btn-text');
        
        if (!solutionsBtn) return;
        
        solutionCallouts.forEach(callout => {
            const collapseDiv = callout.querySelector('.callout-collapse');
            if (collapseDiv) {
                if (this.solutionsVisible) {
                    collapseDiv.classList.remove('show');
                    collapseDiv.setAttribute('aria-expanded', 'false');
                } else {
                    collapseDiv.classList.add('show');
                    collapseDiv.setAttribute('aria-expanded', 'true');
                }
            }
        });
        
        this.solutionsVisible = !this.solutionsVisible;
        solutionsBtn.textContent = `ℹ️ ${this.solutionsVisible ? 'Hide Solutions' : 'Show Solutions'}`;
    }
    
    getTimeUntilUnlock(format = 'text') {
        const now = new Date();
        const timeLeft = this.unlockTime - now;
        
        if (timeLeft <= 0) return format === 'clock' ? '00:00:00' : '0 seconds';
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (format === 'clock') {
            if (days > 0) {
                return `${days}d+${hours}h`;
            } else if (hours > 0) {
                return `${hours}h`;
            } else {
                return `0h`;
            }
        }
        
        // Text format
        let result = [];
        if (days > 0) result.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) result.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) result.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        if (seconds > 0) result.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        
        return result.slice(0, 2).join(', ');
    }
    
    updateSolutionButtonState() {
        try {
            const now = new Date();
            const solutionsBtn = document.getElementById('solutions-btn');
            const solutionsBtnText = document.getElementById('solutions-btn-text');
            const solutionCallouts = document.querySelectorAll('.callout-note');
            
            if (!solutionsBtn || !solutionsBtnText) {
                console.warn('Solution button elements not found');
                return;
            }
        
            if (now < this.unlockTime) {
                // Solutions are locked
                solutionsBtn.classList.add('btn-solution-locked');
                solutionsBtn.style.pointerEvents = 'none';
            this.solutionsVisible = false;
                
                // Update button text with countdown clock
                const timeLeftClock = this.getTimeUntilUnlock('clock');
                solutionsBtnText.innerHTML = `🔒 Show Solutions in ${timeLeftClock}`;
                
                // Blur all solution callouts and disable copy buttons
                solutionCallouts.forEach(callout => {
                    callout.classList.add('solution-blurred');
                    
                    // Disable copy buttons in blurred solutions
                    const copyButtons = callout.querySelectorAll('.code-copy-button, .clipboard-button, [title*="Copy"], [title*="copy"]');
                    copyButtons.forEach(btn => {
                        btn.style.display = 'none';
                        btn.disabled = true;
                    });
                    
                    // Disable pyodide code cells (make them non-interactive)
                    const pyodideCells = callout.querySelectorAll('.exercise-cell, [id^="pyodide-"]');
                    pyodideCells.forEach(cell => {
                        // Make the cell non-interactive
                        cell.style.pointerEvents = 'none';
                        cell.style.userSelect = 'none';
                        
                        // Add a disabled overlay
                        if (!cell.querySelector('.pyodide-disabled-overlay')) {
                            const overlay = document.createElement('div');
                            overlay.className = 'pyodide-disabled-overlay';
                            overlay.style.cssText = `
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: rgba(0, 0, 0, 0.1);
                                z-index: 5;
                                cursor: not-allowed;
                            `;
                            cell.style.position = 'relative';
                            cell.appendChild(overlay);
                        }
                    });
                    
                    // Disable any CodeMirror editors in solutions
                    const codeMirrorElements = callout.querySelectorAll('.CodeMirror');
                    codeMirrorElements.forEach(cm => {
                        if (cm.CodeMirror) {
                            cm.CodeMirror.setOption('readOnly', true);
                            cm.style.pointerEvents = 'none';
                        }
                    });
                    
                    // Add copy-paste prevention to the entire callout
                    this.addCopyPasteProtection(callout);
                });
                
                // Banner removed per user request
                
            } else {
                // Solutions are unlocked
                solutionsBtn.classList.remove('btn-solution-locked');
                solutionsBtn.style.pointerEvents = 'auto';
            solutionsBtnText.textContent = `ℹ️ ${this.solutionsVisible ? 'Hide Solutions' : 'Show Solutions'}`;
                
                // Remove blur from all solution callouts and re-enable copy buttons
                solutionCallouts.forEach(callout => {
                    callout.classList.remove('solution-blurred');
                    
                    // Re-enable copy buttons
                    const copyButtons = callout.querySelectorAll('.code-copy-button, .clipboard-button, [title*="Copy"], [title*="copy"]');
                    copyButtons.forEach(btn => {
                        btn.style.display = '';
                        btn.disabled = false;
                    });
                    
                    // Re-enable pyodide code cells
                    const pyodideCells = callout.querySelectorAll('.exercise-cell, [id^="pyodide-"]');
                    pyodideCells.forEach(cell => {
                        cell.style.pointerEvents = '';
                        cell.style.userSelect = '';
                        
                        // Remove disabled overlay
                        const overlay = cell.querySelector('.pyodide-disabled-overlay');
                        if (overlay) {
                            overlay.remove();
                        }
                    });
                    
                    // Re-enable CodeMirror editors
                    const codeMirrorElements = callout.querySelectorAll('.CodeMirror');
                    codeMirrorElements.forEach(cm => {
                        if (cm.CodeMirror) {
                            cm.CodeMirror.setOption('readOnly', false);
                            cm.style.pointerEvents = '';
                        }
                    });
                    
                    // Remove copy-paste protection
                    this.removeCopyPasteProtection(callout);
                });
                
                // Banner removed per user request
            }
        } catch (error) {
            console.error('Error in updateSolutionButtonState:', error);
        }
    }
    
    updateLockedNotificationBanner() {
        let banner = document.getElementById('solution-locked-banner');
        
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'solution-locked-banner';
            banner.className = 'solution-locked-notice';
            
            // Insert after the buttons
            const buttonsContainer = document.querySelector('p:has(.btn)');
            if (buttonsContainer) {
                buttonsContainer.insertAdjacentElement('afterend', banner);
            } else {
                const firstHeading = document.querySelector('h3, h2, h1');
                if (firstHeading) {
                    firstHeading.insertAdjacentElement('afterend', banner);
                }
            }
        }
        
        const timeLeftText = this.getTimeUntilUnlock('text');
        const timeLeftClock = this.getTimeUntilUnlock('clock');
        const unlockDate = this.unlockTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        banner.innerHTML = `
            🔒 <strong>Solutions are locked</strong> until <strong>${unlockDate}</strong>
            <div class="countdown-display">
                Time remaining: <span class="countdown-clock">${timeLeftClock}</span>
                <div class="countdown-units">(${timeLeftText})</div>
            </div>
        `;
    }
    
    removeLockedNotificationBanner() {
        const banner = document.getElementById('solution-locked-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    addCopyPasteProtection(element) {
        // Store original handlers if they exist
        if (!element._originalHandlers) {
            element._originalHandlers = {};
        }
        
        const preventCopy = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        const preventPaste = (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Show fun message for paste attempts
            this.showFunMessage();
            return false;
        };
        
        const preventKeyboardShortcuts = (e) => {
            // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x')) {
                e.preventDefault();
                e.stopPropagation();
                if (e.key === 'v') {
                    this.showFunMessage();
                }
                return false;
            }
        };
        
        // Add event listeners
        element.addEventListener('copy', preventCopy, true);
        element.addEventListener('paste', preventPaste, true);
        element.addEventListener('keydown', preventKeyboardShortcuts, true);
        element.addEventListener('contextmenu', preventCopy, true); // Disable right-click menu
        
        // Store handlers for removal later
        element._copyPasteHandlers = {
            copy: preventCopy,
            paste: preventPaste,
            keydown: preventKeyboardShortcuts,
            contextmenu: preventCopy
        };
    }
    
    removeCopyPasteProtection(element) {
        if (element._copyPasteHandlers) {
            element.removeEventListener('copy', element._copyPasteHandlers.copy, true);
            element.removeEventListener('paste', element._copyPasteHandlers.paste, true);
            element.removeEventListener('keydown', element._copyPasteHandlers.keydown, true);
            element.removeEventListener('contextmenu', element._copyPasteHandlers.contextmenu, true);
            delete element._copyPasteHandlers;
        }
    }
    
    showFunMessage() {
        // Create a temporary fun message
        const message = document.createElement('div');
        message.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show fun-message" role="alert" style="
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 1055; 
                max-width: 300px;
                animation: shake 0.5s ease-in-out;
            ">
                😏 Nice try! 😉
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    initialize() {
        // Ensure all hints and solutions start collapsed
        const allCollapseElements = document.querySelectorAll('.callout-tip .callout-collapse, .callout-note .callout-collapse');
        allCollapseElements.forEach(element => {
            element.classList.remove('show');
            element.setAttribute('aria-expanded', 'false');
        });
        
        // Initialize solution button state
        this.updateSolutionButtonState();
        
        // Update solution button state every second
        this.updateInterval = setInterval(() => {
            try {
                this.updateSolutionButtonState();
            } catch (error) {
                console.warn('Error updating solution button state:', error);
            }
        }, 1000);
        
        // Set up automatic unlock when time is reached (only if unlock is within 24 hours)
        const now = new Date();
        if (now < this.unlockTime) {
            const timeUntilUnlock = this.unlockTime - now;
            
            // Only set timeout if unlock is within 24 hours to prevent memory issues
            if (timeUntilUnlock <= 24 * 60 * 60 * 1000) {
                this.unlockTimeout = setTimeout(() => {
                    try {
                        this.updateSolutionButtonState();
                        // Show simple notification
                        this.showUnlockNotification();
                    } catch (error) {
                        console.error('Error during unlock:', error);
                    }
                }, timeUntilUnlock);
            }
        }
    }
    
    showUnlockNotification() {
        // Create and show unlock notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show solution-unlock-notification" role="alert">
                🎉 <strong>Solutions are now available!</strong> You can click the Solutions button to view them.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Insert at the top of the main content
        const mainContent = document.querySelector('main, .content, body');
        if (mainContent) {
            mainContent.insertBefore(notification, mainContent.firstChild);
        }
        
        // Auto-remove notification after 10 seconds
        setTimeout(() => {
            const notificationElement = document.querySelector('.solution-unlock-notification');
            if (notificationElement) {
                notificationElement.remove();
            }
        }, 10000);
    }
    
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.unlockTimeout) {
            clearTimeout(this.unlockTimeout);
        }
    }
}

// Global functions for button onclick handlers
let solutionManager;

function toggleAllHints() {
    if (solutionManager) {
        solutionManager.toggleAllHints();
    }
}

function toggleAllSolutions() {
    if (solutionManager) {
        solutionManager.toggleAllSolutions();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        solutionManager = new SolutionManager();
        solutionManager.initialize();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            if (solutionManager) {
                solutionManager.cleanup();
            }
        });
        
    } catch (error) {
        console.error('Error initializing Solution Manager:', error);
    }
});
