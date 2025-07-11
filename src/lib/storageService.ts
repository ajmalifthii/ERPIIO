import { supabase } from './supabaseClient';
import { UploadFile } from 'lucide-react';

export const uploadToSupabase = async (
    file: File,
    bucket: string,
    path: string,
    onProgress: (progress: number) => void
): Promise<{ data: { path: string } | null, error: any }> => {
    
    const uploader = supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
    });
    
    // The event listener for progress is available on the uploader, not the promise it returns
    const subscription = uploader.on('progress', (event) => {
        onProgress((event.loaded / event.total) * 100);
    });

    try {
        const result = await uploader;
        subscription.unsubscribe();
        return result;
    } catch (error) {
        subscription.unsubscribe();
        throw error;
    }
};
