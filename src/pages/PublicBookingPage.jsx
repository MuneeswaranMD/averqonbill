import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreService } from '../lib/firestore';
import {
    Calendar as CalendarIcon, Clock, User, CheckCircle2,
    ChevronRight, MapPin, Building2, Star, ShieldCheck, ArrowLeft, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { Badge } from '../components/ui';


export default function PublicBookingPage() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [existingBookings, setExistingBookings] = useState([]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedService, setSelectedService] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        name: '', email: '', phone: '', notes: '', seats: 1
    });
    const [availabilityInfo, setAvailabilityInfo] = useState(null);

    useEffect(() => {
        if (!companyId) return;
        const fetchData = async () => {
            try {
                const [comp, serv, stf, bks] = await Promise.all([
                    FirestoreService.getCompany(companyId),
                    FirestoreService.getServices(companyId),
                    FirestoreService.getStaff(companyId),
                    FirestoreService.getBookings(companyId)
                ]);
                setCompanyInfo(comp);
                setServices(serv);
                setStaff(stf);
                setExistingBookings(bks);
            } catch (err) {
                console.error("Booking Page Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyId]);

    const availableTimes = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    const getFilteredTimes = () => {
        if (!selectedDate) return availableTimes;

        // For appointments, filter by staff
        if (selectedService?.type === 'appointment' && selectedStaff) {
            const booked = existingBookings
                .filter(b => b.assignedStaffId === selectedStaff.id && isSameDay(new Date(b.date), new Date(selectedDate)))
                .map(b => b.time);
            return availableTimes.filter(t => !booked.includes(t));
        }

        // For resources, check if resource is booked
        if (selectedService?.type === 'resource' && selectedStaff) {
            const booked = existingBookings
                .filter(b => b.resourceId === selectedStaff.id && isSameDay(new Date(b.date), new Date(selectedDate)))
                .map(b => b.time);
            return availableTimes.filter(t => !booked.includes(t));
        }

        return availableTimes;
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        // Reset states for new selection
        setSelectedStaff(null);
        setSelectedDate(null);
        setSelectedTime(null);

        if (service.type === 'event') {
            setStep(3); // Skip staff for events (usually fixed)
        } else {
            setStep(2);
        }
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                customerPhone: customerDetails.phone,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                serviceType: selectedService.type || 'appointment',
                assignedStaffId: selectedStaff?.id || 'any',
                assignedStaff: selectedStaff?.name || 'Any Available',
                resourceId: selectedService.type === 'resource' ? selectedStaff?.id : null,
                date: selectedDate,
                time: selectedTime,
                seats: Number(customerDetails.seats) || 1,
                notes: customerDetails.notes,
                status: 'Confirmed',
                paymentStatus: 'Pending',
                source: 'public_page'
            };
            await FirestoreService.createBooking(bookingData, companyId);
            setStep(5);
        } catch (err) {
            console.error("Save Booking Error:", err);
            alert("Failed to confirm booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 1) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-100 border-t-primary-600 mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Booking Portal...</p>
            </div>
        );
    }

    if (!companyInfo) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest border-2 border-dashed m-10 rounded-3xl">Business link invalid or inactive.</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
            {/* Minimal Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-primary-100">
                        {companyInfo.name[0]}
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-gray-900">{companyInfo.name}</h1>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
                            <MapPin size={10} className="text-primary-500" /> {companyInfo.address || 'Location provided upon booking'}
                        </p>
                    </div>
                </div>
                {step > 1 && step < 5 && (
                    <button onClick={() => setStep(step - 1)} className="text-[10px] font-bold text-gray-400 hover:text-primary-600 flex items-center gap-2 transition-all bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest hover:border-primary-200">
                        <ArrowLeft size={14} /> Back
                    </button>
                )}
            </div>

            <div className="max-w-2xl mx-auto mt-12 px-6">
                {/* Progress Indicators */}
                {step < 5 && (
                    <div className="flex items-center mb-12 overflow-x-auto no-scrollbar justify-between">
                        {[
                            { step: 1, label: 'Service' },
                            { step: 2, label: 'Staff' },
                            { step: 3, label: 'Schedule' },
                            { step: 4, label: 'Guest Info' }
                        ].map((s, idx) => (
                            <div key={s.step} className="flex flex-col items-center flex-1 relative">
                                {idx !== 0 && (
                                    <div className={`absolute top-4 -left-1/2 w-full h-[2px] rounded-full -translate-x-1/2 ${step >= s.step ? 'bg-primary-600' : 'bg-gray-100'}`} />
                                )}
                                <div className={`relative z-10 h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${step === s.step ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 ring-4 ring-primary-50' :
                                    step > s.step ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-300 border-2 border-gray-100'
                                    }`}>
                                    {step > s.step ? <CheckCircle2 size={18} /> : s.step}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-3 ${step >= s.step ? 'text-gray-900' : 'text-gray-300'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-8 md:p-12 mb-8 relative overflow-hidden"
                    >
                        {/* STEP 1: SERVICE SELECTION */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-3xl font-bold mb-2 tracking-tight">Choice of Service</h2>
                                <p className="text-sm font-medium text-gray-400 mb-10 tracking-tight">Select the offering you wish to experience today.</p>

                                <div className="space-y-4">
                                    {services.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No services listed yet.</p>
                                        </div>
                                    ) : services.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className="group flex items-center justify-between p-6 rounded-[2rem] border-2 border-gray-50 hover:border-primary-200 bg-gray-50/30 hover:bg-white cursor-pointer transition-all duration-300"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight text-base">{service.name}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary-500" /> {service.duration || '30 min'}</span>
                                                    <span className="text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">₹{service.price || '0'}</span>
                                                </div>
                                            </div>
                                            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: STAFF SELECTION */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-3xl font-bold mb-2 tracking-tight">
                                    {selectedService?.type === 'resource' ? 'The Resource' : 'The Expert'}
                                </h2>
                                <p className="text-sm font-medium text-gray-400 mb-10 tracking-tight">
                                    {selectedService?.type === 'resource' ? 'Select your preferred facility.' : 'Who would you like to assist you?'}
                                </p>

                                <div className="grid grid-cols-2 gap-5">
                                    <div
                                        onClick={() => { setSelectedStaff({ id: 'any', name: 'Anyone Available', role: 'Next Professional' }); setStep(3); }}
                                        className="group text-center p-8 rounded-[2rem] border-2 border-gray-50 hover:border-primary-200 bg-gray-50/30 hover:bg-white cursor-pointer transition-all duration-300"
                                    >
                                        <div className="h-20 w-20 mx-auto rounded-3xl bg-gray-900 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-gray-200">
                                            <Users size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm">Anyone Available</h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-2 py-1 bg-gray-100 rounded-full inline-block">Fastest Slot</p>
                                    </div>

                                    {staff.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => { setSelectedStaff(member); setStep(3); }}
                                            className="group text-center p-8 rounded-[2rem] border-2 border-gray-50 hover:border-primary-200 bg-gray-50/30 hover:bg-white cursor-pointer transition-all duration-300"
                                        >
                                            <div className="h-20 w-20 mx-auto rounded-3xl bg-primary-50 border-2 border-white flex items-center justify-center text-2xl font-black text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:-translate-y-1 shadow-sm">
                                                {member.name[0]}
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">{member.role || 'Professional'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DATE & TIME */}
                        {step === 3 && (
                            <div className="space-y-10">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 tracking-tight">Appointment</h2>
                                    <p className="text-sm font-medium text-gray-400 tracking-tight">Select your preferred date for the appointment.</p>
                                </div>

                                <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 shadow-inner">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block px-2">Departure Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate || ''}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-8 py-5 bg-white border-2 border-gray-100 rounded-2xl text-base font-bold focus:ring-0 focus:border-primary-500 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    />
                                </div>

                                {selectedDate && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">Curated Time Slots</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {getFilteredTimes().map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-5 rounded-2xl text-xs font-bold transition-all border-2 ${selectedTime === time
                                                        ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200'
                                                        : 'bg-white border-gray-100 text-gray-700 hover:border-primary-600 hover:bg-primary-50/50'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                            {getFilteredTimes().length === 0 && (
                                                <div className="col-span-full py-6 text-center text-xs font-bold text-red-400 uppercase tracking-widest bg-red-50 rounded-3xl border border-red-100">Fully Booked for this date.</div>
                                            )}
                                        </div>

                                        <button
                                            disabled={!selectedTime}
                                            onClick={() => setStep(4)}
                                            className="w-full mt-8 py-6 bg-gray-900 text-white rounded-[2rem] font-bold text-base hover:bg-black transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 uppercase tracking-widest"
                                        >
                                            Save Schedule <ChevronRight size={20} />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: DETAILS */}
                        {step === 4 && (
                            <div className="space-y-10">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 tracking-tight">Your Details</h2>
                                    <p className="text-sm font-medium text-gray-400 tracking-tight">How should we reach out to confirm?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            value={customerDetails.name}
                                            onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-base font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>

                                    {selectedService?.type === 'event' && (
                                        <div className="bg-primary-50 p-6 rounded-[2rem] border border-primary-100 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Number of {selectedService?.category === 'Training' ? 'Students' : 'Tickets'}</h4>
                                                <p className="text-[10px] text-primary-600 font-bold mt-1 uppercase tracking-widest">Remaining: {selectedService.capacity - (availabilityInfo?.bookedSeats || 0)}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-primary-100">
                                                <button
                                                    onClick={() => setCustomerDetails(prev => ({ ...prev, seats: Math.max(1, prev.seats - 1) }))}
                                                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-400 hover:text-primary-600"
                                                >-</button>
                                                <input
                                                    type="number"
                                                    className="w-12 text-center font-bold text-gray-900 outline-none"
                                                    value={customerDetails.seats}
                                                    onChange={e => setCustomerDetails(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                                                />
                                                <button
                                                    onClick={() => setCustomerDetails(prev => ({ ...prev, seats: Math.min(selectedService.capacity, prev.seats + 1) }))}
                                                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-400 hover:text-primary-600"
                                                >+</button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+91..."
                                                value={customerDetails.phone}
                                                onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-base font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="email@example.com"
                                                value={customerDetails.email}
                                                onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-base font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Special Requests</label>
                                        <textarea
                                            placeholder="Any specific notes for the staff?"
                                            rows="3"
                                            value={customerDetails.notes}
                                            onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-base font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Reservation Pass</h4>
                                        <Badge variant="primary" className="uppercase text-[9px]">Verified</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-gray-200/50 pb-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Service Offering</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedService?.name} {customerDetails.seats > 1 && `x ${customerDetails.seats}`}</span>
                                            </div>
                                            <span className="text-sm font-bold text-primary-600">₹{(selectedService?.price || 0) * (customerDetails.seats || 1)}</span>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Time & Date</span>
                                                <span className="text-sm font-bold text-gray-900">{format(new Date(selectedDate), 'EEEE, MMM d')} at {selectedTime}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-right">Expert</span>
                                                <span className="text-sm font-bold text-gray-900 text-right block">{selectedStaff?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={loading || !customerDetails.name || !customerDetails.phone}
                                    className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-bold text-base hover:bg-primary-700 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary-100 uppercase tracking-widest"
                                >
                                    {loading ? 'Securing Spot...' : 'Finalize Reservation'}
                                </button>
                                <p className="text-center text-[9px] font-bold text-gray-300 flex items-center justify-center gap-2 uppercase tracking-[0.2em]"><ShieldCheck size={12} className="text-primary-300" /> End-to-end Encrypted Booking</p>
                            </div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 5 && (
                            <div className="text-center py-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="h-24 w-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100 border-2 border-white"
                                >
                                    <CheckCircle2 size={48} />
                                </motion.div>
                                <h2 className="text-4xl font-bold mb-3 tracking-tighter">You're all set!</h2>
                                <p className="text-gray-400 font-medium mb-12 max-w-xs mx-auto text-sm leading-relaxed">The details have been dispatched to your provided contact. See you soon!</p>

                                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 mb-12 text-left shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Building2 size={80} className="text-gray-400" />
                                    </div>
                                    <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-200 pb-3">Reference #BK-{Math.floor(Math.random() * 90000) + 10000}</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Merchant</span>
                                            <span className="text-base font-bold text-gray-900">{companyInfo.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Service</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedService?.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Expert</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedStaff?.name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Timing</span>
                                            <span className="text-sm font-bold text-gray-900">{format(new Date(selectedDate), 'EEEE, MMM d, yyyy')} • {selectedTime}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => {
                                    setStep(1);
                                    setSelectedService(null);
                                    setSelectedStaff(null);
                                    setSelectedDate(null);
                                    setSelectedTime(null);
                                    setCustomerDetails({ name: '', email: '', phone: '', notes: '' });
                                }} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-[0.3em] bg-primary-50 px-8 py-4 rounded-full border border-primary-100 transition-all hover:shadow-lg">
                                    Book New Session
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* Branding Watermark */}
            <div className="text-center pb-12">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                    <Shield size={10} /> Powered by Averqon Bill
                </p>
            </div>
        </div>
    );
}

function Shield({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}
