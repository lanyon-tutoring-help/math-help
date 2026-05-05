// 🎮 GAMING HUB ENGINE - Handles all game fetching & execution
const RAW_BASE_URL = 'https://raw.githubusercontent.com/CoolDude2349/Offline-HTML-Games-Pack/master/offline/';

// Global game data
let allGames = [];

// Navigation setup
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.getAttribute('data-section');
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(targetSection).classList.add('active');
    });
});

// Format filename → readable title
function formatGameName(filename) {
    return filename
        .replace(/\.html$/i, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([0-9]+)([a-zA-Z])/g, '$1 $2')
        .replace(/([a-zA-Z])([0-9]+)/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
}

// Game descriptions
function getGameDescription(filename) {
    const name = filename.toLowerCase().replace(/\.html$/i, '');
    const descriptions = {
        '1on1soccer': '1 vs 1 Soccer Match',
        '2048': 'Slide tiles to 2048', 
        'asteroids': 'Destroy asteroids!',
        'breakout': 'Break all bricks',
        'flappybird': 'Fly through pipes',
        'pacman': 'Eat all dots',
        'pong': 'Classic paddle battle',
        'snake': 'Grow your snake',
        'tetris': 'Stack falling blocks',
        'tic-tac-toe': 'X vs O battle',
        'memory': 'Match the cards',
        'minesweeper': 'Find safe tiles',
        'connect4': 'Get 4 in a row'
    };
    return descriptions[name] || 'Classic HTML5 game';
}

// 🚀 FETCH GAMES FROM GITHUB
async function fetchGames() {
    try {
        const loadingScreen = document.getElementById('loadingScreen');
        const gamesGrid = document.getElementById('gamesGrid');
        const gamesCount = document.getElementById('gamesCount');
        const errorMessage = document.getElementById('errorMessage');

        const apiUrl = `https://api.github.com/repos/CoolDude2349/Offline-HTML-Games-Pack/contents/offline?ref=master`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Filter & process HTML games
        allGames = data
            .filter(item => item.name.toLowerCase().endsWith('.html'))
            .map(game => ({
                name: game.name,
                title: formatGameName(game.name),
                description: getGameDescription(game.name),
                rawUrl: RAW_BASE_URL + game.name
            }))
            .sort((a, b) => a.title.localeCompare(b.title));

        // Hide loading
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.style.display = 'none', 500);

        // Update UI
        gamesCount.textContent = allGames.length;
        gamesGrid.innerHTML = allGames.map(game => `
            <div class="game-card" data-game-raw="${game.rawUrl}" data-game-name="${game.name}">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="launch-indicator">🚀 Click to Play</div>
            </div>
        `).join('');

        console.log(`✅ Engine loaded ${allGames.length} games`);

    } catch (error) {
        console.error('Engine error:', error);
        document.getElementById('loadingScreen').innerHTML = `
            <div style="text-align: center; color: #f85149;">
                <div style="font-size: 3em; margin-bottom: 20px;">⚠️</div>
                <div style="font-size: 1.5em; margin-bottom: 10px;">Games failed to load</div>
                <div style="color: #b0b0d0; margin-bottom: 20px;">Check internet</div>
                <button onclick="location.reload()" style="
                    background: linear-gradient(45deg, #58a6ff, #79c0ff); color: white; 
                    border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;
                ">🔄 Retry</button>
            </div>
        `;
    }
}

// 🎮 EXECUTE GAME CODE DIRECTLY (Makes games playable!)
document.addEventListener('click', async (e) => {
    if (e.target.closest('.game-card')) {
        const card = e.target.closest('.game-card');
        const gameRawUrl = card.getAttribute('data-game-raw');
        const gameName = card.getAttribute('data-game-name');
        
        try {
            card.innerHTML = '<div style="color: #58a6ff; font-size: 1.1em;">Loading game...</div>';
            
            // FETCH & EXECUTE GAME HTML
            const response = await fetch(gameRawUrl);
            const gameHTML = await response.text();
            
            // LAUNCH FULLSCREEN GAME
            const gameWindow = window.open('', '_blank', 'fullscreen=yes');
            gameWindow.document.open();
            gameWindow.document.write(gameHTML);
            gameWindow.document.close();
            gameWindow.focus();
            
            if (gameWindow.document.fullscreenEnabled) {
                gameWindow.document.documentElement.requestFullscreen();
            }
            
            // Visual feedback
            setTimeout(() => {
                const game = allGames.find(g => g.name === gameName);
                card.innerHTML = `
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <div class="launch-indicator">✅ Playing!</div>
                `;
                setTimeout(() => {
                    card.innerHTML = `
                        <h3>${game.title}</h3>
                        <p>${game.description}</p>
                        <div class="launch-indicator">🚀 Click to Play</div>
                    `;
                }, 1500);
            }, 1000);
            
        } catch (error) {
            console.error('Game error:', error);
            card.innerHTML = '<div style="color: #f85149;">Failed to load</div>';
            setTimeout(() => {
                const game = allGames.find(g => g.name === gameName);
                card.innerHTML = `
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <div class="launch-indicator">🚀 Click to Play</div>
                `;
            }, 2000);
        }
    }
});

// Unblocker
document.querySelector('.unblocker-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('url').value;
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html><html><head><title>Unblocker</title>
        <style>*{margin:0;padding:0;}body,html{height:100vh;overflow:hidden;background:#000;}
        iframe{width:100vw;height:100vh;border:none;display:block;}</style></head>
        <body><iframe src="${url}" allowfullscreen allow="fullscreen *; autoplay *; pointer-lock *"></iframe></body>
    `);
    win.document.close();
});

// Prevent right-click on games
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.game-card')) e.preventDefault();
});

// 🏁 Initialize when DOM loads
window.addEventListener('load', fetchGames);
