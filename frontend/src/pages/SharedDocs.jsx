import { useState, useEffect } from 'react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import { Users } from 'lucide-react';

const SharedDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedDocs = async () => {
      try {
        const response = await api.get('/share');
        // Structure map to match the fields DocumentCard expects visually
        const mappedDocs = response.data.map(doc => ({
           id: doc.share_id,
           file_name: `${doc.file_name} (Shared by ${doc.owner_name})`,
           file_path: doc.file_path,
           upload_date: doc.shared_at,
           category_name: `Permission: ${doc.permission_type}`
        }));
        setDocuments(mappedDocs);
      } catch (error) {
        console.error('Failed to fetch shared documents', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDocs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Users className="mr-3 text-brand-600" /> Shared With Me
        </h1>
        <p className="text-slate-500 text-sm mt-1">Documents securely shared with your account</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No shared documents</h3>
          <p className="text-slate-500 mt-1">You currently don't have any documents shared by other users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              doc={doc} 
              showActions={false} // Disable Share & Delete for shared docs received
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDocs;
