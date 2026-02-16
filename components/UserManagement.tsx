import React, { useState, useEffect } from 'react';
import { NotificationType } from '../types';

interface User {
    id: number;
    username: string;
    role: string;
}

interface UserManagementProps {
    notify: (type: NotificationType, message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ notify }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('vortex_token');
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            } else {
                notify('error', 'Failed to load users');
            }
        } catch (e) {
            notify('error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const token = localStorage.getItem('vortex_token');
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                notify('success', `User ${data.user.username} created!`);
                setUsers([...users, data.user]);
                setUsername('');
                setPassword('');
                setRole('user');
            } else {
                notify('error', data.error || 'Failed to create user');
            }
        } catch (e) {
            notify('error', 'Network error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">User Management</h1>
                <p className="text-secondary">Create and manage access for employees.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="glass-panel p-6 rounded-3xl h-fit">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-user-plus text-accent"></i>
                        New User
                    </h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                                placeholder="e.g. employee_john"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="user">User (Employee)</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 mt-4"
                        >
                            {isCreating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-users text-accent"></i>
                        Active Users
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-accent"></i>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-2">Username</th>
                                        <th className="pb-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pl-2 font-medium text-white">{user.username}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="py-8 text-center text-zinc-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
