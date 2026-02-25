import { ClippDPlayerData } from '../../types';
import PinLocationHeatmap from './PinLocationHeatmap';

interface Props {
  data: ClippDPlayerData;
}

function SQBadge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const color =
    value >= 110 ? 'bg-emerald-500 text-white' :
    value >= 100 ? 'bg-emerald-100 text-emerald-800' :
    value >= 90  ? 'bg-amber-100 text-amber-800' :
                   'bg-red-100 text-red-800';
  const sizeClass = size === 'lg' ? 'text-2xl px-4 py-2' : size === 'md' ? 'text-base px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${color} ${sizeClass}`}>
      {value}
    </span>
  );
}

function SGBadge({ value }: { value: number }) {
  const color = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  return <span className={`font-bold ${color}`}>{value > 0 ? '+' : ''}{value.toFixed(2)}</span>;
}

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function MissTendencyBar({ left, right, short, long }: { left: number; right: number; short: number; long: number }) {
  const on = 100 - left - right - short - long;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-12 text-right font-medium">Left</span>
        <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="bg-red-400 h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${left}%` }}>{left}%</div>
          <div className="bg-amber-300 h-full flex items-center justify-center text-[10px] font-bold text-gray-700" style={{ width: `${short}%` }}>{short}%</div>
          <div className="bg-emerald-400 h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${on}%` }}>{on}%</div>
          <div className="bg-amber-300 h-full flex items-center justify-center text-[10px] font-bold text-gray-700" style={{ width: `${long}%` }}>{long}%</div>
          <div className="bg-red-400 h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${right}%` }}>{right}%</div>
        </div>
        <span className="w-12 font-medium">Right</span>
      </div>
      <div className="flex justify-center gap-4 text-[10px] text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded bg-red-400 mr-1" />Miss</span>
        <span><span className="inline-block w-2 h-2 rounded bg-amber-300 mr-1" />Short/Long</span>
        <span><span className="inline-block w-2 h-2 rounded bg-emerald-400 mr-1" />On Target</span>
      </div>
    </div>
  );
}

