"use client";

import { useState, useEffect, useRef } from "react";
import type { Video } from "@/db/schema";
import { formatUsd } from "@/lib/format";
import { TrashIcon, PlusIcon, VideoCameraIcon, CloudArrowUpIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsd, setPriceUsd] = useState("0.01");
  const [category, setCategory] = useState("Premium");

  // File Upload State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchVideos();
    }
  }, [isAuthorized]);

  async function fetchVideos() {
    try {
      const res = await fetch("/api/admin/videos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === "wGO9Cn]Z68#J") {
      setIsAuthorized(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  const [uploadProgress, setUploadProgress] = useState(0);

  async function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } else {
            reject(new Error("Upload failed"));
          }
        }
      };

      xhr.open("POST", "/api/admin/upload");
      xhr.send(formData);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnailFile || !videoFile) {
      alert("Please select both a thumbnail and a video file.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Files first
      const [thumbUrl, videoUrl] = await Promise.all([
        uploadFile(thumbnailFile),
        uploadFile(videoFile)
      ]);

      // 2. Save Video Record
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          thumbnailUrl: thumbUrl, 
          videoUrl: videoUrl, 
          priceUsd, 
          category 
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setThumbnailFile(null);
        setVideoFile(null);
        setThumbPreview(null);
        fetchVideos();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (res.ok) fetchVideos();
    } catch (err) {
      alert("Failed to delete");
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl text-white">
          <div className="text-center text-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold">Admin Access</h1>
            <p className="mt-2 text-sm text-slate-400">Please enter your password to continue.</p>
          </div>

          <div className="space-y-4">
            <input
              required
              type="password"
              placeholder="Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordPasswordInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-300/50"
            />
            {authError && <p className="text-center text-xs font-medium text-rose-400">Incorrect password. Please try again.</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Login to Dashboard
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 text-white">
      <header>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">Control your store catalog and upload new premium content.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        {/* Upload Form */}
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <PlusIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Upload New Video</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Caption (Title)</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterclass Part 1"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what users get..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-white">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Price (USD)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/50"
                >
                  <option>Premium</option>
                  <option>Documentary</option>
                  <option>Travel</option>
                  <option>Education</option>
                </select>
              </div>
            </div>

            {/* Thumbnail Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Thumbnail Image</label>
              <div 
                onClick={() => thumbInputRef.current?.click()}
                className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition hover:border-amber-300/50 hover:bg-white/10"
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-slate-500 group-hover:text-amber-300" />
                    <p className="mt-2 text-xs text-slate-400">Select Image from Drive</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={thumbInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            {/* Video Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Video File (MP4)</label>
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${videoFile ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                    {videoFile ? <CheckIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{videoFile ? videoFile.name : "Select Video from Drive"}</p>
                    <p className="text-[10px] text-slate-500">{videoFile ? (videoFile.size / 1024 / 1024).toFixed(2) + " MB" : "Supported: MP4, MOV"}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-300 group-hover:underline">Choose</span>
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setVideoFile(file);
                  }}
                />
              </div>
            </div>

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Uploading Files</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-amber-300 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-amber-300/20 transition hover:bg-amber-200 disabled:opacity-50"
            >
              {isSubmitting ? `Uploading... ${uploadProgress}%` : "Finish and Save to Catalog"}
            </button>
          </form>
        </section>

        {/* Video List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Live Catalog ({videos.length})</h2>
            <button onClick={fetchVideos} className="text-xs font-bold uppercase tracking-widest text-amber-300 hover:text-white">Refresh</button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {videos.map((video) => (
                <div key={video.id} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                  <img src={video.thumbnailUrl} alt="" className="h-16 w-24 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-white">{video.title}</h3>
                    <p className="text-xs text-slate-400">{video.category} · {formatUsd(video.priceUsd)}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="rounded-lg bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-white/5 py-20 text-center text-slate-500">
                  <VideoCameraIcon className="mx-auto mb-3 h-10 w-10 opacity-20" />
                  <p>No videos in catalog.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
