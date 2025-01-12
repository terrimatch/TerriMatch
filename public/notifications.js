const NOTIFICATION_SOUNDS = {
    message: new Audio('/sounds/message.mp3'),
    call: new Audio('/sounds/call.mp3'),
    terricoin: new Audio('/sounds/coin.mp3')
};

// Preia notificările stocate
const getStoredNotifications = () => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
};

// Salvează notificările
const storeNotifications = (notifications) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
};

// Verifică dacă utilizatorul a permis notificările
const checkNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

// Redă sunetul pentru tipul de notificare
const playNotificationSound = (type) => {
    const sound = NOTIFICATION_SOUNDS[type];
    if (sound) {
        sound.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
};

// Exportă funcțiile pentru a fi folosite în aplicație
window.notifications = {
    getStoredNotifications,
    storeNotifications,
    checkNotificationPermission,
    playNotificationSound
};
