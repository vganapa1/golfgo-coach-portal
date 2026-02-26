import { useState } from 'react';

interface HoleImage {
  hole: number;
  label: string;
  path: string;
}

const HOLE_IMAGES: HoleImage[] = [
  { hole: 1,  label: 'Hole 1',  path: '/course-images/hole-1.pdf' },
  { hole: 2,  label: 'Hole 2',  path: '/course-images/hole-2.pdf' },
  { hole: 3,  label: 'Hole 3',  path: '/course-images/hole-3.pdf' },
  { hole: 4,  label: 'Hole 4',  path: '/course-images/hole-4.pdf' },
  { hole: 4,  label: 'Hole 4 Green', path: '/course-images/hole-4-green.pdf' },
  { hole: 5,  label: 'Hole 5',  path: '/course-images/hole-5.pdf' },
  { hole: 6,  label: 'Hole 6',  path: '/course-images/hole-6.pdf' },
  { hole: 7,  label: 'Hole 7',  path: '/course-images/hole-7.pdf' },
  { hole: 8,  label: 'Hole 8',  path: '/course-images/hole-8.pdf' },
  { hole: 8,  label: 'Hole 8 Green', path: '/course-images/hole-8-green.pdf' },
  { hole: 9,  label: 'Hole 9',  path: '/course-images/hole-9.pdf' },
  { hole: 10, label: 'Hole 10', path: '/course-images/hole-10.pdf' },
  { hole: 11, label: 'Hole 11', path: '/course-images/hole-11.pdf' },
  { hole: 12, label: 'Hole 12', path: '/course-images/hole-12.pdf' },
  { hole: 13, label: 'Hole 13', path: '/course-images/hole-13.pdf' },
  { hole: 14, label: 'Hole 14', path: '/course-images/hole-14.pdf' },
  { hole: 15, label: 'Hole 15', path: '/course-images/hole-15.pdf' },
  { hole: 16, label: 'Hole 16', path: '/course-images/hole-16.pdf' },
  { hole: 16, label: 'Hole 16 Green', path: '/course-images/hole-16-green.pdf' },
  { hole: 17, label: 'Hole 17', path: '/course-images/hole-17.pdf' },
  { hole: 18, label: 'Hole 18', path: '/course-images/hole-18.pdf' },
];

export default function CourseImageGallery() {
  const [selectedImage, setSelectedImage] = useState<HoleImage | null>(null);
  const [selectedHole, setSelectedHole] = useState<number | 'all'>('all');

  const filtered = selectedHole === 'all'
    ? HOLE_IMAGES
    : HOLE_IMAGES.filter(img => img.hole === selectedHole);

  return (
    <>
      {/* Hole filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">Filter:</label>
        <select
          value={selectedHole}
          onChange={(e) => setSelectedHole(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="all">All Holes</option>
          {Array.from({ length: 18 }, (_, i) => i + 1).map(h => (
            <option key={h} value={h}>Hole {h}</option>
          ))}
        </select>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {filtered.map((img) => (
          <button
            key={img.path}
            onClick={() => setSelectedImage(img)}
            className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md hover:border-gray-400 transition-all text-center"
          >
            <div className="w-full aspect-[3/4] bg-gray-100 rounded flex items-center justify-center text-2xl text-gray-400 mb-1">
              📄
            </div>
            <span className="text-xs font-medium text-gray-700 leading-tight block">{img.label}</span>
          </button>
        ))}
      </div>

      {/* Lightbox / PDF viewer modal */}
      {selectedImage && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50"
            onClick={() => setSelectedImage(null)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-black">{selectedImage.label}</h3>
                <span className="text-sm text-gray-500">Country Club of Ocala</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-apple hover:bg-gray-50 transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedImage.path}
                className="w-full h-full border-0"
                title={selectedImage.label}
              />
            </div>
            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  const idx = filtered.findIndex(i => i.path === selectedImage.path);
                  if (idx > 0) setSelectedImage(filtered[idx - 1]);
                }}
                disabled={filtered.findIndex(i => i.path === selectedImage.path) === 0}
                className="px-4 py-2 text-sm font-medium rounded-apple border border-gray-300 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                {filtered.findIndex(i => i.path === selectedImage.path) + 1} of {filtered.length}
              </span>
              <button
                onClick={() => {
                  const idx = filtered.findIndex(i => i.path === selectedImage.path);
                  if (idx < filtered.length - 1) setSelectedImage(filtered[idx + 1]);
                }}
                disabled={filtered.findIndex(i => i.path === selectedImage.path) === filtered.length - 1}
                className="px-4 py-2 text-sm font-medium rounded-apple border border-gray-300 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
