const otService = {
    collectionName: 'Overtime',

    // ดึงข้อมูล OT ตามงวดเดือน (month_round)
    // ใน js/services/otService.js
    async getRecordsByMonth(monthRound) {
        const cacheKey = `ot_cache_month_${monthRound}`;

        try {
            // 1. ยิงไปขอข้อมูลจาก Firebase (ถ้าเปิด Persistence ไว้ มันจะอ่านจาก Disk Cache ก่อนเร็วมาก)
            const snapshot = await db.collection('ot_records')
                .where('month_round', '==', parseInt(monthRound))
                .get();

            const records = [];
            snapshot.forEach(doc => {
                records.push({ id: doc.id, ...doc.data() });
            });

            // 2. เซฟลง localStorage สำรองไว้อีกชั้น
            localStorage.setItem(cacheKey, JSON.stringify(records));
            this.cachedRecords = records; // เซฟลง RAM

            return { success: true, data: records };
        } catch (error) {
            console.error("Error fetching OT records:", error);
            
            // ถ้า Network มีปัญหา ให้ดึงจาก localStorage ออกมาแทน
            const localData = localStorage.getItem(cacheKey);
            if (localData) {
                return { success: true, data: JSON.parse(localData) };
            }
            return { success: false, error: error.message, data: [] };
        }
    },

    // ดึงข้อมูลตาม Document ID (สำหรับเปิดแก้ไข)
    async getRecordById(docId) {
        try {
            const doc = await db.collection(this.collectionName).doc(docId).get();
            if (doc.exists) {
                return { success: true, data: { id: doc.id, ...doc.data() } };
            }
            return { success: false, error: "Record not found" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // บันทึกข้อมูลใหม่
    async addRecord(data) {
        try {
            const docRef = await db.collection(this.collectionName).add({
                ...data,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // อัปเดตข้อมูลเดิม
    async updateRecord(docId, data) {
        try {
            await db.collection(this.collectionName).doc(docId).update({
                ...data,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // 🟢 เพิ่มฟังก์ชันดึงข้อมูล OT ทั้งหมดเพื่อทำรายงานสรุป
    async getAllRecords() {
        try {
            const snapshot = await db.collection(this.collectionName).get();
            const list = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: list };
        } catch (error) {
            console.error("Error fetching all records:", error);
            return { success: false, error: error.message };
        }
    },

    async deleteRecord(docId) {
        try {
            await db.collection(this.collectionName).doc(docId).delete();
            return { success: true };
        } catch (error) {
            console.error("Error deleting OT record:", error);
            return { success: false, error: error.message };
        }
    }
};