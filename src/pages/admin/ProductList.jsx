import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package, Layers, DollarSign, Image } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, searchTerm, categoryFilter]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            console.error("Error deleting product", err);
        }
    };

    const applyFilters = () => {
        let result = [...products];

        // 1. Search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product => 
                (product.name && product.name.toLowerCase().includes(term)) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }

        // 2. Category Filter
        if (categoryFilter !== 'All') {
            result = result.filter(product => product.category === categoryFilter);
        }

        setFilteredProducts(result);
    };

    // Metrics
    const totalCount = products.length;
    const uniqueCategoriesCount = [...new Set(products.map(p => p.category).filter(Boolean))].length;
    const avgPrice = products.length > 0 
        ? Math.round(products.reduce((sum, p) => sum + (Number(p.basePrice) || 0), 0) / products.length)
        : 0;

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Services & Products</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Configure, price, and organize catalog items showcased on your portfolio website.</p>
                </div>
                <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20">
                    <Plus className="w-4 h-4" /> Add New Item
                </Link>
            </div>

            {/* Inventory Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Catalog Items</p>
                        <h3 className="text-3xl font-bold mt-2 text-foreground font-display">{totalCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Package className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Service Categories</p>
                        <h3 className="text-3xl font-bold mt-2 text-blue-500 font-display">{uniqueCategoriesCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Layers className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass-card p-6 border border-border flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Average Pricing</p>
                        <h3 className="text-3xl font-bold mt-2 text-green-500 font-display">${avgPrice}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                        <DollarSign className="w-5 h-5" />
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
                            placeholder="Search products & services..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs w-full md:w-auto">
                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Category:</span>
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
                        >
                            {categories.map((cat, i) => (
                                <option key={i} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                            ))}
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
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Service / Product Details</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Base Rate</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground tracking-widest text-right uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">Loading catalog items...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No catalog items match search filter.</td></tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-muted/20 transition-all duration-200">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                                                    {product.image || product.images?.[0] ? (
                                                        <img src={product.image || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <Image className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm">{product.name}</h4>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[250px] mt-0.5" title={product.description}>
                                                        {product.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent">
                                                {product.category || 'Standard Service'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-foreground text-sm">${product.basePrice}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link 
                                                    to={`/admin/products/${product._id}/edit`} 
                                                    title="Edit Item"
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    title="Delete Item"
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
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

export default ProductList;
