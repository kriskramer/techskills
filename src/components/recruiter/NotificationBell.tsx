import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isFirebaseConfigured } from '../../lib/firebase'
import { markAllNotificationsRead, markNotificationRead, subscribeToNotifications } from '../../services/notifications'
import type { RecruiterNotification } from '../../types/notification'

export function NotificationBell() {
  const { uid, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<RecruiterNotification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!uid || !isFirebaseConfigured || !isAuthenticated) return
    return subscribeToNotifications(uid, setNotifications)
  }, [uid, isAuthenticated])

  const unread = notifications.filter((notification) => !notification.read)

  async function handleMarkRead(notification: RecruiterNotification) {
    if (!uid || notification.read) return
    await markNotificationRead(uid, notification.id)
  }

  async function handleMarkAllRead() {
    if (!uid || unread.length === 0) return
    await markAllNotificationsRead(
      uid,
      unread.map((notification) => notification.id),
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-white/40 hover:text-white"
        aria-label={`Notifications${unread.length > 0 ? `, ${unread.length} unread` : ''}`}
      >
        Alerts
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Notifications</p>
              {unread.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs text-cyan-300 hover:text-cyan-200"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No notifications yet.</p>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <Link
                    key={notification.id}
                    to={`/recruiter/candidates/${notification.candidateId}`}
                    onClick={() => {
                      void handleMarkRead(notification)
                      setOpen(false)
                    }}
                    className={`block rounded-xl border px-3 py-2 text-sm transition hover:border-cyan-300/40 ${
                      notification.read
                        ? 'border-white/5 bg-slate-950/40 text-slate-400'
                        : 'border-cyan-300/20 bg-cyan-300/5 text-slate-200'
                    }`}
                  >
                    <p>{notification.message}</p>
                    {!notification.read && <p className="mt-1 text-xs text-cyan-300">Unread</p>}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
