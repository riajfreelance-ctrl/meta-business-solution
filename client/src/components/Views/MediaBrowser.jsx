import React, { useState, useEffect } from 'react';
import { Image, Play, RefreshCw, Trash2, Tag, Search, Filter, Download, Layers, Clock, Star, Archive } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function MediaBrowser({ brandId }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ingesting, setIngesting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [stats, setStats] = useState({ total: 0, images: 0, videos: 0, matched: 0 });

    useEffect(() => {
        if (brandId) fetchMedia();
    }, [brandId]);

    async function fetchMedia() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/fb/brands/${brandId}/media?limit=100`);
            const data = await res.json();
            if (data.success) {
                setEntries(data.entries || []);
                const imgs = data.entries.filter(e => e.type === 'image').length;
                const vids = data.entries.filter(e => e.type === 'video').length;
                const matched = data.entries.filter(e => e.matchCount > 0).length;
                setStats({ total: data.entries.length, images: imgs, videos: vids, matched });
            }
        } catch (err) {
            console.error('Fetch media error:', err);
        }
        setLoading(false);
    }

    async function handleIngest() {
        setIngesting(true);
        try {
            const res = await fetch(`${API_BASE}/api/fb/brands/${brandId}/media/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 100 })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Ingested! Created: ${data.created}, Duplicates: ${data.duplicates}`);
                fetchMedia();
            }
        } catch (err) {
            console.error('Ingest error:', err);
        }
        setIngesting(false);
    }

    async function handleCleanup() {
        try {
            const res = await fetch(`${API_BASE}/api/fb/media/cleanup`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Cleanup done! Archived: ${data.archived}, Deleted: ${data.deleted}`);
                fetchMedia();
            }
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    }

    async function handleTierChange(mediaId, tier) {
        try {
            await fetch(`${API_BASE}/api/fb/media/${mediaId}/tier`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });
            fetchMedia();
        } catch (err) {
            console.error('Tier change error:', err);
        }
    }

    const filteredEntries = entries.filter(entry => {
        const matchSearch = !searchTerm || 
            (entry.productName && entry.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (entry.message && entry.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (entry.keywords && entry.keywords.some(k => k.includes(searchTerm.toLowerCase())));
        const matchType = filterType === 'all' || entry.type === filterType;
        return matchSearch && matchType;
    });

    const tierColors = {
        1: 'bg-yellow-500/20 text-yellow-300',
        2: 'bg-blue-500/20 text-blue-300',
        3: 'bg-gray-500/20 text-gray-300',
        4: 'bg-red-500/20 text-red-300'
    };

    const tierLabels = {
        1: 'Permanent',
        2: '30 Days',
        3: '7 Days',
        4: 'Delete'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-7 h-7 text-purple-400" />
                        Media Browser
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Facebook posts auto-indexed for image matching
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCleanup}
                        className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 flex items-center gap-2 text-sm"
                    >
                        <Archive className="w-4 h-4" />
                        Cleanup
                    </button>
                    <button
                        onClick={handleIngest}
                        disabled={ingesting}
                        className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                    >
                        <Download className={`w-4 h-4 ${ingesting ? 'animate-bounce' : ''}`} />
                        {ingesting ? 'Ingesting...' : 'Sync FB Posts'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Media', value: stats.total, icon: Layers, color: 'text-purple-400' },
                    { label: 'Images', value: stats.images, icon: Image, color: 'text-blue-400' },
                    { label: 'Videos', value: stats.videos, icon: Play, color: 'text-green-400' },
                    { label: 'Matched', value: stats.matched, icon: Star, color: 'text-yellow-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-xs text-gray-400">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by product name, keywords..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'image', 'video'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                filterType === type
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchMedia}
                    className="p-2.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="ml-3 text-gray-400">Loading media...</span>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No media entries yet</p>
                    <p className="text-sm mt-1">Click "Sync FB Posts" to ingest Facebook posts</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredEntries.map(entry => (
                        <div
                            key={entry.id}
                            className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-all group"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-square bg-gray-900">
                                {entry.imageUrl ? (
                                    <img
                                        src={entry.imageUrl}
                                        alt={entry.productName || 'Media'}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        {entry.type === 'video' ? (
                                            <Play className="w-10 h-10 text-gray-600" />
                                        ) : (
                                            <Image className="w-10 h-10 text-gray-600" />
                                        )}
                                    </div>
                                )}
                                {/* Type Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        entry.type === 'video' ? 'bg-green-500/80 text-white' : 'bg-blue-500/80 text-white'
                                    }`}>
                                        {entry.type === 'video' ? 'Video' : 'Image'}
                                    </span>
                                </div>
                                {/* Match Count Badge */}
                                {entry.matchCount > 0 && (
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/80 text-white flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {entry.matchCount}
                                        </span>
                                    </div>
                                )}
                                {/* Tier Badge */}
                                <div className="absolute bottom-2 right-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[entry.storageTier] || tierColors[2]}`}>
                                        {tierLabels[entry.storageTier] || '30 Days'}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3 space-y-2">
                                {entry.productName && (
                                    <p className="text-sm font-medium text-white truncate">
                                        {entry.productName}
                                    </p>
                                )}
                                {(entry.productPrice || entry.productOfferPrice) && (
                                    <p className="text-sm font-bold text-purple-400">
                                        ৳{entry.productOfferPrice || entry.productPrice}
                                    </p>
                                )}
                                {entry.message && (
                                    <p className="text-xs text-gray-400 line-clamp-2">
                                        {entry.message}
                                    </p>
                                )}
                                {entry.keywords && entry.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {entry.keywords.slice(0, 4).map((kw, i) => (
                                            <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-gray-700/50 text-gray-400">
                                                {kw}
                                            </span>
                                        ))}
                                        {entry.keywords.length > 4 && (
                                            <span className="text-xs text-gray-500">+{entry.keywords.length - 4}</span>
                                        )}
                                    </div>
                                )}
                                {/* Actions */}
                                <div className="flex items-center gap-1 pt-1 border-t border-gray-700/30">
                                    {[1, 2, 3].map(tier => (
                                        <button
                                            key={tier}
                                            onClick={() => handleTierChange(entry.id, tier)}
                                            className={`flex-1 px-1 py-1 rounded text-xs ${
                                                entry.storageTier === tier
                                                    ? 'bg-purple-600/50 text-purple-300'
                                                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30'
                                            }`}
                                            title={tierLabels[tier]}
                                        >
                                            T{tier}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleTierChange(entry.id, 4)}
                                        className="px-1 py-1 rounded text-xs text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

