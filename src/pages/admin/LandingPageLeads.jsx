import { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, Calendar, User, FileText, Search, Filter, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const LandingPageLeads = () => {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pageFilter, setPageFilter] = useState('All');

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [leads, searchTerm, statusFilter, pageFilter]);

    const fetchLeads = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            const res = await fetch('/api/landing-pages/leads/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setLeads(data.leads || []);
            } else {
                setError(data.message || 'Failed to fetch leads');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            const res = await fetch(`/api/landing-pages/leads/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (res.ok) {
                setLeads(leads.map(lead => lead._id === id ? { ...lead, status: newStatus } : lead));
                toast.success(`Lead status updated to ${newStatus}`);
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const applyFilters = () => {
        let result = [...leads];

        // 1. Search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lead => 
                (lead.name && lead.name.toLowerCase().includes(term)) ||
                (lead.email && lead.email.toLowerCase().includes(term)) ||
                (lead.phone && lead.phone.toLowerCase().includes(term)) ||
                (lead.message && lead.message.toLowerCase().includes(term))
            );
        }

        // 2. Status filter
        if (statusFilter !== 'All') {
            result = result.filter(lead => lead.status === statusFilter);
        }

        // 3. Page filter
        if (pageFilter !== 'All') {
            result = result.filter(lead => lead.landingPage?.title === pageFilter);
        }

        setFilteredLeads(result);
    };

    // Metrics
    const totalCount = leads.length;
    const newCount = leads.filter(l => l.status === 'new' || l.status === 'New').length;
    const contactedCount = leads.filter(l => l.status === 'contacted' || l.status === 'Contacted').length;

    // Unique landing page sources
    const uniquePages = ['All', ...new Set(leads.map(l => l.landingPage?.title).filter(Boolean))];

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Landing Page Campaigns Leads</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Review registrations and inquiries captured by specific promotional campaigns.</p>
                </div>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border border-border">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Campaign Submissions</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground font-display">{totalCount}</h3>
                </div>
                <div className="glass-card p-6 border border-border">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Unprocessed Leads</p>
                    <h3 className="text-3xl font-bold mt-2 text-blue-500 font-display">{newCount}</h3>
                </div>
                <div className="glass-card p-6 border border-border">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Followed Up Leads</p>
                    <h3 className="text-3xl font-bold mt-2 text-amber-500 font-display">{contactedCount}</h3>
                </div>
            </div>

            {/* Filtering Control Bar */}
            <div className="glass-card p-6 mb-8 border border-border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search campaigns leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Status Select */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Status:</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Landing Page Source Select */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Campaign:</span>
                            <select 
                                value={pageFilter}
                                onChange={(e) => setPageFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer max-w-[200px]"
                            >
                                {uniquePages.map((title, i) => (
                                    <option key={i} value={title}>{title === 'All' ? 'All Campaigns' : title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20">
                    {error}
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No leads found</h3>
                    <p className="text-muted-foreground mt-1">Try resetting the filters or check back later.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredLeads.map((lead) => (
                        <div key={lead._id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg">{lead.name}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(lead.createdAt), 'PPP p')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                        {lead.landingPage?.title || 'Direct Landing'}
                                    </span>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer outline-none bg-background text-foreground ${
                                            lead.status === 'new' || lead.status === 'New' ? 'border-blue-500/20 text-blue-500 bg-blue-500/5' :
                                            lead.status === 'contacted' || lead.status === 'Contacted' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                                            'border-green-500/20 text-green-500 bg-green-500/5'
                                        }`}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${lead.email}`} className="hover:text-accent font-medium transition-colors">{lead.email}</a>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <a href={`tel:${lead.phone}`} className="hover:text-accent font-medium transition-colors">{lead.phone || 'No phone number provided'}</a>
                                    </div>
                                </div>
                                {lead.message && (
                                    <div className="text-sm text-foreground/80 border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-4">
                                        <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                            <p className="leading-relaxed">{lead.message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default LandingPageLeads;
