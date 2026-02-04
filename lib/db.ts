import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface User {
    id: string;
    email: string;
    password?: string; // In real app, hash this!
    name: string;
    coins: number;
    referralCode: string;
    referredBy?: string;
    joinedAt: string;
}

export interface Task {
    id: string;
    title: string;
    reward: number;
    type: 'visit' | 'ad' | 'quiz' | 'checkin';
    url?: string; // For visit/ad
    cooldown?: number; // Minutes
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'earn' | 'game_win' | 'game_loss' | 'withdraw' | 'bonus';
    description: string;
    createdAt: string;
}

export interface GameHistory {
    id: string;
    userId: string;
    bet: number;
    result: 'win' | 'loss';
    createdAt: string;
}

interface DBSchema {
    users: User[];
    tasks: Task[];
    transactions: Transaction[];
    gameHistory: GameHistory[];
}

const initialData: DBSchema = {
    users: [],
    tasks: [
        { id: 't1', title: 'Daily Check-in', reward: 50, type: 'checkin', cooldown: 1440 },
        { id: 't2', title: 'Watch Video Ad', reward: 20, type: 'ad', url: 'https://youtube.com', cooldown: 30 },
        { id: 't3', title: 'Visit Sponsor Site', reward: 15, type: 'visit', url: 'https://google.com', cooldown: 60 },
    ],
    transactions: [],
    gameHistory: []
};

function readDB(): DBSchema {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading DB:", error);
        return initialData;
    }
}

function writeDB(data: DBSchema) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing DB:", error);
    }
}

// Helper methods
export const db = {
    getUsers: () => readDB().users,
    addUser: (user: User) => {
        const data = readDB();
        data.users.push(user);
        writeDB(data);
        return user;
    },
    findUserByEmail: (email: string) => readDB().users.find(u => u.email === email),
    findUserById: (id: string) => readDB().users.find(u => u.id === id),
    updateUserCoins: (id: string, amount: number) => {
        const data = readDB();
        const user = data.users.find(u => u.id === id);
        if (user) {
            user.coins += amount;
            writeDB(data);
        }
        return user;
    },

    getTasks: () => readDB().tasks,

    addTransaction: (tx: Transaction) => {
        const data = readDB();
        data.transactions.push(tx);
        // Also update user balance logic is usually separate but let's assume caller handles consistency or we do it here
        // For safety, let's keep it atomic-ish in controller
        writeDB(data);
        return tx;
    },
    getUserTransactions: (userId: string) => readDB().transactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

    addGameHistory: (history: GameHistory) => {
        const data = readDB();
        data.gameHistory.push(history);
        writeDB(data);
    },
    getUserGameHistory: (userId: string) => readDB().gameHistory.filter(h => h.userId === userId)
};
