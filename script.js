// Data Models based on project documentation
const DB = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    questions: JSON.parse(localStorage.getItem('questions')) || [],
    answers: JSON.parse(localStorage.getItem('answers')) || [],
    courses: JSON.parse(localStorage.getItem('courses')) || [],
    notifications: JSON.parse(localStorage.getItem('notifications')) || [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
};

// Initialize data if empty
function initializeData() {
    if (DB.courses.length === 0) {
        // Based on https://www.mathos.unios.hr/prijediplomski-studij-matematika-i-racunarstvo/studijski-program/
        DB.courses = [
            // 1st year
            { _id: 'c1', name: 'Matematička analiza 1', yearId: 1, description: 'Granične vrijednosti, neprekidnost, derivacija, integracija', joined: 45 },
            { _id: 'c2', name: 'Linearna algebra 1', yearId: 1, description: 'Vektori, matrice, determinante, sustavi linearnih jednadžbi', joined: 42 },
            { _id: 'c3', name: 'Programiranje 1', yearId: 1, description: 'Osnove programiranja u Pythonu i C++', joined: 48 },
            { _id: 'c4', name: 'Računalna arhitektura', yearId: 1, description: 'Osnove računalnih sustava i digitalne logike', joined: 40 },
            { _id: 'c5', name: 'Engleski jezik za IT 1', yearId: 1, description: 'Stručna terminologija iz područja IT-a', joined: 38 },
            
            // 2nd year
            { _id: 'c6', name: 'Matematička analiza 2', yearId: 2, description: 'Višestruki integrali, diferencijalne jednadžbe', joined: 35 },
            { _id: 'c7', name: 'Linearna algebra 2', yearId: 2, description: 'Vektorski prostori, linearne transformacije', joined: 33 },
            { _id: 'c8', name: 'Programiranje 2', yearId: 2, description: 'Objektno orijentirano programiranje i algoritmi', joined: 36 },
            { _id: 'c9', name: 'Diferencijalna geometrija', yearId: 2, description: 'Krivulje i plohe u prostoru', joined: 30 },
            { _id: 'c10', name: 'Diskretna matematika', yearId: 2, description: 'Teorija skupova, relacije, kombinatorika', joined: 34 },
            { _id: 'c11', name: 'Baze podataka', yearId: 2, description: 'Relacijske baze, SQL, normalizacija', joined: 38 },
            
            // 3rd year
            { _id: 'c12', name: 'Numerička analiza', yearId: 3, description: 'Numeričke metode za rješavanje matematičkih problema', joined: 28 },
            { _id: 'c13', name: 'Vjerojatnost i statistika', yearId: 3, description: 'Slučajne varijable, statistička analiza', joined: 30 },
            { _id: 'c14', name: 'Web programiranje', yearId: 3, description: 'HTML, CSS, JavaScript, backend tehnologije', joined: 32 },
            { _id: 'c15', name: 'Softversko inženjerstvo', yearId: 3, description: 'Metodologije razvoja softvera, UML, agilni procesi', joined: 29 }
        ];
        saveData();
    }

    // Add sample questions if empty
    if (DB.questions.length === 0) {
        DB.questions = [
            {
                _id: 'q1',
                title: 'Kako riješiti homogenu diferencijalnu jednadžbu?',
                content: 'Imam problem s rješavanjem dy/dx = (x^2 + y^2)/xy. Pokušao sam supstituciju y = vx, ali ne dobijem pravi rezultat.',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                userId: 'u1',
                courseId: 'c6',
                attachments: [],
                author: { username: 'IvanM', role: 'user' }
            },
            {
                _id: 'q2',
                title: 'SQL JOIN operacije - razlika između LEFT i INNER',
                content: 'Može li netko objasniti kada koristiti LEFT JOIN vs INNER JOIN? Imam dva primjera pa ne razumijem razliku u rezultatima.',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                userId: 'u2',
                courseId: 'c11',
                attachments: [],
                author: { username: 'AnaK', role: 'user' }
            },
            {
                _id: 'q3',
                title: 'Dokaz Cauchy-Schwarzove nejednakosti',
                content: 'Trebam pomoć s dokazom u Linearnoj algebri 2. Kako najbolje krenuti s dokazom?',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                userId: 'u3',
                courseId: 'c7',
                attachments: ['http://static.photos/white/320x240/1'],
                author: { username: 'MarkoP', role: 'user' }
            }
        ];
        
        DB.answers = [
            {
                _id: 'a1',
                content: 'Kod homogenih jednadžbi, supstitucija y = vx je točan pristup. Podsjetnik: dy = v dx + x dv. Uvrsti to u jednadžbu i separiraj varijable.',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                userId: 'u4',
                questionId: 'q1',
                author: { username: 'ProfAsst', role: 'admin' },
                isHighlighted: true
            }
        ];
        
        saveData();
    }
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(DB.users));
    localStorage.setItem('questions', JSON.stringify(DB.questions));
    localStorage.setItem('answers', JSON.stringify(DB.answers));
    localStorage.setItem('courses', JSON.stringify(DB.courses));
    localStorage.setItem('notifications', JSON.stringify(DB.notifications));
    if (DB.currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(DB.currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Auth functions
function register(username, email, password) {
    if (DB.users.find(u => u.email === email)) {
        return { success: false, message: 'Email već postoji' };
    }
    if (DB.users.find(u => u.username === username)) {
        return { success: false, message: 'Korisničko ime već postoji' };
    }
    
    const user = {
        _id: 'u' + Date.now(),
        username,
        email,
        password: btoa(password), // Simple hash for demo
        role: 'user',
        joinedCourses: [],
        createdAt: new Date().toISOString()
    };
    
    DB.users.push(user);
    saveData();
    return { success: true, user };
}

function login(email, password) {
    const user = DB.users.find(u => u.email === email && u.password === btoa(password));
    if (!user) {
        return { success: false, message: 'Neispravni podaci za prijavu' };
    }
    DB.currentUser = user;
    saveData();
    return { success: true, user };
}

function logout() {
    DB.currentUser = null;
    saveData();
    window.location.href = 'index.html';
}

function isAuthenticated() {
    return DB.currentUser !== null;
}

function checkAuth() {
    if (!isAuthenticated() && !window.location.href.includes('login') && !window.location.href.includes('register')) {
        // Redirect to login for protected pages
        if (window.location.href.includes('profile') || window.location.href.includes('notifications')) {
            window.location.href = 'login.html';
        }
    }
}

// Question functions
function createQuestion(title, content, courseId, attachments = []) {
    if (!isAuthenticated()) return { success: false, message: 'Potrebna prijava' };
    
    const question = {
        _id: 'q' + Date.now(),
        title,
        content,
        courseId,
        userId: DB.currentUser._id,
        author: {
            username: DB.currentUser.username,
            role: DB.currentUser.role
        },
        attachments,
        createdAt: new Date().toISOString()
    };
    
    DB.questions.push(question);
    saveData();
    
    // Simulate real-time notification
    broadcastNewQuestion(question);
    
    return { success: true, question };
}

function getQuestions(courseId = null, search = '') {
    let questions = [...DB.questions];
    
    if (courseId) {
        questions = questions.filter(q => q.courseId === courseId);
    }
    
    if (search) {
        const term = search.toLowerCase();
        questions = questions.filter(q => 
            q.title.toLowerCase().includes(term) || 
            q.content.toLowerCase().includes(term) ||
            getCourseName(q.courseId).toLowerCase().includes(term)
        );
    }
    
    return questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getQuestion(id) {
    return DB.questions.find(q => q._id === id);
}

// Answer functions
function createAnswer(content, questionId) {
    if (!isAuthenticated()) return { success: false, message: 'Potrebna prijava' };
    
    const answer = {
        _id: 'a' + Date.now(),
        content,
        questionId,
        userId: DB.currentUser._id,
        author: {
            username: DB.currentUser.username,
            role: DB.currentUser.role
        },
        createdAt: new Date().toISOString(),
        isHighlighted: false
    };
    
    DB.answers.push(answer);
    
    // Create notification for question author
    const question = getQuestion(questionId);
    if (question && question.userId !== DB.currentUser._id) {
        createNotification(question.userId, `Novi odgovor na "${question.title}" od ${DB.currentUser.username}`);
    }
    
    saveData();
    broadcastNewAnswer(answer, questionId);
    
    return { success: true, answer };
}

function getAnswers(questionId) {
    return DB.answers
        .filter(a => a.questionId === questionId)
        .sort((a, b) => {
            if (a.isHighlighted !== b.isHighlighted) return a.isHighlighted ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
}

// Notification functions
function createNotification(userId, message) {
    const notification = {
        _id: 'n' + Date.now(),
        userId,
        message,
        read: false,
        createdAt: new Date().toISOString()
    };
    DB.notifications.push(notification);
    saveData();
    return notification;
}

function getNotifications(userId) {
    return DB.notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function markNotificationRead(id) {
    const notif = DB.notifications.find(n => n._id === id);
    if (notif) {
        notif.read = true;
        saveData();
    }
}

function getUnreadCount(userId) {
    return DB.notifications.filter(n => n.userId === userId && !n.read).length;
}

// Course functions
function getCourse(id) {
    return DB.courses.find(c => c._id === id);
}

function getCourseName(id) {
    const course = getCourse(id);
    return course ? course.name : 'Nepoznati kolegij';
}

function getCoursesByYear(yearId) {
    return DB.courses.filter(c => c.yearId === yearId);
}

function joinCourse(courseId) {
    if (!isAuthenticated()) return { success: false, message: 'Potrebna prijava' };
    
    const course = getCourse(courseId);
    if (!course) return { success: false, message: 'Kolegij ne postoji' };
    
    if (!DB.currentUser.joinedCourses.includes(courseId)) {
        DB.currentUser.joinedCourses.push(courseId);
        course.joined = (course.joined || 0) + 1;
        
        // Update user in users array
        const userIndex = DB.users.findIndex(u => u._id === DB.currentUser._id);
        if (userIndex !== -1) {
            DB.users[userIndex] = DB.currentUser;
        }
        
        saveData();
    }
    return { success: true };
}

// Wikipedia API integration
async function fetchWikipediaSummary(term) {
    try {
        const response = await fetch(`https://hr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        return {
            title: data.title,
            extract: data.extract,
            thumbnail: data.thumbnail?.source || null,
            url: data.content_urls?.desktop?.page
        };
    } catch (error) {
        return null;
    }
}

// Real-time simulation (BroadcastChannel or localStorage events)
function broadcastNewQuestion(question) {
    const event = new StorageEvent('storage', {
        key: 'newQuestion',
        newValue: JSON.stringify(question)
    });
    window.dispatchEvent(event);
}

function broadcastNewAnswer(answer, questionId) {
    const event = new StorageEvent('storage', {
        key: 'newAnswer',
        newValue: JSON.stringify({ answer, questionId })
    });
    window.dispatchEvent(event);
}

// UI Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'upravo sada';
    if (minutes < 60) return `prije ${minutes} min`;
    if (hours < 24) return `prije ${hours} sati`;
    if (days < 7) return `prije ${days} dana`;
    return date.toLocaleDateString('hr-HR');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast border-l-4 ${type === 'success' ? 'border-primary-500' : type === 'error' ? 'border-red-500' : 'border-secondary-500'}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-feather="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="${type === 'success' ? 'text-primary-500' : type === 'error' ? 'text-red-500' : 'text-secondary-500'}"></i>
            <span class="font-medium text-gray-800">${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    feather.replace();
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStats() {
    const users = document.getElementById('statUsers');
    const questions = document.getElementById('statQuestions');
    const answers = document.getElementById('statAnswers');
    
    if (users) users.textContent = DB.users.length + 127; // Simulated existing users
    if (questions) questions.textContent = DB.questions.length;
    if (answers) answers.textContent = DB.answers.length;
}

function loadRecentQuestions() {
    const container = document.getElementById('recentQuestions');
    if (!container) return;
    
    const questions = DB.questions.slice(0, 4);
    container.innerHTML = '';
    
    questions.forEach(q => {
        const card = document.createElement('custom-question-card');
        card.setAttribute('id', q._id);
        card.setAttribute('title', q.title);
        card.setAttribute('content', q.content.substring(0, 100) + '...');
        card.setAttribute('author', q.author.username);
        card.setAttribute('course', getCourseName(q.courseId));
        card.setAttribute('date', formatDate(q.createdAt));
        card.setAttribute('answers', DB.answers.filter(a => a.questionId === q._id).length);
        container.appendChild(card);
    });
}

// File upload simulation
function handleFileUpload(file) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate upload delay
            const url = `http://static.photos/document/320x240/${Math.floor(Math.random() * 1000)}`;
            resolve({ success: true, url, name: file.name });
        }, 1000);
    });
}

// Initialize
initializeData();
checkAuth();

// Listen for real-time updates
window.addEventListener('storage', (e) => {
    if (e.key === 'newQuestion' || e.key === 'newAnswer') {
        // Reload data
        DB.questions = JSON.parse(localStorage.getItem('questions')) || [];
        DB.answers = JSON.parse(localStorage.getItem('answers')) || [];
        DB.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // Update UI if on relevant page
        if (e.key === 'newAnswer' && window.location.href.includes('question.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const questionId = urlParams.get('id');
            const data = JSON.parse(e.newValue);
            if (data.questionId === questionId) {
                loadAnswers(questionId);
                showToast('Novi odgovor dodan!');
            }
        }
    }
});