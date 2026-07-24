const fs = require('fs');
const css = `
/* Active Lesson Pulse Animations */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;
fs.appendFileSync('src/app/globals.css', css);
console.log('Added pulse animations');
