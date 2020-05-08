const axios = require('axios');
// const app_id = 'XXXXXX';
const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "XXXXXX"
};
class PushNotifications {
    static createNotificationMessage(content, title) {
        return {content, title};
    }

    static async sendNotificationToUser(username, message) {
        const body = {
            app_id,
            include_external_user_ids: [username],
            contents: {en: message.content},
            headings: {en: message.title}
        };
        try {
            return await axios.post('https://onesignal.com/api/v1/notifications', body, {headers});
        } catch (e) {
            console.log('Push Notification send failed.', e.message);
        }
    }
}

module.exports = PushNotifications;
