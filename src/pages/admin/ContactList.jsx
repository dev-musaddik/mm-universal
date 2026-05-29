import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search, Filter, Calendar, BarChart3, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-hot-toast';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [contacts, searchTerm, statusFilter, sourceFilter, dateFilter, sortOrder]);

    const fetchContacts = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch('/api/contacts', {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setContacts(data);
            } else {
                if (res.status === 401) {
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                    return;
                }
                toast.error(data.message || 'Failed to fetch messages');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading messages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`/api/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            if (res.ok) {
                setContacts(contacts.filter(c => c._id !== id));
                toast.success('Message deleted');
            } else {
                toast.error('Failed to delete');
            }
        } catch (err) {
            toast.error('Error deleting message');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`/api/contacts/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setContacts(contacts.map(c => c._id === id ? { ...c, status: newStatus } : c));
                toast.success(`Marked as ${newStatus}`);
            }
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    // Helper to determine the lead source from the subject
    const getLeadSource = (subject = '') => {
        if (subject.includes('Page:')) {
            const parts = subject.split('Page:');
            return parts[parts.length - 1].trim();
        }
        if (subject.includes('SEO')) return 'SEO Services';
        if (subject.includes('Design')) return 'Design Services';
        if (subject.includes('Creative')) return 'Creative Services';
        if (subject.includes('Ads')) return 'Ads Management Services';
        if (subject.includes('Development') || subject.includes('Web')) return 'Web Development Services';
        return 'General Contact';
    };

    const applyFiltersAndSort = () => {
        let result = [...contacts];

        // 1. Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c => 
                (c.name && c.name.toLowerCase().includes(term)) ||
                (c.email && c.email.toLowerCase().includes(term)) ||
                (c.subject && c.subject.toLowerCase().includes(term)) ||
                (c.message && c.message.toLowerCase().includes(term))
            );
        }

        // 2. Status filter
        if (statusFilter !== 'All') {
            result = result.filter(c => c.status === statusFilter);
        }

        // 3. Source page filter
        if (sourceFilter !== 'All') {
            result = result.filter(c => getLeadSource(c.subject) === sourceFilter);
        }

        // 4. Date filter
        if (dateFilter !== 'All Time') {
            const now = new Date();
            result = result.filter(c => {
                const date = new Date(c.createdAt);
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (dateFilter === 'Today') {
                    return date.toDateString() === now.toDateString();
                }
                if (dateFilter === 'Last 7 Days') {
                    return diffDays <= 7;
                }
                if (dateFilter === 'Last 30 Days') {
                    return diffDays <= 30;
                }
                return true;
            });
        }

        // 5. Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredContacts(result);
    };

    // Calculate Analytics Statistics
    const totalLeads = contacts.length;
    const newLeads = contacts.filter(c => c.status === 'New').length;
    const repliedLeads = contacts.filter(c => c.status === 'Replied').length;
    const replyRate = totalLeads > 0 ? Math.round((repliedLeads / totalLeads) * 100) : 0;

    // Get list of unique sources for filter dropdown
    const uniqueSources = ['All', ...new Set(contacts.map(c => getLeadSource(c.subject)))];

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Leads & Inquiries</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage, filter, and track conversion leads captured across your portfolio.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3.5 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                        Live Data Connected
                    </span>
                </div>
            </div>

            {/* Premium Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Mail className="w-16 h-16 text-foreground" />
                    </div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Leads</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground font-display">{totalLeads}</h3>
                    <p className="text-xs text-muted-foreground mt-2">All submissions logged</p>
                </div>
                
                <div className="glass-card p-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">New Inquiries</p>
                    <h3 className="text-3xl font-bold mt-2 text-blue-500 font-display">{newLeads}</h3>
                    <p className="text-xs text-blue-500 mt-2">Awaiting your response</p>
                </div>

                <div className="glass-card p-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Replied Leads</p>
                    <h3 className="text-3xl font-bold mt-2 text-green-500 font-display">{repliedLeads}</h3>
                    <p className="text-xs text-green-500 mt-2">Successfully closed</p>
                </div>

                <div className="glass-card p-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BarChart3 className="w-16 h-16 text-purple-500" />
                    </div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Response Rate</p>
                    <h3 className="text-3xl font-bold mt-2 text-purple-500 font-display">{replyRate}%</h3>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-3.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${replyRate}%` }} />
                    </div>
                </div>
            </div>

            {/* Premium Filter Controls */}
            <div className="glass-card p-6 mb-8 border border-border space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Field */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, email, subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Filter controls row */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Status:</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="Read">Read</option>
                                <option value="Replied">Replied</option>
                            </select>
                        </div>

                        {/* Page Source Filter */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Source:</span>
                            <select 
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer max-w-[150px]"
                            >
                                {uniqueSources.map((source, i) => (
                                    <option key={i} value={source}>{source === 'All' ? 'All Pages' : source}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                            >
                                <option value="All Time">All Time</option>
                                <option value="Today">Today</option>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                            </select>
                        </div>

                        {/* Sort Order Toggle */}
                        <button
                            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                            className="flex items-center gap-2 bg-background border border-border hover:bg-muted/50 px-3 py-2 rounded-xl text-xs transition-colors"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                                Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                            </span>
                        </button>

                    </div>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="glass-card overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Lead Source & Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Inquiry Message</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Logged Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock className="w-5 h-5 animate-spin text-accent" />
                                            <span>Loading messages from database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        No leads found matching current filtering settings.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact._id} className="hover:bg-muted/20 transition-all duration-200">
                                        
                                        {/* Status Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                contact.status === 'New' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                contact.status === 'Read' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                                                'bg-green-500/10 text-green-600 border border-green-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    contact.status === 'New' ? 'bg-blue-500' :
                                                    contact.status === 'Read' ? 'bg-amber-500' :
                                                    'bg-green-500'
                                                }`} />
                                                {contact.status}
                                            </span>
                                        </td>

                                        {/* Client Info */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground text-sm">{contact.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{contact.email}</div>
                                        </td>

                                        {/* Source & Subject */}
                                        <td className="px-6 py-4">
                                            <span className="inline-block text-[10px] font-extrabold uppercase bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded mb-1">
                                                {getLeadSource(contact.subject)}
                                            </span>
                                            <div className="text-xs text-foreground font-semibold line-clamp-1 max-w-[200px]" title={contact.subject}>
                                                {contact.subject}
                                            </div>
                                        </td>

                                        {/* Message Body */}
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed" title={contact.message}>
                                                {contact.message}
                                            </p>
                                        </td>

                                        {/* Created Date */}
                                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                            <span className="block text-[10px] text-muted-foreground/60 mt-0.5">
                                                {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {contact.status === 'New' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(contact._id, 'Read')}
                                                        title="Mark as Read"
                                                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {contact.status !== 'Replied' && (
                                                     <button 
                                                        onClick={() => handleStatusUpdate(contact._id, 'Replied')}
                                                        title="Mark as Replied"
                                                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-500/20"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(contact._id)}
                                                    title="Delete Lead"
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ContactList;
