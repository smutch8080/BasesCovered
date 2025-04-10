// Add this section after the Players section
<div className="mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-gray-800">Volunteer Management</h2>
    <div className="flex gap-2">
      <Link
        to={`/teams/${team.id}/volunteers`}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
          hover:bg-gray-700 transition-colors"
      >
        <Users className="w-4 h-4" />
        View Volunteers
      </Link>
      <Link
        to={`/teams/${team.id}/volunteers/roles`}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
          hover:opacity-90 transition-colors"
      >
        <HandHelping className="w-4 h-4" />
        Manage Roles
      </Link>
    </div>
  </div>
</div>