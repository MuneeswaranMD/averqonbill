import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    getDoc,
    query, 
    where, 
    orderBy,
    serverTimestamp,
    setDoc,
    increment,
    writeBatch
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  export const FirestoreService = {
    // --- Generic Multi-Tenant CRUD Operations ---
    async add(collectionName, data, companyId) {
      if (!companyId) throw new Error("Company ID is required for data isolation.");
      return addDoc(collection(db, collectionName), {
        ...data,
        companyId,
        createdAt: serverTimestamp(),
      });
    },

    // --- Stock Management ---
    async reduceStock(items, companyId, reason = 'Order Created') {
      if (!companyId || !items || items.length === 0) return;
      
      const batch = writeBatch(db);
      const logPromises = [];

      items.forEach(item => {
        if (!item.productId) return;
        
        const qtyToReduce = Math.abs(Number(item.qty || 1));
        const productRef = doc(db, 'products', item.productId);
        
        // Reduce stock
        batch.update(productRef, {
          stock: increment(-qtyToReduce)
        });

        // Add log entry (matching StockPage.jsx structure)
        logPromises.push(this.add('stock_logs', {
          productId: item.productId,
          productName: item.name || 'Unknown Product',
          type: 'remove',
          qty: qtyToReduce,
          reason: reason,
          by: 'System (Auto)',
          companyId
        }, companyId));
      });

      await batch.commit();
      await Promise.all(logPromises);
    },
  
    async getAllByCompany(collectionName, companyId, filters = [], sort = [orderBy('createdAt', 'desc')]) {
      if (!companyId) return [];
      const q = query(
        collection(db, collectionName),
        where('companyId', '==', companyId),
        ...filters,
        ...sort
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    async getById(collectionName, id) {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },
  
    async update(collectionName, id, data) {
      const docRef = doc(db, collectionName, id);
      return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    },
  
    async delete(collectionName, id) {
      const docRef = doc(db, collectionName, id);
      return deleteDoc(docRef);
    },
  
    // --- Admin Operations (Super Admin) ---
    async createCompany(companyData) {
        const companyRef = collection(db, 'companies');
        return addDoc(companyRef, {
            ...companyData,
            status: 'active',
            createdAt: serverTimestamp()
        });
    },
  
    // --- Products ---
    async getProducts(companyId) {
      return this.getAllByCompany('products', companyId);
    },
  
    // --- Orders ---
    async getOrders(companyId) {
      return this.getAllByCompany('orders', companyId);
    },
  
    // --- Customers ---
    async getCustomers(companyId) {
      return this.getAllByCompany('customers', companyId);
    },

    // --- Invoices ---
    async getInvoices(companyId) {
      return this.getAllByCompany('invoices', companyId);
    },

    // --- Estimates ---
    async getEstimates(companyId) {
      return this.getAllByCompany('estimates', companyId);
    },

    // --- Dispatches ---
    async getDispatches(companyId) {
      return this.getAllByCompany('dispatches', companyId);
    },
    
    // --- Bookings ---
    async getBookings(companyId) {
      return this.getAllByCompany('bookings', companyId);
    },

    async createBooking(bookingData, companyId) {
      if (!companyId) throw new Error("Company ID required");
      
      // 1. Double check availability server-side if possible,
      // but for now, we'll proceed with creation
      const res = await this.add('bookings', {
          ...bookingData,
          status: bookingData.status || 'Pending',
          paymentStatus: bookingData.paymentStatus || 'Unpaid',
          createdAt: new Date().toISOString()
      }, companyId);

      // 2. Trigger automation
      await this.triggerAutomation('booking_created', { 
          ...bookingData, 
          bookingId: res.id,
          companyId 
      }, companyId);

      return res;
    },

    async updateBookingStatus(bookingId, status, companyId) {
        await this.update('bookings', bookingId, { status });
        await this.triggerAutomation('booking_updated', { bookingId, status, companyId }, companyId);
    },

    async cancelBooking(bookingId, companyId) {
        return this.updateBookingStatus(bookingId, 'Cancelled', companyId);
    },

    // --- Smart Availability Logic ---
    async checkAvailability(companyId, { serviceId, date, staffId, resourceId, bookingType }) {
        const bookings = await this.getAllByCompany('bookings', companyId, [
           where('date', '==', date),
           where('status', '!=', 'Cancelled')
        ]);

        if (bookingType === 'event') {
            // Check capacity for the specific event/tour
            const service = await this.getById('services', serviceId);
            const bookedSeats = bookings
                .filter(b => b.serviceId === serviceId)
                .reduce((sum, b) => sum + (Number(b.seats) || 1), 0);
            
            return {
                available: bookedSeats < (service.capacity || 1),
                remainingSeats: (service.capacity || 1) - bookedSeats
            };
        }

        if (bookingType === 'resource') {
            // Check if resource is blocked for requested time
            // Simple slot check for now
            const isBlocked = bookings.some(b => b.resourceId === resourceId);
            return { available: !isBlocked };
        }

        // Default appointment logic: Check staff availability
        const staffBookedTimes = bookings
            .filter(b => b.staffId === staffId)
            .map(b => b.time);
        
        return { bookedTimes: staffBookedTimes };
    },

    // --- Staff ---
    async getStaff(companyId) {
      return this.getAllByCompany('staff', companyId);
    },

    async addStaff(staffData, companyId) {
        return this.add('staff', staffData, companyId);
    },

    // --- Services ---
    async getServices(companyId) {
        return this.getAllByCompany('services', companyId);
    },

    async addService(serviceData, companyId) {
        return this.add('services', {
            ...serviceData,
            type: serviceData.type || 'appointment', // appointment, event, resource
            capacity: serviceData.capacity || 1
        }, companyId);
    },

    // --- Onboarding Helpers ---
    async setupNewCompany(userId, bizData) {
        // 1. Create Company with industry + modules
        const companyRef = await addDoc(collection(db, 'companies'), {
            ...bizData,
            ownerUid: userId,
            status: 'active',
            plan: 'starter',
            industry: bizData.industry || 'custom',
            modules: bizData.modules || [],
            createdAt: serverTimestamp()
        });

        const companyId = companyRef.id;

        // 2. Link User to Company
        await setDoc(doc(db, 'users', userId), {
            companyId,
            role: 'admin'
        }, { merge: true });

        return companyId;
    },

    // --- Company Helpers ---
    async getCompany(companyId) {
        if (!companyId) return null;
        const snap = await getDoc(doc(db, 'companies', companyId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    // --- Automation (n8n Integration) ---
    async triggerAutomation(eventType, data, companyId) {
        console.log(`[n8n] Triggering ${eventType} for company ${companyId}`, data);
        try {
            const company = await this.getCompany(companyId);
            const webhookUrl = company?.webhooks?.[eventType];
            
            if (webhookUrl) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: eventType,
                        timestamp: new Date().toISOString(),
                        data
                    })
                });
            }
        } catch (err) {
            console.error("Automation Trigger Error:", err);
        }
        return { success: true };
    }
  };
  
