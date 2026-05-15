import { useState, useEffect } from 'react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import ShareModal from '../components/ShareModal';
import { Search } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [shareDoc, setShareDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (error) {
        console.error('Error deleting document', error);
      }
    }
  };

  // Extract unique categories from actual user documents for filtering
  const uniqueCategories = [...new Set(documents.map(doc => doc.document_type).filter(Boolean))];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase());
    // In our simplified backend we stored type in document_type or category indirectly
    const matchesCategory = categoryFilter === '' || doc.document_type === categoryFilter || doc.file_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Vault</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and access your secure documents</p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Types</option>
            {uniqueCategories.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
            <option value="application/pdf">PDFs</option>
            <option value="image/jpeg">Images</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No documents found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your filters or upload a new file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              doc={doc} 
              onDelete={handleDelete}
              onShare={(docToShare) => setShareDoc(docToShare)}
            />
          ))}
        </div>
      )}

      {shareDoc && (
        <ShareModal 
          document={shareDoc} 
          onClose={() => setShareDoc(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
