import { useEffect, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [userId, setUserId] = useState('demo-user')
  const [title, setTitle] = useState('Push Day')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState([
    { name: 'Bench Press', sets: 3, reps: 8, weight: 60 },
  ])
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addExercise = () => {
    setExercises(prev => [...prev, { name: '', sets: 3, reps: 10, weight: 0 }])
  }

  const updateExercise = (index, key, value) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [key]: value } : ex))
  }

  const createWorkout = async () => {
    try {
      setLoading(true)
      setMessage('')
      const res = await fetch(`${BACKEND_URL}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          workout_date: date,
          title,
          notes: notes || null,
          exercises,
        }),
      })
      if (!res.ok) throw new Error('Failed to save workout')
      setMessage('Workout saved!')
      await fetchWorkouts()
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkouts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/workouts?user_id=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error('Failed to fetch workouts')
      const data = await res.json()
      setWorkouts(data)
    } catch (e) {
      setMessage(e.message)
    }
  }

  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Fitness Tracker</h1>
          <p className="text-gray-600">Log workouts and track progress</p>
        </header>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">New Workout</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">User</label>
              <input value={userId} onChange={e=>setUserId(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <input value={notes} onChange={e=>setNotes(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Exercises</h3>
              <button onClick={addExercise} className="text-sm bg-emerald-600 text-white px-3 py-1 rounded">Add</button>
            </div>
            {exercises.map((ex, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input placeholder="Name" value={ex.name} onChange={e=>updateExercise(idx,'name',e.target.value)} className="border rounded px-3 py-2" />
                <input type="number" placeholder="Sets" value={ex.sets} onChange={e=>updateExercise(idx,'sets',Number(e.target.value))} className="border rounded px-3 py-2" />
                <input type="number" placeholder="Reps" value={ex.reps} onChange={e=>updateExercise(idx,'reps',Number(e.target.value))} className="border rounded px-3 py-2" />
                <input type="number" placeholder="Weight" value={ex.weight} onChange={e=>updateExercise(idx,'weight',Number(e.target.value))} className="border rounded px-3 py-2" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={createWorkout} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Workout'}
            </button>
            <a href="/test" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Check Backend</a>
          </div>
          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
          {workouts.length === 0 ? (
            <p className="text-gray-600">No workouts yet.</p>
          ) : (
            <div className="space-y-4">
              {workouts.map(w => (
                <div key={w._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{w.title}</p>
                      <p className="text-sm text-gray-500">{new Date(w.workout_date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">{w.user_id}</span>
                  </div>
                  {w.notes && <p className="mt-2 text-gray-700">{w.notes}</p>}
                  {w.exercises?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      {w.exercises.map((ex, i) => (
                        <div key={i} className="bg-gray-50 rounded p-2">
                          <p className="font-medium">{ex.name}</p>
                          <p className="text-gray-600">{ex.sets} x {ex.reps} @ {ex.weight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
