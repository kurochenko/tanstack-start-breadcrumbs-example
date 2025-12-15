import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getEmployee, updateEmployee } from '@/data/organizations'
import { User, Pencil, Check, X, Building2, Briefcase } from 'lucide-react'

export const Route = createFileRoute(
  '/demo/breadcrumbs/organizations/$orgId/employees/$employeeId',
)({
  component: EmployeeDetail,
  loader: async ({ params }) => {
    const employee = await getEmployee({ data: { id: params.employeeId } })
    return {
      crumb: `${employee.name} ${employee.surname}`,
      employee,
    }
  },
})

function EmployeeDetail() {
  const router = useRouter()
  const { employee } = Route.useLoaderData()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(employee.name)
  const [editSurname, setEditSurname] = useState(employee.surname)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync edit fields with loader data after invalidation
  useEffect(() => {
    setEditName(employee.name)
    setEditSurname(employee.surname)
  }, [employee.name, employee.surname])

  // Get organization name from parent route
  const matches = router.state.matches
  const orgMatch = matches.find(
    (m) => m.routeId === '/demo/breadcrumbs/organizations/$orgId',
  )
  const orgName = (orgMatch?.loaderData as { organization?: { name: string } })
    ?.organization?.name

  const handleSave = async () => {
    const trimmedName = editName.trim()
    const trimmedSurname = editSurname.trim()

    if (
      !trimmedName ||
      !trimmedSurname ||
      (trimmedName === employee.name && trimmedSurname === employee.surname)
    ) {
      setIsEditing(false)
      return
    }

    setIsSubmitting(true)
    try {
      await updateEmployee({
        data: {
          id: employee.id,
          name: trimmedName,
          surname: trimmedSurname,
        },
      })
      // Key pattern: invalidate the router to re-run all loaders
      // This updates the breadcrumb automatically!
      await router.invalidate()
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditName(employee.name)
    setEditSurname(employee.surname)
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="p-6 bg-cyan-500/20 rounded-2xl">
            <User className="text-cyan-400" size={48} />
          </div>
          <div className="flex-1 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="First name"
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-cyan-500"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editSurname}
                    onChange={(e) => setEditSurname(e.target.value)}
                    placeholder="Last name"
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-cyan-500"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') handleCancel()
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg transition-colors text-white font-medium"
                  >
                    <Check size={18} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-lg transition-colors text-white font-medium"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">
                  {employee.name} {employee.surname}
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

            <div className="flex flex-wrap gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Briefcase className="text-gray-500" size={18} />
                <span>{employee.role}</span>
              </div>
              {orgName && (
                <div className="flex items-center gap-2">
                  <Building2 className="text-gray-500" size={18} />
                  <span>{orgName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 text-sm">
          <strong>Try it:</strong> Click the pencil icon to edit this employee's
          name. After saving, notice how the breadcrumb above updates
          immediately! This works because:
        </p>
        <ol className="mt-2 text-amber-400/80 text-sm list-decimal list-inside space-y-1">
          <li>
            The mutation calls{' '}
            <code className="px-1 py-0.5 bg-slate-700 rounded">
              updateEmployee()
            </code>
          </li>
          <li>
            Then it calls{' '}
            <code className="px-1 py-0.5 bg-slate-700 rounded">
              router.invalidate()
            </code>
          </li>
          <li>
            This re-runs the route loader, which fetches the updated employee
            data
          </li>
          <li>
            The loader returns the new{' '}
            <code className="px-1 py-0.5 bg-slate-700 rounded">crumb</code>{' '}
            value
          </li>
          <li>
            <code className="px-1 py-0.5 bg-slate-700 rounded">
              useMatches()
            </code>{' '}
            in BreadcrumbNav picks up the change
          </li>
        </ol>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">The Code</h2>
        <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm">
          <code className="text-gray-300">{`const handleSave = async () => {
  await updateEmployee({
    id: employee.id,
    name: editName,
    surname: editSurname,
  });
  
  // This is the key line!
  // It re-runs all loaders, updating breadcrumbs
  await router.invalidate();
};`}</code>
        </pre>
      </div>
    </div>
  )
}
