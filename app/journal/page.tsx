// Adding edit function after convertToPost
  const updateEntry = async (entryId: string, formData: any) => {
    try {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: entryId,
          user_email: user.email,
          title: formData.title,
          content: formData.content,
          mood: formData.mood?.label,
          mood_emoji: formData.mood?.emoji,
          tags: formData.tags,
        }),
      });

      if (res.ok) {
        setEditingEntryId(null);
        setEditFormData(null);
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update entry");
      }
    } catch (e) {
      alert("Failed to update entry");
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`/api/journal?entry_id=${entryId}&user_email=${encodeURIComponent(user.email)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete entry");
      }
    } catch (e) {
      alert("Failed to delete entry");
    }
  };
