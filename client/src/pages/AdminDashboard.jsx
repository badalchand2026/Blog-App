import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'

const EMPTY_FORM = {
  title: '',
  slug: '',
  content: '',
  is_published: false,
}

function AdminDashboard() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // null = creating a new blog, otherwise the blog being edited
  const [editingBlog, setEditingBlog] = useState(null)
  // blog waiting for delete confirmation
  const [blogToDelete, setBlogToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  // blog shown in the read-only view modal
  const [viewingBlog, setViewingBlog] = useState(null)
  // id of the blog whose publish status is being toggled
  const [togglingId, setTogglingId] = useState(null)
  // slug is auto-generated until the admin edits it manually
  const [slugTouched, setSlugTouched] = useState(false)

  const [formData, setFormData] = useState(EMPTY_FORM)

  const isEditing = editingBlog !== null

  // ---------- Helpers ----------

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  const showApiError = (error, fallback) => {
    const errorData = error.response?.data

    if (errorData && typeof errorData === 'object') {
      const firstError = Object.values(errorData).flat()[0]
      toast.error(typeof firstError === 'string' ? firstError : fallback)
    } else {
      toast.error(fallback)
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingBlog(null)
    setSlugTouched(false)
    setShowForm(false)
  }

  // ---------- READ (list) ----------

  const fetchBlogs = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) setLoading(true)

      const response = await api.get('/blogs/')
      const blogData = response.data.results ?? response.data

      setBlogs(blogData)
    } catch (error) {
      console.error('Fetch blogs error:', error)
      toast.error('Unable to load blogs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // ---------- READ (single) ----------
  // Fetches the full blog so the modal always shows fresh data.
  // Falls back to the list item if the detail request fails.

  const handleView = async (blog) => {
    setViewingBlog(blog)

    try {
      const response = await api.get(`/blogs/${blog.id}/`)
      setViewingBlog(response.data)
    } catch (error) {
      console.error('Fetch blog detail error:', error)
    }
  }

  // ---------- Form handling ----------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'slug') {
      setSlugTouched(true)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Only auto-generate the slug while creating and until it is edited by hand
      ...(name === 'title' &&
        !isEditing &&
        !slugTouched && {
          slug: generateSlug(value),
        }),
    }))
  }

  const handleOpenCreate = () => {
    if (showForm && !isEditing) {
      resetForm()
      return
    }

    setEditingBlog(null)
    setFormData(EMPTY_FORM)
    setSlugTouched(false)
    setShowForm(true)
  }

  // ---------- UPDATE (open form) ----------

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title ?? '',
      slug: blog.slug ?? '',
      content: blog.content ?? '',
      is_published: Boolean(blog.is_published),
    })
    setSlugTouched(true)
    setShowForm(true)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------- CREATE + UPDATE (submit) ----------

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please enter the title and content.')
      return
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      content: formData.content.trim(),
    }

    try {
      setSaving(true)

      if (isEditing) {
        await api.put(`/blogs/${editingBlog.id}/`, payload)
        toast.success('Blog updated successfully!')
      } else {
        await api.post('/blogs/', payload)
        toast.success('Blog created successfully!')
      }

      resetForm()
      await fetchBlogs({ showLoader: false })
    } catch (error) {
      console.error('Save blog error:', error.response?.data)
      showApiError(
        error,
        isEditing ? 'Unable to update blog.' : 'Unable to create blog.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------- UPDATE (quick publish / unpublish) ----------

  const handleTogglePublish = async (blog) => {
    try {
      setTogglingId(blog.id)

      const response = await api.patch(`/blogs/${blog.id}/`, {
        is_published: !blog.is_published,
      })

      // Update just this row locally instead of refetching the whole list
      setBlogs((prev) =>
        prev.map((item) =>
          item.id === blog.id
            ? { ...item, is_published: response.data.is_published }
            : item
        )
      )

      toast.success(
        response.data.is_published ? 'Blog published.' : 'Blog moved to drafts.'
      )
    } catch (error) {
      console.error('Toggle publish error:', error.response?.data)
      showApiError(error, 'Unable to change publish status.')
    } finally {
      setTogglingId(null)
    }
  }

  // ---------- DELETE ----------

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return

    try {
      setDeleting(true)

      await api.delete(`/blogs/${blogToDelete.id}/`)

      setBlogs((prev) => prev.filter((item) => item.id !== blogToDelete.id))

      // If the deleted blog was being edited, close the form
      if (editingBlog?.id === blogToDelete.id) {
        resetForm()
      }

      toast.success('Blog deleted successfully!')
      setBlogToDelete(null)
    } catch (error) {
      console.error('Delete blog error:', error.response?.data)
      showApiError(error, 'Unable to delete blog.')
    } finally {
      setDeleting(false)
    }
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading blogs...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage all your blog posts.</p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm && !isEditing ? 'Close Form' : '+ Create Blog'}
          </button>
        </div>

        {/* Create / Edit Blog Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {isEditing ? `Edit Blog: ${editingBlog.title}` : 'Create New Blog'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="block font-medium mb-2">
                  Blog Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                  className="w-full border rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block font-medium mb-2">
                  Blog Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="blog-title"
                  className="w-full border rounded-lg px-4 py-3"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing
                    ? 'Changing the slug changes the blog URL.'
                    : 'Automatically generated from your title. You can edit it.'}
                </p>
              </div>

              <div>
                <label htmlFor="content" className="block font-medium mb-2">
                  Blog Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your blog content..."
                  rows="8"
                  className="w-full border rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  id="is_published"
                  className="w-4 h-4"
                />
                <label htmlFor="is_published">
                  {isEditing ? 'Published' : 'Publish this blog immediately'}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? isEditing
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Blog'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blog List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">All Blogs ({blogs.length})</h2>
          </div>

          {blogs.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No blogs found. Create your first blog.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-t">
                      <td className="p-4 font-medium">{blog.title}</td>

                      <td className="p-4">
                        {typeof blog.author === 'object' && blog.author !== null
                          ? blog.author.full_name || blog.author.email
                          : blog.author}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            blog.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {blog.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="p-4">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="text-gray-700 hover:underline"
                            onClick={() => handleView(blog)}
                          >
                            View
                          </button>

                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => handleOpenEdit(blog)}
                          >
                            Edit
                          </button>

                          <button
                            className="text-green-700 hover:underline disabled:opacity-50"
                            disabled={togglingId === blog.id}
                            onClick={() => handleTogglePublish(blog)}
                          >
                            {togglingId === blog.id
                              ? 'Updating...'
                              : blog.is_published
                                ? 'Unpublish'
                                : 'Publish'}
                          </button>

                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => setBlogToDelete(blog)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Blog Modal */}
      {viewingBlog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
          onClick={() => setViewingBlog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingBlog.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  /{viewingBlog.slug} •{' '}
                  {viewingBlog.is_published ? 'Published' : 'Draft'}
                  {viewingBlog.created_at &&
                    ` • ${new Date(viewingBlog.created_at).toLocaleDateString()}`}
                </p>
              </div>

              <button
                onClick={() => setViewingBlog(null)}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-gray-800 whitespace-pre-wrap">
              {viewingBlog.content}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  const blog = viewingBlog
                  setViewingBlog(null)
                  handleOpenEdit(blog)
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => setViewingBlog(null)}
                className="px-5 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {blogToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
          onClick={() => !deleting && setBlogToDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Delete this blog?
            </h2>
            <p className="text-gray-600 mt-2">
              “{blogToDelete.title}” will be permanently deleted. This can’t be
              undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setBlogToDelete(null)}
                disabled={deleting}
                className="px-5 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete blog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard