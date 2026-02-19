'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
}

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  // 🔐 Check user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/')
        return
      }

      setUserId(data.user.id)
      fetchBookmarks(data.user.id)
    }

    getUser()
  }, [])

  // 📥 Fetch bookmarks
  const fetchBookmarks = async (uid: string) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', uid)
      .order('id', { ascending: false })

    if (data) setBookmarks(data)
  }

  // ➕ Add bookmark
  const addBookmark = async () => {
    if (!title || !url || !userId) return

    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: userId,
    })

    setTitle('')
    setUrl('')
  }

  // ❌ Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  // 🔄 Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBookmarks(userId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* Soft Glow Background Shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-30 blur-3xl rounded-full"></div>

      <div className="relative z-10 py-20 px-6 text-gray-800">

        <div className="max-w-4xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl italic font-semibold tracking-tight">
              Your Bookmarks
            </h1>
            <p className="text-gray-700 text-sm">
              Manage your saved links in one place
            </p>
          </div>

          {/* Add Bookmark Card */}
          <div className="bg-white/75 backdrop-blur-md rounded-3xl shadow-xl p-10 space-y-8 transition hover:shadow-2xl">

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Bookmark Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Bookmark URL
              </label>
              <input
                type="text"
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <button
              onClick={addBookmark}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
            >
              Add Bookmark
            </button>
          </div>

          {/* Bookmark List */}
          <div className="space-y-8">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white/75 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {bookmark.title}
                  </h2>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-indigo-700 text-sm hover:underline break-all"
                  >
                    {bookmark.url}
                  </a>
                </div>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
