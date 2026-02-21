import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function YearCourses(){
  const { year, studyType, programId } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const isPageLoading = usePageLoading()
  const [error, setError] = useState('')
  const mathPlanTitles = new Set([
    'Diferencijalni račun',
    'Strani jezik u struci I',
    'Uvod u računalnu znanost',
    'Elementarna matematika',
    'Linearna algebra I',
    'Integralni račun',
    'Linearna algebra II',
    'Strani jezik u struci II',
    'Elementarna geometrija',
    'Kombinatorna i diskretna matematika',
    'Tjelesna i zdravstvena kultura I',
    'Funkcije više varijabli',
    'Matematički alati',
    'Numerička matematika',
    'Uvod u vjerojatnost i statistiku',
    'Kompleksna analiza',
    'Statistički praktikum',
    'Teorija brojeva',
    'Tjelesna i zdravstvena kultura II',
    'Osnove fizike I',
    'Strukture podataka i algoritmi I',
    'Osnove fizike II',
    'Objektno orijentirano programiranje',
    'Teorijske osnove računalne znanosti',
    'Matematička logika u računalnoj znanosti',
    'Primjene diferencijalnog i integralnog računa I',
    'Obične diferencijalne jednadžbe',
    'Realna analiza',
    'Završni rad',
    'Algebra',
    'Osnove fizike III',
    'Moderni računalni sustavi',
    'Web programiranje',
    'Uvod u diferencijalnu geometriju',
    'Vektorski prostori',
    'Primjene diferencijalnog i integralnog računa II',
    'Osnove fizike IV',
    'Moderni sustavi baza podataka',
    'Strukture podataka i algoritmi II',
    'Strojno učenje',
    'Teorija skupova',
    'Metode matematičke fizike',
    'Osnove teorije upravljanja s primjenama'
  ])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    async function load(){
      try{
        const res = await api.get('/api/courses')
        if(!mounted) return
        const programKey = studyType && programId ? `${studyType}-${programId}` : null
        const filtered = (res.data || []).filter(c => {
          if (!programKey) return Number(c.year) === Number(year)

          const programYear = c.programYears?.[programKey]
          const baseYear = programYear ?? c.year
          const programMatch = Array.isArray(c.programs) && c.programs.includes(programKey)
          const isMathPlanOverlap = programKey === 'preddiplomski-matematika' && mathPlanTitles.has(c.title)

          return Number(baseYear) === Number(year) && (programMatch || isMathPlanOverlap)
        })
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
    <>
      {isPageLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen mx-auto py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold ml-4">Kolegiji — {yearLabel(year)}</h2>
          <Link
            to={studyType && programId ? `/programs/${studyType}/${programId}` : '/'}
            className="text-sm bg-primary-600 text-white px-3 py-2 mr-5 rounded hover:bg-primary-700"
          >
            Nazad
          </Link>
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
                    <Link 
                      to={`/courses/${c._id}`}
                      className="text-sm bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700 inline-block"
                    >
                      Pitanja
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </main>
      )}
    </>
  )
}