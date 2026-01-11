import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Search,
  Filter,
  ChevronDown,
  LogOut,
  Mail,
  Phone,
  User,
  Calendar,
  Video,
  X,
  Check,
  Eye,
  FileText
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  phone: string;
  email: string;
  best_time: string;
  message: string;
  status: string;
  notes: string;
  video_url: string | null;
  video_filename: string | null;
  video_size: number | null;
  video_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const statuses = ['new', 'contacted', 'scheduled', 'interviewed', 'hired', 'rejected'];

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, statusFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.name.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          app.phone.includes(term) ||
          app.message?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setEditingNotes(app.notes || '');
    setEditingStatus(app.status);
  };

  const handleSaveChanges = async () => {
    if (!selectedApp) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: editingStatus,
          notes: editingNotes,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApp.id
            ? { ...app, status: editingStatus, notes: editingNotes }
            : app
        )
      );
      setSelectedApp({ ...selectedApp, status: editingStatus, notes: editingNotes });
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#009975] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.email} - {applications.length} total applications
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-2" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, phone, or message..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-2" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ChevronDown className="inline w-4 h-4 mr-2" />
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-sm text-[#009975] hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <p className="text-gray-600 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{app.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      {app.video_url && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#009975] text-white flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {app.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {app.phone}
                      </div>
                    </div>

                    {app.message && (
                      <p className="text-gray-700 mb-2 line-clamp-2">{app.message}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(app.created_at)}
                      </span>
                      {app.notes && (
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Has notes
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(app)}
                    className="ml-4 px-4 py-2 bg-[#009975] text-white rounded-lg hover:bg-[#007d5e] transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900">{selectedApp.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <a href={`mailto:${selectedApp.email}`} className="text-lg text-[#009975] hover:underline">
                    {selectedApp.email}
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone
                  </label>
                  <a href={`tel:${selectedApp.phone}`} className="text-lg text-[#009975] hover:underline">
                    {selectedApp.phone}
                  </a>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Submitted
                  </label>
                  <p className="text-gray-900">{formatDate(selectedApp.created_at)}</p>
                </div>
              </div>

              {selectedApp.message && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedApp.message}
                  </p>
                </div>
              )}

              {selectedApp.video_url && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Video className="inline w-4 h-4 mr-2" />
                    Video Submission
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <video
                      controls
                      className="w-full rounded-lg mb-2"
                      src={selectedApp.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{selectedApp.video_filename}</span>
                      {selectedApp.video_size && <span>{formatFileSize(selectedApp.video_size)}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors resize-none"
                  placeholder="Add notes about this applicant..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex-1 bg-[#009975] text-white py-3 rounded-lg font-bold hover:bg-[#007d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
