import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function StudyPrograms() {
  const { studyType } = useParams()
  const [courses, setCourses] = useState([])
  const isLoading = usePageLoading()

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/courses')
        setCourses(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const studyTypes = {
    'preddiplomski': {
      name: 'Prijediplomski studij',
      programs: [
        { id: 'matematika', name: 'Matematika', description: 'Temeljni matematički program' },
        { id: 'matematika-racunarstvo', name: 'Matematika i računarstvo', description: 'Kombinacija matematike i računalnih znanosti' }
      ]
    },
    'diplomski': {
      name: 'Diplomski studij',
      programs: [
        { id: 'matematika-racunarstvo', name: 'Matematika i računarstvo', description: 'Napredni program računarstva i matematike' },
        { id: 'financijska-matematika', name: 'Financijska matematika i statistika', description: 'Primjena matematike u financijama' },
        { id: 'nastavnicki-matematika-informatika', name: 'Nastavnički studij matematike i informatike', description: 'Program za buduće nastavnike' }
      ]
    }
  }

  const currentStudy = studyTypes[studyType]

  if (!currentStudy) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Nepoznata vrsta studija</h2>
      </div>
    )
  }

  const getCoursesForProgram = (programId) => {
    const programKey = `${studyType}-${programId}`
    return courses.filter(c => Array.isArray(c.programs) && c.programs.includes(programKey))
  }

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Header */}
            <div className="mb-8">
              <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block">
                ← Natrag na početnu
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentStudy.name}</h1>
              <p className="text-gray-600">Odaberite program za pregled kolegija</p>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentStudy.programs.map(program => {
                const programCourses = getCoursesForProgram(program.id)
                return (
                  <Link
                    key={program.id}
                    to={`/programs/${studyType}/${program.id}`}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                        {program.name}
                      </h3>
                      <p className="text-sm text-gray-600">{program.description}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {programCourses.length} kolegija
                        </span>
                        <span className="text-primary-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                          Pregledaj →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