function BiasIndicator({ label, bias }: { label: string; bias: string }) {
  const pos =
    bias === 'Left Bias' ? 20 :
    bias === 'Right Bias' ? 80 :
    50;
  const color =
    bias.includes('Bias') ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-20 text-right">{label}</span>
      <div className="flex-1 relative h-3 bg-gray-100 rounded-full">
        <div className="absolute top-1/2 left-1/2 w-px h-3 bg-gray-300 -translate-y-1/2" />
        <div
          className={`absolute top-1/2 w-3 h-3 rounded-full ${color} -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow`}
          style={{ left: `${pos}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-20">{bias}</span>
    </div>
  );
}

export default function ClippDDataView({ data }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ClippD Performance Data</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last {data.rounds_analyzed} rounds &middot; Updated {new Date(data.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ===== OFF THE TEE ===== */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Off The Tee</h3>
          <SQBadge value={data.off_the_tee.overall_shot_quality} size="lg" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.off_the_tee.dna.map((d) => (
            <div key={d.category} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">{d.category}</div>
              <SQBadge value={d.avg_shot_quality} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== APPROACH ===== */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Approach</h3>
          <div className="flex items-center gap-3">
            <SQBadge value={data.approach.overall.shot_quality} size="lg" />
            <div className="text-sm text-gray-500">SG: <SGBadge value={data.approach.overall.strokes_gained} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="GIR" value={`${data.approach.overall.gir_pct}%`} />
          <StatCard label="Accuracy" value={`${data.approach.overall.accuracy_pct}%`} />
          <StatCard label="Avg Proximity" value={data.approach.overall.avg_proximity} sub={`Tour T25: ${data.approach.overall.tour_t25_avg_proximity}`} />
          <StatCard label="Strokes Gained" value={<SGBadge value={data.approach.overall.strokes_gained} />} />
        </div>

        {/* Miss Tendency */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Miss Tendency</h4>
          <MissTendencyBar
            left={data.approach.overall.miss_tendency.left_pct}
            right={data.approach.overall.miss_tendency.right_pct}
            short={data.approach.overall.miss_tendency.short_pct}
            long={data.approach.overall.miss_tendency.long_pct}
          />
        </div>

        {/* Shot Quality Zones */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Best Scoring Zones</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.approach.shot_quality_zones_top3.map((z, i) => (
              <div key={z.range_yards} className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
                <div className="text-lg font-bold text-emerald-700">#{i + 1}</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{z.range_yards} yds</div>
                  <div className="text-xs text-gray-500">SQ {z.shot_quality} &middot; {z.avg_proximity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avoid Zone */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Avoid Zone</h4>
          <div className="flex items-center gap-3 bg-red-50 rounded-xl p-3 max-w-sm">
            <div className="text-lg font-bold text-red-600">!</div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{data.approach.avoid_zone.range_yards} yds</div>
              <div className="text-xs text-gray-500">SQ {data.approach.avoid_zone.shot_quality} &middot; {data.approach.avoid_zone.avg_proximity}</div>
            </div>
          </div>
        </div>

        {/* Pin Location Heatmaps */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Pin Location Heatmaps</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.approach.pin_location_heatmaps.map((hm) => (
              <PinLocationHeatmap key={hm.distance_range} label={hm.distance_range} values={hm.values} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== AROUND THE GREEN ===== */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Around the Green</h3>
          <div className="flex items-center gap-3">
            <SQBadge value={data.around_the_green.player_quality} size="lg" />
            <div className="text-xs text-gray-500">Tour T25: {data.around_the_green.tour_top_25}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Importance" value={`${data.around_the_green.importance_to_scoring_pct}%`} sub="of scoring" />
          <StatCard
            label="From Fairway"
            value={`${data.around_the_green.breakdown.from_fairway.up_and_down_pct}%`}
            sub={`SG: ${data.around_the_green.breakdown.from_fairway.strokes_gained > 0 ? '+' : ''}${data.around_the_green.breakdown.from_fairway.strokes_gained.toFixed(2)}`}
          />
          <StatCard
            label="From Rough"
            value={`${data.around_the_green.breakdown.from_rough.up_and_down_pct}%`}
            sub={`SG: ${data.around_the_green.breakdown.from_rough.strokes_gained > 0 ? '+' : ''}${data.around_the_green.breakdown.from_rough.strokes_gained.toFixed(2)}`}
          />
          <StatCard
            label="From Sand"
            value={`${data.around_the_green.breakdown.from_sand.up_and_down_pct}%`}
            sub={`SG: ${data.around_the_green.breakdown.from_sand.strokes_gained > 0 ? '+' : ''}${data.around_the_green.breakdown.from_sand.strokes_gained.toFixed(2)}`}
          />
        </div>

        {/* Work On */}
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase text-amber-700">Area to Work On</span>
            <span className="text-xs bg-amber-200 text-amber-800 font-semibold rounded-full px-2 py-0.5">{data.around_the_green.work_on.opportunity} Opportunity</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">{data.around_the_green.work_on.category}</div>
          <div className="text-xs text-gray-500">
            {data.around_the_green.work_on.importance_pct}% importance &middot; SQ Trend: {data.around_the_green.work_on.sq_trend}
          </div>
        </div>
      </section>

      {/* ===== PUTTING ===== */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Putting</h3>
          <div className="flex items-center gap-3">
            <SQBadge value={data.putting.overall.player_quality} size="lg" />
            <div className="text-sm text-gray-500">SG: <SGBadge value={data.putting.overall.strokes_gained} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="1-Putt %" value={`${data.putting.overall.one_putt_pct}%`} sub={`${data.putting.overall.one_putts} of ${data.putting.overall.total_putts}`} />
          <StatCard label="3-Putt %" value={`${data.putting.overall.three_putt_pct}%`} sub={`${data.putting.overall.three_putts} total`} />
          <StatCard label="Putts / Round" value={data.putting.overall.putts_per_round} />
          <StatCard label="Putts / GIR" value={data.putting.overall.putts_per_gir} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Birdie Conversion"
            value={`${data.putting.overall.birdie_conversion_pct}%`}
            sub={`Tour T25: ${data.putting.overall.tour_t25_birdie_conversion_pct}%`}
          />
          <StatCard
            label="Putts Made Distance"
            value={data.putting.overall.putts_made_distance}
            sub={`Tour T25: ${data.putting.overall.tour_t25_putts_made_distance}`}
          />
          <StatCard label="Importance" value={`${data.putting.overall.importance_to_scoring_pct}%`} sub="of scoring" />
        </div>

        {/* Work On */}
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase text-amber-700">Area to Work On</span>
            <span className="text-xs bg-amber-200 text-amber-800 font-semibold rounded-full px-2 py-0.5">{data.putting.work_on.opportunity} Opportunity</span>
            {data.putting.work_on.trending === 'down' && (
              <span className="text-xs text-red-600 font-semibold">Trending Down</span>
            )}
          </div>
          <div className="text-sm font-semibold text-gray-900">{data.putting.work_on.focus_area}</div>
          <div className="text-xs text-gray-500">
            {data.putting.work_on.importance_pct}% importance &middot; SQ Trend: {data.putting.work_on.sq_trend}
          </div>
        </div>

        {/* Putting Profiles */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Putting Profiles (Last 5 Rounds)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.putting.profiles.map((p) => (
              <div key={p.distance_range} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">{p.distance_range}</span>
                  <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                    p.speed_control === 'Aggressive' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {p.speed_control}
                  </span>
                </div>
                <BiasIndicator label="Straight" bias={p.straight_putts} />
                <BiasIndicator label="L → R" bias={p.l_to_r_putts} />
                <BiasIndicator label="R → L" bias={p.r_to_l_putts} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
