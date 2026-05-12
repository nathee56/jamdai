const fs = require('fs');
const path = 'src/app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove duplicate AI banner and stat card blocks
// Looking for the pattern from 1700 to 1820 roughly
content = content.replace(/\/\* ===== AI SUMMARY BANNER ===== \*\/[\s\S]*?(\/\* ===== AI CHAT LAYOUT SYSTEM ===== \*\/)/g, (match, p1) => {
    // Keep only the first occurrence or a clean version
    return `/* ===== AI SUMMARY BANNER ===== */
.ai-banner {
  background: linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%);
  border: none !important;
  color: #fff;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
}

.ai-banner::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.ai-banner .input {
  background: rgba(255,255,255,0.15) !important;
  border-color: rgba(255,255,255,0.2) !important;
  color: #fff !important;
}

/* ===== PROGRESS BAR ===== */
.progress-bar-fill {
  background: var(--accent) !important;
}

${p1}`;
});

// 2. Fix button:disabled
content = content.replace(/button:disabled \{[\s\S]*?\}/g, `button:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}`);

// 3. Ensure ai-chat-input-area doesn't block
content = content.replace(/\.ai-chat-input-area \{([\s\S]*?)z-index: 10;/g, '.ai-chat-input-area {$1z-index: 5;');

fs.writeFileSync(path, content);
console.log('Cleanup complete');
