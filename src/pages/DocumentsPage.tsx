import { useState, useEffect } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { commonClasses } from '../lib/commonClasses';
import { uploadToSupabase } from '../lib/storageService';
import { supabase } from '../lib/supabaseClient';
import { Document } from '../types';

export const DocumentsPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [docName, setDocName] = useState('');
    const [relatedTo, setRelatedTo] = useState('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('documents').select('*');
        if (error) {
            toast.error("Failed to fetch documents.");
            setError(error.message);
        } else {
            setDocuments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }
        if (!docName) {
            toast.error('Please enter a name for the document.');
            return;
        }

        setUploading(true);
        setProgress(0);
        const path = `public/${docName.replace(/ /g, '_')}_${Date.now()}`;

        try {
            await uploadToSupabase(file, 'documents', path, setProgress);
            
            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

            const { error: dbError } = await supabase.from('documents').insert({
                name: docName,
                related_to: relatedTo,
                file_path: path,
                url: publicUrl,
                file_type: file.type,
                file_size: file.size,
            });

            if (dbError) throw dbError;

            toast.success('Document uploaded successfully!');
            fetchDocuments();
        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            setFile(null);
            setDocName('');
            setRelatedTo('');
        }
    };

    return (
        <div className="space-y-4">
            <FormCard title="Upload New Document">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} className={commonClasses.input} placeholder="Document Name" disabled={uploading} />
                    <input type="text" value={relatedTo} onChange={(e) => setRelatedTo(e.target.value)} className={commonClasses.input} placeholder="Related To (e.g. SO-001)" disabled={uploading}/>
                    <input type="file" onChange={handleFileChange} className={`${commonClasses.input} pt-1.5`} disabled={uploading} />
                </div>
                {uploading && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-sm text-center mt-1">{Math.round(progress)}% uploaded...</p>
                    </div>
                )}
                <div className="flex justify-end pt-2">
                    <button onClick={handleUpload} className={commonClasses.button} disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </FormCard>
            <DataTable 
                title="Uploaded Documents"
                columns={['Name', 'Type', 'Related To', 'Upload Date', 'Size (KB)', 'Actions']}
                data={documents.map(doc => [
                    doc.file_name,
                    doc.file_type,
                    doc.related_to_id,
                    new Date(doc.uploaded_at).toLocaleDateString(),
                    (doc.file_size / 1024).toFixed(2),
                    <div className="flex space-x-1">
                        <a href={supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Download className="h-4 w-4 text-gray-600 dark:text-gray-300" /></a>
                        <button className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-300" /></button>
                    </div>
                ])}
                loading={loading}
                error={error}
            />
        </div>
    );
};
