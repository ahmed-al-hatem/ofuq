const chatTimestampFormatter = new Intl.DateTimeFormat("ar-SY", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatChatTimestamp(value: string | null | undefined) {
  if (!value) {
    return "بدون نشاط"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "بدون نشاط"
  }

  return chatTimestampFormatter.format(date)
}
