{
  // Add this section to your existing EventForm component's JSX
  // after the event details section and before the submit button
  
  `{/* Volunteer Section */}
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-800">Volunteer Needs</h3>
    <EventVolunteerSetup
      eventId={event?.id}
      roles={roles}
      onAddSlot={handleAddVolunteerSlot}
      onRemoveSlot={handleRemoveVolunteerSlot}
    />
  </div>`
}