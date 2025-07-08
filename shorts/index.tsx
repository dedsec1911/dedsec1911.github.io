// File: /pages/index.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setVideoUrl('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      else setError(data.error || 'Something went wrong');
    } catch (e) {
      setError('Failed to generate short');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">YouTube Shorts Generator</h1>
      <Input
        placeholder="Enter YouTube video link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading || !url}>
        {loading ? 'Processing...' : 'Generate Short'}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
      {videoUrl && (
        <Card className="mt-4 w-full">
          <CardContent>
            <video src={videoUrl} controls className="w-full rounded-xl" />
            <a
              href={videoUrl}
              download
              className="text-blue-500 underline mt-2 inline-block"
            >
              Download Short
            </a>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
