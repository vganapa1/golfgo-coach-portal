import { useState } from 'react';
import courseData from '../../data/course.json';

interface HoleInfo {
  hole: number;
  par: number;
  yardage: number;
  handicap: number;
  layoutPath: string;
  greenPath?: string;
}

const HOLES: HoleInfo[] = courseData.scorecard.map((h) => ({
  hole: h.hole,
  par: h.par,
  yardage: h.yardage,
  handicap: h.handicap,
  layoutPath: `/course-images/hole-${h.hole}.pdf`,
  greenPath: [4, 8, 16].includes(h.hole)
    ? `/course-images/hole-${h.hole}-green.pdf`
    : undefined,
}));

export default function CourseImageGallery() {
  const [selectedHole, setSelectedHole] = useState(1);
  const [viewMode, setViewMode] = useState<'layout' | 'green'>('layout');

  const hole = HOLES.find((h) => h.hole === selectedHole)!;
  const hasGreen = !!hole.greenPath;
  const pdfSrc = viewMode === 'green' && hasGreen ? hole.greenPath! : hole.layoutPath;

  const goTo = (n: number) => {
    setSelectedHole(n);
    setViewMode('layout');
  };

  return (
    <div className="space-y-4">
      {/* Hole selector strip */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => selectedHole > 1 && goTo(selectedHole - 1)}
          disabled={selectedHole === 1}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Previous hole"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max px-1">
            {HOLES.map((h) => (
              <button
                key={h.hole}
                onClick={() => goTo(h.hole)}
                className={`
                  flex flex-col items-center justify-center w-12 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${h.hole === selectedHole
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <span className="font-bold text-sm">{h.hole}</span>
                <span className={`text-[10px] ${h.hole === selectedHole ? 'text-gray-300' : 'text-gray-400'}`}>
                  P{h.par}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => selectedHole < 18 && goTo(selectedHole + 1)}
          disabled={selectedHole === 18}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Next hole"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Hole header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-xl px-5 py-3 border border-gray-200">
        <div className="flex items-baseline gap-3">
          <h4 className="text-xl font-bold text-black">Hole {hole.hole}</h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Par <strong className="text-black">{hole.par}</strong></span>
            <span className="text-gray-300">|</span>
            <span><strong className="text-black">{hole.yardage}</strong> yds</span>
            <span className="text-gray-300">|</span>
            <span>HCP <strong className="text-black">{hole.handicap}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasGreen && (
            <div className="flex bg-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('layout')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  viewMode === 'layout' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Layout
              </button>
              <button
                onClick={() => setViewMode('green')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  viewMode === 'green' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Green Detail
              </button>
            </div>
          )}
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>

      {/* Inline PDF viewer */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: '70vh', minHeight: 500 }}>
        <iframe
          key={pdfSrc}
          src={pdfSrc}
          className="w-full h-full border-0"
          title={`Hole ${hole.hole} ${viewMode === 'green' ? 'Green Detail' : 'Layout'}`}
        />
      </div>
    </div>
  );
}
