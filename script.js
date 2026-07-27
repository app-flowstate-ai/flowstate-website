// ============ Nav CTA — scroll to hero form and focus it ============
document.getElementById('navCta')?.addEventListener('click', () => {
  const email = document.getElementById('email')
  email?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(() => email?.focus(), 400)
})

// ============ Waitlist form handling ============
function setupWaitlistForm(formId, buttonId, microcopyId) {
  const form = document.getElementById(formId)
  const button = document.getElementById(buttonId)
  const microcopy = document.getElementById(microcopyId)
  if (!form || !button || !microcopy) return

  const defaultMicrocopy = microcopy.textContent

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const emailInput = form.querySelector('input[type="email"]')
    const email = emailInput.value.trim()

    if (!email || !emailInput.checkValidity()) {
      microcopy.textContent = 'Enter a valid email address.'
      microcopy.classList.add('is-error')
      return
    }

    button.disabled = true
    button.querySelector('.btn-label').textContent = 'Joining…'
    microcopy.classList.remove('is-error')

    try {
      const res = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Request failed')

      button.querySelector('.btn-label').textContent = 'You\u2019re on the list'
      microcopy.textContent = 'We\u2019ll email you when the beta opens.'
      microcopy.classList.add('is-success')
      emailInput.value = ''
      emailInput.disabled = true
    } catch (err) {
      button.disabled = false
      button.querySelector('.btn-label').textContent = 'Join the waitlist'
      microcopy.textContent = 'Something went wrong. Try again in a moment.'
      microcopy.classList.add('is-error')
    }
  })

  // Reset error state on new input
  form.querySelector('input[type="email"]')?.addEventListener('input', () => {
    microcopy.textContent = defaultMicrocopy
    microcopy.classList.remove('is-error')
  })
}

setupWaitlistForm('waitlistForm', 'submitBtn', 'formMicrocopy')
setupWaitlistForm('waitlistFormAlt', 'submitBtnAlt', 'formMicrocopyAlt')

// ============ Scroll reveal ============
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'))
}