const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
  });

  // Load the app
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Get tournaments directory path
const getTournamentsPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'CurrentTournaments');
};

// Ensure CurrentTournaments directory exists
async function ensureTournamentsDirectory() {
  const tournamentsPath = getTournamentsPath();
  try {
    await fs.access(tournamentsPath);
  } catch {
    await fs.mkdir(tournamentsPath, { recursive: true });
  }
  return tournamentsPath;
}

// IPC Handlers
ipcMain.handle('tournaments:getAll', async () => {
  try {
    const tournamentsPath = await ensureTournamentsDirectory();
    const entries = await fs.readdir(tournamentsPath, { withFileTypes: true });
    
    const tournaments = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const tournamentPath = path.join(tournamentsPath, entry.name);
        const jsonPath = path.join(tournamentPath, 'tournament.json');
        
        try {
          const data = await fs.readFile(jsonPath, 'utf-8');
          const tournament = JSON.parse(data);
          console.log(`Loaded tournament ${tournament.name} with ${tournament.participants?.length || 0} participants`);
          tournaments.push(tournament);
        } catch (error) {
          console.error(`Error reading tournament ${entry.name}:`, error);
        }
      }
    }
    
    return { success: true, tournaments };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tournaments:create', async (event, tournamentName) => {
  try {
    const tournamentsPath = await ensureTournamentsDirectory();
    const tournamentPath = path.join(tournamentsPath, tournamentName);
    
    // Check if tournament already exists
    try {
      await fs.access(tournamentPath);
      return { success: false, error: 'Tournament name already exists' };
    } catch {
      // Tournament doesn't exist, we can create it
    }
    
    // Create tournament directory
    await fs.mkdir(tournamentPath, { recursive: true });
    
    // Create pictures subdirectory
    const picturesPath = path.join(tournamentPath, 'pictures');
    await fs.mkdir(picturesPath, { recursive: true });
    
    // Create tournament.json
    const tournament = {
      id: Date.now(),
      name: tournamentName,
      createdAt: new Date().toISOString(),
      status: 'setup',
      participants: [],
      currentRound: 0,
      icon: 'mdi-trophy',
      colors: {
        primary: '#FF69B4',
        background: '#1a1a2e'
      }
    };
    
    const jsonPath = path.join(tournamentPath, 'tournament.json');
    await fs.writeFile(jsonPath, JSON.stringify(tournament, null, 2), 'utf-8');
    
    return { success: true, tournament };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tournaments:getPath', async () => {
  return getTournamentsPath();
});

ipcMain.handle('tournaments:update', async (event, tournament) => {
  try {
    const tournamentsPath = await ensureTournamentsDirectory();
    const tournamentPath = path.join(tournamentsPath, tournament.name);
    const jsonPath = path.join(tournamentPath, 'tournament.json');
    
    console.log(`Saving tournament ${tournament.name} with ${tournament.participants?.length || 0} participants`);
    await fs.writeFile(jsonPath, JSON.stringify(tournament, null, 2), 'utf-8');
    console.log(`Tournament saved to ${jsonPath}`);
    
    return { success: true, tournament };
  } catch (error) {
    console.error('Error saving tournament:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tournaments:saveParticipantImage', async (event, tournamentName, fileName, base64Data) => {
  try {
    const tournamentsPath = await ensureTournamentsDirectory();
    const tournamentPath = path.join(tournamentsPath, tournamentName);
    const picturesPath = path.join(tournamentPath, 'pictures');
    
    // Ensure pictures directory exists
    await fs.mkdir(picturesPath, { recursive: true });
    
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Save image
    const imagePath = path.join(picturesPath, fileName);
    await fs.writeFile(imagePath, buffer);
    
    // Return relative path for use in the app
    return { success: true, imagePath: `pictures/${fileName}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tournaments:getImageData', async (event, tournamentName, imagePath) => {
  try {
    const tournamentsPath = await ensureTournamentsDirectory();
    const tournamentPath = path.join(tournamentsPath, tournamentName);
    const fullImagePath = path.join(tournamentPath, imagePath);
    
    const imageBuffer = await fs.readFile(fullImagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(fullImagePath).slice(1);
    
    return { success: true, dataUrl: `data:image/${ext};base64,${base64Image}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
