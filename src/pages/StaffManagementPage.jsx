import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Shield, Mail, Phone,
    MapPin, CheckCircle2, XCircle, MoreHorizontal,
    Search, Filter, Key, Edit2, Trash2, Calendar, Activity,
    Clock, Star, TrendingUp, DollarSign, CalendarDays
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input, Badge } from '../components/ui';

export default function StaffManagementPage() {
    const { userData } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('directory'); // directory, schedule, performance, services
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [staffForm, setStaffForm] = useState({ name: '', role: 'Professional', email: '', phone: '', department: 'Operations' });
    const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '30 min', description: '', type: 'appointment', capacity: 1 });

    useEffect(() => {
        if (userData?.companyId) {
            loadAllData();
        }
    }, [userData]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [stf, srv] = await Promise.all([
                FirestoreService.getStaff(userData.companyId),
                FirestoreService.getServices(userData.companyId)
            ]);
            setStaff(stf);
            setServices(srv);
        } catch (error) {
            console.error("Error loading staff data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!staffForm.name || !staffForm.email) return;
        setLoading(true);
        try {
            await FirestoreService.addStaff({
                ...staffForm,
                status: 'Active',
            }, userData.companyId);
            setIsModalOpen(false);
            loadAllData();
            setStaffForm({ name: '', role: 'Professional', email: '', phone: '', department: 'Operations' });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddService = async () => {
        if (!serviceForm.name || !serviceForm.price) return;
        setLoading(true);
        try {
            await FirestoreService.addService(serviceForm, userData.companyId);
            loadAllData();
            setServiceForm({ name: '', price: '', duration: '30 min', description: '', type: 'appointment', capacity: 1 });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filteredStaff = staff.filter(member => {
        return (member.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (member.email || '').toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-sm text-gray-500">Manage employees, schedules, and track performance.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2"
                >
                    <UserPlus size={18} /> Add Staff
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit border border-gray-200">
                {[
                    { id: 'directory', label: 'Directory', icon: Users },
                    { id: 'schedule', label: 'Scheduling', icon: CalendarDays },
                    { id: 'services', label: 'Services', icon: Shield },
                    { id: 'performance', label: 'Performance', icon: Activity }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* DIRECTORY TAB */}
            {activeTab === 'directory' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="p-3">
                        <div className="max-w-md">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search />}
                            />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-gray-400 font-medium italic">Loading team members...</div>
                        ) : filteredStaff.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-400 font-medium italic">No staff members found matching criteria.</div>
                        ) : filteredStaff.map((member, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={member.id}
                            >
                                <Card className="group relative overflow-hidden h-full flex flex-col">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-[2.5rem] group-hover:bg-primary-50 transition-colors" />

                                    <div className="flex items-start justify-between mb-6 relative">
                                        <div className="h-16 w-16 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            {member.name?.[0] || 'U'}
                                        </div>
                                        <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>
                                            {member.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{member.name || 'Unnamed User'}</h3>
                                            <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wider">{member.role || 'Employee'} • {member.department}</p>
                                        </div>

                                        <div className="space-y-2.5 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                <span>{member.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-50">
                                        <Button variant="outline" size="sm" className="w-full text-[10px] uppercase tracking-wider">
                                            <Edit2 size={12} className="mr-1.5" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-wider border border-transparent hover:border-red-100">
                                            <XCircle size={12} className="mr-1.5" /> Disable
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="lg:col-span-1 h-fit sticky top-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add New Service</h3>
                                <p className="text-xs text-gray-500 mt-1">Define properties for your offering.</p>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Service Name"
                                    placeholder="e.g. Standard Haircut"
                                    value={serviceForm.name}
                                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Price (₹)"
                                        type="number"
                                        placeholder="0.00"
                                        value={serviceForm.price}
                                        onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })}
                                    />
                                    <Input
                                        label="Duration"
                                        placeholder="30 min"
                                        value={serviceForm.duration}
                                        onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Model</label>
                                        <select
                                            value={serviceForm.type}
                                            onChange={e => setServiceForm({ ...serviceForm, type: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none"
                                        >
                                            <option value="appointment">Appointment</option>
                                            <option value="event">Event / Tour</option>
                                            <option value="resource">Resource / Room</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Capacity / Seats"
                                        type="number"
                                        placeholder="1"
                                        value={serviceForm.capacity}
                                        onChange={e => setServiceForm({ ...serviceForm, capacity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none resize-none"
                                        rows="4"
                                        placeholder="What's included?"
                                        value={serviceForm.description}
                                        onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <Button className="w-full bg-gray-900 hover:bg-black" onClick={handleAddService} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Service'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="lg:col-span-2 space-y-4">
                        {services.length === 0 ? (
                            <div className="py-20 text-center text-gray-400 font-medium italic bg-white rounded-2xl border-2 border-dashed">No services defined yet.</div>
                        ) : services.map((service, i) => (
                            <Card key={i} className="group hover:border-primary-200 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4 items-start">
                                        <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                                            {service.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{service.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <Badge variant="neutral" className="text-[10px] tracking-widest">{service.duration}</Badge>
                                                <Badge variant="primary" className="text-[9px] uppercase tracking-wider">{service.type}</Badge>
                                                {service.type === 'event' && <Badge variant="warning" className="text-[9px]">Cap: {service.capacity}</Badge>}
                                                <span className="text-sm font-bold text-primary-600 ml-auto">₹{service.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit2 size={14} className="text-gray-400" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Trash2 size={14} className="text-gray-400" /></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === 'schedule' && (
                <Card noPad className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Weekly Staff Schedule</h3>
                        <Button variant="outline" size="sm">Modify Schedule</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <th key={day} className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium italic">Loading schedule...</td></tr>
                                ) : filteredStaff.map((member, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">{member.name}</div>
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase">{member.role}</div>
                                        </td>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                            <td key={day} className="py-4 px-4 text-center">
                                                <div className="inline-flex flex-col items-center justify-center bg-primary-50 text-primary-700 rounded-lg px-2.5 py-1 border border-primary-100">
                                                    <span className="text-[9px] font-bold uppercase">9:00 AM</span>
                                                    <span className="text-[9px] font-bold uppercase text-primary-400">6:00 PM</span>
                                                </div>
                                            </td>
                                        ))}
                                        {['Sat', 'Sun'].map(day => (
                                            <td key={day} className="py-4 px-4 text-center">
                                                <div className="inline-flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg px-3 py-1 text-[10px] font-semibold uppercase">
                                                    Off
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Bookings', value: '342', icon: CalendarDays, color: 'primary' },
                            { label: 'Revenue Generated', value: '$45,200', icon: DollarSign, color: 'success' },
                            { label: 'Average Rating', value: '4.8/5', icon: Star, color: 'warning' },
                            { label: 'Services Completed', value: '310', icon: CheckCircle2, color: 'primary' }
                        ].map((stat, i) => (
                            <Card key={i} className="flex items-center gap-4 py-5">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary-50 text-primary-600' :
                                    stat.color === 'success' ? 'bg-green-50 text-green-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                    <p className="text-xl font-bold text-gray-900 leading-none">{stat.value}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card noPad>
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Staff Performance Metrics</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Bookings Handled</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Revenue Generated</th>
                                        <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Average Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((member, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">{member.name}</div>
                                                <div className="text-[10px] font-semibold text-gray-400 uppercase">{member.role}</div>
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-gray-700">{Math.floor(Math.random() * 100) + 20}</td>
                                            <td className="py-4 px-4 text-center font-bold text-gray-700">${(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-1 text-amber-500">
                                                    <Star size={14} className="fill-amber-500" />
                                                    <span className="font-bold text-gray-700">{(Math.random() * 1 + 4).toFixed(1)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Invite/Add Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }} className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">New Staff Member</h3>
                                        <p className="text-sm text-gray-500">Create a profile and assign permissions</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={22} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-full">
                                        <Input
                                            label="Full Name *"
                                            placeholder="John Doe"
                                            value={staffForm.name}
                                            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase">Role *</label>
                                        <select
                                            className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            value={staffForm.role}
                                            onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                                        >
                                            <option>Manager</option>
                                            <option>Professional</option>
                                            <option>Support</option>
                                            <option>Technician</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase">Department</label>
                                        <select
                                            className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            value={staffForm.department}
                                            onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                                        >
                                            <option>Operations</option>
                                            <option>Sales</option>
                                            <option>Technical</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Email Address *"
                                        type="email"
                                        placeholder="teammate@company.com"
                                        value={staffForm.email}
                                        onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                    />
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="+1..."
                                        value={staffForm.phone}
                                        onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                                    />

                                    <div className="col-span-full pt-4">
                                        <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-3">Working Hours Default</label>
                                        <div className="flex gap-4">
                                            <Input type="time" label="Start Time" defaultValue="09:00" />
                                            <Input type="time" label="End Time" defaultValue="18:00" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
                                <Button onClick={handleAddStaff} className="w-full h-12 text-base" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Staff Member'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
