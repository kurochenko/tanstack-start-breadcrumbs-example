import {
  createFileRoute,
  Link,
  useMatches,
  useRouter,
} from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { updateOrganization } from '@/data/organizations'
import { Building2, Users, Pencil, Check, X, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/demo/breadcrumbs/organizations/$orgId/')(
  {
    component: OrganizationDetail,
  },
)

function OrganizationDetail() {
  const router = useRouter()
  const { orgId } = Route.useParams()

  // Get organization from the parent route's loader data
  // Use useMatches() hook for reactivity - router.state.matches is not reactive
  const matches = useMatches()
  const orgMatch = matches.find(
    (m) => m.routeId === '/demo/breadcrumbs/organizations/$orgId',
  )
  const organization = (
    orgMatch?.loaderData as {
      organization?: { id: string; name: string; description: string }
    }
  )?.organization

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(organization?.name ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync editName with loader data after invalidation
  useEffect(() => {
    setEditName(organization?.name ?? '')
  }, [organization?.name])

  const handleSave = async () => {
    if (!editName.trim() || editName === organization?.name) {
      setIsEditing(false)
      return
    }

    setIsSubmitting(true)
    try {
      await updateOrganization({ data: { id: orgId, name: editName.trim() } })
      // This is the key: invalidate the router to re-run loaders
      // The breadcrumb will automatically update!
      await router.invalidate()
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditName(organization?.name ?? '')
    setIsEditing(false)
  }

  if (!organization) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-cyan-500/20 rounded-xl">
            <Building2 className="text-cyan-400" size={40} />
          </div>
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-cyan-500"
                  disabled={isSubmitting}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') handleCancel()
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="p-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <Check size={20} className="text-white" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="p-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">
                  {organization.name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Edit name - watch the breadcrumb update!"
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}
            <p className="text-gray-400 text-lg">{organization.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 text-sm">
          <strong>Try it:</strong> Click the pencil icon to edit the
          organization name. After saving, the breadcrumb above will
          automatically update because{' '}
          <code className="px-1 py-0.5 bg-slate-700 rounded">
            router.invalidate()
          </code>{' '}
          triggers the loaders to re-run.
        </p>
      </div>

      <Link
        to="/demo/breadcrumbs/organizations/$orgId/employees"
        params={{ orgId }}
        className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-700 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
            <Users
              className="text-gray-400 group-hover:text-cyan-400 transition-colors"
              size={24}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
              View Employees
            </h3>
            <p className="text-gray-400 text-sm">
              See all employees in this organization
            </p>
          </div>
        </div>
        <ArrowRight
          className="text-gray-500 group-hover:text-cyan-400 transition-colors"
          size={24}
        />
      </Link>
    </div>
  )
}
