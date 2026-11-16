import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
// ---------- Helpers ----------

const stripHtml = (text = '') =>
  text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`>~-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const makeExcerpt = (content, length = 140) => {
  const plain = stripHtml(content)
  return plain.length > length ? `${plain.slice(0, length).trim()}…` : plain
}

const readingTime = (content) => {
  const words = stripHtml(content).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

const getAuthorName = (author) => {
  if (!author) return 'Anonymous'
  if (typeof author === 'object') {
    return author.full_name || author.email || author.username || 'Anonymous'
  }
  return String(author)
}

// Soft tint for each post's initial tile, picked from the post id
const TILE_STYLES = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
]

const tileStyle = (id) => {
  const n = Number(id)
  const index = Number.isFinite(n)
    ? n
    : String(id)
        .split('')
        .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return TILE_STYLES[Math.abs(index) % TILE_STYLES.length]
}

const postLink = (blog) => `/blogs/${blog.slug ?? blog.id}`

// ---------- Small components ----------

function Meta({ blog }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
      <span className="font-medium text-slate-700">
        {getAuthorName(blog.author)}
      </span>
      <span>{formatDate(blog.created_at)}</span>
      <span>{readingTime(blog.content)} min read</span>
    </div>
  )
}

function FeaturedPost({ blog }) {
  return (
    <Link
      to={postLink(blog)}
      className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:grid-cols-5"
    >
      <div
        className={`flex min-h-48 items-center justify-center text-8xl font-bold md:col-span-2 ${tileStyle(
          blog.id
        )}`}
        aria-hidden="true"
      >
        {blog.title?.charAt(0).toUpperCase()}
      </div>

      <div className="flex flex-col justify-center p-8 md:col-span-3">
        <span className="mb-3 w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          Latest post
        </span>

        <h2 className="text-2xl font-bold leading-snug text-slate-900 group-hover:text-indigo-700 md:text-3xl">
          {blog.title}
        </h2>

        <p className="mt-3 leading-relaxed text-slate-600">
          {makeExcerpt(blog.content, 220)}
        </p>

        <div className="mt-5">
          <Meta blog={blog} />
        </div>
      </div>
    </Link>
  )
}

function BlogCard({ blog }) {
  return (
    <Link
      to={postLink(blog)}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${tileStyle(
            blog.id
          )}`}
          aria-hidden="true"
        >
          {blog.title?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-slate-500">
          {formatDate(blog.created_at)}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">
        {blog.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {makeExcerpt(blog.content)}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-700">
          {getAuthorName(blog.author)}
        </span>
        <span className="text-slate-500">{readingTime(blog.content)} min read</span>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full rounded bg-slate-200" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
    </div>
  )
}

// ---------- Page ----------

function Home() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/blogs/')
      const blogData = response.data.results ?? response.data

      // Only show published posts on the public page
      const published = blogData
        .filter((blog) => blog.is_published !== false)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setBlogs(published)
    } catch (err) {
      console.error('Blog API Error:', err)
      setError('Unable to load blogs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const query = search.trim().toLowerCase()

  const filteredBlogs = useMemo(() => {
    if (!query) return blogs
    return blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(query) ||
        stripHtml(blog.content).toLowerCase().includes(query)
    )
  }, [blogs, query])

  // The newest post is featured, unless the reader is searching
  const featured = !query ? filteredBlogs[0] : null
  const rest = !query ? filteredBlogs.slice(1) : filteredBlogs

  return (
    <div className="min-h-screen bg-slate-50">

    <Helmet>
      <title>DjangoBlog | Articles on Django and Web Development</title>

      <meta
        name="description"
        content="Explore articles about Django, Python, web development, programming, and modern technologies. Learn, discover, and improve your development skills with DjangoBlog."
      />

      <meta property="og:type" content="website" />

      <meta
        property="og:title"
        content="DjangoBlog | Articles on Django and Web Development"
      />

      <meta
        property="og:description"
        content="Explore articles about Django, Python, web development, programming, and modern technologies."
      />

      <meta name="twitter:card" content="summary" />

      <meta
        name="twitter:title"
        content="DjangoBlog | Articles on Django and Web Development"
      />

      <meta
        name="twitter:description"
        content="Explore articles about Django, Python, web development, programming, and modern technologies."
      />
      </Helmet>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              DjangoBlog
            </h1>
            <p className="mt-3 max-w-xl text-lg text-slate-600">
              Articles on Django, web development and the things we build.
            </p>
          </div>

          <div className="w-full md:w-80">
            <label htmlFor="search" className="sr-only">
              Search blogs
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              onClick={fetchBlogs}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredBlogs.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-medium text-slate-700">
              {query ? `No blogs match “${search.trim()}”.` : 'No blogs published yet.'}
            </p>
            <p className="mt-1 text-slate-500">
              {query
                ? 'Try a different word or clear the search.'
                : 'Check back soon for new articles.'}
            </p>
            {query && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 rounded-lg border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-50"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {!loading && !error && filteredBlogs.length > 0 && (
          <div className="mt-10 space-y-10">
            {featured && <FeaturedPost blog={featured} />}

            {rest.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-slate-900">
                  {query
                    ? `${filteredBlogs.length} result${
                        filteredBlogs.length === 1 ? '' : 's'
                      }`
                    : 'More articles'}
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home