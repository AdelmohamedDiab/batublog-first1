<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref(null)
const loading = ref(false)

const handleSignup = async () => {
  error.value = null

  // Client-side validation
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  // Basic length check (Firebase requires 6, but we can enforce more if needed)
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    return
  }

  loading.value = true

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    // Optional: Update profile with name if needed
    console.log('User created:', userCredential.user)
    router.push('/home')
  } catch (err) {
    console.error('Full Firebase Error:', err)
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'This email is already registered.'
        break
      case 'auth/invalid-email':
        error.value = 'The email address is badly formatted.'
        break
      case 'auth/weak-password':
        error.value = 'The password is too weak.'
        break
      case 'auth/network-request-failed':
        error.value = 'Network error. Please check your internet.'
        break
      default:
        error.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-card">
      <h1 class="title">Create Account</h1>
      <p class="subtitle">Join our community today</p>

      <form @submit.prevent="handleSignup" class="signup-form">
        <transition name="fade">
          <div v-if="error" class="error-alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="error-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ error }}
          </div>
        </transition>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" placeholder="John Doe" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="name@company.com" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" required />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <p class="footer-text">Already have an account? <a href="/login">Log in</a></p>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

.signup-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-alert {
  background-color: #fff5f5;
  color: #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: left;
  border: 1px solid #fc8181;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.1);
}

.error-icon {
  flex-shrink: 0;
}

/* Spinner Styles */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-group {
  text-align: left;
}

label {
  display: block;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
  background: white;
}

.submit-btn {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.footer-text {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.footer-text a {
  color: #764ba2;
  text-decoration: none;
  font-weight: 600;
}

.footer-text a:hover {
  text-decoration: underline;
}

/* Transition for error alert */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
