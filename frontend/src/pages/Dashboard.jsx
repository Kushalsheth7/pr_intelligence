import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, GitPullRequest, Plus, ArrowRight, Globe, Zap, Trash2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sync form state
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState({ text: "", type: "" });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/repositories`);
      const data = await res.json();
      setRepositories(data);
    } catch (error) {
      console.error("Failed to fetch repositories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncMessage({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, token }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSyncMessage({ text: `Successfully synced ${data.count} PRs!`, type: "success" });
        setOwner("");
        setRepo("");
        fetchRepositories();
      } else {
        setSyncMessage({ text: `Error: ${data.detail || 'Unknown error'}`, type: "error" });
      }
    } catch (error) {
      setSyncMessage({ text: `Error: ${error.message}`, type: "error" });
    } finally {
      setIsSyncing(false);
      // Auto dismiss success message
      if (syncMessage.type !== "error") {
        setTimeout(() => setSyncMessage({ text: "", type: "" }), 5000);
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigating to the detail page
    if (!window.confirm("Are you sure you want to stop tracking this repository? All synced data will be deleted.")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/repositories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Remove the repo from the local state array instantly
        setRepositories(repositories.filter(r => r.id !== id));
      } else {
        alert("Failed to delete repository.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete repository.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-inner shadow-indigo-400">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">PR Intelligence</h1>
          </div>
          <div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Sync Section */}
        <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Zap className="h-5 w-5 text-amber-500" /> Track New Repository
            </h2>
            <form onSubmit={handleSync} className="flex flex-col md:flex-row gap-5 items-start md:items-end">
              <div className="w-full md:w-[25%] relative group">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase mb-2">Owner</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={owner} 
                    onChange={(e) => setOwner(e.target.value)} 
                    placeholder="e.g. facebook"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-[25%] relative group">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase mb-2">Repository</label>
                <input 
                  type="text" 
                  value={repo} 
                  onChange={(e) => setRepo(e.target.value)} 
                  placeholder="e.g. react"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
              <div className="w-full md:w-[40%] relative group">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase mb-2">GitHub PAT (Required)</label>
                <input 
                  type="password" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value)} 
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 font-mono"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSyncing}
                className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Repo
                  </>
                )}
              </button>
            </form>
            
            <div className={`mt-4 text-sm font-medium transition-all duration-300 overflow-hidden ${syncMessage.text ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`p-3 rounded-lg flex items-center gap-2 ${syncMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {syncMessage.text}
              </div>
            </div>
          </div>
        </section>

        {/* Repositories List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Your Workspaces</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-36">
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <GitPullRequest className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No workspaces found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Track your first repository above by providing the owner, repository name, and a GitHub Personal Access Token.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => navigate(`/repositories/${r.id}`)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200 cursor-pointer transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <div className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wider">{r.owner}</div>
                      <h3 className="text-xl font-bold text-slate-800 truncate" title={`${r.owner}/${r.name}`}>
                        {r.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, r.id)} 
                        className="bg-slate-50 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors z-20 relative shadow-sm hover:shadow-sm"
                        title="Delete Repository"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shadow-sm">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:border-indigo-100 transition-colors">
                      <GitPullRequest className="w-4 h-4 text-indigo-500" /> 
                      <span className="font-semibold">{r.pr_count}</span> PRs
                    </div>
                    <div className="text-slate-400 text-xs font-medium">
                      Updated {new Date(r.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
