import { FileText, Image as ImageIcon, Download, Share2, Trash2 } from 'lucide-react';

const DocumentCard = ({ doc, onDelete, onShare, showActions = true }) => {
  const isImage = doc.file_type?.startsWith('image/');
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = () => {
    // In a real app, this would fetch from backend /uploads path
    window.open(`http://localhost:5000/${doc.file_path}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col hover:shadow-md transition">
      <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
        {isImage ? (
          <ImageIcon className="w-12 h-12 text-slate-400" />
        ) : (
          <FileText className="w-12 h-12 text-blue-400" />
        )}
      </div>
      
      <h3 className="font-medium text-slate-800 truncate" title={doc.file_name}>{doc.file_name}</h3>
      
      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>{doc.category_name || doc.document_type || 'Uncategorized'}</span>
        <span>{formatDate(doc.upload_date || doc.shared_at)}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={handleDownload}
          className="text-slate-600 hover:text-brand-600 flex items-center text-sm font-medium transition"
        >
          <Download className="w-4 h-4 mr-1" />
          View
        </button>

        {showActions && (
          <div className="flex space-x-3">
            <button 
              onClick={() => onShare(doc)}
              className="text-slate-400 hover:text-blue-600 transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(doc.id)}
              className="text-slate-400 hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
