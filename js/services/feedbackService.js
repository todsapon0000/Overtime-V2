const feedbackService = {
    collectionName: 'Feedback',

    // 🟢 ฟังก์ชันแปลงไฟล์รูปเป็นข้อความ Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // 🟢 บันทึกลง Firestore
    async addFeedback(data) {
        try {
            const docRef = await db.collection(this.collectionName).add({
                ...data,
                status: 'pending',
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    async getAllFeedbacks() {
        try {
            // db ดึงมาจาก firebase.firestore() ใน database.js
            const snapshot = await db.collection('Feedback')
                                      .orderBy('created_at', 'desc') // เรียงจากล่าสุดขึ้นก่อน
                                      .get();

            const feedbackList = [];
            snapshot.forEach(doc => {
                feedbackList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, data: feedbackList };
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            return { success: false, error: error.message };
        }
    },

    async updateFeedbackStatus(docId, newStatus) {
        try {
            if (typeof db === 'undefined' || !db) {
                return { success: false, error: 'ยังไม่ได้เชื่อมต่อฐานข้อมูล Firestore' };
            }

            // 🟢 อัปเดตฟิลด์ status ใน Collection 'Feedback'
            await db.collection('Feedback').doc(docId).update({
                status: newStatus,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating status:", error);
            return { success: false, error: error.message };
        }
    }
};