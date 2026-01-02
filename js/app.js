// Główny plik aplikacji - tutaj wszystko się inicjalizuje

console.log('🎮 Clash Royale Game - Loaded!');

// Zapobieganie scrollowaniu na urządzeniach mobilnych
document.addEventListener('touchmove', function(e) {
    if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
}, { passive: false });

// Dodaj style dla animacji shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);