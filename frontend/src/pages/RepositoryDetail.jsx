import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, GitPullRequest, Clock, Users, Activity, ExternalLink, GitMerge, FileCode2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function RepositoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/repositories/${id}`);
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16"></header>
        <div className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8 animate-pulse">
          <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.repository) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-600">Repository not found</p>
          <button onClick={() => navigate("/")} className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const { repository, pull_requests, engineers } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{repository.owner}</span>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none mt-0.5">
                {repository.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
            <div className="bg-blue-100/50 p-4 rounded-xl text-blue-600 border border-blue-100 relative z-10">
              <GitPullRequest className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total / Merged PRs</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-800">{repository.merged_prs}</p>
                <p className="text-sm font-semibold text-slate-400">/ {repository.total_prs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:bg-indigo-100 transition-colors"></div>
            <div className="bg-indigo-100/50 p-4 rounded-xl text-indigo-600 border border-indigo-100 relative z-10">
              <Clock className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Time to Merge</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-extrabold text-slate-800">{repository.average_merge_time_hours.toFixed(1)}</p>
                <p className="text-sm font-semibold text-slate-500">hours</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 group-hover:bg-emerald-100 transition-colors"></div>
            <div className="bg-emerald-100/50 p-4 rounded-xl text-emerald-600 border border-emerald-100 relative z-10">
              <Users className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Contributors</p>
              <p className="text-3xl font-extrabold text-slate-800">{engineers.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Chart Section */}
          <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Engineer Output
              </h2>
            </div>
            <div className="h-[300px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engineers.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="login" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="merged_prs" fill="url(#colorUv)" radius={[6, 6, 0, 0]} barSize={40} name="Merged PRs" />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Engineers Leaderboard */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Top Engineers
              </h2>
            </div>
            <div className="overflow-auto flex-1 max-h-[350px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white sticky top-0 shadow-sm z-10 text-xs uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Engineer</th>
                    <th className="px-6 py-4 text-right">Merged</th>
                    <th className="px-6 py-4 text-right hidden sm:table-cell">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {engineers.slice(0, 10).map((eng, idx) => (
                    <tr key={eng.login} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="relative">
                          {eng.avatar_url ? (
                            <img src={eng.avatar_url} alt={eng.login} className="w-9 h-9 rounded-full border border-slate-200 shadow-sm object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm">{eng.login.charAt(0).toUpperCase()}</div>
                          )}
                          {idx < 3 && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800">{eng.login}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                          {eng.merged_prs}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium hidden sm:table-cell text-slate-500">
                        {eng.average_merge_time_hours.toFixed(1)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Recent PRs Table with Scrollbar */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-500" /> Recent Pull Requests
            </h2>
            <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Showing up to 100
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[800px]">
              <thead className="bg-white sticky top-0 z-20 shadow-sm text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Pull Request</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Impact</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pull_requests.map((pr) => (
                  <tr key={pr.number} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <a href={`https://github.com/${repository.owner}/${repository.name}/pull/${pr.number}`} target="_blank" rel="noreferrer" className="flex flex-col group-hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          #{pr.number} 
                          <span className="truncate max-w-[200px] sm:max-w-[300px] inline-block font-medium text-slate-600">{pr.title}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 font-medium group-hover:underline">
                          View on GitHub <ExternalLink className="w-3 h-3" />
                        </div>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {pr.author.avatar_url ? (
                           <img src={pr.author.avatar_url} alt={pr.author.login} className="w-6 h-6 rounded-full border border-slate-200" />
                        ) : (
                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{pr.author.login.charAt(0).toUpperCase()}</div>
                        )}
                        <span className="font-medium">{pr.author.login}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pr.state === 'MERGED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-100">
                          <GitMerge className="w-3.5 h-3.5" /> Merged
                        </span>
                      ) : pr.state === 'CLOSED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-100">
                          <Activity className="w-3.5 h-3.5" /> Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-100">
                          <GitPullRequest className="w-3.5 h-3.5" /> Open
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs font-mono font-medium">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">+{pr.additions}</span>
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">-{pr.deletions}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(pr.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
