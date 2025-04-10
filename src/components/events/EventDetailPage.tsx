// Add volunteer section to EventDetailPage
const handleVolunteerSlotUpdate = async (updatedSlot: VolunteerSlot) => {
  if (!event) return;

  try {
    const eventRef = doc(db, 'events', event.id);
    const updatedSlots = event.volunteerSlots?.map(slot =>
      slot.id === updatedSlot.id ? updatedSlot : slot
    ) || [];

    await updateDoc(eventRef, {
      volunteerSlots: updatedSlots,
      updatedAt: new Date()
    });

    setEvent(prev => prev ? {
      ...prev,
      volunteerSlots: updatedSlots,
      updatedAt: new Date()
    } : null);

    toast.success('Volunteer slot updated successfully');
  } catch (error) {
    console.error('Error updating volunteer slot:', error);
    toast.error('Failed to update volunteer slot');
  }
};