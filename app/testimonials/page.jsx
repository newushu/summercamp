'use client'

import { useEffect, useState } from 'react'
import { defaultAdminConfig } from '../../lib/campAdmin'
import { fetchAdminConfigFromSupabase } from '../../lib/campAdminApi'

export default function TestimonialsPage() {
  const [stories, setStories] = useState(defaultAdminConfig.testimonials)

  useEffect(() => {
    let active = true

    async function load() {
      const { data } = await fetchAdminConfigFromSupabase()
      if (!active) {
        return
      }
      const incoming = Array.isArray(data?.testimonials) && data.testimonials.length > 0
        ? data.testimonials
        : defaultAdminConfig.testimonials
      setStories(incoming)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="page testimonialsPage">
      <section className="card section testimonialsHero">
        <p className="eyebrow">Student Stories</p>
        <h1>Real progress from real families</h1>
        <p className="subhead">
          Every story reflects structured coaching, measurable growth, and a confident next step for campers.
        </p>
      </section>

      <section className="card section">
        <div className="testimonialsGrid">
          {stories.map((story, index) => (
            <article key={`${story.studentName || 'story'}-${index}`} className="testimonialCard">
              <p className="journeyDay">{story.studentName || `Student Story ${index + 1}`}</p>
              <h3>{story.headline || 'Growth story'}</h3>
              <p>{story.story || 'Story coming soon.'}</p>
              {story.outcome ? <p className="testimonialOutcome">{story.outcome}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
