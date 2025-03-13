'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Loader2, X } from 'lucide-react';

interface GifSelectorProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const GifSelector = ({ onSelect, onClose }: GifSelectorProps) => {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const TENOR_API_KEY = 'AIzaSyBrMPzkVttzyAg7VECGDlLfMfrMt93V1Us'; 
  
  useEffect(() => {
    const searchGifs = async () => {
      setLoading(true);
      try {
        let url = `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20`;
        
        if (search.trim() !== '') {
          url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(search)}&key=${TENOR_API_KEY}&limit=20`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        setGifs(data.results || []);
      } catch (error) {
        console.error('Erreur lors de la recherche de GIFs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(() => {
      searchGifs();
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [search]);
  
  return (
    <div className="p-4 bg-neutral-900 rounded-md border border-neutral-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Sélectionner un GIF</h3>
        <button 
          onClick={onClose}
          className="text-neutral-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      
      <Input
        placeholder="Rechercher un GIF..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {gifs.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-neutral-400">
              Aucun GIF trouvé
            </div>
          ) : (
            gifs.map((gif) => (
              <div
                key={gif.id}
                className="cursor-pointer hover:opacity-80 transition rounded-md overflow-hidden"
                onClick={() => onSelect(gif.media_formats.gif.url)}
              >
                <img
                  src={gif.media_formats.tinygif.url}
                  alt={gif.content_description}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GifSelector;