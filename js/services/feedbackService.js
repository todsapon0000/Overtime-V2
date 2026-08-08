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
    }
};