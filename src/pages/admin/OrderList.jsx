import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Search, Filter, DollarSign, Calendar, ArrowUpDown, CreditCard } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, searchTerm, statusFilter, sourceFilter, sortOrder]);

    const fetchOrders = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch('/api/orders/admin/all', {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            const data = await res.json();
            setOrders(data.data || []);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...orders];

        // 1. Search term (Order ID, client name, email)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(order => {
                const idMatch = order._id.toLowerCase().includes(term);
                const nameMatch = (order.user?.name || order.shippingAddress?.fullName || '').toLowerCase().includes(term);
                const emailMatch = (order.user?.email || order.shippingAddress?.email || '').toLowerCase().includes(term);
                return idMatch || nameMatch || emailMatch;
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(order => (order.status || 'Pending').toLowerCase() === statusFilter.toLowerCase());
        }

        // 3. Source Filter
        if (sourceFilter !== 'All') {
            if (sourceFilter === 'Main Store') {
                result = result.filter(order => !order.landingPage);
            } else {
                result = result.filter(order => order.landingPage?.title === sourceFilter);
            }
        }

        // 4. Sort Order
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredOrders(result);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // Pending
        }
    };

    // Metrics calculations
    const totalCount = orders.length;
    const activeCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const uniqueSources = ['All', 'Main Store', ...new Set(orders.map(o => o.landingPage?.title).filter(Boolean))];

    return (
        <AdminLayout>
             {/* Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Client Orders</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Review, track, and manage commercial purchases and client retainers.</p>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Sales count</p>
                        <h3 className="text-3xl font-bold mt-2 text-foreground font-display">{totalCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Package className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Active Retainers</p>
                        <h3 className="text-3xl font-bold mt-2 text-blue-500 font-display">{activeCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Gross Revenue</p>
                        <h3 className="text-3xl font-bold mt-2 text-green-500 font-display">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-6 mb-8 border border-border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by ID, client or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Status dropdown */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Status:</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Source Filter */}
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">Source:</span>
                            <select 
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="bg-transparent text-foreground font-medium outline-none cursor-pointer max-w-[200px]"
                            >
                                {uniqueSources.map((src, i) => (
                                    <option key={i} value={src}>{src}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Toggle */}
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

            {/* Table layout */}
            <div className="glass-card overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Order ID</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Source Channel</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Order Date</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Grand Total</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">Loading orders from database...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No orders matching the criteria found.</td></tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/20 transition-all duration-200">
                                        <td className="p-4 font-mono text-sm">
                                            <Link to={`/admin/orders/${order._id}`} className="text-accent hover:underline font-bold">
                                                #{order._id.substring(order._id.length - 8)}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-foreground text-sm">{order.user?.name || order.shippingAddress?.fullName || 'Guest Client'}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{order.user?.email || order.shippingAddress?.email || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            {order.landingPage ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 border border-purple-500/20 text-purple-600">
                                                    {order.landingPage.title}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-500/10 border border-zinc-500/20 text-muted-foreground">
                                                    Main Website
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <span className="block text-[10px] text-muted-foreground/60 mt-0.5">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-foreground text-sm">${order.totalAmount}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getStatusColor(order.status)}`}>
                                                {order.status || 'Pending'}
                                            </span>
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

export default OrderList;
