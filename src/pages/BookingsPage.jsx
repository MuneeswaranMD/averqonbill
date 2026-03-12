import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Clock, Users, MapPin,
    Plus, Search, Filter, ChevronLeft, ChevronRight,
    MoreVertical, CheckCircle2, XCircle, AlertCircle,
    FileText, User, UserCheck, CreditCard, AlignLeft, Edit2, ExternalLink, Copy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input, Badge } from '../components/ui';

export default function BookingsPage() {
    const { userData } = useAuth();
    const [view, setView] = useState('list'); // 'calendar' or 'list'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        serviceId: '',
        staffId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        seats: 1,
        notes: ''
    });

    useEffect(() => {
        if (userData?.companyId) {
            loadInitialData();
        }
    }, [userData]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [bks, servs, stfs] = await Promise.all([
                FirestoreService.getBookings(userData.companyId),
                FirestoreService.getServices(userData.companyId),
                FirestoreService.getStaff(userData.companyId)
            ]);

            const enrichedBookings = bks.map((b, i) => ({
                ...b,
                id: b.id,
                customerName: b.customerName || 'Walk-in Customer',
                serviceName: b.serviceName || 'Service',
                assignedStaff: b.assignedStaff || 'Professional',
                date: b.date || new Date().toISOString(),
                time: b.time || '10:00 AM',
                status: b.status || 'Pending'
            }));

            setBookings(enrichedBookings);
            setServices(servs);
            setStaff(stfs);
        } catch (error) {
            console.error("Error loading bookings data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBooking = async () => {
        if (!formData.customerName || !formData.serviceId) {
            alert("Please fill in required fields.");
            return;
        }

        setLoading(true);
        try {
            const selectedService = services.find(s => s.id === formData.serviceId);
            const selectedStaff = staff.find(s => s.id === formData.staffId);

            const bookingData = {
                ...formData,
                serviceName: selectedService?.name || 'General Service',
                serviceType: selectedService?.type || 'appointment',
                assignedStaff: selectedStaff?.name || 'Any Available',
                status: 'Confirmed',
                paymentStatus: 'Pending',
                createdAt: new Date().toISOString()
            };

            await FirestoreService.createBooking(bookingData, userData.companyId);
            setIsModalOpen(false);
            loadInitialData();
            // Reset form
            setFormData({
                customerName: '', customerPhone: '', customerEmail: '',
                serviceId: '', staffId: '', date: format(new Date(), 'yyyy-MM-dd'),
                time: '10:00', seats: 1, notes: ''
            });
        } catch (error) {
            console.error("Save booking error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            setLoading(true);
            await FirestoreService.cancelBooking(bookingId, userData.companyId);
            loadInitialData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-base font-semibold text-gray-900 min-w-[150px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Calendar
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        List View
                    </button>
                </div>
            </div>
        );
    };

    const StatusBadge = ({ status }) => {
        const variants = {
            'Confirmed': 'success',
            'Pending': 'warning',
            'Completed': 'primary',
            'Cancelled': 'danger'
        };
        return (
            <Badge variant={variants[status] || 'neutral'}>
                {status}
            </Badge>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/50">
                {days.map((day, i) => (
                    <div key={i} className="py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dayBookings = bookings.filter(b => isSameDay(new Date(b.date), cloneDay));

                days.push(
                    <div
                        key={day}
                        className={`min-h-[120px] p-2 border-r border-b border-gray-50 transition-all cursor-pointer hover:bg-gray-50/50 ${!isSameMonth(day, monthStart) ? "bg-gray-50/20 text-gray-300" : isSameDay(day, new Date()) ? "bg-primary-50/30" : "text-gray-700"
                            }`}
                        onClick={() => {
                            setView('list');
                        }}
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <span className={`text-xs font-medium ${isSameDay(day, new Date()) ? 'h-6 w-6 bg-primary-600 text-white rounded-full flex items-center justify-center' : ''}`}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {dayBookings.slice(0, 3).map((b, idx) => (
                                <div key={idx} className={`px-2 py-1 rounded-md bg-white border shadow-sm overflow-hidden text-[10px] font-medium flex flex-col ${b.status === 'Confirmed' ? 'border-green-100' : 'border-gray-100'}`}>
                                    <span className="truncate text-gray-900 font-semibold">{b.customerName}</span>
                                    <span className="truncate text-[9px] text-gray-500">{b.time}</span>
                                </div>
                            ))}
                            {dayBookings.length > 3 && (
                                <div className="text-[10px] font-semibold text-primary-600 pl-1">
                                    + {dayBookings.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white">{rows}</div>;
    };

    const copyPublicLink = () => {
        const url = `${window.location.origin}/book/${userData.companyId}`;
        navigator.clipboard.writeText(url);
        alert("Public booking link copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Bookings & Appointments</h1>
                    <p className="text-sm text-gray-500">Manage your business schedule and reservations.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={copyPublicLink}
                        className="gap-2 border-primary-100 text-primary-600 hover:bg-primary-50"
                    >
                        <Copy size={16} /> Copy Booking Link
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`/book/${userData.companyId}`, '_blank')}
                        className="gap-2"
                    >
                        <ExternalLink size={16} /> View Public Portal
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-lg shadow-black/5"
                    >
                        <Plus size={18} /> Create Booking
                    </Button>
                </div>
            </div>

            {/* Bookings Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Bookings', count: bookings.length, variant: 'neutral' },
                    { label: "Today's", count: bookings.filter(b => isSameDay(new Date(b.date), new Date())).length, variant: 'primary' },
                    { label: 'Pending', count: bookings.filter(b => b.status === 'Pending').length, variant: 'warning' },
                    { label: 'Completed', count: bookings.filter(b => b.status === 'Completed').length, variant: 'success' }
                ].map((card, i) => (
                    <Card key={i} className="flex flex-col items-center justify-center py-6">
                        <span className="text-2xl font-bold text-gray-900">{card.count}</span>
                        <Badge variant={card.variant} className="mt-2 uppercase tracking-tighter text-[10px]">
                            {card.label}
                        </Badge>
                    </Card>
                ))}
            </div>

            <Card noPad className="overflow-hidden">
                {renderHeader()}

                {view === 'calendar' ? (
                    <div className="animate-in fade-in duration-300">
                        {renderDays()}
                        {renderCells()}
                    </div>
                ) : (
                    <div className="p-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                All Bookings
                            </h3>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="px-3">
                                    <Filter size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Provider/Res.</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Seats/Qty</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-gray-400 font-medium italic">Loading bookings...</td></tr>
                                    ) : bookings.length === 0 ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-gray-400 font-medium italic">No bookings found.</td></tr>
                                    ) : (
                                        bookings.filter(b => b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase())).map((b, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-4 font-mono text-xs font-semibold text-gray-500">{b.id}</td>
                                                <td className="py-4 px-4">
                                                    <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{b.customerName}</div>
                                                </td>
                                                <td className="py-4 px-4 font-medium text-gray-600 text-sm">
                                                    <div>{b.serviceName}</div>
                                                    <Badge variant="neutral" className="text-[9px] uppercase tracking-tighter mt-1">{b.serviceType || 'Appt'}</Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-700">
                                                        <User size={12} className="text-gray-400" />
                                                        {b.assignedStaff}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{format(new Date(b.date), 'MMM d, yyyy')}</span>
                                                        <span className="text-[10px] font-medium text-gray-500 uppercase">{b.time}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm font-bold text-gray-900">{b.seats || 1}</span>
                                                </td>
                                                <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => alert('Edit ' + b.id)}>
                                                            <Edit2 size={14} className="text-gray-400 group-hover:text-primary-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleCancelBooking(b.id)}>
                                                            <XCircle size={14} className="text-gray-400 group-hover:text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>

            {/* Booking Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Create Booking</h3>
                                        <p className="text-xs text-gray-500">Schedule new appointment</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-full">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Customer Details</h4>
                                    </div>
                                    <div className="col-span-full">
                                        <Input
                                            label="Customer Name *"
                                            placeholder="Full Name"
                                            icon={<User />}
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Phone"
                                        placeholder="+1..."
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                    <Input
                                        label="Email"
                                        placeholder="@"
                                        value={formData.customerEmail}
                                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    />

                                    <div className="col-span-full mt-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Appointment Details</h4>
                                    </div>
                                    <div className="space-y-1.5 w-full">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase">Service / Package *</label>
                                        <select
                                            className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            value={formData.serviceId}
                                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                        >
                                            <option value="">Select Service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 w-full">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase">Assigned Staff *</label>
                                        <select
                                            className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            value={formData.staffId}
                                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                        >
                                            <option value="">Any Available Staff</option>
                                            {staff.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="Date *"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Time Slot *"
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                        <Input
                                            label="Seats / Qty"
                                            type="number"
                                            value={formData.seats}
                                            onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest mb-1.5 uppercase">Internal Notes</label>
                                        <textarea
                                            rows="3"
                                            placeholder="Add any special requirements or notes..."
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none resize-none placeholder:text-gray-400"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                                <Button
                                    onClick={handleSaveBooking}
                                    className="w-full h-12 text-base"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Confirm & Save Booking'}
                                </Button>
                                <p className="text-center text-[10px] font-medium text-gray-400">Customer will receive an automated confirmation.</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
