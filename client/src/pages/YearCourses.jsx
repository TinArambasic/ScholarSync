import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function YearCourses(){
  const { year } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    async function load(){
      try{
        const res = await axios.get('http://localhost:4000/api/courses')
        if(!mounted) return
        const filtered = (res.data || []).filter(c => Number(c.year) === Number(year))
        setCourses(filtered)
      } catch(err){
        console.warn('Ne mogu dohvatiti kolegije', err)
        if(!mounted) return
        setError('Ne mogu dohvatiti kolegije sa servera')
      } finally {
        if(mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [year])

  const yearLabel = (y) => {
    if(y === '1') return '1. godina'
    if(y === '2') return '2. godina'
    if(y === '3') return '3. godina'
    return y + '. godina'
  }

  return (
    <main className="min-h-screen mx-auto py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold ml-4">Kolegiji — {yearLabel(year)}</h2>
          <Link to="/" className="text-sm bg-primary-600 text-white px-3 py-2 mr-5 rounded hover:bg-primary-700">Nazad</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="text-sm text-gray-500"></div>
            <div />
          </div>

          {loading && <div className="text-gray-500">Učitavanje...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && courses.length === 0 && (
            <div className="text-gray-600">Nema kolegija za odabranu godinu.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div key={c._id} className="p-4 border rounded-lg hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{c._id}</div>
                    <div className="font-semibold text-lg">{c.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{c.type === 'obavezni' ? 'Obavezni' : 'Izborni'}</div>
                  </div>
                  <div>
                    <button className="text-sm bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700">Detalji</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}