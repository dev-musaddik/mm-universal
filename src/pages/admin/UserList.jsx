import { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, ShieldAlert } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch('/api/auth/admin/users', {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            const data = await res.json();
            setUsers(data.users || data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Change role to ${newRole}?`)) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`/api/auth/admin/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            } else {
                alert("Failed to update role");
            }
        } catch (err) {
            console.error("Error updating role", err);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    return (
        <AdminLayout>
             {/* Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Assign administrative privileges and inspect registered account status.</p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Registered Accounts</p>
                        <h3 className="text-3xl font-bold mt-2 text-foreground font-display">{totalUsers}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">System Administrators</p>
                        <h3 className="text-3xl font-bold mt-2 text-blue-500 font-display">{adminCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 mb-8 border border-border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs w-full md:w-auto">
                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Role:</span>
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                        >
                            <option value="All">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">User Profile</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Access Role</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Join Date</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground tracking-widest text-right uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                             {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/20 transition-all duration-200">
                                        <td className="p-4">
                                            <div className="font-bold text-foreground text-sm">{user.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${
                                                user.role === 'admin' 
                                                    ? 'bg-accent/10 border-accent/20 text-accent' 
                                                    : 'bg-muted border-border text-muted-foreground'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                             <button 
                                                onClick={() => handleRoleUpdate(user._id, user.role)}
                                                className="p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-colors"
                                                title="Toggle Admin Privilege"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
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

export default UserList;
