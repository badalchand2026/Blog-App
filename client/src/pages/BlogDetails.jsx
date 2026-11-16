import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const stripHtml = (text = '') =>
  String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const readingTime = (content) => {
  const words = stripHtml(content).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const getAuthorName = (author) => {
  if (!author) return 'Anonymous'
  if (typeof author === 'object') {
    return author.full_name || author.email || author.username || 'Anonymous'
  }
  return String(author)
}

const isCanceled = (err) => err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError'

const matchesKey = (blog, key) =>
  String(blog.slug) === String(key) || String(blog.id) === String(key)

// Walks through the list pages looking for a blog whose slug or id matches.
async function findInList(key, signal) {
  for (let page = 1; page <= 20; page += 1) {
    const res = await api.get('/blogs/', { params: { page }, signal })
    const data = res.data

    if (Array.isArray(data)) return data.find((b) => matchesKey(b, key)) ?? null

    const found = (data?.results ?? []).find((b) => matchesKey(b, key))
    if (found) return found
    if (!data?.next) return null
  }
  return null
}

// Fetch one blog. If the direct request 404s (for example the backend looks
// blogs up by id but the URL holds a slug), fall back to the list endpoint.
async function fetchBlog(key, signal) {
  try {
    const res = await api.get(`/blogs/${encodeURIComponent(key)}/`, { signal })
    return res.data
  } catch (err) {
    if (isCanceled(err) || err.response?.status !== 404) throw err

    console.warn(`GET /blogs/${key}/ returned 404. Searching the blog list instead.`)

    const match = await findInList(key, signal)
    if (!match) throw err

    // The list may return trimmed items, so try to load the full blog by id.
    if (match.content === undefined && match.id !== undefined) {
      try {
        const res = await api.get(`/blogs/${match.id}/`, { signal })
        return res.data
      } catch (innerErr) {
        if (isCanceled(innerErr)) throw innerErr
      }
    }
    return match
  }
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function DetailSkeleton() {
  return (
    <div className="mt-10 animate-pulse" aria-busy="true" aria-label="Loading blog">
      <div className="h-10 w-4/5 rounded bg-slate-200" />
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="h-4 w-48 rounded bg-slate-200" />
      </div>
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-11/12 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function StateMessage({ tone = 'empty', title, description, children }) {
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-slate-200 bg-white text-slate-700'

  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={`mt-10 rounded-2xl border p-10 text-center ${styles}`}>
      <p className="text-xl font-semibold">{title}</p>
      {description && <p className="mt-2 text-sm opacity-80">{description}</p>}
      {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
    </div>
  )
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', window.location.href)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function BlogDetail() {
  // Supports /blogs/:slug, /blogs/:id or /blogs/:key
  const params = useParams()
  const key = params.slug ?? params.id ?? params.key

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // { notFound: boolean, message: string }
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setBlog(null)
    window.scrollTo({ top: 0 })

    fetchBlog(key, controller.signal)
      .then((data) => {
        setBlog(data)
        setLoading(false)
      })
      .catch((err) => {
        if (isCanceled(err)) return
        console.error('Blog detail error:', err)

        const status = err.response?.status
        setError({
          notFound: status === 404,
          message: !err.response
            ? 'Network error. Check your connection and try again.'
            : 'Unable to load this blog. Please try again.',
        })
        setLoading(false)
      })

    return () => controller.abort()
  }, [key, reloadKey])

  // Browser tab title
  useEffect(() => {
    if (!blog?.title) return
    const previous = document.title
    document.title = `${blog.title} | DjangoBlog`
    return () => { document.title = previous }
  }, [blog])

  const authorName = blog ? getAuthorName(blog.author) : ''
  const paragraphs = blog
    ? String(blog.content ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Back to all blogs
        </Link>

        {loading && <DetailSkeleton />}

        {!loading && error?.notFound && (
          <StateMessage
            title="Blog not found"
            description="It may have been removed, renamed, or is not published yet."
          >
            <Link to="/" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Browse all blogs
            </Link>
          </StateMessage>
        )}

        {!loading && error && !error.notFound && (
          <StateMessage tone="error" title={error.message}>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-lg border border-current px-5 py-2 text-sm font-medium hover:bg-white/60"
            >
              Try again
            </button>
          </StateMessage>
        )}

        {!loading && blog && (
          <article className="mt-10">
            {blog.is_published === false && (
              <p className="mb-4 w-fit rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                Draft preview. Visitors can’t see this yet.
              </p>
            )}

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              {blog.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700"
                >
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{authorName}</p>
                  <p className="text-slate-500">
                    <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
                    {' · '}
                    {readingTime(blog.content)} min read
                  </p>
                </div>
              </div>

              <CopyLinkButton />
            </div>

            {/* Plain text paragraphs. This is safe from script injection. If your content
                is HTML, sanitize it with DOMPurify before using dangerouslySetInnerHTML. */}
            <div className="mt-10 space-y-6 text-lg leading-8 text-slate-800">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">{paragraph}</p>
              ))}
            </div>

            {blog.updated_at && blog.updated_at !== blog.created_at && (
              <p className="mt-12 text-sm text-slate-500">
                Last updated {formatDate(blog.updated_at)}
              </p>
            )}

            <div className="mt-12 border-t border-slate-200 pt-8">
              <Link to="/" className="font-medium text-indigo-600 hover:underline">
                ← Read more blogs
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default BlogDetail